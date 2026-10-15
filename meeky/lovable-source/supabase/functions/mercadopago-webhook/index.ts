import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { fulfillOrder } from "../_shared/order-fulfillment.ts";
import { sendGa4Purchase, sendMetaCapiPurchase, sendOpenAiOrderCreated, sendTikTokPurchase } from "../_shared/conversion-tracking.ts";
import { initSentry, captureEdgeException } from "../_shared/sentry.ts";
import { decideWebhookEventStatus } from "./status-decision.ts";

initSentry("mercadopago-webhook");


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isTestNotification = (id?: string | null) => id === "123456" || id === "12345";

// Valida assinatura HMAC SHA256 do webhook MP conforme documentação oficial.
// Manifest: id:[data.id];request-id:[x-request-id];ts:[ts];
const verifyMpSignature = async (
  req: Request,
  dataId: string,
  secret: string,
): Promise<boolean> => {
  const xSignature = req.headers.get("x-signature") || "";
  const xRequestId = req.headers.get("x-request-id") || "";
  if (!xSignature || !xRequestId) return false;

  const parts = xSignature.split(",").map((p) => p.trim());
  let ts = "";
  let v1 = "";
  for (const p of parts) {
    const [k, ...rest] = p.split("=");
    const v = rest.join("=");
    if (k === "ts") ts = v;
    else if (k === "v1") v1 = v;
  }
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const computed = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Comparação tempo-constante
  if (computed.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
};

const fetchMerchantOrderPaymentId = async (merchantOrderId: string, accessToken: string) => {
  console.log(`📦 Fetching merchant_order ${merchantOrderId}...`);

  const response = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to fetch merchant_order:", JSON.stringify(data));
    return { paymentId: null, error: `merchant_order_${response.status}` };
  }

  const approvedPayment = (data.payments || []).find((payment: { status?: string; id?: number | string }) => payment.status === "approved");
  const fallbackPayment = (data.payments || [])[0];
  const resolvedPaymentId = approvedPayment?.id?.toString() || fallbackPayment?.id?.toString() || null;

  return { paymentId: resolvedPaymentId, error: null };
};

const resolvePaymentIdFromNotification = async (req: Request, accessToken: string) => {
  const url = new URL(req.url);
  const ipnTopic = url.searchParams.get("topic") || url.searchParams.get("type");
  const ipnId = url.searchParams.get("id") || url.searchParams.get("data.id");

  if (ipnTopic && ipnId) {
    console.log(`📩 IPN received — topic: ${ipnTopic}, id: ${ipnId}`);

    if (isTestNotification(ipnId)) {
      return { paymentId: null, originalDataId: ipnId, notificationType: "ipn" as const, response: jsonResponse({ ok: true, message: "IPN test received" }) };
    }

    if (ipnTopic === "payment") {
      return { paymentId: ipnId, originalDataId: ipnId, notificationType: "ipn" as const, response: null };
    }

    if (ipnTopic === "merchant_order") {
      const { paymentId, error } = await fetchMerchantOrderPaymentId(ipnId, accessToken);
      if (error) {
        return { paymentId: null, originalDataId: ipnId, notificationType: "ipn" as const, response: jsonResponse({ ok: false, error }) };
      }

      if (!paymentId) {
        console.log("Webhook sem payment_id, ignorando");
        return { paymentId: null, originalDataId: ipnId, notificationType: "ipn" as const, response: jsonResponse({ ok: true, message: "Webhook sem payment_id" }) };
      }

      return { paymentId, originalDataId: ipnId, notificationType: "ipn" as const, response: null };
    }

    console.log(`IPN topic "${ipnTopic}" not handled`);
    return { paymentId: null, originalDataId: ipnId, notificationType: "ipn" as const, response: jsonResponse({ ok: true, message: "Topic not handled" }) };
  }

  const bodyText = await req.text();
  const body = bodyText ? JSON.parse(bodyText) : {};
  console.log("📩 Webhook received:", JSON.stringify(body));

  const bodyType = body.type || body.topic || null;
  const bodyId = body.data?.id?.toString() || null;

  if (isTestNotification(bodyId)) {
    return { paymentId: null, originalDataId: bodyId, notificationType: "webhook" as const, response: jsonResponse({ ok: true, message: "Webhook test received" }) };
  }

  if (bodyType === "payment" || body.action === "payment.created" || body.action === "payment.updated") {
    return { paymentId: bodyId, originalDataId: bodyId, notificationType: "webhook" as const, response: null };
  }

  if (bodyType === "merchant_order") {
    if (!bodyId) {
      console.log("Webhook sem payment_id, ignorando");
      return { paymentId: null, originalDataId: bodyId, notificationType: "webhook" as const, response: jsonResponse({ ok: true, message: "Webhook sem payment_id" }) };
    }

    const { paymentId, error } = await fetchMerchantOrderPaymentId(bodyId, accessToken);
    if (error) {
      return { paymentId: null, originalDataId: bodyId, notificationType: "webhook" as const, response: jsonResponse({ ok: false, error }) };
    }

    if (!paymentId) {
      console.log("Webhook sem payment_id, ignorando");
      return { paymentId: null, originalDataId: bodyId, notificationType: "webhook" as const, response: jsonResponse({ ok: true, message: "Webhook sem payment_id" }) };
    }

    return { paymentId, originalDataId: bodyId, notificationType: "webhook" as const, response: null };
  }

  return { paymentId: null, originalDataId: bodyId, notificationType: "webhook" as const, response: jsonResponse({ ok: true, message: "Topic not handled" }) };
};

