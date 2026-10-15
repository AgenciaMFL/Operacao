// Edge function PÚBLICA: parceiro acessa o próprio painel via token.
// URL: /parceiro/:cupom?token=xxx → frontend chama esta função.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildPartnerStats } from "../_shared/partner-stats.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const couponParam = (url.searchParams.get("cupom") || "").toUpperCase();

    if (!token || token.length < 16) {
      return json({ error: "Token inválido" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Valida token via função security definer
    const { data: couponFromToken, error: rpcError } = await supabase.rpc("get_coupon_by_partner_token", { _token: token });
    if (rpcError || !couponFromToken) {
      return json({ error: "Token não autorizado" }, 401);
    }

    // Se passaram cupom na URL, garantir que bate com o do token
    if (couponParam && couponParam !== couponFromToken) {
      return json({ error: "Token não corresponde ao cupom" }, 403);
    }

    // Atualiza last_accessed_at (fire-and-forget)
    supabase
      .from("partner_access_tokens")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("token", token)
      .then(() => {});

    const stats = await buildPartnerStats(supabaseUrl, supabaseServiceKey, couponFromToken);
    if (!stats) return json({ error: "Cupom não encontrado" }, 404);

    return json({ stats });
  } catch (err) {
    console.error("partner-stats error:", err);
    return json({ error: "Erro interno" }, 500);
  }
});
