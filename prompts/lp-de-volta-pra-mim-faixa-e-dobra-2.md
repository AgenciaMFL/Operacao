Agora vamos montar mais duas seções na página 20 (rascunho "De Volta pra Mim – LP"), logo ABAIXO da hero. Continua valendo: SOMENTE desktop (não altere breakpoints de tablet e mobile), página em rascunho, nada publicado, nenhuma outra página alterada, containers flexbox e textos editáveis.

Use o MCP do Figma para conferir medidas e o print de cada node. O resultado precisa ficar igual ao Figma.

## Seção 1: faixa animada de frases
Figma: https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6483-38

- Faixa de largura total, fundo #8A6420, altura 83px, conteúdo centralizado na vertical, overflow escondido.
- Frases, nesta ordem, separadas por um losango dourado (quadrado de 8×8px, cor #E6C887, girado 45°), com 36px de espaço de cada lado do losango:
  1. “eu choro no banho pra ninguém ouvir”
  2. “eu não lembro a última vez que fiz algo por mim”
  3. “ninguém pergunta como eu tô”
  4. “eu não sei mais do que eu gosto”
- Texto: Cormorant Garamond Medium Italic (500 itálico), 32px, cor #FBF8F3, sem quebra de linha. Mantenha as aspas curvas “ ”.
- ANIMAÇÃO: as frases rolam continuamente da direita para a esquerda, em loop infinito e sem emenda visível (letreiro / marquee).
  - Repita a sequência de frases (com um losango entre o fim e o começo) o suficiente para nunca aparecer espaço vazio, e anime com CSS @keyframes usando translateX de 0 até -50% (duas cópias idênticas lado a lado).
  - Velocidade suave, de leitura: cerca de 40s por volta. Deixe a duração fácil de ajustar (variável CSS --duracao).
  - Pausar a animação quando o mouse passar por cima.
  - Respeitar @media (prefers-reduced-motion: reduce): sem animação.
  - Use só CSS. Nada de JavaScript nem plugin novo.
- Como o Elementor não tem letreiro nativo, pode usar um widget HTML só para esta faixa, com CSS com prefixo próprio (por exemplo .dvpm-marquee) para não afetar o resto do site. Coloque as frases no HTML de um jeito fácil de editar (uma por linha).

## Seção 2: "Tá tudo certo na sua vida. Menos você."
Figma: https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6490-92

Container de largura total, fundo #FBF8F3, altura ~756px. Conteúdo centralizado com ~1182px de largura (no Figma vai de x=369 a x=1551 numa tela de 1920), padding de ~115px em cima. Duas colunas: texto à esquerda, lista à direita.

### Coluna esquerda (largura ~558px)
1. Título (Heading H2), espaçamento entre letras -1.08px:
   - Linha 1: "Tá tudo certo na sua vida." Cormorant Garamond Medium 500, 55px, altura de linha 1.2, cor #2B2118.
   - Linha 2: "Menos você." Cormorant Garamond Medium Italic 500, 72px, altura de linha 73.44px, cor #8A6420.
2. Bloco de texto (largura 516px), começando ~30px abaixo do título, parágrafos com 14px de espaço entre eles. Montserrat 18px, altura de linha 31.5px, cor #4A3C2C. Trechos em **negrito** com Montserrat Bold 700:
   - "Você construiu uma família, assumiu responsabilidades, **conquistou coisas que um dia desejou.**"
   - "Mas, em algum momento, **deixou de reconhecer a mulher que existe por trás de tudo isso.**"
   - "Você sabe o que seus filhos gostam, o que seu marido precisa, o que esperam de você no trabalho."
   - "**Mas já não sabe dizer o que faz seus próprios olhos brilharem.**"
   - "Aquela mulher que tinha sonhos, interesses, planos e vontade de experimentar a vida **foi ficando para depois.**"
   Respeite as quebras de linha do Figma onde forem intencionais (por exemplo, a 1ª e a 2ª frase quebram antes do trecho em negrito).

### Coluna direita: "lista feita à mão" (papel de bilhete)
- Cartão de 440px de largura (~534px de altura), fundo #FFFDF8, borda 1px rgba(138,100,32,0.2), cantos 6px, padding 52px em cima, 40px embaixo, 34px nas laterais.
- Sombra: 0 30px 50px -28px rgba(60,40,10,0.45), 0 2px 0 0 rgba(138,100,32,0.08).
- Cartão GIRADO -2.2° (Avançado → Transformar → Rotação).
- Fita adesiva no topo: retângulo de 116×32px, cor rgba(214,190,140,0.72), girado -3°, centralizado e metade para fora do cartão (top ≈ -19px). Use posição absoluta.
- Fonte de tudo no cartão: Caveat Bold, cor #3A2E22.
- Título centralizado, 46px, altura de linha 46px: "Tudo em dia · esta semana" (o "·" na cor #8A6420), quebrando em duas linhas como no Figma ("Tudo em dia · esta" / "semana").
- Linhas da lista, cada uma com altura mínima de 50px, linha de baixo 1px sólida rgba(138,100,32,0.26), texto de 34px (altura de linha 34px), item à esquerda e resposta + check à direita (espaço de 6px entre resposta e check, check de 30×30px):
  1. "Mercado do mês:" → "feito ✓"
  2. "Lição dos filhos:" → "conferida ✓"
  3. "Remédio do filho:" → "8 em 8 horas ✓" ("8 em 8 horas" quebra em duas linhas como no Figma)
  4. "Conta de luz:" → "paga ✓"
  5. "Contato de emergência:" (em duas linhas) → "eu mesma ✓"
  6. "O que eu quero pra mim:" na cor #8A6420, linha de baixo TRACEJADA 1px rgba(138,100,32,0.55), sem resposta.
- Os checks são SVGs do Figma (há 4 variações; o do "eu mesma" é diferente). Baixe do Figma, converta para PNG com fundo transparente em 2x (60×60px), e suba na Biblioteca de Mídia pela API REST do WordPress com as variáveis WP_URL, WP_USER e WP_APP_PASSWORD (nunca mostre a senha). Nomes: dvpm-check-1.png, dvpm-check-2.png, dvpm-check-3.png, dvpm-check-eu-mesma.png. Antes de enviar, veja se já existem para não duplicar.
- Coluna direita começa em x≈1049px numa tela de 1920 (cerca de 120px depois do fim da coluna de texto).

## Fontes
Adicione Caveat (700) às fontes já usadas (Montserrat e Cormorant Garamond, incluindo Cormorant Garamond 500 e 500 itálico).

## Ao terminar
1. Me mande o link de visualização.
2. Confira em 1920, 1440 e 1366px: a faixa precisa rolar sem emenda e sem espaço vazio, e a seção 2 não pode ter sobreposição de texto.
3. Compare com os prints do Figma e liste diferenças e pendências.
