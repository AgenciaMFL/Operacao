import { MapPin, Phone, Mail, Instagram } from "lucide-react";
import logo from "@/assets/logo-bela-ferraz.png";

const footerLinks = {
  institucional: [
    { name: "Sobre nós", href: "#sobre" },
    { name: "Nossas Lojas", href: "#lojas" },
    { name: "Marcas Parceiras", href: "#parceiros" },
    { name: "FAQ", href: "#faq" },
  ],
  servicos: [
    { name: "Clube Bela", href: "#clube" },
  ],
  legal: [
    { name: "Política de Privacidade", href: "https://belaferraz.com.br/politica-de-privacidade" },
    { name: "Termos de Uso", href: "#" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-wide py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#inicio" className="inline-block mb-6">
              <img 
                src={logo} 
                alt="Bela Ferraz Cosméticos" 
                className="h-10 w-auto brightness-0 invert"
              />
            </a>
            <p className="text-background/60 text-sm leading-relaxed mb-6">
              Na Bela Ferraz você encontra tudo o que precisa para ficar ainda mais linda. 
              Somos uma loja especializada em cosméticos, com as melhores marcas e preços do mercado.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/belaferrazoficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@belaferrazoficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-semibold mb-6">Institucional</h4>
            <ul className="space-y-3">
              {footerLinks.institucional.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/60 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-semibold mb-6">Serviços</h4>
            <ul className="space-y-3">
              {footerLinks.servicos.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-background/60 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-background/60">
                <MapPin size={18} className="flex-shrink-0 mt-0.5 text-primary" />
                <span>Rio de Janeiro - RJ</span>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/belaferrazoficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-background/60 hover:text-primary transition-colors"
                >
                  <Instagram size={18} className="flex-shrink-0 text-primary" />
                  <span>@belaferrazoficial</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/40">
            © {new Date().getFullYear()} Bela Ferraz Cosméticos. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-sm text-background/40 hover:text-background/60 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
