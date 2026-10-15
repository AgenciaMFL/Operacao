import { Link } from "react-router-dom";
import { Zap, Shield, Headphones, Target, ChevronRight, Building2, Check, MessageCircle, ShieldCheck, Brain, Activity, Plane } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import JsonLd from "@/components/shared/JsonLd";
import SectionHeading from "@/components/shared/SectionHeading";
import heroImg from "@/assets/headphone-angle.webp";
import frontImg from "@/assets/headphone-front.webp";
import boxImg from "@/assets/headphone-box.webp";
import urbanTouchImg from "@/assets/lifestyle-urban-touch.webp";
import BentoGrid from "@/components/home/BentoGrid";
import { useDeliveredOrdersCount, deliveredOrdersLabel } from "@/hooks/useDeliveredOrdersCount";

// Home LCP hero is served from public/ for stable URL + early preload in index.html
const boxingPunchImg = "/hero-home.webp";

const WHATSAPP_URL = "https://wa.me/5512991074311?text=Ol%C3%A1!%20Quero%20saber%20mais%20sobre%20o%20Meeky%20ANC%20Premium";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Meeky Audio",
  legalName: "Barganha Mix Ltda",
  url: "https://meeky.com.br",
  logo: "https://meeky.com.br/logo.png",
  email: "contato@meeky.com.br",
  telephone: "+55-12-99107-4311",
  identifier: "43.341.597/0001-40",
  address: {
    "@type": "PostalAddress",
    addressCountry: "BR",
    addressRegion: "SP",
  },
  founder: [
    { "@type": "Person", name: "Filipe Cardoso" },
    { "@type": "Person", name: "Fernanda Micchi" },
  ],
  sameAs: [
    "https://www.instagram.com/meeky.br",
    "https://www.mercadolivre.com.br/pagina/meeky",
  ],
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://meeky.com.br/#webpage",
  url: "https://meeky.com.br/",
  name: "Meeky F5 ANC Pro — Foco e produtividade sem distração",
  description:
    "Headphone com cancelamento de ruído ativo, Bluetooth 5.4 Multiponto e 70h de bateria. 12 meses de garantia. Envio Full SP em 24h.",
  inLanguage: "pt-BR",
  isPartOf: { "@type": "WebSite", url: "https://meeky.com.br/", name: "Meeky Audio" },
  primaryImageOfPage: { "@type": "ImageObject", url: "https://meeky.com.br/og-image.jpg" },
  about: { "@type": "Organization", name: "Meeky Audio", url: "https://meeky.com.br/" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: "https://meeky.com.br/" },
  ],
};

