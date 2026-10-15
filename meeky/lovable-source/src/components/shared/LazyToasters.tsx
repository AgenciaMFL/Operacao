import { lazy, Suspense } from "react";
import ClientOnly from "./ClientOnly";

const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })),
);
const Sonner = lazy(() =>
  import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
);

/**
 * Defers loading of toaster libraries (sonner + radix toast) until after
 * hydration. Pages that never trigger a toast pay zero bundle cost upfront.
 */
const LazyToasters = () => (
  <ClientOnly>
    <Suspense fallback={null}>
      <Toaster />
      <Sonner />
    </Suspense>
  </ClientOnly>
);

export default LazyToasters;
