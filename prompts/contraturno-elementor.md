# Prompt — Página "Contraturno" (Elementor)

Implemente a página "CONTRATURNO" no Elementor. Siga o CLAUDE.md (tokens, globais, .hs-btn,
header/footer e template "CTA Agende sua visita").

## Figma
https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3746-9875
get_design_context POR SEÇÃO. IGNORE tudo com hidden="true" (menu 3818:177; na hero: elipse,
relógio, "Informações com a nossa equipe", foto park, retângulos 15/16/17, título antigo
"Conheça o contraturno da Hebraica.", tag "CULTURA JUDAICA" e botão "Falar com a equipe"; componentes locais).
Baixe imagens e ícones direto do Figma. Uma vez cada.

Seções:
1. 3818:197 HERO — foto "park" full-width + transição azul à esquerda; texto 3888:654:
   tag "CONTRATURNO • CRIANÇAS DE 2 A 5 ANOS", H1 "Estendido Bilíngue (Tardes em Inglês)",
   texto, botão "Agende uma visita".
2. 3826:211 CONHEÇA A HEBRAICA SCHOOL — mosaico de 3 fotos à esquerda (1 grande + 2 menores);
   à direita "Acolher, cuidar, educar e brincar.", texto e 2 itens com ícone
   (Formação integral / Vínculos e pertencimento).
3. 3843:202 VIVÊNCIAS DA TARDE — "Uma tarde repleta de experiências." + texto; grid 2×2 de cards
   (foto em cima, ícone + título + subtítulo + texto embaixo); faixa "Alimentação e descanso
   também fazem parte." com ícone de relógio (3843:280).
   ATENÇÃO: no Figma os 4 cards repetem o mesmo texto ("Communication / Comunicação / Usar o inglês...").
   Use os nomes dos frames como títulos (Histórias e expressão, Criação e descoberta,
   Movimento e convivência, Autonomia e bem-estar), mantenha o texto do Figma e AVISE no resumo
   que esses textos precisam ser revisados.
4. 3818:214 MODALIDADES — "Informações para sua família." + texto; 3 cards de modalidade
   (Clubs, Part Time, Full Time — instâncias 3845:273/293/310, com horário / proposta / incluído);
   nota abaixo "Duas vezes por semana, com possibilidade de ampliar os dias...".
5. 3826:239 PRÓXIMO PASSO — "Vamos conversar sobre sua família?" + 3 etapas numeradas 01/02/03;
   faixa destaque "Muito além de um contraturno!" (3843:295).
6. 3894:647 AGENDE SUA VISITA — template CTA com a foto visit_ctr.
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
