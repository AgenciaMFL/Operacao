import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import JsonLd from "@/components/shared/JsonLd";

const PoliticaDevolucaoPage = () => {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Política de Devolução — Meeky Audio",
    description: "Saiba como solicitar devolução, troca ou acionar a garantia do seu Headphone Meeky F5 ANC Pro.",
    url: "https://meeky.com.br/politica-de-devolucao",
  };

  const sections = [
    {
      title: "Prazo para devolução",
      content: "O cliente tem até 7 dias corridos após o recebimento do produto para solicitar a devolução ou troca, conforme o Código de Defesa do Consumidor (Lei nº 8.078/90).",
    },
    {
      title: "Como solicitar",
      content: (
        <>
          Entre em contato pelo e-mail{" "}
          <a href="mailto:contato@meeky.com.br" className="text-accent hover:underline">
            contato@meeky.com.br
          </a>{" "}
          ou pelo WhatsApp informando o número do pedido e o motivo da devolução. Nossa equipe responderá em até 1 dia útil.
        </>
      ),
    },
    {
      title: "Condições para devolução",
      content: "O produto deve estar em perfeitas condições, sem sinais de uso, com todos os acessórios originais e na embalagem original.",
    },
    {
      title: "Reembolso",
      content: "Após recebermos e conferirmos o produto, o reembolso será processado em até 5 dias úteis via Pix ou estorno no cartão de crédito, dependendo da forma de pagamento original.",
    },
    {
      title: "Produto com defeito",
      content: "Em caso de defeito de fabricação, o cliente tem garantia de 12 meses. Entre em contato pelos canais acima para acionarmos a garantia sem custo.",
    },
    {
      title: "Frete de devolução",
      content: "Em caso de arrependimento (até 7 dias), o frete de devolução é por conta do cliente. Em caso de defeito de fabricação, o frete é por conta da Meeky Audio.",
    },
  ];

  return (
    <Layout>
      <SEO title="Política de Devolução e Garantia — Meeky Audio" description="Saiba como solicitar devolução, troca ou acionar a garantia do seu Headphone Meeky F5 ANC Pro." canonical="https://meeky.com.br/politica-de-devolucao" />
      <JsonLd data={jsonLd} />
      <section className="container-wide section-padding py-16 md:py-24">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-12">
          Política de Devolução e Troca
        </h1>
        <div className="max-w-3xl space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-xl font-semibold mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default PoliticaDevolucaoPage;
