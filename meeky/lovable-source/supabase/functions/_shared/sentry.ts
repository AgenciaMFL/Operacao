// Minimal Sentry integration for Supabase Edge Functions.
//
// Uses the Sentry Deno SDK via `npm:` specifier so no import map is required.
// If SENTRY_DSN is not configured, the helpers become no-ops so the function
// keeps running normally (fail-open: never block business logic on telemetry).
//
// Usage in an edge function:
//
//   import { initSentry, captureEdgeException } from "../_shared/sentry.ts";
//   initSentry("my-function");
//   ...
//   try { ... } catch (e) { captureEdgeException(e, { fn: "my-function" }); throw e; }

import * as Sentry from "npm:@sentry/deno@8.47.0";

let initialized = false;

export function initSentry(functionName: string) {
  if (initialized) return;
  const dsn = Deno.env.get("SENTRY_DSN");
  if (!dsn) {
    // No DSN configured — leave helpers as no-ops.
    return;
  }
  try {
    Sentry.init({
      dsn,
      environment: Deno.env.get("SENTRY_ENVIRONMENT") ?? "production",
      release: Deno.env.get("SENTRY_RELEASE") ?? undefined,
      // Errors only for now; no perf/tracing sampling.
      tracesSampleRate: 0,
      // Tag every event with the edge function it came from.
      initialScope: { tags: { runtime: "supabase-edge", fn: functionName } },
    });
    initialized = true;
  } catch (e) {
    console.warn("[sentry] init failed:", e);
  }
}

export function captureEdgeException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  if (!initialized) return;
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined);
    // Best-effort flush — edge functions can be torn down as soon as the
    // response is returned, so unflushed events would be lost.
    void Sentry.flush(2000).catch(() => {});
  } catch (e) {
    console.warn("[sentry] capture failed:", e);
  }
}

export function captureEdgeMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>,
) {
  if (!initialized) return;
  try {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
    void Sentry.flush(2000).catch(() => {});
  } catch (e) {
    console.warn("[sentry] capture message failed:", e);
  }
}
