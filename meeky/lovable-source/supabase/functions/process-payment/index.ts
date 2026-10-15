import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { initSentry, captureEdgeException } from "../_shared/sentry.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

initSentry("process-payment");

const cleanDocument = (doc?: string | null): string => (doc ? doc.replace(/[.\-\/\s]/g, "") : "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const limited = await enforceRateLimit(req, {
    functionName: "process-payment",
    maxRequests: 20,
    windowSeconds: 600,
    corsHeaders,
  });
  if (limited) return limited;

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json() as Record<string, any>;
    const formData = (body.formData ?? body) as Record<string, any>;
    const customer = (body.customerData ?? body.customer ?? {}) as Record<string, any>;
    const shipping = (body.shippingData ?? body.shipping ?? {}) as Record<string, any>;
    const product = (body.productData ?? body.product ?? {}) as Record<string, any>;
    const paymentMethod = body.paymentMethod || formData.paymentMethod || "credit_card";
    const rawDocument = formData.payer?.identification?.number || customer.docNumber || customer.cpf || "";
    const cleanedDocument = cleanDocument(rawDocument);
    const documentType = formData.payer?.identification?.type || customer.docType || (cleanedDocument.length > 11 ? "CNPJ" : "CPF");

    // ===== AUTHORITATIVE SERVER-SIDE PRICING =====
    // NEVER trust amounts sent by the frontend.
    const BASE_PRICE = 297.00; // R$ per unit
    const qty = Math.max(1, Math.min(5, Number(product.quantity) || 1));
    const productSku = product.sku || "f5anc";
    const productName = product.name || "Headphone Meeky F5 ANC Pro";
    const shippingCost = 0; // Frete grátis para todo o Brasil

    const subtotal = +(BASE_PRICE * qty).toFixed(2);

    // Server-side coupon validation with ATOMIC reservation (prevents race condition
    // on max_uses). reserve_coupon_use returns the coupon only if the UPDATE
    // matched (active, not expired, uses_count < max_uses); otherwise the coupon
    // is invalid/exhausted and no row comes back.
    const rawCoupon = (product.coupon || body.coupon || "").toString().trim().toUpperCase();
    let appliedCouponCode: string | null = null;
    let discountAmount = 0;
    let couponReserved = false;

    if (rawCoupon) {
      const { data: reserved, error: reserveCouponErr } = await supabaseAdmin
        .rpc("reserve_coupon_use", { _code: rawCoupon });

      if (reserveCouponErr) {
        console.error("Coupon reservation error:", reserveCouponErr);
        return new Response(
          JSON.stringify({ error: "Falha ao validar cupom" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const couponRow = Array.isArray(reserved) ? reserved[0] : reserved;
      if (!couponRow) {
        return new Response(
          JSON.stringify({ error: "Cupom inválido, expirado ou esgotado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      couponReserved = true;
      appliedCouponCode = couponRow.code;
      const dv = Number(couponRow.discount_value);
      discountAmount = couponRow.discount_type === "percentage"
        ? +(subtotal * (dv / 100)).toFixed(2)
        : +dv.toFixed(2);
      // Clamp so total never goes negative
      if (discountAmount > subtotal) discountAmount = subtotal;
      console.log(`🎟️ Coupon reserved: ${appliedCouponCode} discount=${discountAmount}`);
    }

    let orderIdForRelease: string | null = null;
    const releaseCouponOnce = async (reason: string) => {
      if (!couponReserved || !appliedCouponCode) return;
      couponReserved = false;
      const { error } = await supabaseAdmin.rpc("release_coupon_use", { _code: appliedCouponCode });
      if (error) console.error(`❌ release_coupon_use failed (${reason}):`, error);
      else console.log(`↩️ Coupon released (${reason}): ${appliedCouponCode}`);
      if (orderIdForRelease) {
        await supabaseAdmin.from("orders")
          .update({ coupon_released_at: new Date().toISOString() })
          .eq("id", orderIdForRelease);
      }
    };

    const finalAmount = +(subtotal - discountAmount + shippingCost).toFixed(2);
    const transactionAmount = finalAmount; // authoritative amount sent to MP

    console.log("💰 Server-side pricing:", { qty, subtotal, discountAmount, shippingCost, finalAmount, coupon: appliedCouponCode });

    if (paymentMethod !== "bank_transfer" && paymentMethod !== "pix" && !formData.token) {
      return new Response(
        JSON.stringify({ error: "Token do cartão é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const utm = (body.utm ?? {}) as Record<string, any>;
    const lastUtm = (body.last_utm ?? {}) as Record<string, any> | null;
    const landingReferrer = typeof body.landing_referrer === "string" && body.landing_referrer.length > 0
      ? body.landing_referrer.slice(0, 500)
      : null;
    const oppref = typeof body.oppref === "string" && body.oppref.length > 0
      ? body.oppref.slice(0, 200)
      : null;
    const ttclid = typeof body.ttclid === "string" && body.ttclid.length > 0
      ? body.ttclid.slice(0, 300)
      : null;
    const utmField = (source: Record<string, any> | null | undefined, k: string): string | null => {
      const v = source?.[k];
      return typeof v === "string" && v.length > 0 ? v.slice(0, 100) : null;
    };

    // ===== IDEMPOTENCY: prevent duplicate orders on double-click =====
    const idempotencyKey = (body.idempotency_key || formData.idempotency_key || crypto.randomUUID()).toString().slice(0, 100);

    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("id, mp_payment_id, payment_status")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingOrder) {
      console.log(`♻️ Duplicate request — returning existing order ${existingOrder.id}`);
      // The original request already reserved the coupon; this duplicate must not double-count.
      await releaseCouponOnce("duplicate_request");
      return new Response(
        JSON.stringify({
          status: existingOrder.payment_status,
          payment_id: existingOrder.mp_payment_id,
          order_id: existingOrder.id,
          duplicate: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== ATOMIC STOCK RESERVATION (prevents overselling) =====
    const { data: remainingStock, error: reserveErr } = await supabaseAdmin
      .rpc("reserve_stock", { _sku: productSku, _qty: qty });

    if (reserveErr) {
      console.error("❌ reserve_stock RPC error:", reserveErr);
      await releaseCouponOnce("reserve_stock_error");
      return new Response(
        JSON.stringify({ error: "Falha ao verificar estoque" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (remainingStock === null) {
      console.warn(`⚠️ Out of stock for SKU=${productSku} qty=${qty}`);
      await releaseCouponOnce("out_of_stock");
      return new Response(
        JSON.stringify({
          ok: false,
          error: "out_of_stock",
          message: "Produto temporariamente indisponível. Tente novamente em alguns minutos.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    console.log(`📦 Stock reserved: SKU=${productSku} qty=${qty} remaining=${remainingStock}`);

    let stockReserved = true;
    const releaseStockOnce = async (reason: string) => {
      if (!stockReserved) return;
      stockReserved = false;
      const { error: relErr } = await supabaseAdmin.rpc("release_stock", { _sku: productSku, _qty: qty });
      if (relErr) console.error(`❌ release_stock failed (${reason}):`, relErr);
      else console.log(`↩️ Stock released (${reason}): SKU=${productSku} qty=${qty}`);
      if (orderIdForRelease) {
        await supabaseAdmin.from("orders")
          .update({ stock_released_at: new Date().toISOString() })
          .eq("id", orderIdForRelease);
      }
    };

    const orderId = crypto.randomUUID();
    orderIdForRelease = orderId;

    const { error: dbError } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      idempotency_key: idempotencyKey,
      customer_name: customer.name || formData.payer?.email || "N/A",
      customer_cpf: customer.cpf || cleanedDocument || "N/A",
      customer_email: customer.email || formData.payer?.email || "N/A",
      customer_phone: customer.phone || "",
      total_amount: finalAmount,
      final_amount: finalAmount,
      subtotal_amount: subtotal,
      discount_amount: discountAmount,
      product_price: subtotal,
      shipping_cost: shippingCost,
      sku: productSku,
      product_name: productName,
      quantity: qty,
      coupon_code: appliedCouponCode,
      payment_status: "pending",
      shipping_street: shipping.street || "",
      shipping_number: shipping.number || "",
      shipping_complement: shipping.complement || "",
      shipping_neighborhood: shipping.neighborhood || "",
      shipping_city: shipping.city || "",
      shipping_state: shipping.state || "",
      shipping_cep: shipping.cep || "",
      utm_source: utmField(utm, "utm_source"),
      utm_medium: utmField(utm, "utm_medium"),
      utm_campaign: utmField(utm, "utm_campaign"),
      utm_content: utmField(utm, "utm_content"),
      utm_term: utmField(utm, "utm_term"),
      last_utm_source: utmField(lastUtm, "utm_source"),
      last_utm_medium: utmField(lastUtm, "utm_medium"),
      last_utm_campaign: utmField(lastUtm, "utm_campaign"),
      last_utm_content: utmField(lastUtm, "utm_content"),
      last_utm_term: utmField(lastUtm, "utm_term"),
      landing_referrer: landingReferrer,
      oppref,
      ttclid,
    });

    // Mark abandoned checkout as converted (fire-and-forget; never blocks the payment flow).
    const abandonedToken = (body.abandoned_session_token || body.abandonedSessionToken || "").toString();
    if (!dbError && abandonedToken) {
      supabaseAdmin
        .from("abandoned_checkouts")
        .update({ converted_order_id: orderId })
        .eq("session_token", abandonedToken)
        .then(({ error }) => {
          if (error) console.warn("⚠️ Failed to mark abandoned_checkouts converted:", error.message);
        });
    }


    if (dbError) {
      // Unique violation on idempotency_key — race: another request already inserted
      if ((dbError as any).code === "23505") {
        // Duplicate request raced past our idempotency check — release the second reservation.
        await releaseStockOnce("duplicate_idempotency_key");
        await releaseCouponOnce("duplicate_idempotency_key");
        const { data: raced } = await supabaseAdmin
          .from("orders")
          .select("id, mp_payment_id, payment_status")
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();
        if (raced) {
          return new Response(
            JSON.stringify({
              status: raced.payment_status,
              payment_id: raced.mp_payment_id,
              order_id: raced.id,
              duplicate: true,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      await releaseStockOnce("order_insert_failed");
      await releaseCouponOnce("order_insert_failed");
      console.error("❌ Failed to save pending order:", JSON.stringify(dbError));
      return new Response(
        JSON.stringify({ error: "Falha ao registrar pedido" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Order ${orderId} saved with status 'pending'`);

    const notificationUrl = `${supabaseUrl}/functions/v1/mercadopago-webhook`;

    const phoneDigits = (customer.phone || "").replace(/\D/g, "");
    const areaCode = phoneDigits.slice(0, 2);
    const phoneNumber = phoneDigits.slice(2);

    const paymentPayload: Record<string, any> = {
      transaction_amount: transactionAmount,
      description: body.description || formData.description || productName,
      payment_method_id: formData.payment_method_id,
      payer: {
        email: formData.payer?.email || customer.email,
        first_name: customer.name?.split(" ")[0] || "",
        last_name: customer.name?.split(" ").slice(1).join(" ") || "",
        identification: {
          type: documentType,
          number: cleanedDocument,
        },
        phone: {
          area_code: areaCode,
          number: phoneNumber,
        },
        address: {
          zip_code: (shipping.cep || "").replace(/\D/g, ""),
          street_name: shipping.street || "",
          street_number: shipping.number || "",
        },
      },
      additional_info: {
        items: [
          {
            id: productSku,
            title: productName,
            description: "Headphone com cancelamento de ruído ativo, Bluetooth 5.4, 70h de bateria",
            category_id: "electronics",
            quantity: qty,
            unit_price: +(finalAmount / qty).toFixed(2),
          },
        ],
        payer: {
          first_name: customer.name?.split(" ")[0] || "",
          last_name: customer.name?.split(" ").slice(1).join(" ") || "",
          phone: {
            area_code: areaCode,
            number: phoneNumber,
          },
          address: {
            zip_code: (shipping.cep || "").replace(/\D/g, ""),
            street_name: shipping.street || "",
            street_number: parseInt(shipping.number || "0", 10),
          },
        },
        shipments: {
          receiver_address: {
            zip_code: (shipping.cep || "").replace(/\D/g, ""),
            street_name: shipping.street || "",
            street_number: parseInt(shipping.number || "0", 10),
            city_name: shipping.city || "",
            state_name: shipping.state || "",
          },
        },
      },
      statement_descriptor: "MEEKY AUDIO",
      external_reference: orderId,
      notification_url: notificationUrl,
      // binary_mode rejeita pagamentos 'pending' — incompatível com PIX e boleto.
      // Só ativamos para cartão (quando há token), onde queremos aprovação imediata.
      binary_mode: !!formData.token,
    };

    if (formData.token) {
      paymentPayload.token = formData.token;
      paymentPayload.installments = formData.installments || 1;
      paymentPayload.issuer_id = formData.issuer_id;
    }

    console.log("=== PAYLOAD ENVIADO AO MP ===", JSON.stringify({
      payment_method_id: paymentPayload.payment_method_id,
      external_reference: paymentPayload.external_reference,
      payer_id_type: paymentPayload.payer?.identification?.type,
    }));

    console.log("💳 Sending payment to MP API...", {
      amount: paymentPayload.transaction_amount,
      method: paymentPayload.payment_method_id,
      external_reference: orderId,
    });

    const startTime = Date.now();
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(paymentPayload),
    });

    const elapsed = Date.now() - startTime;
    const mpData = await mpResponse.json();

    console.log(`📋 MP API responded in ${elapsed}ms:`, JSON.stringify({
      id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail,
      payment_method_id: mpData.payment_method_id,
    }));

    if (mpData.id) {
      await supabaseAdmin.from("orders").update({
        mp_payment_id: mpData.id.toString(),
        payment_status: mpData.status || "unknown",
      }).eq("id", orderId);
    }

    if (!mpResponse.ok) {
      await releaseStockOnce("mp_api_error");
      await releaseCouponOnce("mp_api_error");
      console.error("❌ MP API error:", JSON.stringify(mpData));
      return new Response(
        JSON.stringify({
          error: mpData.message || "Erro ao processar pagamento",
          status: mpData.status,
          cause: mpData.cause,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pagamento explicitamente recusado/cancelado pelo MP — devolver estoque + cupom.
    if (mpData.status === "rejected" || mpData.status === "cancelled") {
      await releaseStockOnce(`mp_status_${mpData.status}`);
      await releaseCouponOnce(`mp_status_${mpData.status}`);
    }

    const responseData: Record<string, unknown> = {
      status: mpData.status,
      status_detail: mpData.status_detail,
      payment_id: mpData.id?.toString(),
      order_id: orderId,
    };

    if (mpData.point_of_interaction?.transaction_data) {
      const txData = mpData.point_of_interaction.transaction_data;
      responseData.pix_qr_code = txData.qr_code || null;
      responseData.pix_qr_code_base64 = txData.qr_code_base64 || null;
      responseData.pix_ticket_url = txData.ticket_url || null;
    }

    // 3DS challenge — banco exige autenticação adicional (frequente em mobile)
    if (mpData.status === "pending" && mpData.status_detail === "pending_challenge") {
      const threeDsUrl =
        mpData.three_ds_info?.external_resource_url ||
        mpData.point_of_interaction?.transaction_data?.external_resource_url ||
        null;
      responseData.three_ds_url = threeDsUrl;
      console.log("🔐 3DS challenge required:", threeDsUrl);
    }

    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("❌ process-payment error:", error);
    captureEdgeException(error, { fn: "process-payment" });
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});