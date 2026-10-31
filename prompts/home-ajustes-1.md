# Prompt — Ajustes da Home (faixa, carrossel, animações, botões)

Ajustes na HOME da Hebraica School já implementada no Elementor. Siga o CLAUDE.md.
Figma (referência): https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3855-318
Leia no Figma SOMENTE os nós da faixa da seção Bilinguismo (não releia a página toda).

## 1. Faixa "Educação bilíngue" (seção Bilinguismo) — refazer
Problema atual: são duas faixas RETAS que se cruzam em "X", ficam cortadas no meio
e invadem a seção de baixo. Está errado.
Como deve ficar (igual ao Figma):
- UMA faixa só, CURVA/ONDULADA, atravessando a seção de ponta a ponta:
  entra pela esquerda na altura do botão "Conheça o bilinguismo", desce suavemente,
  passa POR TRÁS da foto (a foto fica na frente), e sobe de novo saindo pela direita.
- Faixa rosa/vermelha (hex do Figma), texto branco em negrito repetido
  "Educação bilíngue - Educação bilíngue - ...", seguindo a curva da faixa.
- Altura da faixa ~36px no desktop; o texto não pode ficar cortado nem sair da faixa.
Implementação:
- Um único SVG inline (widget HTML) com <path> curvo (stroke rosa grosso, stroke-linecap butt)
  e <text><textPath> sobre o mesmo path. Pegue o formato da curva do Figma
  (exporte o vetor da faixa como SVG se existir).
- Animar o texto andando ao longo da curva (startOffset animado, loop infinito, ~30s, linear).
- Posição: absolute dentro da seção Bilinguismo, width 100%, z-index ABAIXO da imagem e
  ACIMA do fundo; a seção com overflow:hidden para nada vazar para a seção de baixo.
- Tablet/mobile: mesma faixa escalando com viewBox (preserveAspectRatio="none" só se não deformar o texto;
  caso deforme, use uma versão mais simples da curva no mobile).

## 2. Carrossel "Nosso Espaço" — contínuo e infinito
- Rolagem automática CONTÍNUA (efeito esteira/marquee), velocidade constante, sem parar entre slides,
  em loop infinito sem "pulo" visível.
- Implementar com faixa de imagens duplicada + CSS @keyframes translateX(-50%) linear infinite
  (~40s). Pausar no hover (desktop).
- Manter visual do Figma: imagens com cantos arredondados, mesma altura, espaçamento igual,
  imagens cortadas nas bordas da tela.
- Remover as bolinhas de paginação (não fazem sentido em rolagem contínua).
- Use as imagens do Figma já na Biblioteca de Mídia.

## 3. Efeitos de entrada (suaves)
- Elementor → Avançado → Efeitos de movimento → Animação de entrada:
  - Títulos, textos e botões: "Fade In Up", duração "Lenta".
  - Imagens: "Fade In" (ou Zoom In bem leve).
  - Escalonar dentro de cada seção: tag 0ms → título 100ms → texto 200ms → botão 300ms.
- Hero: só fade in leve (sem deslocar o layout).
- Nada de animações exageradas (bounce, rotate, flash). Sem animar header e footer.
- Respeitar acessibilidade: @media (prefers-reduced-motion: reduce) desliga animações,
  a faixa e o carrossel.

## 4. Efeito nos botões principais
Botões: "Agende sua visita" (header), "Conheça o próximo passo", "Conheça nossa história",
"Conheça o bilinguismo", "Conheça a escola", "Quero conhecer a escola".
Hover (transição 0.3s ease):
- Botão sobe 2px (translateY(-2px)) + sombra suave.
- Botões cyan: escurecem levemente. Botões brancos: fundo vira cyan e texto branco.
- O círculo com a seta à direita gira/avança (rotate(45deg) ou translateX(3px)).
- Focus visível para teclado (outline).
Aplique via classe CSS (ex.: .hs-btn) e CSS global, não estilo por estilo em cada botão.

## Onde colocar o CSS
- Elementor Pro: Configurações do site → CSS personalizado.
- Elementor Free: Aparência → Personalizar → CSS adicional (ou um widget HTML com <style> no template global).

## Entrega
- Atualizar a página publicada (ou os .json) e o CLAUDE.md com as classes novas
  (.hs-btn, .hs-ribbon, .hs-marquee) para reuso nas outras páginas.
- Conferir desktop, tablet e mobile. Commit + push. Responder só com o resumo.
