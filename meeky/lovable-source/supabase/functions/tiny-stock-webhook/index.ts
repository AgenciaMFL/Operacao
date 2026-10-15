import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Shared-secret auth — Tiny envia o token configurado no painel
    const expectedToken = Deno.env.get("TINY_WEBHOOK_SECRET");
    if (!expectedToken) {
      console.error("TINY_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const url = new URL(req.url);
    const providedToken =
      req.headers.get("x-tiny-webhook-token") ||
      req.headers.get("x-webhook-token") ||
      url.searchParams.get("token") ||
      "";
    if (providedToken !== expectedToken) {
      console.warn("Unauthorized tiny-stock-webhook attempt from", req.headers.get("x-forwarded-for") || "unknown");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("Tiny stock webhook received:", JSON.stringify(body));

    // Tiny sends stock updates via webhook
    // Expected payload: { dados: { idProduto, codigo, saldo } } or similar
    const sku = body?.dados?.skuMapeamento || body?.dados?.sku || body?.dados?.codigo || body?.sku;
    const saldo = Number(body?.dados?.saldo ?? body?.saldo ?? body?.stock_quantity ?? 0);
    const stockQuantity = saldo;
    const inStockEarly = saldo > 0;
    console.log(`Stock update: sku=${sku} saldo=${saldo} inStock=${inStockEarly}`);

    if (!sku) {
      console.error("No SKU found in webhook payload");
      return new Response(JSON.stringify({ error: "Missing SKU" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const inStock = stockQuantity > 0;

    const { error } = await supabaseAdmin
      .from("product_stock")
      .upsert(
        { sku, stock_quantity: stockQuantity, in_stock: inStock, updated_at: new Date().toISOString() },
        { onConflict: "sku" }
      );

    if (error) {
      console.error("Failed to update stock:", JSON.stringify(error));
      throw new Error("Database update failed");
    }

    console.log(`Stock updated: SKU=${sku}, qty=${stockQuantity}, in_stock=${inStock}`);

    return new Response(
      JSON.stringify({ ok: true, sku, in_stock: inStock, stock_quantity: stockQuantity }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Tiny stock webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
