# Projeto MEEKY — contexto completo

> ⚠️ **VERSÃO LEVE (só código e documentação, ~3 MB).** Foram retirados imagens, fontes e o modelo 3D.
> - `site-lp/assets/` **não está aqui** → veja `site-lp/ASSETS-MANIFEST.md` (nome e tamanho de cada arquivo).
> - Imagens/fontes de `lovable-source/src/assets` e `lovable-source/public` também foram retiradas → veja `lovable-source/ASSETS-MANIFEST.md`.
> - O `.glb` (2,8 MB) não está aqui; no site ele é `assets/fone-meeky-v5.glb`.
> - **Para publicar a LP é preciso a pasta completa** (com `assets/`), que está no computador do usuário (a pasta usada no upload do Cloudflare). Esta versão serve para **analisar, editar HTML/JS e escrever código**, não para fazer deploy sozinha.

> Este arquivo é o ponto de partida para o Claude Code. Leia inteiro antes de mexer em qualquer coisa.
> Idioma de trabalho: **português (Brasil)**. Quem conduz o projeto **não é desenvolvedor** — explique em linguagem simples e peça confirmação antes de qualquer ação que publique algo no ar.

---

## 1. O que é

**Meeky** vende o headphone **Meeky F5 ANC Pro** (cancelamento ativo de ruído, 70h de bateria, Bluetooth, R$ 297, SKU `f5anc`).

Existem **dois sites diferentes** rodando no mesmo domínio `meeky.com.br`:

| | Site principal | Landing page nova (LP) |
|---|---|---|
| URL | `meeky.com.br` | `meeky.com.br/lp` |
| Feito com | Lovable (React + Vite + Supabase) | HTML estático exportado de outra ferramenta |
| Papel | Loja completa: checkout, pagamento, ERP, afiliados, blog | Página de apresentação + captura de lead |
| Onde mora o código | `lovable-source/` (e repo GitHub `meekybr/meeky-focus-control`) | `site-lp/` |
| Hospedagem | Cloudflare Pages (projeto `meeky-focus-control`) | Cloudflare Worker com static assets (projeto `meeky-site`) |

**A LP não vende.** O visitante preenche um formulário e depois a conversa segue por WhatsApp. Por isso a LP **não usa** Mercado Pago, checkout nem o backend do Lovable.

---

## 2. Estrutura desta pasta (versão leve)

```
meeky/
├── CLAUDE.md                 ← este arquivo
├── site-lp/                  ← HTML/JS da LP (sem a pasta assets/ — ver ASSETS-MANIFEST.md)
├── worker/
│   └── lp-proxy-worker.js    ← Worker "meeky-lp-proxy" (a "ponte" que entrega a LP em /lp)
├── lovable-source/           ← código-fonte do site principal (React/Vite/Supabase). SEM .env e sem imagens.
│   └── supabase/             ← 28 Edge Functions + 59 migrations do banco
└── docs/
    └── integracoes_meeky.docx     ← inventário das integrações do site principal
```

---

## 3. Arquitetura / como as peças se encaixam

```
Visitante
   │
   ▼
Cloudflare (zona meeky.com.br, DNS "Full", proxied)
   │
   ├── meeky.com.br/lp*  ──► Worker "meeky-lp-proxy" ──► busca em
   │                                                     https://meeky-site.contato-ceb.workers.dev
   │                                                     (Worker "meeky-site" = arquivos de site-lp/)
   │
   └── qualquer outro caminho ──► DNS: CNAME → meeky-focus-control.pages.dev
                                    (site Lovable; Supabase por trás)
```

Pontos-chave:
- O **Worker de rota** `meeky.com.br/lp*` tem prioridade sobre o DNS só para esse caminho. O resto do domínio **não é afetado**.
- O `meeky-site` **não tem domínio personalizado** (o `site.meeky.com.br` foi criado e depois removido de propósito, para a LP não ficar pública em dois endereços). Ele só é acessível pelo endereço `.workers.dev`, que é a origem usada pelo proxy.
- Se o `meeky-site` mudar de nome/endereço, **atualize a constante `originUrl`** em `worker/lp-proxy-worker.js` e republique o Worker.

---

## 4. Cloudflare — inventário

Conta Cloudflare da Meeky (subdomínio workers.dev: `contato-ceb`).

**Zona `meeky.com.br`** (plano free). Registros DNS relevantes (não apague sem entender):

