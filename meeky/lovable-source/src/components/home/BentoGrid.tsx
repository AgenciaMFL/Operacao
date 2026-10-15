import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import productHero from "@/assets/headphone-angle.webp";

/**
 * Bento Box Grid — home ecosystem section.
 * Desktop: 3 cols × 3 rows assimétricos. Mobile: stack vertical.
 */
const BentoGrid = () => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[auto_auto_auto] gap-4 md:gap-5"
    >
      {/* 1 — F5 ANC Pro (hero, col 1-2, row 1-2) */}
      <Link
        to="/headphone-anc-meeky-f5-pro"
        aria-label="Conheça o Meeky F5 ANC Pro"
        className="group relative overflow-hidden rounded-2xl bg-[#1a1a2e] text-white p-7 md:p-10 md:col-span-2 md:row-span-2 flex flex-col justify-between min-h-[420px] md:min-h-[560px] transition-all duration-300 hover:scale-[1.01] hover:brightness-110"
      >
        <div className="relative z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <a
            href="https://www.techtudo.com.br/listas/2026/04/headphones-com-cancelamento-de-ruido-que-valem-cada-centavo-edqualcomprarie.ghtml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:underline underline-offset-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Trophy className="w-4 h-4" aria-hidden="true" />
            Mencionado pela TechTudo
          </a>
        </div>

        <img
          src={productHero}
          alt="Meeky F5 ANC Pro"
          loading="lazy"
          width={720}
          height={720}
          className="absolute right-[-8%] bottom-[-6%] w-[70%] md:w-[55%] max-w-[520px] object-contain pointer-events-none opacity-95 transition-transform duration-500 group-hover:scale-105"
        />

        <div className="relative z-10 max-w-[60%]">
          <h3 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-3">
            Meeky F5 ANC Pro
          </h3>
          <p className="font-display text-sm md:text-base text-white/80 mb-6">
            70h · ANC 20dB · LDAC · Anatel
          </p>
          <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-semibold px-5 py-2.5 rounded-full text-sm">
            Comprar — R$ 297
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>
      </Link>

      {/* 2 — Blog destaque (col 3, row 1) */}
      <Link
        to="/blog/bluetooth-54-53-50-diferenca-headphone"
        aria-label="Leia: Bluetooth 5.4 vs 5.3 vs 5.0"
        className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 md:p-7 flex flex-col justify-between min-h-[200px] md:min-h-[270px] transition-all duration-300 hover:scale-[1.01] hover:brightness-105"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Blog
        </span>
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight mb-3">
            Bluetooth 5.4 vs 5.3 vs 5.0: o que muda no seu headphone?
          </h3>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground group-hover:gap-2 transition-all">
            Ler <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>
      </Link>

      {/* 3 — Motion 1 "Em breve" (col 3, row 2) */}
      <Link
        to="/motion-1"
        aria-label="Quero ser avisado do lançamento do Motion 1"
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-800 text-white p-6 md:p-7 flex flex-col justify-between min-h-[200px] md:min-h-[270px] transition-all duration-300 hover:scale-[1.01] hover:brightness-110"
      >
        <span className="inline-flex items-center gap-1.5 self-start bg-white/10 backdrop-blur-sm text-emerald-100 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full animate-pulse">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          Em breve
        </span>
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold leading-tight mb-1">
            Motion 1
          </h3>
          <p className="font-display text-sm text-emerald-100/80 mb-3">
            Bone Conduction · Open-Ear Sport
          </p>
          <p className="text-xs text-emerald-100/70 mb-3">
            Lançamento 2026 — entre na lista de aviso
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:gap-2 transition-all">
            Quero ser avisado <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>
      </Link>


      {/* 4 — Confiança (col 1, row 3) */}
      <Link
        to="/reviews"
        aria-label="Por que confiar na Meeky"
        className="group relative overflow-hidden rounded-2xl bg-secondary p-6 md:p-7 flex flex-col justify-between min-h-[180px] md:min-h-[220px] transition-all duration-300 hover:scale-[1.01] hover:brightness-105"
      >
        <div>
          <p className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
            12 meses de garantia
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Certificado Anatel · Nota fiscal em todo pedido
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground group-hover:gap-2 transition-all">
          Por que confiar <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </span>
      </Link>

      {/* 5 — B2B (col 2-3, row 3) */}
      <Link
        to="/empresas"
        aria-label="Soluções para equipes e empresas"
        className="group relative overflow-hidden rounded-2xl bg-muted p-6 md:p-7 md:col-span-2 flex flex-col justify-between min-h-[180px] md:min-h-[220px] transition-all duration-300 hover:scale-[1.01] hover:brightness-105"
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Para empresas
          </span>
          <h3 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight mt-2 mb-2">
            Para equipes e empresas
          </h3>
          <p className="text-sm text-muted-foreground">
            A partir de 20 unidades · NF · Suporte direto
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground group-hover:gap-2 transition-all mt-3">
          Saber mais <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
};

export default BentoGrid;
