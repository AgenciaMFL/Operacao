import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_product_info",
  title: "Get product info",
  description:
    "Return static information about the Meeky F5 ANC Pro headphone: SKU, price, key specs, and canonical URL.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "Meeky F5 ANC Pro",
      sku: "f5anc",
      price_brl: 297,
      anchored_price_brl: 349,
      shipping: "Frete grátis para todo o Brasil",
      specs: {
        anc: "Cancelamento de ruído ativo híbrido",
        battery_hours: 70,
        bluetooth: "5.4 com Multipoint",
        codecs: ["SBC", "AAC"],
        driver_mm: 40,
      },
      url: "https://meeky.com.br/headphone-anc-meeky-f5-pro",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
