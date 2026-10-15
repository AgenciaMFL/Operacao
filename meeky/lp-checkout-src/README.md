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
