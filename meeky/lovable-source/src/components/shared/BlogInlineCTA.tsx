import { Link } from "react-router-dom";

const BlogInlineCTA = () => {
  return (
    <div className="not-prose my-12 rounded-lg border border-border bg-secondary/50 p-8 md:p-10 text-center">
      <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
        Pronto para eliminar as distrações?
      </h3>
      <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-xl mx-auto">
        Meeky F5 ANC Pro — 70h de bateria, ANC ativo, frete grátis para todo o Brasil.
      </p>
      <Link
        to="/headphone-anc-meeky-f5-pro"
        className="inline-block bg-foreground text-background font-semibold px-8 py-3 rounded-sm text-sm tracking-wider hover:opacity-90 transition-opacity"
      >
        Comprar por R$ 297
      </Link>
      <p className="text-muted-foreground text-xs mt-4">
        Garantia de 12 meses · Compra 100% nacional · Entrega rastreada
      </p>
    </div>
  );
};

export default BlogInlineCTA;
