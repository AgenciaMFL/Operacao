// Links do checkout copiado apontam para as páginas do site da LP (relativos ao /lp).
export type LpPage = "Home" | "Produto" | "Motion1" | "Sobre" | "Duvidas" | "Contato" | "Blog";

export const lpHref = (page: LpPage, hash = "") => `${page}.html${hash ? `#${hash}` : ""}`;
