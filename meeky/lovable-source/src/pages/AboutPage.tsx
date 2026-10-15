import Layout from "@/components/layout/Layout";
import JsonLd from "@/components/shared/JsonLd";
import { useDeliveredOrdersCount, deliveredOrdersLabel } from "@/hooks/useDeliveredOrdersCount";

import { Users, ShieldCheck, Award, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/shared/SEO";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import founderFilipe from "@/assets/founder-filipe.webp";
import founderFernanda from "@/assets/founder-fernanda.webp";

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Sobre", url: "https://meeky.com.br/sobre" },
]);

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://meeky.com.br/#organization",
      name: "Meeky Audio",
      legalName: "Barganha Mix Ltda",
      url: "https://meeky.com.br/",
      description: "A Meeky é uma marca brasileira de tecnologia e áudio focada em produtos para concentração, produtividade e performance.",
      founder: [
        { "@id": "https://meeky.com.br/sobre#filipe-cardoso" },
        { "@id": "https://meeky.com.br/sobre#fernanda-micchi" },
      ],
      foundingLocation: { "@type": "Place", name: "Jacareí, São Paulo, Brasil" },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Jacareí",
        addressRegion: "SP",
        addressCountry: "BR",
      },
      taxID: "43.341.597/0001-40",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+55-12-99107-4311",
        contactType: "customer support",
        areaServed: "BR",
        availableLanguage: "Portuguese",
      },
      sameAs: ["https://www.instagram.com/meeky.br"],
    },
    {
      "@type": "Person",
      "@id": "https://meeky.com.br/sobre#filipe-cardoso",
      name: "Filipe Cardoso",
      jobTitle: "Cofundador da Meeky",
      worksFor: { "@id": "https://meeky.com.br/#organization" },
      url: "https://meeky.com.br/sobre#filipe-cardoso",
      image: `https://meeky.com.br${founderFilipe}`,
      knowsAbout: ["marketplaces", "e-commerce", "tecnologia de áudio", "headphones com cancelamento de ruído", "desenvolvimento de produto"],
      description: "Filipe Cardoso é cofundador da Meeky, engenheiro e empreendedor no mercado de tecnologia e marketplaces. Na Meeky, lidera produto, fornecedores e estratégia comercial.",
    },
    {
      "@type": "Person",
      "@id": "https://meeky.com.br/sobre#fernanda-micchi",
      name: "Fernanda Micchi",
      jobTitle: "Cofundadora da Meeky",
      worksFor: { "@id": "https://meeky.com.br/#organization" },
      url: "https://meeky.com.br/sobre#fernanda-micchi",
      image: `https://meeky.com.br${founderFernanda}`,
      knowsAbout: ["RH", "saúde emocional", "desenvolvimento humano", "foco", "bem-estar no trabalho"],
      description: "Fernanda Micchi é cofundadora da Meeky, especialista em RH, saúde emocional e desenvolvimento humano. Na Meeky, conecta tecnologia com foco, presença e bem-estar.",
    },
    {
      "@type": "AboutPage",
      "@id": "https://meeky.com.br/sobre",
      name: "Sobre a Meeky",
      description: "Conheça a história da Meeky Audio, marca brasileira criada por Filipe Cardoso e Fernanda Micchi para ajudar pessoas a terem mais foco e performance com o headphone F5 ANC Pro.",
      url: "https://meeky.com.br/sobre",
      mainEntity: { "@id": "https://meeky.com.br/#organization" },
    },
  ],
};

const stats = (ordersCount: number | null) => [
  { icon: ShieldCheck, value: deliveredOrdersLabel(ordersCount), label: "Pedidos entregues em todo o Brasil" },
  { icon: Users, value: "12 meses", label: "Garantia no Brasil" },
  { icon: Award, value: "Citado", label: "na seleção TechTudo de headphones ANC" },
];

const productBullets = [
  "ANC ativo até 20dB",
  "Até 70h de bateria",
  "Bluetooth 5.4 multiponto",
  "Drivers de 40mm",
  "Áudio LDAC Hi-Res",
  "Certificação Anatel",
  "Garantia 12 meses",
];

