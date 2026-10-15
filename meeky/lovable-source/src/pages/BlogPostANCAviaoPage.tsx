import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const PAGE_URL = "https://meeky.com.br/blog/headphone-anc-funciona-em-aviao";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Headphone com ANC Funciona em Avião? A Resposta Definitiva",
  description:
    "Por que avião é o cenário ideal para ANC, como o cancelamento processa o ruído contínuo do motor e o que esperar de verdade durante o voo.",
  datePublished: "2026-06-22",
  dateModified: "2026-06-22",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio", url: "https://meeky.com.br/sobre#filipe-cardoso" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
  image: "https://meeky.com.br/blog-covers/cover-anc-vale-a-pena.webp",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Posso usar headphone Bluetooth durante o voo?",
      acceptedAnswer: { "@type": "Answer", text: "Sim. Desde 2013 (FAA) e 2014 (ANAC), o uso de Bluetooth é permitido em modo avião durante todas as fases do voo na maioria das companhias. Confirme com a tripulação na decolagem e pouso." },
    },
    {
      "@type": "Question",
      name: "Quanto o ANC reduz o ruído do motor do avião?",
      acceptedAnswer: { "@type": "Answer", text: "Em um avião comercial típico (~85 dB de cabine), um ANC de qualidade reduz a sensação para algo equivalente a ~65 dB — comparável a um café tranquilo. A redução é mais eficaz em frequências graves (motor, ar condicionado), menos em vozes e anúncios." },
    },
    {
      "@type": "Question",
      name: "O ANC do Meeky F5 ANC Pro funciona bem em avião?",
      acceptedAnswer: { "@type": "Answer", text: "Sim. O Meeky F5 ANC Pro tem até 20dB de redução ativa, certificação Anatel e bateria de 70h com ANC ligado — suficiente para múltiplos voos longos sem recarregar. Em testes em voos domésticos e internacionais (jun/2026), atenua bem o ruído contínuo do motor, principal incômodo da viagem." },
    },
    {
      "@type": "Question",
      name: "Adaptador para tomada do avião funciona com headphone Bluetooth?",
      acceptedAnswer: { "@type": "Answer", text: "Não diretamente — os jacks de entretenimento de bordo são analógicos (P2 duplo). Para usar Bluetooth, você precisa de um transmissor Bluetooth de avião (vendido por marcas como Twelve South AirFly). Vale o investimento se você voa com frequência em rotas longas." },
    },
    {
      "@type": "Question",
      name: "O ANC ajuda a dormir no avião?",
      acceptedAnswer: { "@type": "Answer", text: "Muito. Reduz o estresse auditivo contínuo (que mesmo inconscientemente cansa o cérebro), facilitando relaxamento. Para dormir confortavelmente, considere também o peso e a pressão do fone — modelos leves e com almofadas macias são mais adequados para uso prolongado deitado." },
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "Headphone com ANC em avião", url: PAGE_URL },
]);

const faqs = faqSchema.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));

const BlogPostANCAviaoPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="Headphone com ANC Funciona em Avião? Resposta Definitiva"
        description="Por que avião é o cenário ideal para ANC, como o cancelamento processa o ruído contínuo do motor e o que esperar durante o voo."
        canonical={PAGE_URL}
        ogImage="https://meeky.com.br/blog-covers/cover-anc-vale-a-pena.webp"
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
            Headphone com ANC Funciona em Avião? A Resposta Definitiva
          </h1>
          <p className="text-muted-foreground text-sm mb-2">Por Filipe Cardoso · Cofundador da Meeky Audio</p>
          <p className="text-muted-foreground text-sm mb-10">22 Jun 2026 · 7 min de leitura</p>

          <img
            src="/blog-covers/cover-anc-vale-a-pena.webp"
            alt="Uso de headphone com ANC durante voo comercial"
            width={960}
            height={540}
            loading="eager"
            fetchPriority="high"
            className="w-full aspect-video object-cover rounded-sm mb-10"
          />

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Resposta direta</h2>
            <p>
              Sim — e o avião é, na verdade, <strong>o cenário onde o ANC mais brilha</strong>. O ruído contínuo e previsível do motor é exatamente o tipo de som que a tecnologia de cancelamento ativo é melhor projetada para atenuar. A diferença entre voar com ANC e sem é dramática: a viagem fica menos cansativa, você ouve música em volume confortável e dorme melhor.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Por que avião é o cenário ideal para ANC</h2>
            <p>
              ANC funciona melhor com <strong>ruídos contínuos e previsíveis</strong> (baixas frequências, estáveis no tempo) — exatamente o perfil do motor de avião, do ar condicionado da cabine e do fluxo de ar pelas paredes. Em um voo comercial, esses três sons somam ~80–90 dB de ruído contínuo. Um ANC de qualidade reduz isso em ~20 dB perceptivos, levando a cabine para um patamar comparável a um escritório tranquilo.
            </p>
            <p>
              Em compensação, o ANC <strong>não cancela bem vozes humanas, choro de bebê, anúncios pelo alto-falante ou movimentos súbitos</strong>. Isso é técnico, não falha do produto: esses sons são imprevisíveis e ricos em frequências médias/altas, fora da zona ideal do ANC.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que você ganha na prática</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Música em volume mais baixo</strong> — sem competir com o motor, você ouve confortável a ~50% do volume.</li>
              <li><strong>Menos fadiga auditiva</strong> — o cérebro deixa de processar ruído contínuo, e você desembarca menos exausto.</li>
              <li><strong>Sono mais fácil</strong> — o silêncio relativo ajuda a relaxar, especialmente em voos noturnos.</li>
              <li><strong>Conversas mais leves</strong> — você consegue ouvir o vizinho de poltrona sem precisar gritar.</li>
            </ul>

            <BlogInlineCTA />

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que esperar (e o que não esperar)</h2>
            <p>
              Esperar: <strong>silêncio relativo</strong>, fadiga reduzida e música/filme em qualidade superior à dos fones do avião. Não esperar: silêncio total (nenhum ANC do mundo cancela 100%), cancelamento de bebês chorando ou de anúncios da tripulação (na verdade, isso é bom — você não quer perder anúncios de segurança).
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Por que o Meeky F5 ANC Pro funciona bem para voos</h2>
            <p>
              O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> tem três características práticas que importam em viagens:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ANC até 20dB</strong> — atenuação consistente do ruído contínuo do motor.</li>
              <li><strong>70h de bateria</strong> — você esquece o carregador e ainda sobra para a viagem inteira (ida + volta + uso entre voos).</li>
              <li><strong>Certificação Anatel</strong> — compatível com a regulamentação brasileira, sem risco em fiscalizações.</li>
              <li><strong>Peso baixo e almofadas macias</strong> — confortável para usar por horas seguidas em poltrona apertada.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Dicas práticas de uso em voo</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Coloque o fone <strong>antes</strong> da decolagem — o ANC ajuda também com a variação de pressão.</li>
              <li>Carregue na véspera. Mesmo com 70h, evite começar a viagem na reserva.</li>
              <li>Para entretenimento de bordo, leve um adaptador Bluetooth de avião (AirFly tipo) ou use o celular.</li>
              <li>Em pouso e decolagem, mantenha ANC ligado mas baixe o volume da música para ouvir avisos.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Conclusão</h2>
            <p>
              ANC em avião não é luxo — é a diferença entre desembarcar cansado ou descansado. Para voos acima de 2h, a tecnologia paga o investimento já na primeira viagem.
            </p>
            <p>
              Veja também:{" "}
              <Link to="/blog/anc-prejudica-qualidade-do-som-headphone" className="text-accent hover:underline">ANC prejudica a qualidade do som?</Link>,{" "}
              <Link to="/blog/quanto-dura-bateria-headphone-anc-na-pratica" className="text-accent hover:underline">quanto dura a bateria na prática</Link> e{" "}
              <Link to="/blog/o-que-e-cancelamento-de-ruido-ativo-anc" className="text-accent hover:underline">o que é ANC</Link>.
            </p>

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
        title="Voe melhor: Meeky F5 ANC Pro por R$297 com 70h de bateria"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostANCAviaoPage;
