import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Truck, Instagram, MessageCircle, Home } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/shared/SEO";
import { supabase } from "@/integrations/supabase/client";



const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
  const status = searchParams.get("status") || searchParams.get("collection_status");
  const externalRef = searchParams.get("external_reference");
  const customerEmail = searchParams.get("email") || "";

  const couponCode = searchParams.get("coupon") || "";

  // GTIN real do único SKU vendido (Meeky F5 ANC Pro). Não há GTIN no banco.
  const PRODUCT_GTIN = "7908983802679";

  // Prazo estimado por serviço de transporte (dias úteis). O banco não guarda
  // prazo por serviço — usamos o nome do serviço registrado no pedido.
  const serviceBusinessDays = (service?: string | null): number => {
    const s = (service || "").toLowerCase();
    if (s.includes("sedex")) return 3;
    if (s.includes("pac")) return 7;
    if (s.includes("j&t") || s.includes("jt ") || s.includes("express")) return 5;
    return 5;
  };

  const addBusinessDays = (from: Date, days: number): string => {
    const date = new Date(from.getTime());
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) added += 1;
    }
    return date.toISOString().split("T")[0];
  };


  // Estado com dados reais do pedido (valor efetivamente cobrado, quantidade, cupom)
  // vindos do edge function `claim-purchase-event`, que também reivindica atomicamente
  // o direito de disparar o evento `purchase` (dedup com o webhook server-side).
  const [orderSummary, setOrderSummary] = useState<{
    value: number;
    quantity: number;
    coupon: string;
    items: Array<{ item_id: string; item_name: string; price: number; quantity: number }>;
    transactionId: string;
    email: string;
    createdAt: string | null;
    shippingService: string | null;
  } | null>(null);

  // Analytics: GA4 purchase event + Meta Pixel — dedup client×server via edge function
  useEffect(() => {
    if (!paymentId || status !== "approved") return;

    const transactionId = externalRef || paymentId;

    // Dedup local (mesma aba/reload). Dedup cross-source (webhook vs cliente) é feito
    // pelo edge function via UPDATE atômico em orders.purchase_event_sent_at.
    const dedupKey = `purchase_fired_${transactionId}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(dedupKey)) {
      console.log("[Analytics] Purchase já disparado nesta sessão — skip", transactionId);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("claim-purchase-event", {
          body: { external_reference: externalRef || null, payment_id: paymentId },
        });
        if (cancelled) return;
        if (error) {
          console.warn("[Analytics] claim-purchase-event error:", error);
          return;
        }

        const summary = {
          value: Number(data?.value ?? 0),
          quantity: Number(data?.quantity ?? 1),
          coupon: (data?.coupon ?? "") as string,
          items: (data?.items ?? []) as Array<{ item_id: string; item_name: string; price: number; quantity: number }>,
          transactionId: (data?.transaction_id ?? transactionId) as string,
          email: ((data?.customer_email as string) || customerEmail || ""),
          createdAt: (data?.created_at as string) ?? null,
          shippingService: (data?.shipping_service_name as string) ?? null,
        };
        setOrderSummary(summary);

        if (!data?.claimed) {
          console.log("[Analytics] Server-side (webhook) já disparou a conversão — skip client-side", summary.transactionId);
          sessionStorage.setItem(dedupKey, "1");
          return;
        }

        const items = summary.items.length ? summary.items : [{
          item_id: "MEEKY-F5-PRO-BLK",
          item_name: "Headphone Meeky F5 ANC Pro",
          price: summary.value / Math.max(1, summary.quantity),
          quantity: summary.quantity,
        }];

        if ((window as any).gtag) {
          (window as any).gtag("event", "purchase", {
            transaction_id: summary.transactionId,
            value: summary.value,
            currency: "BRL",
            coupon: summary.coupon,
            items,
          });
        }

        if ((window as any).dataLayer) {
          (window as any).dataLayer.push({ ecommerce: null });
          (window as any).dataLayer.push({
            event: "purchase",
            ecommerce: {
              transaction_id: summary.transactionId,
              value: summary.value,
              currency: "BRL",
              coupon: summary.coupon,
              items,
            },
          });
        }

        if ((window as any).fbq) {
          (window as any).fbq("track", "Purchase", {
            content_type: "product",
            content_ids: [items[0]?.item_id?.toLowerCase() || "f5anc"],
            value: summary.value,
            currency: "BRL",
          }, { eventID: summary.transactionId });
        }

        sessionStorage.setItem(dedupKey, "1");
        console.log("[Analytics] Purchase disparado (client-side):", summary);
      } catch (e) {
        console.warn("[Analytics] Falha ao reivindicar/disparar purchase:", e);
      }
    })();

    return () => { cancelled = true; };
  }, [paymentId, status, externalRef]);

  // Google Avaliações do Consumidor (Customer Reviews opt-in).
  // Só roda nesta página e SOMENTE quando o pedido foi confirmado como existente
  // e aprovado pelo edge function (orderSummary != null). Nunca em loading/pendente/erro.
  useEffect(() => {
    if (!orderSummary || status !== "approved") return;

    const createdAt = orderSummary.createdAt ? new Date(orderSummary.createdAt) : new Date();
    const estimatedDeliveryDate = addBusinessDays(
      isNaN(createdAt.getTime()) ? new Date() : createdAt,
      serviceBusinessDays(orderSummary.shippingService),
    );

    const config: Record<string, unknown> = {
      merchant_id: 5766308264,
      order_id: orderSummary.transactionId,
      email: orderSummary.email,
      delivery_country: "BR",
      estimated_delivery_date: estimatedDeliveryDate,
      products: [{ gtin: PRODUCT_GTIN }],
    };

    (window as any).renderOptIn = function () {
      (window as any).gapi?.load("surveyoptin", function () {
        (window as any).gapi.surveyoptin.render(config);
      });
    };

    if (!document.querySelector('script[data-gcr="true"]')) {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/platform.js?onload=renderOptIn";
      script.async = true;
      script.defer = true;
      script.setAttribute("data-gcr", "true");
      document.body.appendChild(script);
    } else if ((window as any).gapi) {
      (window as any).renderOptIn();
    }
  }, [orderSummary, status]);

  // Fallback: se o edge function ainda não respondeu (ou falhou), usa qty da URL para a UI.
  const qtyFromUrl = Math.max(1, parseInt(searchParams.get("qty") || "1", 10) || 1);
  const qty = orderSummary?.quantity ?? qtyFromUrl;
  const valuePaid = orderSummary?.value ?? qtyFromUrl * 297;
  const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;


  const estimatedRange = (() => {
    const start = new Date();
    const end = new Date();
    let added = 0;
    while (added < 3) { start.setDate(start.getDate() + 1); const d = start.getDay(); if (d !== 0 && d !== 6) added += 1; }
    added = 0;
    while (added < 7) { end.setDate(end.getDate() + 1); const d = end.getDay(); if (d !== 0 && d !== 6) added += 1; }
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
  })();

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SEO title="Compra Confirmada | Meeky Audio" description="Sua compra foi confirmada com sucesso. Obrigado por escolher a Meeky Audio." />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Compra confirmada!
            </h1>
            <p className="text-lg text-muted-foreground">
              Seu Meeky F5 ANC Pro está sendo preparado.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <Layout>
      <SEO title="Compra Confirmada | Meeky Audio" description="Sua compra foi confirmada com sucesso. Obrigado por escolher a Meeky Audio." />
      <section className="bg-background">
        <div className="container-wide section-padding py-16 md:py-24">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={40} className="text-accent" />
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Compra confirmada! 🎉
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Seu Meeky F5 ANC Pro está sendo preparado com carinho.
            </p>

            {/* Order details */}
            <div className="bg-secondary rounded-sm border border-border p-6 md:p-8 text-left space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Produto</span>
                <span className="text-foreground font-semibold text-right">Meeky F5 ANC Pro{qty > 1 ? ` × ${qty}` : ""}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor pago</span>
                <span className="text-foreground font-semibold">{formatBRL(valuePaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span className="text-green-500 font-semibold">Grátis</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Truck size={14} /> Prazo estimado</span>
                <span className="text-foreground font-semibold">{estimatedRange}</span>
              </div>
              {paymentId && (
                <div className="pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
                  <span>ID do pagamento</span>
                  <span className="font-mono text-foreground">{paymentId}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              📩 Você receberá a confirmação por email em breve.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/meeky.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-gold-light transition-all"
              >
                <Instagram size={16} /> SEGUIR @MEEKY.BR NO INSTAGRAM
              </a>
              <a
                href="https://wa.me/5512991074311?text=Ol%C3%A1%2C%20acabei%20de%20comprar%20o%20Meeky%20F5%20ANC%20Pro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold tracking-wider rounded-sm hover:bg-charcoal-light transition-all"
              >
                <MessageCircle size={16} /> FALAR COM SUPORTE NO WHATSAPP
              </a>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <Home size={14} /> Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};


export default CheckoutSuccessPage;
