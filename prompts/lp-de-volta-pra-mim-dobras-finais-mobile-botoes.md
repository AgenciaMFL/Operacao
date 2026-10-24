Vamos terminar a página 20 (rascunho "De Volta pra Mim – LP"). São 3 etapas, nesta ordem: (1) montar as 7 seções finais no desktop, (2) adaptar a página INTEIRA para tablet e celular, (3) aplicar um efeito premium em todos os botões.

Regras que continuam valendo: página em RASCUNHO, nada publicado, nenhuma outra página do site alterada, containers flexbox e textos editáveis. Imagens: baixe do Figma na maior resolução e suba na Biblioteca de Mídia pela API REST (variáveis WP_URL, WP_USER, WP_APP_PASSWORD; nunca mostre a senha), verificando antes se já existem. Nunca use URLs temporárias do Figma na página.

Padrões visuais (os mesmos das seções já feitas): creme #FBF8F3, bege #F3EBDD, papel #FFFDF8, marrom escuro #26190F, texto escuro #2B2118, texto corpo #4A3C2C, dourado #8A6420, dourado claro #E6C887, rosado #E3A99D, botão #C9860D. Títulos em Cormorant Garamond (com trechos em itálico dourado), textos em Montserrat. Conteúdo com largura máxima 1200px e padding lateral 64px, seções com ~127px de padding em cima e embaixo.

---

## ETAPA 1: 7 seções finais (desktop)

Para CADA seção: rode get_design_context e get_screenshot no node pelo MCP do Figma e use os valores exatos (fontes, tamanhos, cores, espaçamentos e TEXTOS — copie os textos do Figma, não digite de memória). O resultado precisa ficar igual ao print. Monte abaixo da seção "Essa é a ordem de prioridade da sua vida.", nesta ordem:

### 1. "Um fim de semana para se reencontrar." (programação)
https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6493-415
- ATENÇÃO: o frame tem uma área escura em volta. Implemente só a seção clara (fundo #FBF8F3); ignore o fundo escuro do canvas.
- Marca d'água grande "De Volta pra Mim" bem clarinha atrás do conteúdo (imagem do Figma, opacidade baixa).
- Título centralizado + foto (notebook com caderno "De Volta pra Mim", cantos arredondados). Suba como dvpm-foto-notebook-caderno.jpg.
- Dois cards lado a lado (fundo #F3EBDD, cantos arredondados): selo da data ("Sábado, 14/11" / "Domingo, 15/11", fundo #8A6420, texto branco) + rótulo da aula em dourado + título em Cormorant itálico + lista com marcador losango dourado.
- Frase final em Cormorant itálico centralizada (trecho "no trabalho e em casa." em dourado) + botão "Quero participar" (link #ingresso).

### 2. "Essa imersão é para você que" / "Ela não é para você se"
https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6493-485
- Fundo #F3EBDD. Card esquerdo maior (fundo #FFFDF8) com lista de checks (círculo #8A6420 com check branco — mesmo ícone da seção anterior). Card direito com borda tracejada dourada, título em itálico e lista com "X" em círculo rosado #E3A99D (mesmo ícone da seção anterior).

### 3. Cartão do ingresso (preço)
https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6493-543
- Dê a este container o ID CSS "ingresso" (Avançado → ID CSS). Assim todos os botões "#ingresso" da página rolam até aqui.
- Cartão branco centralizado (~560px), cantos arredondados, sombra suave. Topo: "INGRESSO", logo (dvpm-logo-de-volta-pra-mim.png, já na biblioteca), data com ícone de calendário (dvpm-icone-calendario, já na biblioteca).
- Linha tracejada separando o topo, com os "recortes" de ingresso (meio-círculos na cor do fundo nas duas pontas da linha).
- "VOCÊ RECEBE:" + lista de itens com preço riscado à direita, separados por linha fina; "Total:" com valor riscado.
- "POR APENAS" + preço grande "R$ 37" em Cormorant dourado.
- Botão largo "Quero meu ingresso". O link do checkout da Kiwify eu ainda não tenho: deixe "#checkout" e liste como pendência.
- Texto pequeno: "Pagamento seguro pela Kiwify, no Pix, no cartão ou no boleto".

### 4. "Eu também me perdi de mim" (sobre a Daniela)
https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6493-585
- Foto da Daniela falando ao microfone ocupando a seção como fundo (suba como dvpm-foto-daniela-microfone.jpg), com degradê creme na borda direita e embaixo, como no print.
- Card à direita, fundo #FBF8F3 levemente translúcido, cantos arredondados, sombra: "DANIELA MILHAZES" (rótulo), título com "de mim" em itálico dourado, parágrafos com negritos, e fecho em Cormorant itálico com "voltarem a ser quem Deus as fez pra ser." em dourado.

### 5. "Mulheres como você, que já passaram por um encontro com a Daniela" (depoimentos)
https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6493-609
- Título à esquerda ("com a Daniela" em itálico dourado).
- 3 prints de depoimentos lado a lado, alinhados embaixo e com alturas diferentes, como no Figma. Suba como dvpm-depoimento-1.jpg, dvpm-depoimento-2.jpg, dvpm-depoimento-3.jpg, com texto alternativo descrevendo o depoimento.

### 6. "Perguntas frequentes"
https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6493-619
- Fundo #F3EBDD, título "Perguntas / *frequentes*", lista de 8 perguntas (~570px de largura, centralizada) com linha fina entre elas.
- Use o widget Acordeão do Elementor (perguntas e respostas editáveis). Pergunta em Cormorant Garamond, resposta em Montserrat pequena, ícone de círculo dourado com "+" (fechado) e "–" (aberto) à direita.
- Primeira pergunta aberta, as outras fechadas. Abrir e fechar com animação suave.

### 7. "Você cuida de todo mundo. Agora é a sua vez." (chamada final + rodapé)
https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6493-702
- Fundo #26190F, tudo centralizado: título (2ª linha em itálico #E6C887), texto, frase em Cormorant itálico, botão "Quero meu ingresso" com fundo #E6C887 e texto #26190F (link #ingresso).
- Rodapé numa faixa mais escura: "© 2026 Daniela Milhazes · Imersão De Volta Pra Mim".

---

## ETAPA 2: adaptar a página INTEIRA para tablet e celular

Agora sim, configure os breakpoints de tablet (≤1024px) e celular (≤767px) em TODAS as seções, da hero até o rodapé. Não altere nada do desktop. Regras gerais:
- Nenhuma rolagem horizontal em nenhum tamanho. Teste em 1024, 768, 414, 390 e 360px.
- Colunas viram uma coluna só. Padding lateral: 32px no tablet, 20px no celular. Padding das seções: ~80px no tablet, ~64px no celular.
- Escala de fontes no celular: títulos de 72px → 40px, de 64px → 36px, de 55/48px → 32px, de 42px → 30px, de 40px → 28px, de 34/32px → 24px; texto 18px → 16px (altura de linha 1.6). No tablet, use valores intermediários.
- Botões com largura total no celular (altura mínima 56px, texto 15–16px), fáceis de tocar.

Por seção:
- Faixa do topo: fonte 11px, pode quebrar em duas linhas.
- Hero: no tablet e no celular, esconda a imagem de fundo section_dobra_1_hero e mostre a foto recortada da Daniela (dvpm-foto-daniela.png; suba se não estiver na biblioteca) ABAIXO do texto, centralizada, com o traço dourado atrás se ficar bom. Fundo #FBF8F3. Ordem: selo, logo (menor, ~150px), título, frase, botão, info do Zoom, foto. A etiqueta "Ninguém vai fazer isso por você." fica sobre a base da foto.
- Faixa animada: frases 22px, altura ~60px, animação um pouco mais rápida (~30s).
- "Tá tudo certo…": texto em cima, bilhete embaixo; bilhete com 100% de largura (máx. 400px), centralizado, mantendo a leve rotação; textos do bilhete ~28px.
- "Talvez esteja faltando você…": foto em cima (altura ~420px, com degradê creme embaixo), texto embaixo. Esconda os degradês laterais do desktop.
- Cards de consequência: 1 card por linha no celular (2 por linha no tablet, card 05 ocupando a linha toda); altura automática.
- Ordem de prioridade: as 7 pílulas quebram em várias linhas (com espaço entre linhas), a pílula "Você" sempre por último; os 2 cards empilhados; padding dos cards 28px.
- Programação: foto 100%; cards da aula empilhados.
- "Para você / não é para você": cards empilhados.
- Ingresso: cartão com 100% de largura; preço "R$ 37" ~64px.
- Daniela: foto em cima (altura ~460px), card embaixo sobrepondo um pouco a foto (margem negativa de ~-60px), sem transparência.
- Depoimentos: título em cima; prints em carrossel horizontal com rolagem por arraste (scroll-snap) OU empilhados com largura máx. 340px — o que ficar melhor. Sem cortar o texto dos prints.
- FAQ: 100% de largura; pergunta 20px.
- Chamada final: título 36px; rodapé com texto 12px, pode quebrar em duas linhas.

---

## ETAPA 3: efeito premium em TODOS os botões

Aplique em todos os botões da página (hero, programação, ingresso, ordem de prioridade, chamada final). Coloque a classe CSS "dvpm-btn" em cada botão e escreva o CSS uma vez só (CSS personalizado da página, se o Elementor Pro existir; senão, um widget HTML com <style> no topo da página). Tudo com prefixo .dvpm-btn, sem afetar o resto do site. Só CSS, sem JavaScript e sem plugin novo.

O efeito:
1. Fundo em degradê dourado (do #C9860D para um tom mais claro e quente, ex. #E0A42A), em vez de cor chapada. No botão claro da chamada final, use degradê de #E6C887 para #F3DDA8.
2. Brilho que atravessa o botão: uma faixa de luz diagonal (pseudo-elemento ::after com linear-gradient branco translúcido, inclinado) passa da esquerda para a direita a cada ~4s, sozinha, e também imediatamente no hover.
3. Hover: o botão sobe 3px (translateY(-3px)), cresce levemente (scale 1.02), a sombra dourada fica maior e mais intensa (glow), e o degradê desliza (background-position animado). Transição de ~0.35s com cubic-bezier suave.
4. Pulsação: um anel dourado suave expande e some em volta do botão principal da hero e do botão do ingresso (box-shadow animado, ciclo de ~2.5s). Só nesses dois, para não poluir.
5. Seta "→" que aparece no hover, deslizando da esquerda para a direita ao lado do texto (via ::before ou ícone do próprio botão do Elementor, depois do texto).
6. Clique/toque: afunda (scale 0.97) por um instante. No celular (hover: none), o brilho automático continua, mas sem o efeito de subir.
7. Acessibilidade: foco visível pelo teclado (outline dourado de 3px com espaço) e @media (prefers-reduced-motion: reduce) desliga brilho, pulsação e movimento.

---

## Ao terminar
1. Me mande o link de visualização.
2. Confira desktop (1920, 1440, 1366), tablet (1024, 768) e celular (414, 390, 360): sem rolagem horizontal, sem texto sobreposto, sem imagem cortada de forma errada. Mande prints do celular de cada seção.
3. Teste: todos os botões "#ingresso" rolam até o cartão do ingresso, o FAQ abre e fecha, e a faixa de frases anima sem emenda.
4. Liste diferenças em relação ao Figma e pendências (link do checkout da Kiwify, imagens etc.).
