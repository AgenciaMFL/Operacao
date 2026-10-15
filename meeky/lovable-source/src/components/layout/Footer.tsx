import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import logo from "@/assets/meeky-logo.webp";
import { openConsentBanner } from "@/lib/cookieConsent";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground [content-visibility:auto] [contain-intrinsic-size:auto_720px]">
      <div className="container-wide section-padding py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={logo} alt="Meeky" width={120} height={28} className="h-7 w-auto mb-4" />
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
              Sem distração. Só performance. Headphones com cancelamento de ruído para quem leva foco a sério.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com/meeky.br" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/40 hover:text-accent transition-colors">
                <Instagram size={20} />
              </a>
            </div>
            <p className="text-xs text-primary-foreground/30 mt-2">@meeky.br</p>
          </div>

          {/* Links */}
          <div>
            <p role="heading" aria-level={2} className="font-display text-xs font-semibold tracking-[0.2em] uppercase mb-6 text-primary-foreground/40">Navegação</p>
            <ul className="space-y-3">
              {[
                { label: "Home", path: "/" },
                { label: "Produto", path: "/headphone-anc-meeky-f5-pro" },
                { label: "Sobre a Marca", path: "/sobre" },
                { label: "Por que confiar", path: "/reviews" },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p role="heading" aria-level={2} className="font-display text-xs font-semibold tracking-[0.2em] uppercase mb-6 text-primary-foreground/40">Suporte</p>
            <ul className="space-y-3">
              {[
                { label: "FAQ", path: "/faq" },
                { label: "Contato", path: "/contato" },
                { label: "Blog", path: "/blog" },
                { label: "Empresas", path: "/empresas" },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p role="heading" aria-level={2} className="font-display text-xs font-semibold tracking-[0.2em] uppercase mb-6 text-primary-foreground/40">Contato</p>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li><a href="mailto:contato@meeky.com.br" className="hover:text-accent transition-colors">contato@meeky.com.br</a></li>
              <li><a href="tel:+5512991074311" className="hover:text-accent transition-colors">(12) 99107-4311</a></li>
              <li>São Paulo, Brasil</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-primary-foreground/30 space-y-1">
            <p>© {new Date().getFullYear()} MEEKY Audio. Todos os direitos reservados.</p>
            <p>Operado por Barganha Mix Ltda — CNPJ: 43.341.597/0001-40</p>
          </div>
          <div className="flex gap-6">
            <Link to="/privacidade" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Termos de Uso
            </Link>
            <Link to="/politica-de-devolucao" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Devolução e Troca
            </Link>
            <Link to="/exclusao-de-dados" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Exclusão de Dados
            </Link>
            <button
              type="button"
              onClick={openConsentBanner}
              className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors"
            >
              Preferências de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
