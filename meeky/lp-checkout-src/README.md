# Checkout da loja dentro do site da LP

Cópia do checkout da loja (Lovable, repo `meekybr/meeky-focus-control`) com os links do site da LP.
Usa **o mesmo backend** da loja (Supabase + Mercado Pago): pedidos, pagamentos, cupons, e-mails e estoque
continuam todos no sistema da loja. Só a página muda.

Resultado (já copiado para `site-lp/`): `Checkout.html`, `Checkout-sucesso.html`, `Checkout-pendente.html`,
pasta `ck/` (JS/CSS) e pasta `fonts/`.

## Como regenerar (quando a loja mudar o checkout)
1. Clone a loja e instale: `npm install`. Precisa do `.env` da loja (só as chaves públicas `VITE_*`).
2. Copie `src/*` daqui para `src/lp-checkout/` da loja, e `vite.lp.config.ts` + `lp-checkout.html` para a raiz.
3. `python3 make-lp-checkout.py <pasta-da-loja>` — copia `CheckoutPage`, `CheckoutSuccessPage` e
   `CheckoutPendingPage` trocando os links para as páginas da LP (para se o código da loja mudou demais).
4. `npx vite build --config vite.lp.config.ts` → `dist-lp/`.
5. Copie `dist-lp/ck/` para `site-lp/ck/`, `public/fonts/*.woff2` para `site-lp/fonts/` e
   `dist-lp/lp-checkout.html` para `site-lp/Checkout.html`, `Checkout-sucesso.html` e `Checkout-pendente.html`.

⚠️ O preço exibido vem de `src/lib/products.ts` da loja no momento do build. O valor cobrado é sempre o do
servidor da loja. Se a loja mudar preço, regenere esta cópia.

## Aviso de venda para o GHL
`src/saleWebhook.ts` envia um POST (JSON) para o Inbound Webhook do GHL quando o pagamento é aprovado
(cartão aprovado na hora, ou Pix aprovado enquanto a pessoa está na página do QR code). Envia uma vez por
pagamento. Campos: event, payment_id, order_id, name, first_name, email, phone (+55…), product, product_key,
sku, quantity, unit_price, shipping, total, coupon, payment_method, city, state, utm_*, source, purchased_at.
Limite: se a pessoa fechar a página antes do Pix ser aprovado, o aviso não sai pelo navegador — para cobrir
100% é preciso disparar também pelo servidor da loja (mercadopago-webhook, no Lovable).
