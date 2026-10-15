import { useState, useEffect } from "react";

/**
 * Lazy Supabase client: dynamic import keeps the ~70KB supabase chunk
 * off the ProductPage critical path. We also defer the import to idle
 * time so it does not compete with hydration / LCP image decode.
 */
export function useProductStock(sku: string) {
  const [inStock, setInStock] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let channel: any = null;
    let supabaseRef: any = null;

    const run = async () => {
      try {
        const mod = await import("@/integrations/supabase/client");
        if (cancelled) return;
        supabaseRef = mod.supabase;

        const { data, error } = await supabaseRef
          .from("product_stock")
          .select("in_stock")
          .eq("sku", sku)
          .maybeSingle();

        if (!cancelled && !error && data) {
          setInStock(data.in_stock);
        }

        if (cancelled) return;

        channel = supabaseRef
          .channel(`stock-${sku}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "product_stock", filter: `sku=eq.${sku}` },
            (payload: any) => {
              if (payload.new) setInStock(payload.new.in_stock);
            }
          )
          .subscribe();
      } catch {
        // Default to in stock on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const ric: any =
      (typeof window !== "undefined" && (window as any).requestIdleCallback) ||
      ((cb: () => void) => setTimeout(cb, 200));
    const cic: any =
      (typeof window !== "undefined" && (window as any).cancelIdleCallback) ||
      ((id: any) => clearTimeout(id));
    const idleId = ric(() => { run(); });

    return () => {
      cancelled = true;
      try { cic(idleId); } catch {}
      if (channel && supabaseRef) {
        try { supabaseRef.removeChannel(channel); } catch {}
      }
    };
  }, [sku]);

  return { inStock, loading };
}
