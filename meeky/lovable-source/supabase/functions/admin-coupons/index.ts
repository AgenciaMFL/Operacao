import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { buildPartnerStats } from "../_shared/partner-stats.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const jsonResp = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const PRODUCT_PRICE = 269;

function calcBonus(salesCount: number): { rate: number; amount: number } {
  if (salesCount <= 0) return { rate: 0, amount: 0 };
  const rate = 0.10;
  return { rate, amount: Math.round(rate * salesCount * PRODUCT_PRICE * 100) / 100 };
}


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = req.headers.get("x-admin-token") || "";
    const adminPassword = Deno.env.get("ADMIN_PASSWORD") || "";
    if (!adminPassword) {
      return jsonResp({ error: "Admin não configurado" }, 500);
    }
    const encoder = new TextEncoder();
    const expectedBuf = await crypto.subtle.digest("SHA-256", encoder.encode(adminPassword));
    const expectedToken = Array.from(new Uint8Array(expectedBuf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    // Constant-time comparison
    let mismatch = token.length === expectedToken.length ? 0 : 1;
    for (let i = 0; i < expectedToken.length; i++) {
      mismatch |= (token.charCodeAt(i) || 0) ^ expectedToken.charCodeAt(i);
    }
    if (mismatch !== 0) {
      return jsonResp({ error: "Não autorizado" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    if (action === "list") {
      const { data: coupons, error } = await supabase
        .from("coupons")
        .select("*")
        .order("partner_name");
      if (error) throw error;
      return jsonResp({ coupons });
    }

    if (action === "toggle") {
      const { id, active } = await req.json();
      const { error } = await supabase.from("coupons").update({ active }).eq("id", id);
      if (error) throw error;
      return jsonResp({ success: true });
    }

    if (action === "create") {
      const body = await req.json();
      const { error } = await supabase.from("coupons").insert({
        code: body.code.trim().toUpperCase(),
        partner_name: body.partner_name,
        discount_type: body.discount_type || "fixed",
        discount_value: body.discount_value || 28,
        max_uses: body.max_uses || null,
        pix_key: body.pix_key || null,
        active: true,
      });
      if (error) throw error;
      return jsonResp({ success: true });
    }

    if (action === "update_pix") {
      const { id, pix_key } = await req.json();
      const { error } = await supabase.from("coupons").update({ pix_key }).eq("id", id);
      if (error) throw error;
      return jsonResp({ success: true });
    }

    if (action === "stats") {
      const month = url.searchParams.get("month"); // YYYY-MM
      const now = new Date();
      const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const [year, mon] = targetMonth.split("-").map(Number);
      const startDate = new Date(year, mon - 1, 1).toISOString();
      const endDate = new Date(year, mon, 1).toISOString();

      const { data: coupons } = await supabase.from("coupons").select("*").order("uses_count", { ascending: false });

      const { data: partnerLinks } = await supabase.from("partner_links").select("coupon_code, clicks");
      const clicksMap: Record<string, number> = {};
      (partnerLinks || []).forEach((pl: any) => { clicksMap[pl.coupon_code] = pl.clicks || 0; });

      // Get orders for the target month
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .not("coupon_code", "is", null)
        .neq("coupon_code", "")
        .gte("created_at", startDate)
        .lt("created_at", endDate);

      const paidOrders = (orders || []).filter(o => o.payment_status === "approved");

      const totalSales = paidOrders.length;
      const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const topCoupon = (coupons || []).length > 0 ? coupons![0] : null;

      // Get existing payments for this month
      const { data: payments } = await supabase
        .from("partner_payments")
        .select("*")
        .eq("month", targetMonth);

      const paymentsMap: Record<string, any> = {};
      (payments || []).forEach((p: any) => { paymentsMap[p.coupon_id] = p; });

      const couponStats = (coupons || []).map(c => {
        const couponOrders = paidOrders.filter(o => o.coupon_code === c.code);
        const revenue = couponOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
        const discount = couponOrders.reduce((sum, o) => sum + Number(c.discount_value) * (o.quantity || 1), 0);
        const clicks = clicksMap[c.code] || 0;
        const convRate = clicks > 0 ? (couponOrders.length / clicks) * 100 : 0;
        const bonus = calcBonus(couponOrders.length);
        const payment = paymentsMap[c.id];
        return {
          ...c,
          order_count: couponOrders.length,
          revenue,
          discount_given: discount,
          avg_ticket: couponOrders.length > 0 ? revenue / couponOrders.length : 0,
          clicks,
          conversion_rate: Math.round(convRate * 10) / 10,
          bonus_rate: bonus.rate,
          bonus_amount: bonus.amount,
          payment_status: payment?.status || null,
          payment_id: payment?.id || null,
        };
      });

      const totalBonus = couponStats.reduce((sum, c) => sum + c.bonus_amount, 0);

      return jsonResp({ totalSales, totalRevenue, topCoupon, couponStats, totalBonus, month: targetMonth });
    }

    if (action === "close_month") {
      const { month } = await req.json();
      if (!month) return jsonResp({ error: "month required" }, 400);

      const [year, mon] = month.split("-").map(Number);
      const startDate = new Date(year, mon - 1, 1).toISOString();
      const endDate = new Date(year, mon, 1).toISOString();

      const { data: coupons } = await supabase.from("coupons").select("*");
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .not("coupon_code", "is", null)
        .neq("coupon_code", "")
        .eq("payment_status", "approved")
        .gte("created_at", startDate)
        .lt("created_at", endDate);

      const records = (coupons || []).map(c => {
        const couponOrders = (orders || []).filter(o => o.coupon_code === c.code);
        const bonus = calcBonus(couponOrders.length);
        return {
          coupon_id: c.id,
          partner_name: c.partner_name,
          month,
          sales_count: couponOrders.length,
          bonus_amount: bonus.amount,
          pix_key: c.pix_key || null,
          status: "pending",
        };
      }).filter(r => r.sales_count > 0);

      if (records.length === 0) return jsonResp({ success: true, message: "Nenhuma venda no período" });

      // Upsert
      for (const rec of records) {
        const { error } = await supabase
          .from("partner_payments")
          .upsert(rec, { onConflict: "coupon_id,month" });
        if (error) throw error;
      }

      return jsonResp({ success: true, count: records.length });
    }

    if (action === "mark_paid") {
      const { payment_id } = await req.json();
      const { error } = await supabase
        .from("partner_payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payment_id);
      if (error) throw error;
      return jsonResp({ success: true });
    }

    if (action === "payments") {
      const month = url.searchParams.get("month");
      let query = supabase.from("partner_payments").select("*").order("partner_name");
      if (month) query = query.eq("month", month);
      const { data, error } = await query;
      if (error) throw error;
      return jsonResp({ payments: data });
    }

    if (action === "orders") {
      const couponCode = url.searchParams.get("coupon_code");
      let query = supabase
        .from("orders")
        .select("*")
        .eq("payment_status", "approved")
        .order("created_at", { ascending: false });

      if (couponCode) {
        query = query.eq("coupon_code", couponCode);
      } else {
        query = query.not("coupon_code", "is", null).neq("coupon_code", "");
      }

      const { data: orders, error } = await query;
      if (error) throw error;

      const masked = (orders || []).map(o => ({
        ...o,
        customer_email: o.customer_email.replace(/(.{1,2}).*@/, "$1***@"),
        customer_name: o.customer_name.split(" ")[0] + " ***",
        customer_cpf: "***",
        customer_phone: "***",
      }));

      return jsonResp({ orders: masked });
    }

    if (action === "partner_stats") {
      const couponCode = (url.searchParams.get("coupon_code") || "").toUpperCase();
      if (!couponCode) return jsonResp({ error: "coupon_code obrigatório" }, 400);
      const stats = await buildPartnerStats(supabaseUrl, supabaseServiceKey, couponCode);
      if (!stats) return jsonResp({ error: "Cupom não encontrado" }, 404);
      return jsonResp({ stats });
    }

    if (action === "generate_token") {
      const { coupon_code } = await req.json();
      const code = (coupon_code || "").toUpperCase();
      if (!code) return jsonResp({ error: "coupon_code obrigatório" }, 400);

      // Verifica se já existe token ativo
      const { data: existing } = await supabase
        .from("partner_access_tokens")
        .select("token")
        .eq("coupon_code", code)
        .eq("active", true)
        .maybeSingle();

      if (existing?.token) {
        return jsonResp({ token: existing.token, reused: true });
      }

      // Gera token novo (32 bytes hex = 64 chars)
      const buf = new Uint8Array(32);
      crypto.getRandomValues(buf);
      const newToken = Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");

      const { error: insErr } = await supabase
        .from("partner_access_tokens")
        .insert({ coupon_code: code, token: newToken, active: true });
      if (insErr) throw insErr;

      return jsonResp({ token: newToken, reused: false });
    }

    return jsonResp({ error: "Ação inválida" }, 400);
  } catch (err) {
    console.error("admin-coupons error:", err);
    return jsonResp({ error: "Erro interno" }, 500);
  }
});
