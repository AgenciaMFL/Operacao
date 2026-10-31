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
