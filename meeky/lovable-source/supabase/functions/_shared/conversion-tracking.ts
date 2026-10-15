// Server-side conversion tracking helpers:
//   - GA4 Measurement Protocol (`purchase` event)
//   - Meta Conversions API (`Purchase` event) with the same event_id used by the Pixel
//     client-side (external_reference / order UUID) to enable Meta's native deduplication.
//
// Both helpers are best-effort: falhas de rede/credenciais não devem quebrar o webhook.

type PurchasePayload = {
  transactionId: string;
  value: number;              // valor efetivamente cobrado (final_amount)
  currency: string;           // "BRL"
  quantity: number;
  couponCode?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  sku?: string;
  productName?: string;
  productPrice?: number;
  /** OpenAI Ads privacy-preserving click identifier captured from `?oppref=`. */
  oppref?: string | null;
};

// Hash SHA-256 hex (Meta CAPI exige PII hasheado)
const sha256Hex = async (input: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const normPhone = (raw: string) => raw.replace(/\D+/g, "");

export async function sendGa4Purchase(p: PurchasePayload): Promise<{ ok: boolean; skipped?: string; error?: string }> {
  const measurementId = Deno.env.get("GA4_MEASUREMENT_ID");
  const apiSecret = Deno.env.get("GA4_API_SECRET");
  if (!measurementId || !apiSecret) return { ok: false, skipped: "ga4_env_missing" };

  // client_id determinístico por pedido — GA4 exige um client_id, mas server-side não temos
  // o _ga cookie. Usar o transactionId garante que a linha do pedido não colide com sessões reais.
  const clientId = `srv.${p.transactionId}`;

  const body = {
    client_id: clientId,
    non_personalized_ads: false,
    events: [{
      name: "purchase",
      params: {
        transaction_id: p.transactionId,          // dedup nativo do relatório de e-commerce
        currency: p.currency,
        value: p.value,
        coupon: p.couponCode || "",
        items: [{
          item_id: p.sku || "MEEKY-F5-PRO-BLK",
          item_name: p.productName || "Headphone Meeky F5 ANC Pro",
          price: p.productPrice ?? 297,
          quantity: p.quantity,
        }],
      },
    }],
  };

  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn(`GA4 MP non-2xx: ${res.status} ${txt}`);
      return { ok: false, error: `ga4_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.warn("GA4 MP send failed:", e);
    return { ok: false, error: (e as Error).message };
  }
}

export async function sendMetaCapiPurchase(p: PurchasePayload): Promise<{ ok: boolean; skipped?: string; error?: string }> {
  const pixelId = Deno.env.get("META_PIXEL_ID");
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  const testCode = Deno.env.get("META_CAPI_TEST_EVENT_CODE"); // opcional (Events Manager → Test Events)
  if (!pixelId || !accessToken) return { ok: false, skipped: "meta_env_missing" };

  const userData: Record<string, unknown> = {};
  if (p.customerEmail) userData.em = [await sha256Hex(p.customerEmail)];
  if (p.customerPhone) {
    const digits = normPhone(p.customerPhone);
    if (digits) userData.ph = [await sha256Hex(digits)];
  }
  if (p.clientIp) userData.client_ip_address = p.clientIp;
  if (p.userAgent) userData.client_user_agent = p.userAgent;

  const event = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: p.transactionId,                    // dedup com o Pixel (mesmo eventID)
    action_source: "website",
    event_source_url: `${Deno.env.get("SITE_URL") || "https://meekyaudio.com.br"}/checkout/sucesso`,
    user_data: userData,
    custom_data: {
      currency: p.currency,
      value: p.value,
      content_type: "product",
      content_ids: [p.sku || "f5anc"],
      contents: [{ id: p.sku || "f5anc", quantity: p.quantity, item_price: p.productPrice ?? 297 }],
      order_id: p.transactionId,
    },
  };

  const body: Record<string, unknown> = { data: [event] };
  if (testCode) body.test_event_code = testCode;

  try {
    const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const respTxt = await res.text().catch(() => "");
    if (!res.ok) {
      console.warn(`Meta CAPI non-2xx: ${res.status} ${respTxt}`);
      return { ok: false, error: `meta_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.warn("Meta CAPI send failed:", e);
    return { ok: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// OpenAI Ads Conversions API — evento `order_created`
//
// Best-effort e NUNCA bloqueante: qualquer falha é apenas logada (sem API key,
// sem PII). O event id é determinístico (`order_<uuid>`) para que reenvios do
// webhook do Mercado Pago sejam deduplicados do lado da OpenAI.
// ---------------------------------------------------------------------------

const OPENAI_ADS_PIXEL_ID = "NM9Phga1JvFu2NYPWbDJUa";

export async function sendOpenAiOrderCreated(
  p: PurchasePayload,
): Promise<{ ok: boolean; skipped?: string; error?: string; status?: number }> {
  const apiKey = Deno.env.get("OPENAI_CONVERSIONS_API_KEY");
  if (!apiKey) return { ok: false, skipped: "openai_env_missing" };

  const siteUrl = Deno.env.get("SITE_URL") || "https://meekyaudio.com.br";
  const amountCents = Math.round(Number(p.value || 0) * 100);

  // `oppref` é campo de EVENTO (events[].oppref) na Conversions API da OpenAI —
  // opcional, só enviado quando capturamos o parâmetro na URL de entrada.
  const event: Record<string, unknown> = {
    id: `order_${p.transactionId}`,
    type: "order_created",
    timestamp_ms: Date.now(),
    source_url: `${siteUrl}/checkout/sucesso`,
    action_source: "web",
    data: {
      type: "contents",
      amount: amountCents,
      currency: p.currency || "BRL",
      contents: [{
        id: p.sku || "f5anc",
        name: p.productName || "Headphone Meeky F5 ANC Pro",
        content_type: "product",
        quantity: p.quantity,
      }],
    },
  };
  if (p.oppref) event.oppref = p.oppref;

  const body = {
    // Liberado para produção — eventos são processados de fato.
    validate_only: false,
    events: [event],
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://bzr.openai.com/v1/events?pid=${encodeURIComponent(OPENAI_ADS_PIXEL_ID)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    ).finally(() => clearTimeout(timer));

    if (!res.ok) {
      const txt = (await res.text().catch(() => "")).slice(0, 300);
      console.warn(`OpenAI Ads CAPI non-2xx: ${res.status} ${txt}`);
      return { ok: false, error: `openai_${res.status}`, status: res.status };
    }
    return { ok: true, status: res.status };
  } catch (e) {
    // Nunca logar a chave nem dados do cliente — só a mensagem do erro de rede.
    console.warn("OpenAI Ads CAPI send failed:", (e as Error).message);
    return { ok: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
// TikTok Events API 2.0 — evento `Purchase`
//
// Endpoint: POST https://business-api.tiktok.com/open_api/v1.3/event/track/
// Autenticação: header customizado `Access-Token` (NÃO é Bearer).
// PII (email/phone) sempre em SHA-256 hex de valor normalizado (trim+lowercase;
// telefone em E.164 com apenas dígitos e prefixo +).
// Best-effort: nunca bloqueia o webhook e nunca loga token nem PII.
// ---------------------------------------------------------------------------

const TIKTOK_PIXEL_CODE = "CR3RISJC77U222FMO130";

/** Normaliza telefone BR para E.164 (+55DDDNUMERO) antes do hash. */
function normalizePhoneE164(raw: string): string | null {
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.startsWith("55")) return `+${digits}`;
  if (digits.length >= 10 && digits.length <= 11) return `+55${digits}`;
  return `+${digits}`;
}

export async function sendTikTokPurchase(
  p: PurchasePayload & { ttclid?: string | null; ttp?: string | null },
): Promise<{ ok: boolean; skipped?: string; error?: string; status?: number; code?: number; message?: string }> {
  const accessToken = Deno.env.get("TIKTOK_EVENTS_API_ACCESS_TOKEN");
  if (!accessToken) return { ok: false, skipped: "tiktok_env_missing" };

  const testEventCode = Deno.env.get("TIKTOK_TEST_EVENT_CODE"); // opcional (Events Manager → Test Events)
  const siteUrl = Deno.env.get("SITE_URL") || "https://meekyaudio.com.br";

  const user: Record<string, unknown> = {};
  if (p.customerEmail) user.email = await sha256Hex(p.customerEmail);
  if (p.customerPhone) {
    const e164 = normalizePhoneE164(p.customerPhone);
    if (e164) user.phone = await sha256Hex(e164);
  }
  if (p.ttclid) user.ttclid = p.ttclid;
  if (p.ttp) user.ttp = p.ttp;
  if (p.clientIp) user.ip = p.clientIp;
  if (p.userAgent) user.user_agent = p.userAgent;

  const body: Record<string, unknown> = {
    event_source: "web",
    event_source_id: TIKTOK_PIXEL_CODE,
    data: [{
      event: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: `order_${p.transactionId}`,
      user,
      page: { url: `${siteUrl}/checkout/sucesso` },
      properties: {
        currency: p.currency || "BRL",
        value: Number(p.value || 0),
        order_id: p.transactionId,
        contents: [{
          content_id: p.sku || "MEEKY-F5-PRO-BLK",
          content_type: "product",
          content_name: p.productName || "Headphone Meeky F5 ANC Pro",
          quantity: p.quantity,
          price: p.productPrice ?? 297,
        }],
      },
    }],
  };
  if (testEventCode) body.test_event_code = testEventCode;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    const txt = (await res.text().catch(() => "")).slice(0, 300);
    let parsed: { code?: number; message?: string } = {};
    try { parsed = JSON.parse(txt); } catch { /* resposta não-JSON */ }

    if (!res.ok || (parsed.code !== undefined && parsed.code !== 0)) {
      console.warn(`TikTok Events API erro: http=${res.status} code=${parsed.code} msg=${parsed.message ?? txt}`);
      return { ok: false, error: `tiktok_${parsed.code ?? res.status}`, status: res.status, code: parsed.code, message: parsed.message };
    }
    return { ok: true, status: res.status, code: parsed.code, message: parsed.message };
  } catch (e) {
    console.warn("TikTok Events API send failed:", (e as Error).message);
    return { ok: false, error: (e as Error).message };
  }
}
