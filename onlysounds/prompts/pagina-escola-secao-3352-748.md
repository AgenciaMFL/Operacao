Implemente uma nova seção na página **Escola** (`/escola`, em rascunho) do site onlysounds.com.br usando o MCP `only-sounds-elementor`, seguindo o design do Figma abaixo, **no desktop e no mobile**. Não mexa em nenhuma outra página nem nas seções que já existem nesta página (barra do temporizador e hero).

## 1. Referência do design
- Figma: https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3352-748&m=dev
- Antes de montar, use o MCP do Figma no node **`3352:748`**:
  - `get_screenshot` para ver a seção inteira;
  - `get_design_context` (ou `get_metadata`) para pegar textos, cores, fontes, tamanhos, espaçamentos, raios, sombras e imagens.
- Copie os **textos exatamente** como estão no Figma (corrigindo só erros de acento/ortografia óbvios, e me avise quais corrigiu).
- Se o Figma tiver uma versão mobile desta seção (outro frame/node), use-a para o mobile. Se não tiver, adapte o desktop seguindo as regras do item 4.

## 2. Onde colocar
- Logo **abaixo da hero** (depois do botão "Entrar na OnlySounds"), como um novo contêiner de largura total.
- O frame do Figma tem 2560px de largura. Converta para conteúdo com **largura máxima de 1140px**, centralizado, mantendo as proporções, os tamanhos de fonte e os espaçamentos do design.

## 3. Padrões que já usamos na página (mantenha)
- **Fontes:** Plus Jakarta Sans (títulos/destaques) e Poppins (texto corrido), conforme o Figma. Use as fontes globais do Elementor se já existirem.
- **Botões:** se a seção tiver botão, use o mesmo estilo do botão da hero (degradê `#1652BD → #4B8CFF → #1652BD`, totalmente arredondado) e dê a classe **`os-btn`** para herdar o efeito de brilho/hover que já está na página. Link do checkout: `https://pay.kiwify.com.br/201xbLn` (nova aba), a menos que o Figma indique outro destino.
- **Imagens:** exporte do Figma em **WebP** (fotos) ou **SVG** (ícones e logos), suba na Biblioteca de Mídia com nomes claros (ex.: `escola-secao2-...webp`) e use `loading="lazy"`. Antes de subir, verifique se a imagem **já existe** na biblioteca (ex.: `group_8.webp` é a logo) e reutilize.
- **Ícones:** SVG, nunca imagem PNG grande.
- **Vídeos:** se houver vídeo do YouTube, use o widget Vídeo com **Image Overlay + Lazy Load** (só carrega no clique). Se houver vídeo de fundo, use arquivo WebM próprio e me pergunte qual antes.
- **Efeitos** (brilhos, desfoques, degradês): faça com CSS, não com imagem. Se a seção tiver "luzes" azuis desfocadas, **me pergunte antes** de colocar (removemos as da hero).
- **Desempenho:** nada de bibliotecas extras (jQuery plugins, sliders pesados). Se precisar de JS, inline e pequeno.

## 4. Mobile (obrigatório)
- Use os breakpoints do Elementor: desktop (≥ 1025px), tablet (768–1024px), mobile (≤ 767px).
- No mobile:
  - padding lateral de 20px;
  - colunas lado a lado viram **uma coluna**, na ordem de leitura do design (título → texto → imagem/cards → botão);
  - títulos reduzidos para ~70–75% do tamanho do desktop (ex.: 36px → 26–28px) e textos para 15–16px;
  - imagens com 100% da largura;
  - cards em grade viram lista de uma coluna (ou 2 colunas se forem pequenos, tipo ícones);
  - botão com largura de 100% até 360px;
  - espaçamento vertical da seção ~60% do desktop.
- Confira que **não há rolagem horizontal** em 375px e que nenhum texto fica cortado.

## 5. Verificação e entrega
- Compare o resultado com o screenshot do Figma e corrija diferenças de espaçamento, cor e tamanho.
- Confira que a barra do temporizador continua fixa no topo por cima desta seção ao rolar.
- Me mande o link de pré-visualização e prints:
  - desktop (1440px) da seção inteira, lado a lado com o screenshot do Figma;
  - mobile (375px) da seção inteira.
- Liste o que ficou diferente do Figma e por quê (se algo não foi possível no Elementor).
