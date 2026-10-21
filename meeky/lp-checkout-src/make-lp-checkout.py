# Gera a cópia do checkout da loja para o site da LP (links do site da LP, mesmo backend)
import os,sys
X=sys.argv[1]; S=X+'/src/pages/'; D=X+'/src/lp-checkout/'
def patch(src,dst,reps):
    s=open(S+src).read()
    for a,b in reps:
        n=s.count(a)
        assert n>=1, (src,a[:80])
        s=s.replace(a,b)
    open(D+dst,'w').write(s)
LOGO_OLD='<img src={logo} alt="Meeky" width={120} height={32} className="h-6 md:h-8 w-auto invert dark:invert-0" />'
LOGO_NEW='<img src="assets/logo-meeky.svg" alt="Meeky" width={104} height={24} className="h-5 md:h-6 w-auto" />'
patch('CheckoutPage.tsx','CheckoutPage.tsx',[
  ('import Footer from "@/components/layout/Footer";','import Footer from "./LpFooter";\nimport { lpHref } from "./lpLinks";'),
  (LOGO_OLD, LOGO_NEW),
  ('''          <Link to="/headphone-anc-meeky-f5-pro" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Voltar para o produto
          </Link>
          <Link to="/" className="flex items-center" aria-label="Meeky">''',
   '''          <a href={lpHref(PRODUCT.key === "motion1" ? "Motion1" : "Produto")} className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Voltar para o produto
          </a>
          <a href={lpHref("Home")} className="flex items-center" aria-label="Meeky">'''),
  ('''            <img src="assets/logo-meeky.svg" alt="Meeky" width={104} height={24} className="h-5 md:h-6 w-auto" />
          </Link>''','''            <img src="assets/logo-meeky.svg" alt="Meeky" width={104} height={24} className="h-5 md:h-6 w-auto" />
          </a>'''),
  ('<Link to="/termos" className="text-accent underline" target="_blank">Termos de Uso</Link>','<a href="https://meeky.com.br/termos" className="text-accent underline" target="_blank" rel="noopener">Termos de Uso</a>'),
  ('<Link to="/privacidade" className="text-accent underline" target="_blank">Política de Privacidade</Link>','<a href="https://meeky.com.br/privacidade" className="text-accent underline" target="_blank" rel="noopener">Política de Privacidade</a>'),
  ('navigate(`/checkout/sucesso?','navigate(`/Checkout-sucesso?'),
  ('navigate(`/checkout/pendente?','navigate(`/Checkout-pendente?'),
  ('import { getCheckoutProduct } from "@/lib/products";','import { getCheckoutProduct } from "@/lib/products";\nimport { saveBuyer, sendSale } from "./saleWebhook";'),
  # Motion 1 em até 12x no cartão (F5 continua em até 6x)
  ('                  maxInstallments: 6,','                  maxInstallments: PRODUCT.key === "motion1" ? 12 : 6,'),
  ('''                    console.log("[Checkout] Payment result:", data);
''','''                    console.log("[Checkout] Payment result:", data);

                    // Guarda os dados do comprador para avisar o GHL quando a venda for aprovada
                    if (data?.payment_id) {
                      const utmNow = getStoredUtm() as Record<string, string | undefined> | null;
                      saveBuyer({
                        name: form.name, email: form.email, phone: form.phone,
                        product: PRODUCT.name, product_key: String(PRODUCT.key ?? ""), sku: PRODUCT.sku,
                        quantity, unit_price: unitPrice, shipping: activeShipping, total,
                        coupon: appliedCoupon?.code || null, payment_method: selectedPaymentMethod || null,
                        city: form.city, state: form.state,
                        utm_source: utmNow?.utm_source ?? null, utm_medium: utmNow?.utm_medium ?? null, utm_campaign: utmNow?.utm_campaign ?? null,
                      });
                      if (data?.status === "approved") void sendSale(String(data.payment_id), data.order_id ? String(data.order_id) : null);
                    }
'''),
])
patch('CheckoutSuccessPage.tsx','CheckoutSuccessPage.tsx',[
  ('''  const status = searchParams.get("status") || searchParams.get("collection_status");
''','''  const status = searchParams.get("status") || searchParams.get("collection_status");
  // Venda aprovada: avisa o GHL (uma vez por pagamento)
  useEffect(() => { if (status === "approved") void sendSale(paymentId); }, [paymentId, status]);
'''),
  ('''              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <Home size={14} /> Voltar para o início
              </Link>''','''              <a
                href={lpHref("Home")}
                className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <Home size={14} /> Voltar para o início
              </a>'''),
])
patch('CheckoutPendingPage.tsx','CheckoutPendingPage.tsx',[
  ('navigate(`/checkout/sucesso?','navigate(`/Checkout-sucesso?'),
  ('<a href="/contato" className="underline font-semibold">','<a href={lpHref("Contato")} className="underline font-semibold">'),
  ('''        if (data?.payment_status === "approved") {
          clearInterval(interval);''','''        if (data?.payment_status === "approved") {
          clearInterval(interval);
          void sendSale(paymentId, orderId);'''),
])
# lpHref import nas páginas de sucesso/pendente
for f in ['CheckoutSuccessPage.tsx','CheckoutPendingPage.tsx']:
    s=open(D+f).read(); i=s.index('\n',s.index('import '))
    s=s[:i+1]+'import { lpHref } from "./lpLinks";\nimport { sendSale } from "./saleWebhook";\n'+s[i+1:]
    s=s.replace('from "@/components/layout/Footer"','from "./LpFooter"')
    assert 'import Layout from "@/components/layout/Layout";' in s
    s=s.replace('import Layout from "@/components/layout/Layout";','import Layout from "./LpLayout";')
    open(D+f,'w').write(s)
print('ok')
