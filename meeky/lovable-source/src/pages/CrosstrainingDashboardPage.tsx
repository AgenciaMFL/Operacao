import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  DollarSign,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Target,
  MapPin,
  QrCode,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import SectionHeading from "@/components/shared/SectionHeading";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { QR_CODES } from "@/lib/campaignTracking";

// ============================================================
// CONFIG — alinhado com /crosstraining
// ============================================================
const CAMPAIGN_COUPON = "CROSSTRAINING2026";
const CAMPAIGN_UTM = "crosstraining2026";
const PRODUCT_PRICE = 297;
const DONATION_PERCENT = 7;
const DONATION_GOAL = 5000; // R$ — meta a confirmar com instituição
const INSTITUICAO_NOME = "Instituto Fortalecendo Pessoas (IFP)";
const INSTITUICAO_CNPJ = "[CNPJ]";
const EVENT_DAY = "2026-06-07"; // data principal do evento
const PAGE_SIZE = 20;
const POLL_MS = 30_000;

interface OrderRow {
  id: string;
  created_at: string;
  total_amount: number;
  quantity: number | null;
  shipping_city: string | null;
  shipping_state: string | null;
  utm_medium: string | null;
  utm_source: string | null;
}


interface QrStat { qr_id: string; scans: number; conversions: number }
interface DashboardStats {
  visits: number;
  cta_clicks: number;
  begin_checkout: number;
  qr_stats: QrStat[];
}

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const refShort = (id: string) => `#${id.replace(/-/g, "").slice(-4).toUpperCase()}`;

