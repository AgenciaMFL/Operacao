import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, DollarSign, Award, Copy, Plus, LogOut, Loader2, ChevronLeft, Check, Calendar, Lock, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

const getMonthOptions = () => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return options;
};

const getBonusLabel = (rate: number) => {
  if (rate === 0.08) return "8% (1-10)";
  if (rate === 0.10) return "10% (11-30)";
  if (rate === 0.12) return "12% (30+)";
  return "—";
};

interface CouponStat {
  id: string; code: string; partner_name: string; discount_type: string; discount_value: number;
  uses_count: number; max_uses: number | null; active: boolean; pix_key: string | null;
  order_count: number; revenue: number; discount_given: number; avg_ticket: number;
  clicks: number; conversion_rate: number; bonus_rate: number; bonus_amount: number;
  payment_status: string | null; payment_id: string | null;
}

interface OrderDetail {
  id: string; created_at: string; customer_email: string; total_amount: number;
  payment_status: string; coupon_code: string;
}

const AdminCouponsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalSales: number; totalRevenue: number; topCoupon: any; couponStats: CouponStat[]; totalBonus: number; month: string } | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", partner_name: "", discount_value: "28", pix_key: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [closingMonth, setClosingMonth] = useState(false);
  const [editPixId, setEditPixId] = useState<string | null>(null);
  const [editPixValue, setEditPixValue] = useState("");

  const token = sessionStorage.getItem("admin_token");
  const monthOptions = getMonthOptions();

  useEffect(() => { if (!token) navigate("/admin/login"); }, [token, navigate]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(`admin-coupons?action=stats&month=${selectedMonth}`, {
        headers: { "x-admin-token": token },
      });
      if (error) throw error;
      setStats(data);
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, toast, selectedMonth]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleToggle = async (id: string, active: boolean) => {
    if (!token) return;
    try {
      await supabase.functions.invoke("admin-coupons?action=toggle", { headers: { "x-admin-token": token }, body: { id, active } });
      fetchStats();
    } catch { toast({ title: "Erro", variant: "destructive" }); }
  };

  const handleCreate = async () => {
    if (!token || !newCoupon.code || !newCoupon.partner_name) return;
    try {
      await supabase.functions.invoke("admin-coupons?action=create", {
        headers: { "x-admin-token": token },
        body: { ...newCoupon, discount_type: "fixed", discount_value: Number(newCoupon.discount_value) },
      });
      setCreateOpen(false);
      setNewCoupon({ code: "", partner_name: "", discount_value: "28", pix_key: "" });
      fetchStats();
      toast({ title: "Cupom criado!" });
    } catch { toast({ title: "Erro", variant: "destructive" }); }
  };

  const handleUpdatePix = async (id: string) => {
    if (!token) return;
    try {
      await supabase.functions.invoke("admin-coupons?action=update_pix", {
        headers: { "x-admin-token": token },
        body: { id, pix_key: editPixValue },
      });
      setEditPixId(null);
      fetchStats();
      toast({ title: "Chave Pix atualizada!" });
    } catch { toast({ title: "Erro", variant: "destructive" }); }
  };

  const handleCloseMonth = async () => {
    if (!token) return;
    setClosingMonth(true);
    try {
      await supabase.functions.invoke("admin-coupons?action=close_month", {
        headers: { "x-admin-token": token },
        body: { month: selectedMonth },
      });
      fetchStats();
      toast({ title: "Mês fechado!", description: "Registros de pagamento criados." });
    } catch { toast({ title: "Erro", variant: "destructive" }); }
    finally { setClosingMonth(false); }
  };

  const handleMarkPaid = async (paymentId: string) => {
    if (!token) return;
    try {
      await supabase.functions.invoke("admin-coupons?action=mark_paid", {
        headers: { "x-admin-token": token },
        body: { payment_id: paymentId },
      });
      fetchStats();
      toast({ title: "Marcado como pago!" });
    } catch { toast({ title: "Erro", variant: "destructive" }); }
  };

  const handleViewOrders = async (couponCode: string) => {
    if (!token) return;
    setSelectedCoupon(couponCode);
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(`admin-coupons?action=orders&coupon_code=${couponCode}`, {
        headers: { "x-admin-token": token },
      });
      if (error) throw error;
      setOrders(data?.orders || []);
    } catch { toast({ title: "Erro", variant: "destructive" }); }
    finally { setOrdersLoading(false); }
  };

  const copyLink = (code: string) => {
    const slug = code.toLowerCase();
    navigator.clipboard.writeText(`https://meeky.com.br/r/${slug}`);
    toast({ title: "Link copiado!", description: `https://meeky.com.br/r/${slug}` });
  };

  const handleGeneratePartnerLink = async (code: string) => {
    if (!token) return;
    try {
      const { data, error } = await supabase.functions.invoke("admin-coupons?action=generate_token", {
        headers: { "x-admin-token": token },
        body: { coupon_code: code },
      });
      if (error || !data?.token) throw error || new Error("sem token");
      const link = `${window.location.origin}/parceiro/${code.toUpperCase()}?token=${data.token}`;
      await navigator.clipboard.writeText(link);
      toast({
        title: data.reused ? "Link existente copiado!" : "Novo link gerado e copiado!",
        description: link,
      });
    } catch {
      toast({ title: "Erro ao gerar link do parceiro", variant: "destructive" });
    }
  };

  const handleLogout = () => { sessionStorage.removeItem("admin_token"); navigate("/admin/login"); };

  if (!token) return null;
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-accent" size={32} /></div>;

  const currentMonthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Dashboard de Parceiros</h1>
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]"><Calendar size={14} className="mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                {monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut size={16} className="mr-1" /> Sair</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><BarChart3 size={16} /> Vendas ({currentMonthLabel})</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{stats?.totalSales || 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign size={16} /> Receita ({currentMonthLabel})</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{formatBRL(stats?.totalRevenue || 0)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Award size={16} /> Cupom mais usado</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stats?.topCoupon?.code || "—"}</p>
              <p className="text-sm text-muted-foreground">{stats?.topCoupon?.partner_name || ""}</p>
            </CardContent>
          </Card>
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-accent flex items-center gap-2"><DollarSign size={16} /> Total a pagar ({currentMonthLabel})</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{formatBRL(stats?.totalBonus || 0)}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={handleCloseMonth} disabled={closingMonth}>
                {closingMonth ? <Loader2 size={14} className="animate-spin mr-1" /> : <Lock size={14} className="mr-1" />}
                Fechar mês
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Orders detail */}
        {selectedCoupon && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pedidos — cupom {selectedCoupon}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCoupon(null)}><ChevronLeft size={16} className="mr-1" /> Voltar</Button>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin" size={24} /></div>
              ) : orders.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">Nenhum pedido encontrado</p>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Email</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {orders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="text-sm">{o.customer_email}</TableCell>
                        <TableCell className="text-sm font-semibold">{formatBRL(Number(o.total_amount))}</TableCell>
                        <TableCell><span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">Aprovado</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Table */}
        {!selectedCoupon && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cupons & Parceiros — {currentMonthLabel}</CardTitle>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild><Button size="sm"><Plus size={16} className="mr-1" /> Novo cupom</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Criar novo cupom</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div><Label>Código do cupom</Label><Input value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="EX: NOME" className="mt-1" /></div>
                      <div><Label>Nome do parceiro</Label><Input value={newCoupon.partner_name} onChange={e => setNewCoupon(p => ({ ...p, partner_name: e.target.value }))} placeholder="Nome completo" className="mt-1" /></div>
                      <div><Label>Desconto (R$)</Label><Input type="number" value={newCoupon.discount_value} onChange={e => setNewCoupon(p => ({ ...p, discount_value: e.target.value }))} className="mt-1" /></div>
                      <div><Label>Chave Pix do parceiro</Label><Input value={newCoupon.pix_key} onChange={e => setNewCoupon(p => ({ ...p, pix_key: e.target.value }))} placeholder="CPF, email ou telefone" className="mt-1" /></div>
                      <Button onClick={handleCreate} className="w-full">Criar cupom</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parceiro</TableHead>
                      <TableHead>Cupom</TableHead>
                      <TableHead className="text-center">Cliques</TableHead>
                      <TableHead className="text-center">Vendas mês</TableHead>
                      <TableHead className="text-center">Conv. %</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                      <TableHead className="text-center">Faixa</TableHead>
                      <TableHead className="text-right">Bonificação</TableHead>
                      <TableHead className="text-center">Pix</TableHead>
                      <TableHead className="text-center">Pgto</TableHead>
                      <TableHead className="text-center">Ativo</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(stats?.couponStats || []).map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.partner_name}</TableCell>
                        <TableCell>
                          <button onClick={() => handleViewOrders(c.code)} className="text-accent hover:underline font-semibold">{c.code}</button>
                        </TableCell>
                        <TableCell className="text-center">{c.clicks}</TableCell>
                        <TableCell className="text-center font-semibold">{c.order_count}</TableCell>
                        <TableCell className="text-center">{c.conversion_rate}%</TableCell>
                        <TableCell className="text-right">{formatBRL(c.revenue)}</TableCell>
                        <TableCell className="text-center text-xs">{c.order_count > 0 ? getBonusLabel(c.bonus_rate) : "—"}</TableCell>
                        <TableCell className="text-right font-semibold text-accent">{c.order_count > 0 ? formatBRL(c.bonus_amount) : "—"}</TableCell>
                        <TableCell className="text-center">
                          {editPixId === c.id ? (
                            <div className="flex items-center gap-1">
                              <Input value={editPixValue} onChange={e => setEditPixValue(e.target.value)} className="w-32 h-7 text-xs" />
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleUpdatePix(c.id)}><Check size={12} /></Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditPixId(c.id); setEditPixValue(c.pix_key || ""); }}
                              className="text-xs text-muted-foreground hover:text-foreground truncate max-w-[100px] block"
                              title={c.pix_key || "Clique para adicionar"}
                            >
                              {c.pix_key || "—"}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {c.payment_status === "paid" ? (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">Pago</span>
                          ) : c.payment_id ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMarkPaid(c.payment_id!)}>
                              Marcar pago
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center"><Switch checked={c.active} onCheckedChange={(checked) => handleToggle(c.id, checked)} /></TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => copyLink(c.code)} title="Copiar link curto /r/">
                              <Copy size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleGeneratePartnerLink(c.code)} title="Gerar link do painel do parceiro">
                              <Share2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminCouponsPage;
