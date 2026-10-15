// Returns the contact fields for an abandoned checkout by session_token.
// Public endpoint: the session_token itself is the capability (client-generated UUID
// stored in the recovery email link).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token") || "";
    if (!token && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      token = String(body?.token ?? "").trim();
    }
    token = token.trim();
    if (!token || token.length < 8 || token.length > 128) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("abandoned_checkouts")
      .select("name, email, phone, quantity, coupon_code, converted_order_id")
      .eq("session_token", token)
      .maybeSingle();

    if (error) {
      console.error("[get-abandoned-checkout] query failed", error);
      return new Response(JSON.stringify({ error: "query_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ found: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        found: true,
        alreadyConverted: !!data.converted_order_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        quantity: data.quantity,
        coupon_code: data.coupon_code,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[get-abandoned-checkout] unexpected", e);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
