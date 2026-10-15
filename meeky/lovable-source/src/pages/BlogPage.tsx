import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
]);

const categories = [
  "Todos",
  "Guias",
  "Reviews",
];

const posts = [
  {
    slug: "headphone-over-ear-anc-ou-earbuds-anc-qual-escolher",
    category: "Guias",
    title: "Headphone Over-Ear ANC ou Earbuds ANC: Qual Escolher para Trabalho e Estudo",
    excerpt: "Comparativo de formato (não de marca) para decidir entre concha over-ear e in-ear: isolamento, conforto em uso prolongado, bateria e cancelamento reais.",
    date: "2026-07-13",
    dateDisplay: "13 Jul 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-anc-ativo-vs-passivo.webp",
  },
  {
    slug: "multiponto-bluetooth-conectar-notebook-e-celular",
    category: "Guias",
    title: "Multiponto Bluetooth na Prática: Como Conectar Notebook e Celular ao Mesmo Tempo",
    excerpt: "Guia técnico do multipoint no Bluetooth 5.4 do Meeky F5: passo a passo para parear em dois dispositivos e casos de uso reais no dia a dia.",
    date: "2026-07-13",
    dateDisplay: "13 Jul 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-jbl-vs-meeky.webp",
  },
  {
    slug: "guia-presente-corporativo-brindes-tecnologia-rh",
    category: "Guias",
    title: "Guia de Presente Corporativo: Brindes de Tecnologia que Fazem Sentido pro RH",
    excerpt: "Como o RH escolhe brinde corporativo de tecnologia sem errar: utilidade real, percepção de qualidade, custo por unidade em volume e homologação Anatel.",
    date: "2026-07-13",
    dateDisplay: "13 Jul 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-70-horas-bateria.webp",
  },
  {
    slug: "meeky-f5-anc-pro-vs-redmi-buds-6-active-comparativo-2026",
    category: "Reviews",
    title: "Meeky F5 ANC Pro vs Redmi Buds 6 Active: Comparativo Completo 2026",
    excerpt: "Comparativo honesto entre Meeky F5 ANC Pro (headphone over-ear com ANC ativo) e Redmi Buds 6 Active (earbud sem ANC): bateria, cancelamento, Bluetooth 5.4 e garantia no Brasil.",
    date: "2026-07-13",
    dateDisplay: "13 Jul 2026",
    readTime: "9 min",
    coverImage: "/blog-covers/cover-melhor-anc-300.webp",
  },
  {
    slug: "ldac-vs-aac-vs-sbc-diferenca-headphone-bluetooth",
    category: "Guias",
    title: "LDAC vs AAC vs SBC: Qual Codec Bluetooth Escolher (2026)",
    excerpt: "Diferença real entre LDAC, AAC e SBC em headphones Bluetooth: qualidade, latência, compatibilidade Android/iPhone e quando importa de verdade.",
    date: "2026-06-22",
    dateDisplay: "22 Jun 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-review-f5.webp",
  },
  {
    slug: "headphone-anc-funciona-em-aviao",
    category: "Guias",
    title: "Headphone com ANC Funciona em Avião? A Resposta Definitiva",
    excerpt: "Por que avião é o cenário ideal para ANC, como o cancelamento processa o ruído contínuo do motor e o que esperar durante o voo.",
    date: "2026-06-22",
    dateDisplay: "22 Jun 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-anc-vale-a-pena.webp",
  },
  {
    slug: "headphone-anc-para-concurseiro",
    category: "Guias",
    title: "Headphone ANC para Concurseiro: Vale a Pena em 2026?",
    excerpt: "Como o cancelamento de ruído ajuda quem estuda para concurso em casa, biblioteca ou café — e o que considerar antes de comprar.",
    date: "2026-06-22",
    dateDisplay: "22 Jun 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-anc-estudar.webp",
  },
  {
    slug: "anc-prejudica-qualidade-do-som-headphone",
    category: "Guias",
    title: "ANC Prejudica a Qualidade do Som? A Verdade Sem Marketing",
    excerpt: "ANC ativo pode gerar leve hissing e artefatos. Entenda quando ligar, quando desligar e como isso afeta a qualidade da música.",
    date: "2026-06-22",
    dateDisplay: "22 Jun 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-o-que-e-anc.webp",
  },
  {
    slug: "headphone-anc-para-autista-hipersensibilidade-sensorial",
    category: "Guias",
    title: "Headphone ANC para Autismo e Hipersensibilidade Sensorial: Guia Completo",
    excerpt: "Como o cancelamento de ruído ativo pode ajudar em hipersensibilidade auditiva, o que considerar em conforto, pressão e uso responsável.",
    date: "2026-06-22",
    dateDisplay: "22 Jun 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-home-office-anc.webp",
  },
  {
    slug: "quanto-dura-bateria-headphone-anc-na-pratica",
    category: "Guias",
    title: "Quanto Dura a Bateria de Headphone ANC na Prática? (Teste Real)",
    excerpt: "Bateria anunciada vs real: fatores que afetam, como calcular para seu uso e comparativo 70h Meeky vs 40h QCY vs 44h JBL em dias reais.",
    date: "2026-06-22",
    dateDisplay: "22 Jun 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-bateria-muda-tudo.webp",
  },
  {
    slug: "headphone-anc-para-programador-desenvolvedor",
    category: "Guias",
    title: "Headphone ANC para Programador: O Que Considerar Antes de Comprar",
    excerpt: "Foco profundo, calls, multiponto, LDAC para Android e compatibilidade — guia objetivo de headphone ANC para desenvolvedor em 2026.",
    date: "2026-06-22",
    dateDisplay: "22 Jun 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-anc-academia.webp",
  },
  {
    slug: "bluetooth-54-53-50-diferenca-headphone",
    category: "Guias",
    title: "Bluetooth 5.4 vs 5.3 vs 5.0: Faz Diferença no Headphone?",
    excerpt: "Diferenças reais entre Bluetooth 5.4, 5.3 e 5.0 em headphones: latência, alcance, consumo, LE Audio — o que importa de fato.",
    date: "2026-06-22",
    dateDisplay: "22 Jun 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-70-horas-bateria.webp",
  },
  {
    slug: "meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026",
    category: "Reviews",
    title: "Meeky F5 ANC Pro vs Anker Soundcore Q20i: Qual Escolher em 2026?",
    excerpt: "Comparativo direto entre Meeky F5 ANC Pro e Anker Soundcore Q20i em 2026: bateria, ANC, Bluetooth, LDAC, multiponto, garantia e suporte no Brasil.",
    date: "2026-06-21",
    dateDisplay: "21 Jun 2026",
    readTime: "9 min",
    coverImage: "/blog-covers/cover-f5-vs-qcy.webp",
  },
  {
    slug: "melhor-headphone-anc-ate-300-reais-brasil-2026",
    category: "Guias",
    title: "Melhor Headphone ANC até R$300 no Brasil (2026): Guia Definitivo",
    excerpt: "Guia definitivo do melhor headphone ANC até R$300 no Brasil em 2026: Meeky F5 ANC Pro, QCY H3, Edifier W820NB Plus e JBL 770NC comparados em testes reais.",
    date: "2026-06-02",
    dateDisplay: "02 Jun 2026",
    readTime: "12 min",
    coverImage: "/blog-covers/cover-melhor-anc-300.webp",
  },
  {
    slug: "meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc-comparativo-2026",
    category: "Reviews",
    title: "Meeky F5 ANC Pro vs QCY H3 vs JBL 770NC: Comparativo Real (2026)",
    excerpt: "Comparativo honesto entre Meeky F5 ANC Pro, QCY H3 e JBL Tune 770NC em testes reais de 2026: ANC, bateria, LDAC, conectividade, garantia e custo-benefício.",
    date: "2026-06-02",
    dateDisplay: "02 Jun 2026",
    readTime: "10 min",
    coverImage: "/blog-covers/cover-f5-vs-qcy.webp",
  },
  {
    slug: "headphone-cancelamento-de-ruido-vale-a-pena",
    category: "Guias",
    title: "Headphone com cancelamento de ruído vale a pena? Tudo que você precisa saber em 2026",
    excerpt: "Descubra se o headphone com cancelamento de ruído ativo (ANC) realmente vale a pena. Explicamos como funciona, para quem é indicado e como escolher o melhor custo-benefício.",
    date: "2026-04-14",
    dateDisplay: "14 Abr 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-anc-vale-a-pena.webp",
  },
  {
    slug: "headphone-home-office-anc",
    category: "Guias",
    title: "Headphone para home office com ANC: o que ninguém te conta antes de comprar",
    excerpt: "Descubra por que o headphone certo para home office vai além do preço. ANC, microfone, bateria e conforto — o que realmente importa para quem trabalha em casa.",
    date: "2026-04-15",
    dateDisplay: "15 Abr 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-home-office-anc.webp",
  },
  {
    slug: "headphone-70-horas-bateria",
    category: "Guias",
    title: "70 horas de bateria no headphone: o que muda na sua rotina (e por que isso importa mais do que parece)",
    excerpt: "Entenda o que 70 horas de autonomia significam na prática, por que a bateria importa mais do que parece e como isso muda o dia a dia de quem usa o fone como ferramenta de trabalho.",
    date: "2026-04-15",
    dateDisplay: "15 Abr 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-70-horas-bateria.webp",
  },
  {
    slug: "headphone-anc-para-estudar",
    category: "Guias",
    title: "Headphone ANC para estudar: concentração de verdade ou só marketing?",
    excerpt: "O headphone com ANC realmente ajuda a estudar? Explicamos a ciência por trás da concentração, como o cancelamento de ruído impacta o aprendizado e qual é o melhor fone para estudar em 2026.",
    date: "2026-04-16",
    dateDisplay: "16 Abr 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-anc-estudar.webp",
  },
  {
    slug: "headphone-anc-academia",
    category: "Guias",
    title: "Headphone ANC para academia: funciona mesmo durante o treino?",
    excerpt: "Headphone com cancelamento de ruído na academia: vale a pena? Explicamos o que o ANC resolve no treino, o que não resolve, e qual é o melhor fone para quem treina com foco e intensidade.",
    date: "2026-04-17",
    dateDisplay: "17 Abr 2026",
    readTime: "7 min",
    coverImage: "/blog-covers/cover-anc-academia.webp",
  },
  {
    slug: "meeky-f5-anc-pro-review",
    category: "Reviews",
    title: "Meeky F5 ANC Pro — Review completo: vale a pena em 2026?",
    excerpt: "Review completo do Meeky F5 ANC Pro: analisamos cancelamento de ruído, qualidade de áudio, conforto, bateria de 70 horas, microfone e custo-benefício. Vale a pena comprar?",
    date: "2026-04-18",
    dateDisplay: "18 Abr 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-review-f5.webp",
  },
  {
    slug: "meeky-f5-anc-pro-vs-qcy-h3",
    category: "Reviews",
    title: "Meeky F5 ANC Pro vs QCY H3: comparativo honesto com dados reais",
    excerpt: "Meeky F5 e QCY H3 custam quase o mesmo em abril de 2026. Mas qual entrega mais no dia a dia? Comparamos bateria, ANC, microfone e garantia com dados reais.",
    date: "2026-04-20",
    dateDisplay: "20 Abr 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-f5-vs-qcy.webp",
  },
  {
    slug: "headphone-anc-70-horas-bateria-por-que-importa",
    category: "Guias",
    title: "Headphone ANC com 70 horas de bateria: por que isso muda tudo",
    excerpt: "Entenda por que a bateria com ANC ativo é o dado mais importante na hora de escolher um headphone — e como calcular quantos dias de uso você realmente ganha.",
    date: "2026-04-21",
    dateDisplay: "21 Abr 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-bateria-muda-tudo.webp",
  },
  {
    slug: "o-que-e-cancelamento-de-ruido-ativo-anc",
    category: "Guias",
    title: "O que é cancelamento de ruído ativo (ANC)? Guia direto e sem enrolação",
    excerpt: "Entenda o que é ANC, como os microfones cancelam o ruído em tempo real, a diferença para o cancelamento passivo e quando vale a pena investir.",
    date: "2026-04-22",
    dateDisplay: "22 Abr 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-o-que-e-anc.webp",
  },
  {
    slug: "jbl-770nc-ou-meeky-f5-vale-a-pena-pagar-mais",
    category: "Reviews",
    title: "JBL Tune 770NC ou Meeky F5 ANC Pro: R$ 202 de diferença — o que você realmente ganha?",
    excerpt: "JBL 770NC custa R$ 499. Meeky F5 custa R$ 297. Ambos têm 70h de bateria. Comparamos os dois com dados reais e uma reclamação pública sobre o ANC do JBL.",
    date: "2026-04-14",
    dateDisplay: "14 Abr 2026",
    readTime: "9 min",
    coverImage: "/blog-covers/cover-jbl-vs-meeky.webp",
  },
  {
    slug: "anc-ativo-vs-cancelamento-passivo-diferenca",
    category: "Guias",
    title: "ANC ativo vs cancelamento passivo: qual a diferença que importa na prática",
    excerpt: "Muitas marcas vendem fones com 'ANC' que na prática é cancelamento passivo melhorado. Entenda a diferença real e como identificar antes de comprar.",
    date: "2026-04-14",
    dateDisplay: "14 Abr 2026",
    readTime: "8 min",
    coverImage: "/blog-covers/cover-anc-ativo-vs-passivo.webp",
  },
];

