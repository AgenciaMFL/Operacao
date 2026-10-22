import { lpHref } from "./lpLinks";

const col = "text-[15px] text-[rgba(249,248,246,.6)] hover:text-[#DEA85E] transition-colors";
const head = "text-[#F9F8F6] text-xs tracking-[.14em] uppercase mb-5 font-semibold";

// Rodapé igual ao do site da LP (Footer.dc.html)
const LpFooter = () => (
  <footer className="bg-[#0C0C0C] text-[rgba(249,248,246,.6)] pt-24 pb-10">
    <div className="max-w-[1320px] mx-auto px-5 md:px-10">
      <div className="grid gap-12 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
        <div>
          <img src="assets/logo-meeky.svg" alt="Meeky" width={104} height={24} className="w-[104px] h-auto invert mb-[22px]" />
          <p className="text-[rgba(249,248,246,.5)] max-w-[280px] text-[15px] leading-relaxed m-0">Tecnologia brasileira de áudio para foco, produtividade e performance.</p>
          <p className="text-[rgba(249,248,246,.32)] max-w-[280px] text-[13px] leading-relaxed mt-[18px]">Barganha Mix Ltda · CNPJ 43.341.597/0001-40</p>
          <a href="https://www.instagram.com/meeky.br/" target="_blank" rel="noopener" aria-label="Instagram da Meeky" className="mt-[22px] inline-flex items-center gap-2.5 py-2.5 pl-3 pr-[18px] rounded-full border border-white/15 text-[#F9F8F6] text-sm font-medium hover:bg-[#9E69C1] hover:border-[#9E69C1] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            @meeky.br
          </a>
        </div>
        <div>
          <h4 className={head}>Navegação</h4>
          <div className="flex flex-col gap-[11px]">
            <a href={lpHref("Produto")} className={col}>Produto</a>
            <a href={lpHref("Sobre")} className={col}>Sobre</a>
            <a href={lpHref("Blog")} className={col}>Blog</a>
            <a href={lpHref("Home", "volume")} className={col}>Compra em volume</a>
          </div>
        </div>
        <div>
          <h4 className={head}>Suporte</h4>
          <div className="flex flex-col gap-[11px]">
            <a href={lpHref("Duvidas")} className={col}>Dúvidas</a>
            <a href={lpHref("Contato")} className={col}>Contato</a>
          </div>
        </div>
        <div>
          <h4 className={head}>Contato</h4>
          <div className="flex flex-col gap-[11px]">
            <a href="mailto:contato@meeky.com.br" className={col}>contato@meeky.com.br</a>
            <a href="tel:+5512991074311" className={col}>(12) 99107-4311</a>
          </div>
        </div>
      </div>
      <div className="mt-[76px] pt-[26px] border-t border-white/10 flex justify-between gap-5 flex-wrap text-[12.5px] text-[rgba(249,248,246,.38)]">
        <span>© 2026 Meeky Audio — Barganha Mix Ltda · CNPJ 43.341.597/0001-40</span>
        <span className="flex gap-5 flex-wrap">
          <a href="https://meeky.com.br/privacidade" target="_blank" rel="noopener" className="hover:text-[#DEA85E]">Privacidade</a>
          <a href="https://meeky.com.br/termos" target="_blank" rel="noopener" className="hover:text-[#DEA85E]">Termos</a>
          <a href="https://meeky.com.br/politica-de-devolucao" target="_blank" rel="noopener" className="hover:text-[#DEA85E]">Devolução e troca</a>
        </span>
      </div>
    </div>
  </footer>
);

export default LpFooter;
