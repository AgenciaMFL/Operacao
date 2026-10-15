import { lazy, Suspense } from "react";
import type { RouteRecord } from "vite-react-ssg";
import { Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "./components/layout/ScrollToTop";
import LazyToasters from "./components/shared/LazyToasters";
import CookieConsentBanner from "./components/shared/CookieConsentBanner";

// All pages are lazy — including Index — to keep the root chunk small and
// minimize hydration work. SSG already paints the correct HTML for each route.
const Index = lazy(() => import("./pages/Index"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostANCPage = lazy(() => import("./pages/BlogPostANCPage"));
const BlogPostHomeOfficePage = lazy(() => import("./pages/BlogPostHomeOfficePage"));
const BlogPost70hBateriaPage = lazy(() => import("./pages/BlogPost70hBateriaPage"));
const BlogPostEstudarPage = lazy(() => import("./pages/BlogPostEstudarPage"));
const BlogPostAcademiaPage = lazy(() => import("./pages/BlogPostAcademiaPage"));
const BlogPostReviewPage = lazy(() => import("./pages/BlogPostReviewPage"));
const BlogPostVsQCYPage = lazy(() => import("./pages/BlogPostVsQCYPage"));
const BlogPostBateriaImportaPage = lazy(() => import("./pages/BlogPostBateriaImportaPage"));
const BlogPostANCBasicsPage = lazy(() => import("./pages/BlogPostANCBasicsPage"));

const BlogPostANCvsPassivePage = lazy(() => import("./pages/BlogPostANCvsPassivePage"));
const BlogPostVsJBLPage = lazy(() => import("./pages/BlogPostVsJBLPage"));
const BlogPostCrosstrainingFocoPage = lazy(() => import("./pages/BlogPostCrosstrainingFocoPage"));
const BlogPostRitualFocoTreinoPage = lazy(() => import("./pages/BlogPostRitualFocoTreinoPage"));
const BlogPostMelhorANC300BrasilPage = lazy(() => import("./pages/BlogPostMelhorANC300BrasilPage"));
const BlogPostF5vsQCYvsJBLPage = lazy(() => import("./pages/BlogPostF5vsQCYvsJBLPage"));
const BlogPostVsSoundcoreQ20iPage = lazy(() => import("./pages/BlogPostVsSoundcoreQ20iPage"));
const BlogPostLDACvsAACvsSBCPage = lazy(() => import("./pages/BlogPostLDACvsAACvsSBCPage"));
const BlogPostANCAviaoPage = lazy(() => import("./pages/BlogPostANCAviaoPage"));
const BlogPostConcurseiroPage = lazy(() => import("./pages/BlogPostConcurseiroPage"));
const BlogPostANCQualidadeSomPage = lazy(() => import("./pages/BlogPostANCQualidadeSomPage"));
const BlogPostAutismoSensorialPage = lazy(() => import("./pages/BlogPostAutismoSensorialPage"));
const BlogPostBateriaRealPage = lazy(() => import("./pages/BlogPostBateriaRealPage"));
const BlogPostProgramadorPage = lazy(() => import("./pages/BlogPostProgramadorPage"));
const BlogPostBluetooth54Page = lazy(() => import("./pages/BlogPostBluetooth54Page"));
const BlogPostVsRedmiBuds6ActivePage = lazy(() => import("./pages/BlogPostVsRedmiBuds6ActivePage"));
const BlogPostOverEarVsEarbudsPage = lazy(() => import("./pages/BlogPostOverEarVsEarbudsPage"));
const BlogPostMultipointBluetoothPage = lazy(() => import("./pages/BlogPostMultipointBluetoothPage"));
const BlogPostPresenteCorporativoRHPage = lazy(() => import("./pages/BlogPostPresenteCorporativoRHPage"));
const B2BPage = lazy(() => import("./pages/B2BPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage"));
const CheckoutPendingPage = lazy(() => import("./pages/CheckoutPendingPage"));
const TermosPage = lazy(() => import("./pages/TermosPage"));
const PrivacidadePage = lazy(() => import("./pages/PrivacidadePage"));
const PoliticaDevolucaoPage = lazy(() => import("./pages/PoliticaDevolucaoPage"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminCouponsPage = lazy(() => import("./pages/AdminCouponsPage"));
const AdminPartnerPage = lazy(() => import("./pages/AdminPartnerPage"));
const PartnerPublicPage = lazy(() => import("./pages/PartnerPublicPage"));
const PartnerRedirectPage = lazy(() => import("./pages/PartnerRedirectPage"));
const CrosstrainingPage = lazy(() => import("./pages/CrosstrainingPage"));
const CrosstrainingDashboardPage = lazy(() => import("./pages/CrosstrainingDashboardPage"));
const VipPage = lazy(() => import("./pages/VipPage"));
const Motion1InteressePage = lazy(() => import("./pages/Motion1InteressePage"));

const AdminVipLeadsPage = lazy(() => import("./pages/AdminVipLeadsPage"));
const AtivarGarantiaPage = lazy(() => import("./pages/AtivarGarantiaPage"));
const ExclusaoDadosPage = lazy(() => import("./pages/ExclusaoDadosPage"));
const StackTraceNoIndexPage = lazy(() => import("./pages/StackTraceNoIndexPage"));
const OAuthConsentPage = lazy(() => import("./pages/OAuthConsentPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 3600000,
      retry: false,
    },
  },
});

/**
 * Root layout that owns providers shared by every route.
 * Rendered once during SSR and once on the client; child routes are an <Outlet />.
 */
const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LazyToasters />
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Outlet />
      </Suspense>
      <CookieConsentBanner />
    </TooltipProvider>
  </QueryClientProvider>
);

// Helper: mark route as excluded from prerender (no entry: true).
// Helper: mark route as prerendered with entry: true so SSG renders it.
export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index />, entry: "src/pages/Index.tsx" },
      { path: "headphone-anc-meeky-f5-pro", element: <ProductPage />, entry: "src/pages/ProductPage.tsx" },
      // 301-style redirect from old slug to new canonical URL (client-only)
      { path: "produto", element: <Navigate to="/headphone-anc-meeky-f5-pro" replace /> },
      { path: "sobre", element: <AboutPage />, entry: "src/pages/AboutPage.tsx" },
      { path: "reviews", element: <ReviewsPage />, entry: "src/pages/ReviewsPage.tsx" },
      { path: "faq", element: <FAQPage />, entry: "src/pages/FAQPage.tsx" },
      { path: "blog", element: <BlogPage />, entry: "src/pages/BlogPage.tsx" },
      { path: "blog/headphone-cancelamento-de-ruido-vale-a-pena", element: <BlogPostANCPage />, entry: "src/pages/BlogPostANCPage.tsx" },
      { path: "blog/headphone-home-office-anc", element: <BlogPostHomeOfficePage />, entry: "src/pages/BlogPostHomeOfficePage.tsx" },
      { path: "blog/headphone-70-horas-bateria", element: <BlogPost70hBateriaPage />, entry: "src/pages/BlogPost70hBateriaPage.tsx" },
      { path: "blog/headphone-anc-para-estudar", element: <BlogPostEstudarPage />, entry: "src/pages/BlogPostEstudarPage.tsx" },
      { path: "blog/headphone-anc-academia", element: <BlogPostAcademiaPage />, entry: "src/pages/BlogPostAcademiaPage.tsx" },
      { path: "blog/meeky-f5-anc-pro-review", element: <BlogPostReviewPage />, entry: "src/pages/BlogPostReviewPage.tsx" },
      { path: "blog/meeky-f5-anc-pro-vs-qcy-h3", element: <BlogPostVsQCYPage />, entry: "src/pages/BlogPostVsQCYPage.tsx" },
      { path: "blog/headphone-anc-70-horas-bateria-por-que-importa", element: <BlogPostBateriaImportaPage />, entry: "src/pages/BlogPostBateriaImportaPage.tsx" },
      { path: "blog/o-que-e-cancelamento-de-ruido-ativo-anc", element: <BlogPostANCBasicsPage />, entry: "src/pages/BlogPostANCBasicsPage.tsx" },
      { path: "blog/melhor-headphone-anc-ate-300-reais", element: <Navigate to="/blog/melhor-headphone-anc-ate-300-reais-brasil-2026" replace /> },
      { path: "blog/anc-ativo-vs-cancelamento-passivo-diferenca", element: <BlogPostANCvsPassivePage />, entry: "src/pages/BlogPostANCvsPassivePage.tsx" },
      { path: "blog/jbl-770nc-ou-meeky-f5-vale-a-pena-pagar-mais", element: <BlogPostVsJBLPage />, entry: "src/pages/BlogPostVsJBLPage.tsx" },
      { path: "blog/headphone-anc-crosstraining-foco-rotina", element: <BlogPostCrosstrainingFocoPage />, entry: "src/pages/BlogPostCrosstrainingFocoPage.tsx" },
      { path: "blog/ritual-de-foco-antes-do-treino-cancelamento-de-ruido", element: <BlogPostRitualFocoTreinoPage />, entry: "src/pages/BlogPostRitualFocoTreinoPage.tsx" },
      { path: "blog/melhor-headphone-anc-ate-300-reais-brasil-2026", element: <BlogPostMelhorANC300BrasilPage />, entry: "src/pages/BlogPostMelhorANC300BrasilPage.tsx" },
      { path: "blog/meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc-comparativo-2026", element: <BlogPostF5vsQCYvsJBLPage />, entry: "src/pages/BlogPostF5vsQCYvsJBLPage.tsx" },
      // Legacy short slug → canonical
      { path: "blog/meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc", element: <Navigate to="/blog/meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc-comparativo-2026" replace /> },
      { path: "blog/meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026", element: <BlogPostVsSoundcoreQ20iPage />, entry: "src/pages/BlogPostVsSoundcoreQ20iPage.tsx" },
      // Legacy short slugs → canonical (sem "anker" e/ou sem sufixo "-comparativo-2026")
      { path: "blog/meeky-f5-anc-pro-vs-soundcore-q20i", element: <Navigate to="/blog/meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026" replace /> },
      { path: "blog/meeky-f5-anc-pro-vs-anker-soundcore-q20i", element: <Navigate to="/blog/meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026" replace /> },
      { path: "blog/meeky-f5-anc-pro-vs-soundcore-q20i-comparativo-2026", element: <Navigate to="/blog/meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026" replace /> },
      { path: "blog/ldac-vs-aac-vs-sbc-diferenca-headphone-bluetooth", element: <BlogPostLDACvsAACvsSBCPage />, entry: "src/pages/BlogPostLDACvsAACvsSBCPage.tsx" },
      { path: "blog/headphone-anc-funciona-em-aviao", element: <BlogPostANCAviaoPage />, entry: "src/pages/BlogPostANCAviaoPage.tsx" },
      { path: "blog/headphone-anc-para-concurseiro", element: <BlogPostConcurseiroPage />, entry: "src/pages/BlogPostConcurseiroPage.tsx" },
      { path: "blog/anc-prejudica-qualidade-do-som-headphone", element: <BlogPostANCQualidadeSomPage />, entry: "src/pages/BlogPostANCQualidadeSomPage.tsx" },
      { path: "blog/headphone-anc-para-autista-hipersensibilidade-sensorial", element: <BlogPostAutismoSensorialPage />, entry: "src/pages/BlogPostAutismoSensorialPage.tsx" },
      { path: "blog/quanto-dura-bateria-headphone-anc-na-pratica", element: <BlogPostBateriaRealPage />, entry: "src/pages/BlogPostBateriaRealPage.tsx" },
      { path: "blog/headphone-anc-para-programador-desenvolvedor", element: <BlogPostProgramadorPage />, entry: "src/pages/BlogPostProgramadorPage.tsx" },
      { path: "blog/bluetooth-54-53-50-diferenca-headphone", element: <BlogPostBluetooth54Page />, entry: "src/pages/BlogPostBluetooth54Page.tsx" },
      { path: "blog/meeky-f5-anc-pro-vs-redmi-buds-6-active-comparativo-2026", element: <BlogPostVsRedmiBuds6ActivePage />, entry: "src/pages/BlogPostVsRedmiBuds6ActivePage.tsx" },
      { path: "blog/headphone-over-ear-anc-ou-earbuds-anc-qual-escolher", element: <BlogPostOverEarVsEarbudsPage />, entry: "src/pages/BlogPostOverEarVsEarbudsPage.tsx" },
      { path: "blog/multiponto-bluetooth-conectar-notebook-e-celular", element: <BlogPostMultipointBluetoothPage />, entry: "src/pages/BlogPostMultipointBluetoothPage.tsx" },
      { path: "blog/guia-presente-corporativo-brindes-tecnologia-rh", element: <BlogPostPresenteCorporativoRHPage />, entry: "src/pages/BlogPostPresenteCorporativoRHPage.tsx" },
      { path: "empresas", element: <B2BPage />, entry: "src/pages/B2BPage.tsx" },
      { path: "contato", element: <ContactPage />, entry: "src/pages/ContactPage.tsx" },
      { path: "termos", element: <TermosPage />, entry: "src/pages/TermosPage.tsx" },
      { path: "privacidade", element: <PrivacidadePage />, entry: "src/pages/PrivacidadePage.tsx" },
      { path: "politica-de-devolucao", element: <PoliticaDevolucaoPage />, entry: "src/pages/PoliticaDevolucaoPage.tsx" },
      { path: "exclusao-de-dados", element: <ExclusaoDadosPage />, entry: "src/pages/ExclusaoDadosPage.tsx" },
      { path: "crosstraining", element: <CrosstrainingPage />, entry: "src/pages/CrosstrainingPage.tsx" },
      { path: "crosstraining/dashboard", element: <CrosstrainingDashboardPage />, entry: "src/pages/CrosstrainingDashboardPage.tsx" },
      { path: "vip", element: <VipPage />, entry: "src/pages/VipPage.tsx" },
      { path: "motion-1", element: <Motion1InteressePage />, entry: "src/pages/Motion1InteressePage.tsx" },


      // === Routes EXCLUDED from SSG (no `entry`, no prerender). They still work as SPA. ===
      // Listed in `includedRoutes` of package.json as excluded.
      { path: "checkout", element: <CheckoutPage /> },
      { path: "ativar", element: <AtivarGarantiaPage /> },
      { path: "checkout/sucesso", element: <CheckoutSuccessPage /> },
      { path: "checkout/pendente", element: <CheckoutPendingPage /> },
      { path: "unsubscribe", element: <UnsubscribePage /> },
      { path: "admin/login", element: <AdminLoginPage /> },
      { path: "admin/cupons", element: <AdminCouponsPage /> },
      { path: "admin/parceiros", element: <AdminPartnerPage /> },
      { path: "admin/vip-leads", element: <AdminVipLeadsPage /> },
      { path: "parceiro/:cupom", element: <PartnerPublicPage /> },
      { path: "r/:slug", element: <PartnerRedirectPage /> },

      // OAuth consent route for the app-hosted MCP server (Supabase authorization server).
      { path: ".lovable/oauth/consent", element: <OAuthConsentPage /> },



      // Catch fake stack-trace "URLs" (e.g. /assets/router-xxx.js:10:27070)
      // discovered by external crawlers. Renders strong noindex to remove them
      // from Google's index on the next crawl. Real /assets/*.js files are
      // served by hosting as static assets and never hit this route.
      { path: "assets/*", element: <StackTraceNoIndexPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export default routes;
