import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after client-side hydration completes.
 * Use to defer non-critical UI (toasters, providers without children-affecting state)
 * out of the initial hydration pass to reduce TBT.
 */
const ClientOnly = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <>{children}</>;
};

export default ClientOnly;
