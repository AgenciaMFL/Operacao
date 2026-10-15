import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const PAGE_URL = "https://meeky.com.br/blog/quanto-dura-bateria-headphone-anc-na-pratica";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Quanto Dura a Bateria de Headphone ANC na Prática? (Teste Real)",
  description:
    "Bateria anunciada vs real: fatores que afetam, como calcular para seu uso e comparativo 70h Meeky vs 40h QCY vs 44h JBL em dias reais.",
  datePublished: "2026-06-22",
  dateModified: "2026-06-22",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio", url: "https://meeky.com.br/sobre#filipe-cardoso" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
  image: "https://meeky.com.br/blog-covers/cover-bateria-muda-tudo.webp",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Por que a bateria real é sempre menor que a anunciada?",
      acceptedAnswer: { "@type": "Answer", text: "Fabricantes medem em condições otimizadas: volume médio-baixo (~50%), codec eficiente (SBC), ANC frequentemente desligado e sem multiponto ativo. No uso cotidiano, volume mais alto, LDAC, ANC ligado e conexões secundárias reduzem o número anunciado em 15–30%." },
    },
    {
      "@type": "Question",
      name: "ANC ligado consome muito mais bateria?",
      acceptedAnswer: { "@type": "Answer", text: "Sim. ANC ativo consome cerca de 25–40% mais energia que o modo passivo, porque os microfones ANC ficam captando ruído continuamente e o DSP processa o antissinal em tempo real. Por isso fabricantes divulgam dois números (ex.: 60h sem ANC / 40h com ANC)." },
    },
    {
      "@type": "Question",
      name: "Qual o número honesto de bateria do Meeky F5 ANC Pro?",
      acceptedAnswer: { "@type": "Answer", text: "70h é a especificação oficial com ANC ligado em condições padrão de teste. Em uso real com volume confortável (~60%) e ANC sempre ligado, ficamos entre 50–60h em jun/2026. Ainda é o maior número da faixa até R$300 — Soundcore Q20i fica em 40h com ANC e QCY H3 em ~40h." },
    },
    {
      "@type": "Question",
      name: "Quantos dias dura uma carga no uso típico?",
      acceptedAnswer: { "@type": "Answer", text: "Depende do seu uso. Para 6h/dia de trabalho com ANC ligado: Meeky F5 ~9–10 dias, Soundcore Q20i ~6–7 dias, QCY H3 ~6–7 dias, JBL 770NC ~7 dias. Para uso ocasional (2h/dia), todos passam de duas semanas." },
    },
    {
      "@type": "Question",
      name: "Carga rápida vale mais que bateria longa?",
      acceptedAnswer: { "@type": "Answer", text: "São complementares. Carga rápida é ótima para 'emergência' (5 min = horas extras). Bateria longa elimina a necessidade de carregar com frequência. Para quem viaja ou trabalha fora de casa, bateria longa traz mais tranquilidade. Para quem está sempre perto de uma tomada, carga rápida basta." },
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "Bateria de headphone ANC na prática", url: PAGE_URL },
]);

const faqs = faqSchema.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));

const BlogPostBateriaRealPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="Quanto Dura a Bateria de Headphone ANC na Prática (Teste)"
        description="Bateria anunciada vs real: fatores que afetam, como calcular para seu uso e comparativo Meeky vs QCY vs JBL em dias reais."
        canonical={PAGE_URL}
        ogImage="https://meeky.com.br/blog-covers/cover-bateria-muda-tudo.webp"
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
            Quanto Dura a Bateria de Headphone ANC na Prática? (Teste Real)
          </h1>
          <p className="text-muted-foreground text-sm mb-2">Por Filipe Cardoso · Cofundador da Meeky Audio</p>
          <p className="text-muted-foreground text-sm mb-10">22 Jun 2026 · 8 min de leitura</p>

          <img
            src="/blog-covers/cover-bateria-muda-tudo.webp"
            alt="Comparativo real de bateria entre headphones ANC"
            width={960}
            height={540}
            loading="eager"
            fetchPriority="high"
            className="w-full aspect-video object-cover rounded-sm mb-10"
          />

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Resposta direta (com honestidade)</h2>
            <p>
              A bateria anunciada por fabricantes é o <strong>melhor cenário</strong>, medido em condições otimizadas. No uso real, com volume confortável, ANC sempre ligado e codec mais pesado, a duração cai 15–30% do número da caixa. O importante não é o número absoluto — é <strong>quantos dias de uso isso vira para a sua rotina</strong>.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Por que o número da caixa nunca bate</h2>
            <p>
              Fabricantes seguem condições padrão para divulgar duração (volume médio-baixo, codec SBC, ANC frequentemente desligado, sem multiponto). Você usa em condições reais. A diferença típica:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Volume 80% vs 50%:</strong> consome ~30% mais.</li>
              <li><strong>LDAC vs SBC:</strong> consome ~15–20% mais.</li>
              <li><strong>ANC ligado vs desligado:</strong> consome ~25–40% mais.</li>
              <li><strong>Multiponto ativo:</strong> consome ~10% mais.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Comparativo: anunciado vs real (jun/2026)</h2>
            <p className="text-xs italic">Valores reais medidos em uso típico: volume ~60%, ANC ligado, codec padrão do aparelho conectado.</p>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm border border-border rounded-sm">
                <thead>
                  <tr className="bg-secondary text-foreground">
                    <th className="text-left p-3 font-semibold">Modelo</th>
                    <th className="text-left p-3 font-semibold">Anunciado (ANC on)</th>
                    <th className="text-left p-3 font-semibold">Real (uso típico)</th>
                    <th className="text-left p-3 font-semibold">Dias (6h/dia)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 font-medium text-foreground">Meeky F5 ANC Pro</td><td className="p-3"><strong>70h</strong></td><td className="p-3">~50–60h</td><td className="p-3"><strong>~9–10 dias</strong></td></tr>
                  <tr><td className="p-3 font-medium text-foreground">JBL Tune 770NC</td><td className="p-3">44h</td><td className="p-3">~35–40h</td><td className="p-3">~6–7 dias</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Soundcore Q20i</td><td className="p-3">40h</td><td className="p-3">~30–35h</td><td className="p-3">~5–6 dias</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">QCY H3</td><td className="p-3">~40h</td><td className="p-3">~32h</td><td className="p-3">~5–6 dias</td></tr>
                </tbody>
              </table>
            </div>

            <BlogInlineCTA />

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como calcular para o seu uso</h2>
            <p>
              Pegue a especificação do fabricante (ANC on), aplique fator de uso real e divida pelas suas horas/dia:
            </p>
            <div className="bg-secondary p-4 rounded-sm border border-border text-sm font-mono">
              dias_reais = (horas_anunciadas × 0,80) ÷ horas_por_dia
            </div>
            <p className="text-sm italic">
              O fator 0,80 é conservador (assume volume médio-alto e ANC sempre ligado). Para uso mais leve, use 0,90.
            </p>
            <p>
              Exemplos com Meeky F5 (70h anunciadas, fator 0,80 → 56h reais):
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>2h/dia de uso casual → ~28 dias entre cargas</li>
              <li>4h/dia (estudo + entretenimento) → ~14 dias</li>
              <li>6h/dia (home office) → ~9 dias</li>
              <li>8h/dia (uso intenso) → ~7 dias</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Por que a folga de bateria importa</h2>
            <p>
              Não é só "menos vezes na tomada". É <strong>menos ansiedade</strong>. Você esquece do fone na bolsa, viaja sem o carregador, usa o dia inteiro sem se preocupar com porcentagem. Quem tem 70h reais raramente pensa em bateria. Quem tem 30h, pensa toda noite.
            </p>
            <p>
              O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> foi projetado em torno desse argumento. Para a maioria dos usuários (4–6h/dia), uma carga cobre uma a duas semanas inteiras de uso. Não é marketing — é projeto.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Conclusão</h2>
            <p>
              Bateria anunciada é uma referência, não uma promessa. Use o fator 0,80 e divida pelas suas horas reais. Para quem usa fone como ferramenta diária (trabalho, estudo, treino), a bateria é, junto com conforto, o fator que mais aparece no uso prolongado.
            </p>
            <p>
              Veja também:{" "}
              <Link to="/blog/headphone-anc-70-horas-bateria-por-que-importa" className="text-accent hover:underline">por que 70h de bateria importa</Link>,{" "}
              <Link to="/blog/headphone-70-horas-bateria" className="text-accent hover:underline">70h de bateria na rotina</Link> e{" "}
              <Link to="/blog/headphone-anc-funciona-em-aviao" className="text-accent hover:underline">ANC em avião</Link>.
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
        title="Meeky F5 ANC Pro — 70h de bateria, R$297, frete grátis"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostBateriaRealPage;
