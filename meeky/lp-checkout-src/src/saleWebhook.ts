// Avisa o GHL (Inbound Webhook) quando uma venda é aprovada no checkout do site da LP.
// No GHL, o webhook dispara a automação "compra realizada": para a IA e passa o contato ao pós-venda.

const SALE_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/FH0sUXnmyw1xXPhCwTSA/webhook-trigger/708c79c7-ce13-4112-9ca9-294793c8095a";

const BUYER_KEY = "meeky_lp_buyer";
const SENT_PREFIX = "meeky_lp_sale_sent_";

export type Buyer = {
  name: string;
  email: string;
  phone: string;
  product: string;
  product_key: string;
  sku: string;
  quantity: number;
  unit_price: number;
  shipping: number;
  total: number;
  coupon: string | null;
  payment_method: string | null;
  city: string;
  state: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

// Telefone no formato internacional, como o GHL guarda (+55 DDD número)
const e164 = (v: string) => {
  const d = (v || "").replace(/\D/g, "");
  if (!d) return "";
  return d.length > 11 && d.startsWith("55") ? `+${d}` : `+55${d}`;
};

export function saveBuyer(b: Buyer) {
  try { sessionStorage.setItem(BUYER_KEY, JSON.stringify(b)); } catch { /* ignore */ }
}

function loadBuyer(): Buyer | null {
  try { const raw = sessionStorage.getItem(BUYER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function alreadySent(paymentId: string) {
  try { return localStorage.getItem(SENT_PREFIX + paymentId) === "1"; } catch { return false; }
}

function markSent(paymentId: string) {
  try { localStorage.setItem(SENT_PREFIX + paymentId, "1"); } catch { /* ignore */ }
}

// Envia uma única vez por pagamento aprovado (não repete se a pessoa recarregar a página)
export async function sendSale(paymentId: string | null, orderId?: string | null) {
  if (!paymentId || alreadySent(paymentId)) return;
  const b = loadBuyer();
  if (!b || !b.email) return;
  markSent(paymentId);
  const payload = {
    event: "compra_realizada",
    status: "approved",
    payment_id: paymentId,
    order_id: orderId || null,
    name: b.name,
    first_name: (b.name || "").trim().split(/\s+/)[0] || "",
    email: b.email,
    phone: e164(b.phone),
    product: b.product,
    product_key: b.product_key,
    sku: b.sku,
    quantity: b.quantity,
    unit_price: b.unit_price,
    shipping: b.shipping,
    total: b.total,
    coupon: b.coupon,
    payment_method: b.payment_method,
    city: b.city,
    state: b.state,
    utm_source: b.utm_source,
    utm_medium: b.utm_medium,
    utm_campaign: b.utm_campaign,
    source: "meeky.com.br/lp",
    purchased_at: new Date().toISOString(),
  };
  try {
    await fetch(SALE_WEBHOOK_URL, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[sale-webhook] falha ao avisar o GHL", err);
    try { localStorage.removeItem(SENT_PREFIX + paymentId); } catch { /* ignore */ }
  }
}
