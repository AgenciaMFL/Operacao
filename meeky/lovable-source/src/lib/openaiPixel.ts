// OpenAI Ads Pixel (oaiq) helper.
//
// O SDK é carregado uma única vez em index.html dentro de `__loadAdsTags`,
// ou seja, apenas depois que o usuário aceita a categoria de publicidade
// (mesmo gate do Meta Pixel). Nunca é recarregado em mudanças de rota do SPA.
//
// Eventos disparados antes do consentimento ficam em fila (`__oaiqPending`) e
// são reenviados quando/se o consentimento for concedido; se o usuário recusar,
// nada é enviado.

declare global {
  interface Window {
    oaiq?: (...args: unknown[]) => void;
    __oaiqPending?: Array<[string, Record<string, unknown>]>;
  }
}

export type OaiqEvent = "page_viewed" | "contents_viewed" | "checkout_started" | "items_added";

export function oaiqTrack(event: OaiqEvent, data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.oaiq === "function") {
      window.oaiq("measure", event, data);
    } else {
      window.__oaiqPending = window.__oaiqPending || [];
      if (window.__oaiqPending.length < 20) window.__oaiqPending.push([event, data]);
    }
  } catch {
    /* tracking nunca pode quebrar a página */
  }
}

export const OAIQ_SKU = "MEEKY-F5-PRO-BLK";
export const OAIQ_PRODUCT_NAME = "Headphone Meeky F5 ANC Pro";

export function oaiqContents(quantity: number) {
  return [{
    id: OAIQ_SKU,
    name: OAIQ_PRODUCT_NAME,
    content_type: "product",
    quantity,
  }];
}
