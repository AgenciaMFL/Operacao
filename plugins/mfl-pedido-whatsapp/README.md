# MFL Pedido pelo WhatsApp

Plugin do WooCommerce para a Bazar Brinquelândia: o cliente monta o carrinho, finaliza e é levado ao WhatsApp da loja com o recibo do pedido. Não há cobrança online.

## O que faz

- **Método "Combinar pelo WhatsApp"**: o pedido é salvo sem cobrança e sem baixar estoque.
- **Status "Aguardando contato"**: o pedido continua editável, então o dono pode incluir ou alterar itens no painel durante a negociação. O estoque baixa quando o pedido for marcado como **Processando** (pago).
- **Checkout simplificado** (checkout clássico): Nome, WhatsApp, Retirada/Entrega, endereço (obrigatório só para entrega) e Observações.
- **Recibo no WhatsApp**: nº do pedido, cliente, entrega, itens com SKU, quantidades, valores e total estimado. Itens sem preço aparecem como "sob consulta". Se o texto passar do limite, vai um resumo com o link do pedido completo.
- **Página "Pedido recebido"**: abre o WhatsApp automaticamente (só na primeira visita) e mostra um botão reserva.
- Botões de compra passam a mostrar **"Adicionar ao pedido"**.
- Compatível com HPOS e com o checkout em blocos (onde só o método de pagamento é adicionado; ver abaixo).

## Instalação

1. WordPress → **Plugins → Adicionar novo → Enviar plugin** → escolha `mfl-pedido-whatsapp.zip` → **Ativar**.
2. **WooCommerce → Configurações → Pagamentos → Combinar pelo WhatsApp**: confira o número (`5521971281678`), os textos e salve. Ele deve ser o **único** método ativo.

## Checkout: clássico (recomendado)

Os campos simplificados só funcionam no **checkout clássico**. Na página **Finalizar compra** (ID 184), use uma destas opções:

- o widget **Checkout** do Elementor Pro, ou
- um bloco de shortcode com `[woocommerce_checkout]`.

No checkout em blocos o método de pagamento funciona, mas os campos continuam os padrões do Woo (e-mail, CEP etc.).

## Página "Obrigado" personalizada no Elementor

Se a página de pedido recebido for montada no Elementor (sem o template padrão do Woo), adicione o shortcode `[mfl_whatsapp_pedido]` para mostrar o botão e abrir o WhatsApp.

## Fluxo do atendente

1. O pedido chega no WhatsApp e aparece em **WooCommerce → Pedidos** como **Aguardando contato**.
2. Combine valores, frete e pagamento. Se precisar, edite o pedido (adicionar itens, frete, desconto).
3. Ao receber o pagamento, mude para **Processando**. Ao entregar, mude para **Concluído**. Se não fechar, mude para **Cancelado**.

## Teste rápido

1. Adicione 2 ou 3 produtos ao carrinho (deixe um sem preço, se houver).
2. Finalize escolhendo "Entrega" sem endereço: deve aparecer erro pedindo o endereço.
3. Preencha e finalize: o pedido aparece como **Aguardando contato** e o WhatsApp abre com o recibo.
4. Atualize a página de pedido recebido: o WhatsApp **não** deve reabrir sozinho; o botão continua lá.
