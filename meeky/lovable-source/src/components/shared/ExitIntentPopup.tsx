import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { X, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "exit_intent_shown";
const ARM_DELAY_MS = 30_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ExitIntentPopup = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<string | null>(null);
  const armedRef = useRef(false);

  const excluded = pathname.startsWith("/checkout") || pathname.startsWith("/admin");

  useEffect(() => {
    if (excluded) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const armTimer = window.setTimeout(() => {
      armedRef.current = true;
    }, ARM_DELAY_MS);

    const handleMouseLeave = (e: MouseEvent) => {
      if (!armedRef.current) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      if (e.clientY < 10) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [excluded]);

  const close = useCallback(() => setOpen(false), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !EMAIL_RE.test(trimmed) || trimmed.length > 255) {
      setError("Digite um email válido.");
      return;
    }
    if (!marketingOptIn) {
      setError("Autorize o envio do cupom para continuar.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-exit-intent-lead",
        { body: { email: trimmed } }
      );
      if (fnError || !data?.coupon) {
        setError("Não foi possível gerar seu cupom. Tente novamente.");
        setLoading(false);
        return;
      }

      setCoupon(data.coupon);

      // GA4 generate_lead
      if (typeof window !== "undefined") {
        const w = window as any;
        if (w.gtag) {
          w.gtag("event", "generate_lead", {
            method: "exit_intent",
            value: 5,
            currency: "BRL",
          });
        }
        if (w.dataLayer) {
          w.dataLayer.push({
            event: "generate_lead",
            method: "exit_intent",
            value: 5,
            currency: "BRL",
          });
        }
      }
    } catch (err) {
      console.error("[ExitIntent] submit failed", err);
      setError("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-md bg-card border border-border rounded-sm shadow-2xl p-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        {!coupon ? (
          <>
            <h2
              id="exit-intent-title"
              className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2"
            >
              Espera — você esqueceu algo.
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Garanta <span className="text-accent font-semibold">5% off</span> no seu Meeky F5 ANC Pro agora.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                maxLength={255}
                autoComplete="email"
                className="w-full px-4 py-3 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={loading}
              />
              <label className="flex items-start gap-2 text-[11px] text-muted-foreground leading-snug cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-accent shrink-0"
                  disabled={loading}
                />
                <span>
                  Autorizo o envio do cupom e comunicações de marketing por e-mail. Posso cancelar
                  quando quiser.
                </span>
              </label>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> ENVIANDO...</> : "QUERO MEU DESCONTO"}
              </button>
              <p className="text-[11px] text-muted-foreground/70 leading-snug">
                Usamos seu e-mail apenas para enviar o cupom e ofertas relacionadas. Veja a{" "}
                <a href="/privacidade" className="underline hover:text-accent">Política de Privacidade</a>.
              </p>
            </form>

            <button
              type="button"
              onClick={close}
              className="block w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 mt-4"
            >
              Não, prefiro pagar o preço cheio
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/15 text-accent mb-4">
              <Check size={24} />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Cupom enviado!
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Seu cupom:
            </p>
            <div className="bg-secondary border border-border rounded-sm py-3 px-4 mb-4">
              <span className="font-display text-xl font-bold text-accent tracking-wider">
                {coupon}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Válido por 24h. Aplique no checkout.
            </p>
            <button
              type="button"
              onClick={close}
              className="w-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-all"
            >
              CONTINUAR COMPRANDO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitIntentPopup;
