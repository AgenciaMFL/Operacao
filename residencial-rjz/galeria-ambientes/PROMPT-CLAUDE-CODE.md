# Prompt para o Claude Code — Galeria "Ambientes projetados para o bem-estar"

Copie tudo abaixo da linha e cole no Claude Code (numa sessão com acesso ao WordPress/Elementor do site ou ao repositório `agenciamfl/operacao`).

---

## Contexto

Site: https://residencialseniorrjz.com.br/residencial-rjz/ (WordPress + Elementor Pro, página ID 12).

Na seção **"Ambientes projetados para o bem-estar"**, a coluna da esquerda tem um **carrossel vertical automático** feito num widget HTML do Elementor (`.elementor-element-5f882f8`, dentro do container `8ed94eb`, que fica oculto no mobile). Ele é um `<div class="vertical-carousel-solo">` com 12 fotos duplicadas (24 `<img>`), animado só com CSS (`@keyframes scrollVertical`, 75s, `linear infinite`, pausa no `:hover`). O CSS fica em "Avançado > CSS personalizado" do widget (aparece em `/wp-content/uploads/elementor/css/post-12.css`).

No mobile existe um widget separado, o **Image Carousel** nativo (`.elementor-element-a9969a4`), oculto no desktop/tablet, com `navigation: none`, autoplay de 5s e sem lightbox.

As fotos: `https://residencialseniorrjz.com.br/wp-content/uploads/2026/11/residencial-carrossel-01.webp` até `-12.webp` (1600×1067).

## Reclamação da cliente

> "Tem alguma forma de mostrar estas fotos podendo clicar e ver ela maior, ou poder passar pro lado? Porque as fotos ficam passando em velocidade muito baixa e, se você passa o mouse na foto, ela para. E você não consegue passar pra próxima foto, nem expandir, nem voltar."

## Diagnóstico de UX

- Movimento automático e contínuo sem nenhum controle: o usuário não decide o ritmo.
- Pausar no hover parece "travado", e não existe próxima/anterior.
- Não dá para ampliar (o público é de familiares e idosos, que precisam ver os detalhes dos quartos).
- O usuário não sabe quantas fotos existem nem em qual está.
- São 24 imagens no DOM, sendo 12 duplicadas.
- O movimento constante ignora `prefers-reduced-motion`, o que é ruim para acessibilidade.

## Solução (já pronta e testada)

Trocar o carrossel por uma **galeria com foto em destaque, miniaturas e lightbox**, sem movimento automático:

- Foto principal 3:2 com cantos arredondados, setas ‹ › grandes, contador "3 / 12" e o botão "Ampliar".
- Grade de 12 miniaturas (6×2) no desktop. A miniatura ativa ganha contorno branco e clicar nela troca a foto principal.
- Clicar na foto abre um **lightbox em tela cheia** (`<dialog>` nativo) com setas, contador, botão fechar, setas ← → do teclado, ESC e clique no fundo para fechar.
- **Swipe** (deslizar com o dedo) na foto principal e no lightbox.
- No celular, as miniaturas viram uma faixa horizontal com scroll-snap e, no lightbox, as setas descem para a parte de baixo, ao alcance do polegar.
- Pré-carrega a foto anterior e a próxima. Acessível: botões com `aria-label`, `aria-current` na miniatura e foco visível.
- Tudo em HTML, CSS e JS puro, num bloco só, sem plugin e sem biblioteca.

O código completo está em `residencial-rjz/galeria-ambientes/widget-galeria.html` no repositório `agenciamfl/operacao` (branch `claude/cool-turing-eebbz4`).

## O que você deve fazer

1. Abra a página 12 no Elementor e localize o widget HTML `5f882f8` (coluna esquerda da seção "Ambientes projetados para o bem-estar").
2. **Substitua todo o conteúdo do widget** pelo conteúdo de `widget-galeria.html`.
3. Em **Avançado > CSS personalizado** desse widget, **apague todo o CSS antigo** (`.vertical-carousel-solo`, `@keyframes scrollVertical`, o `::before` e o `border-radius: 50px`).
4. No container `8ed94eb`, remova o `min-height: 692px` (ou deixe em `auto`) e centralize verticalmente o conteúdo (`align-items/justify-content: center`), para a galeria (~590px de altura em 544px de largura) ficar alinhada com a lista da direita.
5. **Mobile:** escolha uma das opções.
   - (Recomendado) Tire o "Ocultar no mobile" do container `8ed94eb` e **apague** o widget Image Carousel `a9969a4`. A mesma galeria é responsiva.
   - (Alternativa) Mantenha o `a9969a4`, mas ative **Navegação: setas + pontos**, **Link: Arquivo de mídia** e **Lightbox: Sim**, e desative "Pausar ao passar o mouse".
6. Salve, **regenere o CSS** (Elementor > Ferramentas > Regenerar CSS e dados) e limpe o cache (plugin de cache ou CDN, se houver).
7. Teste em https://residencialseniorrjz.com.br/residencial-rjz/:
   - Desktop 1366px: as setas trocam a foto, as miniaturas trocam a foto, "Ampliar" abre o lightbox, ← → e ESC funcionam.
   - Celular (iPhone/Android): o swipe na foto troca a imagem, a faixa de miniaturas rola, o lightbox ocupa a tela inteira e fecha no X.
   - Console sem erros e sem nenhuma animação `scrollVertical` restante.

## Restrições

- Não instalar plugin novo para isso.
- Não mexer na lista da direita (Suítes adaptadas, Piscina etc.) nem em outras seções.
- Manter as URLs das imagens existentes.
- Para trocar ou adicionar fotos no futuro, basta editar a lista de `<a class="rjz-gal__thumb">`: o `href` é a foto grande e o `src` é a miniatura. O contador e a navegação se ajustam sozinhos.
