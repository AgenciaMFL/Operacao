import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const PAGE_URL = "https://meeky.com.br/blog/headphone-anc-para-concurseiro";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Headphone ANC para Concurseiro: Vale a Pena em 2026?",
  description:
    "Como o cancelamento de ruído ajuda quem estuda para concurso em casa, biblioteca ou café — e o que considerar antes de comprar.",
  datePublished: "2026-06-22",
  dateModified: "2026-06-22",
  author: { "@type": "Person", name: "Fernanda Micchi", jobTitle: "Cofundadora, Meeky Audio", url: "https://meeky.com.br/sobre#fernanda-micchi" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
  image: "https://meeky.com.br/blog-covers/cover-anc-estudar.webp",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ANC realmente ajuda a estudar para concurso?",
      acceptedAnswer: { "@type": "Answer", text: "Sim, principalmente para quem estuda em casa com família, em biblioteca pública ou em café. O ANC reduz a carga cognitiva de ignorar barulho — seu cérebro deixa de gastar energia 'filtrando' sons e direciona mais foco para o conteúdo." },
    },
    {
      "@type": "Question",
      name: "É melhor estudar com música, ruído branco ou silêncio?",
      acceptedAnswer: { "@type": "Answer", text: "Depende da pessoa. Estudos mostram que a maioria absorve melhor em silêncio total ou com ruído branco/marrom; música com letra costuma atrapalhar em leitura e escrita. ANC permite que você escolha — silêncio sem barulho externo, ou ruído controlado por você." },
    },
    {
      "@type": "Question",
      name: "Quanto tempo posso usar o fone seguido sem desconforto?",
      acceptedAnswer: { "@type": "Answer", text: "Depende do peso, das almofadas e da pressão do arco. Modelos leves (~250g) com almofadas memory foam permitem sessões de 3–4h confortáveis. Recomendamos pausas de 10 minutos a cada 90 minutos para descanso auditivo, conforme orientações gerais de saúde auditiva." },
    },
    {
      "@type": "Question",
      name: "O Meeky F5 ANC Pro serve para concurseiro?",
      acceptedAnswer: { "@type": "Answer", text: "Sim — é uma opção pensada para essa rotina. ANC de até 20dB para atenuar barulho de casa e biblioteca, bateria de 70h (estuda por semanas sem se preocupar com tomada), conforto para sessões longas e preço acessível (R$297) para quem está economizando durante a preparação." },
    },
    {
      "@type": "Question",
      name: "Fone in-ear ou over-ear para estudar?",
      acceptedAnswer: { "@type": "Answer", text: "Over-ear é geralmente mais confortável para sessões longas (não pressiona o canal auditivo) e tem ANC mais eficaz. In-ear é mais portátil. Para concurseiro, que tipicamente estuda 4–8h por dia, over-ear costuma ser a melhor escolha." },
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "Headphone ANC para concurseiro", url: PAGE_URL },
]);

const faqs = faqSchema.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));

const BlogPostConcurseiroPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="Headphone ANC para Concurseiro: Vale a Pena em 2026?"
        description="Como o cancelamento de ruído ajuda quem estuda para concurso — em casa, biblioteca ou café — e o que considerar antes de comprar."
        canonical={PAGE_URL}
        ogImage="https://meeky.com.br/blog-covers/cover-anc-estudar.webp"
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
            Headphone ANC para Concurseiro: Vale a Pena em 2026?
          </h1>
          <p className="text-muted-foreground text-sm mb-2">Por Fernanda Micchi · Cofundadora da Meeky Audio</p>
          <p className="text-muted-foreground text-sm mb-10">22 Jun 2026 · 7 min de leitura</p>

          <img
            src="/blog-covers/cover-anc-estudar.webp"
            alt="Concurseiro estudando com headphone ANC em casa"
            width={960}
            height={540}
            loading="eager"
            fetchPriority="high"
            className="w-full aspect-video object-cover rounded-sm mb-10"
          />

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Resposta direta</h2>
            <p>
              Para quem prepara concurso, ANC vale muito a pena — mas não pelos motivos óbvios. Mais do que "silenciar barulho", o ANC <strong>reduz a carga cognitiva de ignorar interferências</strong>, e isso muda diretamente a qualidade do estudo: você cansa menos, mantém o foco por mais tempo e tem sessões mais produtivas no mesmo número de horas.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">A realidade de estudar para concurso no Brasil</h2>
            <p>
              Concurseiro estuda <strong>onde dá</strong>. Em casa com família trabalhando, com cachorro latindo, obra do vizinho, tv ligada. Em biblioteca pública com gente conversando e celular tocando. Em café com música alta e máquina de espresso. Cada um desses ambientes drena foco silenciosamente — o cérebro <em>parece</em> ignorar o barulho, mas está gastando energia para fazê-lo. Ao fim de 4 horas, você está mais cansado do que estaria em silêncio.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como o ANC ajuda na prática</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Menos esforço para ignorar barulho</strong> — o cérebro processa menos ruído, sobra mais para o conteúdo.</li>
              <li><strong>Sessões mais longas com qualidade</strong> — você não desiste depois de 1h por fadiga auditiva.</li>
              <li><strong>Ambiente controlado em qualquer lugar</strong> — biblioteca lotada vira sala silenciosa.</li>
              <li><strong>Sinal visual de "não me interrompa"</strong> — em casa, fone na cabeça ajuda a definir limite com a família.</li>
            </ul>

            <BlogInlineCTA />

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que considerar ao comprar</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Conforto acima de tudo:</strong> você vai usar 4–8h por dia. Peso baixo, almofadas memory foam e pressão equilibrada importam mais que ANC.</li>
              <li><strong>Bateria longa:</strong> evita ansiedade de "vai descarregar no meio do estudo". Modelos com 60h+ permitem estudar a semana inteira em uma carga.</li>
              <li><strong>ANC eficaz para baixas frequências:</strong> o que mais incomoda em casa (geladeira, ar condicionado, motor de carro lá fora) é grave — onde ANC funciona melhor.</li>
              <li><strong>Microfone decente:</strong> útil para participar de aulas ao vivo, mentorias e simulados em grupo.</li>
              <li><strong>Preço honesto:</strong> concurseiro normalmente está economizando. Pagar R$1.500 em fone premium não compensa quando alternativas de R$300 entregam 90% do resultado.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Meeky F5 ANC Pro para concurseiro</h2>
            <p>
              O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> reúne o conjunto adequado para essa rotina: ANC de até 20dB, 70h de bateria (cobre semanas inteiras de estudo), conforto para sessões longas, microfone para aulas ao vivo e preço de R$297 com nota fiscal e garantia de 12 meses. É o tipo de compra que você faz uma vez e usa por toda a preparação.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Rotina sugerida com ANC</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Blocos de 90 minutos com fone, 10–15 minutos de pausa sem fone (descanso auditivo).</li>
              <li>Use silêncio puro com ANC, ou ruído branco/marrom em volume baixo — evite música com letra durante leitura.</li>
              <li>Mantenha o volume em ~50% — ANC permite ouvir confortável sem precisar elevar.</li>
              <li>Carregue uma vez por semana, antes do final de semana.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Conclusão</h2>
            <p>
              Para concurseiro, ANC não é luxo — é ferramenta de produtividade. A diferença entre estudar com e sem aparece em cansaço, foco mantido e quantidade de conteúdo absorvido por hora. E não precisa ser caro: até R$300 já existem opções honestas e duradouras no Brasil.
            </p>
            <p>
              Veja também:{" "}
              <Link to="/blog/headphone-anc-para-estudar" className="text-accent hover:underline">headphone ANC para estudar</Link>,{" "}
              <Link to="/blog/headphone-anc-para-autista-hipersensibilidade-sensorial" className="text-accent hover:underline">ANC para hipersensibilidade sensorial</Link> e{" "}
              <Link to="/blog/quanto-dura-bateria-headphone-anc-na-pratica" className="text-accent hover:underline">bateria na prática</Link>.
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
        title="Estude com foco: Meeky F5 ANC Pro por R$297 — 70h de bateria"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostConcurseiroPage;
