import { oaiqTrack, oaiqContents } from "@/lib/openaiPixel";
import { ttqViewContent, ttqInitiateCheckout } from "@/lib/tiktokPixel";
import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Check, Shield, Battery, Bluetooth, Volume2, Headphones, Zap, Minus, Plus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import SectionHeading from "@/components/shared/SectionHeading";
import SEO from "@/components/shared/SEO";
import { useProductStock } from "@/hooks/useProductStock";
import { useDeliveredOrdersCount, deliveredOrdersLabel } from "@/hooks/useDeliveredOrdersCount";
import ProductGallery from "@/components/product/ProductGallery";
import StickyMobileCTA from "@/components/product/StickyMobileCTA";

const ProductFAQ = lazy(() => import("@/components/product/ProductFAQ"));




const faqItems = [
  {
    q: "O Meeky F5 ANC Pro realmente cancela ruído?",
    a: "Sim. O Meeky F5 ANC Pro possui cancelamento de ruído ativo de até 20±3dB, certificado pela Anatel. Bloqueia ruídos constantes como trânsito, ar-condicionado e ambiente de trabalho.",
  },
  {
    q: "Quantas horas dura a bateria?",
    a: "Até 70h sem ANC / até 40h com ANC ativo. Para a maioria dos usuários, isso significa uma semana inteira sem carregar. E com carga rápida, 10 minutos = 3 horas de uso.",
  },
  {
    q: "Tem garantia?",
    a: "Sim. 12 meses de garantia contra defeitos de fabricação, com suporte dedicado via WhatsApp. Empresa brasileira (Barganha Mix Ltda) com CNPJ ativo.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "Postagem em até 24h (Envio Full SP). O prazo de entrega varia de 2 a 5 dias úteis dependendo da região, via Mercado Envios ou transportadora parceira.",
  },
  {
    q: "Funciona com celular e computador ao mesmo tempo?",
    a: "Sim. O Bluetooth 5.4 Multiponto permite conectar 2 dispositivos simultaneamente. Você pode ouvir música no notebook e atender chamadas no celular sem desconectar.",
  },
];

const productSchema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  name: "Headphone Meeky F5 ANC Pro",
  image: [
    "https://meeky.com.br/og-image.jpg",
  ],
  description: "Headphone premium com Bluetooth 5.4 Multiponto, Cancelamento de Ruído Ativo (ANC) híbrido com 4 microfones, 70h de bateria, certificação Anatel e SIG Bluetooth, 12 meses de garantia no Brasil.",
  sku: "MEEKY-F5-PRO-BLK",
  mpn: "F5-ANC-2026",
  gtin13: "7908983802679",
  brand: { "@type": "Brand", name: "Meeky" },
  color: "Preto",
  material: "Couro sintético premium, espuma viscoelástica, plástico ABS",
  weight: { "@type": "QuantitativeValue", value: "250", unitCode: "GRM" },
  url: "https://meeky.com.br/headphone-anc-meeky-f5-pro",
  offers: {
    "@type": "Offer",
    url: "https://meeky.com.br/headphone-anc-meeky-f5-pro",
    priceCurrency: "BRL",
    price: "297.00",
    priceValidUntil: "2027-01-01",
    itemCondition: "https://schema.org/NewCondition",
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: "Meeky Audio" },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "BRL" },
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "BR" },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
      },
      shippingLabel: "Frete Grátis — Envio Full SP",
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "BR",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  },
  additionalProperty: [
    { "@type": "PropertyValue", name: "Bluetooth", value: "5.4 Multiponto (2 dispositivos simultâneos)" },
    { "@type": "PropertyValue", name: "Garantia", value: "12 Meses no Brasil" },
    { "@type": "PropertyValue", name: "Bateria", value: "70 Horas" },
    { "@type": "PropertyValue", name: "Cancelamento de Ruído", value: "ANC Ativo Híbrido com 4 microfones" },
    { "@type": "PropertyValue", name: "Driver", value: "40mm Hi-Fi" },
    { "@type": "PropertyValue", name: "Codecs", value: "AAC, SBC, LDAC" },
    { "@type": "PropertyValue", name: "Certificação", value: "Anatel e SIG Bluetooth" },
    { "@type": "PropertyValue", name: "Resistência", value: "IPX4" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Headphone Meeky F5 ANC Pro", url: "https://meeky.com.br/headphone-anc-meeky-f5-pro" },
]);

