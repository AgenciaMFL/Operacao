import { createClient } from "npm:@supabase/supabase-js@2";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const limited = await enforceRateLimit(req, {
    functionName: "send-exit-intent-email",
    maxRequests: 3,
    windowSeconds: 3600,
    corsHeaders,
  });
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));

    // Support both direct invocation { email, coupon } and Supabase DB webhook payload
    // { type: 'INSERT', record: { email, coupon_code, source } }
    let email: string = "";
    let coupon: string = "";

    if (body?.record) {
      if (body.record.source !== "exit_intent") {
        return new Response(JSON.stringify({ skipped: true, reason: "not_exit_intent" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      email = String(body.record.email ?? "").trim().toLowerCase();
      coupon = String(body.record.coupon_code ?? "").trim();
    } else {
      email = String(body?.email ?? "").trim().toLowerCase();
      coupon = String(body?.coupon ?? body?.couponCode ?? "").trim();
    }

    if (!email || !EMAIL_RE.test(email) || !coupon) {
      return new Response(JSON.stringify({ error: "email e coupon são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase.functions.invoke("send-transactional-email", {
      headers: { Authorization: `Bearer ${serviceKey}` },
      body: {
        templateName: "exit-intent-coupon",
        recipientEmail: email,
        idempotencyKey: `exit-intent-${coupon}`,
        templateData: { couponCode: coupon },
      },
    });

    if (error) {
      console.error("[send-exit-intent-email] invoke failed", error);
      return new Response(JSON.stringify({ error: "Falha ao enfileirar email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-exit-intent-email] unexpected", e);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
