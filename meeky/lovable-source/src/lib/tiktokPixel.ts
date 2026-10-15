// TikTok Pixel (ttq) helper.
//
// O SDK é carregado uma única vez em index.html dentro de `__loadAdsTags`,
// ou seja, apenas depois que o usuário aceita a categoria de publicidade
// (mesmo gate do Meta Pixel e do OpenAI Pixel). Nunca é recarregado em
// mudanças de rota do SPA.
//
// Se o consentimento não foi dado, `window.ttq` não existe e nada é enviado.
//
// Escopo atual: apenas page view. Eventos de funil/conversão (AddToCart,
// InitiateCheckout, CompletePayment) são uma segunda etapa separada.

declare global {
  interface Window {
    ttq?: { page: (...args: unknown[]) => void; track: (...args: unknown[]) => void };
    __ttqLoadedAt?: number;
  }
}

/** Dispara ttq.page() em navegações do SPA, evitando duplicar o page view
 *  inicial que o próprio snippet já dispara ao carregar. */
export function ttqPage() {
  if (typeof window === "undefined") return;
  try {
    const ttq = window.ttq;
    if (!ttq || typeof ttq.page !== "function") return;
    const loadedAt = window.__ttqLoadedAt || 0;
    if (Date.now() - loadedAt < 3000) return; // snippet acabou de disparar page()
    ttq.page();
  } catch {
    /* tracking nunca pode quebrar a página */
  }
}

// ===== Eventos de funil (Pixel / navegador) =====
//
// Só disparam se o SDK existir (window.ttq), ou seja, apenas após o
// consentimento de publicidade. Cada evento leva um `event_id` estável por
// sessão + tipo de evento, para permitir deduplicação futura caso os mesmos
// eventos passem a ser enviados também pela Events API (server-side).

export const TT_SKU = "MEEKY-F5-PRO-BLK";
export const TT_PRODUCT_NAME = "Headphone Meeky F5 ANC Pro";

/** ID determinístico por (sessão, evento) — persistido em sessionStorage. */
export function ttqEventId(event: string): string {
  const fallback = `${event}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  if (typeof window === "undefined") return fallback;
  const key = `ttq_eid_${event}`;
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = (crypto?.randomUUID?.() ?? fallback);
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return fallback;
  }
}

function ttqTrack(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const ttq = window.ttq;
    if (!ttq || typeof ttq.track !== "function") return; // sem consentimento → nada
    ttq.track(event, params, { event_id: ttqEventId(event) });
  } catch {
    /* tracking nunca pode quebrar a página */
  }
}

function contents(quantity: number, price: number) {
  return [{
    content_id: TT_SKU,
    content_type: "product",
    content_name: TT_PRODUCT_NAME,
    quantity,
    price,
  }];
}

/** Página de produto. */
export function ttqViewContent(price: number, quantity = 1) {
  ttqTrack("ViewContent", {
    contents: contents(quantity, price),
    content_type: "product",
    content_id: TT_SKU,
    content_name: TT_PRODUCT_NAME,
    value: +(price * quantity).toFixed(2),
    currency: "BRL",
  });
}

/** Início do checkout. */
export function ttqInitiateCheckout(price: number, quantity = 1) {
  ttqTrack("InitiateCheckout", {
    contents: contents(quantity, price),
    content_type: "product",
    content_id: TT_SKU,
    content_name: TT_PRODUCT_NAME,
    value: +(price * quantity).toFixed(2),
    currency: "BRL",
  });
}

