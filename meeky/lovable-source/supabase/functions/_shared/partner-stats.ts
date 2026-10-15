// Lógica compartilhada de cálculo de métricas do parceiro.
// Usada pela edge function admin-coupons (action=partner_stats) e pela
// edge function pública partner-stats (acesso via token).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export const PRODUCT_PRICE = 269; // valor do produto após cupom (sem frete)

export function calcCommission(salesCount: number): { rate: number; perSale: number; total: number; tierLabel: string } {
  if (salesCount <= 0) return { rate: 0, perSale: 0, total: 0, tierLabel: "10% fixo" };
  const rate = 0.10;
  const tierLabel = "10% fixo";
  const perSale = Math.round(rate * PRODUCT_PRICE * 100) / 100;
  const total = Math.round(perSale * salesCount * 100) / 100;
  return { rate, perSale, total, tierLabel };
}

export function nextTier(_salesCount: number): { nextSales: number | null; nextRate: number | null; nextLabel: string | null } {
  return { nextSales: null, nextRate: null, nextLabel: null };
}


export interface PartnerStatsResult {
  coupon: any;
  partnership: { startedAt: string | null; daysActive: number };
  revenueBlock: {
    revenueMonth: number;
    revenueWoW: { current: number; previous: number; deltaPct: number | null };
    approvedCount: number;
    pendingCount: number;
    conversionRate: number; // approved / clicks
    avgTicket: number;
  };
  trafficBlock: {
    clicks: number;
    uniqueVisitors: number;
    clickToCouponRate: number; // approved / clicks (mesma lógica que pediram)
    bestDay: { date: string | null; sales: number };
  };
  goalBlock: {
    salesCount: number;
    revenue: number;
    currentTier: string;
    currentRate: number;
    perSale: number;
    commission: number;
    nextTier: string | null;
    nextRate: number | null;
    salesToNext: number | null;
    revenueToNext: number | null;
  };
  funnelBlock: {
    clicks: number;
    uniqueVisitors: number;
    couponUses: number;
    approvedOrders: number;
  };
  ranking: { position: number; name: string; revenue: number; isMe: boolean }[];
  orders: { id: string; created_at: string; product_value: number; shipping_cost: number; status: string }[];
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

export async function buildPartnerStats(supabaseUrl: string, supabaseServiceKey: string, couponCode: string): Promise<PartnerStatsResult | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", couponCode)
    .maybeSingle();

  if (!coupon) return null;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Pedidos do mês com este cupom (todos status p/ aprovado vs pendente)
  const { data: monthOrders } = await supabase
    .from("orders")
    .select("id, created_at, total_amount, shipping_cost, payment_status, quantity")
    .eq("coupon_code", couponCode)
    .gte("created_at", monthStart.toISOString())
    .lt("created_at", monthEnd.toISOString())
    .order("created_at", { ascending: false });

  const approved = (monthOrders || []).filter(o => o.payment_status === "approved");
  const pending = (monthOrders || []).filter(o => o.payment_status === "pending");

  // Receita = nº de pedidos aprovados × R$269 (regra fixa do parceiro)
  const revenueMonth = approved.length * PRODUCT_PRICE;

