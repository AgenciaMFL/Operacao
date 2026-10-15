import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real number of approved (paid) orders, read from the database.
 * Used for social proof copy so the number is never hardcoded/stale.
 */
export const useDeliveredOrdersCount = () => {
  const { data } = useQuery({
    queryKey: ["delivered-orders-count"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_delivered_orders_count");
      if (error) throw error;
      return typeof data === "number" ? data : 0;
    },
    staleTime: 1000 * 60 * 60,
  });

  return data ?? null;
};

/** "+426 pedidos entregues em todo o Brasil" (null-safe fallback) */
export const deliveredOrdersLabel = (count: number | null) =>
  count && count > 0
    ? `+${count.toLocaleString("pt-BR")} pedidos entregues em todo o Brasil`
    : "Pedidos entregues em todo o Brasil";
