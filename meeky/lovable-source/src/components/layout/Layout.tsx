import { ReactNode, lazy, Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ClientOnly from "@/components/shared/ClientOnly";
import RouteTracker from "@/components/shared/RouteTracker";

const ExitIntentPopup = lazy(() => import("@/components/shared/ExitIntentPopup"));

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientOnly>
        <RouteTracker />
      </ClientOnly>
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
      <ClientOnly>
        <Suspense fallback={null}>
          <ExitIntentPopup />
        </Suspense>
      </ClientOnly>
    </div>
  );
};

export default Layout;