  // Variação semana anterior (últimos 7 dias vs 7 anteriores)
  const week1Start = new Date(now); week1Start.setDate(now.getDate() - 7);
  const week2Start = new Date(now); week2Start.setDate(now.getDate() - 14);
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("created_at, payment_status")
    .eq("coupon_code", couponCode)
    .eq("payment_status", "approved")
    .gte("created_at", week2Start.toISOString());
  const currentWeekCount = (recentOrders || []).filter(o => new Date(o.created_at) >= week1Start).length;
  const prevWeekCount = (recentOrders || []).filter(o => {
    const d = new Date(o.created_at);
    return d >= week2Start && d < week1Start;
  }).length;
  const currentWeekRevenue = currentWeekCount * PRODUCT_PRICE;
  const prevWeekRevenue = prevWeekCount * PRODUCT_PRICE;
  const deltaPct = prevWeekRevenue > 0
    ? Math.round(((currentWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 1000) / 10
    : (currentWeekRevenue > 0 ? null : 0);

  // Cliques (somatório do mês via partner_link_events)
  const { data: monthEvents } = await supabase
    .from("partner_link_events")
    .select("session_id, created_at")
    .eq("coupon_code", couponCode)
    .gte("created_at", monthStart.toISOString())
    .lt("created_at", monthEnd.toISOString());

  const clicksMonth = (monthEvents || []).length;
  const uniqueSessions = new Set((monthEvents || []).map(e => e.session_id).filter(Boolean));
  const uniqueVisitors = uniqueSessions.size;

  // Fallback: se ainda não há eventos (tracking novo), usa contador legado
  const { data: link } = await supabase
    .from("partner_links")
    .select("clicks, created_at")
    .eq("coupon_code", couponCode)
    .maybeSingle();
  const clicksDisplay = clicksMonth > 0 ? clicksMonth : (link?.clicks || 0);

  const conversionRate = clicksDisplay > 0 ? Math.round((approved.length / clicksDisplay) * 1000) / 10 : 0;
  const clickToCouponRate = conversionRate;

  // Melhor dia (mais vendas aprovadas no mês)
  const dayBuckets: Record<string, number> = {};
  approved.forEach(o => {
    const day = new Date(o.created_at).toISOString().slice(0, 10);
    dayBuckets[day] = (dayBuckets[day] || 0) + 1;
  });
  let bestDay: { date: string | null; sales: number } = { date: null, sales: 0 };
  Object.entries(dayBuckets).forEach(([d, n]) => {
    if (n > bestDay.sales) bestDay = { date: d, sales: n };
  });

  const avgTicket = approved.length > 0 ? PRODUCT_PRICE : 0;

  // Comissão / faixa
  const commission = calcCommission(approved.length);
  const nt = nextTier(approved.length);
  const salesToNext = nt.nextSales ? Math.max(0, nt.nextSales - approved.length) : null;
  const revenueToNext = salesToNext !== null ? salesToNext * PRODUCT_PRICE : null;

  // Parceria (data início e dias ativos)
  const startedAt = coupon.created_at || null;
  const daysActive = startedAt
    ? Math.max(1, Math.floor((now.getTime() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Ranking (todos os cupons no mês — apenas posição/nome/receita)
  const { data: allCoupons } = await supabase.from("coupons").select("code, partner_name");
  const { data: allMonthApproved } = await supabase
    .from("orders")
    .select("coupon_code")
    .eq("payment_status", "approved")
    .not("coupon_code", "is", null)
    .neq("coupon_code", "")
    .gte("created_at", monthStart.toISOString())
    .lt("created_at", monthEnd.toISOString());

  const countByCoupon: Record<string, number> = {};
  (allMonthApproved || []).forEach(o => {
    if (!o.coupon_code) return;
    countByCoupon[o.coupon_code] = (countByCoupon[o.coupon_code] || 0) + 1;
  });

  const ranking = (allCoupons || [])
    .map(c => ({
      code: c.code,
      name: c.partner_name,
      sales: countByCoupon[c.code] || 0,
      revenue: (countByCoupon[c.code] || 0) * PRODUCT_PRICE,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((r, idx) => ({
      position: idx + 1,
      name: r.name,
      revenue: r.revenue,
      isMe: r.code === couponCode,
    }));

  const ordersList = (monthOrders || []).map(o => ({
    id: o.id,
    created_at: o.created_at,
    product_value: PRODUCT_PRICE * (o.quantity || 1),
    shipping_cost: Number(o.shipping_cost || 0),
    status: o.payment_status,
  }));

  return {
    coupon: { code: coupon.code, partner_name: coupon.partner_name, active: coupon.active },
    partnership: { startedAt, daysActive },
    revenueBlock: {
      revenueMonth,
      revenueWoW: { current: currentWeekRevenue, previous: prevWeekRevenue, deltaPct },
      approvedCount: approved.length,
      pendingCount: pending.length,
      conversionRate,
      avgTicket,
    },
    trafficBlock: {
      clicks: clicksDisplay,
      uniqueVisitors,
      clickToCouponRate,
      bestDay,
    },
    goalBlock: {
      salesCount: approved.length,
      revenue: revenueMonth,
      currentTier: commission.tierLabel,
      currentRate: commission.rate,
      perSale: commission.perSale,
      commission: commission.total,
      nextTier: nt.nextLabel,
      nextRate: nt.nextRate,
      salesToNext,
      revenueToNext,
    },
    funnelBlock: {
      clicks: clicksDisplay,
      uniqueVisitors: uniqueVisitors > 0 ? uniqueVisitors : Math.round(clicksDisplay * 0.8),
      couponUses: approved.length + pending.length,
      approvedOrders: approved.length,
    },
    ranking,
    orders: ordersList,
  };
}