// ============================================================================
// Tratamento de status terminais negativos (chargeback, reembolso, mediação,
// cancelamento, rejeição). Idempotente via UNIQUE em order_status_history.
// Libera estoque + cupom e alerta o admin por e-mail (exceto pedidos ML).
// ============================================================================
const STATUS_LABELS: Record<string, string> = {
  charged_back: "Chargeback (contestação no cartão)",
  refunded: "Reembolsado",
  in_mediation: "Em mediação (disputa aberta)",
  cancelled: "Cancelado",
  rejected: "Rejeitado",
};

const isMercadoLivreOrder = (order: { customer_email?: string | null }) =>
  !!order.customer_email && /@mercadolibre\.com$/i.test(order.customer_email);

async function sendAdminAlert(order: any, newStatus: string, statusDetail: string | null) {
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!adminEmail || !resendKey) {
    console.warn("⚠️ ADMIN_EMAIL/RESEND_API_KEY ausente — alerta não enviado");
    return "skipped";
  }
  try {
    const { Resend } = await import("npm:resend");
    const resend = new Resend(resendKey);
    const label = STATUS_LABELS[newStatus] || newStatus;
    const amount = Number(order.final_amount ?? order.total_amount ?? 0)
      .toFixed(2).replace(".", ",");
    await resend.emails.send({
      from: "Meeky Alertas <pedidos@meeky.com.br>",
      to: adminEmail,
      subject: `⚠️ ${label} — pedido ${String(order.id).slice(0, 8)}`,
      html: `
        <h2>Alerta de status de pagamento</h2>
        <p><strong>Novo status:</strong> ${label} (<code>${newStatus}</code>)</p>
        ${statusDetail ? `<p><strong>Detalhe MP:</strong> ${statusDetail}</p>` : ""}
        <p><strong>Pedido:</strong> ${order.id}</p>
        <p><strong>Cliente:</strong> ${order.customer_name || "—"} &lt;${order.customer_email || "—"}&gt;</p>
        <p><strong>Produto:</strong> ${order.product_name || order.sku} × ${order.quantity ?? 1}</p>
        <p><strong>Valor:</strong> R$ ${amount}</p>
        <p><strong>MP Payment ID:</strong> ${order.mp_payment_id || "—"}</p>
        <p><strong>Data do evento:</strong> ${new Date().toISOString()}</p>
        <hr />
        <p>Ação automática executada: estoque e cupom (se aplicável) foram liberados.</p>
      `,
    });
    return "sent";
  } catch (e) {
    console.error("❌ Falha ao enviar alerta admin:", e);
    return "failed";
  }
}

