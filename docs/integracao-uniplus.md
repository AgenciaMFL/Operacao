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

## Pendências

1. Confirmar que a fila rodou: o "Último acesso" da chave Uniplus deve mudar para depois de 16:28. Depois, comparar com o estado de antes, na parte 2 do teste.
2. Ver se o Uniplus liga o `manage_stock` ao enviar o estoque. Hoje os 56 produtos estão com `manage_stock = false`, e o WooCommerce ignora a quantidade enquanto estiver assim. Se o Uniplus não ligar, é preciso ligar produto a produto, gravando antes a quantidade, para nada sumir por engano.
3. Confirmar com o suporte do Uniplus:
   - com que frequência a fila roda;
   - se a mudança de estoque é enviada sozinha;
   - se a integração cria produtos que não existem no site.
4. Decidir com a loja o que fazer com os 7.766 produtos marcados para o e-commerce: desmarcar os que não estão no site ou manter.
5. Regra para a equipe: todo produto novo no site deve ter o **SKU igual ao Código do Uniplus**.
