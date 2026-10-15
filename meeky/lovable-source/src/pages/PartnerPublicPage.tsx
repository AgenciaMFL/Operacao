// Página PÚBLICA acessada pelo parceiro via link com token.
// URL: /parceiro/:cupom?token=xxx
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  PartnerHeader, RevenueMetrics, TrafficMetrics, MonthGoal, ConversionFunnel,
  OrdersTable, type PartnerStats,
} from "@/components/partner/PartnerDashboard";
import { ShareableSummary } from "@/components/partner/ShareableSummary";
import SEO from "@/components/shared/SEO";

const PartnerPublicPage = () => {
  const { cupom } = useParams<{ cupom: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!cupom || !token) {
        setError("Link inválido ou expirado.");
        setLoading(false);
        return;
      }
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-stats?cupom=${encodeURIComponent(cupom.toUpperCase())}&token=${encodeURIComponent(token)}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const json = await res.json();
        if (!res.ok || !json.stats) {
          setError(json.error || "Não foi possível carregar o painel.");
        } else {
          setStats(json.stats);
        }
      } catch {
        setError("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cupom, token]);

  return (
    <>
    <SEO title={`Painel do parceiro · Meeky Audio`} description="Acompanhe suas vendas, comissões e métricas em tempo real." noindex />
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            Meeky · <span className="text-accent">Painel do Parceiro</span>
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-accent" size={32} /></div>
        ) : error || !stats ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <p className="text-foreground font-semibold mb-2">Acesso não autorizado</p>
              <p className="text-sm">{error || "Link inválido."}</p>
              <p className="text-xs mt-4">Solicite um novo link ao administrador da Meeky.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <PartnerHeader stats={stats} />
            <RevenueMetrics stats={stats} />
            <TrafficMetrics stats={stats} />
            <div className="grid lg:grid-cols-2 gap-6">
              <MonthGoal stats={stats} />
              <ConversionFunnel stats={stats} />
            </div>
            <OrdersTable stats={stats} />
            <ShareableSummary stats={stats} />
          </>
        )}
      </main>
    </div>
    </>
  );
};

export default PartnerPublicPage;
