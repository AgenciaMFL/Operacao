// Edge function: claim-purchase-event
// Chamado pelo CheckoutSuccessPage no navegador para:
//  1) Obter os dados reais do pedido (valor efetivamente cobrado, quantidade, cupom, moeda)
//  2) Reivindicar atomicamente o direito de disparar o evento `purchase` no client-side,
//     usando `orders.purchase_event_sent_at IS NULL` como guarda contra duplicação com o
//     disparo server-side (feito pelo mercadopago-webhook via GA4 Measurement Protocol + Meta CAPI).
//
// Deploy com verify_jwt = false (chamado pelo navegador anônimo).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { external_reference, payment_id } = await req.json().catch(() => ({}));
    const externalRef = (external_reference ?? "").toString().trim();
    const paymentId = (payment_id ?? "").toString().trim();

    if (!externalRef && !paymentId) {
      return json({ error: "Missing external_reference or payment_id" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Localiza a ordem — prefere external_reference (UUID interno), fallback por mp_payment_id
    let order: any = null;
    let foundByUuid = false;
    if (externalRef && UUID_RE.test(externalRef)) {
      const { data } = await admin.from("orders").select("*").eq("id", externalRef).maybeSingle();
      order = data;
      foundByUuid = !!data;
    }
    if (!order && paymentId) {
      const { data } = await admin.from("orders").select("*").eq("mp_payment_id", paymentId).maybeSingle();
      order = data;
    }

    if (!order) return json({ error: "Order not found", claimed: false }, 404);
    if (order.payment_status !== "approved") {
      return json({ error: "Order not approved yet", claimed: false, status: order.payment_status }, 409);
    }

    const transactionId = order.id as string;
    const value = Number(order.final_amount ?? order.total_amount ?? 0);
    const quantity = Number(order.quantity ?? 1);

    const payload = {
      claimed: false,
      transaction_id: transactionId,
      value,
      currency: "BRL",
      quantity,
      coupon: order.coupon_code || "",
      items: [{
        item_id: order.sku || "MEEKY-F5-PRO-BLK",
        item_name: order.product_name || "Headphone Meeky F5 ANC Pro",
        price: Number(order.product_price ?? 297),
        quantity,
      }],
      created_at: order.created_at,
      shipping_service_name: order.shipping_service_name || null,
      // PII: só devolvemos o e-mail quando a ordem foi localizada pelo UUID interno
      // (external_reference), que é imprevisível — nunca por mp_payment_id numérico.
      customer_email: foundByUuid ? (order.customer_email || "") : "",
    };

    // Claim atômico — só quem encontrar purchase_event_sent_at IS NULL fica com o direito de disparar
    const { data: claimed, error: claimErr } = await admin
      .from("orders")
      .update({ purchase_event_sent_at: new Date().toISOString() })
      .eq("id", transactionId)
      .is("purchase_event_sent_at", null)
      .select("id")
      .maybeSingle();

    if (claimErr) {
      console.error("claim-purchase-event: claim update failed", claimErr);
      return json({ ...payload, claimed: false, error: "claim_failed" }, 500);
    }

    return json({ ...payload, claimed: !!claimed });
  } catch (e) {
    console.error("claim-purchase-event error", e);
    return json({ error: (e as Error).message, claimed: false }, 500);
  }
});
