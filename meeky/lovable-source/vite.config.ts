import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import type { Plugin } from "vite";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
// NOTE: @sentry/vite-plugin foi removido intencionalmente.
// Motivo: sem SENTRY_AUTH_TOKEN no build (Build Secrets é Enterprise), o plugin
// era no-op e o `filesToDeleteAfterUpload` nunca rodava, deixando .map órfãos
// publicamente acessíveis em /dist expondo o código-fonte. Não reintroduzir
// sem antes garantir upload real dos source maps + deleção do dist.
// O runtime Sentry (src/lib/sentry.ts) continua ativo — só perde symbolication.

import { getPrerenderRoutes, generateSitemap } from "./scripts/generate-routes";

// Routes prerendered to static HTML at build time are DERIVED from src/App.tsx
// (every route declaring `entry:`) plus a couple of SPA shells. public/sitemap.xml
// is regenerated from the same source. See scripts/generate-routes.ts.
// All other routes fall back to the SPA `index.html` (Lovable hosting handles it).
const PRERENDER_ROUTES = getPrerenderRoutes();
generateSitemap();


// With dirStyle: "flat", vite-react-ssg emits `<route>.html` (e.g. `blog/x.html`)
// served by hosting at the trailing-slash-free URL (e.g. `/blog/x`).
const REQUIRED_PRERENDER_FILES = [
  "blog/melhor-headphone-anc-ate-300-reais-brasil-2026.html",
  "blog/meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc-comparativo-2026.html",
];


// Known chunk names whose .map files were leaked at some point in production
// (before sourcemap:false landed). They live at fixed hashed URLs on the CDN
// because their input hashes did not change across the fix build, so hosting
// keeps serving the stale .map. We overwrite them on every deploy with empty
// stubs so those specific URLs stop leaking source. Keep the list — removing an
// entry just re-exposes the old .map at that URL.
const STALE_MAP_STUBS = [
  "vendor-ClIHGNWf.js.map",
  "query-BMaM6Jyr.js.map",
  "router-bhGckQ36.js.map",
];

// HTML for extensionless production routes can stay cached independently of
// query-string variants. If that cached HTML points at a vulnerable/buggy app
// entry chunk, overwrite the old app URL with the current app entry too.
const LEGACY_APP_ENTRY_CHUNKS = ["app-B8XqYyUt.js"];
const LEGACY_ROUTE_CHUNK_ALIASES: Record<string, RegExp> = {
  "CheckoutPage-CrqO0Vpr.js": /^CheckoutPage-[\w-]+\.js$/,
};

/**
 * Post-build safety net:
 *  1. Deletes EVERY .map file emitted anywhere under dist/ — belt-and-braces if
 *     sourcemap gets flipped on by mistake or a plugin re-enables it.
 *  2. Writes empty JSON stubs at dist/assets/<STALE_MAP_STUBS> so the next
 *     deploy overwrites the leaked .map URLs on the CDN with harmless content.
 * Runs on real builds only (not dev server).
 */
function stripAndStubSourceMaps(): Plugin {
  return {
    name: "strip-and-stub-source-maps",
    apply: "build",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      if (!existsSync(dist)) return;

      // 1) Recursively delete every *.map under dist/.
      let deleted = 0;
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir)) {
          const full = path.join(dir, entry);
          const st = statSync(full);
          if (st.isDirectory()) {
            walk(full);
          } else if (entry.endsWith(".map")) {
            unlinkSync(full);
            deleted += 1;
          }
        }
      };
      walk(dist);
      if (deleted > 0) {
        console.log(`[strip-source-maps] deleted ${deleted} .map file(s) from dist/`);
      }

      // 2) Write empty stubs at the exact leaked URLs so the deploy overwrites
      //    the stale CDN copies.
      const assetsDir = path.join(dist, "assets");
      mkdirSync(assetsDir, { recursive: true });
      for (const name of STALE_MAP_STUBS) {
        writeFileSync(path.join(assetsDir, name), "{}\n");
      }
      console.log(
        `[strip-source-maps] wrote ${STALE_MAP_STUBS.length} empty stub(s) to overwrite leaked CDN .map URLs`,
      );

      // 3) Compatibility shim for stale HTML cached at clean URLs. The current
      //    app entry is copied over known old app-entry filenames so users who
      //    still receive cached HTML execute the fixed runtime anyway.
      const appEntries = readdirSync(assetsDir)
        .filter((name) => /^app-[\w-]+\.js$/.test(name))
        .filter((name) => !LEGACY_APP_ENTRY_CHUNKS.includes(name));
      const currentAppEntry = appEntries
        .map((name) => ({ name, mtimeMs: statSync(path.join(assetsDir, name)).mtimeMs }))
        .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]?.name;

      if (currentAppEntry) {
        for (const legacyName of LEGACY_APP_ENTRY_CHUNKS) {
          copyFileSync(path.join(assetsDir, currentAppEntry), path.join(assetsDir, legacyName));
        }
        console.log(
          `[stale-html-shim] copied ${currentAppEntry} to ${LEGACY_APP_ENTRY_CHUNKS.join(", ")}`,
        );
      }

      for (const [legacyName, pattern] of Object.entries(LEGACY_ROUTE_CHUNK_ALIASES)) {
        const currentRouteChunk = readdirSync(assetsDir)
          .filter((name) => pattern.test(name))
          .filter((name) => name !== legacyName)
          .map((name) => ({ name, mtimeMs: statSync(path.join(assetsDir, name)).mtimeMs }))
          .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]?.name;

        if (currentRouteChunk) {
          copyFileSync(path.join(assetsDir, currentRouteChunk), path.join(assetsDir, legacyName));
          console.log(`[stale-html-shim] copied ${currentRouteChunk} to ${legacyName}`);
        }
      }
    },
  };
}

// https://vitejs.dev/config/

export default defineConfig(({ mode, isSsrBuild }) => ({
  ssgOptions: {
    script: "async",
    formatting: "minify",
    beastiesOptions: {
      preload: "swap",
      inlineFonts: false,
      pruneSource: false,
      reduceInlineStyles: false,
      logLevel: "info",
    },
    dirStyle: "flat",
    includedRoutes: () => PRERENDER_ROUTES,
    onPageRendered: (route: string) => {
      // surfaces in build logs so we can confirm what was prerendered
      console.log(`[ssg] prerendered ${route}`);
    },
    onFinished: (dir: string) => {
      for (const file of REQUIRED_PRERENDER_FILES) {
        const filePath = path.join(dir, file);
        if (!existsSync(filePath)) {
          throw new Error(`[ssg] missing required prerender file: ${filePath}`);
        }
        console.log(`[ssg] verified ${file}`);
      }
    },
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    // O tagger injeta `window.sourceElementMap` no bundle; durante o build SSG
    // (mode=development) isso quebra o prerender no Node. Só no dev server.
    mode === "development" && !isSsrBuild && process.env.NODE_ENV !== "production" &&
      !process.argv.includes("build") && componentTagger(),
    mcpPlugin(),
    stripAndStubSourceMaps(),
    // @sentry/vite-plugin removido — ver nota no topo do arquivo.
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    // Source maps desabilitados: sem upload pro Sentry configurado, os .map
    // ficariam publicamente acessíveis em /dist expondo o código-fonte.
    sourcemap: false,
    rollupOptions: {
      // Manual chunks only apply to the client build. The SSR bundle treats
      // react/react-dom as external, which would conflict with manualChunks.
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              vendor: ["react", "react-dom"],
              router: ["react-router-dom"],
              
              icons: ["lucide-react"],
              supabase: ["@supabase/supabase-js"],
              query: ["@tanstack/react-query"],
            },
          },
    },
  },
}));
