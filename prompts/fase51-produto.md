# Prompt — Fase 5.1: página de PRODUTO (Figma 3145:79)

```
Fase 5.1 — página de PRODUTO. NÃO mexa no Git. Pode PUBLICAR direto.
Antes, duplique como rascunho qualquer template que for alterar. No final,
me mande só os links e um relatório ✅/❌; atualize o RELATORIO.md.

1. DESIGN
   Implement this design from Figma.
   @https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3145-79&m=dev

   - Leia pelo Figma MCP (get_design_context + get_screenshot) e reproduza
     o layout: trilha no topo; galeria à esquerda (miniaturas na vertical
     + foto grande com setas e lupa); coluna de informações à direita;
     carrossel de produtos relacionados; rodapé.
   - Theme Builder: template "Produto único", condição "Todos os
     produtos", com widgets WooCommerce do Elementor (dados reais).
   - Mesmo container/largura do header e da Loja (alinhado ao logo e ao ☰).
   - Header, menu lateral, carrinho lateral e rodapé globais já existem:
     NÃO altere.

2. ADAPTAR À BRINQUELÂNDIA (o design é de outra loja)
   GALERIA
   - Hoje cada produto tem 1 foto: com 1 foto, esconda miniaturas e setas
     e mostre só a foto grande + lupa (zoom/lightbox). Com 2+ fotos, use
     miniaturas verticais e setas como no Figma.
   - Produto com variação que tem foto própria: ao escolher a opção, a foto
     grande troca.
   - Selo "DESTAQUE" (no lugar de "MAIS VENDIDO!") só se o produto estiver
     em destaque; selo "-X%" só se tiver preço promocional.
   - Se o produto tiver a tag "foto-ilustrativa", mostrar abaixo da foto,
     em 12px cinza: "Imagem ilustrativa".

   INFORMAÇÕES (coluna direita), nesta ordem:
   a. Nome do produto (H1).
   b. Ícone de compartilhar (no lugar do coração): abre o compartilhamento
      nativo do celular; no computador, abre o WhatsApp com o nome e o link
      do produto. REMOVER o coração de favoritos.
   c. Selo da categoria (mesmas cores da Loja) + "Cód.: [SKU]" pequeno.
   d. Preço: simples → valor; com variações → "a partir de R$ X" até
      escolher a opção, aí mostra o preço da opção; promoção → preço antigo
      riscado + "-X%" (calculado); sem preço → "Sob consulta".
   e. Seletor de OPÇÃO (produtos com variação): botões/pílulas com o nome de
      cada opção (cor/número), a escolhida destacada na cor da marca; se
      houver muitas opções (mais de 12), use uma lista suspensa no mesmo
      estilo do "Ordenar por" da Loja.
   f. Quantidade: botões − e + com o número no meio (mín. 1).
   g. Botão principal rosa "PEDIR AGORA": adiciona ao carrinho (com a opção e
      a quantidade escolhidas) e leva direto para Finalizar compra.
   h. Botão secundário "+ ADICIONAR AO PEDIDO" (estilo do "Adicionar ao
      carrinho" do Figma): adiciona e abre o carrinho lateral, sem sair da
      página.
      Produto com variação sem opção escolhida: os dois botões pedem para
      escolher a opção (mensagem curta, sem recarregar).
   i. Caixa discreta (no lugar de "Desconto no PIX"/"Vendido por"):
      "Pagamento, entrega e valores combinados pelo WhatsApp" + link
      "Tirar dúvida sobre este produto" que abre
      https://wa.me/5521971281678 com o texto "Olá! Tenho uma dúvida sobre
      o produto [nome] ([link])".
   j. "Retire na loja: Av. Ataulfo de Paiva, 1060 Lj D – Leblon/RJ" em 13px
      com ícone de localização.
   k. "Sobre este produto": descrição curta do Woo; se vier em linhas,
      mostrar como lista com ✓ (como no Figma). Se o produto não tiver
      descrição, ESCONDER a seção inteira (não mostrar título vazio).

   REMOVER (não existe na loja): estrelas/avaliações, coração, "10x sem
   juros", "Desconto no PIX", "Vendido e entregue por…", "MAIS VENDIDO!",
   abas de avaliações do Woo.

   RELACIONADOS
   - Título "Você também pode gostar" (no lugar de "Quem viu, viu também").
   - Carrossel com produtos da mesma categoria (relacionados do Woo), usando
     o MESMO card da Loja (Loop Item 2402), com setas e arrastar.

3. CELULAR E TABLET
   - Celular: trilha compacta; foto em cima com deslizar (pontinhos se
     houver mais de 1 foto); informações embaixo; seletor de opção e
     quantidade grandes (44px+).
   - Barra fixa no rodapé da tela com o preço e o botão "ADICIONAR AO
     PEDIDO" (abre o carrinho lateral); ela aparece quando os botões
     principais saem da tela.
   - Relacionados: carrossel com 2 cards visíveis e arrastar.
   - Tablet: 2 colunas como no computador, mais estreitas.

4. TESTES
   - Produto simples, produto com variação (com e sem foto por opção),
     produto em destaque, produto com promoção (coloque um preço
     promocional em 1 produto de teste e retire no fim) e um sem
     descrição.
   - "PEDIR AGORA" leva ao checkout com o item certo; "ADICIONAR AO
     PEDIDO" abre o carrinho lateral; variação sem opção mostra o aviso.
   - Compartilhar e "Tirar dúvida" abrem o WhatsApp com o texto certo.
   - Celular: barra fixa, deslizar a foto, sem rolagem lateral.

5. PUBLICAR E DEVOLVER
   - Links: 1 produto simples, 1 com variação, e o link de edição do
     template "Produto único".
   - No relatório, uma linha por diferença que ficou em relação ao Figma.

NÃO FAÇA: não reative o LiteSpeed, não use o link privado, não altere
header/menu/carrinho/rodapé, o número do WhatsApp do plugin nem o
funcionamento do plugin de pedidos.
```
