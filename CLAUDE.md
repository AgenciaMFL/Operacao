# Operação — regras para landing pages (WordPress + Elementor)

Siga estas regras em toda landing page criada ou alterada neste projeto.

## Quebra de linha harmônica (principalmente no mobile)

Objetivo: títulos com linhas de tamanho parecido, sem palavra sozinha na última linha e sem destaque colorido partido no meio.

1. **CSS global obrigatório.** Confirme que o site tem este CSS (Aparência → Personalizar → CSS adicional, ou Elementor → Configurações do site → CSS personalizado). Se não tiver, avise o usuário para adicionar:

   ```css
   /* Títulos: distribui as palavras em linhas de tamanho parecido */
   h1, h2, h3, h4,
   .elementor-heading-title {
     text-wrap: balance;
   }

   /* Parágrafos: evita palavra sozinha na última linha */
   p, li,
   .elementor-widget-text-editor {
     text-wrap: pretty;
   }

   /* Mantém um trecho sempre na mesma linha */
   .nowrap {
     white-space: nowrap;
   }
   ```

2. **Destaques coloridos não quebram no meio.** Trechos curtos em destaque (até ~3 palavras) vão num `<span>` com a classe `nowrap`, junto com a pontuação final:
   `Seis blocos, do travamento ao <span class="destaque nowrap">plano de ação!</span>`
   Destaque com mais de 3 palavras: divida em dois spans `nowrap` ou reescreva, nunca force uma linha que estoure a tela.

3. **Junte palavras curtas à vizinha.** Use espaço não separável (`&nbsp;`) para não deixar sozinha no fim ou no início de linha palavras como "o", "a", "de", "do", "no", "e", "que" e o último par de palavras do título:
   `Você trabalha muito e vende menos do&nbsp;que&nbsp;poderia?`

4. **Sem `<br>` fixo.** Não use `<br>` para controlar quebras: o que fica bom no desktop quebra errado no mobile. Se uma quebra for indispensável, use uma só para um tamanho de tela (`<br class="so-desktop">` com CSS escondendo no mobile).

5. **Tamanho de fonte responsivo.** Defina a tipografia dos títulos separadamente para desktop, tablet e mobile no Elementor. Referência para mobile (~360–390px de largura): H1 entre 26 e 32px, H2 entre 22 e 28px, altura de linha 1.15–1.25. O título principal deve ocupar no máximo 3–4 linhas no mobile.

6. **Revisão obrigatória em 375px.** Antes de dar a página como pronta, confira cada título na largura de 375px e corrija qualquer linha com uma palavra só, destaque partido ou linhas muito desiguais.

## Elementor via API

- Depois de criar ou alterar uma página do Elementor pela REST API, apague o meta `_elementor_css` da página para o Elementor regenerar o CSS. Sem isso, a página aparece certa no editor mas sem estilo no site publicado.
- Landing pages usam o modelo **Elementor Canvas** (sem cabeçalho e rodapé do tema), a não ser que o usuário peça outro.
- Credenciais do WordPress vêm das variáveis de ambiente `WP_URL`, `WP_USER` e `WP_APP_PASSWORD`. Nunca escreva senhas em arquivos do repositório.

## Performance (PageSpeed mobile)

Metas: Speed Index < 3,4 s, LCP < 2,5 s, CLS < 0,1. Meça no PageSpeed Insights (aba mobile) antes e depois de cada mudança.

1. **Sem animação na primeira dobra.** Nada de "Animação de entrada" do Elementor, efeitos de movimento ou animação infinita (anéis pulsando, brilho em botão) nos elementos visíveis ao abrir a página. Animações contínuas fazem o Speed Index disparar, porque a tela nunca fica "pronta". Abaixo da dobra, só animações curtas (≤ 0,6 s) e que rodam uma vez.
2. **Vídeo com fachada.** Vídeo do YouTube/Vimeo nunca carrega o player na abertura: use imagem de capa e só carregue o player no clique (widget de vídeo do Elementor com "Sobreposição de imagem" + "Carregamento lento" ligados).
3. **Imagem principal leve.** Imagem do topo em WebP, até ~150 KB, largura máxima 1600 px no desktop e uma versão menor para mobile. Ela não pode ter lazy load. Demais imagens com lazy load e com largura/altura definidas.
4. **Fontes.** No máximo 2 famílias e 3 pesos. Em Elementor → Configurações → Desempenho, carregamento de fontes do Google em **Swap**. Ícones: prefira SVG a Font Awesome inteiro.
5. **Recursos do Elementor ligados** (Elementor → Configurações → Recursos/Desempenho): saída de DOM otimizada, carregamento de assets melhorado, carregamento de CSS melhorado, lazy load de imagens de fundo, ícones de fonte inline.
6. **Cache e minificação.** O site precisa de plugin de cache (LiteSpeed Cache se a hospedagem for LiteSpeed; senão WP Rocket ou similar) com minificação de CSS/JS e JS adiado. Depois de ativar, confira se formulários, vídeo e botões continuam funcionando.
7. **Sem pulo de layout.** Reserve espaço para vídeo (proporção 16:9), imagens (largura/altura) e qualquer elemento que carregue depois, para manter o CLS baixo.

## Ao terminar

Mande um resumo com: o que foi feito, o que foi verificado (incluindo a revisão em 375px), o que deu errado e o que falta o usuário fazer.
