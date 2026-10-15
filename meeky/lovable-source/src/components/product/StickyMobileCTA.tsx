import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Sticky CTA mobile: barra fixa no rodapé, visível apenas em <768px após 400px de scroll.
 * Desktop: nunca exibida.
 */
const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);
  const [href, setHref] = useState("/checkout?qty=1");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    try {
      const cupom =
        sessionStorage.getItem("cupom_pendente") ||
        sessionStorage.getItem("cupom") ||
        sessionStorage.getItem("coupon");
      if (cupom) {
        setHref(`/checkout?qty=1&coupon=${encodeURIComponent(cupom.trim().toUpperCase())}`);
      }
    } catch {
      // ignore
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.25)] transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
      {...(!visible && { inert: "" as unknown as boolean })}
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
          to={href}
          className="shrink-0 bg-primary text-primary-foreground px-4 py-3 text-xs font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-colors"
        >
          COMPRAR AGORA
        </Link>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
