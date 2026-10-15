// Envia e-mails de recuperação de carrinho abandonado.
//
// Motor de envio: Resend direto (mesmo padrão de notify-tracking e
// order-fulfillment). Não depende mais da infraestrutura nativa de e-mail
// da plataforma nem do domínio notify.meeky.com.br (não verificado), que
// fazia todos os envios falharem com "Emails disabled for this project".
//
// Modos:
//  - cron (default): linhas criadas entre 60min e 24h atrás, não convertidas
//    e sem recovery_email_sent_at.
//  - { test_email: "..." }: envia 1 e-mail de teste.
//  - { mode: "retro", dry_run: true|false, limit }: reenvio retroativo para
//    todos os não convertidos que nunca receberam um envio com status 'sent'.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend";
import { logEmailSend } from "../_shared/email-log.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_URL = Deno.env.get("SITE_URL") || "https://meeky.com.br";
const FROM = "Meeky <pedidos@meeky.com.br>";
const SUBJECT = "Você deixou um Meeky F5 ANC Pro no carrinho";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function abandonedHtml(name: string | null, resumeUrl: string): string {
  const hello = name && name.trim() ? `Olá, ${esc(name.trim().split(" ")[0])}.` : "Olá.";
  return `
  <div style="background-color:#ffffff;font-family:'Inter',Arial,sans-serif;padding:0;margin:0;">
    <div style="max-width:560px;margin:0 auto;padding:30px 25px;">
      <h1 style="font-size:24px;font-weight:700;color:#141414;margin:0 0 16px;">Ainda dá tempo de finalizar</h1>
      <p style="font-size:14px;color:#444444;line-height:1.6;margin:0 0 16px;">
        ${hello} Você começou a compra do <strong>Headphone Meeky F5 ANC Pro</strong> mas não concluiu o pagamento.
      </p>
      <p style="font-size:14px;color:#444444;line-height:1.6;margin:0 0 16px;">
        Se quiser, é só continuar de onde parou — seus dados ainda estão lá.
      </p>
      <div style="text-align:center;margin:28px 0 12px;">
        <a href="${esc(resumeUrl)}" style="background-color:#141414;color:#faf8f5;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:1px;display:inline-block;">
          RETOMAR MINHA COMPRA
        </a>
      </div>
      <p style="font-size:13px;color:#777777;line-height:1.6;margin:16px 0 0;">
        Se a página não abrir com seus dados preenchidos, você ainda pode finalizar diretamente em
        <a href="https://meeky.com.br/checkout" style="color:#141414;text-decoration:underline;">meeky.com.br/checkout</a>.
      </p>
      <hr style="border:none;border-top:1px solid #e8e4de;margin:28px 0 20px;" />
      <p style="font-size:12px;color:#666666;text-align:center;margin:0 0 12px;">
        <a href="https://meeky.com.br/faq" style="color:#141414;text-decoration:underline;">FAQ</a> •
        <a href="https://meeky.com.br/politica-de-devolucao" style="color:#141414;text-decoration:underline;">Política de Devolução</a>
      </p>
      <p style="font-size:13px;color:#999999;text-align:center;margin:0 0 4px;">
        Meeky® — Tecnologia e Áudio para Máxima Produtividade
      </p>
      <p style="font-size:11px;color:#bbbbbb;text-align:center;margin:0;">
        Barganha Mix LTDA • contato@meeky.com.br
      </p>
    </div>
  </div>`;
}

interface Row {
  id: string;
  session_token: string;
  email: string | null;
  name: string | null;
  quantity: number | null;
  coupon_code: string | null;
  converted_order_id?: string | null;
}

const FAILED_STATUSES = ["expired", "rejected", "cancelled"];

// Um carrinho só deixa de ser elegível quando o pedido vinculado foi aprovado.
// Pedidos expirados/rejeitados/cancelados voltam a contar como abandono.
async function filterUnconverted(supabase: any, rows: Row[]): Promise<Row[]> {
  const ids = [...new Set(rows.map((r) => r.converted_order_id).filter(Boolean))] as string[];
  if (ids.length === 0) return rows.filter((r) => !r.converted_order_id);
  const { data, error } = await supabase
    .from("orders")
    .select("id, payment_status")
    .in("id", ids);
  if (error) throw error;
  const statusById = new Map((data ?? []).map((o: { id: string; payment_status: string }) => [o.id, o.payment_status]));
  return rows.filter((r) => {
    if (!r.converted_order_id) return true;
    const st = statusById.get(r.converted_order_id);
    return !st || FAILED_STATUSES.includes(String(st));
  });
}

