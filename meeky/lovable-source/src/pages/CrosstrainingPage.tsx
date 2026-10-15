import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Battery, Bluetooth, Volume2, Shield, Heart, ShoppingBag, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import SectionHeading from "@/components/shared/SectionHeading";
import JsonLd from "@/components/shared/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

const crosstrainingBreadcrumbSchema = buildBreadcrumbSchema([
  { name: "Início", url: "https://meeky.com.br/" },
  { name: "Crosstraining", url: "https://meeky.com.br/crosstraining" },
]);
import logo from "@/assets/meeky-logo.webp";
import crosstrainingLogo from "@/assets/crosstraining-logo.webp";
import ifpLogo from "@/assets/ifp-logo.webp";

import crosstrainingFestival from "@/assets/crosstraining-festival.webp";
import { supabase } from "@/integrations/supabase/client";
import { trackPageView, trackEvent, trackQrScanFromUrl } from "@/lib/campaignTracking";

// ============================================================
// CONFIG
// ============================================================
const EVENTO_NOME = "Crosstraining Festival";
const INSTITUICAO_NOME = "Instituto Fortalecendo Pessoas (IFP)";
const INSTITUICAO_DESCRICAO =
  "Organização social de São José dos Campos que desenvolve atletas paralímpicos nas modalidades Goalball e Vôlei Sentado, representando o município em campeonatos paulistas e nacionais.";
const DONATION_PERCENT = 7; // 7% destinado à instituição
const BASE_PRICE = 297; // preço cheio do site
const PRODUCT_PRICE = 279; // preço com cupom CROSSTRAINING2026 (-R$18)
const CAMPAIGN_DEADLINE = new Date("2026-06-07T23:59:59-03:00");
const CAMPAIGN_COUPON = "CROSSTRAINING2026";

const CHECKOUT_URL = `/checkout?ref=crosstraining&utm_source=evento&utm_campaign=crosstraining2026&cupom=${CAMPAIGN_COUPON}`;
const CHECKOUT_URL_HERO = "/checkout?qty=1&coupon=CROSSTRAINING2026&utm_source=crosstraining&utm_medium=landing&utm_campaign=crosstraining2026";

const benefits = [
  { icon: Volume2, title: "ANC Híbrido", desc: "Cancelamento ativo até 20±3dB com 4 microfones." },
  { icon: Battery, title: "70h de bateria", desc: "Uma semana inteira sem carregar." },
  { icon: Bluetooth, title: "Bluetooth 5.4 Multiponto", desc: "Conecte 2 dispositivos ao mesmo tempo." },
  { icon: Shield, title: "Garantia Brasil", desc: "12 meses, suporte via WhatsApp." },
];

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

