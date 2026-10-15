import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, LogOut, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  PartnerHeader, RevenueMetrics, TrafficMetrics, MonthGoal, ConversionFunnel,
  PartnersRanking, OrdersTable, type PartnerStats,
} from "@/components/partner/PartnerDashboard";
import { ShareableSummary } from "@/components/partner/ShareableSummary";

interface CouponOption { code: string; partner_name: string }

const AdminPartnerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const couponCode = (searchParams.get("cupom") || "").toUpperCase();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [coupons, setCoupons] = useState<CouponOption[]>([]);

  const token = sessionStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  // Lista de cupons p/ o seletor
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("admin-coupons?action=list", {
          headers: { "x-admin-token": token },
        });
        setCoupons((data?.coupons || []).map((c: any) => ({ code: c.code, partner_name: c.partner_name })));
      } catch {
        toast({ title: "Erro ao carregar cupons", variant: "destructive" });
      }
    })();
  }, [token, toast]);

  const fetchStats = useCallback(async () => {
    if (!token || !couponCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `admin-coupons?action=partner_stats&coupon_code=${encodeURIComponent(couponCode)}`,
        { headers: { "x-admin-token": token } }
      );
      if (error) throw error;
      setStats(data?.stats || null);
    } catch {
      toast({ title: "Erro ao carregar painel", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, couponCode, toast]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Painel do Parceiro</h1>
          <div className="flex items-center gap-3">
            <Select value={couponCode || ""} onValueChange={(v) => setSearchParams({ cupom: v })}>
              <SelectTrigger className="w-[220px]">
                <Calendar size={14} className="mr-2" />
                <SelectValue placeholder="Selecione um cupom" />
              </SelectTrigger>
              <SelectContent>
                {coupons.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.partner_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem("admin_token"); navigate("/admin/login"); }}>
              <LogOut size={16} className="mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {!couponCode ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              Selecione um cupom acima ou acesse via URL — exemplo:
              <br />
              <code className="text-accent">/admin/parceiros?cupom=XUS</code>
            </CardContent>
          </Card>
        ) : loading || !stats ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-accent" size={32} /></div>
        ) : (
          <>
            <PartnerHeader stats={stats} />
            <RevenueMetrics stats={stats} />
            <TrafficMetrics stats={stats} />
            <div className="grid lg:grid-cols-2 gap-6">
              <MonthGoal stats={stats} />
              <ConversionFunnel stats={stats} />
            </div>
            <PartnersRanking stats={stats} />
            <OrdersTable stats={stats} />
            <ShareableSummary stats={stats} />
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPartnerPage;
