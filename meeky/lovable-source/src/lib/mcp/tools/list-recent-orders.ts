import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth } from "./_supabase";

export default defineTool({
  name: "list_recent_orders",
  title: "List recent orders",
  description:
    "List the most recent orders. Row visibility is enforced by database RLS — only admins see data.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max rows to return (default 10)."),
    status: z.string().optional().describe("Filter by payment_status (approved, pending, rejected, cancelled)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    const guard = requireAuth(ctx);
    if (guard) return guard;
    let q = supabaseForUser(ctx)
      .from("orders")
      .select("id, created_at, customer_name, customer_email, payment_status, total_amount, sku, tracking_code")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (status) q = q.eq("payment_status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { orders: data ?? [] },
    };
  },
});
