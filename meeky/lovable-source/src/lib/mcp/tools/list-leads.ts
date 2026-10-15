import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, requireAuth } from "./_supabase";

export default defineTool({
  name: "list_leads",
  title: "List B2B / VIP leads",
  description: "List recent leads. Row visibility is enforced by database RLS.",
  inputSchema: {
    source: z.enum(["b2b", "vip"]).describe("Which lead table to read from."),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ source, limit }, ctx) => {
    const guard = requireAuth(ctx);
    if (guard) return guard;
    const table = source === "b2b" ? "leads" : "vip_leads";
    const { data, error } = await supabaseForUser(ctx)
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { leads: data ?? [] },
    };
  },
});
