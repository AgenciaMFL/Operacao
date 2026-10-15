import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "O que é cancelamento de ruído ativo (ANC)?",
  description: "Entenda o que é ANC, como os microfones cancelam o ruído em tempo real, a diferença para o cancelamento passivo e quando vale a pena investir.",
  datePublished: "2026-04-15",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio", url: "https://meeky.com.br/sobre#filipe-cardoso" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://meeky.com.br/blog/o-que-e-cancelamento-de-ruido-ativo-anc" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O cancelamento de ruído ativo faz mal à saúde?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. O ANC não emite nenhum sinal prejudicial ao ouvido. Pelo contrário — como você precisa de menos volume para ouvir com clareza, o ANC ajuda a proteger a audição ao longo do tempo.",
      },
    },
    {
      "@type": "Question",
      name: "Todo headphone over-ear tem ANC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. Todo headphone over-ear tem cancelamento passivo pelo design, mas ANC ativo é uma tecnologia eletrônica adicional que precisa estar especificada pelo fabricante. Verifique sempre antes de comprar.",
      },
    },
    {
      "@type": "Question",
      name: "ANC de 20dB é suficiente para home office?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. Para os ruídos mais comuns do home office — ar-condicionado, barulho de rua, conversas ao fundo — 20dB de ANC ativo é mais que suficiente para criar um ambiente focado e produtivo.",
      },
    },
  ],
};

const faqs = faqSchema.mainEntity.map((q) => ({
  question: q.name,
  answer: q.acceptedAnswer.text,
}));

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "O que é cancelamento de ruído ativo (ANC)", url: "https://meeky.com.br/blog/o-que-e-cancelamento-de-ruido-ativo-anc" },
]);

const BlogPostANCBasicsPage = () => {

  return (
    <Layout>
      <SEO ogType="article" title="O que é cancelamento de ruído ativo (ANC)? Guia direto e sem enrolação" description="Entenda o que é ANC, como os microfones cancelam o ruído em tempo real, a diferença para o cancelamento passivo e quando vale a pena investir." canonical="https://meeky.com.br/blog/o-que-e-cancelamento-de-ruido-ativo-anc" />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <JsonLd data={breadcrumbSchema} />

      <article className="bg-background">
        <div className="container-wide section-padding py-12 md:py-20 max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8">
            <ArrowLeft size={14} /> Voltar ao blog
          </Link>

          <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Guias</span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 leading-tight">
            O que é cancelamento de ruído ativo (ANC)?
          </h1>
          <p className="text-muted-foreground text-sm mb-10">15 Abr 2026 · 8 min de leitura</p>

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-8">
            <p>
              ANC é uma tecnologia em que microfones captam o ruído do ambiente e o fone gera uma onda inversa para reduzi-lo — principalmente sons graves e contínuos. Não é silêncio absoluto: vozes e ruídos repentinos podem passar, e o encaixe do headphone influencia muito o resultado.
            </p>
            <p>
              Todo headphone over-ear abafa um pouco o som. Mas só os modelos com ANC ativo fazem isso eletronicamente — e a diferença é enorme. Vamos explicar como funciona em linguagem humana, sem jargão técnico.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como o ANC ativo funciona na prática</h2>
            <p>
              O headphone tem microfones externos que captam os sons do ambiente em tempo real — motor de ônibus, ar-condicionado, barulho de escritório. Um processador analisa essas frequências e gera uma onda sonora invertida, tecnicamente chamada de "antifase". Essa onda se soma ao ruído original e o cancela antes de chegar ao seu ouvido. O resultado é silêncio — ou quase isso — para sons constantes e de baixa frequência.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">ANC ativo vs cancelamento passivo — qual a diferença real?</h2>
            <p>
              O cancelamento passivo acontece pelo isolamento físico: as almofadas grandes e o design fechado das conchas bloqueiam parte das ondas sonoras mecanicamente. Todo headphone over-ear fechado tem cancelamento passivo — não há eletrônica envolvida.
            </p>
            <p>
              O ANC ativo vai muito além: usa processamento eletrônico para neutralizar o ruído, sendo até 10x mais eficiente em sons de baixa frequência como motores e ar-condicionado. Saiba mais sobre a <Link to="/blog/anc-ativo-vs-cancelamento-passivo-diferenca" className="text-accent hover:underline">diferença entre ANC ativo e cancelamento passivo</Link>.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Para quais ruídos o ANC funciona melhor?</h2>
            <p>
              O ANC é mais eficiente em sons constantes e de baixa frequência: motor de avião, metrô, ar-condicionado de escritório, ruído de trânsito. Sons súbitos e agudos — como buzinas, palmas ou conversas próximas em volume alto — são menos cancelados. Para{" "}
              <Link to="/blog/headphone-home-office-anc" className="text-accent hover:underline">home office</Link>, academia e transporte público, o ANC resolve exatamente os ruídos mais comuns e incômodos.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quanto de ANC é suficiente para uso cotidiano?</h2>
            <p>
              O mercado oferece headphones com ANC de 20dB até 50dB. Para uso em home office, estudos e academia, 20dB de cancelamento já elimina os ruídos mais comuns. ANC acima de 40dB faz diferença real em ambientes extremos como aviões e obras próximas — mas para a maioria dos usuários brasileiros, 20dB entrega 90% do benefício a um custo muito menor. Descubra se o <Link to="/blog/headphone-cancelamento-de-ruido-vale-a-pena" className="text-accent hover:underline">headphone ANC vale a pena comprar?</Link>
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O ANC consome mais bateria?</h2>
            <p>
              Sim. O processamento eletrônico do ANC demanda energia extra. Por isso headphones com ANC sempre têm dois números de bateria: com e sem ANC ativo. O Meeky F5 ANC Pro, por exemplo, entrega 70h sem ANC e 40h com ANC ativo. Sempre consulte a especificação com ANC ligado — esse é o número que representa seu uso real. Veja mais detalhes no nosso artigo sobre{" "}
              <Link to="/blog/headphone-anc-70-horas-bateria-por-que-importa" className="text-accent hover:underline">por que a bateria com ANC importa</Link>.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O Meeky F5 ANC Pro tem ANC ativo de verdade?</h2>
            <p>
              Sim. O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> tem cancelamento ativo de até 20dB com microfones embutidos que processam o ruído em tempo real — não apenas isolamento passivo pelas almofadas. Por R$&nbsp;297 com frete nacional, é uma das melhores opções com ANC real disponíveis no Brasil hoje.
            </p>

            <BlogInlineCTA />

            <p>
              Veja também: <Link to="/blog/anc-prejudica-qualidade-do-som-headphone" className="text-accent hover:underline">ANC prejudica a qualidade do som?</Link> e <Link to="/blog/headphone-anc-funciona-em-aviao" className="text-accent hover:underline">headphone com ANC funciona em avião?</Link>
            </p>

            {/* FAQ */}
            <h2 className="font-display text-2xl font-bold text-foreground mt-16 mb-6">Perguntas frequentes</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-border rounded-sm p-4">
                  <summary className="font-display font-semibold text-foreground cursor-pointer list-none flex justify-between items-center">
                    {faq.question}
                    <span className="ml-2 text-accent group-open:rotate-45 transition-transform text-lg">+</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </article>

      <CTASection
        title="Conheça o Meeky F5 ANC Pro com ANC ativo real — R$ 297"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostANCBasicsPage;
