# Prompt — Fase 5.1: página CARRINHO (Figma 3131:57)

```
Fase 5.1 — página CARRINHO (/carrinho/). NÃO mexa no Git. Pode PUBLICAR
direto. Antes, duplique como rascunho a página/templates que alterar. No
final, me mande o link e um relatório ✅/❌; atualize o RELATORIO.md.

1. DESIGN
   Implement this design from Figma.
   @https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3131-57&m=dev

   - Leia pelo Figma MCP (get_design_context + get_screenshot) e reproduza
     o layout: tabela de itens no topo; abaixo, ilustração à esquerda e
     card "Resumo do Pedido" à direita.
   - Mesmo container do header/Loja. Header, menu, carrinho lateral e
     rodapé globais: NÃO altere (o rodapé global já tem o endereço certo;
     ignore o endereço errado do Figma).
   - A página usa o shortcode [woocommerce_cart] (carrinho clássico). Pode
     trocar pelo widget "Carrinho" do Elementor Pro ou estilizar o
     shortcode com CSS/JS — o que reproduzir melhor o Figma sem mexer no
     funcionamento. Se for indispensável sobrescrever template PHP do Woo,
     NÃO faça: me diga o que precisa e a agência coloca no plugin.

2. ADAPTAR À BRINQUELÂNDIA
   TABELA (colunas: Produto | Preço | Quantidade | Total | lixeira)
   - Produto: miniatura, nome (link para o produto), e embaixo em 12px
     cinza a opção escolhida (ex.: "Opção: Violeta Cobalto") e
     "Cód.: [SKU]".
   - REMOVER a coluna "Entrega / Em até 15 dias úteis".
   - Preço: "De R$ X / Por R$ Y" só se o produto estiver em promoção; caso
     contrário só o valor. Sem preço → "Sob consulta".
   - Quantidade: botões redondos − e + (roxo, como no Figma) com o número
     no meio; ao mudar, atualiza o carrinho sozinho (AJAX, sem botão
     "Atualizar carrinho"), com indicador discreto de carregando.
   - Lixeira: remove o item com animação; mostrar "Item removido. Desfazer"
     por alguns segundos (desfazer nativo do Woo).
   - Esconder: campo de cupom, "Atualizar carrinho", cálculo de frete.

   RESUMO DO PEDIDO (card à direita)
   - Subtotal | valor
   - Entrega | "Combinada no WhatsApp"
   - Total estimado | valor (roxo, como no Figma)
   - Texto 12px cinza: "Valores, pagamento e entrega confirmados pelo
     WhatsApp."
   - Botão verde (cor do WhatsApp, como no Figma) com ícone do WhatsApp:
     "FINALIZAR PEDIDO PELO WHATSAPP" → Finalizar compra (checkout).
   - Botão cinza claro: "CONTINUAR COMPRANDO" → /loja/.

   ILUSTRAÇÃO
   - Use a imagem do dinossauro que já está na biblioteca de mídia (banner
     da home), com o círculo rosa atrás como no Figma. NÃO gere imagens.
     Esconder no celular.

   CARRINHO VAZIO
   - Dinossauro menor, "Seu pedido está vazio", texto "Que tal dar uma
     olhada nos nossos produtos?" e botão rosa "VER PRODUTOS" → /loja/.

3. CELULAR E TABLET
   - Itens viram cards empilhados: foto à esquerda; nome, opção, preço e
     quantidade à direita; lixeira no canto.
   - Resumo do pedido logo abaixo dos itens; barra fixa no rodapé da tela
     com "Total estimado R$ X" + botão verde "FINALIZAR PEDIDO".
   - Áreas de toque de 44px+, sem rolagem lateral.

4. TESTES
   - Carrinho com produto simples + com variação (2 opções diferentes do
     mesmo produto) + quantidade 3.
   - Mudar quantidade (total e contador do header atualizam), remover e
     desfazer, esvaziar → estado vazio.
   - "Finalizar pedido pelo WhatsApp" leva ao checkout e o fluxo do
     WhatsApp continua igual. Carrinho lateral e página carrinho mostram os
     mesmos itens.
   - Esvaziar o carrinho no fim.

NÃO FAÇA: não reative o LiteSpeed, não use o link privado, não altere
header/menu/rodapé, o checkout, o número do WhatsApp nem o funcionamento
do plugin de pedidos.
```
