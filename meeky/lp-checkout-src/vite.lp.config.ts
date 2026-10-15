import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Build só do checkout para o site da LP: arquivos em ck/ com caminhos relativos
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    outDir: "dist-lp",
    emptyOutDir: true,
    assetsDir: "ck",
    sourcemap: false,
    rollupOptions: { input: path.resolve(__dirname, "lp-checkout.html") },
  },
});
