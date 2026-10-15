import { createClient } from "npm:@supabase/supabase-js@2";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function randomCode(len = 4): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const limited = await enforceRateLimit(req, {
    functionName: "create-exit-intent-lead",
    maxRequests: 3,
    windowSeconds: 3600,
    corsHeaders,
  });
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || email.length > 255 || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate unique coupon code (retry on conflict, max 5)
    let couponCode = "";
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    for (let i = 0; i < 5; i++) {
      const candidate = `SAIR5-${randomCode(4)}`;
      const { error } = await supabase.from("coupons").insert({
        code: candidate,
        partner_name: "Exit Intent",
        discount_type: "percent",
        discount_value: 5,
        max_uses: 1,
        active: true,
        expires_at: expiresAt,
      });
      if (!error) {
        couponCode = candidate;
        break;
      }
      // 23505 = unique violation, retry; otherwise abort
      if ((error as any).code !== "23505") {
        console.error("[create-exit-intent-lead] coupon insert failed", error);
        return new Response(JSON.stringify({ error: "Falha ao gerar cupom" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!couponCode) {
      return new Response(JSON.stringify({ error: "Falha ao gerar cupom único" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: leadError } = await supabase.from("leads").insert({
      email,
      source: "exit_intent",
      coupon_code: couponCode,
      converted: false,
    });

    if (leadError) {
      console.error("[create-exit-intent-lead] lead insert failed", leadError);
      // Don't fail the user — coupon is still valid
    }

    // Fire-and-forget: send the coupon email via the dedicated function
    supabase.functions
      .invoke("send-exit-intent-email", { body: { email, coupon: couponCode } })
      .catch((err) => console.error("[create-exit-intent-lead] email dispatch failed", err));



    return new Response(JSON.stringify({ coupon: couponCode }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[create-exit-intent-lead] unexpected", e);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