| Tipo | Nome | Aponta para | Função |
|---|---|---|---|
| CNAME (proxied) | `meeky.com.br` | `meeky-focus-control.pages.dev` | Site principal (Lovable) |
| CNAME (proxied) | `www` | `meeky-focus-control.pages.dev` | Idem |
| MX (vários) | `meeky.com.br` | `aspmx.l.google.com`, `alt1..alt4.aspmx.l.google.com` | **E-mail via Google Workspace** |
| MX | `send` | `feedback-smtp.sa-east-1.amazonses.com` | Envio de e-mail (Amazon SES / Resend) |
| NS | `notify` | `ns5/ns6.lovable.cloud` | Subdomínio delegado ao Lovable (e-mails transacionais) |
| TXT | `_dmarc` | `v=DMARC1; p=none; …` | DMARC |

> ⚠️ **Nunca mexa nos MX/NS/TXT** — quebram o e-mail da empresa e os e-mails transacionais da loja.

**Workers & Pages:**
- `meeky-focus-control` — Pages, ligado ao GitHub `meekybr/meeky-focus-control` (Lovable sincroniza commits para lá). **Site principal. Não mexer sem pedido explícito.**
- `meeky-site` — Worker com static assets. Contém `site-lp/`. Deploy manual por upload.
- `meeky-lp-proxy` — Worker com código JS (`worker/lp-proxy-worker.js`). Logs ativados. Rota: `meeky.com.br/lp*` (modo *fail closed*).

---

## 5. O Worker proxy `/lp` — como funciona e por quê

Arquivo: `worker/lp-proxy-worker.js`. Resolve vários problemas ao servir um site pensado para a raiz (`/`) a partir de `/lp`:

1. **Remove o prefixo `/lp`** do caminho e busca no `meeky-site`. `/lp` e `/lp/` viram `/`.
2. **URLs sem `.html`**: se o último trecho do caminho não tem extensão (`/lp/Contato`), acrescenta `.html` ao buscar (`/Contato.html`).
3. **Reescrita de HTML** (via `HTMLRewriter`):
   - injeta `<base href="/lp/">` no `<head>` (sem isso, links relativos como `support.js` “perdem” o `/lp` e dão erro de MIME);
   - em `a[href]`, `link[href]`, `script/img/source/video[src]`: remove `.html` do final e, se o caminho for absoluto (`/algo`), prefixa `/lp`. Ignora `http(s)://`, `//`, `mailto:`, `tel:`, `javascript:`, `data:` e `#âncora`;
   - injeta, antes do `</body>`, um **script que corrige links criados dinamicamente pelo JavaScript do site** (o menu é montado em runtime) usando `MutationObserver`.
4. **Reescrita de JS/CSS/JSON**: troca `/assets/` por `/lp/assets/` (e `"/fonts/`, `"/images/`, `"/img/`, `"/static/`, `"/media/` análogos) porque o bundle referencia imagens por caminho absoluto. Remove `content-encoding`/`content-length` ao reescrever.
5. Demais respostas (imagens, vídeo, glb…) passam direto.

**Limitações conhecidas:** caminhos absolutos montados dentro do JS por concatenação de string (fora de `/assets/` etc.) não são pegos. Se aparecer 404 em algum recurso, comece pelo console (F12 → Console/Network).

**Como publicar mudança no Worker:** Cloudflare → Workers & Pages → `meeky-lp-proxy` → *Edit code* → colar → *Deploy*. (Hoje não há `wrangler.toml`; o deploy é pelo painel. Se for migrar para CLI, a rota é `meeky.com.br/lp*` na zona `meeky.com.br`.)

---

## 6. Site da LP (`site-lp/`)

**Tecnologia:** HTML estático + um runtime próprio (`support.js`, aparece nos logs como `[dc-runtime]`).
- Páginas usam `<x-dc>` e componentes via `<dc-import name="Header">` / `<dc-import name="Footer">`. O runtime busca `./<Nome>.dc.html` em runtime.
- Arquivos: `index.html`, `Home.html` (**idêntico ao index.html**), `Produto.html`, `Sobre.html`, `Duvidas.html`, `Contato.html`, `Motion1.html`, `Header.dc.html`, `Footer.dc.html`, `support.js`, `meeky-form-modal.js`, `meeky-3d.js`, `image-slot.js`, `assets/` (~30 MB).

### 🔴 REGRA CRÍTICA: maiúsculas e minúsculas nos nomes de arquivo
A Cloudflare **diferencia** `Contato.html` de `contato.html`. Os links e o runtime usam exatamente:
`Contato.html`, `Duvidas.html`, `Home.html`, `Motion1.html`, `Produto.html`, `Sobre.html`, `Header.dc.html`, `Footer.dc.html` (inicial maiúscula) e `index.html` (minúsculo).
O export original do Netlify veio **tudo em minúsculo** → isso já causou 404 em todas as páginas internas e menu sumido. **Ao reempacotar/exportar, confira os nomes.** Há um script de verificação sugerido na seção 10.

### Outras regras do site
- O `<body>` de cada página **precisa abrir direto com `<x-dc>`**. Qualquer elemento inserido antes quebra a montagem do Header/Footer (aconteceu com o `<noscript>` do GTM — por isso ele fica **no fim do `<body>`**).
- Formulário: botões “Comprar agora” têm `href="https://meeky.com.br/checkout"`. O `meeky-form-modal.js` **intercepta o clique** nesses links (regex: `meeky.com.br/checkout | /pre-cadastro | #comprar`) e abre um modal “Garanta o seu Meeky” com um **formulário do GoHighLevel/LeadConnector** (iframe `api.leadconnectorhq.com/widget/form/CpduQRS40KxxCGUNOgLR`, script `link.msgsndr.com/js/form_embed.js`). Como o `href` é absoluto, o proxy não o altera. **Os leads vão para o CRM GoHighLevel, não para o Supabase.**
- Não há links `wa.me` no HTML; o encaminhamento ao WhatsApp, se existir, é feito dentro do fluxo do GoHighLevel (não verificado).
- 3D: `meeky-3d.js` carrega `assets/fone-meeky-v5.glb` com **three@0.184.0 via `esm.sh`**, decoders Draco (gstatic) e meshopt. Há também `assets/fone-meeky-v4.glb` (1,9 MB) possivelmente sem uso.

---

## 7. Rastreamento (pixels)

**Instalado na LP (todas as 7 páginas):**
- **GTM** `GTM-KWMG33GN` — script no topo do `<head>`; `<noscript>` no fim do `<body>`.
- **Meta Pixel** `1661170241699314` — `PageView` no `<head>`, antes do `support.js`.
- Sem banner de consentimento (os pixels disparam sempre).

**Existe no site principal mas NÃO na LP (pendente):**
- GA4 `G-DZYX7DKNFB` (Consent Mode v2)
- TikTok Pixel `CR3RISJC77U222FMO130`
- OpenAI Ads pixel `NM9Phga1JvFu2NYPWbDJUa`
- Google Merchant widget
- No site principal, GTM/GA4/Meta/TikTok/OpenAI só carregam **após consentimento** (banner “Cookies e Privacidade”). A LP não replica isso → **ponto de atenção LGPD**.

---

## 8. Site principal (Lovable) — `lovable-source/`

