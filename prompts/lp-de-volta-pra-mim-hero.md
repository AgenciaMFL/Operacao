Implemente no Elementor do WordPress a primeira dobra (HERO) da landing page "Imersão De Volta pra Mim", seguindo fielmente este design do Figma:

https://www.figma.com/design/oYaBpBEKB2pBOBYiPpzlil/MY-MIND?node-id=6487-36&m=dev

## Ferramentas
- Use o MCP do Figma (get_design_context e get_screenshot no node 6487:36) para conferir medidas, cores e textos. O print do Figma é a referência visual: o resultado precisa ficar igual.
- Use o MCP do Elementor para criar e editar a página. Antes de começar, liste as ferramentas do MCP do Elementor e me diga quais vai usar.

## Regras
- Crie uma página NOVA como RASCUNHO, com o título "De Volta pra Mim – LP". Não publique e não altere nenhuma outra página do site.
- Use o template "Elementor Canvas" (ou "Elementor Full Width" se o Canvas não existir), sem cabeçalho e rodapé do tema.
- Monte com Containers (Flexbox) do Elementor, não com seções/colunas antigas e não com um único widget HTML. Os textos precisam ficar editáveis no Elementor.
- A imagem da hero (foto da Daniela) JÁ ESTÁ na Biblioteca de Mídia do WordPress. Procure por ela e use essa. Se não achar, pare e me pergunte o nome do arquivo.
- Os outros elementos visuais (logo "De Volta pra Mim", foto de fundo da palestra, traço dourado em forma de coração, ícone de calendário) devem ser baixados do Figma e enviados para a Biblioteca de Mídia. Se o MCP do Elementor não conseguir enviar arquivos, me avise e liste quais eu preciso subir manualmente (com os nomes dos arquivos). Nunca use URLs temporárias do Figma (figma.com/api/mcp/asset/...) na página.
- O link do botão "Quero meu ingresso" eu ainda não tenho: use "#ingresso" por enquanto.

## Estrutura da dobra (desktop, 1920px de largura)

### 1. Faixa do topo
- Largura total, fundo #26190F, padding 13px 20px, texto centralizado.
- Texto: "14 e 15 de novembro · Ao vivo e online pelo Zoom"
- Montserrat SemiBold 600, 12px, MAIÚSCULAS, espaçamento entre letras 2.16px, cor #F3EBDD.

### 2. Hero (altura ~830px, fundo #FBF8F3, overflow hidden)
Camadas de fundo (atrás do conteúdo):
- Foto da palestra (Daniela no palco) à esquerda, em preto e branco, opacidade 20% (blend mode luminosity), ocupando aproximadamente da borda esquerda até 925px.
- Degradê do lado direito dessa foto: de #FBF8F3 (opaco) para transparente, da direita para a esquerda, cobrindo de 330px a 925px, para a foto sumir suavemente.
- Degradê na parte de baixo: faixa de 340px de altura, de #FBF8F3 (embaixo) para transparente (em cima), em toda a largura.
- Traço dourado em forma de coração (SVG "Black" do Figma) atrás da foto da Daniela, saindo pela direita da tela.

Conteúdo (container centralizado de 1200px, padding 88px em cima, 104px embaixo, 64px nas laterais, duas colunas com 80px de espaço entre elas):

Coluna esquerda (566px):
1. Selo: "2 encontros ao vivo". Fundo #EFE4CF, cantos totalmente arredondados (999px), padding 10px 20px. Montserrat SemiBold 600, 13px, espaçamento entre letras 5px, cor #8A6420.
2. Logo "Imersão De Volta pra Mim" (imagem do Figma, 222×222px), logo abaixo do selo.
3. Título (largura máx. 528px): Montserrat Regular 400, 32px, altura de linha 1.1, espaçamento entre letras -0.64px, cor #4A3C2C. Os trechos em destaque vão em Montserrat ExtraBold Italic 800, cor #947136:
   "**2 encontros** para **você descobrir** o momento em que começou a desaparecer da própria vida **e dar o primeiro passo de volta** para viver com mais propósito."
4. Frase em duas linhas, Cormorant Garamond Italic 400, 30px, altura de linha 42.5px, 20px abaixo do título:
   - "Ninguém vai fazer isso por você." na cor #2B2118
   - "Essa decisão é sua, e o prazo é agora." na cor #8A6420
5. Linha com botão + informação (espaço de 28px entre eles, ~20px abaixo da frase):
   - Botão "Quero meu ingresso": fundo #C9860D, texto branco, Montserrat Bold 700, 18px, MAIÚSCULAS, espaçamento entre letras 1.2px, padding 22px 40px, altura mínima 58px, cantos 999px, sombra 0 16px 32px -14px rgba(138,100,32,0.7). Hover: escurecer um pouco o fundo.
   - Ícone de calendário (28px, SVG do Figma) + texto em duas linhas, espaço de 12px: "Sábado e domingo, às 8h" / "ao vivo no Zoom". Montserrat Regular 15px, altura de linha 21px, cor #4A3C2C.

Coluna direita:
- Foto da Daniela (a da Biblioteca de Mídia), 540×811px, encostada na parte de baixo da dobra.
- Etiqueta sobreposta perto da base da foto, à direita: fundo branco com opacidade 90%, borda 0.65px #8A6420, cantos 20px, padding 6.5px 20px. Texto Cormorant Garamond Italic 19.6px, cor #2B2118, com "Ninguém" em Bold Italic na cor #8A6420: "**Ninguém** vai fazer isso por você."

## Fontes
Montserrat (400, 600, 700, 800 itálico) e Cormorant Garamond (400 itálico, 700 itálico), pelo Google Fonts do Elementor.

## Responsivo
- Tablet (≤1024px): uma coluna. Foto da Daniela abaixo do texto, centralizada e menor. Título 28px, frase 26px.
- Celular (≤767px): uma coluna, padding lateral 20px. Título 24px, frase 22px, botão com largura total. A foto de fundo da palestra pode ficar escondida. A faixa do topo pode quebrar em duas linhas (fonte 11px).
- Sem rolagem horizontal em nenhum tamanho.

## Ao terminar
1. Me mande o link de visualização do rascunho.
2. Compare com o print do Figma e liste o que ficou diferente.
3. Liste o que ficou pendente (imagens para subir, link do botão etc.).
