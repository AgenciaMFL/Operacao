# Integração Uniplus × WooCommerce (estoque)

Objetivo: quando o estoque de um produto zera no Uniplus, ele some do site; quando volta, reaparece. Os produtos são casados pelo **SKU do site = campo "Código" do Uniplus** (não o código de barras).

## Configuração no Uniplus

**E-commerce → Configurações → WooCommerce "Brinquelandia" → Alterar (F3)**

- **Geral:**
  - URL de produção: `https://bazarbrinquelandia.com.br/wp-json/wc/v3`
  - App key / App secret: chave REST **"Uniplus"** do WooCommerce, com permissão Ler/Escrever. A chave não fica registrada aqui.
  - "Habilitar log das comunicações" ligado.
- **Produto:**
  - **Desligados:** Enviar nome, Enviar imagem, Enviar categoria, Enviar saldo previsto e Cadastrar variação. O nome, a foto e a categoria são os do site.
  - Pauta de preço: Preço base.
  - Limite de produtos na sincronização: **1** durante os testes. Volta a **0** (sem limite) quando o teste for aprovado.
- **Pedidos:** **nunca** usar "Sincronizar pedidos". A venda é fechada no WhatsApp e lançada no Uniplus à mão.

Só vão para o site os produtos com **"Envia para… = Brinquelandia"** no cadastro. Em 26/11/2026, havia 7.766 produtos marcados (herança do site antigo) e 56 produtos no site.

## Configuração no WooCommerce

- Produtos → Inventário: gerenciamento de estoque **ligado**, **ocultar itens fora de estoque** ligado, notificações de estoque baixo e esgotado desligadas.
- Fuso horário: America/Sao_Paulo.
- Chaves REST: só "Uniplus" e "Claude Code MCP". A antiga "Claudinho" foi revogada.

## Situação (26/11/2026)

- 16:21: o Uniplus conectou ao site (teste de conexão ao gravar a configuração).
- 16:22: sincronização geral disparada, com limite 1. Ficou na fila.
- 16:28: sincronização só do SKU 15685 (BLOCO APARAS, ID 2649; estoque 2.791, R$ 3,10), feita por Ações → Sincronizar com e-commerce. Ficou na fila ("agendada").
- Até o momento, nada mudou no site e nenhum produto foi duplicado.

## Porteiro no plugin (0.7.0, 27/11/2026)

Testes de 26 e 27/11 mostraram o seguinte:
- O Uniplus guarda os **IDs do site antigo** (ex.: BLOCO APARAS = 22743, que hoje é o 2649).
- Ele tem **7.766 produtos marcados**, e cria um **rascunho** para cada um que não acha no site (foi o caso do relógio, ID 2740).
- A fila roda em horários fixos (18:00, 9:00…), um produto por passada quando o limite é 1.

O plugin 0.7.0 resolve isso do lado do site, sem alterar a base do Uniplus:
- **Produto existente:** casa pelo SKU e aplica só estoque e preço.
- **Produto que não existe no site:** recusa.
- **Pedidos:** invisíveis para o Uniplus.

Com isso, dá para voltar o **limite para 0**. O registro fica em WooCommerce → Uniplus.

### 0.7.1 (27/11/2026): correção depois da primeira passada

Às 11:06, o Uniplus mandou `POST /products/2720` **só com o ID**, sem SKU, e com estoque 0. A versão 0.7.0 aceitou: ligou o controle de estoque do produto 2720 (SKU 438798966) e o deixou fora de estoque. Esse ID era quase certamente do site antigo e correspondia a outro produto.

A versão 0.7.1 corrige isso:
- **ID sem SKU** só é aceito se o produto já foi confirmado antes pelo SKU (meta `_mfl_uniplus_vinculo`). Caso contrário, devolve 404. A expectativa é que o Uniplus tente então criar o produto mandando o SKU; aí casamos pelo SKU e devolvemos o ID certo.
- **Conflito:** se, em menos de 20 minutos, o mesmo produto receber quantidades diferentes pelo ID, o vínculo é desfeito e nada é aplicado.

### Situação em 27/11/2026, 16:30

- **Plugin 0.7.4** instalado. O porteiro tem a caixinha "Vinculado ao Uniplus" no produto, na aba Estoque, e um diagnóstico em WooCommerce → Uniplus.
- **BLOCO APARAS (2649):** vinculado. No Uniplus, o Código no E-commerce é 2649. No teste simulado com a chave do Uniplus (15:59), recebeu estoque 2791, com o controle de estoque ligado.
- **Tarefa gigante das 10:54** (limite 10000): travou depois de centenas de chamadas lentas. O IP do Uniplus, **177.72.162.12**, foi para a lista de bloqueio do firewall da Hostinger. A Hostinger liberou o IP e o TI cancelou a tarefa.
- **16:29:** a tarefa com limite 1 respondeu em 0,3 s com "Produto 438786367 … não existe na loja (ECOM446)". O Uniplus atende **o próximo da fila**, e não o produto em que se clica. Com 7.766 marcados, a fila não chega aos produtos do site.
- **Regra:** **nunca** usar limite alto enquanto houver milhares de produtos marcados. Manter **limite = 1**.
- **Chave "Uniplus":** apareceu nos logs da hospedagem (o Uniplus manda a chave na URL) e no chat. Trocar: revogar a antiga e criar outra com o **mesmo nome "Uniplus"**.
- **LiteSpeed:** recomendado desligar "Cache REST API" e excluir `/wp-json/` do cache (prompt pronto, ainda não aplicado).

### 27/11/2026, 18:00: conexão restabelecida

- O bloqueio do IP **177.72.162.12** na Hostinger saiu (depois do chamado com o atendente). Às 18:00:55, o Uniplus chegou ao site **sozinho, sem ninguém clicar**. Isso indica que há uma sincronização automática, provavelmente de hora em hora.
- **Como o Uniplus trabalha:**
  1. faz `GET /wc/v3/products/{Código no E-commerce}`;
  2. se receber 404, registra "não existe na loja" e segue para o próximo, sem criar nada;
  3. se o produto existir, envia o estoque (o porteiro aplica nos produtos com vínculo);
  4. consulta também `GET /wc/v3/orders`, e o porteiro devolve uma lista vazia.
- **Falta:** a fila tem 7.766 produtos marcados, e com limite 1 é um produto por passada. **Próximo passo (28/11):** olhar a tela "Alteração em massa dos produtos" no Uniplus (sem aplicar nada) e deixar marcados só os produtos do site. Depois: vincular os 56 produtos (deixar o Código no E-commerce vazio para o Uniplus "criar" e o porteiro ligar pelo SKU, ou colocar o ID e marcar a caixinha), liberar o limite e testar "zerou → some".

## Pendências

1. Confirmar que a fila rodou: o "Último acesso" da chave Uniplus deve mudar para depois de 16:28. Depois, comparar com o estado de antes, na parte 2 do teste.
2. Ver se o Uniplus liga o `manage_stock` ao enviar o estoque. Hoje os 56 produtos estão com `manage_stock = false`, e o WooCommerce ignora a quantidade enquanto estiver assim. Se o Uniplus não ligar, é preciso ligar produto a produto, gravando antes a quantidade, para nada sumir por engano.
3. Confirmar com o suporte do Uniplus:
   - com que frequência a fila roda;
   - se a mudança de estoque é enviada sozinha;
   - se a integração cria produtos que não existem no site.
4. Decidir com a loja o que fazer com os 7.766 produtos marcados para o e-commerce: desmarcar os que não estão no site ou manter.
5. Regra para a equipe: todo produto novo no site deve ter o **SKU igual ao Código do Uniplus**.
