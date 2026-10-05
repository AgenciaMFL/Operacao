# Catálogo com Pedido pelo WhatsApp — Roadmap

## O que estamos construindo

Um site em **WordPress + WooCommerce + Elementor** que funciona como loja, mas **não cobra online**.

- O cliente navega por um **catálogo de produtos padrão** e adiciona ao carrinho.
- Se não encontrar o que procura, ele **adiciona o próprio produto** (nome, quantidade e, se quiser, marca/medida, valor de referência, foto ou link).
- Ao finalizar, o pedido é **salvo no WordPress** e o cliente é levado ao **WhatsApp com um recibo pronto**.
- A **venda é fechada pelo WhatsApp**: preço final, frete e pagamento são combinados ali.
- Os produtos solicitados pelos clientes alimentam um **ranking**. Os mais pedidos viram produtos oficiais do catálogo, que cresce conforme a demanda real, sem cadastrar ~8 mil itens de início.

## Decisões já tomadas

| Tema | Decisão |
|---|---|
| Plataforma | WordPress + **WooCommerce** (gratuito), escala para milhares de produtos |
| Layout | Elementor (Pro recomendado para o Theme Builder e os widgets do Woo) |
| Pagamento online | **Nenhum**. Método único "Combinar pelo WhatsApp" |
| Catálogo inicial | Apenas os produtos padrão / mais vendidos |
| Produto que não está no site | Cliente adiciona pelo formulário. Fica **só no pedido dele**, sem ficar público |
| Valor informado pelo cliente | É só referência e **não entra no total oficial** |
| Lógica do carrinho e do WhatsApp | Plugin próprio, desenvolvido neste repositório |

## Decisões assumidas (podem mudar)

- [ ] Pedido **sem login** (checkout como visitante), para ter menos atrito.
- [ ] **Upload de foto** no produto solicitado, opcional e com limite de tamanho.
- [ ] **Um único número** de WhatsApp para receber os pedidos.

---

## Fase 0 — Insumos (responsável: cliente/agência)

- [ ] Número de WhatsApp que receberá os pedidos
- [ ] Lista dos produtos padrão (planilha: nome, SKU, categoria, preço, foto)
- [ ] Árvore de categorias
- [ ] Hospedagem e domínio definidos (PHP 8.2+, 2 GB+ de RAM, Redis de preferência)
- [ ] Licença do Elementor Pro (sim/não)
- [ ] Identidade visual (logo, cores, fontes)

## Fase 1 — Infraestrutura

- [ ] Instalar WordPress (+ SSL)
- [ ] Criar ambiente de **homologação (staging)**
- [ ] Instalar WooCommerce, Elementor (Pro) e um tema leve (Hello Elementor)
- [ ] Instalar plugins de desempenho: LiteSpeed Cache ou WP Rocket, Redis Object Cache
- [ ] Ativar o HPOS no WooCommerce

## Fase 2 — Configuração da loja

- [ ] Woo: moeda BRL, país Brasil, checkout como visitante, desativar contas obrigatórias
- [ ] Desativar todos os gateways de pagamento e o cálculo de frete
- [ ] Criar as categorias e os atributos (tamanho, cor, medida…)
- [ ] Montar a planilha-modelo de importação (CSV do Woo)
- [ ] Importar os produtos padrão
- [ ] Instalar a busca **FiboSearch** (versão grátis)

## Fase 3 — Plugin "Pedido pelo WhatsApp" (MVP) — Claude

- [ ] Método de pagamento "Combinar pelo WhatsApp"
- [ ] Status de pedido **"Aguardando contato"**
- [ ] Checkout simplificado: nome, WhatsApp, entrega/retirada, endereço (se entrega), observação
- [ ] Geração do recibo (itens, SKU, quantidades, subtotais, total)
- [ ] Redirecionamento para `wa.me` + página "Obrigado" com link reserva
- [ ] Recibo resumido + link do pedido quando o carrinho for grande demais para a URL
- [ ] Tela de configurações: número, cabeçalho e rodapé da mensagem

## Fase 4 — Produto solicitado pelo cliente — Claude

- [ ] Formulário "Adicionar produto que não está no site" (shortcode + widget Elementor)
- [ ] Item entra no carrinho como **"Produto solicitado — preço a confirmar"**
- [ ] Valor de referência exibido, mas fora do total oficial
- [ ] Upload de foto / link de referência
- [ ] Botão no carrinho, na **busca sem resultado** e flutuante no catálogo
- [ ] Recibo separado em "Produtos do catálogo" e "Produtos solicitados"

## Fase 5 — Layout no Elementor

- [ ] Header com busca e mini-carrinho
- [ ] Página inicial (destaques, categorias, CTA "Não achou? Peça aqui")
- [ ] Template de arquivo/loja (Loop Grid, 12–24 por página, filtros)
- [ ] Template de produto
- [ ] Carrinho, Finalizar pedido, Obrigado
- [ ] Versão mobile (é por onde a maioria dos clientes chega pelo WhatsApp)

## Fase 6 — Painel de produtos solicitados — Claude

- [ ] Lista dos produtos solicitados, agrupando nomes parecidos, com contagem de pedidos
- [ ] Botão **"Transformar em produto oficial"**, que cria o produto no Woo já preenchido
- [ ] Marcar como atendido / ignorado

## Fase 7 — Testes e lançamento

- [ ] Fluxo completo no celular (Android e iPhone) e no desktop
- [ ] Teste com carrinho grande (limite da mensagem)
- [ ] Teste de desempenho (PageSpeed)
- [ ] Treinamento do atendente: como mudar o status do pedido e converter solicitações
- [ ] Publicação

## Fase 8 — Evolução (depois do lançamento)

- Importação em massa ou sincronização com ERP/fornecedor
- MCP do WooCommerce / Elementor para o Claude operar o catálogo
- Rodízio entre vários atendentes de WhatsApp
- Relatórios (mais pedidos, mais solicitados, conversão)
- Pagamento online opcional (Pix/cartão), se fizer sentido no futuro

---

## Ordem de execução

```
Fase 0 (cliente) ──┐
                   ├─► Fase 1 ─► Fase 2 ─┐
Fase 3 (Claude) ───┤                     ├─► Fase 5 ─► Fase 6 ─► Fase 7
Fase 4 (Claude) ───┘                     │
                                         ┘
```

As Fases 3 e 4 (o plugin) podem começar **em paralelo** com a coleta de insumos e a infraestrutura.
