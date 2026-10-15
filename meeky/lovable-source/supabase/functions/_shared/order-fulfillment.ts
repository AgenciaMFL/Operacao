// Shared orchestrator: Resend confirmation + Melhor Envio + Tiny ERP.
// Idempotent guard: runs only when orders.shipping_order_id IS NULL.
// Called by both mercadopago-webhook and reprocess-order.

import { Resend } from "npm:resend";
import { logEmailSend } from "./email-log.ts";

type SupabaseAdmin = ReturnType<typeof import("https://esm.sh/@supabase/supabase-js@2.49.1").createClient>;

export interface FulfillmentResult {
  skipped?: string;
  email?: "sent" | "skipped" | "failed";
  melhor_envio?: { order_id?: string; tracking_code?: string; service?: string } | null;
  tiny?: string | null;
}

const formatBRL = (v: number) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;

export async function fulfillOrder(
  supabaseAdmin: SupabaseAdmin,
  orderId: string,
  mpPaymentId: string,
): Promise<FulfillmentResult> {
  // Re-fetch authoritative state.
  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr || !order) {
    console.error("❌ fulfillOrder: order not found", JSON.stringify(fetchErr));
    return { skipped: "order_not_found" };
  }

  // Guard: já cumprido.
  if (order.shipping_order_id) {
    console.log(`♻️ fulfillOrder: shipping_order_id já presente (${order.shipping_order_id}) — pulando.`);
    return { skipped: "already_fulfilled", melhor_envio: { order_id: order.shipping_order_id, tracking_code: order.tracking_code } };
  }

  const result: FulfillmentResult = {};

  // === Resend confirmation ===
  console.log("📧 Enviando email para:", order.customer_email);
  const confirmationMessageId = `order-confirmation-${order.id}`;
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Meeky <pedidos@meeky.com.br>",
      to: order.customer_email,
      subject: "Pedido confirmado — Meeky F5 ANC Pro",
      html: `
        <h2>Olá, ${order.customer_name}!</h2>
        <p>Seu pedido foi confirmado e está sendo preparado para envio.</p>
        <p><strong>Produto:</strong> ${order.product_name || "Headphone Meeky F5 ANC Pro"}</p>
        <p><strong>Total:</strong> ${formatBRL(order.total_amount)}</p>
        <p><strong>Pagamento:</strong> Aprovado ✅</p>
        <p>Em breve você receberá o código de rastreamento.</p>
        <p>Qualquer dúvida, entre em contato: contato@meeky.com.br</p>
        <br/>
        <p>Equipe Meeky</p>
      `,
    });
    console.log("✅ Email enviado");
    result.email = "sent";
    await logEmailSend(supabaseAdmin, {
      messageId: confirmationMessageId,
      templateName: "order-confirmation",
      recipientEmail: order.customer_email,
      status: "sent",
      metadata: { order_id: order.id, mp_payment_id: mpPaymentId },
    });
  } catch (emailErr) {
    console.error("❌ Resend error (non-blocking):", emailErr);
    result.email = "failed";
    await logEmailSend(supabaseAdmin, {
      messageId: confirmationMessageId,
      templateName: "order-confirmation",
      recipientEmail: order.customer_email,
      status: "failed",
      errorMessage: (emailErr as Error).message,
      metadata: { order_id: order.id, mp_payment_id: mpPaymentId },
    });
  }

  // === Melhor Envio (também grava shipping_order_id + tracking_code em orders) ===
  let meResult: { order_id?: string; tracking_code?: string; service?: string } | null = null;
  try {
    const meRes = await supabaseAdmin.functions.invoke("melhor-envio-shipping", {
      body: { action: "full_automation", order_id: order.id },
    });
    if (meRes.data?.ok) {
      console.log("✅ Melhor Envio:", JSON.stringify(meRes.data));
      meResult = {
        order_id: meRes.data.order_id,
        tracking_code: meRes.data.tracking_code,
        service: meRes.data.service,
      };
    } else {
      console.warn("⚠️ Melhor Envio response:", JSON.stringify(meRes.data));
    }
  } catch (meErr) {
    console.error("❌ Melhor Envio error (non-blocking):", meErr);
  }
  result.melhor_envio = meResult;

  // === Tiny ERP ===
  const TINY_API_TOKEN = Deno.env.get("TINY_API_TOKEN");
  let tinyResult: string | null = null;
  if (!TINY_API_TOKEN) {
    console.error("❌ TINY_API_TOKEN missing");
  } else {
    try {
      const hoje = new Date();
      const dataAtual = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;

      const cpfDigits = (order.customer_cpf || "").replace(/\D/g, "");
      const isCNPJ = cpfDigits.length > 11;

      const clienteBase: Record<string, unknown> = {
        nome: order.customer_name,
        cpf_cnpj: order.customer_cpf,
        email: order.customer_email,
        fone: order.customer_phone || "",
        endereco: order.shipping_street || "",
        numero: order.shipping_number || "",
        complemento: order.shipping_complement || "",
        bairro: order.shipping_neighborhood || "",
        cidade: order.shipping_city || "",
        uf: order.shipping_state || "",
        cep: order.shipping_cep || "",
      };
      if (isCNPJ) {
        clienteBase.ie = "";
        clienteBase.indIEDest = "9";
      }

      const carrierService = meResult?.service || "";
      const isCorreios = carrierService.toLowerCase().includes("sedex") || carrierService.toLowerCase().includes("pac") || carrierService.toLowerCase().includes("correios");
      const formaEnvio = isCorreios ? "Correios" : "Transportadora";
      const nomeTransportador = isCorreios ? `Correios ${carrierService}` : (carrierService || "J&T Express");
      const trackingCode = meResult?.tracking_code || "";

      const shortId = order.id.substring(0, 8).toUpperCase();

      const tinyOrder = {
        pedido: {
          numero_pedido_externo: shortId,
          data_pedido: dataAtual,
          cliente: clienteBase,
          itens: [
            {
              item: {
                codigo: order.sku,
                descricao: order.product_name || "Headphone Meeky ANC Premium",
                unidade: "UN",
                quantidade: order.quantity || 1,
                valor_unitario: Number(order.product_price) / (order.quantity || 1),
              },
            },
          ],
          valor_frete: Number(order.shipping_cost),
          valor_desconto: 0,
          forma_envio: formaEnvio,
          frete_por_conta: "R",
          nome_transportador: nomeTransportador,
          volumes: [{ volume: { servico: nomeTransportador, codigoRastreamento: trackingCode } }],
          obs: `Site Meeky | MP #${mpPaymentId} | Cupom: ${order.coupon_code || "Sem cupom"} | ID: ${shortId}`,
          situacao: "Aprovado",
        },
      };

      console.log("📦 Tiny payload:", JSON.stringify(tinyOrder));

      const tinyRes = await fetch(
        `https://api.tiny.com.br/api2/pedido.incluir.php?token=${TINY_API_TOKEN}&formato=json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `pedido=${encodeURIComponent(JSON.stringify(tinyOrder))}`,
        },
      );
      const tinyData = await tinyRes.json();
      console.log("Tiny ERP response:", JSON.stringify(tinyData));

      if (tinyData.retorno?.status === "Erro") {
        console.error("❌ Tiny ERP error:", JSON.stringify(tinyData.retorno.erros));
      } else {
        tinyResult = tinyData.retorno?.status;

        try {
          const tinyId = tinyData?.retorno?.registros?.registro?.id;
          if (tinyId) {
            const formData = new URLSearchParams();
            formData.append("token", Deno.env.get("TINY_TOKEN") ?? "");
            formData.append("formato", "JSON");
            formData.append("id", String(tinyId));
            formData.append("marcadores", JSON.stringify([{ marcador: { descricao: "Site Meeky" } }]));
            const res = await fetch("https://api.tiny.com.br/api2/pedido.alterar.marcadores.php", {
              method: "POST",
              body: formData,
            });
            console.log("🏷️ Tiny marcador raw response:", await res.text());
          }
        } catch (err) {
          console.log("❌ Erro marcador Tiny:", (err as Error).message);
        }
      }
    } catch (tinyErr) {
      console.error("❌ Tiny ERP exception (non-blocking):", tinyErr);
    }
  }
  result.tiny = tinyResult;

  return result;
}

// DEPRECATED — não usar. O uso do cupom agora é reservado atomicamente em
// process-payment (via reserve_coupon_use RPC), e liberado (release_coupon_use)
// em falha/rejeição/cancelamento. Chamar esta função aqui geraria contagem em
// dobro. Mantida como no-op apenas por compatibilidade — pode ser removida
// junto com a RPC increment_coupon_usage numa migração futura.
export async function incrementCoupon(_supabaseAdmin: SupabaseAdmin, _couponCode: string | null) {
  return;
}