const articleSchemas = posts.map((p) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: p.title,
  description: p.excerpt,
  datePublished: p.date,
  author: { "@type": "Organization", name: "Meeky Audio" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
}));

const BlogPage = () => {

  return (
    <Layout>
      <SEO title="Blog Meeky — Guias e reviews sobre headphone ANC e produtividade" description="Artigos sobre cancelamento de ruído, produtividade, Deep Work e alta performance. Dicas práticas para quem usa headphone no trabalho e treino." canonical="https://meeky.com.br/blog" />
      {articleSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-primary">
        <div className="container-wide section-padding py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Blog</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
              Blog Meeky
            </h1>
            <p className="text-lg text-primary-foreground/60 max-w-xl mx-auto">
              Artigos sobre produtividade, performance, tecnologia e rotina.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-background">
        <div className="container-wide section-padding py-12">
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat, i) => (
              <button
                key={i}
                className={`px-4 py-2 text-xs font-semibold tracking-wider rounded-sm transition-colors ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
                className=""
              >
                <Link to={`/blog/${post.slug}`} className="block group">
                  <div className="aspect-video rounded-sm mb-4 overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      width={640}
                      height={360}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="text-xs text-accent font-semibold tracking-wider uppercase">{post.category}</span>
                  <h2 className="font-display text-lg font-bold text-foreground mt-2 mb-2 group-hover:text-accent transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>{post.dateDisplay}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  </div>
                  <span className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1">
                    Ler artigo <ArrowRight size={12} />
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Foco também é conteúdo."
        subtitle="Inscreva-se e receba artigos exclusivos sobre performance e produtividade."
        buttonText="COMPRAR O MEEKY"
        buttonLink="/checkout"
        variant="light"
      />
    </Layout>
  );
};

export default BlogPage;
