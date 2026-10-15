import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/meeky-logo.webp";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Produto", path: "/headphone-anc-meeky-f5-pro" },
  { label: "Sobre", path: "/sobre" },
  { label: "Por que confiar", path: "/reviews" },
  { label: "FAQ", path: "/faq" },
  { label: "Blog", path: "/blog" },
  { label: "Empresas", path: "/empresas" },
  { label: "Contato", path: "/contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkoutHref, setCheckoutHref] = useState("/checkout?qty=1");
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cupom =
        sessionStorage.getItem("cupom_pendente") ||
        sessionStorage.getItem("cupom") ||
        sessionStorage.getItem("coupon");
      if (cupom) {
        setCheckoutHref(`/checkout?qty=1&coupon=${encodeURIComponent(cupom.trim().toUpperCase())}`);
      } else {
        setCheckoutHref("/checkout?qty=1");
      }
    } catch {
      // ignore
    }
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container-wide section-padding">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Meeky Audio Logo" width={120} height={32} className="h-6 md:h-8 w-auto invert dark:invert-0" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-accent ${
                  location.pathname === item.path ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to={checkoutHref}
              className="bg-primary text-primary-foreground px-6 py-2.5 text-sm font-semibold tracking-wide rounded-sm hover:bg-charcoal-light transition-colors"
            >
              COMPRAR
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — CSS-driven open/close to avoid framer-motion hydration cost. */}
      <div
        id="mobile-nav"
        className={`lg:hidden bg-background border-b border-border overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          mobileOpen ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"
        }`}
        {...(!mobileOpen && { inert: "" as unknown as boolean })}
      >
        <nav className="flex flex-col py-6 section-padding">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`py-3 text-base font-medium tracking-wide border-b border-border/30 transition-colors ${
                location.pathname === item.path ? "text-accent" : "text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to={checkoutHref}
            onClick={() => setMobileOpen(false)}
            className="mt-6 bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold tracking-wide rounded-sm text-center"
          >
            COMPRAR AGORA
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
