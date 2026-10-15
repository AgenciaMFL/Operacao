import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

/**
 * Sticky CTA para artigos do blog.
 * - Aparece após 30% de scroll, esconde nos últimos 10%.
 * - Mobile: barra fina no rodapé.
 * - Desktop (md+): card flutuante canto inferior direito.
 * - Dispensável (sessão).
 */
const DISMISS_KEY = "blog_sticky_cta_dismissed";

const BlogStickyCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
        return;
      }
    } catch {
      // ignore
    }

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const ratio = window.scrollY / max;
      setVisible(ratio >= 0.3 && ratio <= 0.9);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <>
      {/* Mobile: barra rodapé */}
      <div
        aria-hidden={!visible}
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.25)] transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex items-center gap-3 px-4 py-3 safe-bottom">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] leading-tight text-muted-foreground truncate">
              Meeky F5 ANC Pro
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              R$ 297 · Frete grátis
            </p>
          </div>
          <Link
            to="/headphone-anc-meeky-f5-pro"
            className="shrink-0 bg-accent text-accent-foreground px-4 py-3 text-xs font-semibold tracking-wider rounded-sm hover:bg-gold-light"
          >
            COMPRAR AGORA
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fechar"
            className="shrink-0 text-muted-foreground hover:text-foreground p-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Desktop: card flutuante */}
      <div
        aria-hidden={!visible}
        className={`hidden md:block fixed bottom-6 right-6 z-40 w-[340px] bg-background border border-border rounded-sm shadow-xl transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
        >
          <X size={16} />
        </button>
        <div className="p-5">
          <p className="font-display text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-2">
            Pronto para focar?
          </p>
          <p className="font-display text-base font-bold text-foreground leading-tight mb-1">
            Meeky F5 ANC Pro
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            <span className="text-foreground font-semibold">R$ 297</span> à vista
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Frete grátis · Garantia 12 meses
          </p>
          <Link
            to="/headphone-anc-meeky-f5-pro"
            className="block text-center bg-accent text-accent-foreground px-4 py-3 text-xs font-semibold tracking-wider rounded-sm hover:bg-gold-light"
          >
            COMPRAR AGORA
          </Link>
        </div>
      </div>
    </>
  );
};

export default BlogStickyCTA;
