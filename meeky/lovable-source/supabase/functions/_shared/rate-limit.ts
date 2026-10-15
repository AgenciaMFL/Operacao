// Shared rate-limit helper for public edge functions.
//
// Usage inside an edge function:
//
//   import { enforceRateLimit } from "../_shared/rate-limit.ts";
//
//   const limited = await enforceRateLimit(req, {
//     functionName: "validate-coupon",
//     maxRequests: 10,
//     windowSeconds: 60,
//     corsHeaders,
//   });
//   if (limited) return limited; // 429 already built
//
// Backing store: public.rate_limits + public.check_rate_limit() (atomic UPSERT).
// Identifier: client IP (x-forwarded-for → cf-connecting-ip → x-real-ip → "unknown").
// If the backing call fails for any reason, we FAIL OPEN (allow the request) and
// log to console — availability > perfect throttling.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

export interface RateLimitOptions {
  functionName: string;
  maxRequests: number;
  windowSeconds: number;
  corsHeaders?: Record<string, string>;
  /** Optional custom identifier (defaults to client IP). */
  identifier?: string;
}

/**
 * Returns a 429 Response if the caller is over the limit, or `null` if allowed.
 * The function name is included in the storage key so different endpoints
 * have independent buckets.
 */
export async function enforceRateLimit(
  req: Request,
  opts: RateLimitOptions,
): Promise<Response | null> {
  const { functionName, maxRequests, windowSeconds, corsHeaders = {}, identifier } = opts;
  const id = identifier ?? getClientIp(req);
  const key = `${id}:${functionName}`;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn(`[rate-limit] missing service credentials — failing open for ${functionName}`);
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.rpc("check_rate_limit", {
      _key: key,
      _max_requests: maxRequests,
      _window_seconds: windowSeconds,
    });

    if (error) {
      console.warn(`[rate-limit] rpc error (${functionName}):`, error.message);
      return null; // fail open
    }

    const allowed = data === true;
    if (allowed) return null;

    console.log(`[rate-limit] blocked ${functionName} for ${id}`);
    return new Response(
      JSON.stringify({ error: "Muitas tentativas, aguarde alguns minutos e tente novamente." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(Math.min(windowSeconds, 3600)),
        },
      },
    );
  } catch (err) {
    console.warn(`[rate-limit] unexpected error in ${functionName}:`, err);
    return null; // fail open
  }
}
