import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend";
import { logEmailSend } from "../_shared/email-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ME_API = "https://melhorenvio.com.br/api/v2/me";

// Service fallback order (priority): J&T Express Standard (33) → Correios PAC (1) → Jadlog .Package (3) → Correios SEDEX (2, last resort)
const SERVICE_FALLBACK = [33, 1, 3, 2];

const cleanDoc = (doc: string) => (doc || "").replace(/[.\-\/]/g, "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const MELHOR_ENVIO_TOKEN = Deno.env.get("MELHOR_ENVIO_TOKEN");
    const ME_OWNER_CPF = Deno.env.get("ME_OWNER_CPF");
    if (!MELHOR_ENVIO_TOKEN) throw new Error("MELHOR_ENVIO_TOKEN is not configured");
    if (!ME_OWNER_CPF) throw new Error("ME_OWNER_CPF is not configured");

    const meHeaders = {
      Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "MeekyAudio/1.0 (contato@meeky.com.br)",
    };

    const { action, ...params } = await req.json();

    // Action: calculate – get shipping quotes
    if (action === "calculate") {
      const { to_cep } = params;
      const res = await fetch(`${ME_API}/shipment/calculate`, {
        method: "POST",
        headers: meHeaders,
        body: JSON.stringify({
          from: { postal_code: "03378060" },
          to: { postal_code: to_cep },
          products: [
            {
              id: "f5anc",
              width: 15,
              height: 10,
              length: 30,
              weight: 0.25,
              insurance_value: 297,
              quantity: 1,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Calculate failed [${res.status}]: ${JSON.stringify(data)}`);
      return new Response(JSON.stringify({ quotes: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: full_automation – calculate → cart → checkout → generate → save tracking → email
    if (action === "full_automation") {
      const { order_id } = params;
      if (!order_id) throw new Error("order_id is required");

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Fetch order from DB
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order_id)
        .single();
      if (orderErr || !order) throw new Error(`Order not found: ${order_id}`);

      console.log("🚚 Iniciando Melhor Envio full automation para pedido:", order_id);

      // Step 1: Calculate to find available service
      console.log("📊 Calculando frete para CEP:", order.shipping_cep);
      const calcRes = await fetch(`${ME_API}/shipment/calculate`, {
        method: "POST",
        headers: meHeaders,
        body: JSON.stringify({
          from: { postal_code: "03378060" },
          to: { postal_code: cleanDoc(order.shipping_cep) },
          products: [
            {
              id: "f5anc",
              width: 15,
              height: 10,
              length: 30,
              weight: 0.25,
              insurance_value: 297,
              quantity: 1,
            },
          ],
        }),
      });
      const calcData = await calcRes.json();
      if (!calcRes.ok) throw new Error(`Calculate failed [${calcRes.status}]: ${JSON.stringify(calcData)}`);

      // Find best available service from fallback list
      let selectedService: number | null = null;
      let selectedServiceName = "";
      let selectedServicePrice: number | null = null;
      for (const serviceId of SERVICE_FALLBACK) {
        const quote = Array.isArray(calcData)
          ? calcData.find((q: any) => q.id === serviceId && !q.error && q.price)
          : null;
        if (quote) {
          selectedService = serviceId;
          selectedServiceName = quote.company?.name
            ? `${quote.company.name} - ${quote.name}`
            : quote.name || `Service ${serviceId}`;
          const parsedPrice = parseFloat(quote.price);
          selectedServicePrice = Number.isFinite(parsedPrice) ? parsedPrice : null;
          console.log(`✅ Serviço selecionado: ${selectedServiceName} (ID: ${serviceId}) — R$ ${quote.price}`);
          break;
        }
      }
      if (!selectedService) {
        throw new Error("Nenhum serviço de envio disponível para o CEP de destino");
      }

      // Step 2: Add to cart
      const cartPayload = {
        service: selectedService,
        agency: null,
        from: {
          name: "Meeky Audio",
          phone: "1198076522",
          email: "contato@meeky.com.br",
          document: cleanDoc(ME_OWNER_CPF),
          company_document: "43341597000140",
          state_register: "",
          address: "Rua Fábio",
          complement: "",
          number: "396",
          district: "Chácara Belenzinho",
          city: "São Paulo",
          country_id: "BR",
          postal_code: "03378060",
          note: "",
        },
        to: {
          name: order.customer_name,
          phone: order.customer_phone || "11999999999",
          email: order.customer_email,
          document: (() => { const doc = cleanDoc(order.customer_cpf); return doc.length === 14 ? "" : doc; })(),
          company_document: (() => { const doc = cleanDoc(order.customer_cpf); return doc.length === 14 ? doc : ""; })(),
          address: order.shipping_street || "",
          complement: order.shipping_complement || "",
          number: order.shipping_number || "",
          district: order.shipping_neighborhood || "",
          city: order.shipping_city || "",
          state_abbr: order.shipping_state || "",
          country_id: "BR",
          postal_code: cleanDoc(order.shipping_cep),
          state_register: "",
          note: "",
        },
        products: [
          {
            name: order.product_name || "Headphone Meeky F5 ANC Pro",
            quantity: 1,
            unitary_value: 297,
          },
        ],
        volumes: [
          {
            height: 10,
            width: 15,
            length: 30,
            weight: 0.25,
          },
        ],
        options: {
          insurance_value: 297,
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false,
          invoice: { key: "" },
        },
      };

      console.log("📦 Melhor Envio cart payload:", JSON.stringify(cartPayload));

      const cartRes = await fetch(`${ME_API}/cart`, {
        method: "POST",
        headers: meHeaders,
        body: JSON.stringify(cartPayload),
      });
      const cartData = await cartRes.json();
      if (!cartRes.ok) throw new Error(`Cart failed [${cartRes.status}]: ${JSON.stringify(cartData)}`);

      const cartOrderId = cartData?.id;
      if (!cartOrderId) throw new Error(`Cart response missing order ID: ${JSON.stringify(cartData)}`);
      console.log("🛒 Adicionado ao carrinho:", cartOrderId);

      // Step 3: Checkout (pay for the label)
      const checkoutRes = await fetch(`${ME_API}/shipment/checkout`, {
        method: "POST",
        headers: meHeaders,
        body: JSON.stringify({ orders: [cartOrderId] }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(`Checkout failed [${checkoutRes.status}]: ${JSON.stringify(checkoutData)}`);
      console.log("💳 Checkout realizado:", JSON.stringify(checkoutData));

      // Step 4: Generate label
      const generateRes = await fetch(`${ME_API}/shipment/generate`, {
        method: "POST",
        headers: meHeaders,
        body: JSON.stringify({ orders: [cartOrderId] }),
      });
      const generateData = await generateRes.json();
      if (!generateRes.ok) throw new Error(`Generate failed [${generateRes.status}]: ${JSON.stringify(generateData)}`);

      const trackingCode = generateData?.[cartOrderId]?.tracking || generateData?.tracking || "";
      console.log("🏷️ Etiqueta gerada — tracking:", trackingCode);

      // Step 5: Save tracking to DB
      const { error: updateErr } = await supabase
        .from("orders")
        .update({
          tracking_code: trackingCode,
          shipping_order_id: cartOrderId,
          shipping_real_cost: selectedServicePrice,
          shipping_service_name: selectedServiceName,
        })
        .eq("id", order_id);
      if (updateErr) {
        console.error("⚠️ Failed to save tracking:", JSON.stringify(updateErr));
      } else {
        console.log("💾 Tracking salvo no banco");
      }

      // Step 6: Send tracking email (only if tracking code is available)
      if (trackingCode && trackingCode.length > 0) {
        const trackingMessageId = `order-tracking-${order.id}`;
        try {
          const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
          await resend.emails.send({
            from: "Meeky <pedidos@meeky.com.br>",
            to: order.customer_email,
            subject: "Seu Meeky F5 ANC Pro saiu para entrega! 📦",
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
                <div style="background:#8B5CF6;padding:20px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:22px;">Meeky Audio</h1>
                </div>
                <div style="padding:30px 20px;">
                  <h2 style="color:#1a1a1a;">Olá, ${order.customer_name}!</h2>
                  <p style="color:#555;font-size:15px;line-height:1.6;">
                    Seu pedido foi despachado e está a caminho.
                  </p>
                  <p style="color:#555;font-size:15px;">
                    <strong>Transportadora:</strong> ${selectedServiceName}
                  </p>
                  <p style="color:#555;font-size:15px;">
                    <strong>Código de rastreamento:</strong>
                    <span style="background:#f3f4f6;padding:4px 10px;border-radius:4px;font-family:monospace;font-weight:bold;">${trackingCode}</span>
                  </p>
                  <div style="text-align:center;margin:25px 0;">
                    <a href="https://www.melhorrastreio.com.br/rastreio/${trackingCode}"
                       style="background:#8B5CF6;color:#ffffff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
                      Rastrear meu pedido
                    </a>
                  </div>
                  <p style="color:#555;font-size:14px;">Prazo estimado: 2 dias úteis</p>
                  <p style="color:#999;font-size:13px;">Qualquer dúvida: contato@meeky.com.br</p>
                </div>
                <div style="background:#f9fafb;padding:15px;text-align:center;color:#999;font-size:12px;">
                  © 2026 Meeky Audio. Sem distração. Só performance.
                </div>
              </div>
            `,
          });
          console.log("📧 Email de rastreamento enviado para:", order.customer_email);
          await supabase.from("orders").update({ tracking_notified_at: new Date().toISOString() }).eq("id", order_id);
          await logEmailSend(supabase, {
            messageId: trackingMessageId,
            templateName: "order-tracking",
            recipientEmail: order.customer_email,
            status: "sent",
            metadata: { order_id, tracking_code: trackingCode, service: selectedServiceName },
          });
        } catch (emailErr) {
          console.error("❌ Email de rastreamento falhou (non-blocking):", emailErr);
          await logEmailSend(supabase, {
            messageId: trackingMessageId,
            templateName: "order-tracking",
            recipientEmail: order.customer_email,
            status: "failed",
            errorMessage: (emailErr as Error).message,
            metadata: { order_id, tracking_code: trackingCode },
          });
        }
      } else {
        console.log("⚠️ Tracking code vazio — email de rastreamento não enviado. notify-tracking cron cuidará quando o código sair.");
      }

      return new Response(
        JSON.stringify({
          ok: true,
          order_id: cartOrderId,
          tracking_code: trackingCode,
          service: selectedServiceName,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: cart – add shipment to cart (legacy, kept for compatibility)
    if (action === "cart") {
      const { customer, shipping, product } = params;

      const cartPayload = {
        service: 2,
        agency: null,
        from: {
          name: "Meeky Audio",
          phone: "1198076522",
          email: "contato@meeky.com.br",
          document: cleanDoc(ME_OWNER_CPF),
          company_document: "43341597000140",
          state_register: "",
          address: "Rua Fábio",
          complement: "",
          number: "396",
          district: "Chácara Belenzinho",
          city: "São Paulo",
          state_abbr: "SP",
          country_id: "BR",
          postal_code: "03378060",
          note: "",
        },
        to: {
          name: customer.name,
          phone: customer.phone || "",
          email: customer.email,
          document: (() => { const doc = cleanDoc(customer.cpf || customer.document); return doc.length === 14 ? "" : doc; })(),
          address: shipping.street,
          complement: shipping.complement || "",
          number: shipping.number,
          district: shipping.neighborhood || shipping.district || "",
          city: shipping.city,
          state_abbr: shipping.state,
          postal_code: cleanDoc(shipping.cep),
          country_id: "BR",
          state_register: "",
          note: "",
        },
        products: [
          {
            name: product.name || "Headphone Meeky F5 ANC Pro",
            quantity: 1,
            unitary_value: product.price,
          },
        ],
        volumes: [
          {
            width: 15,
            height: 10,
            length: 30,
            weight: 0.25,
          },
        ],
        options: {
          insurance_value: product.price,
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false,
          invoice: { key: "" },
        },
      };

      console.log("📦 Melhor Envio cart payload:", JSON.stringify(cartPayload));

      const res = await fetch(`${ME_API}/cart`, {
        method: "POST",
        headers: meHeaders,
        body: JSON.stringify(cartPayload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Cart failed [${res.status}]: ${JSON.stringify(data)}`);

      const orderId = data?.id;
      console.log("Melhor Envio cart created:", orderId);

      return new Response(JSON.stringify({ cart: data, order_id: orderId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: tracking – get tracking info
    if (action === "tracking") {
      const { orders } = params;
      const res = await fetch(`${ME_API}/shipment/tracking`, {
        method: "POST",
        headers: meHeaders,
        body: JSON.stringify({ orders }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Tracking failed [${res.status}]: ${JSON.stringify(data)}`);
      return new Response(JSON.stringify({ tracking: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: print – get label PDF URL
    if (action === "print") {
      const { orders } = params;
      const res = await fetch(`${ME_API}/shipment/print`, {
        method: "POST",
        headers: meHeaders,
        body: JSON.stringify({ orders, mode: "public" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`Print failed [${res.status}]: ${JSON.stringify(data)}`);
      return new Response(JSON.stringify({ print: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Melhor Envio error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