const AboutPage = () => {
  const ordersCount = useDeliveredOrdersCount();

  return (
    <Layout>
      <SEO title="Sobre a Meeky Audio — Headphones brasileiros para foco" description="Conheça a história da Meeky Audio, marca brasileira criada por Filipe Cardoso e Fernanda Micchi para ajudar pessoas a terem mais foco e performance com o headphone F5 ANC Pro." canonical="https://meeky.com.br/sobre" />
      <JsonLd data={aboutPageSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="bg-primary">
        <div className="container-wide section-padding py-24 md:py-36">
          <div className="max-w-3xl">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-6 block">Sobre a Meeky</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight leading-tight mb-6">
              Sobre a Meeky: tecnologia brasileira para foco e performance
            </h1>
            <p className="text-lg text-primary-foreground/60 leading-relaxed max-w-2xl mb-6">
              A Meeky nasceu para ajudar pessoas a recuperarem o controle da própria atenção em um mundo cada vez mais barulhento.
            </p>
            <p className="text-sm text-primary-foreground/40 leading-relaxed">
              Operada por Barganha Mix Ltda · CNPJ 43.341.597/0001-40 · Certificação Anatel · Garantia 12 meses no Brasil
            </p>
          </div>
        </div>
      </section>

      {/* O que é a Meeky? */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-8 text-center">
              O que é a Meeky?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-center">
              A Meeky é uma marca brasileira de tecnologia e áudio, operada pela Barganha Mix Ltda, criada por Filipe Cardoso e Fernanda Micchi para desenvolver produtos voltados a foco, produtividade e performance. Seu primeiro produto é o Meeky F5 ANC Pro, um headphone Bluetooth over-ear com cancelamento ativo de ruído, bateria de até 70 horas, certificação Anatel e garantia de 12 meses no Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* História + imagem feminina */}
      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="max-w-3xl mx-auto">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block text-center">Nossa história</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-8 text-center">
              A história por trás do silêncio
            </h2>
            <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed mb-12">
              <p>
                A Meeky nasceu de uma dor real que o Filipe vivia no dia a dia: a dificuldade de manter foco, produtividade e equilíbrio em meio ao excesso de barulho, distrações e ansiedade.
              </p>
              <p>
                Atuando no universo dos marketplaces, ele percebia que muitos produtos de tecnologia eram vendidos apenas como "mais um eletrônico". Mas havia uma oportunidade maior: criar uma marca que entregasse não só um fone de ouvido, mas uma ferramenta de foco, presença e performance.
              </p>
              <p>
                A decisão se confirmou em uma viagem à China, onde o Filipe teve contato direto com fábricas, processos de produção e tendências do mercado de áudio. Ali percebeu que existia espaço entre produtos genéricos e marcas realmente bem posicionadas — havia tecnologia disponível e qualidade de construção para desenvolver um headphone com padrão premium, mas com uma marca brasileira por trás, com propósito e conexão com o cliente.
              </p>
              <p>
                A China mostrou o potencial do produto. O Brasil mostrou a dor do público. A Meeky nasceu no encontro dessas duas visões.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Do conceito ao F5 ANC Pro */}
      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Desenvolvimento</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-6">
              Do conceito ao F5 ANC Pro
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              O Meeky F5 ANC Pro foi desenvolvido a partir de uma dor real: a dificuldade de manter foco em meio ao excesso de barulho. A escolha do produto passou por análise de mercado, contato com fornecedores, avaliação de qualidade de construção, conforto, bateria, Bluetooth, cancelamento ativo de ruído e certificação para venda no Brasil.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mb-10">
            {productBullets.map((bullet) => (
              <span
                key={bullet}
                className="inline-flex items-center rounded-full bg-secondary border border-border px-4 py-2 text-sm font-medium text-foreground"
              >
                {bullet}
              </span>
            ))}
          </div>
          <div className="text-center">
            <Link
              to="/headphone-anc-meeky-f5-pro"
              className="inline-flex items-center justify-center rounded-sm bg-accent px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-accent-foreground hover:bg-accent/90"
            >
              Conhecer o F5 ANC Pro
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Fundadores */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Fundadores</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
              Quem está por trás da Meeky
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <article id="filipe-cardoso" className="bg-background border border-border rounded-sm overflow-hidden flex flex-col">
              <figure className="m-0">
                <img
                  src={founderFilipe}
                  alt="Filipe Cardoso, cofundador da Meeky, usando o headphone F5 ANC Pro durante treino na academia"
                  loading="lazy"
                  width={1000}
                  height={1000}
                  className="w-full object-cover aspect-square"
                />
                <figcaption className="px-8 pt-4 text-sm text-muted-foreground italic">
                  Filipe Cardoso, cofundador da Meeky
                </figcaption>
              </figure>
              <div className="p-8">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">Filipe Cardoso</h3>
                <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-4">Cofundador da Meeky</p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Engenheiro e empreendedor no mercado de tecnologia e marketplaces. Na Meeky, lidera produto, fornecedores e estratégia comercial — do conceito ao headphone que você tem nas mãos.
                </p>
              </div>
            </article>
            <article id="fernanda-micchi" className="bg-background border border-border rounded-sm overflow-hidden flex flex-col">
              <figure className="m-0">
                <img
                  src={founderFernanda}
                  alt="Fernanda Micchi, cofundadora da Meeky, usando o headphone F5 ANC Pro trabalhando em coworking"
                  loading="lazy"
                  width={1000}
                  height={1000}
                  className="w-full object-cover aspect-square"
                />
                <figcaption className="px-8 pt-4 text-sm text-muted-foreground italic">
                  Fernanda Micchi, cofundadora da Meeky
                </figcaption>
              </figure>
              <div className="p-8">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">Fernanda Micchi</h3>
                <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-4">Cofundadora da Meeky</p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Especialista em RH, saúde emocional e desenvolvimento humano. Na Meeky, conecta tecnologia com foco, presença e bem-estar, garantindo que a marca fale com pessoas, não apenas com consumidores.
                </p>
              </div>
            </article>
          </div>
          <p className="max-w-3xl mx-auto text-center mt-12 text-base md:text-lg text-muted-foreground leading-relaxed">
            Juntos, Filipe e Fernanda criaram a Meeky para transformar tecnologia em uma ferramenta prática de foco, produtividade e performance.
          </p>
        </div>
      </section>


      {/* Números */}
      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="text-center mb-12">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Em números</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">A Meeky em números</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats(ordersCount).map((item, i) => (
              <div
                key={i}
                className="bg-secondary p-8 rounded-sm border border-border text-center"
              >
                <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center mx-auto mb-4">
                  <item.icon size={22} className="text-accent" />
                </div>
                <p className="font-display text-2xl font-bold text-foreground mb-1">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Na mídia */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Na mídia</span>
            <p className="font-display text-xl md:text-2xl font-semibold text-foreground leading-snug">
              Mencionado pela{" "}
              <a
                href="https://www.techtudo.com.br/listas/2026/04/headphones-com-cancelamento-de-ruido-que-valem-cada-centavo-edqualcomprarie.ghtml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline underline-offset-4"
              >
                TechTudo
              </a>
              , em lista de recomendação de headphones com cancelamento de ruído que valem a pena (abril/2026).
            </p>
          </div>
        </div>
      </section>

      {/* Proposta */}
      <section className="bg-primary">
        <div className="container-wide section-padding py-16 md:py-24 text-center">
          <div>
            <p className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-primary-foreground leading-tight max-w-3xl mx-auto">
              A Meeky nasceu para devolver às pessoas o controle do próprio ambiente, ajudando cada uma a viver com mais foco, equilíbrio e leveza.
            </p>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="bg-background">
        <div className="container-wide section-padding py-16 md:py-20">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link to="/headphone-anc-meeky-f5-pro" className="inline-flex items-center justify-center rounded-sm bg-accent px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-accent-foreground hover:bg-accent/90">
              Conhecer o produto
            </Link>
            <Link to="/reviews" className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-foreground hover:bg-secondary">
              Por que confiar na Meeky
            </Link>
            <Link to="/faq" className="inline-flex items-center justify-center rounded-sm border border-border px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-foreground hover:bg-secondary">
              Dúvidas frequentes
            </Link>
          </div>
        </div>
      </section>

      {/* Transparência */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-12 md:py-16">
          <div className="text-center">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">Transparência</span>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Razão social: <span className="text-foreground font-semibold">Barganha Mix Ltda</span></p>
              <p>CNPJ: 43.341.597/0001-40</p>
              <p>Localização: Jacareí, SP — Brasil</p>
              <p>E-mail: contato@meeky.com.br</p>
              <p>Certificações: Anatel | Garantia 12 meses</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary">
        <div className="container-wide section-padding py-20 md:py-28 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight mb-6">
              Conheça o primeiro produto da Meeky
            </h2>
            <p className="text-lg text-primary-foreground/60 leading-relaxed mb-10">
              O Meeky F5 ANC Pro é a primeira expressão prática do nosso propósito: reduzir distrações para que você trabalhe, estude, treine e viva com mais foco.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/headphone-anc-meeky-f5-pro"
                className="inline-flex items-center justify-center rounded-sm bg-accent px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-accent-foreground hover:bg-accent/90"
              >
                Conhecer o F5 ANC Pro
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link
                to="/reviews"
                className="inline-flex items-center justify-center rounded-sm border border-primary-foreground/20 px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary-foreground/10"
              >
                Por que confiar
              </Link>
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center rounded-sm border border-primary-foreground/20 px-8 py-3 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary-foreground/10"
              >
                Comprar agora
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
