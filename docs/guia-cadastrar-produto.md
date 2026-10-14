# Como cadastrar produtos (Bazar Brinquelândia)

Tudo é feito no painel do WordPress: **bazarbrinquelandia.com.br/wp-admin**.
O produto aparece sozinho no site inteiro (Loja, categoria, busca, menu, carrinho e recibo do WhatsApp) assim que você clica em **Publicar**. Não é preciso mexer no Elementor.

---

## 1. Produto simples (sem opções)

Use quando o produto é um só, sem escolha de cor, modelo ou tamanho.

1. **Produtos → Adicionar novo**.
2. **Nome** no campo do topo. Escreva como o cliente procuraria: "Caderno Universitário Stitch 1 Matéria".
3. **Descrição** (opcional) na caixa grande logo abaixo.
4. Caixa **Dados do produto**, aba **Geral**:
   - Tipo: **Produto simples**.
   - **Preço normal**: ex. `34,90`.
   - **Preço promocional** (opcional): ex. `29,90`. O site mostra o preço antigo riscado e o produto entra no filtro "Em promoção".
5. Aba **Inventário**:
   - **SKU** = código do sistema da loja (ex.: `438797652`).
   - Status do estoque: **Em estoque**. Se acabar, troque para **Fora de estoque**: o produto continua no site, mas não dá para pedir.
6. Coluna da direita:
   - **Categorias**: marque a **categoria principal E a subcategoria** (ex.: ☑ Papelaria e ☑ Cadernos).
   - **Imagem do produto**: "Definir imagem do produto" → envie a foto.
7. **Publicar**.

> ⚠️ **Sem preço, o produto não pode ser pedido.** O botão "Adicionar carrinho" não aparece. Se o preço varia, coloque o valor mais comum: o valor final é sempre confirmado no WhatsApp.

---

## 2. Produto com opções (cores, modelos, tamanhos)

Use quando o cliente precisa escolher uma opção, por exemplo uma caneta em 3 cores. No site aparece o seletor **"Opção: Azul"**, e o preço muda conforme a opção.

1. Faça os passos 1 a 3 do produto simples.
2. Em **Dados do produto**, troque o tipo para **Produto variável**.
3. Aba **Atributos**:
   - Em "Atributo personalizado", clique em **Adicionar**.
   - **Nome:** `Opção`
   - **Valor(es):** as opções separadas por `|`, ex.: `Azul | Rosa | Amarelo`
   - Marque **Usado para variações**.
   - Clique em **Salvar atributos**.
4. Aba **Variações**:
   - Clique em **Gerar variações** → **OK**. Aparece uma linha para cada opção.
   - **Mesmo preço para todas?** No menu "Ações em massa", escolha **Definir preços normais**, digite o preço e aplique.
   - **Preços diferentes?** Clique em cada variação para abrir e preencha **Preço normal** e **SKU** (o código daquela cor ou modelo no sistema).
   - **Opção que já vem marcada:** no topo da aba, em **Valores padrão do formulário**, escolha a opção mais vendida.
   - Clique em **Salvar alterações**.
5. Categorias e imagem principal como no produto simples → **Publicar**.

Dicas:
- **Variação sem preço não aparece** para o cliente. Use isso para esconder uma cor que acabou ou, melhor ainda, marque a variação como **Fora de estoque**.
- **Foto por opção** é opcional: dentro de cada variação, clique no ícone de imagem. Se não colocar, o site usa a foto principal.
- **Nomes das opções:** use nomes que o cliente entende ("Azul", "Modelo 1", "Unicórnio"), nunca o código do sistema. O código vai no **SKU**.

---

## 3. Categorias e menu

- Os produtos ficam nas categorias que **já existem** (Papelaria, Escritório, Brinquedos, Itens de Festa e as subcategorias). Marque sempre a principal **e** a subcategoria.
- **Criar categoria nova:** **Produtos → Categorias**:
  - **Nome**: ex. "Mochilas".
  - **Ascendente**: escolha a categoria principal (ex.: Papelaria) para ela virar uma subcategoria. Deixe "Nenhum" para criar uma categoria principal nova.
  - **Cor no menu** (só para categoria principal): a cor da borda no menu lateral.
  - **Adicionar nova categoria**.
- A categoria nova **aparece sozinha** no menu lateral e nos filtros da Loja **assim que tiver pelo menos 1 produto publicado**.
- **Ordem no menu:** em **Produtos → Categorias**, arraste as categorias para a ordem desejada. Subcategorias chamadas "Outros…" ficam sempre por último.
- Não apague uma categoria que tem produtos: antes, mude os produtos de categoria.

---

## 4. Destaques e promoções

- **Destaque na home:** em **Produtos**, clique na **estrela ☆** ao lado do produto (ela fica cheia ★). Ele entra no carrossel "Destaques" e no filtro "Destaques" da Loja.
- **Promoção:** preencha o **Preço promocional** (no produto simples ou em cada variação). Para programar início e fim, clique em "Agendar" ao lado do preço.

---

## 5. Fotos

- **Formato:** quadrada (ex.: 1000 × 1000 px), fundo branco ou claro, em **WebP ou JPG de até ~300 KB**. Foto pesada deixa o site lento.
- **Trocar a foto ilustrativa pela real:** abra o produto → clique na imagem → "Remover imagem do produto" → envie a nova. Depois, em **Tags do produto**, remova a tag `foto-ilustrativa`.
- **Ver quais ainda têm foto ilustrativa:** Produtos → filtrar pela tag `foto-ilustrativa`.

---

## 6. Esconder ou tirar um produto

- **Esgotou por um tempo:** estoque **Fora de estoque** (continua no site, sem botão de pedir).
- **Tirar do site sem apagar:** abra o produto → em "Publicar", clique em **Status: Publicado → Editar → Rascunho** → **Atualizar**.
- **Apagar:** Produtos → passe o mouse sobre o produto → **Lixeira**. Fica 30 dias na lixeira, e dá para restaurar.

---

## 7. Outras dicas

- **Muitos produtos de uma vez:** Produtos → **Importar**, com planilha CSV (peça o modelo à agência).
- **O que os clientes procuram e não acham:** WooCommerce → **Buscas sem resultado** (tem atalho "Cadastrar produto").
- **Pedidos:** WooCommerce → **Pedidos**. Pedido novo chega como **Aguardando contato**. Depois de combinar e receber pelo WhatsApp, mude para **Processando**, e para **Concluído** ao entregar. Se o pedido não fechar, mude para **Cancelado**.
- **O produto não apareceu?** Confira se:
  - está **Publicado** (e não em rascunho);
  - tem **preço**;
  - tem **categoria** marcada;
  - está **Em estoque**.
  Se estiver tudo certo, recarregue o site com Ctrl + F5.
