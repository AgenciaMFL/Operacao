import { supabase } from "@/integrations/supabase/client";

/**
 * Configuração de evento da página /vip.
 * Os eventos ficam na tabela `vip_events` (leitura pública dos ativos), selecionados
 * pelo `utm_campaign` da URL. Assim dá para cadastrar um evento novo sem deploy.
 */
export type VipEvent = {
  campaign_key: string;
  event_name: string;
  event_dates: string;
  event_location: string;
  badge_emoji: string;
  offer_product: string;
  offer_price_label: string;
  offer_extra: string;
  social_cause: string | null;
  instagram_handle: string;
  instagram_url: string;
  lead_source: string;
};

/** Usado enquanto carrega, e como rede de segurança se o banco não responder. */
export const FALLBACK_VIP_EVENT: VipEvent = {
  campaign_key: "racevalley2026",
  event_name: "Race Valley",
  event_dates: "12 e 13 de setembro de 2026",
  event_location: "Shopping Vale Sul, São José dos Campos",
  badge_emoji: "🏁",
  offer_product: "Meeky F5 ANC Pro",
  offer_price_label: "R$297 no evento",
  offer_extra: "Frete grátis",
  social_cause: null,
  instagram_handle: "meeky.br",
  instagram_url: "https://instagram.com/meeky.br",
  lead_source: "racevalley_2026",
};

const FIELDS =
  "campaign_key, event_name, event_dates, event_location, badge_emoji, offer_product, offer_price_label, offer_extra, social_cause, instagram_handle, instagram_url, lead_source";

/**
 * Busca o evento correspondente ao utm_campaign. Sem campanha (ou campanha
 * desconhecida) cai no evento marcado como padrão e, por fim, no fallback local.
 */
export async function loadVipEvent(campaign?: string | null): Promise<VipEvent> {
  try {
    if (campaign) {
      const { data } = await supabase
        .from("vip_events")
        .select(FIELDS)
        .eq("campaign_key", campaign.trim().toLowerCase())
        .eq("active", true)
        .maybeSingle();
      if (data) return data as VipEvent;
    }

    const { data: fallback } = await supabase
      .from("vip_events")
      .select(FIELDS)
      .eq("active", true)
      .eq("is_default", true)
      .maybeSingle();
    if (fallback) return fallback as VipEvent;
  } catch {
    // silencioso: usa o fallback local
  }
  return FALLBACK_VIP_EVENT;
}

/** Linha "Nome · datas · local" usada no selo do topo. */
export function eventBadgeLabel(ev: VipEvent) {
  return `${ev.badge_emoji} ${ev.event_name} · ${ev.event_dates} · ${ev.event_location}`;
}

/** Linha da oferta, incluindo a causa social quando o evento tiver uma. */
export function eventOfferLabel(ev: VipEvent) {
  return [ev.offer_product, ev.offer_price_label, ev.offer_extra, ev.social_cause]
    .filter(Boolean)
    .join(" · ");
}