const Index = () => {
  const ordersCount = useDeliveredOrdersCount();



  // Hero image preload is declared statically in index.html for earliest LCP fetch.

  return (
    <Layout>
      <SEO title="Meeky Audio — Headphone ANC para foco e produtividade" description="Headphone com cancelamento de ruído ativo, Bluetooth 5.4 Multiponto e 70h de bateria. 12 meses de garantia. Envio Full SP em 24h. Sem distração, só performance." ogImage="https://meeky.com.br/og-image.jpg" canonical="https://meeky.com.br/" preloadImage="/hero-home.webp" />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webPageSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* 1 — Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="container-wide section-padding py-20 md:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-foreground">
                Meeky Audio — Headphones com Cancelamento de Ruído para Foco
              </h1>
              <p className="mt-4 font-display text-2xl md:text-3xl text-muted-foreground">
                Menos mundo. <span className="text-gradient-gold">Mais você.</span>
              </p>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Headphones e acessórios criados para silenciar distrações, melhorar sua rotina e elevar sua performance.
              </p>
              <p className="mt-4 text-sm font-display font-semibold tracking-[0.15em] uppercase text-accent">
                Para trabalho, estudo, treino e todos os momentos em que concentração vira resultado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link
                  to="/headphone-anc-meeky-f5-pro"
                  className="bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-gold-light text-center"
                >
                  CONHECER O F5 ANC PRO
                </Link>
                <Link
                  to="/checkout"
                  className="bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light text-center"
                >
                  COMPRAR AGORA
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-8">
                <ShieldCheck size={16} className="text-accent shrink-0" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{deliveredOrdersLabel(ordersCount)}</span>
                  {" · "}
                  <span className="font-semibold text-foreground">Frete grátis</span>
                  {" · "}
                  <span className="font-semibold text-foreground">Garantia 12 meses</span>
                </span>
              </div>

            </div>
            <div className="flex justify-center">
              <img src={boxingPunchImg} alt="Modelo treinando boxe com fone de ouvido Meeky F5 ANC Pro preto" width={600} height={750} className="w-full max-w-lg rounded-sm object-cover" fetchPriority="high" loading="eager" />
            </div>
          </div>
        </div>
      </section>

      {/* O que é a Meeky? — seção semântica logo após o hero */}
      <section className="bg-background" aria-label="Sobre a marca Meeky">
        <div className="container-wide section-padding py-16 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            O que é a Meeky?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            A Meeky é uma marca brasileira de tecnologia e áudio focada em produtos para concentração, produtividade e performance. Seu primeiro produto é o Meeky F5 ANC Pro, um headphone Bluetooth over-ear com cancelamento ativo de ruído, bateria de até 70 horas, certificação Anatel e garantia de 12 meses no Brasil.
          </p>
        </div>
      </section>

      {/* Tecnologia para cada momento — cards conceituais */}
      <section className="bg-secondary" aria-label="Tecnologia para cada momento">
        <div className="container-wide section-padding py-16 md:py-20">
          <SectionHeading eyebrow="Linha Meeky" title="Tecnologia para cada momento" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "Foco", desc: "Para trabalho, estudo e concentração profunda." },
              { icon: Activity, title: "Movimento", desc: "Para treino, rotina ativa e performance diária." },
              { icon: Plane, title: "Rotina", desc: "Para viagens, deslocamentos e momentos em que o mundo faz barulho demais." },
            ].map((item, i) => (
              <article key={i} className="bg-background p-8 rounded-sm border border-border">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-5">
                  <item.icon size={22} className="text-accent" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Bar — abaixo do hero */}
      <section className="bg-secondary border-y border-border">
        <div className="container-wide section-padding py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center md:text-left">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-accent shrink-0" aria-hidden="true" />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-lg font-bold text-foreground">{deliveredOrdersLabel(ordersCount)}</span>
                <span className="text-xs text-muted-foreground">Pedidos pagos e faturados com nota fiscal</span>
              </div>
            </div>
            <div className="hidden md:block h-10 w-px bg-border" aria-hidden="true" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-md">
              <Check size={20} className="text-accent shrink-0" aria-hidden="true" />
              <span>Garantia de 12 meses no Brasil, produto certificado pela Anatel</span>
            </div>
          </div>
        </div>
      </section>


      {/* Como visto em — TechTudo */}
      <section className="bg-background border-b border-border" aria-label="Como visto em">
        <div className="container-wide section-padding py-8 md:py-10">
          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Como visto em</span>
            <a
              href="https://www.techtudo.com.br/listas/2026/04/headphones-com-cancelamento-de-ruido-que-valem-cada-centavo-edqualcomprarie.ghtml"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-2xl md:text-3xl font-bold text-foreground hover:text-accent transition-colors"
            >
              TechTudo
            </a>
            <span className="text-sm text-accent font-medium">Mencionado na seleção de headphones com ANC que valem a pena</span>
          </div>
        </div>
      </section>




      {/* 2 — Transição */}
      <section className="bg-primary">
        <div className="container-wide section-padding py-16 md:py-20">
          <p className="text-center font-display text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground tracking-tight leading-snug max-w-3xl mx-auto">
            Se o problema é distração…
            <br />
            <span className="text-accent">então a solução precisa ser controle.</span>
          </p>
        </div>
      </section>

      {/* 3 — Problema */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="O problema" title="O problema não é falta de tempo." />
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Notificações. Barulho. Interrupções.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Você tenta focar… mas o ambiente não ajuda.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              E no final do dia, a sensação é a mesma:
              <br />
              você poderia ter feito mais.
            </p>
            <p className="mt-6 text-xl font-display font-semibold text-foreground leading-relaxed">
              Foco virou vantagem competitiva.
            </p>
          </div>
        </div>
      </section>

      {/* 4 — Solução */}
      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="A solução" title="A Meeky resolve isso." />
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Criamos um headphone para eliminar distrações e devolver o controle para você.
            </p>
            <p className="mt-6 text-xl font-display font-semibold text-foreground leading-relaxed">
              Mais foco.
              <br />
              Mais clareza.
              <br />
              Mais resultado.
            </p>
          </div>
        </div>
      </section>

      {/* 5 — Bento Box: ecossistema Meeky */}
      <section className="bg-background">
        <div className="container-wide section-padding pb-20 md:pb-28">
          <SectionHeading eyebrow="O ecossistema Meeky" title="Um produto. Um futuro em construção." />
          <BentoGrid />
        </div>
      </section>

      {/* 6 — Visual Premium */}
      <section className="bg-primary">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img src={urbanTouchImg} alt="Modelo usando controle touch do fone Meeky F5 ANC Pro na rua" loading="lazy" width={600} height={750} className="w-full max-w-md rounded-sm object-cover" />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight leading-tight">
                Foco não é sorte.
                <br />
                <span className="text-accent">É ambiente.</span>
              </h2>
            </div>
          </div>
        </div>
      </section>




      {/* 8 — Produto */}
      <section className="bg-background [content-visibility:auto] [contain-intrinsic-size:auto_720px]">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src={boxImg} alt="Headphone Meeky ANC Premium com caixa" loading="lazy" width={600} height={600} className="w-full max-w-md mx-auto" />
            </div>
            <div>
              <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Destaque</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                Headphone Meeky ANC Premium
              </h2>
              <p className="text-muted-foreground mb-8">Silencie o mundo. Foque no que importa.</p>
              <ul className="space-y-4 mb-8">
                {[
                  "Cancelamento de ruído ativo real",
                  "Até 70 horas de bateria",
                  "Conforto prolongado",
                  "Design premium",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground/70 text-sm">
                    <Check size={16} className="text-accent mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/checkout"
                  className="inline-block bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-gold-light text-center"
                >
                  COMPRAR AGORA
                </Link>
                <Link
                  to="/headphone-anc-meeky-f5-pro"
                  className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light text-center"
                >
                  VER DETALHES
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9 — Posicionamento / Por que escolher */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="Posicionamento" title="Foco virou vantagem competitiva." />
          <h3 className="sr-only">Por que escolher a Meeky? Diferenciais: ANC, Bateria, Design</h3>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Enquanto a maioria vive no caos…
              <br />
              <span className="font-display font-semibold text-foreground">você controla o ambiente.</span>
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Menos distração.
              <br />
              Mais resultado.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Headphones, title: "Tecnologia ANC", desc: "Cancelamento de ruído ativo de última geração." },
              { icon: Shield, title: "Garantia 12 meses", desc: "Suporte direto via WhatsApp. Sem burocracia." },
              { icon: Zap, title: "70h de bateria", desc: "Uso contínuo. Carregamento rápido USB-C." },
              { icon: Target, title: "Design focado", desc: "Conforto e performance para o dia a dia." },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-6"

              >
                <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center mx-auto mb-4">
                  <item.icon size={22} className="text-accent" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — B2B */}
      <section className="bg-background [content-visibility:auto] [contain-intrinsic-size:auto_720px]">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Para Empresas</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
                Soluções de foco para empresas
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ambientes mais produtivos começam com menos distração.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                A Meeky leva foco para empresas, equipes e eventos.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light"
              >
                <MessageCircle size={16} />
                FALAR COM COMERCIAL
              </a>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-sm bg-secondary rounded-sm p-10 border border-border text-center">
                <Building2 size={48} className="text-accent mx-auto mb-6" />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">Programa B2B</h3>
                <p className="text-sm text-muted-foreground">Condições especiais para pedidos corporativos e parcerias.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11 — FAQ */}
      <section className="bg-secondary [content-visibility:auto] [contain-intrinsic-size:auto_720px]">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" />
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { q: "O cancelamento de ruído funciona de verdade?", a: "Sim. O Meeky F5 tem ANC de até 20dB, ideal para ruídos constantes de home office, academia e transporte." },
              { q: "Quanto dura a bateria?", a: "Até 70h sem ANC e até 40h com ANC ativo — suficiente para 8 dias de uso intenso sem recarregar." },
              { q: "Tem garantia?", a: "Sim. 12 meses com suporte direto no Brasil." },
              { q: "Como funciona o envio?", a: "Frete grátis para todo o Brasil com rastreamento — Envio Full SP em até 24h." },
            ].map((item, i) => (
              <details
                key={i}
                className="group bg-background rounded-sm border border-border"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer font-display text-sm font-semibold text-foreground">
                  {item.q}
                  <ChevronRight size={16} className="text-muted-foreground group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-sm font-semibold text-accent hover:text-gold-light inline-flex items-center gap-1">
              Ver todas as perguntas <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 12 — CTA Final */}
      <section className="bg-primary">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-primary-foreground">
              O mundo vai continuar tentando te distrair.
            </h2>
            <p className="text-lg text-primary-foreground/60 mb-10">
              A diferença é que agora você tem controle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/checkout"
                className="inline-block bg-accent text-accent-foreground px-10 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-gold-light"
              >
                ATIVAR MEU FOCO AGORA
              </Link>
              <Link
                to="/checkout"
                className="inline-block border border-primary-foreground/20 text-primary-foreground px-10 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-primary-foreground/10"
              >
                COMPRAR AGORA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
