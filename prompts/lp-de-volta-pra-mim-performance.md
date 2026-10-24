Vamos otimizar a velocidade da página "De Volta pra Mim – LP" (página 20, https://danimilhazes.com.br/de-volta-pra-mim/). PageSpeed no celular: nota 67, FCP 3,8s, LCP 8,1s, TBT 0ms, CLS 0,014. Meta: nota 85+ e LCP abaixo de 2,5s no celular, SEM mudar o visual.

Já analisei o HTML publicado. Estes são os problemas encontrados:

| Problema | Detalhe |
|---|---|
| Hero do celular pesada | fundo `frame_6.webp` = 503 KB, carregado como background CSS (o navegador só descobre tarde, por isso o LCP é 8,1s) |
| Fundo da seção "Talvez esteja faltando você" no celular | `mobile2.webp` = 1.286 KB |
| Foto recortada da Daniela (escondida no celular, mas baixada mesmo assim) | `dvpm-foto-daniela.png` = 1.525 KB (o src 682x1024 também é PNG pesado) |
| Logo | PNG 1024x1024 (~139 KB) exibido a ~222px, e com `fetchpriority="high"`, roubando prioridade do LCP real |
| Fontes | 5 CSS do Google Fonts bloqueando a renderização: Roboto e Roboto Slab (NÃO usadas na LP) + Montserrat, Cormorant Garamond e Caveat, todas com os 18 pesos |
| Scripts | jQuery + jquery-migrate, Hostinger Reach (`cdn-reach.hostinger.com/js/embed.js`), Essential Addons, motion.min.js e interactions-pro do Elementor |
| Cache | `x-litespeed-cache: miss` e `x-hcdn-cache-status: MISS` |

Regras: não mudar o visual (compare prints antes e depois em 390px e 1440px). Mudanças só na página 20 você pode fazer direto. Mudanças que afetam o SITE INTEIRO (configurações do Elementor, plugins, cache, fontes globais): liste e me peça confirmação antes. Nada de instalar plugin sem eu aprovar.

## Parte A: só na página 20 (pode fazer direto)

1. Medir antes. Rode o PageSpeed pela API e guarde os números:
   `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://danimilhazes.com.br/de-volta-pra-mim/&strategy=mobile`
   Anote nota, FCP, LCP, qual é o elemento LCP e as maiores oportunidades.

2. Imagens: converter, redimensionar e subir de novo (API REST, nomes com sufixo "-otimizada"), depois trocar na página:
   - `frame_6.webp` (hero do celular): WebP com 828px de largura (2x de 414), qualidade ~72, meta abaixo de 90 KB.
   - `mobile2.webp`: WebP com 828px de largura, meta abaixo de 100 KB.
   - `dvpm-foto-daniela.png` (hero do desktop): WebP com fundo transparente, 1080px de altura, meta abaixo de 150 KB.
   - Logo: WebP de 444x444 (2x de 222), meta abaixo de 25 KB.
   - Demais fotos (palco, microfone, notebook, depoimentos): WebP com no máximo 1600px de largura e qualidade ~75.
   - Checks e ícones: manter PNG pequeno ou WebP.

3. Hero do celular como IMAGEM, não como fundo CSS. No celular, troque o fundo CSS da hero por um widget de Imagem com a versão otimizada, `loading="eager"` e `fetchpriority="high"`, mantendo o mesmo visual (posicionado atrás do texto ou logo abaixo dele, como está hoje). Se não der para manter o visual assim, mantenha o fundo e adicione um preload só para o celular no topo da página:
   `<link rel="preload" as="image" href="URL-DA-HERO-MOBILE-OTIMIZADA" media="(max-width: 767px)" fetchpriority="high">`
   Faça o mesmo para o desktop com `media="(min-width: 768px)"` e o fundo `section_dobra_1_hero`.

4. Prioridade das imagens:
   - Tire o `fetchpriority="high"` do logo.
   - Só a imagem da hero (do tamanho de tela atual) fica com prioridade alta.
   - Tudo abaixo da primeira dobra fica com `loading="lazy"`.
   - Imagens só do desktop não podem ser baixadas no celular, e vice-versa. Se o Elementor baixa imagem escondida, use `<picture>` com `<source media>` ou fundos CSS por breakpoint, que só baixam quando aplicados.

5. Fundos CSS abaixo da dobra (`mobile2`, palco, microfone): garanta que só carreguem quando a seção chega perto da tela (experimento "Lazy Load Background Images" do Elementor, ver Parte B, ou classe + IntersectionObserver no widget HTML que já existe).

6. Animações: se a página ainda usa animações de entrada nativas do Elementor ou interactions do Elementor Pro, isso carrega `motion.min.js` e `interactions-pro.min.js`. Confirme o que a página usa e me diga se dá para tirar esses scripts mantendo as animações pelo nosso CSS + IntersectionObserver.

## Parte B: site inteiro (me mostre a lista e espere minha confirmação)

7. Fontes:
   - Elementor → Configurações → Avançado/Desempenho: "Google Fonts: carregar localmente" (load locally). Assim acabam os 5 CSS externos que bloqueiam a renderização.
   - Remover Roboto e Roboto Slab: elas vêm das fontes globais padrão do kit (post-5.css). Verifique se alguma outra página publicada do site usa essas fontes antes de trocar as fontes globais para Montserrat e Cormorant Garamond. Me diga o que encontrou.
   - Preload de 2 arquivos de fonte usados na primeira dobra: Montserrat 400 e Cormorant Garamond 400 itálico.

8. Experimentos/recursos de desempenho do Elementor (Configurações → Recursos): ativar "Carregamento otimizado de CSS", "Carregamento de ativos aprimorado", "Lazy Load Background Images", "Inline Font Icons" e "Element Caching". Diga quais já estão ativos.

9. Plugins:
   - Hostinger Reach (newsletter): se não é usado na LP, impedir que o embed.js carregue nesta página ou desativar o plugin. Me pergunte.
   - Essential Addons: se nenhum widget dele é usado na página 20, desative os elementos não usados no painel do EA, para ele não carregar CSS/JS.

10. Cache e otimização (LiteSpeed Cache, que a Hostinger já suporta pelo servidor LiteSpeed):
    - Verifique se o plugin LiteSpeed Cache está instalado e ativo.
    - Se não estiver, me peça para instalar.
    - Configuração recomendada:
      - Cache de página ligado.
      - Minificar CSS e JS.
      - Combinar CSS desligado no começo.
      - "Carregar JS adiado" (defer) com exceção para jQuery e scripts do Elementor, se quebrar algo.
      - Remover emojis do WordPress.
      - Remover jquery-migrate.
      - Lazy load de imagens ligado, mas EXCLUINDO a imagem da hero.
      - Gerar WebP.
    - Ative o CDN da Hostinger (hPanel), se ainda não estiver.
    - Depois de qualquer mudança, limpe o cache (LiteSpeed + CDN).

## Ao terminar
1. Rode o PageSpeed de novo (celular e desktop) e me mostre uma tabela antes × depois: nota, FCP, LCP, elemento LCP, peso total da página.
2. Prints em 390px e 1440px da primeira dobra e de 2 seções do meio, para eu conferir que o visual não mudou.
3. Lista do que ficou pendente aguardando minha confirmação.
