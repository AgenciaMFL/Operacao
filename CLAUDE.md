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

## Ao terminar

Mande um resumo com: o que foi feito, o que foi verificado (incluindo a revisão em 375px), o que deu errado e o que falta o usuário fazer.
