import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Tag } from "lucide-react";
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
  headline: "ANC ativo vs cancelamento passivo: qual a diferença que importa na prática",
  description: "Muitas marcas vendem fones com 'ANC' que na prática é cancelamento passivo melhorado. Entenda a diferença real e como identificar antes de comprar.",
  datePublished: "2026-04-14",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio", url: "https://meeky.com.br/sobre#filipe-cardoso" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://meeky.com.br/blog/anc-ativo-vs-cancelamento-passivo-diferenca" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Como saber se um headphone tem ANC ativo de verdade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Verifique se a especificação menciona microfones externos para captação de ruído e se há dois dados de bateria diferentes — com e sem ANC. Se o produto anuncia apenas uma duração de bateria, provavelmente o cancelamento é passivo ou simbólico.",
      },
    },
    {
      "@type": "Question",
      name: "ANC passivo e ANC ativo são a mesma coisa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. O cancelamento passivo é isolamento físico pelas almofadas e design fechado — presente em qualquer headphone over-ear. O ANC ativo usa microfones e processamento eletrônico para neutralizar o ruído, sendo muito mais eficiente em sons constantes de baixa frequência.",
      },
    },
    {
      "@type": "Question",
      name: "O Basike tem ANC ativo de verdade?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Os modelos Basike com ANC têm cancelamento ativo, mas com potência de 20-30dB e bateria de 30h — sem dados claros de bateria com ANC ativo separados. Para uso cotidiano leve, funcionam. Para home office e academia intensos, o Meeky F5 ANC Pro entrega ANC mais confiável com 40h de autonomia real com ANC ativo.",
      },
    },
  ],
};

const faqs = [
  {
    q: "Como saber se um headphone tem ANC ativo de verdade?",
    a: "Verifique se a especificação menciona microfones externos para captação de ruído e se há dois dados de bateria diferentes — com e sem ANC. Se o produto anuncia apenas uma duração de bateria, provavelmente o cancelamento é passivo ou simbólico.",
  },
  {
    q: "ANC passivo e ANC ativo são a mesma coisa?",
    a: "Não. O cancelamento passivo é isolamento físico pelas almofadas e design fechado — presente em qualquer headphone over-ear. O ANC ativo usa microfones e processamento eletrônico para neutralizar o ruído, sendo muito mais eficiente em sons constantes de baixa frequência.",
  },
  {
    q: "O Basike tem ANC ativo de verdade?",
    a: "Os modelos Basike com ANC têm cancelamento ativo, mas com potência de 20-30dB e bateria de 30h — sem dados claros de bateria com ANC ativo separados. Para uso cotidiano leve, funcionam. Para home office e academia intensos, o Meeky F5 ANC Pro entrega ANC mais confiável com 40h de autonomia real com ANC ativo.",
  },
];

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "ANC ativo vs cancelamento passivo", url: "https://meeky.com.br/blog/anc-ativo-vs-cancelamento-passivo-diferenca" },
]);

