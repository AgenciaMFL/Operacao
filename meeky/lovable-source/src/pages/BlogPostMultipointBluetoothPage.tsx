import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import BlogStickyCTA from "@/components/blog/BlogStickyCTA";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import CTASection from "@/components/shared/CTASection";
import BlogInlineCTA from "@/components/shared/BlogInlineCTA";
import SEO from "@/components/shared/SEO";

const CANONICAL = "https://meeky.com.br/blog/multiponto-bluetooth-conectar-notebook-e-celular";

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Multiponto Bluetooth na prática: como conectar notebook e celular ao mesmo tempo",
  description: "Guia prático de multipoint Bluetooth: como parear o mesmo headphone em dois dispositivos (notebook + celular), casos de uso reais e passo a passo no Meeky F5 ANC Pro com Bluetooth 5.4.",
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
      name: "O que é multipoint Bluetooth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Multipoint é a função que permite ao fone Bluetooth ficar conectado em dois dispositivos ao mesmo tempo — por exemplo, o notebook do trabalho e o celular pessoal. Se uma chamada entra no celular enquanto você está em reunião no notebook, o fone alterna a fonte automaticamente sem precisar reparear. É diferente de multipairing (memória de vários dispositivos), que só guarda pareamentos, mas conecta em um por vez.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso de Bluetooth 5.4 para usar multipoint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não obrigatoriamente. Multipoint existe desde versões anteriores do Bluetooth (5.0 já suporta). O que o Bluetooth 5.4 traz é maior estabilidade de conexão simultânea, menor consumo de energia e menos travamento quando os dois dispositivos disputam a atenção do fone. O F5 ANC Pro usa Bluetooth 5.4 justamente para o multipoint trabalhar sem microcortes.",
      },
    },
    {
      "@type": "Question",
      name: "Como ativar multipoint no Meeky F5 ANC Pro passo a passo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Primeiro pareamento: 1) ligue o fone segurando o botão até entrar em modo pareamento (LED piscando); 2) conecte no primeiro dispositivo (ex: notebook) via Bluetooth; 3) desligue o Bluetooth do notebook por um instante ou coloque o fone novamente em modo pareamento; 4) conecte no segundo dispositivo (ex: celular); 5) reative o Bluetooth do primeiro. A partir daí, o fone conecta nos dois automaticamente ao ligar. O áudio segue o dispositivo ativo.",
      },
    },
    {
      "@type": "Question",
      name: "Quais casos de uso reais valem multipoint no dia a dia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Os mais comuns: (1) você está em call no notebook e recebe uma ligação no celular — o fone troca a fonte sozinho; (2) você está ouvindo música pelo celular e começa um Google Meet no notebook — o áudio vai automaticamente para a reunião; (3) você usa o notebook para trabalho e o celular para notificações do WhatsApp Web ou Spotify em standby. Ganha-se dezenas de reparearamentos por semana.",
      },
    },
    {
      "@type": "Question",
      name: "Multipoint funciona entre Android e iPhone ao mesmo tempo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. O multipoint do fone é agnóstico de sistema operacional — o que ele controla é a conexão Bluetooth simultânea, não a plataforma. Você pode ter um iPhone pessoal e um MacBook, um Android e um Windows, um iPad e um celular Android. Desde que os dois dispositivos suportem Bluetooth clássico (praticamente todos suportam), o fone alterna entre eles normalmente.",
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
  { name: "Multiponto Bluetooth: notebook e celular", url: CANONICAL },
]);

