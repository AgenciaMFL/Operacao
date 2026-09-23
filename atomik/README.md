# Atomik (réplica) — Código → Elementor

Extensão do Chrome (painel lateral) que converte **HTML + CSS em Flexbox Containers e widgets nativos do Elementor**.
A interface replica o Atomik. Nesta versão só a ferramenta **Código → Elementor** está ativa; as demais aparecem como "em breve".

## Instalação
1. Abra `chrome://extensions` e ative o **Modo do desenvolvedor**.
2. Clique em **Carregar sem compactação** e selecione a pasta `atomik/`.
3. Clique no ícone do Atomik (ou `Alt+A`) para abrir o painel lateral.

## Como usar
1. Abra o editor do Elementor da página (o ponto ao lado do sino fica verde quando o editor é detectado).
2. No painel, entre em **Código → Elementor**, cole o HTML na aba *HTML* e o CSS na aba *CSS* (ou cole uma página completa com `<style>`).
3. Clique em **Converter** (`Ctrl+Enter`) e escolha:
   - **Inserir na página**: cria os elementos direto no editor aberto;
   - **Copiar**: no Elementor, botão direito numa área vazia → *Colar de outro site* → `Ctrl+V`;
   - **Baixar .json**: importe em *Modelos → Modelos salvos → Importar*.

## Como a conversão funciona
O código é renderizado num iframe oculto (1440px) e o conversor lê os **estilos computados** de cada elemento:

| HTML | Elementor |
|---|---|
| `section`, `div`, `header`… | Container (flex linha/coluna, gap, alinhamentos, wrap, padding, fundo, gradiente, borda, raio, sombra) |
| `display:grid` | Container em linha com wrap e larguras em % |
| wrapper com `max-width` + `margin:auto` | Container *boxed* com a largura correspondente |
| `h1`–`h6` | Heading |
| `p`, `ul/ol`, `blockquote`, texto solto | Text Editor |
| `a`/`button` com cara de botão | Button (cores, raio, padding, borda, tipografia, link) |
| `img` | Image |
| `svg`, `form`, `iframe`, `video`, `table`… | HTML |

Tipografia (fonte, tamanho, peso, altura de linha, espaçamento, caixa), cores e alinhamentos vão para cada widget.
Espaçamentos por `margin` em layouts de bloco viram *gap* do container. Linhas empilham no mobile (opcional).

**Limitações:** elementos `position: absolute/fixed` são ignorados (aparece um aviso); JavaScript não é executado
(Tailwind via CDN, por exemplo, não é aplicado: use o CSS compilado); requer Elementor com Flexbox Container (padrão desde a 3.16).

## Barra inferior
Desfazer · Inverter direção do container · Duplicar selecionado · Recarregar preview · Copiar JSON do selecionado · Inserir JSON da área de transferência.

## Estrutura
```
manifest.json          MV3 + side panel
background.js          abre o painel ao clicar no ícone
sidepanel.html, css/   interface
js/app.js              telas, busca, barra inferior
js/html2elementor.js   conversor HTML/CSS → Elementor
js/elementor.js        construtores de JSON + ponte com o editor ($e.run)
js/icons.js, js/storage.js
```
