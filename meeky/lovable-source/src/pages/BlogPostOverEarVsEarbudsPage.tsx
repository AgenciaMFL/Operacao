import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";

const CANONICAL = "https://meeky.com.br/blog/headphone-over-ear-anc-ou-earbuds-anc-qual-escolher";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Headphone over-ear ANC ou earbuds ANC: qual escolher para trabalho e estudo",
  description: "Comparativo de formatos: quando escolher headphone over-ear com ANC vs earbuds com ANC para trabalho, estudo e uso prolongado. Isolamento, conforto, bateria e cancelamento reais.",
  datePublished: "2026-07-13",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio", url: "https://meeky.com.br/sobre#filipe-cardoso" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Over-ear com ANC cancela mais ruído do que earbud com ANC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Em geral sim, e o motivo é físico antes de ser eletrônico. O headphone over-ear já soma um isolamento passivo grande pelas almofadas grandes sobre a orelha, e o ANC ativo entra em cima disso. O earbud in-ear depende do ajuste da ponta de silicone no canal auditivo — se a vedação escapa, o ANC também escapa. Em ambiente controlado (avião, escritório) o over-ear tende a entregar cancelamento mais consistente.",
      },
    },
    {
      "@type": "Question",
      name: "Qual formato é mais confortável para 8 horas de uso?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depende da anatomia. Over-ear com almofadas de memory foam distribui o peso e não pressiona o canal auditivo, o que costuma ganhar em jornadas longas — mas esquenta em locais quentes. Earbud in-ear é leve e discreto, porém a pressão da ponta no canal cansa depois de algumas horas em muita gente. Para trabalho e estudo prolongado, over-ear é a escolha mais segura para conforto.",
      },
    },
    {
      "@type": "Question",
      name: "Earbud com ANC dura menos bateria?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, por design. Earbuds trabalham com baterias minúsculas dentro do bud e dependem do case para recarregar ao longo do dia — a autonomia por carga costuma ficar entre 5 e 8 horas com ANC ligado. Um over-ear tem espaço para bateria maior: o Meeky F5 ANC Pro, por exemplo, entrega 40 horas com ANC ativo em uma única carga. Para uma semana inteira de trabalho, over-ear resolve sem parar para carregar.",
      },
    },
    {
      "@type": "Question",
      name: "Earbud com ANC serve para chamadas de trabalho?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Serve bem, especialmente pela discrição e mobilidade — mas o microfone tende a captar mais ruído de vento e ambiente porque fica pendurado longe da boca. Over-ear com múltiplos microfones costuma entregar áudio de chamada mais estável em ambientes barulhentos. Se a maior parte das suas chamadas é em home office silencioso, os dois funcionam.",
      },
    },
    {
      "@type": "Question",
      name: "Vale a pena ter os dois formatos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para muita gente, sim. Over-ear para expediente longo, foco em casa, biblioteca e viagens; earbud in-ear para caminhada, academia leve e uso rápido no transporte público. Cada um resolve um cenário. Se você só pode ter um agora e o uso principal é trabalho e estudo, priorize over-ear com ANC ativo real.",
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
  { name: "Over-ear ANC ou earbuds ANC", url: CANONICAL },
]);

const BlogPostOverEarVsEarbudsPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="Headphone over-ear ANC ou earbuds ANC: qual escolher para trabalho e estudo"
        description="Comparativo direto de formato: quando o headphone over-ear com ANC vence os earbuds ANC em trabalho e estudo, e quando o earbud faz mais sentido."
        canonical={CANONICAL}
      />
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
            Headphone over-ear ANC ou earbuds ANC: qual escolher para trabalho e estudo
          </h1>
          <p className="text-muted-foreground text-sm mb-10">13 Jul 2026 · 8 min de leitura</p>

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-8">
            <p>
              Para uso prolongado em trabalho e estudo, o <strong>headphone over-ear com ANC ativo</strong> ganha da maioria dos earbuds ANC por três motivos objetivos: isolamento passivo maior (a concha já bloqueia som antes de a eletrônica entrar), bateria muito superior (dezenas de horas por carga contra 5–8 horas de earbud) e conforto ao longo de várias horas seguidas. O <strong>earbud in-ear com ANC</strong> vence quando o critério é mobilidade, discrição e uso rápido — não jornada longa.
            </p>
            <p>
              Este guia compara os dois formatos ponto a ponto para você decidir com base em como usa fone de verdade, sem depender de marca específica.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Qual formato bloqueia mais ruído no total?</h2>
            <p>
              Todo cancelamento de ruído tem duas camadas: o passivo (isolamento físico) e o ativo (o ANC eletrônico). Over-ear já parte na frente na camada passiva: as almofadas grandes cobrem toda a orelha e bloqueiam parte considerável de médios e agudos antes de o ANC ligar. O earbud in-ear depende inteiramente do ajuste da ponta de silicone dentro do canal auditivo — se a vedação falha, tanto o isolamento quanto o ANC ativo caem junto. Se quiser entender melhor essa distinção, veja o guia sobre{" "}
              <Link to="/blog/anc-ativo-vs-cancelamento-passivo-diferenca" className="text-accent hover:underline">ANC ativo vs cancelamento passivo</Link>.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Qual é mais confortável para expediente longo?</h2>
            <p>
              Conforto depende de anatomia, mas há um padrão claro: em jornadas de 6 a 10 horas, over-ear com almofadas de memory foam distribui o peso na cabeça e não pressiona o canal auditivo. A maior parte de quem passa oito horas em call ou em foco relata menos fadiga. O earbud in-ear é leve e some no ouvido, mas a pressão contínua da ponta cansa depois de algumas horas em boa parte dos usuários — e reposicionar o bud interrompe a concentração. Para uso profissional prolongado, over-ear é a aposta mais segura.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Qual dura mais bateria em uma semana de trabalho?</h2>
            <p>
              Aqui a diferença é física: over-ear tem espaço para bateria maior. O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link>, por exemplo, entrega 40 horas com ANC ativo e 70 horas sem ANC em uma única carga — dá para trabalhar uma semana inteira sem carregar. Earbuds ANC, mesmo os bons, ficam entre 5 e 8 horas de uso contínuo por carga, exigindo pausas no case ao longo do dia. Para quem não quer se preocupar com carregar toda hora, over-ear resolve. Entenda melhor{" "}
              <Link to="/blog/headphone-anc-70-horas-bateria-por-que-importa" className="text-accent hover:underline">por que a bateria com ANC importa</Link>.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Earbud tem alguma vantagem real sobre over-ear?</h2>
            <p>
              Sim, e não são poucas. Earbud é discreto (cabe no bolso), leve (não esquenta a cabeça), livre da haste de arco (não atrapalha para deitar ou usar boné), e melhor para atividade física de impacto leve, deslocamento e uso rápido. Para caminhada, transporte público e chamadas curtas em movimento, earbud ganha. O erro é usar earbud como fone principal de expediente prolongado — não é para isso que ele foi feito.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como decidir com base no seu uso principal?</h2>
            <p>
              Uma regra prática: se mais de 60% do seu uso é sentado, com fone por mais de 2 horas seguidas (home office, estudo, biblioteca, viagem longa), escolha <strong>over-ear com ANC ativo</strong>. Se mais de 60% é em movimento, com sessões curtas e trocas frequentes (rua, transporte, academia leve, chamadas rápidas), escolha <strong>earbud in-ear com ANC</strong>. Sempre que possível, priorize também isolamento passivo real, ANC ativo verificado (não só "redução de ruído para chamada") e autonomia condizente com sua rotina.
            </p>
            <p>
              Se está comparando um over-ear com ANC ativo contra um earbud sem ANC no áudio, o comparativo{" "}
              <Link to="/blog/meeky-f5-anc-pro-vs-redmi-buds-6-active-comparativo-2026" className="text-accent hover:underline">Meeky F5 ANC Pro vs Redmi Buds 6 Active</Link>{" "}
              mostra essa disputa de formato na prática.
            </p>

            <BlogInlineCTA />

            <p>
              Veja também:{" "}
              <Link to="/blog/o-que-e-cancelamento-de-ruido-ativo-anc" className="text-accent hover:underline">o que é ANC ativo</Link>{" "}
              e{" "}
              <Link to="/blog/headphone-home-office-anc" className="text-accent hover:underline">headphone com ANC para home office</Link>.
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
        title="Over-ear com ANC ativo real e 70h de bateria — R$ 297"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostOverEarVsEarbudsPage;
