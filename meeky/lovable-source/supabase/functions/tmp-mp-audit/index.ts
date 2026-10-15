import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async () => {
  const token = Deno.env.get("MP_ACCESS_TOKEN")!;
  const begin = new Date(Date.now() - 7 * 86400000).toISOString();
  const url = `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&range=date_created&begin_date=${begin}&end_date=NOW&limit=100`;
  let all: any[] = [];
  let paging: any = null;
  for (let offset = 0; offset < 1000; offset += 100) {
    const r = await fetch(url + `&offset=${offset}`, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    paging = d.paging;
    all = all.concat(d.results ?? []);
    if (all.length >= (d.paging?.total ?? 0)) break;
  }
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const results = all.filter((p: any) => uuid.test(String(p.external_reference ?? ""))).map((p: any) => ({
    id: String(p.id),
    status: p.status,
    status_detail: p.status_detail,
    amount: p.transaction_amount,
    date_created: p.date_created,
    date_approved: p.date_approved,
    method: p.payment_method_id,
    email: p.payer?.email,
    external_reference: p.external_reference,
  }));
  return new Response(JSON.stringify({ paging, total_fetched: all.length, results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
