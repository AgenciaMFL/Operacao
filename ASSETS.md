# Assets

Todos os assets do design já foram resolvidos. Os ícones de interface
(sidebar, setas, checkmarks) são SVGs inline equivalentes ao Lucide — os
nomes usados no Figma batem exatamente com esse set de ícones.

As fotos e ilustrações abaixo vieram do arquivo do Figma:

| Arquivo | Onde aparece |
|---|---|
| `assets/icons/logo-sis.png` | Logo "SIS Mental Health" (hero e footer) |
| `assets/img/hero-figure.webp` | Hero mobile — grupo pessoa + dashboard com fundo teal já embutido (recortado da imagem enviada pelo usuário, cortando a faixa vazia acima E nas laterais do grupo para o conteúdo aparecer logo abaixo dos botões e maior), contido abaixo do texto centralizado (≤1180px) |
| `assets/img/hero-bg-notebook.webp` | Hero notebook (1181-1919px) — fundo completo enviado pelo usuário, já com o grupo pessoa+dashboard |
| `assets/img/hero-bg-wide.webp` | Hero wide (≥1920px) — fundo completo enviado pelo usuário, já com o grupo pessoa+dashboard |
| `assets/img/reuniao-corporativa.webp` | Seção 01 — imagem ao lado do texto |
| `assets/img/diagnostico-dashboard-mockup.webp` | Painel "Na prática, sua empresa precisa" (seção 01) — imagem de fundo full-bleed enviada diretamente pelo usuário (não veio do arquivo Figma), já com o gradiente teal e o mockup do dashboard embutidos. Usada em telas ≥721px (`.nr1-panel__bg`, cover à esquerda) |
| `assets/img/nr1-panel-mockup-mobile.webp` | Mesmo painel, telas ≤720px (`.nr1-panel__mockup`) — recorte da faixa inferior de uma imagem enviada pelo usuário (mockup + glow borrado duplicado já embutidos, mirrors Figma node 2926:685 "Mobile"), exibida como imagem flutuante de largura própria após o texto (não mais esticada como fundo do card inteiro), com uma máscara de gradiente no topo para dissolver a emenda com o fundo teal do card |
| `assets/img/climate-cta-bg.webp` | Fundo da banda "E se sua empresa também precisa entender o clima?" (seção 02.1) em telas 721-1024px (`<picture>` fallback) — enviada diretamente pelo usuário, já com a textura verde e o mockup do dashboard embutidos (mirrors Figma node 2933:729) |
| `assets/img/climate-cta-mockup-mobile.webp` | Mesma banda, telas ≤720px (`.climate-cta__mockup`) — recorte do mockup dentro de `climate-cta-bg.webp` (mirrors Figma node 2981:36 "Mobile"), com margem de teal/textura já embutida nas bordas para dissolver a emenda com o fundo sólido do card; exibida como imagem flutuante após o texto, no mesmo padrão de `.nr1-panel__mockup` (texto em fluxo normal no topo, mockup menor abaixo, sem esticar a imagem para cobrir o card inteiro) |
| `assets/img/climate-cta-bg-desktop.webp` | Mesma banda, telas ≥1025px (`<picture>` source) — versão enviada pelo usuário para o node Figma 2939:811, recorte mais baixo do mesmo mockup (substituída depois por uma segunda versão enviada pelo usuário, mesma resolução 2000x351, mockup levemente diferente) |
| `assets/img/trust-card-bg.webp` | Fundo full-bleed do card "Estivemos dos dois lados da mesa..." (fechamento da seção 05) — enviada diretamente pelo usuário, ícones metálicos + gradiente teal já embutidos |
| `assets/img/trust-band-bg.webp` | Fundo da seção 06 "Sigilo e LGPD" (Figma node 2951:995) — mãos segurando um tablet com um escudo, enviada diretamente pelo usuário, já exportada na mesma proporção do frame (2000x785 ≈ 2561x1005 do Figma). Em telas ≥1025px é exibida por inteiro (sem crop) como fundo full-bleed, com o texto posicionado por cima na faixa vazia reservada pelo próprio Figma; em telas ≤1024px (layout empilhado, texto acima da imagem) a faixa vazia é recortada via `object-fit:cover` já que nada mais fica sobreposto a ela |
| `assets/img/how-steps/how-step-01-identificar.webp` … `how-step-05-acompanhar.webp` | Ícones dos 5 passos da seção 03 — "Como funciona" |
| `assets/img/cta-bg-meeting.png` | Fundo do CTA final ("Descubra onde estão os riscos...") |
| `assets/img/laptop-mockup.webp` | Mockup do painel administrativo (seção 05 — "O que sua empresa ganha"), usado em telas ≥1025px |
| `assets/img/laptop-mockup-mobile.webp` | Mesmo mockup, recortado (via `<picture>`) para telas ≤1024px — o original tem um anel/wordmark decorativo com bleed quase todo à esquerda, o que empurrava visualmente o laptop para a direita numa caixa estreita; este recorte remove a maior parte dessa margem vazia |

Os assets `card-identificar.png`, `card-mapear.png`, `card-priorizar.png`,
`card-mitigar.png`, `card-monitorar.png`, `custo-nao-agir.webp` e
`custo-nao-agir-mobile.webp` foram removidos junto com a reescrita completa
da copy do site (seções "A lógica de proteção" e "O custo de não agir" não
existem mais na estrutura atual).

Link do arquivo: https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=2754-3
