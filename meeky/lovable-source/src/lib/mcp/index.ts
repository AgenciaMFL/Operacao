import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProductInfo from "./tools/get-product-info";
import listRecentOrders from "./tools/list-recent-orders";
import getOrder from "./tools/get-order";
import listActiveCoupons from "./tools/list-active-coupons";
import listLeads from "./tools/list-leads";

// OAuth issuer MUST be the direct Supabase host (not the .lovable.cloud proxy).
// Build from VITE_SUPABASE_PROJECT_ID so it stays import-safe (Vite inlines this
// as a literal at build time — no runtime env read at module top level).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "meeky-mcp",
  title: "Meeky MCP",
  version: "0.1.0",
  instructions:
    "Ferramentas do Meeky (site meeky.com.br). Use get_product_info para dados públicos do headphone. As demais ferramentas leem tabelas com RLS — o acesso depende de o usuário autenticado ser admin.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProductInfo, listRecentOrders, getOrder, listActiveCoupons, listLeads],
});
