Vamos montar mais três seções na página 20 (rascunho "De Volta pra Mim – LP"), nesta ordem, logo ABAIXO da seção "Tá tudo certo na sua vida. Menos você.". Continua valendo: SOMENTE desktop (não altere breakpoints de tablet e mobile), página em rascunho, nada publicado, nenhuma outra página alterada, containers flexbox e textos editáveis (nada de widget HTML nestas seções).

Para cada seção, use o MCP do Figma (get_design_context e get_screenshot do node) para conferir medidas e textos. O resultado precisa ficar igual ao print do Figma.

Padrões que se repetem:
- Cores: creme #FBF8F3, bege #F3EBDD, papel #FFFDF8, marrom escuro #26190F, texto escuro #2B2118, texto corpo #4A3C2C, dourado #8A6420, dourado claro #E6C887, texto claro #F3EBDD / #E7DBC7, botão #C9860D.
- Texto corrido: Montserrat 18px, altura de linha 31.5px. Negrito = Montserrat Bold 700.
- Títulos: Cormorant Garamond (Medium 500 / Regular 400, com trechos em itálico).
- Respeite as quebras de linha do Figma.

---

## Seção A: "Talvez esteja faltando você dentro da vida que construiu."
Figma: https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6491-216

- Container de largura total, altura ~842px, fundo #FBF8F3, overflow escondido.
- Foto: Daniela no palco, de braços abertos (imagem do Figma, node "ae236fe6-0e4d-4783-8aa1-1420aeefd4ae 1"). Ocupa o lado direito: começa em x≈730px e vai até a borda direita (1264×842px), encostada embaixo.
  - Baixe do Figma na maior resolução, salve como dvpm-foto-palco-bracos-abertos.jpg e suba na Biblioteca de Mídia pela API REST (variáveis WP_URL, WP_USER, WP_APP_PASSWORD; nunca mostre a senha). Veja antes se já existe.
  - Use a foto como imagem de fundo de um container à direita (cover, alinhada à direita e embaixo).
  - Degradês por cima da foto, como no Figma: um da esquerda (#FBF8F3 opaco → transparente, ~380px de largura) para a foto sumir no texto, e um embaixo (#FBF8F3 → transparente, ~380px de altura). A foto fica clara e "lavada", como no print.
- Coluna de texto à esquerda, começando em x≈220px (largura ~500px), topo ~37px, com estes blocos e ~25px entre eles:
  1. Título, Cormorant Garamond Regular 42px, altura de linha 52.5px, cor #2B2118: "Talvez esteja faltando *você* dentro / da vida que construiu." ("você" em itálico, cor #8A6420).
  2. "A mulher que **tem vontades próprias.**"
  3. "Que ainda pode descobrir **novos interesses, fazer escolhas e encontrar motivos** para acordar animada com o que vem pela frente."
  4. "**Sua história não terminou** quando você se tornou mãe, esposa ou profissional."
  5. "Ainda existe **uma mulher inteira para conhecer, valorizar e viver.**"
  6. "Nos dias **14 e 15 de novembro,** na **Imersão De Volta Pra Mim,** vamos dar os primeiros passos para resgatar sua identidade, reconhecer o que faz sentido para você e voltar a viver com mais propósito."
  7. Fecho em Cormorant Garamond Italic 34px, altura de linha 42.5px: "Porque cuidar de tudo não deveria significar" (cor #2B2118) / "esquecer de quem você é." (cor #8A6420).
  Textos 2 a 6: Montserrat 18px / 31.5px, cor #4A3C2C.

---

## Seção B: "Talvez a sua vida esteja assim:" (cards de consequência)
Figma: https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6491-246

- Fundo #F3EBDD, padding 127px em cima e 128px embaixo. Conteúdo com largura máxima 1200px, centralizado, padding lateral 64px (largura útil 1072px). Espaço de 64px entre título, grade e frase final.
- Título (H2): Cormorant Garamond Medium Italic 72px, altura de linha 73.44px, espaçamento entre letras -1.08px, cor #2B2118: "Talvez a *sua vida* esteja assim:" ("sua vida" cor #8A6420).
- Grade de 5 cards, espaço de 20px entre eles:
  - Linha 1: 3 cards iguais (344px de largura, ~362px de altura).
  - Linha 2: 2 cards iguais (526px de largura, ~297px de altura).
  - Card claro: fundo #FFFDF8, borda 1px rgba(138,100,32,0.22), cantos 26px, padding 36px.
  - Dentro de cada card: número (Cormorant Garamond Regular 52px, altura de linha 52px, cor #8A6420), ~16px abaixo um rótulo (Montserrat SemiBold 600, 12px, MAIÚSCULAS, espaçamento 2.4px, cor #8A6420), ~18px abaixo o texto (Montserrat 18px / 31.5px, cor #4A3C2C).
  - Card 05 é ESCURO: fundo #26190F, sem borda; número e rótulo #E6C887; texto #E7DBC7.
  - Conteúdo:
    - 01 · NAS RELAÇÕES: "Você se doa até secar e depois se sente invisível dentro da própria casa. Mendiga um “obrigado” de quem você carrega nas costas."
    - 02 · NO CORPO: "Você dorme e acorda exausta. Vive em alerta, como se a qualquer momento tudo fosse desabar se você soltar."
    - 03 · NOS SONHOS: "Aquilo que era seu foi ficando pra depois até virar “bobagem”. Você fala dos seus sonhos no passado."
    - 04 · NOS FILHOS: "Eles estão aprendendo, olhando pra você, que amar é se anular. Sua filha está aprendendo agora, na sua frente, a desaparecer igual a você."
    - 05 · NO TEMPO: "Você prometeu “esse ano eu cuido de mim” em 2023, em 2024, em 2025. Mais um ano está acabando. Quantos ainda cabem nessa promessa?"
- Frase final (largura máx. 980px, 16px extra em cima): Cormorant Garamond Regular 48px, altura de linha 55.2px, cor #2B2118: "Você é uma mulher forte. Só que tem área da sua vida que está no automático há tempo demais, e" + nova linha em itálico, cor #8A6420: "força de vontade sozinha não tira você de lá."

---

## Seção C: "Essa é a ordem de prioridade da sua vida."
Figma: https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6491-288

- Fundo #26190F, padding 127px em cima e 128px embaixo. Conteúdo com largura máxima 1200px, centralizado, padding lateral 64px. Espaço de 72px entre os 3 blocos (cabeçalho, cards, chamada final).

### Bloco 1: cabeçalho
- Título (H2), largura 900px: Cormorant Garamond Medium 72px, altura de linha 73.44px, espaçamento -1.08px, cor #FBF8F3: "Essa é a ordem de prioridade da / sua vida. *Olha quem está no final.*" (trecho final em itálico, cor #E6C887).
- 36px abaixo, uma fileira de 7 pílulas, com 12px de espaço entre elas:
  - Pílula: borda 1px rgba(230,200,135,0.4), cantos 999px, padding 12px 24px 12px 12px, altura 56px, espaço de 12px entre número e palavra.
  - Número dentro de um círculo de 30px (fundo rgba(230,200,135,0.16), Montserrat SemiBold 13px, cor #E6C887). Palavra em Montserrat Medium 500, 16px, cor #F3EBDD.
  - Ordem: 1 Trabalho, 2 Filhos, 3 Casa, 4 Marido, 5 Família, 6 Igreja.
  - Pílula 7 "Você" em DESTAQUE: fundo e borda #E6C887; círculo do número com fundo #26190F e número #E6C887; palavra em Montserrat Bold 700, 18px, cor #26190F.

### Bloco 2: dois cards lado a lado (mesma largura, 24px de espaço, mesma altura ~610px)
- Card esquerdo: sem fundo, borda 1px rgba(230,200,135,0.3), cantos 30px, padding 48px, 28px entre título e lista.
  - Título (H3): Cormorant Garamond Medium 40px, altura de linha 44px, cor #FBF8F3: "Hoje, a mulher que decide / a sua vida…"
  - Lista com 18px entre itens, ícone de 26px + 14px de espaço + texto Montserrat 18px, altura de linha 27.9px, cor #F3EBDD.
  - Ícone: "X" dentro de um círculo vazado, cor #E3A99D (use o widget Lista de Ícones com um ícone de x em círculo, contorno, cor #E3A99D, 26px).
  - Itens: "Diz sim antes de pensar e se cobra por isso depois" · "Carrega responsabilidades que nunca foram dela" · "Sente culpa quando tira um tempo livre pra si mesma" · "Leva no automático a área da vida que não vai bem" · "Vive pela aprovação dos outros e tem medo de desagradar"
- Card direito: fundo #F3EBDD, cantos 30px, padding 48px.
  - Título (H3): Cormorant Garamond Medium 40px, altura de linha 44px, cor #2B2118: "A mulher que volta pra si…"
  - Mesma lista, texto cor #2B2118. Ícone: check branco dentro de círculo cheio #8A6420, 26px (Lista de Ícones com ícone de check em círculo, sólido, cor #8A6420).
  - Itens: "Não diz “sim” pra tudo e todos." · "Coloca limite sem precisar se justificar" · "Saber o que quer viver, não apenas o que precisa fazer" · "Tem projetos que façam seus olhos brilharem novamente." · "Para de decidir pensando no que os outros vão dizer" · "Se posiciona em casa, no trabalho e nas relações" · "Reconhece os próprios dons e tem coragem de usá-los"

### Bloco 3: chamada final (centralizada)
- 40px de espaço extra em cima.
- Título: Cormorant Garamond Medium 64px, altura de linha 69.12px, espaçamento -0.96px, centralizado, cor #FBF8F3: "O que Deus colocou em você que você" / "*ainda não teve coragem de viver?*" (2ª linha em itálico, cor #E6C887).
- Texto (largura máx. 640px), ~28px abaixo: Montserrat 18px / 31.5px, centralizado, cor #E7DBC7: "Quando você volta pra você, essa coragem volta junto, inclusive a de buscar mais pra sua vida."
- Botão, ~24px abaixo, centralizado: "Quero reencontrar meu propósito". Fundo #C9860D, texto #26190F, Montserrat Bold 700, 18px, MAIÚSCULAS, espaçamento 1.2px, padding 22px 40px, altura mínima 58px, cantos 999px, sombra 0 16px 32px -16px rgba(0,0,0,0.6). Hover: clarear um pouco o fundo. Link: "#ingresso".

---

## Ao terminar
1. Me mande o link de visualização.
2. Confira em 1920, 1440 e 1366px: sem sobreposição de texto, cards da seção B e C alinhados, as 7 pílulas em uma linha só.
3. Compare cada seção com o print do Figma e liste diferenças e pendências.
