# Como cadastrar um produto (Bazar Brinquelândia)

## Produto simples (sem opções de cor/tamanho)

1. Painel do WordPress → **Produtos → Adicionar novo**.
2. **Nome** do produto no campo do topo (ex.: "Caderno Universitário Stitch 1 Matéria").
3. **Descrição** (opcional) na caixa grande logo abaixo.
4. Caixa **Dados do produto** (mais abaixo), aba **Geral**:
   - Tipo: **Produto simples**.
   - **Preço** em "Preço normal" (ex.: `34,90`). Sem preço = aparece como "sob consulta" no pedido.
5. Aba **Inventário**:
   - **SKU** = código do sistema da loja (ex.: `438797652`).
   - Status do estoque: **Em estoque**. Não precisa marcar "Gerenciar estoque".
6. Coluna da direita:
   - **Categorias**: marque a categoria (e a subcategoria, se houver).
   - **Imagem do produto**: clique em "Definir imagem do produto" e envie a foto (de preferência quadrada, fundo branco).
7. Clique em **Publicar**.

## Produto com opções (cores, números, tamanhos)

1. Faça os passos 1 a 3 acima.
2. Em **Dados do produto**, escolha **Produto variável**.
3. Aba **Atributos**:
   - Nome: `Opção` (ou `Cor`).
   - Valores separados por `|` (ex.: `Azul | Vermelho | Verde`).
   - Marque **Usado para variações** e clique em **Salvar atributos**.
4. Aba **Variações** → **Gerar variações**. Abra cada uma e coloque **preço** e **SKU** (e a foto, se quiser uma por cor).
5. Categorias e imagem principal como no produto simples → **Publicar**.

## Dicas

- **Destaque na home:** em **Produtos**, clique na **estrela ☆** ao lado do produto. Ele entra no carrossel "Destaques".
- **Trocar foto ilustrativa pela real:** abra o produto, clique na imagem atual → "Remover imagem do produto" → envie a nova. Depois, em **Tags do produto**, remova a tag `foto-ilustrativa`.
- **Ver quais ainda têm foto ilustrativa:** Produtos → filtrar pela tag `foto-ilustrativa`.
- **Foto leve:** se possível, envie em WebP ou JPG com até ~300 KB.
- **Muitos produtos de uma vez:** Produtos → **Importar**, com planilha CSV (peça o modelo à agência).
- **O que os clientes procuram e não acham:** WooCommerce → **Buscas sem resultado** (tem atalho "Cadastrar produto").