function useLiveImpact() {
  const [data, setData] = useState({ units: 0, raised: 0, loading: true });

  useEffect(() => {
    let cancelled = false;
    async function fetchImpact() {
      // NOTA: a tabela `orders` ainda não armazena utm_campaign.
      // Pedidos da campanha são identificados pelo cupom CROSSTRAINING2026.
      const { data: rows, error } = await supabase
        .from("orders")
        .select("quantity, total_amount")
        .eq("coupon_code", CAMPAIGN_COUPON)
        .eq("payment_status", "approved");
      if (cancelled || error) return;
      const units = (rows ?? []).reduce((acc, r: any) => acc + (r.quantity ?? 1), 0);
      const grossUnits = units * PRODUCT_PRICE;
      const raised = (grossUnits * DONATION_PERCENT) / 100;
      setData({ units, raised, loading: false });
    }
    fetchImpact();
    const id = setInterval(fetchImpact, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return data;
}

const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const CrosstrainingPage = () => {
  const { d, h, m, s } = useCountdown(CAMPAIGN_DEADLINE);
  const { units, raised, loading } = useLiveImpact();

  useEffect(() => {
    trackPageView("crosstraining");
    trackQrScanFromUrl();
  }, []);

  const handleCtaClick = (cta_id: string) => {
    void trackEvent("cta_click", "crosstraining", { cta_id });
  };

  return (
    <Layout>
      {/* BANNER EVENTO ENCERRADO */}
      <div className="bg-accent text-accent-foreground py-3 px-4 text-center">
        <p className="font-display text-sm md:text-base font-semibold tracking-wide">
          Evento encerrado — O Crosstraining Festival Brasil 2026 já foi realizado. Obrigado a todos que participaram!
        </p>
      </div>

      <SEO
        title="Meeky × Crosstraining Festival Brasil 2026 — Foco total. Por uma causa real."
        description={`Cada Meeky F5 ANC Pro vendido na campanha gera ${DONATION_PERCENT}% de doação para o Instituto Fortalecendo Pessoas. 2.700 atletas inscritos. Impacto rastreável em tempo real.`}
        canonical="https://meeky.com.br/crosstraining"
        ogImage="https://meeky.com.br/og-image.jpg"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: "Meeky × Crosstraining Festival Brasil 2026",
          startDate: "2026-06-05",
          endDate: "2026-06-07",
          eventStatus: "https://schema.org/EventEnded",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: { "@type": "Place", name: "Crosstraining Festival Brasil", address: "Brasil" },
          description: `Campanha solidária encerrada — ${DONATION_PERCENT}% de cada Meeky vendido foi doado para ${INSTITUICAO_NOME}.`,
          organizer: { "@type": "Organization", name: "Meeky", url: "https://meeky.com.br" },
        }}
      />
      <JsonLd data={crosstrainingBreadcrumbSchema} />

      {/* HERO */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="container-wide section-padding py-20 md:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                <img src={logo} alt="Meeky" width={120} height={32} className="h-8 md:h-10 w-auto" />
                <span className="font-display text-2xl md:text-3xl text-accent">×</span>
                <img
                  src={crosstrainingLogo}
                  alt="Crosstraining Festival Brasil 2026"
                  width={64}
                  height={64}
                  className="h-12 md:h-14 w-auto"
                />
              </div>

              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent text-sm font-semibold rounded-sm border border-accent/30">
                  Oferta exclusiva Crosstraining Festival — De R$ {BASE_PRICE} por R$ {PRODUCT_PRICE}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                Faça parte do <span className="text-accent">recorde mundial.</span>
              </h1>

              <p className="text-base md:text-lg text-primary-foreground/80 leading-relaxed mb-6 max-w-xl">
                O Crosstraining Festival Brasil 2026 vai tentar entrar para a Tentativa Oficial de Recorde Mundial com um recorde inédito: o maior número de pessoas treinando crosstraining simultaneamente. 2.700 atletas. Um único momento. Uma causa real.
              </p>

              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 px-4 py-3 bg-accent/15 border border-accent/30 rounded-sm mb-6 max-w-xl">
                <span className="text-sm font-semibold text-accent">Meeky F5 ANC Pro por R$ {PRODUCT_PRICE}</span>
                <span className="hidden sm:inline text-accent/40">·</span>
                <span className="text-sm text-primary-foreground/80">Cupom automático</span>
                <span className="hidden sm:inline text-accent/40">·</span>
                <span className="text-sm text-primary-foreground/80">Frete grátis</span>
                <span className="hidden sm:inline text-accent/40">·</span>
                <span className="text-sm text-primary-foreground/80">{DONATION_PERCENT}% destinado ao IFP</span>
              </div>

              <p className="text-sm text-primary-foreground/60 mb-3">
                Rastreável. Em tempo real. Frete grátis para todo o Brasil.
              </p>
              <p className="text-xs text-primary-foreground/70 mb-10">
                07/06 · São José dos Campos/SP · 2.700 atletas inscritos · Meeky parceira oficial
              </p>

              <Link
                to={CHECKOUT_URL_HERO}
                onClick={() => handleCtaClick("hero")}
                className="inline-block px-10 py-4 text-sm font-semibold tracking-wider rounded-sm bg-accent text-accent-foreground hover:bg-gold-light transition-all hover:scale-105"
              >
                QUERO FAZER PARTE — R$ {PRODUCT_PRICE}
              </Link>

              {/* Countdown */}
              <div className="mt-14">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4">
                  A campanha termina em
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-6">
                  {[
                    { label: "dias", value: d },
                    { label: "horas", value: h },
                    { label: "min", value: m },
                    { label: "seg", value: s },
                  ].map((u) => (
                    <div key={u.label} className="flex flex-col items-center">
                      <span className="font-display text-3xl md:text-5xl font-bold tabular-nums text-primary-foreground">
                        {String(u.value).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] md:text-xs uppercase tracking-widest text-primary-foreground/60 mt-1">
                        {u.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <img
                src={crosstrainingFestival}
                alt="Arte oficial do Crosstraining Festival Brasil 2026 com atletas e o logo do evento"
                width={1200}
                height={800}
                loading="eager"
                fetchPriority="high"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* RECORDE MUNDIAL */}
      <section className="bg-secondary">
        <div className="container-narrow section-padding py-20 md:py-28">
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-lg p-8 md:p-12 text-center">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent block mb-3">
              Tentativa Oficial de Recorde Mundial
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-5">
              Um recorde que ninguém fez antes.
            </h2>
            <p className="text-zinc-900 leading-relaxed mb-4">
              O Crosstraining Festival Brasil 2026 vai tentar quebrar um Recorde Mundial Inédito: o maior número de pessoas treinando crosstraining simultaneamente no mundo. Não existe outro registro igual. 2.700 atletas. Um único treino. Uma única data. 07 de junho de 2026, em São José dos Campos.
            </p>
            <p className="text-zinc-900 leading-relaxed mb-4">
              A Meeky é parceira oficial desse momento histórico. Cada headphone vendido na campanha carrega esse legado — e destina {DONATION_PERCENT}% ao Instituto Fortalecendo Pessoas, que desenvolve atletas paralímpicos de Goalball e Vôlei Sentado em SJC.
            </p>
            <p className="text-zinc-900 font-semibold leading-relaxed mb-6">
              Você não precisa estar no evento para fazer parte da história.
            </p>
            <Link
              to={CHECKOUT_URL}
              onClick={() => handleCtaClick("recorde-mundial")}
              className="inline-block px-10 py-4 text-sm font-semibold tracking-wider rounded-sm bg-primary text-primary-foreground hover:bg-charcoal-light transition-all hover:scale-105"
            >
              COMPRAR POR R$ {PRODUCT_PRICE} E FAZER PARTE
            </Link>
          </div>
        </div>
      </section>

      {/* CAUSA */}
      <section className="bg-background">
        <div className="container-narrow section-padding py-20 md:py-28">
          <SectionHeading eyebrow="A causa" title="Atleta apoia atleta" />
          <div className="bg-card border border-border rounded-lg p-8 md:p-12 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <img
                src={ifpLogo}
                alt="Logo Instituto Fortalecendo Pessoas (IFP)"
                width={160}
                height={160}
                loading="lazy"
                className="w-32 h-32 md:w-40 md:h-40 object-contain shrink-0 mx-auto md:mx-0"
              />
              <div className="flex-1">
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-1">
                  {INSTITUICAO_NOME}
                </h3>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">
                  Instituição beneficiada — Crosstraining Festival Brasil 2026
                </p>
                <p className="text-zinc-900 leading-relaxed mb-4">
                  Atleta apoia atleta.
                </p>
                <p className="text-zinc-900 leading-relaxed mb-4">
                  No Goalball, esporte paralímpico apoiado pelo Instituto Fortalecendo Pessoas, o silêncio na quadra não é detalhe — é regra do jogo. Os atletas usam audição, concentração e estratégia para localizar a bola e competir em alto nível.
                </p>
                <p className="text-zinc-900 leading-relaxed mb-4">
                  A Meeky acredita nessa mesma força do foco: quando o ruído diminui, a performance aparece.
                </p>
                <p className="text-zinc-900 leading-relaxed mb-4">
                  Por isso, a cada Meeky F5 ANC Pro vendido nesta campanha, {DONATION_PERCENT}% do valor dos pedidos aprovados será destinado ao IFP após o evento, apoiando treinos, estrutura esportiva, deslocamentos e competições.
                </p>
                <p className="text-zinc-900 leading-relaxed mb-4">
                  Mais foco para você. Mais força para eles.
                </p>
                <a
                  href="https://instagram.com/institutofortalecendopessoas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-gold-light transition-colors underline underline-offset-4"
                >
                  Instagram do IFP: @institutofortalecendopessoas
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTADOR AO VIVO */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading
            eyebrow="Impacto em tempo real"
            title="Acompanhe o impacto da campanha"
            description="Atualizado a cada 30 segundos com pedidos confirmados da campanha."
          />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-background border border-border rounded-lg p-10 text-center">
              <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-3">
                Unidades vendidas
              </p>
              <p className="font-display text-5xl md:text-6xl font-bold tabular-nums">
                {loading ? "—" : units}
              </p>
            </div>
            <div className="bg-primary text-primary-foreground border border-primary rounded-lg p-10 text-center">
              <Heart className="w-8 h-8 text-accent mx-auto mb-4" />
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-primary-foreground/60 mb-3">
                Arrecadado para a causa
              </p>
              <p className="font-display text-5xl md:text-6xl font-bold tabular-nums text-accent">
                {loading ? "—" : BRL(raised)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUTO */}
      <section className="bg-background">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading
            eyebrow="O produto"
            title="Meeky F5 ANC Pro"
            description="Headphone premium com cancelamento de ruído ativo. Sem distração. Só performance."
          />
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
              <img
                src="/hero-product.webp"
                alt="Headphone Meeky F5 ANC Pro"
                className="w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={800}
              />
            </div>
            <div>
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/15 text-accent text-xs font-semibold rounded-sm border border-accent/25">
                  Oferta exclusiva da campanha
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-6">
                <span className="text-muted-foreground line-through text-lg">De R$ {BASE_PRICE}</span>
                <span className="font-display text-4xl md:text-5xl font-bold">por R$ {PRODUCT_PRICE}</span>
                <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-sm">Desconto automático de R$ 18</span>
              </div>
              <ul className="space-y-4 mb-10">
                {benefits.map((b) => (
                  <li key={b.title} className="flex gap-4">
                    <b.icon className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">{b.title}</p>
                      <p className="text-sm text-muted-foreground">{b.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent" /> Frete grátis para todo o Brasil
                <span className="mx-2">·</span>
                <Check className="w-4 h-4 text-accent" /> 12 meses de garantia
              </div>
              <Link
                to={CHECKOUT_URL}
                onClick={() => handleCtaClick("produto")}
                className="inline-block w-full md:w-auto text-center px-10 py-4 text-sm font-semibold tracking-wider rounded-sm bg-primary text-primary-foreground hover:bg-charcoal-light transition-all hover:scale-105"
              >
                COMPRAR E CONTRIBUIR — R$ {PRODUCT_PRICE}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-secondary">
        <div className="container-wide section-padding py-20 md:py-28">
          <SectionHeading eyebrow="Como funciona" title="Três passos, um impacto real" />
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { n: "01", icon: ShoppingBag, t: "Você compra com desconto", d: `Meeky F5 ANC Pro por R$ ${PRODUCT_PRICE}, com cupom automático e frete grátis.` },
              { n: "02", icon: Heart, t: `A Meeky doa ${DONATION_PERCENT}%`, d: `${DONATION_PERCENT}% de cada pedido aprovado é destinado ao Instituto Fortalecendo Pessoas.` },
              { n: "03", icon: Sparkles, t: "Você acompanha o impacto", d: `As vendas e a doação aparecem em tempo real no dashboard público da campanha.` },
            ].map((step) => (
              <div key={step.n} className="bg-background border border-border rounded-lg p-8">
                <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent">
                  {step.n}
                </span>
                <step.icon className="w-8 h-8 text-foreground mt-6 mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">{step.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-wide section-padding py-20 md:py-28 text-center">
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 max-w-3xl mx-auto">
            O evento acaba. <span className="text-accent">O impacto fica.</span>
          </h2>
          <p className="text-primary-foreground/60 text-base md:text-lg mb-10 max-w-xl mx-auto">
            Aproveite o preço exclusivo do Crosstraining Festival. De R$ {BASE_PRICE} por apenas R$ {PRODUCT_PRICE} — frete grátis e 12 meses de garantia.
          </p>
          <Link
            to={CHECKOUT_URL}
            onClick={() => handleCtaClick("final")}
            className="inline-block px-12 py-5 text-sm font-semibold tracking-wider rounded-sm bg-accent text-accent-foreground hover:bg-gold-light transition-all hover:scale-105"
          >
            QUERO PARTICIPAR — R$ {PRODUCT_PRICE} <span className="opacity-70 line-through font-normal ml-1">R$ {BASE_PRICE}</span>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default CrosstrainingPage;