const BlogPostMultipointBluetoothPage = () => {
  return (
    <Layout>
      <SEO
        ogType="article"
        title="Multiponto Bluetooth: como conectar notebook e celular ao mesmo tempo"
        description="Guia prático de multipoint no headphone Bluetooth 5.4: passo a passo para parear notebook e celular ao mesmo tempo e casos de uso reais no dia a dia."
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
            Multiponto Bluetooth na prática: como conectar notebook e celular ao mesmo tempo
          </h1>
          <p className="text-muted-foreground text-sm mb-10">13 Jul 2026 · 7 min de leitura</p>

          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-8">
            <p>
              Multipoint é a função que mantém o mesmo headphone Bluetooth conectado em dois dispositivos ao mesmo tempo — normalmente notebook e celular. Você fica em reunião no notebook, o celular toca, o áudio troca sozinho. Fim das rotinas de "desemparelhar-emparelhar" a cada vez que alterna de dispositivo. No <Link to="/headphone-anc-meeky-f5-pro" className="text-accent hover:underline">Meeky F5 ANC Pro</Link>, essa função vem habilitada de fábrica pelo Bluetooth 5.4.
            </p>
            <p>
              Este guia explica o conceito, o passo a passo de configuração e os cenários reais onde multipoint economiza tempo de verdade.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">O que é multipoint e por que não é a mesma coisa que multipairing?</h2>
            <p>
              <strong>Multipairing</strong> é a memória: o fone lembra de vários dispositivos que já pareou, mas conecta em um por vez. Praticamente todo fone Bluetooth moderno faz multipairing. <strong>Multipoint</strong> é diferente — o fone fica <em>ativo em dois dispositivos simultaneamente</em>. Se o dispositivo A está reproduzindo música e chega uma chamada no dispositivo B, o fone pausa a música e passa a chamada, tudo sem intervenção manual. É essa a função que muda a rotina.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Bluetooth 5.4 é obrigatório para multipoint?</h2>
            <p>
              Não. Multipoint já existia no Bluetooth 5.0. O que o <Link to="/blog/bluetooth-54-53-50-diferenca-headphone" className="text-accent hover:underline">Bluetooth 5.4</Link> traz é execução melhor: menos consumo de bateria mantendo duas conexões vivas, menos microcortes na troca de fonte e maior estabilidade quando os dois dispositivos disputam prioridade. Por isso o multipoint em 5.4 é sensivelmente mais fluido que em versões anteriores.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Como parear o Meeky F5 ANC Pro em notebook e celular ao mesmo tempo?</h2>
            <p>
              Passo a passo prático para o primeiro pareamento em dois dispositivos:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Com o fone desligado, segure o botão liga/desliga por cerca de 5 segundos até o LED piscar em azul/vermelho — modo pareamento.</li>
              <li>No notebook, abra <em>Bluetooth</em>, procure "Meeky F5 ANC Pro" e conecte.</li>
              <li>Desative rapidamente o Bluetooth do notebook (ou coloque o fone em modo pareamento de novo segurando o botão).</li>
              <li>Agora no celular, procure "Meeky F5 ANC Pro" no Bluetooth e conecte.</li>
              <li>Reative o Bluetooth do notebook. Em poucos segundos, o fone se conecta aos dois simultaneamente.</li>
            </ol>
            <p>
              A partir da próxima vez que ligar o fone, ele reconecta automaticamente nos dois últimos dispositivos usados. O áudio segue o dispositivo que estiver ativo — se ambos tocam ao mesmo tempo, o primeiro que iniciou o stream costuma ter prioridade.
            </p>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Quais são os casos de uso reais no dia a dia?</h2>
            <p>
              Três cenários que aparecem toda semana em quem trabalha remoto:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Reunião no notebook + ligação no celular:</strong> você está em call e o celular toca. O fone pausa a reunião, toca o telefone. Ao encerrar, volta para a call. Sem retirar o fone.</li>
              <li><strong>Música pessoal + reunião de trabalho:</strong> você ouve Spotify no celular durante um intervalo. O Google Meet começa no notebook. O áudio migra sozinho para a reunião.</li>
              <li><strong>Notificações do WhatsApp Web:</strong> notebook conectado para trabalho, celular parado no bolso. Uma mensagem de voz chega — você ouve pelo fone sem tocar em nada.</li>
            </ul>

            <h2 className="font-display text-2xl font-bold text-foreground mt-12 mb-4">Multipoint funciona misturando sistemas operacionais?</h2>
            <p>
              Sim. Windows + iPhone, macOS + Android, iPad + notebook Linux — qualquer combinação. O multipoint é gerenciado pelo próprio fone, não pelo sistema operacional. O que importa é os dois dispositivos suportarem Bluetooth clássico (todos os laptops e celulares modernos suportam). Se você quer aproveitar a função com áudio de alta qualidade em cima, veja como escolher entre{" "}
              <Link to="/blog/ldac-vs-aac-vs-sbc-diferenca-headphone-bluetooth" className="text-accent hover:underline">LDAC, AAC e SBC</Link>{" "}
              conforme o dispositivo que está ativo.
            </p>

            <BlogInlineCTA />

            <p>
              Veja também:{" "}
              <Link to="/blog/headphone-home-office-anc" className="text-accent hover:underline">headphone com ANC para home office</Link>{" "}
              e{" "}
              <Link to="/blog/headphone-anc-70-horas-bateria-por-que-importa" className="text-accent hover:underline">por que 70h de bateria faz diferença</Link>.
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
        title="Meeky F5 ANC Pro: multipoint Bluetooth 5.4, 70h de bateria — R$ 297"
        buttonText="VER PRODUTO"
        buttonLink="/headphone-anc-meeky-f5-pro"
        variant="dark"
      />
      <BlogStickyCTA />
    </Layout>
  );
};

export default BlogPostMultipointBluetoothPage;
