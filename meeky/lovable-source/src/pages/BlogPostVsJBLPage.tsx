import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";

const PAGE_URL = "https://meeky.com.br/blog/jbl-770nc-ou-meeky-f5-vale-a-pena-pagar-mais";

const faqs = [
  {
    q: "O JBL Tune 770NC é melhor que o Meeky F5 ANC Pro?",
    a: "Depende do critério. O JBL tem app mais completo, modo TalkThru, branding reconhecido e é dobrável. O Meeky F5 tem LDAC, Bluetooth 5.4, preço menor e frete grátis. Em bateria total, os dois são equivalentes. A melhor escolha depende do que você prioriza.",
  },
  {
    q: "O ANC do JBL Tune 770NC é bom?",
    a: "É funcional para uso cotidiano, com ANC adaptativo Smart Ambient conforme comunicação oficial da JBL. A percepção de desempenho pode variar conforme ambiente, expectativa e tipo de ruído. Para ambientes moderadamente barulhentos como home office e academia, cumpre o papel.",
  },
  {
    q: "Vale a pena pagar mais pelo JBL em relação ao Meeky F5?",
    a: "Para quem valoriza app com equalizador, TalkThru e marca consolidada, pode valer. Para quem prioriza LDAC, Bluetooth 5.4, frete grátis e suporte local pelo menor preço, o Meeky F5 é a escolha mais econômica com garantia equivalente.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "JBL Tune 770NC ou Meeky F5 ANC Pro: o que você realmente ganha pagando mais?",
  description:
    "Comparativo honesto entre JBL Tune 770NC e Meeky F5 ANC Pro em 2026: ANC, bateria, LDAC, Bluetooth, garantia, suporte e custo-benefício real.",
  datePublished: "2026-04-14",
  dateModified: "2026-06-03",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
  image: "https://meeky.com.br/blog-covers/cover-jbl-vs-meeky.webp",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const BlogPostVsJBLPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="JBL Tune 770NC ou Meeky F5 ANC Pro: o que você realmente ganha pagando mais?"
        description="Comparativo honesto entre JBL Tune 770NC e Meeky F5 ANC Pro em 2026: ANC, bateria, LDAC, Bluetooth, garantia, suporte e custo-benefício real."
        canonical={PAGE_URL}
        ogImage="https://meeky.com.br/blog-covers/cover-jbl-vs-meeky.webp"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <article className="bg-background">
        <div className="container-wide section-padding py-12 md:py-20 max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8">
            <ArrowLeft size={14} /> Voltar ao blog
          </Link>

          <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Reviews</span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 leading-tight">
            JBL Tune 770NC ou Meeky F5 ANC Pro: o que você realmente ganha pagando mais?
          </h1>
          <p className="text-muted-foreground text-sm mb-2">Por Filipe Cardoso · Cofundador da Meeky Audio</p>
          <p className="text-muted-foreground text-sm mb-10">14 Abr 2026 · Atualizado em junho de 2026 · 9 min de leitura</p>

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
            <blockquote className="border-l-2 border-accent pl-4 italic text-sm">
              Ficha técnica e preços consultados em abril de 2026. Valores podem variar conforme loja, promoção e disponibilidade. Este comparativo foi elaborado pela Meeky com base em informações públicas disponíveis nas páginas oficiais e marketplaces consultados na data indicada. Nenhum fabricante concorrente financiou ou influenciou as avaliações.
            </blockquote>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Resposta direta</h2>
            <p>
              Pagar mais pelo JBL Tune 770NC faz sentido se você valoriza o app com equalizador avançado, o modo TalkThru e o nome da marca. Em bateria, os dois são equivalentes. Para home office com reuniões frequentes, o microfone e o suporte pós-venda são os critérios decisivos. Nos preços consultados em abril de 2026, a diferença entre os modelos era de aproximadamente R$202 — valores podem variar.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Ficha técnica comparativa</h2>
            <p className="text-xs italic">Preços consultados em abril de 2026. Valores podem variar conforme loja, promoção e disponibilidade.</p>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm border border-border rounded-sm">
                <thead>
                  <tr className="bg-secondary text-foreground">
                    <th className="text-left p-3 font-semibold">Especificação</th>
                    <th className="text-left p-3 font-semibold">JBL Tune 770NC</th>
                    <th className="text-left p-3 font-semibold">Meeky F5 ANC Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 font-medium text-foreground">ANC</td><td className="p-3">Adaptativo com Smart Ambient</td><td className="p-3">Até 20dB</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Bateria (sem ANC)</td><td className="p-3">70h</td><td className="p-3">70h</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Bateria (com ANC)</td><td className="p-3">44h*</td><td className="p-3">70h</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Bluetooth</td><td className="p-3">5.3</td><td className="p-3">5.4</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">LDAC</td><td className="p-3">Não</td><td className="p-3">Sim</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Drivers</td><td className="p-3">40mm</td><td className="p-3">40mm</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Preço (abr/2026)</td><td className="p-3">~R$499–503</td><td className="p-3">R$297</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Garantia</td><td className="p-3">12 meses</td><td className="p-3">12 meses</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Frete</td><td className="p-3">Variável</td><td className="p-3">Grátis</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">App dedicado</td><td className="p-3">Sim (JBL Headphones)</td><td className="p-3">Não</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Dobra para viagem</td><td className="p-3">Sim</td><td className="p-3">Não</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs italic">*Conforme comunicação oficial da JBL para o Tune 770NC com ANC ativo.</p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Bateria — empate técnico</h2>
            <p>
              Ambos têm 70 horas de bateria sem ANC. Com ANC ativo, o JBL 770NC entrega 44h conforme informação oficial da marca. Para a maioria dos usuários, essa diferença prática é pouco perceptível no uso cotidiano.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">ANC — o que dizem os testes e reviews</h2>
            <p>
              O JBL Tune 770NC tem ANC adaptativo com Smart Ambient — tecnologia que ajusta o nível de cancelamento automaticamente. Em reviews técnicos públicos, o ANC é descrito como funcional para uso cotidiano, com desempenho que pode variar conforme ambiente, expectativa e tipo de ruído. Para quem busca isolamento premium em ambientes com ruído intenso, vale comparar expectativas antes da compra.
            </p>
            <p>
              O Meeky F5 ANC Pro declara até 20dB de redução. Nos nossos testes em condições reais (home office, metrô, academia), o ANC cumpriu bem para ruídos contínuos como ar-condicionado e motor.
            </p>

            <BlogInlineCTA />

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Diferenças a favor do JBL Tune 770NC</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Branding consolidado no Brasil</li>
              <li>App JBL Headphones com equalizador avançado e modos personalizados</li>
              <li>Modo TalkThru para ouvir vozes sem tirar o fone</li>
              <li>Presença em lojas físicas (Fast Shop, Americanas)</li>
              <li>Headphone dobrável para transporte</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Diferenças a favor do Meeky F5 ANC Pro</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>LDAC — codec de alta resolução (JBL não tem)</li>
              <li>Bluetooth 5.4 — versão mais recente que o Bluetooth 5.3 do JBL</li>
              <li>Preço menor nos valores consultados</li>
              <li>Frete grátis para todo o Brasil</li>
              <li>Garantia de 12 meses com suporte direto em português</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Para quem vale cada um</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-secondary p-6 rounded-sm border border-border">
                <h3 className="font-display font-bold text-foreground mb-3">Escolha o JBL Tune 770NC se:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Você valoriza o nome JBL e a presença em lojas físicas</li>
                  <li>Quer app com equalizador avançado e modo TalkThru</li>
                  <li>Viaja com frequência e precisa de um headphone dobrável</li>
                  <li>Tem orçamento para ir além de R$300</li>
                </ul>
              </div>
              <div className="bg-secondary p-6 rounded-sm border border-accent/30">
                <h3 className="font-display font-bold text-foreground mb-3">Escolha o Meeky F5 ANC Pro se:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Quer LDAC + 70h de bateria + ANC funcional por R$297</li>
                  <li>Usa Android e prioriza qualidade de áudio de alta resolução</li>
                  <li>Precisa de frete grátis e suporte em português sem burocracia</li>
                  <li>Prefere investir a diferença de preço em outro lugar</li>
                </ul>
              </div>
            </div>

            <div className="bg-secondary/50 border border-border rounded-sm p-6 mt-8">
              <p className="text-sm font-semibold text-foreground mb-2">Leia também:</p>
              <ul className="space-y-1">
                <li><Link to="/blog/meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026" className="text-accent text-sm hover:underline">Meeky F5 ANC Pro vs Anker Soundcore Q20i: qual escolher em 2026?</Link></li>
                <li><Link to="/blog/meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc-comparativo-2026" className="text-accent text-sm hover:underline">Meeky F5 vs QCY H3 vs JBL 770NC: comparativo completo (2026)</Link></li>
                <li><Link to="/blog/melhor-headphone-anc-ate-300-reais-brasil-2026" className="text-accent text-sm hover:underline">Melhor headphone ANC até R$300 no Brasil (2026): guia definitivo</Link></li>
              </ul>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mt-16 mb-6">Perguntas frequentes</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <details key={i} className="group border border-border rounded-sm p-4">
                  <summary className="font-display font-semibold text-foreground cursor-pointer list-none flex justify-between items-center">
                    {faq.q}
                    <span className="ml-2 text-accent group-open:rotate-45 transition-transform text-lg">+</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>

            <p className="text-sm mt-10">
              <strong>Comprar o Meeky F5 ANC Pro:</strong>{" "}
              <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">meeky.com.br/headphone-anc-meeky-f5-pro</Link> — R$297, frete grátis, nota fiscal, LDAC, garantia 12 meses.
            </p>
          </div>
        </div>
      </article>

      <CTASection
        title="Garanta o Meeky F5 ANC Pro por R$297 com frete grátis e garantia de 12 meses"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostVsJBLPage;
