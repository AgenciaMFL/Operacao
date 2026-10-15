// Server-side upsert for abandoned_checkouts. The session_token is the
// client-generated capability; the edge function validates inputs and writes
// with the service role so anon RLS cannot be abused to tamper with rows.
import { createClient } from "npm:@supabase/supabase-js@2";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const waLinkFor = (phone: string | null): string | null => {
  const digits = (phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? `https://wa.me/55${digits}` : null;
};

interface AlertData {
  session_token: string;
  name: string | null;
  email: string;
  phone: string | null;
  product_id: string | null;
  quantity: number;
  coupon_code: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

// Envia um alerta interno (para o admin) na primeira vez que um carrinho
// abandonado tem dados de contato. Claim atômico via admin_alert_sent_at
// evita e-mails duplicados a cada onBlur do checkout.
async function sendAdminAlert(supabase: any, d: AlertData): Promise<void> {
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!adminEmail || !resendKey) {
    console.warn("[upsert-abandoned-checkout] ADMIN_EMAIL/RESEND_API_KEY ausente — alerta ignorado");
    return;
  }

  try {
    const { data: claimed, error: claimError } = await supabase
      .from("abandoned_checkouts")
      .update({
        admin_alert_sent_at: new Date().toISOString(),
        admin_alert_had_phone: !!d.phone,
      })
      .eq("session_token", d.session_token)
      .is("admin_alert_sent_at", null)
      .select("id")
      .maybeSingle();

    if (claimError) {
      console.error("[upsert-abandoned-checkout] claim de alerta falhou", claimError);
      return;
    }
    if (!claimed) return; // já alertado

    const waLink = waLinkFor(d.phone);
    const utm = [d.utm_source, d.utm_medium, d.utm_campaign].filter(Boolean).join(" / ") || "—";

    const { Resend } = await import("npm:resend");
    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from: "Meeky Alertas <pedidos@meeky.com.br>",
      to: adminEmail,
      replyTo: d.email,
      subject: `🛒 Carrinho abandonado — ${d.name || d.email}`,
      html: `
        <h2>Novo carrinho abandonado</h2>
        <p><strong>Nome:</strong> ${esc(d.name || "—")}</p>
        <p><strong>Telefone:</strong> ${esc(d.phone || "—")}${waLink ? ` — <a href="${waLink}">abrir no WhatsApp</a>` : ""}</p>
        <p><strong>E-mail:</strong> ${esc(d.email)}</p>
        <p><strong>Produto:</strong> ${esc(d.product_id || "f5anc")} × ${d.quantity}</p>
        <p><strong>Cupom:</strong> ${esc(d.coupon_code || "—")}</p>
        <p><strong>Origem:</strong> ${esc(utm)}</p>
        <p><strong>Quando:</strong> ${new Date().toISOString()}</p>
        <hr />
        ${
          d.phone
            ? ""
            : `<p><em>O telefone ainda não foi preenchido. Se o cliente informar o número, você recebe um e-mail de atualização automaticamente.</em></p>`
        }
        <p>O cliente ainda não finalizou o pagamento. O e-mail automático de recuperação sai depois de 60 minutos.</p>
      `,
    });

    if (sendError) {
      console.error("[upsert-abandoned-checkout] Resend falhou", sendError);
      // libera para nova tentativa no próximo evento
      await supabase
        .from("abandoned_checkouts")
        .update({ admin_alert_sent_at: null, admin_alert_had_phone: null })
        .eq("session_token", d.session_token);
      return;
    }

    console.log("[upsert-abandoned-checkout] alerta admin enviado", {
      session_token: d.session_token,
      had_phone: !!d.phone,
    });
  } catch (e) {
    console.error("[upsert-abandoned-checkout] alerta admin exceção", e);
  }
}

// Segundo e-mail, curto: o alerta original saiu sem telefone e o telefone
// chegou depois. Claim atômico via admin_alert_phone_update_sent_at.
async function sendPhoneUpdateAlert(
  supabase: any,
  d: { session_token: string; name: string | null; email: string; phone: string },
): Promise<boolean> {
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!adminEmail || !resendKey) return false;

  try {
    const { data: claimed, error: claimError } = await supabase
      .from("abandoned_checkouts")
      .update({ admin_alert_phone_update_sent_at: new Date().toISOString() })
      .eq("session_token", d.session_token)
      .is("admin_alert_phone_update_sent_at", null)
      .select("id")
      .maybeSingle();

    if (claimError) {
      console.error("[upsert-abandoned-checkout] claim de atualização falhou", claimError);
      return false;
    }
    if (!claimed) return false; // já atualizado

    const waLink = waLinkFor(d.phone);
    const { Resend } = await import("npm:resend");
    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from: "Meeky Alertas <pedidos@meeky.com.br>",
      to: adminEmail,
      replyTo: d.email,
      subject: `📞 Atualização: telefone do carrinho de ${d.name || d.email}`,
      html: `
        <h2>Telefone recebido</h2>
        <p>O alerta anterior deste carrinho saiu sem telefone. O cliente preencheu agora:</p>
        <p><strong>Nome:</strong> ${esc(d.name || "—")}</p>
        <p><strong>Telefone:</strong> ${esc(d.phone)}${waLink ? ` — <a href="${waLink}">abrir no WhatsApp</a>` : ""}</p>
        <p><strong>E-mail:</strong> ${esc(d.email)}</p>
      `,
    });

    if (sendError) {
      console.error("[upsert-abandoned-checkout] Resend (atualização) falhou", sendError);
      await supabase
        .from("abandoned_checkouts")
        .update({ admin_alert_phone_update_sent_at: null })
        .eq("session_token", d.session_token);
      return false;
    }

    console.log("[upsert-abandoned-checkout] atualização de telefone enviada", {
      session_token: d.session_token,
    });
    return true;
  } catch (e) {
    console.error("[upsert-abandoned-checkout] atualização exceção", e);
    return false;
  }
}

// Modo administrativo: reenvia a atualização de telefone para carrinhos que já
// têm telefone no banco mas cujo alerta original saiu incompleto.
async function runPhoneUpdateBackfill(supabase: any, sinceHours: number) {
  const since = new Date(Date.now() - sinceHours * 3600_000).toISOString();
  const { data, error } = await supabase
    .from("abandoned_checkouts")
    .select("session_token, name, email, phone, admin_alert_sent_at, admin_alert_had_phone, admin_alert_phone_update_sent_at")
    .gte("created_at", since)
    .not("admin_alert_sent_at", "is", null)
    .not("phone", "is", null)
    .is("admin_alert_phone_update_sent_at", null);

  if (error) throw new Error(error.message);

  const results: Array<{ email: string; sent: boolean }> = [];
  for (const row of data ?? []) {
    if (row.admin_alert_had_phone === true) continue;
    const sent = await sendPhoneUpdateAlert(supabase, {
      session_token: row.session_token,
      name: row.name,
      email: row.email,
      phone: row.phone,
    });
    results.push({ email: row.email, sent });
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Rota administrativa (não pública): backfill das atualizações de telefone.
  if (body?.mode === "phone_update_backfill") {
    const adminKey = Deno.env.get("REPROCESS_ADMIN_KEY");
    if (!adminKey || body?.admin_key !== adminKey) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let hours = Number(body?.since_hours);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 720) hours = 48;
    try {
      const results = await runPhoneUpdateBackfill(supabase, hours);
      return new Response(JSON.stringify({ ok: true, results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const limited = await enforceRateLimit(req, {
    functionName: "upsert-abandoned-checkout",
    maxRequests: 20,
    windowSeconds: 600,
    corsHeaders,
  });
  if (limited) return limited;

  try {
    const session_token = clean(body?.session_token, 128);
    const email = clean(body?.email, 255);
    if (!session_token || session_token.length < 8) {
      return new Response(JSON.stringify({ error: "invalid_session_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: "invalid_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = clean(body?.name, 120);
    const phone = clean(body?.phone, 40);
    const product_id = clean(body?.product_id, 60);
    const coupon_code = clean(body?.coupon_code, 60);
    const utm_source = clean(body?.utm_source, 100);
    const utm_medium = clean(body?.utm_medium, 100);
    const utm_campaign = clean(body?.utm_campaign, 100);
    const landing_referrer = clean(body?.landing_referrer, 500);
    let quantity = Number(body?.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) quantity = 1;
    quantity = Math.floor(quantity);

    // Only allow updating rows that are not already converted, and never touch
    // server-only fields (converted_order_id, recovery_email_sent_at).
    const { data: existing } = await supabase
      .from("abandoned_checkouts")
      .select(
        "id, converted_order_id, utm_source, utm_medium, utm_campaign, landing_referrer, admin_alert_sent_at, admin_alert_had_phone, admin_alert_phone_update_sent_at",
      )
      .eq("session_token", session_token)
      .maybeSingle();

    if (existing?.converted_order_id) {
      return new Response(JSON.stringify({ ok: true, skipped: "converted" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // First-touch attribution: never overwrite values already stored.
    const payload = {
      session_token,
      email,
      name,
      phone,
      product_id,
      quantity,
      coupon_code,
      utm_source: existing?.utm_source ?? utm_source,
      utm_medium: existing?.utm_medium ?? utm_medium,
      utm_campaign: existing?.utm_campaign ?? utm_campaign,
      landing_referrer: existing?.landing_referrer ?? landing_referrer,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("abandoned_checkouts")
      .upsert(payload, { onConflict: "session_token" });

    if (error) {
      console.error("[upsert-abandoned-checkout] failed", error);
      return new Response(JSON.stringify({ error: "write_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Caso (a)+(b)+(c): alerta original saiu sem telefone, o telefone chegou
    // agora e a atualização ainda não foi enviada para este carrinho.
    if (
      existing?.admin_alert_sent_at &&
      existing?.admin_alert_had_phone === false &&
      !existing?.admin_alert_phone_update_sent_at &&
      phone
    ) {
      await sendPhoneUpdateAlert(supabase, { session_token, name, email, phone });
    } else if (name || phone) {
      // Alerta interno para o admin (uma vez por carrinho), assim que houver
      // dados suficientes para contato rápido (e-mail + nome ou telefone).
      await sendAdminAlert(supabase, {
        session_token,
        name,
        email,
        phone,
        product_id,
        quantity,
        coupon_code,
        utm_source: payload.utm_source,
        utm_medium: payload.utm_medium,
        utm_campaign: payload.utm_campaign,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("[upsert-abandoned-checkout] unexpected", e);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
