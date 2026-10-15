import { useState } from "react";
import { Copy, FileDown, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type PartnerStats, formatBRL, formatDate } from "./PartnerDashboard";

const buildSummaryText = (s: PartnerStats) => {
  const now = new Date();
  const periodo = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return [
    `📊 Extrato Meeky — ${s.coupon.partner_name}`,
    `Cupom: ${s.coupon.code}`,
    `Período: ${periodo}`,
    ``,
    `🛒 Vendas aprovadas: ${s.revenueBlock.approvedCount}`,
    `💰 Receita total: ${formatBRL(s.revenueBlock.revenueMonth)}`,
    `🏆 Faixa atual: ${s.goalBlock.currentTier}`,
    `💵 Comissão (${Math.round(s.goalBlock.currentRate * 100)}%): ${formatBRL(s.goalBlock.commission)}`,
    `📈 Taxa de conversão: ${s.revenueBlock.conversionRate}%`,
    ``,
    `— Meeky Audio · meeky.com.br`,
  ].join("\n");
};

export const ShareableSummary = ({ stats }: { stats: PartnerStats }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildSummaryText(stats));
    setCopied(true);
    toast({ title: "Extrato copiado!", description: "Cole no WhatsApp ou onde quiser." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const now = new Date();
    const periodo = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Meeky Audio — Extrato do Parceiro", 40, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em ${now.toLocaleString("pt-BR")}`, 40, 80);

    doc.setDrawColor(220);
    doc.line(40, 95, 555, 95);

    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(stats.coupon.partner_name, 40, 125);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Cupom: ${stats.coupon.code}  ·  Período: ${periodo}`, 40, 145);

    const lines: [string, string][] = [
      ["Vendas aprovadas", String(stats.revenueBlock.approvedCount)],
      ["Vendas pendentes", String(stats.revenueBlock.pendingCount)],
      ["Receita total (sem frete)", formatBRL(stats.revenueBlock.revenueMonth)],
      ["Ticket médio", formatBRL(stats.revenueBlock.avgTicket)],
      ["Cliques no link", String(stats.trafficBlock.clicks)],
      ["Visitantes únicos", String(stats.trafficBlock.uniqueVisitors)],
      ["Taxa de conversão", `${stats.revenueBlock.conversionRate}%`],
      ["Faixa atual", stats.goalBlock.currentTier],
      [`Comissão (${Math.round(stats.goalBlock.currentRate * 100)}%)`, formatBRL(stats.goalBlock.commission)],
    ];

    let y = 180;
    doc.setFontSize(11);
    lines.forEach(([k, v]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text(k, 40, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(v, 555, y, { align: "right" });
      y += 22;
    });

    y += 12;
    doc.setDrawColor(220);
    doc.line(40, y, 555, y);
    y += 22;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Pedidos do período", 40, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Data", 40, y);
    doc.text("ID", 130, y);
    doc.text("Produto", 350, y, { align: "right" });
    doc.text("Status", 555, y, { align: "right" });
    y += 14;
    doc.setDrawColor(240);
    doc.line(40, y - 8, 555, y - 8);

    doc.setTextColor(0);
    stats.orders.slice(0, 25).forEach((o) => {
      if (y > 780) { doc.addPage(); y = 60; }
      doc.text(formatDate(o.created_at), 40, y);
      doc.text(o.id.slice(0, 8), 130, y);
      doc.text(formatBRL(o.product_value), 350, y, { align: "right" });
      doc.text(o.status, 555, y, { align: "right" });
      y += 14;
    });

    doc.setTextColor(150);
    doc.setFontSize(9);
    doc.text("meeky.com.br · Barganha Mix LTDA", 40, 820);

    doc.save(`extrato-${stats.coupon.code}-${periodo.replace(/\s/g, "-")}.pdf`);
    toast({ title: "PDF gerado!" });
  };

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 size={16} className="text-accent" /> Resumo para compartilhar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Parceiro</p>
            <p className="font-semibold text-foreground">{stats.coupon.partner_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cupom</p>
            <p className="font-mono font-semibold text-accent">{stats.coupon.code}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vendas aprovadas</p>
            <p className="font-semibold text-foreground">{stats.revenueBlock.approvedCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Receita total</p>
            <p className="font-semibold text-foreground">{formatBRL(stats.revenueBlock.revenueMonth)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Comissão ({Math.round(stats.goalBlock.currentRate * 100)}%)</p>
            <p className="font-semibold text-accent">{formatBRL(stats.goalBlock.commission)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Conversão</p>
            <p className="font-semibold text-foreground">{stats.revenueBlock.conversionRate}%</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" onClick={handleCopy}>
            <Copy size={14} className="mr-1" /> {copied ? "Copiado!" : "Copiar extrato"}
          </Button>
          <Button size="sm" onClick={handlePdf}>
            <FileDown size={14} className="mr-1" /> Gerar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
