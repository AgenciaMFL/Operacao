Crie uma página nova no WordPress do site onlysounds.com.br usando o MCP `only-sounds-elementor` e implemente nela a PRIMEIRA SEÇÃO (hero) do design do Figma abaixo. Siga estas instruções na ordem.

## 1. Página
- Título: **Escola**
- Slug: `escola`
- Template: Elementor Canvas (ou "Elementor Full Width" se o Canvas não existir), sem header/footer do tema.
- Status: **rascunho**. Não publique sem eu aprovar.

## 2. Referência do design
- Figma: https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3326-2735&m=dev
- Use o MCP do Figma (`get_design_context` / `get_screenshot` no node `3326:2735`) para conferir medidas, cores e textos antes de montar.
- O frame do Figma tem 2560px de largura. Converta para um contêiner de conteúdo de **1140px** no desktop, mantendo as proporções e os tamanhos de fonte abaixo.

## 3. Estrutura da seção (de cima para baixo)

### 3.1 Barra do temporizador (FIXA no topo)
- Fundo vermelho `#ED3838`, altura ~54px desktop / ~46px mobile, largura total.
- Esquerda: texto **"Oferta termina em:"** — Plus Jakarta Sans Bold, branco, ~20px (16px no mobile).
- Direita: contagem **"24h 19m 14s"** — Plus Jakarta Sans Bold, branco, ~23px (18px no mobile), números com `font-variant-numeric: tabular-nums`.
- **Comportamento:** a barra fica fixa no topo e acompanha a rolagem (`position: fixed; top: 0; z-index` alto). Ela deve aparecer acima de tudo, inclusive do vídeo. Compense a altura dela com padding no topo da página para não cobrir o hero. Se o usuário estiver logado no WP (admin bar), desloque a barra para baixo da admin bar.
- **Datas (horário de Brasília, UTC-3):**
  - Antes de 27/10/2026 00:00 → texto "Oferta começa em:" contando até 27/10 00:00.
  - De 27/10/2026 00:00 até 28/10/2026 23:59:59 → "Oferta termina em:" contando até 28/10 23:59:59.
  - Depois disso → "Oferta encerrada" e contagem zerada.
  - Formato em horas totais: `47h 12m 05s` (não converter para dias).
- Implemente em um widget **HTML** do Elementor com CSS e JS inline e leve (sem bibliotecas). Use `Date.parse("2026-10-27T00:00:00-03:00")` e `Date.parse("2026-10-28T23:59:59-03:00")`.

### 3.2 Hero
- Altura ~880px no desktop (ajustar ao conteúdo no mobile), conteúdo centralizado.
- **Fundo, em camadas:**
  1. **Vídeo de fundo em loop**, mudo, sem controles. O vídeo **já está na Biblioteca de Mídia do WordPress** com o nome **`hero-bg-720-1.webm`** (WebM, 1280x720, 30 s, ~90 KB). Busque esse arquivo na biblioteca de mídia pelo MCP (ex.: pesquisar por "hero-bg-720"), pegue a **URL pública** dele e use como fundo da hero:
     - Widget **HTML** posicionado absoluto cobrindo todo o contêiner da hero (atrás do conteúdo, `z-index` abaixo), com `<video autoplay muted loop playsinline preload="metadata">` e `<source src="URL_DO_hero-bg-720-1.webm" type="video/webm">`, `object-fit: cover; width: 100%; height: 100%`.
     - Se a biblioteca também tiver `hero-bg-720.mp4`, adicione como segunda `<source>` (type `video/mp4`) para Safari antigo. Se não tiver, siga só com o WebM.
     - Fallback: fundo do contêiner `#04102E` (azul-escuro) e, se existir na biblioteca, a imagem `hero-bg-poster.jpg` como `poster` do vídeo.
     - **No mobile (≤ 767px) não carregue o vídeo**: insira o `<video>` via JS só quando `matchMedia('(min-width: 768px)')` for verdadeiro; no mobile fica só o fundo de fallback.
     - Se não encontrar o arquivo na biblioteca, pare e me avise em vez de usar outro vídeo.
  2. Overlay preto a 10% sobre o vídeo.
  3. Foto do Rodrigo Suricato (exportar do Figma, layer `Foto_RodrigoSuricato`, node `3326:1163`) cobrindo o hero com **opacidade 17%**. Exportar em WebP, máx. ~200 KB.
  4. Brilhos azuis desfocados (os elipses do Figma): 2 círculos `#075AEE` de ~244px com blur ~300px atrás do vídeo central, e 2 elipses `#0084FF` de ~209x103px com blur ~300px nas laterais do botão. Fazer com CSS (`filter: blur()` ou `radial-gradient`), não com imagem.
