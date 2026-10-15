import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const PAGE_URL = "https://meeky.com.br/blog/ldac-vs-aac-vs-sbc-diferenca-headphone-bluetooth";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "LDAC vs AAC vs SBC: Qual Codec Bluetooth Escolher (2026)",
  description:
    "Diferença real entre LDAC, AAC e SBC em headphones Bluetooth: qualidade, latência, compatibilidade Android/iPhone e quando importa de verdade.",
  datePublished: "2026-06-22",
  dateModified: "2026-06-22",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio", url: "https://meeky.com.br/sobre#filipe-cardoso" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
  image: "https://meeky.com.br/blog-covers/cover-review-f5.webp",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "LDAC funciona no iPhone?",
      acceptedAnswer: { "@type": "Answer", text: "Não. O iOS não suporta LDAC. Em iPhones, qualquer headphone Bluetooth usa AAC (ou SBC como fallback). LDAC só funciona com Android 8+ compatível e players Sony." },
    },
    {
      "@type": "Question",
      name: "A diferença entre AAC e SBC é audível?",
      acceptedAnswer: { "@type": "Answer", text: "Em fones de até R$500 com música em streaming comum (Spotify, YouTube Music em qualidade padrão), a diferença é sutil — perceptível em testes A/B atentos com bons drivers, mas pouco notável em uso casual. AAC tem vantagem perceptível em iPhone porque é o codec nativo do iOS." },
    },
    {
      "@type": "Question",
      name: "LDAC vale a pena se ouço só Spotify?",
      acceptedAnswer: { "@type": "Answer", text: "Pouco — Spotify nem oferece áudio lossless. LDAC brilha com Tidal HiFi, Apple Music Lossless (em Android), Qobuz e arquivos FLAC/WAV locais. Para Spotify casual, AAC já entrega tudo que o serviço transmite." },
    },
    {
      "@type": "Question",
      name: "Qual codec tem menor latência para jogos e vídeo?",
      acceptedAnswer: { "@type": "Answer", text: "Nenhum dos três é ideal para games competitivos — todos têm latência acima de 100ms. SBC e AAC ficam em torno de 150–250ms; LDAC pode chegar a 300ms+ no modo qualidade. Para jogos, prefira fones com aptX Low Latency ou conexão por fio." },
    },
    {
      "@type": "Question",
      name: "O Meeky F5 ANC Pro suporta LDAC?",
      acceptedAnswer: { "@type": "Answer", text: "Sim. O Meeky F5 ANC Pro suporta LDAC, AAC e SBC. Na faixa até R$300 no Brasil com certificação Anatel, é o único modelo com LDAC nativo — concorrentes como Soundcore Q20i e QCY H3 não oferecem o codec." },
    },
    {
      "@type": "Question",
      name: "Posso forçar o uso de LDAC no Android?",
      acceptedAnswer: { "@type": "Answer", text: "Sim, em Android 8+: ative as Opções do desenvolvedor, vá em 'Codec de áudio Bluetooth' e selecione LDAC manualmente. Recomendamos o modo 'Qualidade de áudio' (990kbps) com sinal forte; em ambientes com interferência, use 'Conexão estável' (330kbps)." },
    },
  ],
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "LDAC vs AAC vs SBC", url: PAGE_URL },
]);

const faqs = faqSchema.mainEntity.map((q) => ({ question: q.name, answer: q.acceptedAnswer.text }));

const BlogPostLDACvsAACvsSBCPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="LDAC vs AAC vs SBC: Qual Codec Bluetooth Escolher (2026)"
        description="Diferença real entre LDAC, AAC e SBC em headphones Bluetooth: qualidade, latência, compatibilidade Android/iPhone e quando importa de verdade."
        canonical={PAGE_URL}
        ogImage="https://meeky.com.br/blog-covers/cover-review-f5.webp"
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
            LDAC vs AAC vs SBC: Qual Codec Bluetooth Escolher (2026)
          </h1>
          <p className="text-muted-foreground text-sm mb-2">Por Filipe Cardoso · Cofundador da Meeky Audio</p>
          <p className="text-muted-foreground text-sm mb-10">22 Jun 2026 · 8 min de leitura</p>

          <img
            src="/blog-covers/cover-review-f5.webp"
            alt="Comparativo entre codecs Bluetooth LDAC, AAC e SBC em headphones"
            width={960}
            height={540}
            loading="eager"
            fetchPriority="high"
            className="w-full aspect-video object-cover rounded-sm mb-10"
          />

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Resposta direta</h2>
            <p>
              <strong>SBC</strong> é o codec universal — funciona em qualquer fone Bluetooth, com qualidade básica. <strong>AAC</strong> é o padrão da Apple e melhora bastante a qualidade em iPhone. <strong>LDAC</strong> é da Sony e entrega áudio de alta resolução (até 990kbps) — mas só em Android compatível. Para quem usa Android e ouve música em qualidade lossless, LDAC é o único que entrega áudio de alta resolução sem fio. Para iPhone, o melhor é AAC. Para uso casual, qualquer um resolve.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que é um codec Bluetooth?</h2>
            <p>
              Codec é o algoritmo que comprime e transmite o áudio entre seu celular e o headphone. Como o Bluetooth tem largura de banda limitada, o áudio sempre passa por compressão — e o codec define <strong>quanta informação é perdida no caminho</strong> e qual a latência da transmissão. Três codecs dominam o mercado em 2026: SBC, AAC e LDAC.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">SBC — o padrão universal</h2>
            <p>
              SBC (<em>Sub-Band Coding</em>) é obrigatório em todo headphone Bluetooth desde 2003. Taxa de bits: ~192–320 kbps. É o "denominador comum" — se nada mais funcionar, SBC funciona. Qualidade aceitável para casual, com perda perceptível em música mais complexa.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">AAC — o padrão Apple</h2>
            <p>
              AAC (<em>Advanced Audio Coding</em>) é o mesmo codec usado no iTunes, Apple Music e YouTube. Taxa: ~250–320 kbps. No iPhone, AAC tem otimizações nativas e entrega qualidade superior ao SBC. No Android, a implementação varia por fabricante — em alguns aparelhos, AAC fica até pior que SBC. Para iOS, é o codec a priorizar.
            </p>

            <BlogInlineCTA />

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">LDAC — o codec de alta resolução</h2>
            <p>
              LDAC (Sony) transmite até 990 kbps — cerca de 3x a taxa de bits do AAC. Para áudio lossless (Tidal HiFi, Apple Music Lossless em Android, Qobuz, FLAC local), LDAC é o único entre os três que transmite a faixa em qualidade audiofílica sem fio. Exclusivo do Android (8+). Tem três modos: Qualidade (990 kbps), Padrão (660 kbps) e Conexão Estável (330 kbps).
            </p>
            <p>
              O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link> suporta LDAC nativamente e é, em junho de 2026, o único headphone com Anatel na faixa até R$300 a oferecer o codec — Soundcore Q20i, JBL 770NC e QCY H3 ficam restritos a AAC/SBC nessa faixa.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Tabela comparativa</h2>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm border border-border rounded-sm">
                <thead>
                  <tr className="bg-secondary text-foreground">
                    <th className="text-left p-3 font-semibold">Característica</th>
                    <th className="text-left p-3 font-semibold">SBC</th>
                    <th className="text-left p-3 font-semibold">AAC</th>
                    <th className="text-left p-3 font-semibold">LDAC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 font-medium text-foreground">Taxa máxima</td><td className="p-3">~320 kbps</td><td className="p-3">~320 kbps</td><td className="p-3"><strong>990 kbps</strong></td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Android</td><td className="p-3">Sim</td><td className="p-3">Sim (varia)</td><td className="p-3"><strong>Sim (8+)</strong></td></tr>
                  <tr><td className="p-3 font-medium text-foreground">iPhone</td><td className="p-3">Sim</td><td className="p-3"><strong>Sim (nativo)</strong></td><td className="p-3">Não</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Latência média</td><td className="p-3">~200 ms</td><td className="p-3">~150 ms</td><td className="p-3">~200–300 ms</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Qualidade percebida</td><td className="p-3">Básica</td><td className="p-3">Boa</td><td className="p-3"><strong>Alta resolução</strong></td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Suporte no Meeky F5</td><td className="p-3">Sim</td><td className="p-3">Sim</td><td className="p-3"><strong>Sim</strong></td></tr>
                </tbody>
              </table>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quando o codec realmente importa?</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Importa muito:</strong> você ouve em serviços lossless (Tidal HiFi, Apple Music Lossless, Qobuz) e tem fone com drivers de qualidade.</li>
              <li><strong>Importa pouco:</strong> você usa Spotify em qualidade padrão, ouve em ambiente ruidoso (rua, transporte, academia) ou em uso casual.</li>
              <li><strong>Não importa:</strong> em chamadas, podcasts ou áudio falado — o codec é irrelevante.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Conclusão</h2>
            <p>
              Codec é só uma parte da equação — drivers, ANC, conforto e bateria importam tanto quanto. Mas se você quer áudio de alta resolução sem fio e usa Android, LDAC é hoje a única opção mainstream. E na faixa até R$300 no Brasil, o Meeky F5 ANC Pro é o único modelo com Anatel a entregar isso.
            </p>
            <p>
              Veja também:{" "}
              <Link to="/blog/bluetooth-54-53-50-diferenca-headphone" className="text-accent hover:underline">Bluetooth 5.4 vs 5.3 vs 5.0</Link>,{" "}
              <Link to="/blog/anc-prejudica-qualidade-do-som-headphone" className="text-accent hover:underline">ANC prejudica a qualidade do som?</Link> e{" "}
              <Link to="/blog/meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026" className="text-accent hover:underline">Meeky F5 vs Soundcore Q20i</Link>.
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
        title="Meeky F5 ANC Pro: LDAC, Bluetooth 5.4, 70h de bateria — R$297"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostLDACvsAACvsSBCPage;
