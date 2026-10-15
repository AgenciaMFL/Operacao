import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";

const CANONICAL = "https://meeky.com.br/blog/guia-presente-corporativo-brindes-tecnologia-rh";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Guia de presente corporativo: brindes de tecnologia que fazem sentido pro RH",
  description: "Como o RH deve escolher brinde corporativo de tecnologia: critérios de utilidade real, percepção de qualidade, custo por unidade em volume e alinhamento com marca empregadora.",
  datePublished: "2026-07-13",
  author: { "@type": "Person", name: "Filipe Cardoso", jobTitle: "Cofundador, Meeky Audio", url: "https://meeky.com.br/sobre#filipe-cardoso" },
  publisher: {
    "@type": "Organization",
    name: "Meeky Audio",
    logo: { "@type": "ImageObject", url: "https://meeky.com.br/favicon.png" },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Por que brinde de tecnologia costuma superar caneca e agenda?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Porque tecnologia útil entra na rotina do colaborador — fone, teclado, hub USB, mouse. O uso é diário, o que multiplica exposições da marca e a lembrança emocional. Caneca e agenda vão pra gaveta em uma semana. Um brinde de tecnologia bem escolhido cria uma experiência positiva recorrente, e isso é o que sustenta percepção de marca empregadora no médio prazo.",
      },
    },
    {
      "@type": "Question",
      name: "Qual a diferença entre brinde de marketing e presente corporativo real?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Brinde de marketing é volume barato pra evento (canetas, chaveiros, ecobags), com foco em alcance. Presente corporativo é para público interno ou parceiros estratégicos, com foco em qualidade percebida e uso real. Presente corporativo mal escolhido é pior do que nenhum: um produto barato com logo grande da empresa vira meme interno. O critério é sempre o que a pessoa aceitaria de bom grado se comprasse pra si.",
      },
    },
    {
      "@type": "Question",
      name: "Fone de ouvido é uma boa opção de brinde corporativo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, especialmente em empresas com trabalho híbrido ou remoto. Fone é ferramenta de trabalho: entra em call, ajuda a focar em ambiente barulhento e sinaliza cuidado com produtividade real do colaborador. Um headphone com ANC ativo, bateria longa e nota fiscal com garantia entrega uma percepção de valor muito acima do custo unitário em volume — diferente de um fone genérico sem homologação.",
      },
    },
    {
      "@type": "Question",
      name: "Como o RH deve avaliar custo por unidade em pedidos em volume?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Três variáveis: (1) desconto real por faixa de quantidade — não aceite tabela simulada, peça proposta escrita; (2) prazo de entrega compatível com a data do evento (Black Friday e fim de ano têm frete atrasado); (3) suporte pós-venda em caso de defeito de unidades específicas, com nota fiscal em nome da empresa. Preço unitário isolado engana — o custo total inclui logística, reposição e imagem da marca.",
      },
    },
    {
      "@type": "Question",
      name: "Presente corporativo de tecnologia precisa ter homologação Anatel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para qualquer dispositivo com Bluetooth, Wi-Fi ou radiofrequência sim — é exigência regulatória no Brasil. Dispositivos importados sem homologação são irregulares e podem trazer risco jurídico e de imagem para a empresa. Sempre confirme na proposta que o produto tem homologação e nota fiscal emitida em CNPJ. Sem isso, não é presente corporativo — é risco.",
      },
    },
  ],
};

const faqs = faqSchema.mainEntity.map((q) => ({
  question: q.name,
  answer: q.acceptedAnswer.text,
}));

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Blog", url: "https://meeky.com.br/blog" },
  { name: "Guia de presente corporativo para RH", url: CANONICAL },
]);

const BlogPostPresenteCorporativoRHPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="Guia de presente corporativo: brindes de tecnologia que fazem sentido pro RH"
        description="Critérios para o RH escolher brinde corporativo de tecnologia: utilidade real, percepção de qualidade, custo por unidade em volume e homologação. Guia direto."
        canonical={CANONICAL}
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
            Guia de presente corporativo: brindes de tecnologia que fazem sentido pro RH
          </h1>
          <p className="text-muted-foreground text-sm mb-10">13 Jul 2026 · 8 min de leitura</p>

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-8">
            <p>
              Presente corporativo de tecnologia funciona quando cumpre três critérios ao mesmo tempo: <strong>utilidade real</strong> (o colaborador usa toda semana), <strong>percepção de qualidade</strong> (produto que a pessoa compraria pra si) e <strong>custo por unidade viável em volume</strong> (com nota fiscal, homologação e garantia). Caneca, agenda e ecobag são brinde de evento, não presente corporativo. Este guia mostra como o RH escolhe sem errar.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Por que tecnologia útil supera brinde tradicional?</h2>
            <p>
              Brinde tradicional vive um ciclo curto: entrega, uso simbólico por alguns dias, gaveta. Tecnologia útil entra na rotina — fone de ouvido usado em call, teclado no home office, hub USB no notebook, mouse sem fio na mesa. Cada uso é uma exposição da marca empregadora ligada a uma experiência positiva concreta. É engajamento silencioso e recorrente, e custa menos por impressão do que campanha interna equivalente.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quais são os critérios objetivos para escolher?</h2>
            <p>
              Cinco filtros práticos que o RH pode aplicar em qualquer proposta:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Utilidade real:</strong> o colaborador vai usar pelo menos uma vez por semana?</li>
              <li><strong>Qualidade percebida:</strong> o produto seria comprado por ele mesmo sem o logo?</li>
              <li><strong>Homologação e nota fiscal:</strong> emissão em CNPJ, garantia formal e conformidade Anatel para produtos com Bluetooth/Wi-Fi.</li>
              <li><strong>Custo por unidade em volume:</strong> desconto real por faixa de quantidade, não tabela genérica.</li>
              <li><strong>Suporte pós-entrega:</strong> política clara de troca em caso de defeito individual, sem processo travado.</li>
            </ul>
            <p>
              Todo brinde que não passa nos três primeiros filtros já pode ser descartado — não importa o preço.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Por que fone de ouvido virou item central no home office?</h2>
            <p>
              Com trabalho híbrido consolidado, fone deixou de ser acessório e virou ferramenta de expediente. Entra em call, cancela ruído em ambiente doméstico barulhento e sinaliza — sem discurso — que a empresa se importa com a produtividade real do colaborador. Um headphone com ANC ativo, bateria longa e homologação Anatel é hoje um dos brindes de tecnologia mais bem recebidos por área técnica, financeira, comercial e liderança.
            </p>
            <p>
              O <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link>, por exemplo, é usado como presente corporativo por empresas que querem entregar cancelamento de ruído ativo real, 70 horas de bateria e nota fiscal com garantia — sem estourar orçamento com marcas premium importadas. Se você faz parte de RH ou compras corporativas, veja as{" "}
              <Link to="/empresas" className="text-accent hover:underline">condições para pedidos em volume na página /empresas</Link>.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como avaliar o custo por unidade em volume?</h2>
            <p>
              O preço unitário isolado engana. O RH deve pedir na proposta comercial:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tabela de desconto por faixa (ex: 10, 25, 50, 100 unidades).</li>
              <li>Prazo de produção e entrega firme, com penalidade em caso de atraso na data do evento.</li>
              <li>Frete incluído para o CEP de entrega (endereço do RH ou endereço de cada colaborador).</li>
              <li>Nota fiscal em nome da empresa com destaque claro dos itens.</li>
              <li>Política de suporte: prazo de troca em caso de defeito individual, canal de atendimento.</li>
            </ul>
            <p>
              O custo final por unidade só fecha depois de todas essas variáveis somadas. Fornecedor sério entrega esses cinco pontos por escrito antes de você pedir.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quando faz sentido pedir amostra antes da compra em volume?</h2>
            <p>
              Sempre que o valor total do pedido justifique — normalmente acima de 20–30 unidades. Amostra permite validar acabamento, embalagem, qualidade percebida e experiência de unboxing antes de comprometer o orçamento. É prática padrão em compras corporativas de tecnologia e um fornecedor que se recusa a discutir amostra costuma ser sinal amarelo.
            </p>

            <BlogInlineCTA />

            <p>
              Se você é RH, comprador corporativo ou marketing e quer entender condições de volume, prazo e amostra do Meeky F5 ANC Pro, entre em contato pela{" "}
              <Link to="/empresas" className="text-accent hover:underline">página /empresas</Link>.
            </p>

            {/* FAQ */}
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
        title="Meeky F5 ANC Pro para pedidos corporativos — condições em /empresas"
        buttonText="FALAR COM O COMERCIAL"
        buttonLink="/empresas"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostPresenteCorporativoRHPage;
