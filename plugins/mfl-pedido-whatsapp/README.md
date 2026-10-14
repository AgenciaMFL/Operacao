# MFL Pedido pelo WhatsApp

Plugin do WooCommerce para a Bazar Brinquelândia: o cliente monta o carrinho, finaliza e é levado ao WhatsApp da loja com o recibo do pedido. Não há cobrança online.

## O que faz

- **Método "Combinar pelo WhatsApp"**: o pedido é salvo sem cobrança e sem baixar estoque.
- **Status "Aguardando contato"**: o pedido continua editável, então o dono pode incluir ou alterar itens no painel durante a negociação. O estoque baixa quando o pedido for marcado como **Processando** (pago).
- **Checkout simplificado** (checkout clássico): Nome, WhatsApp, Retirada/Entrega, endereço (obrigatório só para entrega) e Observações.
- **Recibo no WhatsApp**: nº do pedido, cliente, entrega, itens com SKU, quantidades, valores e total estimado. Itens sem preço aparecem como "sob consulta". Se o texto passar do limite, vai um resumo com o link do pedido completo.
- **Página "Pedido recebido"**: abre o WhatsApp automaticamente (só na primeira visita) e mostra um botão reserva. Mostra só o quadro do WhatsApp, os detalhes do pedido (sem a linha "Método de pagamento", com "Total estimado") e o bloco "Seus dados" (nome, WhatsApp e retirada/entrega) — sem e-mail, data nem "endereço de cobrança" — e um botão "Continuar comprando". Visual próprio em cartões (`assets/css/obrigado.css`, carregado só nessa página); as cores ficam em variáveis no topo do arquivo (`--mfl-roxo`, `--mfl-rosa` etc.). Modelos em `templates/`.
- Botões de compra passam a mostrar **"Adicionar carrinho"** (filtro `mfl_pw_add_to_cart_text` para trocar).
- Títulos do checkout: "Detalhes de cobrança" vira **"Seus dados"**, "Informação adicional" vira **"Observações"** e "Seu pedido" vira **"Resumo do pedido"**.
- **"Não encontrou? Fale com a gente"**: aparece quando a busca ou a categoria não tem produtos e abre o WhatsApp com o termo buscado. Também existe como shortcode `[mfl_nao_encontrou]` para usar em qualquer página do Elementor.
- **WooCommerce → Buscas sem resultado**: lista o que os clientes procuraram e não acharam, com quantidade, data e um atalho "Cadastrar produto".
- **Filtros "Destaques" e "Em promoção"** na Loja/Categoria/busca: por URL (`?destaques=1`, `?promocao=1`) ou pelo shortcode `[mfl_filtro tipo="destaques"]` / `[mfl_filtro tipo="promocao"]`, que gera um botão liga/desliga (classes `.mfl-filtro`, `.is-active`, `.mfl-filtro__chave`, `.mfl-filtro__rotulo` para estilizar).
- **Preço no Loop Grid do Elementor:** a faixa de preço (`?min_price`/`?max_price`) e a ordenação por preço e mais vendidos (`?orderby=price` / `price-desc` / `popularity`) também valem para o Loop Grid com "Consulta atual" na Loja/Categoria/busca (o Woo sozinho só aplica na consulta principal).
- **Menu de categorias automático** `[mfl_menu_categorias titulo="Categorias"]`: lê as categorias do WooCommerce (categoria nova aparece sozinha quando tiver produto), sanfona com "Ver tudo em X" + subcategorias, "Outros…" por último, ordem de Produtos → Categorias. Cor de cada categoria no campo **"Cor no menu"** da edição da categoria. Visual em `assets/css/menu-categorias.css` (variáveis `--mfl-cats-*`).
- **Segurança sem plugin extra:** XML-RPC desligado, versão do WordPress escondida, descoberta de usuários bloqueada (`?author=N` e `/wp-json/wp/v2/users` sem login), login bloqueado por 15 min após 6 erros do mesmo IP, mensagem de erro de login genérica, editor de arquivos do painel desligado e cabeçalhos de segurança (nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy).
- Título das abas no formato **"Página | Bazar Brinquelândia"**.
- **Leveza:** sem scripts de emoji/oEmbed no `<head>` e no máximo 5 revisões por página/produto.
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
