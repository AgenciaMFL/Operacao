# Proposta comercial dinâmica

Proposta em formato de site: uma capa com o nome do cliente e o botão **Abrir proposta**, que revela a proposta completa (quem somos, objetivos, entregáveis, cronograma, investimento e próximos passos).

O visual (front-end) fica fixo. **Todo o conteúdo** — nome do cliente, contato, valores, entregáveis, textos, condições, responsável — vem de um arquivo `.json` por proposta, que o comercial edita por um formulário.

## Estrutura

```
index.html              → a proposta (o que o cliente vê)
editor.html             → editor para o time comercial
propostas/              → um arquivo .json por cliente
  exemplo.json          → modelo base
assets/css, assets/js   → visual e lógica (não precisa mexer)
```

## Como o comercial cria uma proposta

1. Abra `editor.html`.
2. Clique em **Nova (modelo)** para começar do modelo, ou em **Abrir proposta…** para editar uma que já existe.
3. Preencha os campos à esquerda — a pré-visualização à direita atualiza na hora.
   - **Nome do arquivo**: ex. `bella-massa`. Vira o link da proposta.
   - Cada seção tem a opção **Exibir**, para esconder o que não se aplica.
   - Itens de investimento: valor, valor "de" (aparece riscado), quantidade e cobrança (mensal, único, etc.). Os totais são calculados automaticamente, separados por tipo de cobrança.
   - Textos aceitam variáveis: `{contato}`, `{empresa}`, `{agencia}`, `{responsavel}`, `{numero}`, `{validade}`.
4. Use **Ver capa** e **Celular** para conferir como o cliente vai ver.
5. Clique em **Baixar .json** e envie o arquivo para a pasta `propostas/` do repositório (no GitHub: *Add file → Upload files*).
6. Envie ao cliente o link: `https://SEU-DOMINIO/index.html?p=bella-massa`

O rascunho fica salvo no navegador enquanto você edita, então dá para fechar e voltar depois.

## O que o cliente vê

- **Capa** em tela cheia com o nome da empresa, saudação personalizada e o botão para abrir.
- **Proposta** com menu fixo, barra de progresso de leitura e animações ao rolar.
- **Investimento** com os totais e a data de validade (data da proposta + dias de validade).
- **Botão de aprovação** que abre o WhatsApp do responsável com uma mensagem pronta (ou e-mail, se não houver WhatsApp).
- Botão **PDF** para salvar/imprimir.

## Publicação

É um site estático, sem build: qualquer hospedagem serve (GitHub Pages, Netlify, Vercel). A página precisa ser aberta por um servidor — abrir o `index.html` direto do computador (`file://`) não carrega o JSON.

Para testar localmente:

```bash
python3 -m http.server 8000
# http://localhost:8000/index.html?p=exemplo
# http://localhost:8000/editor.html
```

> Quem tiver o link de uma proposta consegue abri-la. Use nomes de arquivo difíceis de adivinhar (ex.: `bella-massa-7f3k`) se não quiser que propostas sejam encontradas por tentativa.