const ProductPage = () => {
  const ordersCount = useDeliveredOrdersCount();

  const { inStock } = useProductStock("f5anc");
  const [quantity, setQuantity] = useState(1);

  // Analytics: GA4 view_item — deduplicated per session
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dedupKey = "view_item_fired_MEEKY-F5-PRO-BLK";
    if (sessionStorage.getItem(dedupKey)) return;

    const items = [{
      item_id: "MEEKY-F5-PRO-BLK",
      item_name: "Headphone Meeky F5 ANC Pro",
      price: 297.0,
      quantity: 1,
    }];

    if ((window as any).gtag) {
      (window as any).gtag("event", "view_item", {
        currency: "BRL",
        value: 297.0,
        items,
      });
    }
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({ ecommerce: null });
      (window as any).dataLayer.push({
        event: "view_item",
        ecommerce: { currency: "BRL", value: 297.0, items },
      });
    }
    // Meta Pixel — ViewContent
    if ((window as any).fbq) {
      (window as any).fbq("track", "ViewContent", {
        content_ids: ["MEEKY-F5-PRO-BLK"],
        content_name: "Headphone Meeky F5 ANC Pro",
        content_type: "product",
        value: 297.0,
        currency: "BRL",
      });
    }
    // OpenAI Ads Pixel — contents_viewed
    oaiqTrack("contents_viewed", {
      type: "contents",
      amount: 29700,
      currency: "BRL",
      contents: oaiqContents(1),
    });
    // TikTok Pixel — ViewContent
    ttqViewContent(297.0, 1);
    sessionStorage.setItem(dedupKey, "1");
    console.log("[Analytics] view_item + ViewContent fired");
  }, []);

  const handleBeginCheckout = () => {
    if (typeof window === "undefined") return;
    const dedupKey = "begin_checkout_fired";
    if (sessionStorage.getItem(dedupKey)) return;

    const items = [{
      item_id: "MEEKY-F5-PRO-BLK",
      item_name: "Headphone Meeky F5 ANC Pro",
      price: 297.0,
      quantity,
    }];
    const value = 297.0 * quantity;

    if ((window as any).gtag) {
      (window as any).gtag("event", "begin_checkout", {
        currency: "BRL",
        value,
        items,
      });
    }
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({ ecommerce: null });
      (window as any).dataLayer.push({
        event: "begin_checkout",
        ecommerce: { currency: "BRL", value, items },
      });
    }
    // Meta Pixel — InitiateCheckout
    if ((window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        content_ids: ["MEEKY-F5-PRO-BLK"],
        content_type: "product",
        num_items: quantity,
        value,
        currency: "BRL",
      });
    }
    // OpenAI Ads Pixel — checkout_started
    oaiqTrack("checkout_started", {
      type: "contents",
      amount: Math.round(value * 100),
      currency: "BRL",
      contents: oaiqContents(quantity),
    });
    // TikTok Pixel — InitiateCheckout
    ttqInitiateCheckout(297.0, quantity);
    sessionStorage.setItem(dedupKey, "1");
    console.log("[Analytics] begin_checkout + InitiateCheckout fired");
  };





  return (
    <Layout>
      <SEO title="Meeky F5 ANC Pro — Headphone com Cancelamento de Ruído" description="Headphone Meeky F5 ANC Pro — cancelamento de ruído ativo até 20dB, 70h de bateria, Bluetooth 5.4, LDAC, Anatel, garantia 12 meses. R$297 com frete grátis para todo o Brasil." ogImage="https://meeky.com.br/og-image.jpg" canonical="https://meeky.com.br/headphone-anc-meeky-f5-pro" preloadImage="/hero-product-md.webp" ogType="product" />
      <JsonLd data={productSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* 1 — Hero */}
      <section className="bg-background">
        <div className="container-wide section-padding py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <ProductGallery />

            <div>
              <div className="mb-4">
                <a
                  href="https://www.techtudo.com.br/listas/2026/04/headphones-com-cancelamento-de-ruido-que-valem-cada-centavo-edqualcomprarie.ghtml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent hover:bg-accent/20 transition-colors"
                >
                  📰 Mencionado pela TechTudo
                </a>
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-3">
                Meeky F5 ANC Pro — Headphone com Cancelamento de Ruído Ativo
              </h1>
              <p className="font-display text-xl md:text-2xl text-accent font-semibold tracking-tight mb-4">
                Menos ruído. Mais resultado.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Trabalhar em casa com barulho ao redor. Estudar em café cheio. Treinar com foco total. O Meeky F5 ANC Pro foi feito para quem precisa de silêncio real — não de marketing de silêncio.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Com cancelamento de ruído ativo até 20dB, 70 horas de bateria e Bluetooth 5.4 que conecta dois dispositivos ao mesmo tempo, é o headphone que some do seu pescoço e aparece só quando você precisa dele.
              </p>

              <div className="space-y-2 mb-6">
                {[
                  "Cancelamento de ruído ativo real (ANC Pro)",
                  "Bluetooth 5.4 Multiponto — conecte 2 dispositivos",
                  "Até 70 horas de bateria",
                  "12 meses de garantia no Brasil",
                  "Certificado Anatel e SIG Bluetooth",
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={16} className="text-accent shrink-0" /> {t}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Check size={16} className="text-accent shrink-0" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">{deliveredOrdersLabel(ordersCount)}</span>
              </div>

              <div className="mb-2 flex items-baseline gap-3">
                <span className="text-xl text-muted-foreground line-through">R$ 349</span>
                <span className="font-display text-4xl font-bold text-foreground">R$ 297</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">ou até 6x de R$49,50 sem juros no cartão</p>
              <p className="text-xs text-accent font-semibold mb-3">✓ Frete grátis para todo o Brasil</p>

              <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-foreground">
                <span aria-hidden="true">📦</span>
                <span>Envio FULL SP · Postagem em até 24h úteis</span>
              </div>


              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-foreground font-semibold">Quantidade:</span>
                <div className="flex items-center border border-border rounded-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 hover:bg-secondary transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} className="text-foreground" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                    className="p-2 hover:bg-secondary transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} className="text-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {inStock ? (
                  <Link
                    to={`/checkout?qty=${quantity}`}
                    onClick={handleBeginCheckout}
                    className="flex-1 bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-all text-center"
                  >
                    QUERO MEU SILÊNCIO AGORA
                  </Link>
                ) : (
                  <div className="flex-1 bg-muted text-muted-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm text-center cursor-not-allowed">
                    PRODUTO INDISPONÍVEL
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>✓ Frete grátis</span>
                <span>✓ Entrega em até 5 dias</span>
                <span>✓ Garantia 12 meses</span>
                <span>✓ Compra 100% segura</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-1">
                <a
                  href="#experiencia"
                  className="flex-1 border border-border text-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-secondary transition-colors text-center"
                >
                  VER COMO FUNCIONA
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que é o Meeky F5 ANC Pro */}
      <section className="bg-background">
        <div className="container-wide section-padding py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-6">
              O que é o Meeky F5 ANC Pro?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              O Meeky F5 ANC Pro é um headphone Bluetooth over-ear com cancelamento ativo de ruído de até 20dB, bateria de até 70 horas, Bluetooth 5.4 multiponto, drivers de 40mm, certificação Anatel e garantia de 12 meses no Brasil. É indicado para home office, estudo, academia, viagens e rotina com excesso de barulho.
            </p>
          </div>
        </div>
      </section>

      {/* Ficha Técnica */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-8">
              Ficha técnica
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-1/2 md:w-2/5">
                      Especificação
                    </th>
                    <th scope="col" className="py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Detalhe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Tipo
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">Headphone Bluetooth over-ear</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Cancelamento de ruído
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">ANC ativo até 20dB</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Bateria sem ANC
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">Até 70 horas</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Bateria com ANC
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">Até 40 horas</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Bluetooth
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">5.4 Multiponto (2 dispositivos)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Drivers
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">40mm Hi-Fi</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Codecs
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">AAC, SBC, LDAC</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Certificação
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">Anatel e SIG Bluetooth</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Resistência
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">IPX4</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Garantia
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">12 meses no Brasil</td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-3 pr-4 text-sm font-semibold text-foreground">
                      Preço
                    </th>
                    <td className="py-3 text-sm text-muted-foreground">R$297 com frete grátis</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Especificações */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="Especificações" title="Detalhes técnicos" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Volume2, label: "ANC", value: "Cancelamento de ruído ativo híbrido" },
              { icon: Bluetooth, label: "Bluetooth", value: "5.4 Multiponto (2 dispositivos)" },
              { icon: Battery, label: "Bateria", value: "Até 70 horas" },
              { icon: Shield, label: "Garantia", value: "12 meses no Brasil" },
              { icon: Headphones, label: "Áudio", value: "Driver 40mm Hi-Fi · AAC, SBC, LDAC" },
              { icon: Zap, label: "Certificação", value: "Anatel e SIG Bluetooth · IPX4" },
            ].map((s, i) => (
              <div key={i} className="bg-background p-6 rounded-sm border border-border flex items-start gap-4 animate-fade-in opacity-0" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}>
                <s.icon size={20} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="font-display text-sm font-semibold text-foreground">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="Benefícios" title="Feito para quem leva resultado a sério." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "Foco", text: "Trabalhe, estude ou produza sem distração." },
              { icon: Headphones, title: "Treino", text: "Mais concentração, mais intensidade, mais resultado." },
              { icon: Shield, title: "Conforto", text: "Use por horas sem incômodo." },
              { icon: Battery, title: "Bateria", text: "Até 70h — esqueça carregador." },
            ].map((b, i) => (
              <div key={i} className="bg-secondary p-8 rounded-sm border border-border text-center animate-fade-in opacity-0" style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}>
                <b.icon size={28} className="text-accent mx-auto mb-4" />
                <h3 className="font-display text-base font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* FAQ */}
      <section className="bg-background [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" />
          <div className="max-w-2xl mx-auto">
            <Suspense fallback={<div style={{ minHeight: "400px" }} />}>
              <ProductFAQ items={faqItems} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O mundo vai continuar tentando te distrair.
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              A diferença é que agora você tem controle.
            </p>
            <Link
              to="/checkout"
              className="inline-block bg-primary text-primary-foreground px-10 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-all"
            >
              COMPRAR AGORA — R$ 297 COM FRETE GRÁTIS
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer para não cobrir conteúdo com a sticky CTA mobile */}
      <div className="md:hidden h-20" aria-hidden="true" />

      <StickyMobileCTA />
    </Layout>
  );
};

export default ProductPage;