async function handleNegativeStatus(
  supabaseAdmin: any,
  payment: any,
  mpPaymentId: string,
  _req: Request,
) {
  const newStatus = payment.status as string;
  const statusDetail = (payment.status_detail as string) || null;

  // Localizar pedido (mesma lógica do fluxo aprovado).
  const externalReference = (payment.external_reference || "").toString();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(externalReference);

  let order: any = null;
  const { data: byPayment } = await supabaseAdmin
    .from("orders").select("*").eq("mp_payment_id", mpPaymentId).maybeSingle();
  order = byPayment;
  if (!order && isUuid) {
    const { data: byRef } = await supabaseAdmin
      .from("orders").select("*").eq("id", externalReference).maybeSingle();
    order = byRef;
  }
  if (!order) {
    console.warn(`⚠️ Negative status ${newStatus} recebido mas pedido não encontrado (mp_payment_id=${mpPaymentId})`);
    return { skipped: "order_not_found" };
  }

  // Idempotência: tenta inserir em order_status_history.
  // UNIQUE(order_id, new_status, mp_payment_id) impede reprocessamento.
  const { error: histErr } = await supabaseAdmin
    .from("order_status_history")
    .insert({
      order_id: order.id,
      previous_status: order.payment_status,
      new_status: newStatus,
      mp_status_detail: statusDetail,
      mp_payment_id: mpPaymentId,
      source: "mercadopago-webhook",
    });

  if (histErr) {
    if ((histErr as any).code === "23505") {
      console.log(`♻️ Transição ${newStatus} já processada para pedido ${order.id} — ignorando`);
      return { skipped: "already_processed", status: newStatus };
    }
    console.error("❌ Falha ao gravar order_status_history:", JSON.stringify(histErr));
    return { skipped: "history_insert_failed" };
  }

  // Atualiza pedido.
  await supabaseAdmin
    .from("orders")
    .update({
      payment_status: newStatus,
      mp_status_detail: statusDetail,
      status_changed_at: new Date().toISOString(),
      mp_payment_id: mpPaymentId,
    })
    .eq("id", order.id);

  // Libera estoque — só se ainda não foi liberado no fluxo síncrono (process-payment)
  // ou por outra transição anterior. Evita liberação dupla quando o MP confirma
  // assincronamente um 'rejected'/'cancelled' que já foi tratado no checkout.
  let stockReleased = false;
  if (order.sku && order.quantity && order.quantity > 0 && !order.stock_released_at) {
    const { error: rsErr } = await supabaseAdmin.rpc("release_stock", {
      _sku: order.sku, _qty: order.quantity,
    });
    if (rsErr) console.error("❌ release_stock falhou:", JSON.stringify(rsErr));
    else {
      stockReleased = true;
      await supabaseAdmin.from("orders")
        .update({ stock_released_at: new Date().toISOString() })
        .eq("id", order.id);
    }
  } else if (order.stock_released_at) {
    console.log(`♻️ Stock já liberado anteriormente para pedido ${order.id} — pulando`);
  }

  // Libera cupom — mesma proteção contra liberação dupla.
  let couponReleased = false;
  if (order.coupon_code && !order.coupon_released_at) {
    const { error: rcErr } = await supabaseAdmin.rpc("release_coupon_use", {
      _code: order.coupon_code,
    });
    if (rcErr) console.error("❌ release_coupon_use falhou:", JSON.stringify(rcErr));
    else {
      couponReleased = true;
      await supabaseAdmin.from("orders")
        .update({ coupon_released_at: new Date().toISOString() })
        .eq("id", order.id);
    }
  } else if (order.coupon_released_at) {
    console.log(`♻️ Cupom já liberado anteriormente para pedido ${order.id} — pulando`);
  }

  // Alerta admin apenas para disputas pós-venda (charged_back, refunded, in_mediation).
  // rejected/cancelled são rotina de cartão recusado e não geram e-mail — o histórico
  // fica registrado em order_status_history para auditoria.
  const ALERT_STATES = new Set(["charged_back", "refunded", "in_mediation"]);
  let alertResult: string = "skipped_routine";
  if (ALERT_STATES.has(newStatus)) {
    if (!isMercadoLivreOrder(order)) {
      alertResult = await sendAdminAlert(order, newStatus, statusDetail);
    } else {
      alertResult = "skipped_ml";
      console.log(`ℹ️ Pedido ML detectado (${order.customer_email}) — alerta admin suprimido`);
    }
  } else {
    console.log(`ℹ️ Status ${newStatus} é rotina — alerta admin não enviado`);
  }

  console.log(`✅ Negative status ${newStatus} processado — pedido ${order.id} | stock=${stockReleased} coupon=${couponReleased} alert=${alertResult}`);
  return { status: newStatus, stock_released: stockReleased, coupon_released: couponReleased, admin_alert: alertResult };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }




  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN is not configured");

    const TINY_API_TOKEN = Deno.env.get("TINY_API_TOKEN");
    if (!TINY_API_TOKEN) throw new Error("TINY_API_TOKEN is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const resolvedNotification = await resolvePaymentIdFromNotification(req, MP_ACCESS_TOKEN);
    if (resolvedNotification.response) {
      return resolvedNotification.response;
    }

    const paymentId = resolvedNotification.paymentId;
    const notificationType = resolvedNotification.notificationType;
    const originalDataId = resolvedNotification.originalDataId;

    if (!paymentId) {
      console.log("Webhook sem payment_id, ignorando");
      return jsonResponse({ ok: true, message: "Webhook sem payment_id" });
    }

    // === Validação HMAC SHA256 (Mercado Pago) ===
    const MP_WEBHOOK_SECRET = Deno.env.get("MP_WEBHOOK_SECRET");
    if (!MP_WEBHOOK_SECRET) {
      console.error("❌ MP_WEBHOOK_SECRET não configurado — recusando webhook");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const signatureDataId = originalDataId || paymentId;
    const signatureValid = await verifyMpSignature(req, signatureDataId, MP_WEBHOOK_SECRET);
    if (!signatureValid) {
      console.error(`❌ Assinatura HMAC inválida — data.id: ${signatureDataId}, x-request-id: ${req.headers.get("x-request-id")}`);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log(`🔐 Assinatura HMAC validada (data.id: ${signatureDataId})`);

    const mpPaymentId = paymentId.toString();

    // === Idempotência com retry seguro via webhook_events ===
    // - status 'completed' → bloqueia reprocessamento
    // - status 'processing' ou 'failed' → permite retry do MP
    const { data: existingEvent, error: selectEventErr } = await supabaseAdmin
      .from("webhook_events")
      .select("mp_payment_id, status")
      .eq("mp_payment_id", mpPaymentId)
      .maybeSingle();

    if (selectEventErr) {
      console.error("❌ Falha ao consultar webhook_events:", JSON.stringify(selectEventErr));
      return jsonResponse({ ok: false, error: "Idempotency check failed" }, 500);
    }

    if (existingEvent?.status === "completed") {
      console.log(`♻️ Evento já completado — mp_payment_id: ${mpPaymentId}`);
      return jsonResponse({ ok: true, message: "Already processed" });
    }

    if (existingEvent) {
      console.log(`🔁 Retry permitido (status anterior: ${existingEvent.status}) — mp_payment_id: ${mpPaymentId}`);
      const { error: updErr } = await supabaseAdmin
        .from("webhook_events")
        .update({ status: "processing", processed_at: new Date().toISOString() })
        .eq("mp_payment_id", mpPaymentId);
      if (updErr) {
        console.error("❌ Falha ao atualizar webhook_event:", JSON.stringify(updErr));
        return jsonResponse({ ok: false, error: "Idempotency update failed" }, 500);
      }
    } else {
      const { error: insErr } = await supabaseAdmin
        .from("webhook_events")
        .insert({ mp_payment_id: mpPaymentId, status: "processing" });
      if (insErr && (insErr as any).code !== "23505") {
        console.error("❌ Falha ao registrar webhook_event:", JSON.stringify(insErr));
        return jsonResponse({ ok: false, error: "Idempotency insert failed" }, 500);
      }
    }

    const markEventStatus = async (status: "completed" | "failed") => {
      try {
        await supabaseAdmin
          .from("webhook_events")
          .update({ status, processed_at: new Date().toISOString() })
          .eq("mp_payment_id", mpPaymentId);
      } catch (e) {
        console.error(`⚠️ Falha ao marcar webhook_event como ${status}:`, e);
      }
    };

    console.log(`🔍 Processing payment ${mpPaymentId} (via ${notificationType})`);

    // Fetch payment details from Mercado Pago API
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });
    const payment = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error("Failed to fetch payment:", JSON.stringify(payment));
      await markEventStatus("failed");
      return jsonResponse({ ok: false, error: `MP API ${paymentRes.status}` });
    }

    console.log("📋 Payment details:", JSON.stringify({
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
    }));

    // === Status negativos terminais: chargeback, reembolso, mediação, etc. ===
    // Precisamos atualizar o pedido, liberar estoque/cupom e alertar o admin.
    const NEGATIVE_STATES = new Set(["charged_back", "refunded", "in_mediation", "cancelled", "rejected"]);
    if (payment.status !== "approved" && NEGATIVE_STATES.has(payment.status)) {
      const handled = await handleNegativeStatus(supabaseAdmin, payment, mpPaymentId, req);
      await markEventStatus("completed");
      return jsonResponse({ ok: true, status: payment.status, handled });
    }

    if (payment.status !== "approved") {
      // Decision logic lives in ./status-decision.ts and is covered by
      // status-decision_test.ts. Intermediate states (in_process, pending,
      // authorized) MUST stay 'processing' so the follow-up approval webhook
      // isn't blocked by the idempotency guard.
      const nextStatus = decideWebhookEventStatus(payment.status);
      console.log(`Payment não aprovado: ${payment.status} — webhook_event → ${nextStatus}`);
      if (nextStatus === "completed") await markEventStatus("completed");
      return jsonResponse({ ok: true, status: payment.status });
    }


    // --- Fetch order from DB ---
    // Prefer lookup by mp_payment_id (set by process-payment when MP returns the payment).
    // Fallback to external_reference matching the internal order UUID (legacy/checkout-pro flow).
    const externalReference = (payment.external_reference || "").toString();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(externalReference);

    let order: any = null;

    const { data: orderByPayment } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("mp_payment_id", mpPaymentId)
      .maybeSingle();
    order = orderByPayment;

    if (!order && isUuid) {
      const { data: orderByRef } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", externalReference)
        .maybeSingle();
      order = orderByRef;
    }

    if (!order) {
      console.error(`❌ Order not found — mp_payment_id: ${mpPaymentId}, external_reference: ${externalReference}`);
      await markEventStatus("failed");
      return jsonResponse({ ok: false, error: "Order not found" });
    }

    console.log(`📦 Order found: ${order.id}, customer: ${order.customer_name}, total: ${order.total_amount}`);

    // === Marca pagamento aprovado (idempotente; preserva paid_at existente) ===
    const nowIso = new Date().toISOString();
    const { error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "approved",
        mp_payment_id: mpPaymentId,
        paid_at: order.paid_at || nowIso,
      })
      .eq("id", order.id);

    if (updateOrderError) {
      console.error("❌ Failed to mark order as approved:", JSON.stringify(updateOrderError));
      await markEventStatus("failed");
      return jsonResponse({ ok: false, error: "Failed to update order" });
    }

    // O uso do cupom já foi RESERVADO atomicamente em process-payment (via
    // reserve_coupon_use). Não incrementar de novo aqui — geraria contagem em dobro.
    // Se o pagamento for eventualmente cancelado/rejeitado, o processo de release
    // acontece na função process-payment (retorno síncrono) ou pode ser adicionado
    // aqui no futuro para transições assíncronas para "rejected"/"cancelled".


    // === Orquestrador (Resend + Melhor Envio + Tiny) ===
    // Guarda por shipping_order_id IS NULL — roda independente de quem aprovou primeiro.
    const fulfillment = await fulfillOrder(supabaseAdmin, order.id, mpPaymentId);

    // === Server-side conversion tracking (GA4 MP + Meta CAPI) ===
    // Claim atômico: só dispara se ninguém (client-side) já marcou purchase_event_sent_at.
    // Se o cliente na página de sucesso chegar primeiro, ele fica com o disparo; senão, o
    // webhook garante que Pix aprovado offline / abas fechadas ainda contam a conversão.
    try {
      const { data: claimed } = await supabaseAdmin
        .from("orders")
        .update({ purchase_event_sent_at: new Date().toISOString() })
        .eq("id", order.id)
        .is("purchase_event_sent_at", null)
        .select("id")
        .maybeSingle();

      if (claimed) {
        const payload = {
          transactionId: order.id as string,
          value: Number(order.final_amount ?? order.total_amount ?? payment.transaction_amount ?? 0),
          currency: "BRL",
          quantity: Number(order.quantity ?? 1),
          couponCode: order.coupon_code || null,
          customerEmail: order.customer_email || null,
          customerPhone: order.customer_phone || null,
          clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
          userAgent: req.headers.get("user-agent") || null,
          sku: order.sku || "f5anc",
          productName: order.product_name || "Headphone Meeky F5 ANC Pro",
          productPrice: Number(order.product_price ?? 297),
        };
        const [ga4Res, metaRes] = await Promise.all([
          sendGa4Purchase(payload),
          sendMetaCapiPurchase(payload),
        ]);
        console.log(`📊 Server-side purchase — GA4: ${JSON.stringify(ga4Res)} | Meta CAPI: ${JSON.stringify(metaRes)}`);
      } else {
        console.log(`📊 Purchase event já disparado (client-side venceu o claim) — order ${order.id}`);
      }
    } catch (trackErr) {
      console.warn("⚠️ Server-side tracking falhou (não bloqueante):", trackErr);
    }

    // === OpenAI Ads Conversions API (order_created) ===
    // Claim próprio (openai_capi_sent_at) para não conflitar com o claim GA4/Meta,
    // que pode ser vencido pelo client-side na página de sucesso. Nunca bloqueante.
    try {
      const { data: openaiClaimed } = await supabaseAdmin
        .from("orders")
        .update({ openai_capi_sent_at: new Date().toISOString() })
        .eq("id", order.id)
        .is("openai_capi_sent_at", null)
        .select("id")
        .maybeSingle();

      if (openaiClaimed) {
        const res = await sendOpenAiOrderCreated({
          transactionId: order.id as string,
          value: Number(order.final_amount ?? order.total_amount ?? payment.transaction_amount ?? 0),
          currency: "BRL",
          quantity: Number(order.quantity ?? 1),
          sku: order.sku || "f5anc",
          productName: order.product_name || "Headphone Meeky F5 ANC Pro",
          oppref: (order.oppref as string | null) || null,
        });
        console.log(`🤖 OpenAI Ads order_created: ${JSON.stringify(res)}`);
      } else {
        console.log(`🤖 OpenAI Ads order_created já enviado — order ${order.id}`);
      }
    } catch (openaiErr) {
      console.warn("⚠️ OpenAI Ads CAPI falhou (não bloqueante):", (openaiErr as Error)?.message);
    }

    // === TikTok Events API (Purchase) ===
    // Claim próprio (tiktok_capi_sent_at) — idempotente em reenvio de webhook.
    // Nunca bloqueante; PII vai apenas em SHA-256 dentro do helper.
    try {
      const { data: ttClaimed } = await supabaseAdmin
        .from("orders")
        .update({ tiktok_capi_sent_at: new Date().toISOString() })
        .eq("id", order.id)
        .is("tiktok_capi_sent_at", null)
        .select("id")
        .maybeSingle();

      if (ttClaimed) {
        const res = await sendTikTokPurchase({
          transactionId: order.id as string,
          value: Number(order.final_amount ?? order.total_amount ?? payment.transaction_amount ?? 0),
          currency: "BRL",
          quantity: Number(order.quantity ?? 1),
          customerEmail: order.customer_email || null,
          customerPhone: order.customer_phone || null,
          clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
          userAgent: req.headers.get("user-agent") || null,
          sku: order.sku || "MEEKY-F5-PRO-BLK",
          productName: order.product_name || "Headphone Meeky F5 ANC Pro",
          productPrice: Number(order.product_price ?? 297),
          ttclid: (order.ttclid as string | null) || null,
        });
        console.log(`🎵 TikTok Events API Purchase: ${JSON.stringify(res)}`);
      } else {
        console.log(`🎵 TikTok Purchase já enviado — order ${order.id}`);
      }
    } catch (ttErr) {
      console.warn("⚠️ TikTok Events API falhou (não bloqueante):", (ttErr as Error)?.message);
    }


    await markEventStatus("completed");

    return new Response(
      JSON.stringify({ ok: true, ...fulfillment }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    captureEdgeException(error, { fn: "mercadopago-webhook" });
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

