import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Tag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";
import heroImage from "@/assets/lifestyle-boxing-seated.webp";
import lifestyleImage from "@/assets/lifestyle-urban-controls.webp";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Ritual de foco antes do treino: como o cancelamento de ruído muda sua performance",
  description: "Atletas de alta performance usam rituais mentais antes do treino. Descubra como o cancelamento de ruído ativo potencializa o estado de foco e prepara o cérebro para performance máxima.",
  datePublished: "2026-05-25T00:00:00-03:00",
  dateModified: "2026-05-25T00:00:00-03:00",
  author: { "@type": "Person", name: "Fernanda Micchi", jobTitle: "Cofundadora, Meeky Audio", url: "https://meeky.com.br/sobre#fernanda-micchi" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/og-image.jpg" },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://meeky.com.br/blog/ritual-de-foco-antes-do-treino-cancelamento-de-ruido",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Cancelamento de ruído realmente melhora a performance no treino?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O cancelamento de ruído não melhora diretamente a execução dos exercícios, mas melhora o estado mental que antecede e envolve o treino. Ao reduzir a exposição a ruídos imprevisíveis, o ANC diminui a ativação da amígdala e preserva recursos cognitivos para foco e tomada de decisão — aspectos críticos para atletas de alto rendimento.",
      },
    },
    {
      "@type": "Question",
      name: "Qual é o melhor momento para usar headphone ANC na rotina de treinos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Os momentos mais eficazes são o deslocamento até o local de treino, o aquecimento mental individual, os intervalos de recuperação entre sessões e os dias de descanso ativo. Durante atividades que exigem comunicação — como treinos em grupo ou com coach — o uso deve ser adaptado para o modo transparência ou removido.",
      },
    },
    {
      "@type": "Question",
      name: "Quantas horas de bateria preciso para minha rotina de treinos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para uma rotina de 5 treinos semanais com 30 a 60 minutos de deslocamento por sessão, você gasta entre 5 e 8 horas de bateria por semana. O Meeky F5 ANC Pro oferece 70 horas sem ANC e 40 horas com ANC ativo — suficiente para 5 a 8 semanas de rotina sem recarregar.",
      },
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "Ritual de foco antes do treino", url: "https://meeky.com.br/blog/ritual-de-foco-antes-do-treino-cancelamento-de-ruido" },
]);

const BlogPostRitualFocoTreinoPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="Ritual de foco antes do treino: como o cancelamento de ruído muda sua performance | Meeky Audio"
        description="Atletas de alta performance usam rituais mentais antes do treino. Descubra como o cancelamento de ruído ativo potencializa o estado de foco e prepara o cérebro para performance máxima."
        canonical="https://meeky.com.br/blog/ritual-de-foco-antes-do-treino-cancelamento-de-ruido"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <JsonLd data={breadcrumbSchema} />

      <article className="bg-background">
        <div className="container-wide section-padding py-12 md:py-20 max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors mb-8">
            <ArrowLeft size={14} /> Voltar ao blog
          </Link>

          <div className="rounded-sm overflow-hidden mb-8 bg-secondary">
            <img
              src={heroImage}
              alt="Atleta com headphone Meeky F5 ANC Pro em ritual de foco antes do treino"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              fetchPriority="high"
              loading="eager"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><Tag size={12} /> Performance</span>
            <span>25 Mai 2026</span>
            <span className="flex items-center gap-1"><Clock size={12} /> 5 min de leitura</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-8 leading-tight">
            Ritual de foco antes do treino: como o cancelamento de ruído muda sua performance
          </h1>

          <div className="prose prose-lg prose-neutral max-w-none text-foreground/90 leading-relaxed space-y-6">
            <p>
              Atletas de elite têm rituais. Não por superstição — por neurociência. O cérebro responde a sinais físicos e sensoriais que anunciam o que está por vir. Quando você repete um comportamento antes de cada treino, o sistema nervoso aprende a associar aquele sinal ao estado de alta performance. O cancelamento de ruído ativo é um desses sinais.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-4">O que a ciência diz sobre rituais pré-treino</h2>
            <p>
              Pesquisas em psicologia esportiva mostram que rituais pré-performance reduzem ansiedade, aumentam a concentração e melhoram a consistência de resultados. O ritual não precisa ser complexo — precisa ser consistente. Um headphone ANC colocado sempre antes do aquecimento mental vira um gatilho neural: modo performance ativado.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-4">Como o ruído ambiental afeta sua performance</h2>
            <p>
              O barulho não é neutro. Ruídos imprevisíveis — trânsito, conversas, notificações — ativam a amígdala e consomem recursos cognitivos que poderiam estar direcionados para o treino. Estudos de neurociência cognitiva mostram que ambientes ruidosos aumentam os níveis de cortisol e reduzem a capacidade de foco sustentado.
            </p>
            <p>
              Para atletas, isso se traduz em menor qualidade de aquecimento mental e maior dispersão durante o treino.
            </p>

            <div className="rounded-sm overflow-hidden my-8 bg-secondary">
              <img
                src={lifestyleImage}
                alt="Headphone Meeky F5 ANC Pro em uso urbano com controles ao alcance"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-4">Construindo seu ritual com cancelamento de ruído</h2>
            <p>O ritual funciona pela repetição e pela consistência. Sugestão de protocolo:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>No deslocamento:</strong> ANC ativo, playlist de preparação mental, sem redes sociais.</li>
              <li><strong>No aquecimento:</strong> modo transparência para consciência do ambiente, música de transição.</li>
              <li><strong>Nos primeiros minutos na box:</strong> retirar o fone como sinal de entrada total no treino.</li>
            </ol>
            <p>
              A sequência cria uma rampa de ativação — do estado cotidiano para o estado de performance — usando o headphone como marcador físico de cada transição.
            </p>

            <BlogInlineCTA />

            <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-4">Por que o ANC funciona melhor que simples isolamento passivo</h2>
            <p>
              Fones comuns bloqueiam parte do som mecanicamente. O ANC vai além: analisa o ruído ambiente em tempo real e gera uma onda sonora inversa que neutraliza o barulho antes de chegar ao ouvido. O resultado é um silêncio mais completo e menos fatigante — porque o cérebro não precisa "filtrar" o ruído que sobrou.
            </p>
            <p>
              Para rituais de foco, isso significa um ambiente mental mais limpo e mais rápido de alcançar.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-4">Meeky F5 ANC Pro: o parceiro do ritual</h2>
            <p>
              Com cancelamento de ruído ativo de até 20dB, Bluetooth 5.4, 70 horas de bateria e certificação IPX4, o <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> foi desenvolvido para quem leva a rotina de performance a sério. Frete grátis para todo o Brasil. Garantia de 12 meses. Anatel certificado.
            </p>

            <Link to="/headphone-anc-meeky-f5-pro" className="inline-flex items-center gap-2 text-accent font-semibold hover:underline mt-4">
              Conheça o Meeky F5 ANC Pro <ArrowRight size={16} />
            </Link>

            <hr className="border-border my-10" />

            <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-4">Perguntas frequentes</h2>
            <div className="space-y-6">
              {faqSchema.mainEntity.map((faq, i) => (
                <div key={i}>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{faq.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>

            <hr className="border-border my-10" />

            <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-4">Leia também</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/blog/headphone-anc-academia" className="text-accent hover:underline inline-flex items-center gap-1">
                  Headphone ANC para academia: funciona durante o treino? <ArrowRight size={14} />
                </Link>
              </li>
              <li>
                <Link to="/blog/headphone-anc-para-estudar" className="text-accent hover:underline inline-flex items-center gap-1">
                  Headphone ANC para estudar: concentração de verdade ou só marketing? <ArrowRight size={14} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </article>

      <CTASection
        title="Seu ritual. Sua performance."
        subtitle="Conheça o headphone com ANC que prepara seu cérebro para o treino."
        buttonText="COMPRAR O MEEKY"
        buttonLink="/checkout"
        variant="light"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostRitualFocoTreinoPage;
