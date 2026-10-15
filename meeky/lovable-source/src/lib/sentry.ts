// Sentry initialization for the Lovable frontend.
//
// DSN comes from VITE_SENTRY_DSN (build-time env). If it's not set, Sentry is
// simply not initialized — no errors, no noise, no impact on the app.
import * as Sentry from "@sentry/react";

let initialized = false;

export function initFrontendSentry() {
  if (initialized) return;
  if (typeof window === "undefined") return; // don't init during SSG prerender
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  try {
    Sentry.init({
      dsn,
      environment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) ??
        (import.meta.env.PROD ? "production" : "development"),
      // Errors only for now — no perf/session-replay sampling to keep the free
      // plan's event quota focused on real bugs.
      tracesSampleRate: 0,
      // Filter obvious browser-extension noise before it eats the quota.
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications.",
        "Non-Error promise rejection captured",
      ],
    });
    initialized = true;
  } catch (e) {
    // Never let telemetry setup break the app.
    console.warn("[sentry] init failed:", e);
  }
}
