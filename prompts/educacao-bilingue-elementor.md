# Prompt — Página "Educação Bilíngue" (Elementor)

Implemente a página "EDUCAÇÃO BILÍNGUE" no Elementor. Siga o CLAUDE.md (tokens, globais, .hs-btn,
.hs-ribbon, header/footer e template "CTA Agende sua visita").

## PASSO 0 — Corrigir a hero da página "A Escola"
Antes de tudo, refaça a hero da página A Escola (Figma frame 3718:6996, seção Hero) seguindo
o checklist de HERO abaixo, e compare com o Figma até ficar igual.

## Figma
https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3746-9863
get_design_context POR SEÇÃO (nunca o frame inteiro). IGNORE tudo com hidden="true"
(menu 3816:64, balões/elipse/textos da hero, 3816:111, 3816:221, 3816:247, componentes locais).
Baixe imagens e ícones (Lucide) direto do Figma, webp, Biblioteca de Mídia. Uma vez cada.

Seções:
1. 3816:84  HERO — foto "teacher" + transição azul. Tag "PORTUGUÊS + INGLÊS • JANEIRO DE 2027",
   H1 "Aprender o mundo. Em duas línguas.", texto, botão "Agende uma visita".
2. 3816:99  HEBRAICA LANGUAGE CENTER / ENGLISH LAB — texto à esquerda ("Inglês vivido nas experiências
   da infância.", destaque + parágrafo), foto arredondada à direita.
3. 3816:107 ABORDAGEM CLIL — título central "Conteúdo e língua, integrados às descobertas.";
   foto à esquerda + 2 cards com ícone (Inglês nas experiências / Explorar, expressar e construir);
   faixa horizontal com ícone "Content and Language Integrated Learning — Aprendizagem Integrada
   de Conteúdo e Língua". Esta seção TEM a faixa "Educação bilíngue" em curva (grupos 3827:10606 e
   3827:10610, vetor + text-path): reutilize .hs-ribbon da Home com a curva exportada destes vetores,
   atrás do conteúdo, seção com overflow:hidden.
4. 3816:124 CINCO PILARES — título central "Cinco pilares, uma proposta integrada." + texto;
   foto com legenda "Brincar, investigar, criar e descobrir." à esquerda; lista com ícone + título +
   descrição e divisórias: CLIL, Play-Based Learning, Language Immersion, Experiential Learning,
   Child Development.
5. 3816:182 OS 4 Cs — título "Os 4 Cs da aprendizagem." + texto; grid 2×2 de cards com foto
   (3824:234, componente "C da aprendizagem com fotografia"); faixa de texto final 3816:282.
6. 3816:284 AGENDE SUA VISITA — template "CTA Agende sua visita" com a foto bil_visit.
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
