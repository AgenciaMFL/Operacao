import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const PAGE_URL = "https://meeky.com.br/blog/anc-prejudica-qualidade-do-som-headphone";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "ANC Prejudica a Qualidade do Som? A Verdade Sem Marketing",
  description:
    "ANC ativo pode gerar artefatos sonoros e leve hissing. Entenda quando ligar, quando desligar e como isso afeta de fato a qualidade da música.",
  datePublished: "2026-06-22",
  dateModified: "2026-06-22",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio", url: "https://meeky.com.br/sobre#filipe-cardoso" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
  image: "https://meeky.com.br/blog-covers/cover-o-que-e-anc.webp",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ANC sempre piora a qualidade do som?",
      acceptedAnswer: { "@type": "Answer", text: "Não 'sempre piora', mas sempre altera. Qualquer ANC ativo injeta antissinal — esse processamento pode introduzir leve hissing (chiado de fundo) ou pequenas alterações na resposta de frequência. Em modelos bem implementados a diferença é mínima; em modelos baratos pode ser perceptível." },
    },
    {
      "@type": "Question",
      name: "Devo desligar o ANC para ouvir música crítica?",
      acceptedAnswer: { "@type": "Answer", text: "Em ambiente silencioso, sim — desligue. Sem barulho externo, ANC só adiciona seu artefato sem entregar benefício. Em ambiente ruidoso, mantenha ligado: o pequeno trade-off do ANC é largamente compensado por não precisar aumentar o volume para vencer o ruído." },
    },
    {
      "@type": "Question",
      name: "Como o Meeky F5 ANC Pro lida com isso?",
      acceptedAnswer: { "@type": "Answer", text: "O Meeky F5 ANC Pro tem ANC desligável por botão dedicado, permitindo escolher conforme o ambiente. Suporta LDAC para áudio de alta resolução em Android, o que minimiza perdas de fidelidade quando o ANC está ligado. Para audição crítica em ambiente silencioso, recomendamos desligar o ANC." },
    },
    {
      "@type": "Question",
      name: "O que é o 'hissing' do ANC?",
      acceptedAnswer: { "@type": "Answer", text: "É um chiado de fundo muito leve, audível principalmente em silêncio absoluto antes da música começar. Vem do circuito eletrônico do ANC. Em modelos premium é praticamente inaudível; em modelos muito baratos pode ser incômodo. No Meeky F5 é perceptível apenas em silêncio total e desaparece completamente com música tocando." },
    },
    {
      "@type": "Question",
      name: "Codec influencia mais que ANC na qualidade?",
      acceptedAnswer: { "@type": "Answer", text: "Sim. A escolha do codec (SBC vs AAC vs LDAC) tem impacto bem maior na qualidade percebida do que o ANC ligado/desligado. Para ouvir música crítica, prefira LDAC em Android ou AAC em iPhone, em ambiente silencioso, com ANC desligado." },
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "ANC prejudica a qualidade do som?", url: PAGE_URL },
]);

const faqs = faqSchema.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));

const BlogPostANCQualidadeSomPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="ANC Prejudica a Qualidade do Som? A Verdade Sem Marketing"
        description="ANC ativo pode gerar leve hissing e artefatos. Entenda quando ligar, quando desligar e como isso afeta a qualidade da música de fato."
        canonical={PAGE_URL}
        ogImage="https://meeky.com.br/blog-covers/cover-o-que-e-anc.webp"
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
            ANC Prejudica a Qualidade do Som? A Verdade Sem Marketing
          </h1>
          <p className="text-muted-foreground text-sm mb-2">Por Filipe Cardoso · Cofundador da Meeky Audio</p>
          <p className="text-muted-foreground text-sm mb-10">22 Jun 2026 · 7 min de leitura</p>

          <img
            src="/blog-covers/cover-o-que-e-anc.webp"
            alt="Comparação visual entre ANC ligado e desligado em headphone"
            width={960}
            height={540}
            loading="eager"
            fetchPriority="high"
            className="w-full aspect-video object-cover rounded-sm mb-10"
          />

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Resposta direta (e honesta)</h2>
            <p>
              Sim — qualquer ANC ativo altera o som. Em modelos bem implementados, a alteração é mínima e largamente compensada pelo ganho em ambientes ruidosos. Em modelos baratos, pode aparecer como chiado de fundo (<em>hissing</em>) e leve alteração na resposta de graves. <strong>A regra prática é simples: ANC ligado em ambiente ruidoso, ANC desligado em ambiente silencioso para audição crítica.</strong>
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Por que o ANC afeta o som?</h2>
            <p>
              ANC ativo funciona injetando um <strong>antissinal</strong> — uma onda sonora invertida do ruído captado pelos microfones — diretamente no driver. Esse antissinal cancela o ruído externo, mas também passa pelo mesmo caminho da música. Resultado: o driver toca música <em>e</em> antissinal simultaneamente, o que introduz pequenas distorções e, em alguns modelos, um leve chiado eletrônico (hissing) do circuito.
            </p>
            <p>
              Modelos premium minimizam isso com circuitos mais limpos e algoritmos sofisticados. Modelos baratos, em geral, têm hissing mais perceptível e leve impacto na resposta de graves.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quando o trade-off vale a pena</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Vale (mantenha ANC ligado):</strong> ambiente ruidoso (rua, café, transporte, avião, escritório aberto). Sem ANC você precisaria aumentar o volume para vencer o ruído — o que é pior para o som e para sua audição.</li>
              <li><strong>Não vale (desligue ANC):</strong> ambiente silencioso (casa de madrugada, biblioteca quieta) ouvindo música crítica. Sem ruído externo, o ANC só adiciona artefato sem benefício.</li>
            </ul>

            <BlogInlineCTA />

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que afeta mais a qualidade do que ANC</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Codec Bluetooth.</strong> SBC vs AAC vs LDAC tem impacto bem maior. Veja <Link to="/blog/ldac-vs-aac-vs-sbc-diferenca-headphone-bluetooth" className="text-accent hover:underline">o comparativo de codecs</Link>.</li>
              <li><strong>Qualidade da fonte.</strong> Spotify normal vs Tidal HiFi muda mais do que ANC ligado vs desligado.</li>
              <li><strong>Vedação das almofadas.</strong> Almofada gasta ou mal encaixada destrói graves mais do que qualquer ANC.</li>
              <li><strong>Equalização.</strong> Mesmo fone com EQ ajustado pode soar completamente diferente.</li>
            </ol>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como o Meeky F5 ANC Pro foi pensado para isso</h2>
            <p>
              O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> tem três escolhas que ajudam a minimizar o trade-off:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ANC desligável por botão dedicado</strong> — alterne entre ANC e modo passivo conforme o ambiente, sem precisar abrir app.</li>
              <li><strong>Suporte a LDAC</strong> — em Android, recupera qualidade de áudio que o Bluetooth comum perde.</li>
              <li><strong>Drivers de 40mm com ajuste sonoro próprio</strong> — assinatura sonora que mantém clareza nos médios mesmo com ANC ativo.</li>
            </ul>
            <p>
              Em testes (jun/2026), com ANC ligado em ambiente silencioso e fone parado (sem música), há um leve chiado audível — comum a todos os fones com ANC ativo nesta faixa. Com música tocando, o chiado é mascarado e desaparece da percepção.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Recomendação prática</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use ANC sempre que houver ruído real. O ganho compensa o trade-off.</li>
              <li>Desligue ANC para audição crítica em silêncio (audiophile mode).</li>
              <li>Para conteúdo falado (podcast, audiobook, calls), ANC ligado sempre — qualidade do som é irrelevante e o silêncio ajuda.</li>
              <li>Em Android, ative LDAC nas opções do desenvolvedor para máxima qualidade.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Conclusão</h2>
            <p>
              ANC não é "ruim para som" — é uma <strong>troca consciente</strong>. Bem usado, entrega muito mais do que tira. Mal usado (ligado o tempo todo em silêncio), adiciona artefato à toa. Saber quando ligar e desligar é parte da maturidade de quem tem um fone com ANC.
            </p>
            <p>
              Veja também:{" "}
              <Link to="/blog/o-que-e-cancelamento-de-ruido-ativo-anc" className="text-accent hover:underline">o que é ANC</Link>,{" "}
              <Link to="/blog/ldac-vs-aac-vs-sbc-diferenca-headphone-bluetooth" className="text-accent hover:underline">LDAC vs AAC vs SBC</Link> e{" "}
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
        title="Meeky F5 ANC Pro: ANC desligável, LDAC e 70h de bateria por R$297"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostANCQualidadeSomPage;