- **Stack:** React 18, Vite 5, TypeScript, Tailwind 3, shadcn/ui, React Router 6, TanStack Query, Supabase JS, Sentry. Build: `vite-react-ssg build` (pré-build: `scripts/generate-routes.ts`). Testes: Vitest + Playwright.
- **Rotas principais:** `/`, `/headphone-anc-meeky-f5-pro` (produto), `/sobre`, `/reviews`, `/faq`, `/blog` + ~25 posts, `/empresas` (B2B), `/contato`, `/checkout` (+`/checkout/pendente`, `/checkout/sucesso`), `/vip`, `/motion-1`, `/crosstraining`, páginas legais, painel admin (`/admin/login`, `/admin/cupons`, `/admin/parceiros`, `/admin/vip-leads`) e `/r/:slug` (link de afiliado, ex.: `/r/karling`).
- **Variáveis** (`.env` **não foi incluído** por conter chaves): ver `lovable-source/.env.example` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SENTRY_DSN`… Peça ao responsável (conta Lovable/Supabase).
- **Roadmap do Lovable** (`roadmap.md`): /vip reconfigurável por evento (tabela `vip_events`, Race Valley 12–13/09/2026), botão “Comprar agora” na /vip → checkout, card Motion 1 → `/motion-1` (captura de interesse).

### Backend (Supabase) — `lovable-source/supabase/`
**Edge Functions (28):** `process-payment`, `create-checkout`, `mercadopago-webhook`, `claim-purchase-event`, `melhor-envio-shipping`, `notify-tracking`, `tiny-stock-webhook`, `upsert-abandoned-checkout`, `get-abandoned-checkout`, `send-abandoned-checkout-emails`, `send-exit-intent-email`, `create-exit-intent-lead`, `process-email-queue`, `send-transactional-email`, `preview-transactional-email`, `handle-email-suppression`, `handle-email-unsubscribe`, `admin-auth`, `admin-coupons`, `validate-coupon`, `partner-stats`, `partner-redirect`, `reprocess-order`, `get-public-config`, `vip-leads-list`, `mcp` (gerada pelo Lovable; expõe `get_product_info`), `tmp-mp-audit` (temporária), `_shared/` (`order-fulfillment.ts`, `conversion-tracking.ts`…).

**Integrações externas e nomes dos secrets** (valores ficam nos *Secrets* do Supabase — nunca no código):

| Serviço | Para quê | Secrets |
|---|---|---|
| Mercado Pago | Cartão/Pix, Checkout Pro, webhook | `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_WEBHOOK_SECRET` |
| Melhor Envio | Etiquetas e rastreio | `MELHOR_ENVIO_TOKEN` |
| Tiny ERP | Estoque e envio de pedidos | `TINY_API_TOKEN`, `TINY_TOKEN`, `TINY_WEBHOOK_SECRET` |
| Resend | E-mails transacionais e recuperação de carrinho | `RESEND_API_KEY` |
| Meta Conversions API | Purchase server-side | `META_ACCESS_TOKEN` |
| GA4 Measurement Protocol | Conversão server-side | `GA4_MEASUREMENT_ID`, `GA4_API_SECRET` |
| TikTok Events API | Conversão server-side | `TIKTOK_EVENTS_API_ACCESS_TOKEN` |
| OpenAI Ads Conversions API | Conversão server-side | `OPENAI_ADS_API_KEY` |
| ViaCEP | CEP → endereço (navegador) | — |
| Google Customer Reviews | Opt-in pós-compra | Merchant ID `5766308264` |

**Banco (principais tabelas):** `orders`, `order_status_history`, `webhook_events`, `coupons`, `partner_links` (+`_events`, `partner_access_tokens`, `partner_payments`), `abandoned_checkouts`, `leads`, `vip_leads`, `motion1_interest`, `warranty_leads`, `vip_events`, `product_stock`, `email_send_log/state`, `suppressed_emails`, `email_unsubscribe_tokens`, `events`, `page_views`, `qr_scans`, `rate_limits`.
- RLS: `vip_leads` aceita INSERT público (anon) com validação de tamanho dos campos; `leads` só é gravável via service role (Edge Function).

> **O backend do Lovable NÃO está conectado à LP.** Foi copiado apenas como referência. Se um dia a LP precisar gravar leads no Supabase, o caminho mais simples é um `fetch` para a REST API do Supabase na tabela `vip_leads` (campos: `name`, `whatsapp`, `email`, `source`, `utm_source`, `utm_medium`, `utm_campaign`) — mas hoje os leads vão para o GoHighLevel.

---

## 9. Modelo 3D

Gerado no **Tripo Studio** a partir de fotos do fone. A IA deformou a lateral com botões/LED/microfone; foi corrigida à mão no **Blender 5.2** (sculpt: Flatten/Fill/Smooth, comparando com fotos reais) e a textura preta foi repintada onde esticou. O `.glb` foi otimizado com `gltf-transform` (Draco + textura 4096→2048, **sem simplificar a malha**: 957.859 triângulos / ~501 mil vértices): 28,3 MB → 2,8 MB. Textura única 2048². Arquivo no site: `assets/fone-meeky-v5.glb` (não incluído nesta versão leve).

---

## 10. Procedimentos

### Atualizar a LP
1. Edite os arquivos de `site-lp/` **na pasta completa do usuário** (a versão leve não tem `assets/`; copie aqui só os HTML/JS alterados de volta para a pasta completa).
2. **Valide os nomes** (rode antes de zipar):
   ```bash
   cd site-lp && for f in Contato Duvidas Home Motion1 Produto Sobre; do [ -f "$f.html" ] || echo "FALTA $f.html"; done
   for f in Header Footer; do [ -f "$f.dc.html" ] || echo "FALTA $f.dc.html"; done
   ls | grep -E '^[a-z].*\.html$' | grep -v '^index.html$'   # não deve listar nada (todo .html em minúsculo, exceto index, é suspeito)
   ```
3. Cloudflare → Workers & Pages → **`meeky-site`** → *New deployment* → arrastar **os arquivos** (não o .zip) → *Deploy*.
4. Teste `meeky.com.br/lp` com **Ctrl+Shift+R**; clique em Produto, Sobre, Dúvidas, Contato; F12 → Console sem 404.
5. Não é preciso mexer no `meeky-lp-proxy`.

### Atualizar o Worker proxy
Editar `worker/lp-proxy-worker.js` → colar em *Edit code* do `meeky-lp-proxy` → *Deploy* → testar `/lp` e uma página interna.

### Site principal
Alterações são feitas no Lovable (que sincroniza com o GitHub → Cloudflare Pages). Não edite o `lovable-source/` esperando que publique sozinho.

---

## 11. Estado atual e pendências

**Feito:** modelo 3D corrigido/otimizado · LP no ar em `meeky.com.br/lp` via proxy · GTM + Meta Pixel na LP · correção dos nomes de arquivo (maiúsculas) **gerada** (`meeky-site-corrigido.zip`) e enviada ao `meeky-site`.

**Pendente / a verificar:**
1. Confirmar em produção que Produto, Sobre, Dúvidas, Contato e Motion1 abrem em `/lp` com menu e rodapé (após o deploy corrigido).
2. **Performance mobile (PageSpeed):** FCP 5,6 s · **LCP 40,4 s** · Speed Index 6,4 s (TBT 30 ms e CLS 0 estão bons). Suspeitas, em ordem: visualizador 3D (three via esm.sh + glb + Draco) carregando na abertura; `assets/motion-noturno.webp` com **13,5 MB**; outros webp de 1–1,7 MB. Ideias: poster/imagem estática no lugar do 3D e carregar o 3D só ao rolar/tocar; comprimir/redimensionar os webp; `loading="lazy"`; remover `fone-meeky-v4.glb` se não usado.
3. Pixels faltantes na LP (GA4, TikTok, OpenAI Ads) e **banner de consentimento/LGPD**.
4. Eventos de conversão: a LP só dispara `PageView`. Considerar evento `Lead` no envio do formulário GoHighLevel (Meta/GTM).
5. Favicon: a LP usa o ícone genérico — falta `favicon.ico` + `<link rel="icon">`.
6. `Home.html` duplica `index.html` — decidir se mantém (o menu “Home” aponta para ele).
7. Verificar o encaminhamento ao WhatsApp após o formulário (feito no GoHighLevel?).
8. O código da LP pede `.image-slots.state.json`, que não existe na pasta (parece ser um arquivo opcional do editor onde o site foi criado). Se aparecer 404 desse arquivo no console, é inofensivo. A pasta também traz o `LEIA-ME.txt` do export original.

---

## 12. Regras de trabalho para o Claude Code

- **Pergunte antes de publicar** qualquer coisa (deploy, rota, DNS). Mostre o que vai mudar.
- **Não toque** no site principal (`meeky-focus-control`), nos registros MX/NS/TXT, nem no `.env`/secrets.
- **Nunca** cole tokens/chaves em arquivos versionados.
- Ao alterar a LP: preserve a regra do `<x-dc>` como primeiro filho do `<body>` e a grafia dos nomes de arquivo.
- Ao diagnosticar “página quebrada”: peça/olhe primeiro o **Console e a aba Network (F12)** — quase sempre é 404 por caminho/maiúscula ou MIME por link relativo.
- Após qualquer deploy, lembrar o usuário de testar com **Ctrl+Shift+R** (cache de CDN/navegador).
- Respostas curtas, em português, com passo a passo quando envolver painel da Cloudflare (o usuário costuma enviar prints).


---

## 13. Site da LP como principal em meeky.com.br (atualização)

- Novo código do Worker: `worker/meeky-router-worker.js` (vai no Worker `meeky-lp-proxy`, rota `meeky.com.br/*`).
  O código antigo (só `/lp`) continua em `worker/lp-proxy-worker.js` para voltar atrás.
- Regras: `/` e páginas do site-lp → `meeky-site`; `/lp/...` → 301 para a raiz; páginas antigas da loja com
  equivalente (`/sobre`, `/faq`, `/headphone-anc-meeky-f5-pro`, `/blog/<slug>`…) → 301 para a página nova;
  `/checkout` (antigo, links dos e-mails), `/admin`, `/r/`, `/vip`, `/termos`, `/privacidade`, arquivos do app
  etc. → loja (`meeky-focus-control.pages.dev`); qualquer coisa que não exista no site novo → loja.
- Checkout do site: `Checkout.html` (cópia do checkout da loja, mesmo backend) — fonte em `lp-checkout-src/`.
- Aviso de venda ao GHL: `lp-checkout-src/src/saleWebhook.ts` (Inbound Webhook, 1x por pagamento aprovado).