const CrosstrainingDashboardPage = () => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ visits: 0, cta_clicks: 0, begin_checkout: 0, qr_stats: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      const ordersQ = supabase
        .from("orders")
        .select("id, created_at, total_amount, quantity, shipping_city, shipping_state, utm_medium, utm_source")
        .eq("coupon_code", CAMPAIGN_COUPON)
        .eq("payment_status", "approved")
        .order("created_at", { ascending: false })
        .limit(1000);

      const statsQ = supabase.rpc("get_crosstraining_dashboard_stats");

      const [oRes, sRes] = await Promise.all([ordersQ, statsQ]);

      if (cancelled) return;
      if (oRes.data) setRows(oRes.data as OrderRow[]);
      if (sRes.data) setStats(sRes.data as unknown as DashboardStats);
      setLastSync(new Date());
      setLoading(false);
    }

    fetchAll();
    const id = setInterval(fetchAll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // ============ MÉTRICAS ============
  const metrics = useMemo(() => {
    const units = rows.reduce((acc, r) => acc + (r.quantity ?? 1), 0);
    const revenue = units * PRODUCT_PRICE;
    const donated = (revenue * DONATION_PERCENT) / 100;
    const lastSale = rows[0]?.created_at ?? null;
    return { units, revenue, donated, lastSale };
  }, [rows]);

  // Meta (R$)
  const goalPercent = Math.min(100, (metrics.donated / DONATION_GOAL) * 100);

  // ============ MAPA DE CALOR POR HORA ============
  const hourlyData = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}h`, vendas: 0 }));
    for (const r of rows) {
      const h = new Date(r.created_at).getHours();
      buckets[h].vendas += r.quantity ?? 1;
    }
    return buckets;
  }, [rows]);

  // ============ FUNIL ============
  const funnel = useMemo(() => {
    const purchases = rows.length;
    const steps = [
      { label: "Acessos à página", value: stats.visits, icon: Activity },
      { label: "Cliques no CTA", value: stats.cta_clicks, icon: Target },
      { label: "Iniciaram checkout", value: stats.begin_checkout, icon: ShoppingBag },
      { label: "Compras aprovadas", value: purchases, icon: Heart },
    ];
    return steps;
  }, [stats, rows]);

  // ============ QR CODES ============
  const qrStats = useMemo(() => {
    return QR_CODES.map((qr) => {
      const stat = stats.qr_stats.find((s) => s.qr_id === qr.qr_id);
      const scans = stat?.scans ?? 0;
      const conversions = stat?.conversions ?? 0;
      const rate = scans > 0 ? (conversions / scans) * 100 : 0;
      return { ...qr, scans, conversions, rate };
    });
  }, [stats]);

  // ============ GEO (ESTADOS) ============
  const stateRanking = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const uf = (r.shipping_state || "—").toUpperCase().slice(0, 2);
      map.set(uf, (map.get(uf) ?? 0) + (r.quantity ?? 1));
    }
    return Array.from(map.entries())
      .map(([uf, total]) => ({ uf, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [rows]);

  const maxStateValue = Math.max(1, ...stateRanking.map((s) => s.total));

  // ============ VENDAS POR CANAL (utm_medium) ============
  const CHANNEL_MAP: Record<string, string> = {
    stories: "Stories",
    story: "Stories",
    reels: "Reels",
    reel: "Reels",
    feed: "Feed",
    bio: "Bio",
    link_bio: "Bio",
    linkbio: "Bio",
    qrcode: "QR Code",
    qr: "QR Code",
    qr_code: "QR Code",
    flyer: "QR Code",
  };
  const CHANNEL_ORDER = ["Stories", "Reels", "Feed", "Bio", "QR Code", "Outros"];

  const channelStats = useMemo(() => {
    const map = new Map<string, { units: number; revenue: number }>();
    for (const r of rows) {
      const raw = (r.utm_medium || "").toLowerCase().trim();
      const label = CHANNEL_MAP[raw] || (raw ? "Outros" : "Outros");
      const qty = r.quantity ?? 1;
      const prev = map.get(label) ?? { units: 0, revenue: 0 };
      map.set(label, { units: prev.units + qty, revenue: prev.revenue + qty * PRODUCT_PRICE });
    }
    return CHANNEL_ORDER
      .map((label) => ({ label, ...(map.get(label) ?? { units: 0, revenue: 0 }) }))
      .filter((c) => c.units > 0 || ["Stories", "Reels", "Feed", "Bio", "QR Code"].includes(c.label));
  }, [rows]);

  const channelTotal = channelStats.reduce((a, c) => a + c.units, 0);
  const maxChannelUnits = Math.max(1, ...channelStats.map((c) => c.units));



  // ============ TIMELINE DO DIA DO EVENTO ============
  const eventDayTimeline = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, "0")}h`,
      acumulado: 0,
      hourIndex: h,
    }));
    const dayOrders = rows
      .filter((r) => r.created_at.startsWith(EVENT_DAY))
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    let acc = 0;
    for (const r of dayOrders) {
      const h = new Date(r.created_at).getHours();
      acc += r.quantity ?? 1;
      buckets[h].acumulado = acc;
    }
    // forward-fill acumulado
    let lastVal = 0;
    for (const b of buckets) {
      if (b.acumulado === 0 && lastVal > 0) b.acumulado = lastVal;
      else lastVal = b.acumulado;
    }
    return buckets;
  }, [rows]);

  // ============ TABELA TRANSAÇÕES ============
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Layout>
      <SEO
        title="Auditoria pública — Meeky × Crosstraining Festival Brasil 2026"
        description="Painel público de auditoria da campanha solidária Meeky × Crosstraining Festival Brasil 2026. Acompanhe vendas, receita, doações e conversão em tempo real."
        canonical="https://meeky.com.br/crosstraining/dashboard"
        noindex
      />

      {/* HEADER */}
      <section className="bg-background border-b border-border">
        <div className="container-wide section-padding py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <Link
                to="/crosstraining"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors mb-3"
              >
                <ArrowLeft size={14} /> Voltar para a campanha
              </Link>
              <h1 className="font-display text-3xl md:text-5xl 2xl:text-6xl font-bold tracking-tight">
                Auditoria pública da campanha
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
                Meeky × Crosstraining Festival Brasil 2026. Cada pedido aprovado aparece aqui em até 30 segundos.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-foreground">Ao vivo</span>
              {lastSync && (
                <span className="text-xs text-muted-foreground">
                  · atualizado {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
            </div>
          </div>

          {/* METRIC CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <MetricCard icon={ShoppingBag} label="Unidades vendidas" value={loading ? "—" : String(metrics.units)} />
            <MetricCard icon={DollarSign} label="Receita gerada" value={loading ? "—" : BRL(metrics.revenue)} />
            <MetricCard
              icon={Heart}
              label={`Doação (${DONATION_PERCENT}%)`}
              value={loading ? "—" : BRL(metrics.donated)}
              highlight
            />
            <MetricCard
              icon={Clock}
              label="Última venda"
              value={loading ? "—" : metrics.lastSale ? formatDateTime(metrics.lastSale) : "Nenhuma ainda"}
            />
          </div>
        </div>
      </section>

      {/* META AO VIVO */}
      <section className="bg-secondary border-b border-border">
        <div className="container-wide section-padding py-10 md:py-12">
          <div className="bg-background border border-border rounded-lg p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-accent" />
              <span className="text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground">
                Meta de doação
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-4">
              <p className="font-display text-2xl md:text-4xl font-bold tabular-nums">
                {BRL(metrics.donated)} <span className="text-muted-foreground text-base md:text-xl font-normal">de {BRL(DONATION_GOAL)}</span>
              </p>
              <p className="font-display text-xl md:text-2xl font-bold text-accent tabular-nums">
                {goalPercent.toFixed(1)}%
              </p>
            </div>
            <Progress value={goalPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-3">
              Doação destinada ao {INSTITUICAO_NOME}. Auditado e transferido após o evento. Atualiza a cada 30 segundos.
            </p>
          </div>
        </div>
      </section>

      {/* GRID PRINCIPAL — 2 colunas em telas grandes (otimizado p/ 1920×1080) */}
      <section className="bg-background">
        <div className="container-wide section-padding py-12 md:py-16">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
            {/* MAPA DE CALOR POR HORA */}
            <ChartCard
              icon={Clock}
              title="Vendas por hora do dia"
              subtitle="Identifique os picos de conversão da campanha"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={hourlyData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="vendas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* TIMELINE DO DIA DO EVENTO */}
            <ChartCard
              icon={TrendingUp}
              title={`Timeline do dia do evento (07/06)`}
              subtitle="Vendas acumuladas — mostra o impacto de cada ação"
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={eventDayTimeline} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="acumulado"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(var(--accent))", r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* FUNIL DE CONVERSÃO */}
            <ChartCard
              icon={Activity}
              title="Funil de conversão"
              subtitle="Da visita à compra aprovada"
            >
              <div className="space-y-3">
                {funnel.map((step, i) => {
                  const max = funnel[0].value || 1;
                  const widthPct = (step.value / max) * 100;
                  const prev = i > 0 ? funnel[i - 1].value : null;
                  const rateFromPrev = prev && prev > 0 ? (step.value / prev) * 100 : null;
                  return (
                    <div key={step.label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <step.icon size={12} /> {step.label}
                        </span>
                        <span className="font-mono tabular-nums">
                          <strong className="text-foreground">{step.value}</strong>
                          {rateFromPrev !== null && (
                            <span className="text-accent ml-2">{rateFromPrev.toFixed(1)}%</span>
                          )}
                        </span>
                      </div>
                      <div className="h-7 bg-secondary rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-700 ease-out"
                          style={{ width: `${Math.max(2, widthPct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            {/* RANKING POR ESTADO */}
            <ChartCard
              icon={MapPin}
              title="Compras por estado (UF)"
              subtitle="Top 10 estados com mais pedidos da campanha"
            >
              {stateRanking.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Nenhuma compra registrada ainda.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {stateRanking.map((s) => (
                    <div key={s.uf} className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold w-8 text-foreground">{s.uf}</span>
                      <div className="flex-1 h-6 bg-secondary rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-700 ease-out"
                          style={{ width: `${(s.total / maxStateValue) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold tabular-nums w-8 text-right">{s.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>
        </div>
      </section>

      {/* VENDAS POR CANAL (utm_medium) */}
      <section className="bg-background border-t border-border">
        <div className="container-wide section-padding py-12 md:py-16">
          <SectionHeading
            eyebrow="Atribuição de canal"
            title="Vendas por canal"
            description="Pedidos aprovados da campanha agrupados por utm_medium. Mede qual ponto de contato converte melhor — Stories, Reels, Feed, Bio ou QR Code físico."
          />

          {channelTotal === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Nenhuma venda atribuída a um canal ainda. As próximas compras com UTM serão exibidas aqui.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {channelStats.map((c) => {
                const share = channelTotal > 0 ? (c.units / channelTotal) * 100 : 0;
                return (
                  <div
                    key={c.label}
                    className="bg-secondary border border-border rounded-lg p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="font-display text-base font-bold">{c.label}</p>
                      <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-accent">
                        {share.toFixed(0)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Vendas</p>
                        <p className="font-display text-2xl font-bold tabular-nums">{c.units}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Receita</p>
                        <p className="font-display text-2xl font-bold tabular-nums">{BRL(c.revenue)}</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-background rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-700 ease-out"
                        style={{ width: `${(c.units / maxChannelUnits) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>



      {/* PAINEL DE QR CODES */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-12 md:py-16">
          <SectionHeading
            eyebrow="QR Codes rastreáveis"
            title="Performance por ponto físico"
            description="Cada QR aponta para um local diferente do evento. Atualiza a cada 30 segundos."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {qrStats.map((qr) => (
              <div key={qr.qr_id} className="bg-background border border-border rounded-lg p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                      {qr.qr_id}
                    </p>
                    <p className="font-display text-base font-bold mt-0.5">{qr.location}</p>
                  </div>
                  <QrCode className="w-5 h-5 text-accent shrink-0" />
                </div>

                <img
                  src={`/qr-crosstraining-${qr.qr_id}.png`}
                  alt={`QR code para ${qr.location}`}
                  width={120}
                  height={120}
                  loading="lazy"
                  className="w-24 h-24 object-contain bg-white p-1 rounded-sm mb-4 mx-auto"
                />

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] font-semibold tracking-wider uppercase text-muted-foreground">Scans</p>
                    <p className="font-display text-lg font-bold tabular-nums">{qr.scans}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold tracking-wider uppercase text-muted-foreground">Conv.</p>
                    <p className="font-display text-lg font-bold tabular-nums">{qr.conversions}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold tracking-wider uppercase text-muted-foreground">Taxa</p>
                    <p className="font-display text-lg font-bold tabular-nums text-accent">
                      {qr.rate.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <a
                  href={`/qr-crosstraining-${qr.qr_id}.png`}
                  download
                  className="block text-center text-[10px] font-semibold tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors mt-4 pt-3 border-t border-border"
                >
                  Baixar QR ↓
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSACTIONS TABLE */}
      <section className="bg-background">
        <div className="container-wide section-padding py-12 md:py-16">
          <SectionHeading
            eyebrow="Transações"
            title="Pedidos aprovados da campanha"
            description="Sem dados pessoais. Apenas referência interna, cidade e valores."
          />

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <Th>Data / hora</Th>
                    <Th>Ref.</Th>
                    <Th>Cidade</Th>
                    <Th>UF</Th>
                    <Th className="text-right">Valor</Th>
                    <Th className="text-right">Doação</Th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                        Carregando transações…
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                        Nenhuma transação aprovada ainda. A primeira venda aparecerá aqui em tempo real.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((r) => {
                      const donated = (Number(r.total_amount) * DONATION_PERCENT) / 100;
                      return (
                        <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                          <Td className="tabular-nums">{formatDateTime(r.created_at)}</Td>
                          <Td className="font-mono text-xs">{refShort(r.id)}</Td>
                          <Td className="text-muted-foreground">{r.shipping_city || "—"}</Td>
                          <Td className="font-mono text-xs">{(r.shipping_state || "—").toUpperCase()}</Td>
                          <Td className="text-right tabular-nums font-semibold">{BRL(Number(r.total_amount))}</Td>
                          <Td className="text-right tabular-nums text-accent font-semibold">{BRL(donated)}</Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {rows.length > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-4 border-t border-border bg-secondary/30">
                <span className="text-xs text-muted-foreground">
                  Página {page + 1} de {pageCount} · {rows.length} pedidos
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-border rounded-sm hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={page >= pageCount - 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-border rounded-sm hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Próxima página"
                  >
                    Próxima <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-900 text-center mt-8 max-w-2xl mx-auto leading-relaxed">
            Dados auditáveis em tempo real. Instituição beneficiada:{" "}
            <strong className="text-foreground">Instituto Fortalecendo Pessoas (IFP), São José dos Campos/SP</strong>. Doação auditada e transferida após o evento.
          </p>
        </div>
      </section>
    </Layout>
  );
};

// ============================================================
// Subcomponents
// ============================================================
interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}

const MetricCard = ({ icon: Icon, label, value, highlight }: MetricCardProps) => (
  <div
    className={
      highlight
        ? "bg-primary text-primary-foreground border border-primary rounded-lg p-5 md:p-6"
        : "bg-card border border-border rounded-lg p-5 md:p-6"
    }
  >
    <Icon className={highlight ? "w-5 h-5 text-accent mb-3" : "w-5 h-5 text-muted-foreground mb-3"} />
    <p
      className={
        highlight
          ? "text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-primary-foreground/60 mb-2"
          : "text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2"
      }
    >
      {label}
    </p>
    <p
      className={
        highlight
          ? "font-display text-2xl md:text-3xl font-bold tabular-nums text-accent break-words"
          : "font-display text-2xl md:text-3xl font-bold tabular-nums text-foreground break-words"
      }
    >
      {value}
    </p>
  </div>
);

interface ChartCardProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const ChartCard = ({ icon: Icon, title, subtitle, children }: ChartCardProps) => (
  <div className="bg-card border border-border rounded-lg p-5 md:p-6">
    <div className="flex items-start gap-3 mb-5">
      <Icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
      <div>
        <h3 className="font-display text-lg md:text-xl font-bold leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`text-left text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground px-4 md:px-6 py-3 ${className}`}>
    {children}
  </th>
);

const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 md:px-6 py-3 ${className}`}>{children}</td>
);

export default CrosstrainingDashboardPage;