const BlogPostANCvsPassivePage = () => {

  return (
    <Layout>
      <SEO ogType="article" title="ANC ativo vs cancelamento passivo: qual a diferença que importa na prática" description="Muitas marcas vendem fones com 'ANC' que na prática é cancelamento passivo melhorado. Entenda a diferença real e como identificar antes de comprar." canonical="https://meeky.com.br/blog/anc-ativo-vs-cancelamento-passivo-diferenca" />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="bg-primary">
        <div className="container-wide section-padding py-24 md:py-32">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-2 text-xs text-accent font-semibold tracking-wider uppercase mb-6 hover:underline">
              <ArrowLeft size={14} /> Blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase text-accent"><Tag size={12} /> Guias</span>
              <span className="text-xs text-primary-foreground/40">14 Abr 2026</span>
              <span className="inline-flex items-center gap-1 text-xs text-primary-foreground/40"><Clock size={12} /> 8 min</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight leading-tight">
              ANC ativo vs cancelamento passivo: qual a diferença que importa na prática
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="bg-background">
        <div className="container-wide section-padding py-12 md:py-16">
          <div className="max-w-3xl mx-auto prose-custom">

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Cancelamento passivo é o bloqueio físico do som pela vedação e pelos materiais do headphone. ANC ativo usa microfones e processamento para gerar uma onda inversa e reduzir ruído — mais eficiente em sons graves e contínuos. O melhor resultado vem da combinação dos dois.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Você colocou um headphone "com ANC" e ainda dá para ouvir tudo ao redor. Isso acontece porque existe uma diferença enorme entre cancelamento passivo e ANC ativo — e muitas marcas usam o mesmo nome para as duas coisas. Antes de comprar, entenda o que está pagando.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que é cancelamento passivo</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              O cancelamento passivo acontece pelo isolamento físico do design. As almofadas macias que pressionam as orelhas, o formato fechado das conchas e os materiais de espuma bloqueiam parte das ondas sonoras mecanicamente — como tampões de ouvido mais sofisticados. Qualquer headphone over-ear fechado tem cancelamento passivo. Não há chip, não há microfone, não há eletrônica envolvida.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que é ANC ativo de verdade</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              O ANC ativo usa microfones externos embutidos nas conchas que captam o som ambiente em milissegundos. Um processador analisa a frequência do ruído e gera uma onda sonora invertida — a "antifase" — que neutraliza o ruído antes que ele chegue ao ouvido. É tecnologia eletrônica real, que consome bateria e requer hardware específico. Headphones com ANC ativo verdadeiro sempre têm dois dados de bateria: com e sem ANC.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como identificar se o ANC é de verdade antes de comprar</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Verifique se a especificação menciona microfones externos. Procure dois números de bateria — com ANC e sem ANC. Se o produto anuncia apenas um número de bateria e "ANC", é provável que seja apenas cancelamento passivo com nome de marketing. Marcas como Basike têm modelos que anunciam "ANC" mas entregam principalmente isolamento passivo melhorado.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quando o cancelamento passivo é suficiente</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Para ambientes moderadamente silenciosos — estudo em casa sem barulho intenso, escritório tranquilo — o cancelamento passivo de um bom headphone over-ear resolve bem. Se você não fica em ambientes muito barulhentos por períodos longos, pode economizar optando por um modelo sem ANC ativo. Mas para quem trabalha em casa, veja nosso guia de <Link to="/blog/headphone-home-office-anc" className="text-accent hover:underline">headphone ANC para home office</Link>.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quando o ANC ativo é indispensável</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Em home office com barulho externo constante, academia com música ambiente alta, transporte público, open space com muitas pessoas falando ou qualquer ambiente com ruído contínuo de baixa frequência — o ANC ativo faz diferença real que o cancelamento passivo não consegue replicar. Descubra se o <Link to="/blog/headphone-cancelamento-de-ruido-vale-a-pena" className="text-accent hover:underline">headphone ANC vale a pena?</Link>
            </p>

            {/* Internal links */}
            <div className="bg-secondary border border-border rounded-sm p-6 my-10">
              <p className="text-sm font-semibold text-foreground mb-2">Leia também:</p>
              <ul className="space-y-2">
                <li>
                  <Link to="/blog/o-que-e-cancelamento-de-ruido-ativo-anc" className="text-sm text-accent hover:underline">
                    O que é cancelamento de ruído ativo (ANC)? Guia direto e sem enrolação
                  </Link>
                </li>
                <li>
                  <Link to="/blog/melhor-headphone-anc-ate-300-reais-brasil-2026" className="text-sm text-accent hover:underline">
                    Melhor headphone ANC até R$ 300: análise com preços reais de abril de 2026
                  </Link>
                </li>
              </ul>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O Meeky F5 ANC Pro tem ANC ativo de verdade?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Sim. O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> tem microfones embutidos que processam o ruído em tempo real, cancelamento ativo de até 20dB e dois dados de bateria distintos: 70h sem ANC e 40h com ANC ativo. Não é marketing — é hardware real que você sente na primeira vez que ativa o ANC em um ambiente barulhento.
            </p>

            <BlogInlineCTA />

            {/* FAQ */}
            <h2 className="font-display text-2xl font-bold text-foreground mt-16 mb-6">Perguntas frequentes</h2>
            <div className="space-y-6 mb-12">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-border rounded-sm">
                  <summary className="cursor-pointer px-6 py-4 text-sm font-semibold text-foreground flex items-center justify-between">
                    {faq.q}
                    <span className="ml-2 text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </article>

      <CTASection
        title="Experimente ANC ativo de verdade."
        subtitle="Meeky F5 ANC Pro por R$ 297 — com frete grátis e garantia de 12 meses."
        buttonText="CONHECER O MEEKY F5"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostANCvsPassivePage;
