// Componentes do painel de parceiros — usados tanto em /admin/parceiros quanto em /parceiro/:cupom
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart3, DollarSign, ShoppingBag, TrendingUp, TrendingDown, MousePointerClick,
  Users, Target, Calendar, Trophy, ArrowRight,
} from "lucide-react";

export const formatBRL = (v: number) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;
export const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

export interface PartnerStats {
  coupon: { code: string; partner_name: string; active: boolean };
  partnership: { startedAt: string | null; daysActive: number };
  revenueBlock: {
    revenueMonth: number;
    revenueWoW: { current: number; previous: number; deltaPct: number | null };
    approvedCount: number;
    pendingCount: number;
    conversionRate: number;
    avgTicket: number;
  };
  trafficBlock: {
    clicks: number;
    uniqueVisitors: number;
    clickToCouponRate: number;
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
  funnelBlock: { clicks: number; uniqueVisitors: number; couponUses: number; approvedOrders: number };
  ranking: { position: number; name: string; revenue: number; isMe: boolean }[];
  orders: { id: string; created_at: string; product_value: number; shipping_cost: number; status: string }[];
}

const initials = (name: string) =>
  name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export const PartnerHeader = ({ stats }: { stats: PartnerStats }) => (
  <Card>
    <CardContent className="py-6 flex flex-wrap items-center gap-6">
      <Avatar className="h-16 w-16 bg-accent/20 text-accent text-xl font-bold">
        <AvatarFallback className="bg-accent/20 text-accent">{initials(stats.coupon.partner_name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-bold text-foreground">{stats.coupon.partner_name}</h2>
          {stats.coupon.active ? (
            <Badge className="bg-green-500/15 text-green-500 hover:bg-green-500/15 border-0">Ativo</Badge>
          ) : (
            <Badge variant="secondary">Inativo</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Cupom <span className="font-mono text-accent font-semibold">{stats.coupon.code}</span> ·
          desde {formatDate(stats.partnership.startedAt)} · {stats.partnership.daysActive} dias ativos
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Nível atual</p>
        <p className="text-xl font-bold text-accent">{stats.goalBlock.currentTier}</p>
      </div>
    </CardContent>
  </Card>
);

const MetricCard = ({
  icon, label, value, sub, accent = false,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: React.ReactNode; accent?: boolean;
}) => (
  <Card className={accent ? "border-accent/30 bg-accent/5" : undefined}>
    <CardHeader className="pb-2">
      <CardTitle className="text-xs text-muted-foreground flex items-center gap-2 font-medium uppercase tracking-wide">
        {icon} {label}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className={`text-2xl font-bold ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </CardContent>
  </Card>
);

export const RevenueMetrics = ({ stats }: { stats: PartnerStats }) => {
  const { revenueBlock: r } = stats;
  const delta = r.revenueWoW.deltaPct;
  const deltaNode = delta === null ? (
    <span className="text-muted-foreground">novo período</span>
  ) : (
    <span className={delta >= 0 ? "text-green-500" : "text-red-500"}>
      {delta >= 0 ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
      {delta > 0 ? "+" : ""}{delta}% vs semana anterior
    </span>
  );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<DollarSign size={14} />}
        label="Receita do mês"
        value={formatBRL(r.revenueMonth)}
        sub={deltaNode}
        accent
      />
      <MetricCard
        icon={<ShoppingBag size={14} />}
        label="Usos do cupom"
        value={String(r.approvedCount + r.pendingCount)}
        sub={<><span className="text-green-500">{r.approvedCount} aprovados</span> · <span className="text-yellow-500">{r.pendingCount} pendentes</span></>}
      />
      <MetricCard
        icon={<Target size={14} />}
        label="Taxa de conversão"
        value={`${r.conversionRate}%`}
        sub="Pedidos aprovados / cliques"
      />
      <MetricCard
        icon={<TrendingUp size={14} />}
        label="Ticket médio"
        value={formatBRL(r.avgTicket)}
        sub="Sem frete"
      />
    </div>
  );
};

export const TrafficMetrics = ({ stats }: { stats: PartnerStats }) => {
  const { trafficBlock: t } = stats;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard icon={<MousePointerClick size={14} />} label="Cliques no link" value={String(t.clicks)} sub="/r/CUPOM (mês)" />
      <MetricCard icon={<Users size={14} />} label="Visitantes únicos" value={String(t.uniqueVisitors)} sub="Sessões distintas" />
      <MetricCard icon={<Target size={14} />} label="Clique → cupom" value={`${t.clickToCouponRate}%`} sub="Usos / cliques" />
      <MetricCard
        icon={<Calendar size={14} />}
        label="Melhor dia"
        value={t.bestDay.date ? formatDate(t.bestDay.date) : "—"}
        sub={t.bestDay.sales > 0 ? `${t.bestDay.sales} vendas` : "Sem vendas no mês"}
      />
    </div>
  );
};

export const MonthGoal = ({ stats }: { stats: PartnerStats }) => {
  const g = stats.goalBlock;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy size={16} className="text-accent" /> Comissão do mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Comissão: <span className="text-accent">10% fixo por venda aprovada</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{g.salesCount} venda(s) · {formatBRL(g.revenue)}</span>
        </div>
        <p className="text-sm text-muted-foreground pt-2 border-t border-border">
          Sem faixas — todos os parceiros recebem 10% sobre cada venda aprovada.
        </p>
        <p className="text-xs text-muted-foreground">
          Comissão atual: <span className="font-semibold text-accent">{formatBRL(g.commission)}</span>
          {" "}(10% × {formatBRL(269)} × {g.salesCount})
        </p>
      </CardContent>
    </Card>
  );
};


export const ConversionFunnel = ({ stats }: { stats: PartnerStats }) => {
  const f = stats.funnelBlock;
  const max = Math.max(f.clicks, 1);
  const pct = (n: number) => Math.max(2, Math.round((n / max) * 100));
  const drop = (curr: number, prev: number) =>
    prev > 0 ? Math.round(((prev - curr) / prev) * 100) : 0;

  const steps = [
    { label: "Cliques", value: f.clicks, prev: f.clicks },
    { label: "Visitantes únicos", value: f.uniqueVisitors, prev: f.clicks },
    { label: "Cupom usado", value: f.couponUses, prev: f.uniqueVisitors },
    { label: "Pedidos aprovados", value: f.approvedOrders, prev: f.couponUses },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Funil de conversão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-foreground">{s.label}</span>
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{s.value}</span>
                {i > 0 && s.prev > 0 && s.value !== s.prev && (
                  <span className="ml-2 text-xs text-red-500">−{drop(s.value, s.prev)}%</span>
                )}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${pct(s.value)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const PartnersRanking = ({ stats }: { stats: PartnerStats }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        <BarChart3 size={16} className="text-accent" /> Ranking de parceiros (mês)
      </CardTitle>
    </CardHeader>
    <CardContent>
      {stats.ranking.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Sem dados no mês</p>
      ) : (
        <ol className="space-y-2">
          {stats.ranking.map(r => (
            <li
              key={`${r.position}-${r.name}`}
              className={`flex items-center justify-between p-3 rounded-md border ${
                r.isMe ? "border-accent bg-accent/10" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold w-6 text-center ${r.isMe ? "text-accent" : "text-muted-foreground"}`}>
                  #{r.position}
                </span>
                <span className={`text-sm ${r.isMe ? "font-semibold text-foreground" : "text-foreground"}`}>
                  {r.name}{r.isMe && " (você)"}
                </span>
              </div>
              <span className={`text-sm font-semibold ${r.isMe ? "text-accent" : "text-foreground"}`}>
                {formatBRL(r.revenue)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "approved") return <Badge className="bg-green-500/15 text-green-500 hover:bg-green-500/15 border-0">Aprovado</Badge>;
  if (status === "pending") return <Badge className="bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/15 border-0">Pendente</Badge>;
  return <Badge variant="secondary">Cancelado</Badge>;
};

export const OrdersTable = ({ stats }: { stats: PartnerStats }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Pedidos do mês</CardTitle>
    </CardHeader>
    <CardContent>
      {stats.orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nenhum pedido no mês ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Produto</TableHead>
                <TableHead className="text-right">Frete</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="text-sm">{formatDate(o.created_at)}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{o.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-sm text-right font-semibold">{formatBRL(o.product_value)}</TableCell>
                  <TableCell className="text-sm text-right text-muted-foreground">{formatBRL(o.shipping_cost)}</TableCell>
                  <TableCell className="text-center"><StatusBadge status={o.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
);
