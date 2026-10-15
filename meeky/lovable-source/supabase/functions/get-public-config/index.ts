const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const mpPublicKey = Deno.env.get("MP_PUBLIC_KEY") || "";

  console.log(`[get-public-config] Returning public key (length: ${mpPublicKey.length}, prefix: ${mpPublicKey.substring(0, 8)})`);

  return new Response(
    JSON.stringify({ mpPublicKey }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
});
