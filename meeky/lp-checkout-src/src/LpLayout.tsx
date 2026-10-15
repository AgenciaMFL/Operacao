import type { ReactNode } from "react";
import LpFooter from "./LpFooter";
import { lpHref } from "./lpLinks";

// Cabeçalho simples com o logo e o menu do site da LP + rodapé da LP
const items: [string, Parameters<typeof lpHref>[0]][] = [
  ["Home", "Home"], ["Produto", "Produto"], ["Sobre", "Sobre"], ["Blog", "Blog"], ["Dúvidas", "Duvidas"], ["Contato", "Contato"],
];

const LpLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <header className="border-b border-black/5 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-[1320px] mx-auto px-5 md:px-10 h-[74px] flex items-center justify-between gap-7">
        <a href={lpHref("Home")} aria-label="Meeky"><img src="assets/logo-meeky.svg" alt="Meeky" width={104} height={24} className="w-[104px] h-auto" /></a>
        <nav className="hidden md:flex items-center gap-8">
          {items.map(([label, page]) => (
            <a key={page} href={lpHref(page)} className="text-sm font-medium text-[#1A1A1A] hover:text-[#C4863B] transition-colors">{label}</a>
          ))}
        </nav>
      </div>
    </header>
    <main className="flex-1">{children}</main>
    <LpFooter />
  </div>
);

export default LpLayout;
