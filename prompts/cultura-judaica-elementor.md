# Prompt — Página "Cultura Judaica" (Elementor)

Implemente a página "CULTURA JUDAICA" no Elementor. Siga o CLAUDE.md (tokens, globais, .hs-btn,
header/footer e template "CTA Agende sua visita").

## Figma
https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3746-9868
get_design_context POR SEÇÃO. IGNORE tudo com hidden="true" (menu 3817:109; na hero: elipse,
estrela, "Uma cultura vivida todos os dias", título antigo 3817:131, vetores, foto park, botão antigo;
3817:241, 3817:281, 3817:322, 3817:328, componentes locais).
Baixe imagens e ícones/estrela de Davi (SVG) direto do Figma. Uma vez cada.

Seções:
1. 3817:129 HERO — foto "jud_hero" + transição azul; texto do grupo 3871:2000:
   tag "CULTURA JUDAICA", H1 "Pertencimento e identidade.", texto, botão "Agende uma visita".
2. 3817:145 NOSSA ESSÊNCIA — "Raízes que aproximam e fortalecem vínculos." + 2 parágrafos,
   foto alta arredondada à direita.
3. 3817:153 NO COTIDIANO — foto à esquerda; "Uma cultura vivida todos os dias." + 3 parágrafos.
4. 3817:162 TRADIÇÕES — título central "Tradições que atravessam gerações." + 3 cards
   "Tradição e vivência" (3817:173) com foto, título e texto.
5. 3817:192 VALORES JUDAICOS — título "Valores que ganham vida nas relações." + texto;
   grid 2×2 "Valor com fotografia" (3825:222: Chesed, Tzedek, Kehilá, Tikkun Olam — confira no Figma);
   faixa de compromisso com estrela de Davi + texto (3825:308).
6. 3817:327 AGENDE SUA VISITA — template CTA com a foto do frame 3894:640.
7. Footer global.

## HERO — conferir antes de seguir (obrigatório)
Na página "A Escola" a hero saiu errada; não repita o erro. Como as heros são montadas no Figma:
- Fundo = UMA foto visível (camada "Hero • fotografia ...") encostada à DIREITA e com sangria até a borda,
  + camadas "Transição azul • fotografia" = degradê navy (#022169) sólido à esquerda que se dissolve
  na foto. O texto fica sobre a parte navy, alinhado ao grid de 1280px (não colado na borda).
- IGNORE as camadas ocultas da hero (balões, elipses, símbolos, fotos e textos antigos com hidden="true").
- Implementação: container full-width, altura ~740px desktop, background-image da foto
  (position: right center, size: cover) + overlay com linear-gradient(90deg, #022169 0%, #022169 35%,
  rgba(2,33,105,0) 65%). Ajuste os stops até ficar igual ao Figma. Header NÃO sobrepõe a hero.
- Tag pequena cyan em caixa alta → H1 branco em 2 linhas → texto branco → botão cyan .hs-btn.
- VERIFICAÇÃO: tire get_screenshot do nó da hero no Figma e um screenshot da página publicada
  (Playwright, 1440px e 390px de largura). Compare: posição da foto, onde termina o degradê,
  altura, alinhamento do texto, quebra do título, tamanho do botão. Corrija até bater.
- Mobile: bloco navy com o texto em cima e a foto embaixo (mesmo padrão da Home, frame 3932:592).

## Regras
- Containers Flexbox, cores/fontes globais, botões .hs-btn, animações de entrada suaves como na Home
  (respeitando reduced-motion), cards com hover leve (sobe 4px + sombra).
- Responsivo desktop/tablet/mobile. Textos exatamente como no Figma.

## Entrega
- Publicar a página via API (slug igual ao nome) ou gerar elementor/<pagina>.json.
- Atualizar o CLAUDE.md. Commit + push. Responder só com o resumo (incluindo pendências de texto).
