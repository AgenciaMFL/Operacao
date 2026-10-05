import { motion } from "framer-motion";
import { Menu, X, MapPin, Users, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-bela-ferraz.png";

const navLinks = [
  { name: "Início", href: import.meta.env.BASE_URL },
  { name: "Sobre nós", href: `${import.meta.env.BASE_URL}#sobre` },
  { name: "Lojas", href: `${import.meta.env.BASE_URL}lojas`, icon: MapPin },
  { name: "Clube Bela", href: `${import.meta.env.BASE_URL}clube-bela`, icon: Smartphone },
  { name: "Parceiros", href: `${import.meta.env.BASE_URL}#parceiros`, icon: Users },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <nav className="container-wide flex items-center justify-between h-20">
        <a href={import.meta.env.BASE_URL} className="flex items-center">
          <img 
            src={logo} 
            alt="Bela Ferraz Cosméticos" 
            className="h-8 md:h-10 w-auto"
          />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href="https://www.instagram.com/belaferrazoficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <Button variant="hero" size="sm" asChild>
            <a href="https://play.google.com/store/apps/details?id=com.crescevendas.belaferraz&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
              Baixe o App
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="lg:hidden overflow-hidden bg-background border-b border-border"
      >
        <div className="container-wide py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.icon && <link.icon size={18} className="text-primary" />}
              {link.name}
            </a>
          ))}
          <Button variant="hero" className="mt-4" asChild>
            <a href="https://play.google.com/store/apps/details?id=com.crescevendas.belaferraz&pcampaignid=web_share" target="_blank" rel="noopener noreferrer">
              Baixe o App
            </a>
          </Button>
        </div>
      </motion.div>
    </motion.header>
  );
};
