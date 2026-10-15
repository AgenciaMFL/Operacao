import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fallbackSiteUrl = "https://www.meeky.com.br";

const resolveSiteUrl = (value?: string | null) => {
  if (!value || !/^https?:\/\//i.test(value)) {
    console.warn("Invalid SITE_URL for checkout redirects — falling back to production domain", {
      provided: value ?? "missing",
    });
    return fallbackSiteUrl;
  }

  try {
    const parsedUrl = new URL(value);
    const hasValidHost = parsedUrl.hostname === "localhost" || parsedUrl.hostname.includes(".");

    if (!hasValidHost) {
      throw new Error(`Invalid hostname: ${parsedUrl.hostname}`);
    }

    return parsedUrl.origin;
  } catch (error) {
    console.warn("Failed to parse SITE_URL for checkout redirects — falling back to production domain", {
      provided: value,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return fallbackSiteUrl;
  }
};

const bodySchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email().max(255),
    phone: z.string().min(10).max(15),
    cpf: z.string().min(11).max(14),
  }),
  shipping: z.object({
    cep: z.string().length(8),
    street: z.string().min(1).max(300),
    number: z.string().min(1).max(20),
    complement: z.string().max(100).optional().default(""),
    neighborhood: z.string().min(1).max(100),
    city: z.string().min(1).max(100),
    state: z.string().length(2),
  }),
  product: z.object({
    sku: z.string(),
    name: z.string(),
    price: z.number().positive(),
    shipping: z.number().min(0),
    quantity: z.number().int().min(1).max(5).optional().default(1),
    coupon: z.string().optional(),
  }),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const limited = await enforceRateLimit(req, {
    functionName: "create-checkout",
    maxRequests: 20,
    windowSeconds: 600,
    corsHeaders,
  });
  if (limited) return limited;

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) {
      throw new Error("MP_ACCESS_TOKEN is not configured");
    }

    const MP_APP_ID = Deno.env.get("MP_APP_ID");

    // Debug credential type (safe — only prefix/length)
    console.log("MP credential check:", {
      length: MP_ACCESS_TOKEN.length,
      prefix: MP_ACCESS_TOKEN.substring(0, 8),
      isTest: MP_ACCESS_TOKEN.startsWith("TEST-"),
      appId: MP_APP_ID || "NOT SET",
    });

    const rawBody = await req.json();
    console.log("Received checkout request:", {
      sku: rawBody?.product?.sku,
      quantity: rawBody?.product?.quantity,
      coupon: rawBody?.product?.coupon || "none",
    });

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      console.error("Validation errors:", JSON.stringify(parsed.error.flatten().fieldErrors));
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { customer, shipping, product } = parsed.data;
    const siteUrl = resolveSiteUrl(Deno.env.get("SITE_URL")?.trim());
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const backUrls = {
      success: `${siteUrl}/checkout/sucesso`,
      failure: `${siteUrl}/checkout`,
      pending: `${siteUrl}/checkout/sucesso`,
    };

    console.log("Creating preference:", {
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      shipping: product.shipping,
      coupon: product.coupon || "none",
      total: (product.price * product.quantity) + product.shipping,
    });

    console.log("Resolved checkout URLs:", {
      siteUrl,
      backUrls,
      notificationUrl: supabaseUrl
        ? `${supabaseUrl}/functions/v1/mercadopago-webhook`
        : `${siteUrl}/api/mercadopago-webhook`,
    });

    // Create Mercado Pago preference
    const preference: Record<string, unknown> = {
      items: [
        {
          id: product.sku,
          title: product.name,
          quantity: product.quantity,
          unit_price: product.price,
          currency_id: "BRL",
        },
      ],
      shipments: {
        cost: product.shipping,
        mode: "not_specified",
      },
      payer: {
        name: customer.name.split(" ")[0],
        surname: customer.name.split(" ").slice(1).join(" ") || customer.name.split(" ")[0],
        email: customer.email,
        phone: {
          area_code: customer.phone.slice(0, 2),
          number: customer.phone.slice(2),
        },
        identification: {
          type: customer.cpf.length <= 11 ? "CPF" : "CNPJ",
          number: customer.cpf,
        },
        address: {
          zip_code: shipping.cep,
          street_name: shipping.street,
          street_number: parseInt(shipping.number) || 0,
        },
      },
      back_urls: backUrls,
      auto_return: "approved",
      external_reference: JSON.stringify({
        customer,
        shipping,
        product,
      }),
      notification_url: supabaseUrl
        ? `${supabaseUrl}/functions/v1/mercadopago-webhook`
        : `${siteUrl}/api/mercadopago-webhook`,
      payment_methods: {
        excluded_payment_types: [],
        installments: 6,
      },
    };

    // Vincular preference ao app correto (evita marketplace indesejado)
    if (MP_APP_ID) {
      preference.application_id = MP_APP_ID;
      console.log("application_id attached to preference:", MP_APP_ID);
    } else {
      console.warn("MP_APP_ID not set — preference will use default app from access token");
    }

    console.log("Sending to MP API...");
    const startTime = Date.now();

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const elapsed = Date.now() - startTime;
    console.log(`MP API responded in ${elapsed}ms with status ${mpResponse.status}`);

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", JSON.stringify(mpData));
      throw new Error(`Mercado Pago API error [${mpResponse.status}]: ${JSON.stringify(mpData)}`);
    }

    console.log("Preference created:", { id: mpData.id, init_point: mpData.init_point?.substring(0, 60) });

    return new Response(
      JSON.stringify({ init_point: mpData.init_point, id: mpData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
