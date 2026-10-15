// MUST be the first import so storage stubs exist before any module
// (e.g. @supabase/supabase-js) touches localStorage at evaluation time.
import "./ssr-polyfills";
import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App";
import { initFrontendSentry } from "./lib/sentry";
import { applySavedConsentEarly } from "./lib/applySavedConsentEarly";
import "./index.css";

// Init as early as possible so any error thrown during hydration is captured.
initFrontendSentry();

// vite-react-ssg controls hydration in the client and renderToString during build.
// Routes are defined in src/App.tsx and exported as a data-router RouteRecord[].
export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    if (isClient && typeof window !== "undefined") {
      // Re-apply any previously saved cookie consent BEFORE the React tree mounts.
      // Without this, returning visitors (banner suppressed) never receive a
      // `consent update`, so GA4/Meta Pixel scripts never load.
      applySavedConsentEarly();

      // Persist coupon code from URL (?cupom=) into sessionStorage so it survives navigation.
      const params = new URLSearchParams(window.location.search);
      const cupom = params.get("cupom") || params.get("coupon");
      if (cupom) {
        try {
          sessionStorage.setItem("cupom_pendente", cupom.trim().toUpperCase());
        } catch {
          // ignore quota / privacy mode errors
        }
      }

      // Capture attribution (first-touch + last-touch) on every app boot.
      // Uses localStorage with a 30-day TTL so UTMs survive session restarts.
      import("./lib/campaignTracking").then(({ persistUtm }) => {
        try { persistUtm(); } catch { /* ignore */ }
      });
    }
  },
);
