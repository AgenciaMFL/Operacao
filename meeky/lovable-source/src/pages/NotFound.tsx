import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <SEO
        title="Página não encontrada (404) | Meeky Audio"
        description="O endereço acessado não existe ou foi movido. Volte para a home da Meeky ou explore o blog sobre foco, áudio e cancelamento de ruído."
        noindex
      />
      <section className="bg-background">
        <div className="container-wide section-padding py-24 md:py-36">
          <div className="max-w-xl mx-auto text-center">
            <span className="font-display text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-4 block">
              Erro 404
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              Página não encontrada
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              O endereço que você tentou acessar não existe, foi movido ou digitado
              incorretamente. Sem distração: escolha um caminho abaixo e siga em frente.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-all"
              >
                VOLTAR PARA A HOME
              </Link>
              <Link
                to="/blog"
                className="inline-block border border-border text-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:border-accent hover:text-accent transition-all"
              >
                IR PARA O BLOG
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Links úteis</p>
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                {[
                  { label: "Meeky F5 ANC Pro", path: "/headphone-anc-meeky-f5-pro" },
                  { label: "Por que confiar", path: "/reviews" },
                  { label: "FAQ", path: "/faq" },
                  { label: "Contato", path: "/contato" },
                ].map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-muted-foreground hover:text-accent transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
