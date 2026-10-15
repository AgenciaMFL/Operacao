/**
 * Single source of truth for prerender + sitemap.
 *
 * Parses the route table in `src/App.tsx` and derives:
 *   1. the list consumed by `ssgOptions.includedRoutes` (vite.config.ts)
 *   2. `public/sitemap.xml`
 *
 * Runs automatically on every dev/build (imported by vite.config.ts) and via
 * the `prebuild` npm hook. Nobody has to remember to update two lists again.
 *
 * Convention: a route is public/indexable when it declares `entry: "src/pages/..."`
 * in src/App.tsx. Redirects (<Navigate />), admin, checkout, /r/:slug, params and
 * wildcards never have an `entry` and are therefore excluded automatically.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export const BASE_URL = "https://meeky.com.br";

const APP_TSX = resolve(process.cwd(), "src/App.tsx");
const SITEMAP_PATH = resolve(process.cwd(), "public/sitemap.xml");

/**
 * Routes without `entry` that we still want prerendered (SPA shells that
 * benefit from a static HTML paint). They are NOT added to the sitemap.
 */
const EXTRA_PRERENDER_ROUTES = ["/checkout", "/checkout/sucesso"];

/** Public routes we prerender but deliberately keep out of the sitemap. */
const SITEMAP_EXCLUDE = new Set(["/crosstraining/dashboard", "/vip"]);

/** Never prerender / never index, even if someone adds an `entry` by mistake. */
const ALWAYS_EXCLUDE = [/^\/admin(\/|$)/, /^\/r(\/|$)/, /^\/parceiro(\/|$)/, /:/, /\*/, /^\/\.lovable/];

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

function isExcluded(path: string) {
  return ALWAYS_EXCLUDE.some((re) => re.test(path));
}

/** Extract every indexable route path from src/App.tsx. */
export function readAppRoutes(): string[] {
  const src = readFileSync(APP_TSX, "utf8");
  const paths: string[] = [];

  // index route -> "/"
  if (/\{\s*index:\s*true[^}]*entry:/.test(src)) paths.push("/");

  const routeRe = /\{\s*path:\s*"([^"]+)"\s*,\s*element:\s*<([A-Za-z]+)[^}]*?\}/g;
  for (const match of src.matchAll(routeRe)) {
    const [block, rawPath, component] = match;
    if (component === "Navigate") continue; // redirect
    if (!/\bentry:\s*"/.test(block)) continue; // not prerendered/public
    const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    if (isExcluded(path)) continue;
    if (!paths.includes(path)) paths.push(path);
  }

  return paths;
}

/** Full prerender list for vite-react-ssg `includedRoutes`. */
export function getPrerenderRoutes(): string[] {
  const routes = readAppRoutes();
  for (const extra of EXTRA_PRERENDER_ROUTES) {
    if (!routes.includes(extra)) routes.push(extra);
  }
  return routes;
}

function defaultsFor(path: string): { changefreq: string; priority: string } {
  if (path === "/") return { changefreq: "weekly", priority: "1.0" };
  if (path === "/headphone-anc-meeky-f5-pro") return { changefreq: "weekly", priority: "1.0" };
  if (path === "/blog") return { changefreq: "weekly", priority: "0.8" };
  if (path.startsWith("/blog/")) return { changefreq: "monthly", priority: "0.8" };
  if (path === "/reviews") return { changefreq: "weekly", priority: "0.6" };
  if (["/termos", "/privacidade", "/politica-de-devolucao"].includes(path))
    return { changefreq: "yearly", priority: "0.6" };
  if (path === "/exclusao-de-dados") return { changefreq: "yearly", priority: "0.4" };
  return { changefreq: "monthly", priority: "0.6" };
}

/**
 * Reads the existing sitemap so per-URL metadata already curated by hand
 * (lastmod above all) is preserved instead of being reset on every build.
 */
function readExistingMeta(): Map<string, Partial<SitemapEntry>> {
  const meta = new Map<string, Partial<SitemapEntry>>();
  if (!existsSync(SITEMAP_PATH)) return meta;
  const xml = readFileSync(SITEMAP_PATH, "utf8");
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const body = block[1];
    const loc = body.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) continue;
    const path = loc.replace(BASE_URL, "") || "/";
    meta.set(path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path, {
      lastmod: body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1],
      changefreq: body.match(/<changefreq>([^<]+)<\/changefreq>/)?.[1],
      priority: body.match(/<priority>([^<]+)<\/priority>/)?.[1],
    });
  }
  return meta;
}

export function buildSitemapEntries(): SitemapEntry[] {
  const existing = readExistingMeta();
  return readAppRoutes()
    .filter((p) => !SITEMAP_EXCLUDE.has(p))
    .map((path) => {
      const prev = existing.get(path) ?? {};
      const fallback = defaultsFor(path);
      return {
        path,
        // Only keep a lastmod that already existed (page-specific, hand-curated).
        // New routes ship without one rather than with a build-time timestamp.
        lastmod: prev.lastmod,
        changefreq: prev.changefreq ?? fallback.changefreq,
        priority: prev.priority ?? fallback.priority,
      };
    });
}

function renderSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path === "/" ? "/" : e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

export function generateSitemap(): SitemapEntry[] {
  const entries = buildSitemapEntries();
  const xml = renderSitemap(entries);
  const current = existsSync(SITEMAP_PATH) ? readFileSync(SITEMAP_PATH, "utf8") : "";
  if (current !== xml) writeFileSync(SITEMAP_PATH, xml);
  return entries;
}

// Allow direct execution: `tsx scripts/generate-routes.ts`
const invokedDirectly =
  typeof process !== "undefined" && process.argv[1]?.includes("generate-routes");
if (invokedDirectly) {
  const routes = getPrerenderRoutes();
  const entries = generateSitemap();
  console.log(`[routes] ${routes.length} prerender route(s), ${entries.length} sitemap URL(s)`);
}
