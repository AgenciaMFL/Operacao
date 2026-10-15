import { useEffect, useState } from "react";
import { CONSENT_EVENT, applyConsent, getConsent, saveConsent } from "@/lib/cookieConsent";

const CookieConsentBanner = () => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [ads, setAds] = useState(true);

  // Mount gate: nothing renders until after client hydration to avoid
  // SSG/CSR mismatches (React #418 / #423) in the Suspense boundary.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    const existing = getConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
    const reopen = () => {
      const cur = getConsent();
      setAnalytics(cur?.analytics ?? true);
      setAds(cur?.ads ?? true);
      setCustomize(false);
      setOpen(true);
    };
    window.addEventListener(CONSENT_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_EVENT, reopen);
  }, [mounted]);

  if (!mounted || !open) return null;

  const acceptAll = () => {
    saveConsent({ analytics: true, ads: true });
    setOpen(false);
  };
  const rejectAll = () => {
    saveConsent({ analytics: false, ads: false });
    setOpen(false);
  };
  const savePrefs = () => {
    saveConsent({ analytics, ads });
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#121214]/95 backdrop-blur-md shadow-2xl text-primary-foreground p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-display text-sm font-semibold tracking-wide uppercase text-primary-foreground/60 mb-2">
              Cookies e privacidade
            </p>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Usamos cookies essenciais para o site funcionar e, com sua autorização, cookies de análise (Google Analytics)
              e publicidade (Meta Pixel, Google Ads) para melhorar sua experiência e medir campanhas.
              Você pode escolher o que aceitar. Veja mais na{" "}
              <a href="/privacidade" className="underline hover:text-accent">Política de Privacidade</a>.
            </p>
          </div>

          {customize && (
            <div className="grid gap-2 rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
              <label className="flex items-start justify-between gap-4 opacity-60 cursor-not-allowed">
                <span>
                  <span className="block font-medium">Essenciais</span>
                  <span className="block text-xs text-primary-foreground/60">Necessários para o funcionamento do site. Sempre ativos.</span>
                </span>
                <input type="checkbox" checked disabled className="mt-1 h-4 w-4" />
              </label>
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <span>
                  <span className="block font-medium">Analytics</span>
                  <span className="block text-xs text-primary-foreground/60">Google Analytics 4 — métricas anônimas de uso.</span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-accent"
                />
              </label>
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <span>
                  <span className="block font-medium">Publicidade</span>
                  <span className="block text-xs text-primary-foreground/60">Meta Pixel e Google Ads/Merchant — mensuração de campanhas.</span>
                </span>
                <input
                  type="checkbox"
                  checked={ads}
                  onChange={(e) => setAds(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-accent"
                />
              </label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setCustomize((v) => !v)}
              className="text-xs uppercase tracking-wider text-primary-foreground/60 hover:text-primary-foreground underline underline-offset-4 self-start"
            >
              {customize ? "Ocultar opções" : "Personalizar"}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:min-w-[360px]">
              {customize ? (
                <>
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="rounded-lg border border-white/20 bg-transparent hover:bg-white/10 text-primary-foreground font-medium text-sm py-2.5 px-4 transition-colors"
                  >
                    Rejeitar não essenciais
                  </button>
                  <button
                    type="button"
                    onClick={savePrefs}
                    className="rounded-lg bg-accent text-accent-foreground hover:opacity-90 font-medium text-sm py-2.5 px-4 transition-opacity"
                  >
                    Salvar preferências
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="rounded-lg border border-white/20 bg-transparent hover:bg-white/10 text-primary-foreground font-medium text-sm py-2.5 px-4 transition-colors"
                  >
                    Rejeitar não essenciais
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="rounded-lg bg-accent text-accent-foreground hover:opacity-90 font-medium text-sm py-2.5 px-4 transition-opacity"
                  >
                    Aceitar todos
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
