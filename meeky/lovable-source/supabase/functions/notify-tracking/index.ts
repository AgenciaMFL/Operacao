// notify-tracking: envia e-mail automático com código de rastreio para pedidos
// aprovados assim que o tracking_code é gerado no Melhor Envio.
//
// Fluxo:
// 1) Busca pedidos com payment_status='approved', shipping_order_id NOT NULL
//    e tracking_notified_at IS NULL.
// 2) Se tracking_code está vazio, consulta ME_API /me/shipment/tracking
//    para tentar obter o código (o envio pode ainda não estar despachado).
// 3) Se disponível: persiste tracking_code, envia e-mail via Resend,
//    registra em email_send_log e marca tracking_notified_at.
//
// Chamado por pg_cron a cada 30 min e manualmente com { order_id }.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend";
import { logEmailSend } from "../_shared/email-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ME_API = "https://melhorenvio.com.br/api/v2/me";

interface OrderRow {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  tracking_code: string | null;
  shipping_order_id: string | null;
  shipping_service_name: string | null;
}

async function fetchTrackingFromME(cartOrderId: string, token: string): Promise<string | null> {
  try {
    const res = await fetch(`${ME_API}/shipment/tracking`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "MeekyAudio/1.0 (contato@meeky.com.br)",
      },
      body: JSON.stringify({ orders: [cartOrderId] }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.warn(`ME tracking [${res.status}]:`, JSON.stringify(data));
      return null;
    }
    const entry = data?.[cartOrderId] ?? data;
    const code = entry?.tracking || entry?.melhorenvio_tracking || null;
    return typeof code === "string" && code.length > 0 ? code : null;
  } catch (err) {
    console.warn("ME tracking exception:", (err as Error).message);
    return null;
  }
}

function trackingEmailHtml(name: string, service: string, trackingCode: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:#8B5CF6;padding:20px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">Meeky Audio</h1>
      </div>
      <div style="padding:30px 20px;">
        <h2 style="color:#1a1a1a;">Olá, ${name}!</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          Seu pedido foi despachado e está a caminho.
        </p>
        <p style="color:#555;font-size:15px;">
          <strong>Transportadora:</strong> ${service}
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
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const meToken = Deno.env.get("MELHOR_ENVIO_TOKEN");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!meToken) throw new Error("MELHOR_ENVIO_TOKEN missing");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(resendKey);

    let body: { order_id?: string } = {};
    try { body = await req.json(); } catch { /* cron/GET */ }

    let query = supabase
      .from("orders")
      .select("id, customer_name, customer_email, tracking_code, shipping_order_id, shipping_service_name")
      .is("tracking_notified_at", null)
      .not("shipping_order_id", "is", null);

    if (body.order_id) {
      query = query.eq("id", body.order_id);
    } else {
      query = query.eq("payment_status", "approved").limit(50);
    }

    const { data: orders, error } = await query;
    if (error) throw error;

    const results: Array<Record<string, unknown>> = [];

    for (const raw of (orders ?? []) as OrderRow[]) {
      if (!raw.customer_email || !raw.shipping_order_id) {
        results.push({ order_id: raw.id, skipped: "missing_email_or_shipping_id" });
        continue;
      }

      let trackingCode = raw.tracking_code?.trim() || "";
      if (!trackingCode) {
        const fetched = await fetchTrackingFromME(raw.shipping_order_id, meToken);
        if (fetched) {
          trackingCode = fetched;
          await supabase.from("orders").update({ tracking_code: trackingCode }).eq("id", raw.id);
        }
      }

      if (!trackingCode) {
        results.push({ order_id: raw.id, skipped: "tracking_not_available_yet" });
        continue;
      }

      const service = raw.shipping_service_name || "Transportadora";
      const name = raw.customer_name || "cliente";
      const messageId = `order-tracking-${raw.id}`;

      try {
        await resend.emails.send({
          from: "Meeky <pedidos@meeky.com.br>",
          to: raw.customer_email,
          subject: "Seu Meeky F5 ANC Pro saiu para entrega! 📦",
          html: trackingEmailHtml(name, service, trackingCode),
        });
        await supabase.from("orders").update({ tracking_notified_at: new Date().toISOString() }).eq("id", raw.id);
        await logEmailSend(supabase, {
          messageId,
          templateName: "order-tracking",
          recipientEmail: raw.customer_email,
          status: "sent",
          metadata: { order_id: raw.id, tracking_code: trackingCode, service, via: "notify-tracking" },
        });
        results.push({ order_id: raw.id, sent: true, tracking_code: trackingCode });
      } catch (emailErr) {
        const msg = (emailErr as Error).message;
        await logEmailSend(supabase, {
          messageId,
          templateName: "order-tracking",
          recipientEmail: raw.customer_email,
          status: "failed",
          errorMessage: msg,
          metadata: { order_id: raw.id, tracking_code: trackingCode, via: "notify-tracking" },
        });
        results.push({ order_id: raw.id, sent: false, error: msg });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-tracking fatal:", err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
