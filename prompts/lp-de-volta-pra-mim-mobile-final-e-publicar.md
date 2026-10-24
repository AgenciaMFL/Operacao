Últimos ajustes no celular da página 20 ("De Volta pra Mim – LP") e depois PUBLICAR. Só altere o breakpoint de CELULAR (≤767px). Não mexa no desktop nem no tablet, nem em nenhuma outra página do site.

## 1. Centralizar todos os textos no celular
Em TODAS as seções, no breakpoint de celular:
- Títulos, parágrafos, rótulos, selos, frases em itálico, botões e info do Zoom: alinhamento CENTRALIZADO.
- Containers com flex: alinhar os itens ao centro (align-items: center) para selos, pílulas, logo e botões ficarem no meio.
- Pílulas da "ordem de prioridade": centralizadas e quebrando em linhas centralizadas (justify-content: center).
- EXCEÇÕES (continuam alinhadas à esquerda, porque centralizar lista fica ruim de ler): itens das listas com ícone (cards "Hoje, a mulher…" / "A mulher que volta pra si…", "Para você / não é para você", lista dos cards da programação), linhas do bilhete "Tudo em dia", itens com preço do cartão do ingresso e perguntas e respostas do FAQ. Os TÍTULOS desses blocos ficam centralizados.
- O bilhete e o cartão do ingresso ficam centralizados na tela.

## 2. Imagens novas no celular
Na Biblioteca de Mídia há duas imagens novas, feitas para o celular: "mobile" e "mobile2". Procure por elas (elementor-list-assets ou API REST) e me diga os IDs e tamanhos antes de aplicar.

- "mobile" (Daniela de preto na frente, foto da palestra clarinha e traço dourado atrás) → fundo da HERO no celular.
  - No celular: esconda a foto recortada da Daniela que estava abaixo do texto e use "mobile" como imagem de FUNDO do container da hero (posição: centro embaixo, tamanho: 100% de largura / auto, sem repetir), cor de fundo #FBF8F3.
  - O texto fica na parte de cima, centralizado. Ajuste o padding de baixo da hero para a Daniela aparecer inteira abaixo do botão, sem o texto ficar por cima do rosto dela.
  - A etiqueta "Ninguém vai fazer isso por você." pode ser escondida no celular se atrapalhar.
- "mobile2" (topo creme e Daniela de braços abertos embaixo) → fundo da seção "Talvez esteja faltando você dentro da vida que construiu." no celular.
  - Esconda a foto e os degradês que essa seção usava no celular e use "mobile2" como fundo (centro embaixo, 100% de largura, sem repetir), cor de fundo #FBF8F3. Texto em cima, centralizado, e a Daniela aparecendo embaixo do último parágrafo.
- Se, ao abrir as imagens, a divisão acima não fizer sentido (por exemplo, as duas forem claramente para a hero), PARE e me pergunte antes de aplicar.

Teste em 414, 390 e 360px: rosto da Daniela nunca coberto por texto, sem rolagem horizontal.

## 3. Checagem antes de publicar
Antes de publicar, confira e me mostre o resultado de cada item:
- [ ] Link do botão do cartão do ingresso: se ainda estiver "#checkout", NÃO publique. Pare e me peça o link da Kiwify.
- [ ] Todos os botões "Quero meu ingresso" / "Quero participar" / "Quero reencontrar meu propósito" rolam até o cartão do ingresso (#ingresso).
- [ ] Nenhuma URL temporária do Figma (figma.com/api/mcp/asset) na página.
- [ ] Nenhum widget "(pendente)" ou imagem vazia.
- [ ] Botões sem texto estranho no hover; cartão do ingresso sem bolinhas.
- [ ] Sem rolagem horizontal em 390px e 360px; todos os elementos aparecem ao rolar até o fim.
- [ ] Título da página e endereço (slug): sugira um slug curto, por exemplo "de-volta-pra-mim", e me diga qual ficou.

## 4. Publicar
Se todos os itens acima passarem, publique a página 20 (elementor-publish-document ou mudança de status para "publicado"). Publique SÓ a página 20. Não mexa em site parts, componentes, classes globais, estilos padrão nem na página inicial.

Depois de publicar:
1. Me mande o link público da página.
2. Abra o link público (não o preview) no tamanho de celular e de desktop e confirme que está igual ao preview.
3. Se o site usa plugin de cache (LiteSpeed Cache, WP Rocket etc.), me avise que pode ser preciso limpar o cache.
