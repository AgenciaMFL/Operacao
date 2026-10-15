// Checkout da loja rodando dentro do site da LP (/lp/Checkout). Mesmo backend (Supabase/Mercado Pago),
// links apontando para as páginas da LP.
import "../ssr-polyfills";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import LazyToasters from "@/components/shared/LazyToasters";
import { applySavedConsentEarly } from "@/lib/applySavedConsentEarly";
import CheckoutPage from "./CheckoutPage";
import CheckoutSuccessPage from "./CheckoutSuccessPage";
import CheckoutPendingPage from "./CheckoutPendingPage";
import "../index.css";

applySavedConsentEarly();

const params = new URLSearchParams(window.location.search);
const cupom = params.get("cupom") || params.get("coupon");
if (cupom) {
  try { sessionStorage.setItem("cupom_pendente", cupom.trim().toUpperCase()); } catch { /* ignore */ }
}
import("@/lib/campaignTracking").then(({ persistUtm }) => { try { persistUtm(); } catch { /* ignore */ } });

// Pasta onde a página está ("/lp" no meeky.com.br, "" no endereço direto do Worker)
const basename = window.location.pathname.replace(/\/[^/]*$/, "") || "/";

const page = (path: string, element: JSX.Element) => [
  { path, element },
  { path: `${path}.html`, element },
];

const router = createBrowserRouter(
  [
    ...page("/Checkout", <CheckoutPage />),
    ...page("/Checkout-sucesso", <CheckoutSuccessPage />),
    ...page("/Checkout-pendente", <CheckoutPendingPage />),
    { path: "*", element: <CheckoutPage /> },
  ],
  { basename },
);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LazyToasters />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>,
);