- **Conteúdo (centralizado):**
  1. Logo OnlySounds (exportar do Figma, `Group 8`, node `3324:1098`, em SVG) — ~200px de largura no desktop, ~160px no mobile.
  2. Título H1: **"OnlySounds é direção artística para músicos que têm talento, mas ainda não sabem jogar."** — Plus Jakarta Sans, 36px desktop / 28px mobile, line-height 110%, branco, com o trecho **"ainda não sabem jogar."** em azul (cor do Figma). Largura máx. ~600px.
  3. Subtítulo: **"Uma escola única de refinamento artístico onde músicos desenvolvem visão, critério e identidade para tomar decisões conscientes no mundo REAL da música."** — 18px / line-height 26px desktop, 16px mobile, branco, com **"tomar decisões conscientes no mundo REAL da música."** em negrito (conferir os pesos no Figma). Largura máx. ~540px.
  4. **Vídeo principal** em moldura de vidro: retângulo externo `rgba(5,15,34,.37)` com backdrop blur ~15px, raio 24px, borda em degradê `#0067FF → #003E99`; dentro, o player com raio 24px. Desktop ~628x357px; no mobile 100% da largura, proporção 16:9.
     - Vídeo: YouTube `https://youtu.be/jGBQBmZxrrg`.
     - **Não carregar o YouTube no load da página.** Usar o widget Vídeo do Elementor com **Image Overlay** (thumbnail `https://img.youtube.com/vi/jGBQBmZxrrg/maxresdefault.jpg`, ou exportar a capa) + **Lazy Load** ligado + ícone de play, para o iframe só carregar no clique.
  5. Botão **"Entrar na OnlySounds"** — 321x57px, totalmente arredondado, fundo em degradê horizontal `#1652BD → #4B8CFF → #1652BD`, borda 1px em degradê branco→transparente, texto Plus Jakarta Sans Bold 18.5px branco. Link: `https://pay.kiwify.com.br/201xbLn` (abrir em nova aba).

## 4. Fontes
- Plus Jakarta Sans (Bold, ExtraBold) e Poppins (Regular, SemiBold). Se já estiverem no Kit do Elementor, use as globais; senão carregue via Google Fonts com `display=swap`.

## 5. Desempenho (obrigatório)
- Nada de vídeo de fundo do YouTube/Vimeo; só o `hero-bg-720-1.webm` da biblioteca de mídia.
- Imagens em WebP, com `loading="lazy"` em tudo que não for o hero.
- JS do temporizador e do vídeo inline, sem jQuery nem bibliotecas.
- Depois de montar, rode um teste rápido (PageSpeed ou Lighthouse no mobile) e me diga o LCP e o peso total da página.

## 6. Responsivo
- Desktop (≥ 1025px), tablet (768–1024px) e mobile (≤ 767px), usando os breakpoints do Elementor.
- No mobile: padding lateral de 20px, título 28px, vídeo 100% da largura, botão 100% da largura até 360px, barra do temporizador com textos menores numa linha só.
- Confira que não há rolagem horizontal em 375px.

## 7. Entrega
- Ao terminar, me mande o link de pré-visualização da página em rascunho e prints de desktop e mobile.
- Não altere nenhuma outra página do site.
