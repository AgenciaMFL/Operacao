Ajustes na página 20 (rascunho "De Volta pra Mim – LP"). Continua valendo: rascunho, nada publicado, nenhuma outra página alterada.

## 1. Bolinhas do cartão do ingresso
Os dois "recortes" nas pontas da linha tracejada do cartão do ingresso estão aparecendo como duas bolinhas claras por cima da borda do cartão. A cor delas não bate com o fundo e a sombra do cartão denuncia o círculo.
- Remova os dois círculos que estão sobrepostos.
- Faça um recorte DE VERDADE no cartão com CSS mask (dois radial-gradient transparentes de ~14px de raio, nas duas laterais, na altura exata da linha tracejada), para que o fundo da seção apareça pelo recorte, como num ingresso de papel. A sombra deve continuar acompanhando o formato (use filter: drop-shadow no container de fora em vez de box-shadow, se precisar).
- Se o recorte com mask não ficar perfeito em todos os navegadores (teste Chrome e Safari), remova os recortes e deixe só a linha tracejada. Nada de bolinha sobreposta.
- Confira em desktop, tablet e celular.

## 2. "21" aparecendo no hover dos botões
No hover, aparece "21" ao lado do texto do botão (ex.: "QUERO PARTICIPAR 21") em vez da seta.
- Causa provável: a seta foi feita com content: "\2192" e a barra invertida foi removida ao salvar (ficou "2192", cortado em "21"). Confirme lendo o CSS salvo.
- Corrija SEM depender de barra invertida no CSS: use o ícone nativo do botão do Elementor (seta para a direita do Font Awesome, posição "depois", espaço de 10px), escondido por padrão (opacity 0, translateX(-8px), largura 0) e aparecendo no hover (opacity 1, translateX(0)). Alternativa: content: "→" com o caractere literal.
- Verifique TODOS os botões da página (hero, programação, ingresso, ordem de prioridade, chamada final) em desktop e celular. Nenhum texto estranho pode aparecer, e o texto do botão não pode "pular" de lugar no hover.

## 3. Animações de entrada
Use as Animações de Entrada nativas do Elementor (Avançado → Efeitos de movimento → Animação de entrada), nos ELEMENTOS, não nas seções inteiras. O objetivo é uma página elegante e calma, sem exagero: duração "lenta" ou ~900ms, e atrasos (delay) em cascata de 120–150ms entre itens irmãos.

- Hero: selo → logo → título → frase → botão + info do Zoom com fadeInUp em cascata (atrasos 0, 120, 240, 360, 480ms). Foto da Daniela com fadeIn (atraso 200ms). A faixa do topo NÃO anima.
- Faixa de frases: sem animação de entrada (já se move).
- "Tá tudo certo…": título e parágrafos com fadeInLeft em cascata; bilhete com fadeInRight (atraso 300ms).
- "Talvez esteja faltando você…": textos com fadeInUp em cascata; foto com fadeIn.
- Cards de consequência: título fadeInUp; os 5 cards com fadeInUp em cascata (0, 120, 240, 360, 480ms); frase final fadeIn.
- Ordem de prioridade: título fadeInUp; as 7 pílulas com zoomIn em cascata rápida (80ms entre elas), "Você" por último; card esquerdo fadeInLeft, card direito fadeInRight; chamada final fadeInUp.
- Programação: título fadeInUp; foto zoomIn suave; card do sábado fadeInLeft, card do domingo fadeInRight; frase e botão fadeInUp.
- Para você / não é para você: card esquerdo fadeInLeft, card direito fadeInRight.
- Ingresso: cartão fadeInUp; preço "R$ 37" zoomIn (atraso 300ms).
- Daniela: foto fadeIn; card fadeInRight.
- Depoimentos: título fadeInUp; os 3 prints fadeInUp em cascata.
- FAQ: título fadeInUp; perguntas fadeInUp em cascata rápida (60ms).
- Chamada final: título, texto, frase e botão fadeInUp em cascata.

Regras:
- NO CELULAR, troque toda animação lateral (fadeInLeft/fadeInRight) por fadeInUp ou fadeIn. Animações laterais causam rolagem horizontal no celular. Garanta overflow-x: hidden no corpo da página e confirme que não há rolagem horizontal em 390px e 360px.
- Cada elemento anima uma vez só, quando entra na tela.
- Respeite @media (prefers-reduced-motion: reduce): sem animações de entrada (CSS no mesmo bloco de estilo dos botões, prefixado para esta página).
- Nada pode ficar invisível se a animação falhar: confira que todos os elementos aparecem ao rolar a página até o fim, em desktop e celular.

## Ao terminar
1. Me mande o link de visualização.
2. Prints: cartão do ingresso (desktop e celular) e um botão em hover.
3. Confirme: sem "21" nem texto estranho nos botões, sem bolinhas no ingresso, sem rolagem horizontal no celular, todos os elementos aparecendo.
