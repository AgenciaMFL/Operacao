import { ShieldCheck, FileText, BadgeCheck, Building2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import { useDeliveredOrdersCount, deliveredOrdersLabel } from "@/hooks/useDeliveredOrdersCount";

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Por que confiar na Meeky", url: "https://meeky.com.br/reviews" },
]);

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "12 meses de garantia no Brasil",
    text: "Garantia contratual de 12 meses com suporte direto da Meeky, sem intermediário e sem envio ao exterior.",
  },
  {
    icon: BadgeCheck,
    title: "Certificação Anatel e SIG Bluetooth",
    text: "O Meeky F5 ANC Pro é homologado para uso no Brasil e certificado pelo Bluetooth Special Interest Group.",
  },
  {
    icon: FileText,
    title: "Nota fiscal em todo pedido",
    text: "Todas as vendas são faturadas com nota fiscal eletrônica emitida em nome do comprador.",
  },
  {
    icon: Building2,
    title: "Empresa brasileira com CNPJ ativo",
    text: "Barganha Mix Ltda — CNPJ 43.341.597/0001-40, com atendimento por e-mail e WhatsApp em horário comercial.",
  },
];

const ReviewsPage = () => {
  const ordersCount = useDeliveredOrdersCount();

  return (
    <Layout>
      <SEO
        title="Por que confiar na Meeky — garantia, Anatel e nota fiscal"
        description="Garantia de 12 meses no Brasil, produto certificado pela Anatel, nota fiscal em todo pedido e empresa brasileira com CNPJ ativo. Conheça as garantias reais da Meeky."
        canonical="https://meeky.com.br/reviews"
      />
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-primary">
        <div className="container-wide section-padding py-24 md:py-32">
          <div className="text-center">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">
              Confiança
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
              Por que confiar na Meeky
            </h1>
            <p className="text-lg text-primary-foreground/60 max-w-xl mx-auto">
              Não publicamos depoimentos que não possamos comprovar. Em vez disso, mostramos aqui os fatos
              verificáveis da operação: garantia, certificação, nota fiscal e empresa registrada no Brasil.
            </p>
            <p className="mt-6 text-sm text-primary-foreground/60">{deliveredOrdersLabel(ordersCount)}</p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-6">
            {trustPoints.map((point) => (
              <article key={point.title} className="bg-secondary p-8 rounded-sm border border-border">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-5">
                  <point.icon size={18} className="text-accent" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground mb-2">{point.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Compre com garantia real"
        subtitle="Meeky F5 ANC Pro com frete grátis, nota fiscal e 12 meses de garantia."
        buttonText="COMPRAR AGORA"
        buttonLink="/checkout"
      />
    </Layout>
  );
};

export default ReviewsPage;
