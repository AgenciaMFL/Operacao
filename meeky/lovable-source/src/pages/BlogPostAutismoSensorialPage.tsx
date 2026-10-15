import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const PAGE_URL = "https://meeky.com.br/blog/headphone-anc-para-autista-hipersensibilidade-sensorial";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Headphone ANC para Autismo e Hipersensibilidade Sensorial: Guia Completo",
  description:
    "Como o cancelamento de ruído ativo pode ajudar em hipersensibilidade auditiva, o que considerar em conforto, pressão e uso responsável.",
  datePublished: "2026-06-22",
  dateModified: "2026-06-22",
  author: { "@type": "Person", name: "Fernanda Micchi", jobTitle: "Cofundadora, Meeky Audio", url: "https://meeky.com.br/sobre#fernanda-micchi" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
  image: "https://meeky.com.br/blog-covers/cover-home-office-anc.webp",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Headphone com ANC substitui abafador de ruído (ear muff)?",
      acceptedAnswer: { "@type": "Answer", text: "Não. Abafadores passivos oferecem isolamento mecânico contínuo, sem precisar de bateria. ANC é complementar: cancela ativamente ruído contínuo, mas precisa de energia e tem leves artefatos. Para crises sensoriais agudas em ambientes muito hostis, abafadores podem ser mais previsíveis; para uso prolongado e cotidiano, ANC é mais confortável e versátil." },
    },
    {
      "@type": "Question",
      name: "Crianças autistas podem usar headphone com ANC?",
      acceptedAnswer: { "@type": "Answer", text: "Pode ser uma ferramenta útil, mas a decisão deve envolver acompanhamento de profissional (terapeuta ocupacional, fonoaudiólogo). Critérios importantes: tamanho adequado para a cabeça da criança, peso baixo, pressão suave, volume limitado e supervisão de uso." },
    },
    {
      "@type": "Question",
      name: "Usar fone o dia todo prejudica a audição?",
      acceptedAnswer: { "@type": "Answer", text: "Não pelo fone em si — pelo volume. A OMS recomenda no máximo 60% do volume por até 60 minutos seguidos com pausas. ANC ajuda exatamente porque permite ouvir confortavelmente em volume mais baixo, sem precisar 'vencer' o ruído externo." },
    },
    {
      "@type": "Question",
      name: "O Meeky F5 ANC Pro é confortável para uso prolongado?",
      acceptedAnswer: { "@type": "Answer", text: "Foi projetado para isso: peso baixo, almofadas memory foam, pressão equilibrada do arco para evitar dor após horas de uso. Para sessões muito longas (4h+), recomendamos pausas conforme orientações gerais de saúde auditiva. Cada pessoa tem tolerância diferente — teste no seu uso real." },
    },
    {
      "@type": "Question",
      name: "Existe risco de aumentar a hipersensibilidade com uso constante?",
      acceptedAnswer: { "@type": "Answer", text: "Esse é um ponto legítimo levantado em literatura clínica. O uso prolongado e isolante pode, em alguns casos, reduzir a tolerância natural a sons cotidianos. Por isso reforçamos: este conteúdo é informativo. O uso de qualquer ferramenta de proteção auditiva em casos de TEA ou hipersensibilidade deve ser orientado por profissional de saúde qualificado." },
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "ANC para autismo e hipersensibilidade", url: PAGE_URL },
]);

const faqs = faqSchema.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));

const BlogPostAutismoSensorialPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="Headphone ANC para Autismo e Hipersensibilidade Sensorial"
        description="Como o cancelamento de ruído ativo pode ajudar em hipersensibilidade auditiva, o que considerar em conforto, pressão e uso responsável."
        canonical={PAGE_URL}
        ogImage="https://meeky.com.br/blog-covers/cover-home-office-anc.webp"
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
            Headphone ANC para Autismo e Hipersensibilidade Sensorial: Guia Completo
          </h1>
          <p className="text-muted-foreground text-sm mb-2">Por Fernanda Micchi · Cofundadora da Meeky Audio</p>
          <p className="text-muted-foreground text-sm mb-10">22 Jun 2026 · 8 min de leitura</p>

          <img
            src="/blog-covers/cover-home-office-anc.webp"
            alt="Headphone ANC como ferramenta de regulação sensorial"
            width={960}
            height={540}
            loading="eager"
            fetchPriority="high"
            className="w-full aspect-video object-cover rounded-sm mb-10"
          />

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
            <div className="bg-secondary border-l-2 border-accent p-4 rounded-sm not-italic">
              <p className="text-sm font-semibold text-foreground mb-2">⚠️ Nota importante</p>
              <p className="text-sm">
                Este conteúdo é informativo e <strong>não substitui orientação médica, terapêutica ou de profissional de saúde qualificado</strong>. Decisões sobre uso de ferramentas de regulação sensorial em casos de TEA, TPS ou hipersensibilidade auditiva devem ser tomadas com acompanhamento profissional, especialmente para crianças.
              </p>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Resposta direta</h2>
            <p>
              Para muitas pessoas com hipersensibilidade auditiva — incluindo pessoas no espectro autista (TEA), com transtorno do processamento sensorial (TPS), TDAH ou misofonia — o headphone com ANC pode ser uma <strong>ferramenta legítima de regulação</strong>. Reduz a sobrecarga de ruído ambiente, ajuda a manter foco e diminui o estresse em ambientes hostis. Mas não é solução universal: <strong>conforto, pressão e uso responsável importam tanto quanto o ANC em si</strong>.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como o ANC ajuda na prática</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Reduz ruído contínuo</strong> — geladeira, ar condicionado, ventilador, motor de carro. Sons que parecem invisíveis para muitos, mas são exaustivos para quem tem hipersensibilidade.</li>
              <li><strong>Atenua picos previsíveis</strong> — som de obra, trânsito, secador de cabelo do quarto ao lado.</li>
              <li><strong>Cria ambiente controlado</strong> — você decide o que entra: silêncio, música suave, ruído branco/marrom.</li>
              <li><strong>Funciona como sinal social</strong> — para algumas pessoas, o fone visível ajuda a comunicar "preciso de pausa" sem precisar verbalizar.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que considerar além do ANC</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Peso e pressão.</strong> Para uso prolongado, fone leve (~250g) com pressão equilibrada do arco. Fones pesados ou apertados podem virar fonte adicional de desconforto sensorial.</li>
              <li><strong>Material das almofadas.</strong> Memory foam macia, sem costura áspera tocando a pele. Tecido em vez de couro sintético pode ser mais confortável em climas quentes.</li>
              <li><strong>Botões físicos vs touch.</strong> Botões físicos com clique definido tendem a ser mais previsíveis que controles touch sensíveis (que podem disparar acidentalmente).</li>
              <li><strong>Sem reprodução de sons de notificação altos.</strong> "Bipes" de conexão ou voz de IA muito alta podem ser incômodos. Modelos com volume de feedback configurável são preferíveis.</li>
              <li><strong>Bateria longa.</strong> Evita ter que tirar o fone com frequência para carregar — quem usa como ferramenta de regulação não quer essa quebra de rotina.</li>
            </ul>

            <BlogInlineCTA />

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quando ANC é indicado (e quando não é)</h2>
            <p>
              <strong>Pode ajudar:</strong> ambientes urbanos ruidosos, escritórios abertos, transporte público, salas de aula, restaurantes movimentados, eventos sociais. Situações onde o ruído contínuo gera fadiga e sobrecarga.
            </p>
            <p>
              <strong>Pode não ser ideal:</strong> ambientes onde você precisa ouvir avisos de segurança (atravessar rua, dirigir, locais de trabalho com sinais sonoros), situações onde isolamento total agrava ansiedade, ou para crianças muito pequenas sem supervisão.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Meeky F5 ANC Pro nesse contexto</h2>
            <p>
              O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> tem características compatíveis com uso prolongado para regulação sensorial: ANC até 20dB para reduzir ruído contínuo, peso baixo, almofadas macias, botões físicos com clique definido, ANC desligável por botão dedicado (importante para alternar com modo ambiente quando precisar ouvir o entorno) e 70h de bateria (menos interrupções na rotina).
            </p>
            <p>
              Não é certificado nem comercializado como "produto médico ou terapêutico" — é um headphone com ANC que <em>pode ser útil</em> nesse contexto, conforme orientação profissional individual.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Uso responsável</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Volume sempre baixo — ANC permite ouvir confortável a 40–50%.</li>
              <li>Pausas regulares — não use 8h seguidas sem intervalo.</li>
              <li>Alterne com modo passivo (ANC desligado) ou sem fone, especialmente para preservar tolerância a sons cotidianos.</li>
              <li>Para crianças, sempre com supervisão e orientação profissional.</li>
              <li>Não substitui terapia, acompanhamento ou outras ferramentas indicadas pelo profissional.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Conclusão</h2>
            <p>
              ANC pode ser uma ferramenta útil para quem convive com hipersensibilidade auditiva — desde que escolhido com critério, usado com responsabilidade e integrado a um cuidado mais amplo, idealmente com apoio profissional. Não é solução mágica, mas pode tornar muitos ambientes do dia a dia mais acessíveis.
            </p>
            <p>
              Veja também:{" "}
              <Link to="/blog/headphone-anc-para-estudar" className="text-accent hover:underline">ANC para estudar</Link>,{" "}
              <Link to="/blog/headphone-anc-para-concurseiro" className="text-accent hover:underline">ANC para concurseiro</Link> e{" "}
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
        title="Meeky F5 ANC Pro — conforto e ANC eficaz por R$297"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostAutismoSensorialPage;
