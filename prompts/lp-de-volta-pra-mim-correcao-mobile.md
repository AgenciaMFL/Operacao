Correção URGENTE do celular na página 20 ("De Volta pra Mim – LP"). Só altere os breakpoints de TABLET e CELULAR. Não mexa no desktop nem em outras páginas.

## Os bugs (vistos em prints do celular)
1. A página está mais larga que a tela: o fundo das seções termina no meio e o resto fica branco à direita. Ou seja, tem elemento estourando a largura e criando rolagem horizontal.
2. Textos cortados ou passando da borda: "Tá tudo certo…" (parágrafos passam do fundo), "Talvez esteja faltando você…" (parágrafos cortados no meio da palavra), frase "Você é uma mulher forte…" e título "Essa é a ordem de prioridade da sua vida." (estouram para fora).
3. Textos ainda alinhados à esquerda. Quero CENTRALIZADO no celular.
4. A hero ainda usa a foto recortada antiga, e não a imagem "mobile".

## Causa provável
Larguras fixas do desktop vazando para o celular (ex.: 516px, 528px, 558px, 900px, 980px, max-width fixo), white-space: nowrap vindo do Figma, quebras de linha manuais (<br>) do desktop e posições absolutas.

## 1. Achar TODOS os culpados primeiro
Abra o preview em 390px de largura e rode no console:

```js
[...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > window.innerWidth + 1).map(el => el.className || el.tagName)
```

Corrija cada elemento da lista e rode de novo até a lista vir VAZIA. Repita em 360px e 768px.

## 2. Correções no celular (≤767px), em TODAS as seções
- Todo container e widget: largura 100% (ou automática), max-width 100%, sem largura fixa em px. Containers com padding lateral de 20px.
- Textos: white-space: normal, overflow-wrap: break-word. Remova o nowrap e o letter-spacing negativo exagerado.
- Quebras de linha manuais do desktop (<br> ou um parágrafo por linha) NÃO valem no celular: esconda os <br> com CSS no celular ou junte o texto, para ele quebrar sozinho.
- Nada com posição absoluta que empurre largura. Se precisar, use posição normal no celular.
- Imagens: max-width 100%, altura automática.
- Garanta que nenhuma seção tenha largura maior que a tela. Depois de corrigir, o fundo de todas as seções deve ir de borda a borda.

## 3. Centralizar no celular
- Centralize títulos, parágrafos, rótulos, selos, frases em itálico, botões, info do Zoom (ícone + texto centralizados juntos), pílulas (justify-content: center) e todos os containers (align-items: center).
- Exceções, que continuam alinhadas à esquerda dentro do card: itens de listas com ícone, linhas do bilhete "Tudo em dia", itens com preço do ingresso e perguntas e respostas do FAQ. Os cards em si ficam centralizados na tela.
- Botões com largura 100%.

## 4. Hero com a imagem "mobile"
- No celular, esconda a foto recortada da Daniela e use a imagem "mobile" da Biblioteca de Mídia como FUNDO do container da hero (centro embaixo, 100% de largura, sem repetir, cor de fundo #FBF8F3).
- Texto em cima e centralizado; padding de baixo grande o suficiente para a Daniela aparecer inteira abaixo do botão, sem texto sobre o rosto.
- Na seção "Talvez esteja faltando você…", use a imagem "mobile2" do mesmo jeito (texto em cima, Daniela embaixo).

## Tamanhos de fonte no celular (se algum título ainda estourar, diminua)
Títulos grandes (72/64px) → 34–38px; títulos médios (55/48/42px) → 28–30px; frases em itálico (34/30px) → 22–24px; texto corrido → 16px com altura de linha 1.6.

## Ao terminar
1. Rode de novo o script do passo 1 em 360, 390 e 768px e me mostre que a lista veio vazia nos três.
2. Mande UM print por seção em 390px (pode ser em sequência), só do celular.
3. Se a página já estiver publicada, as mudanças vão direto para o ar: limpe o cache se o site tiver plugin de cache.
