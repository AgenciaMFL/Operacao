# Catálogo — Lote 1

`woocommerce-import-lote1.csv`: os **260 produtos principais** escolhidos da planilha de estoque (21/09/26, ~8.470 SKUs), no formato do importador do WooCommerce.

## Como foram escolhidos
A planilha não tem histórico de vendas, então a escolha usa o estoque como indicador do que a loja mais compra e vende:

- **Agrupamento de variações:** itens que só mudam cor, número ou código de cor (ex.: "Tinta Óleo 20ml" em 49 cores) viram **1 produto com variações**.
- **Pontuação:** estoque total (30%), valor em estoque a preço de venda (30%), nº de variações (20%) e tamanho da família de produtos (20%).
- **Época:** Natal e Brinquedos ganharam peso. Junina, Páscoa e agendas 2026 ou anteriores ficaram de fora.
- **Equilíbrio:** Papelaria 110, Escritório 50, Brinquedos 45, Itens de Festa 55. No máximo 3 produtos da mesma família.
- **Destaques:** 10 produtos marcados como "Em destaque" para o carrossel da home.

## Conteúdo do arquivo
- 39 produtos simples, 221 produtos variáveis (atributo "Opção") e 1.597 variações.
- Categorias com subcategorias (ex.: `Papelaria > Arte e Pintura`, `Itens de Festa > Balões`).
- Preço de venda e EAN da planilha. **Estoque não é controlado no site**: todos entram como "em estoque", porque a venda é confirmada no WhatsApp.
- Entram **publicados**. A loja está no modo "Em breve", então ninguém de fora vê. **Faltam as fotos**, que precisam entrar antes do lançamento.
- Os nomes foram gerados a partir da descrição do ERP (abreviações e acentos corrigidos em parte). Revise os principais.
