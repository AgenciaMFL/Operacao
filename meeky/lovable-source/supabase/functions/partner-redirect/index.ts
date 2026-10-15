import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SESSION_COOKIE = "meeky_pid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const m = header.split(";").map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  return m ? decodeURIComponent(m.split("=")[1]) : null;
}

async function hashIp(ip: string): Promise<string> {
  const buf = new TextEncoder().encode(`meeky:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const siteUrl = Deno.env.get("SITE_URL") || "https://meeky.com.br";

    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug não informado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: link, error } = await supabase
      .from("partner_links")
      .select("*")
      .eq("slug", slug.toLowerCase())
      .single();

    if (error || !link) {
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: siteUrl },
      });
    }

    // Sessão (cookie persistente p/ visitantes únicos)
    const cookieHeader = req.headers.get("cookie");
    let sessionId = parseCookie(cookieHeader, SESSION_COOKIE);
    const isNewSession = !sessionId;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Hash do IP (anônimo)
    const fwd = req.headers.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0].trim() || "unknown";
    const ipHash = await hashIp(ip);
    const userAgent = req.headers.get("user-agent")?.slice(0, 500) || "";
    const referrer = req.headers.get("referer")?.slice(0, 500) || "";

    // Insere evento (fire-and-forget) e incrementa contador legado
    supabase.from("partner_link_events").insert({
      slug: link.slug,
      coupon_code: link.coupon_code,
      session_id: sessionId,
      ip_hash: ipHash,
      user_agent: userAgent,
      referrer,
    }).then(() => {});

    supabase.rpc("increment_partner_clicks", { partner_slug: link.slug }).then(() => {});

    const redirectUrl = `${siteUrl}/?cupom=${link.coupon_code}&utm_source=${link.utm_source}&utm_medium=social&utm_campaign=parceiros2026`;

    const headers: Record<string, string> = {
      ...corsHeaders,
      Location: redirectUrl,
    };
    if (isNewSession) {
      headers["Set-Cookie"] = `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure; HttpOnly`;
    }

    return new Response(null, { status: 302, headers });
  } catch (err) {
    console.error("partner-redirect error:", err);
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: "https://www.meeky.com.br" },
    });
  }
});
