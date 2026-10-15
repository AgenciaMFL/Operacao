import { useLocation, Link } from "react-router-dom";
import SEO from "@/components/shared/SEO";

/**
 * Catch-all for fake "URLs" that look like a JS error stack frame
 * (e.g. /assets/router-bhGckQ36.js:10:27070). These paths were discovered
 * by external crawlers that parsed error text as URLs and reported them
 * to Google Search Console.
 *
 * Lovable hosting cannot return HTTP 410 for arbitrary paths, so this
 * page ships strong `noindex, nofollow` meta + no crawlable links, which
 * causes Googlebot to drop the URLs from the index on its next crawl.
 */
const STACK_FRAME_RE = /^\/assets\/.+\.js:\d+:\d+\/?$/;

const StackTraceNoIndexPage = () => {
  const { pathname } = useLocation();
  const isStackFrame = STACK_FRAME_RE.test(pathname);

  return (
    <>
      <SEO
        title="Página não encontrada | Meeky Audio"
        description="Esta URL não corresponde a uma página válida."
        noindex
      />
      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">
            Página não encontrada
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {isStackFrame
              ? "Este endereço não é uma página do site."
              : "O endereço acessado não existe."}
          </p>
          <Link
            to="/"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-all"
          >
            Voltar para a home
          </Link>
        </div>
      </main>
    </>
  );
};

export default StackTraceNoIndexPage;