function resumeUrlFor(row: Row): string {
  const params = new URLSearchParams();
  params.set("resume", row.session_token);
  if (row.quantity && row.quantity > 1) params.set("qty", String(row.quantity));
  if (row.coupon_code) params.set("coupon", row.coupon_code);
  return `${SITE_URL}/checkout?${params.toString()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(resendKey);

    let body: { test_email?: string; mode?: string; dry_run?: boolean; limit?: number; exclude_emails?: string[] } = {};
    try { body = await req.json(); } catch { /* cron */ }

    // ---------- modo teste: 1 envio real ----------
    if (body.test_email) {
      const email = String(body.test_email).trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return json({ error: "invalid email" }, 400);
      const messageId = `abandoned-test-${crypto.randomUUID()}`;
      try {
        const r = await resend.emails.send({
          from: FROM,
          to: email,
          subject: SUBJECT,
          html: abandonedHtml("Teste", `${SITE_URL}/checkout`),
        });
        if ((r as { error?: { message?: string } }).error) {
          throw new Error((r as { error: { message?: string } }).error.message || "resend error");
        }
        await logEmailSend(supabase, {
          messageId,
          templateName: "abandoned-checkout",
          recipientEmail: email,
          status: "sent",
          metadata: { via: "send-abandoned-checkout-emails", test: true },
        });
        return json({ ok: true, test: true, resend_id: (r as { data?: { id?: string } }).data?.id });
      } catch (e) {
        const msg = (e as Error).message;
        await logEmailSend(supabase, {
          messageId,
          templateName: "abandoned-checkout",
          recipientEmail: email,
          status: "failed",
          errorMessage: msg,
          metadata: { via: "send-abandoned-checkout-emails", test: true },
        });
        return json({ ok: false, error: msg }, 500);
      }
    }

    const retro = body.mode === "retro";
    let rows: Row[] = [];

    if (retro) {
      const { data, error } = await supabase
        .from("abandoned_checkouts")
        .select("id, session_token, email, name, quantity, coupon_code, converted_order_id")
        .not("email", "is", null)
        .order("created_at", { ascending: false })
        .limit(body.limit ?? 500);
      if (error) throw error;
      rows = await filterUnconverted(supabase, (data ?? []) as Row[]);

      // Exclui quem já recebeu um e-mail de carrinho com status 'sent'.
      const { data: sentLogs, error: logErr } = await supabase
        .from("email_send_log")
        .select("recipient_email, message_id")
        .eq("template_name", "abandoned-checkout")
        .eq("status", "sent");
      if (logErr) throw logErr;
      const sentEmails = new Set((sentLogs ?? []).map((l) => String(l.recipient_email).toLowerCase()));
      const sentIds = new Set((sentLogs ?? []).map((l) => String(l.message_id)));

      const excluded = new Set(
        (body.exclude_emails ?? []).map((e) => String(e).trim().toLowerCase()),
      );

      const seen = new Set<string>();
      rows = rows.filter((r) => {
        const email = String(r.email ?? "").trim().toLowerCase();
        if (!EMAIL_RE.test(email)) return false;
        if (excluded.has(email)) return false;
        if (sentEmails.has(email) || sentIds.has(`abandoned-${r.id}`)) return false;
        if (seen.has(email)) return false; // 1 e-mail por destinatário
        seen.add(email);
        return true;
      });

      if (body.dry_run) {
        return json({
          dry_run: true,
          emails_to_send: rows.length,
          distinct_recipients: new Set(rows.map((r) => String(r.email).toLowerCase())).size,
          recipients: rows.map((r) => String(r.email).toLowerCase()),
        });
      }
    } else {
      const now = Date.now();
      const olderThan = new Date(now - 60 * 60 * 1000).toISOString();
      const newerThan = new Date(now - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("abandoned_checkouts")
        .select("id, session_token, email, name, quantity, coupon_code, converted_order_id")
        .is("recovery_email_sent_at", null)
        .not("email", "is", null)
        .lte("created_at", olderThan)
        .gte("created_at", newerThan)
        .limit(200);
      if (error) throw error;
      rows = await filterUnconverted(supabase, (data ?? []) as Row[]);
    }

    if (rows.length === 0) return json({ processed: 0, sent: 0, failed: 0 });

    let sent = 0;
    let failed = 0;
    const results: Array<Record<string, unknown>> = [];

    for (const row of rows) {
      const email = String(row.email ?? "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) continue;
      const messageId = `abandoned-${row.id}`;

      try {
        const r = await resend.emails.send({
          from: FROM,
          to: email,
          subject: SUBJECT,
          html: abandonedHtml(row.name, resumeUrlFor(row)),
        });
        if ((r as { error?: { message?: string } }).error) {
          throw new Error((r as { error: { message?: string } }).error.message || "resend error");
        }
        await supabase
          .from("abandoned_checkouts")
          .update({ recovery_email_sent_at: new Date().toISOString() })
          .eq("id", row.id);
        await logEmailSend(supabase, {
          messageId,
          templateName: "abandoned-checkout",
          recipientEmail: email,
          status: "sent",
          metadata: { via: "send-abandoned-checkout-emails", retro, checkout_id: row.id },
        });
        sent++;
        results.push({ id: row.id, email, sent: true });
      } catch (e) {
        const msg = (e as Error).message;
        failed++;
        await logEmailSend(supabase, {
          messageId,
          templateName: "abandoned-checkout",
          recipientEmail: email,
          status: "failed",
          errorMessage: msg,
          metadata: { via: "send-abandoned-checkout-emails", retro, checkout_id: row.id },
        });
        results.push({ id: row.id, email, sent: false, error: msg });
      }
    }

    return json({ processed: rows.length, sent, failed, results });
  } catch (e) {
    console.error("[abandoned-checkout] unexpected", e);
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
