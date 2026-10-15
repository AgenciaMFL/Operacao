import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, requireAuth } from "./_supabase";

export default defineTool({
  name: "list_active_coupons",
  title: "List active coupons",
  description: "List currently active coupons. Row visibility is enforced by database RLS.",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const guard = requireAuth(ctx);
    if (guard) return guard;
    const { data, error } = await supabaseForUser(ctx)
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { coupons: data ?? [] },
    };
  },
});
