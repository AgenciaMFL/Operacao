import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/shared/SEO";
import logo from "@/assets/meeky-logo.webp";
import { supabase } from "@/integrations/supabase/client";
import {
  FALLBACK_VIP_EVENT,
  loadVipEvent,
  eventBadgeLabel,
  eventOfferLabel,
  type VipEvent,
} from "@/lib/vipEvents";

const CNPJ = "Barganha Mix LTDA · CNPJ 43.341.597/0001-40";

function maskWhatsApp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const VipPage = () => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [utm, setUtm] = useState<{ utm_source?: string; utm_medium?: string; utm_campaign?: string }>({});
  const [event, setEvent] = useState<VipEvent>(FALLBACK_VIP_EVENT);
  // Enquanto o evento real não chega (e no HTML pré-renderizado), mostramos um
  // esqueleto neutro em vez de dados de um evento que pode não ser o da URL.
  // Isso elimina o "flash" entre o fallback local e o dado do banco.
  const [eventReady, setEventReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const campaign = p.get("utm_campaign") || undefined;
    setUtm({
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: campaign,
    });

    let cancelled = false;
    loadVipEvent(campaign).then((ev) => {
      if (!cancelled) {
        setEvent(ev);
        setEventReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Leva ao checkout do F5 ANC Pro preservando a campanha do evento.
  const checkoutParams = new URLSearchParams({ qty: "1" });
  if (utm.utm_source) checkoutParams.set("utm_source", utm.utm_source);
  if (utm.utm_medium) checkoutParams.set("utm_medium", utm.utm_medium);
  if (utm.utm_campaign) checkoutParams.set("utm_campaign", utm.utm_campaign);
  const checkoutHref = `/checkout?${checkoutParams.toString()}`;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const digits = whatsapp.replace(/\D/g, "");
    if (name.trim().length < 2) {
      setError("Informe seu nome completo.");
      return;
    }
    if (digits.length < 10) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um email válido.");
      return;
    }
    if (!marketingOptIn) {
      setError("Você precisa autorizar o envio das comunicações para entrar na lista VIP.");
      return;
    }

    setLoading(true);
    const { error: insertError } = await supabase.from("vip_leads").insert({
      name: name.trim(),
      whatsapp: digits,
      email: email.trim().toLowerCase(),
      source: event.lead_source,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
    });

    if (insertError) {
      setLoading(false);
      setError("Erro ao cadastrar. Tente novamente.");
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SEO
        title={`Lista VIP Meeky · ${event.event_name}`}
        description={`Cadastre-se na lista VIP Meeky e receba a oferta exclusiva do ${event.event_name} no seu WhatsApp.`}
        canonical="https://meeky.com.br/vip"
        noindex
      />

      <header className="pt-8 pb-4 flex justify-center">
        <img src={logo} alt="Meeky" className="h-8 w-auto" loading="eager" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {eventReady ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent border border-accent/30 px-3 py-1 text-xs font-medium mb-6">
              {eventBadgeLabel(event)}
            </div>
          ) : (
            <div
              className="h-[26px] w-64 max-w-full rounded-full bg-muted/40 animate-pulse mb-6"
              aria-hidden="true"
            />
          )}

          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            Entre para a lista VIP Meeky
          </h1>
          <p className="text-muted-foreground mb-4">
            Cadastre-se e receba a oferta exclusiva do evento diretamente no seu WhatsApp.
          </p>
          {eventReady ? (
            <p className="text-sm text-muted-foreground/80 mb-8">{eventOfferLabel(event)}</p>
          ) : (
            <div
              className="h-5 w-56 max-w-full rounded bg-muted/40 animate-pulse mb-8"
              aria-hidden="true"
            />
          )}

          {success ? (
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-6 space-y-4">
              <p className="text-lg font-semibold">✅ Perfeito! Você está na lista VIP.</p>
              <p className="text-sm text-muted-foreground">
                Em breve você recebe a oferta no WhatsApp.
              </p>
              <Link
                to={checkoutHref}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold h-12 px-6 hover:bg-primary/90 transition-colors"
              >
                Comprar agora o {event.offer_product}
              </Link>
              <p className="text-sm text-muted-foreground">
                Ou siga a Meeky no Instagram e acompanhe o evento ao vivo:
              </p>
              <a
                href={event.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-md border border-border bg-card font-semibold h-12 px-6 hover:bg-secondary transition-colors"
              >
                Seguir @{event.instagram_handle} no Instagram
              </a>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                    Nome completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 rounded-md border border-input bg-card px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium mb-1.5">
                    WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(maskWhatsApp(e.target.value))}
                    className="w-full h-12 rounded-md border border-input bg-card px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="(11) 98765-4321"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-md border border-input bg-card px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="voce@email.com"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <label className="flex items-start gap-3 text-xs text-muted-foreground/90 leading-relaxed cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-accent shrink-0"
                  />
                  <span>
                    Autorizo a Meeky a enviar comunicações de marketing (WhatsApp e e-mail) sobre a
                    oferta VIP e o {eventReady ? event.event_name : "evento"}. Posso cancelar a
                    qualquer momento.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Cadastrando..." : "Quero receber a oferta VIP"}
                </button>

                <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
                  Seus dados são usados apenas para enviar a oferta VIP e comunicações relacionadas
                  ao evento. Consulte a{" "}
                  <a href="/privacidade" className="underline hover:text-accent">Política de Privacidade</a>.
                </p>
              </form>

              <div className="mt-8 rounded-xl border border-border bg-card p-5 text-center">
                <p className="text-sm font-semibold mb-1">Não quer esperar o WhatsApp?</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Compre agora o {event.offer_product} direto no site, com frete grátis.
                </p>
                <Link
                  to={checkoutHref}
                  className="inline-flex w-full items-center justify-center rounded-md bg-accent text-accent-foreground font-semibold h-12 px-6 hover:bg-accent/90 transition-colors"
                >
                  Comprar agora
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground/60 px-4">
        {CNPJ}
      </footer>
    </div>
  );
};

export default VipPage;
