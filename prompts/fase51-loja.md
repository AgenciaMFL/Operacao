# Prompt — Fase 5.1: página da Loja / Categoria (Figma 3129:3)

```
Fase 5.1 — página da LOJA (e Categoria/Busca, mesmo template). NÃO mexa no
Git. Pode PUBLICAR direto. Antes, duplique como rascunho qualquer template
que for alterar. No final, me mande só os links e um relatório ✅/❌;
atualize o RELATORIO.md.

0. PRÉ-REQUISITO
   - Confirme que o plugin "MFL Pedido pelo WhatsApp" está na v0.3.0
     (traz os filtros "Destaques" e "Em promoção" por URL ?destaques=1 e
     ?promocao=1 e o shortcode [mfl_filtro tipo="destaques"] /
     [mfl_filtro tipo="promocao"]). Se estiver na 0.2.0, PARE e me avise.

1. DESIGN
   Implement this design from Figma.
   @https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3129-3&m=dev

   - Leia pelo Figma MCP (get_design_context + get_screenshot) e reproduza
     o layout: coluna de filtros à esquerda + grade de 4 colunas de cards,
     "Carregar mais" com contador e barra de progresso, e o rodapé.
   - Header global (2370), menu lateral e carrinho lateral já existem: NÃO
     altere.
   - Use o Theme Builder: template "Arquivo de produtos" com condição Loja,
     Categorias de produto e Resultados de busca de produtos. Card como
     Loop Item (tipo Produto) + Loop Grid com consulta "Consulta atual"
     (para respeitar categoria, busca, preço, ordenação e os filtros do
     plugin). Dados SEMPRE reais do Woo, nada fixo.

2. ADAPTAR À REALIDADE DA BRINQUELÂNDIA (o design é de outra loja)
   No CARD, manter:
   - Foto do produto (quadrada, fundo branco, object-fit: contain).
   - Nome (máx. 2 linhas, com reticências).
   - Selo da categoria (mesmas cores dos Destaques da home).
   - Preço: produto simples → valor; com variações → "a partir de R$ X";
     sem preço → "Sob consulta".
   - Promoção SÓ se o produto tiver preço promocional no Woo: preço antigo
     riscado + selo "-X%" calculado. Sem promoção, não mostrar nada disso.
   - Selo "DESTAQUE" (no lugar de "MAIS VENDIDO!") só nos produtos marcados
     com estrela (em destaque).
   - Botão rosa: o texto vem do plugin ("Adicionar ao pedido"; produtos com
     variação mostram "Ver opções"). Adicionar abre o carrinho lateral.
   - Linha pequena embaixo: "Valores confirmados no WhatsApp".
   No CARD, REMOVER (não existe na loja):
   - estrelas/avaliações, coração de favoritos, "2x sem juros",
     "Desconto no PIX", "Leve 3 pague 2", "Vendido e entregue por…",
     "MAIS VENDIDO!".

   FILTROS (coluna esquerda), manter só o que tem dado real:
   - "Filtrar por": botões liga/desliga com o shortcode do plugin:
     [mfl_filtro tipo="destaques"] e [mfl_filtro tipo="promocao"
     rotulo="Promoções"]. Estilize no padrão do Figma (classes .mfl-filtro,
     .is-active, .mfl-filtro__chave, .mfl-filtro__rotulo).
   - Faixa de preço (filtro de preço nativo do WooCommerce, com slider).
   - Categorias: Papelaria, Escritório, Brinquedos, Itens de Festa, com
     contagem; subcategorias aparecem ao abrir a categoria (acordeão), com
     busca interna se a lista for longa.
   - Ordenar por: Mais recentes, Menor preço, Maior preço, Nome A–Z
     (ordenação nativa do Woo), no topo da grade, à direita.
   - REMOVER: Departamentos, Fornecedor, Gênero, Idade, Marcas,
     "productClusterNames", "Vendido por" (não temos esses dados).
   - Botão "Limpar filtros" quando houver algum filtro ativo.

   TOPO DA GRADE:
   - Título: "Todos os produtos" na Loja; nome da categoria na Categoria;
     'Resultados para "termo"' na busca. Breadcrumb discreto.
   - Contador "Mostrando X de Y produtos".

   PAGINAÇÃO:
   - 24 produtos por vez, "Carregar mais" (Load on click do Loop Grid) com
     contador e barra de progresso como no Figma.

   SEM RESULTADO:
   - Quando a busca/filtro não achar nada, mostrar o quadro do plugin
     "Não encontrou? Fale com a gente" (shortcode [mfl_nao_encontrou]).

   RODAPÉ do Figma ("Visite nossa loja!" + card do Instagram):
   - Se já existir um rodapé igual no site, reaproveite. Se não, crie
     template de FOOTER no Theme Builder ("Site inteiro").
   - ATENÇÃO: o endereço no Figma está ERRADO ("Rua General San Martin,
     631, Loja A"). Use o correto: Av. Ataulfo de Paiva, 1060 Lj D –
     Leblon/RJ. Instagram @bazarbrinquelandia e WhatsApp (21) 97128-1678.
   - Barra final: "© 2026 Bazar Brinquelândia. Todos os direitos
     reservados." e "Desenvolvido por MFL" (como no Figma).

3. CELULAR E TABLET
   - Celular: grade de 2 colunas; filtros saem da lateral e viram um botão
     "Filtrar" fixo no topo da grade que abre uma gaveta pela DIREITA
     (mesma animação, overlay e trava de rolagem do menu lateral; uma
     gaveta por vez). "Ordenar" ao lado do "Filtrar".
   - Tablet: 3 colunas, filtros na gaveta.
   - Áreas de toque com pelo menos 44px.

4. DESEMPENHO
   - Imagens com lazy load e tamanho de miniatura do Woo (não a original).
   - Não carregar scripts extras fora das páginas de produto/loja.

5. TESTES
   - /loja/, /categoria-produto/papelaria/, uma subcategoria, uma busca com
     resultado e uma sem resultado.
   - Filtros: Destaques, Promoções, preço, categoria e ordenação, sozinhos
     e combinados; "Limpar filtros".
   - Card de produto simples, com variação, com promoção (se houver algum)
     e sem preço.
   - "Carregar mais" até o fim.
   - Celular: gaveta de filtros abre/fecha e não deixa o fundo rolar.

6. PUBLICAR E DEVOLVER
   - Links: /loja/, uma categoria, uma busca, e link de edição de cada
     template criado (arquivo de produtos, loop item, footer).
   - No relatório, uma linha por diferença que ficou em relação ao Figma.

NÃO FAÇA: não reative o LiteSpeed, não use o link privado, não altere o
header/menu/carrinho lateral, nem o número do WhatsApp ou o funcionamento
do plugin de pedidos. Não instale plugin de filtros.
```
