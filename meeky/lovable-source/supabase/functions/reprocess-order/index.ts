// Manual reprocessing endpoint. Re-aplica paid_at (via MP) e roda o orquestrador
// (Resend + Melhor Envio + Tiny) idempotentemente — guard: shipping_order_id IS NULL.
//
// Auth: requer header x-admin-secret == MP_WEBHOOK_SECRET (reutiliza segredo já existente).
//
// Body: { order_id: string }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { fulfillOrder } from "../_shared/order-fulfillment.ts";
import { sendGa4Purchase, sendMetaCapiPurchase } from "../_shared/conversion-tracking.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const adminSecret = Deno.env.get("REPROCESS_ADMIN_KEY");
    if (!adminSecret) return json({ ok: false, error: "secret_not_configured" }, 500);
    if (req.headers.get("x-admin-secret") !== adminSecret) {
      return json({ ok: false, error: "unauthorized" }, 401);
    }


    const { order_id } = await req.json();
    if (!order_id) return json({ ok: false, error: "order_id required" }, 400);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .maybeSingle();

    if (orderErr || !order) return json({ ok: false, error: "order_not_found" }, 404);

    const mpPaymentId = (order.mp_payment_id || "").toString();
    if (!mpPaymentId) return json({ ok: false, error: "order_missing_mp_payment_id" }, 400);

    // Confirma status no MP e captura date_approved
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) return json({ ok: false, error: "mp_token_missing" }, 500);

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    const payment = await mpRes.json();
    if (!mpRes.ok) return json({ ok: false, error: `mp_api_${mpRes.status}`, payment }, 502);

    if (payment.status !== "approved") {
      return json({ ok: false, error: `payment_not_approved`, status: payment.status });
    }

    const paidAt = payment.date_approved || order.paid_at || new Date().toISOString();
    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update({ payment_status: "approved", paid_at: paidAt })
      .eq("id", order.id);
    if (updErr) return json({ ok: false, error: "update_failed", detail: updErr }, 500);

    // O uso do cupom já foi reservado atomicamente em process-payment
    // (reserve_coupon_use). Reprocessar um pedido NÃO incrementa de novo.


    const fulfillment = await fulfillOrder(supabaseAdmin, order.id, mpPaymentId);

    // Server-side conversion tracking com claim atômico (mesma dedup do webhook)
    let tracking: Record<string, unknown> = { skipped: "already_sent" };
    try {
      const { data: claimed } = await supabaseAdmin
        .from("orders")
        .update({ purchase_event_sent_at: new Date().toISOString() })
        .eq("id", order.id)
        .is("purchase_event_sent_at", null)
        .select("id")
        .maybeSingle();
      if (claimed) {
        const p = {
          transactionId: order.id as string,
          value: Number(order.final_amount ?? order.total_amount ?? 0),
          currency: "BRL",
          quantity: Number(order.quantity ?? 1),
          couponCode: order.coupon_code || null,
          customerEmail: order.customer_email || null,
          customerPhone: order.customer_phone || null,
          clientIp: null,
          userAgent: null,
          sku: order.sku || "f5anc",
          productName: order.product_name || "Headphone Meeky F5 ANC Pro",
          productPrice: Number(order.product_price ?? 297),
        };
        const [ga4Res, metaRes] = await Promise.all([sendGa4Purchase(p), sendMetaCapiPurchase(p)]);
        tracking = { ga4: ga4Res, meta: metaRes };
      }
    } catch (trackErr) {
      tracking = { error: (trackErr as Error).message };
    }


    // Re-fetch para devolver IDs finais
    const { data: finalOrder } = await supabaseAdmin
      .from("orders")
      .select("id, paid_at, shipping_order_id, tracking_code")
      .eq("id", order.id)
      .maybeSingle();

    return json({ ok: true, order: finalOrder, fulfillment, tracking });
  } catch (e) {
    console.error("reprocess-order error:", e);
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});
