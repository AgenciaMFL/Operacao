# Bazar Brinquelândia — Catálogo com Pedido pelo WhatsApp — Roadmap

**Loja:** Bazar Brinquelândia Papelaria — Av. Ataulfo de Paiva, 1060 Lj D, Leblon/RJ
**WhatsApp:** (21) 97128-1678 · **Instagram:** @bazarbrinquelandia
**Categorias:** Papelaria · Escritório · Brinquedos · Itens de Festa

## O que estamos construindo

Um site em **WordPress + WooCommerce + Elementor** que funciona como loja, mas **não cobra online**.

- O cliente navega por um **catálogo de produtos padrão** e adiciona ao carrinho.
- Se não encontrar o que procura, um botão **"Não encontrou? Fale com a gente"** abre o WhatsApp com o termo que ele buscou. O cliente **não cadastra produtos**.
- Ao finalizar, o pedido é **salvo no WordPress** e o cliente é levado ao **WhatsApp com um recibo pronto**.
- A **venda é fechada pelo WhatsApp**: preço final, frete e pagamento são combinados ali.
- **Só os donos da loja cadastram produtos e preços.** O catálogo começa com os produtos padrão e cresce aos poucos, sem cadastrar ~8 mil itens de início.

## Decisões já tomadas

| Tema | Decisão |
|---|---|
| Plataforma | WordPress + **WooCommerce** (gratuito), escala para milhares de produtos |
| Layout | Elementor (Pro recomendado para o Theme Builder e os widgets do Woo) |
| Pagamento online | **Nenhum**. Método único "Combinar pelo WhatsApp" |
| Catálogo inicial | Apenas os produtos padrão / mais vendidos |
| Quem cadastra produtos e preços | **Somente os donos da loja**. O cliente não adiciona produtos |
| Produto que não está no site | Botão "Não encontrou? Fale com a gente" leva ao WhatsApp. Se for vender, o dono inclui o item no pedido pelo painel |
| Lógica do carrinho e do WhatsApp | Plugin próprio, desenvolvido neste repositório |

## Decisões assumidas (podem mudar)

- [ ] Pedido **sem login** (checkout como visitante), para ter menos atrito.
- [ ] **Um único número** de WhatsApp para receber os pedidos: (21) 97128-1678, o mesmo do topo do site.

---

## Status atual

- [x] **Home montada** (topo com endereço/Instagram/WhatsApp, header com menu e ícone de carrinho, banner, "Nossas Categorias", carrossel "Destaques", botão "Ver todos os produtos")
- [x] Identidade visual definida (roxo, rosa, amarelo; logo)
- [x] Categorias principais definidas
- [ ] Ligar a home ao WooCommerce (ver Fase 5)

## Fase 0 — Insumos (responsável: cliente/agência)

- [x] Número de WhatsApp: (21) 97128-1678 *(confirmar se é o que recebe pedidos)*
- [ ] Lista dos produtos padrão (planilha: nome, SKU, categoria, preço, foto)
- [ ] Subcategorias dentro de Papelaria, Escritório, Brinquedos e Itens de Festa
- [ ] Hospedagem e domínio definidos (PHP 8.2+, 2 GB+ de RAM, Redis de preferência)
- [ ] Licença do Elementor Pro (sim/não)

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

## Fase 4 — Cadastro e "não encontrou" — Claude

- [ ] Botão **"Não encontrou? Fale com a gente"** na busca sem resultado e no catálogo, que abre o WhatsApp com o termo buscado
- [ ] Registro dos termos buscados sem resultado, para o dono saber o que cadastrar em seguida
- [ ] Guia de cadastro rápido para os donos (pelo painel do Woo e por planilha)
- [ ] Orientação para o dono incluir no pedido, pelo painel, um item que não estava no site

## Fase 5 — Layout no Elementor

- [ ] Header: ligar o ícone de carrinho ao **mini-carrinho do Woo** (contador real) e **adicionar uma busca**
- [ ] Menu "Produtos": listar as categorias do Woo
- [ ] Home — "Nossas Categorias": cada "Ver produtos" aponta para a página da categoria no Woo
- [ ] Home — "Destaques": trocar os cards fixos por um **carrossel dinâmico** de produtos marcados como "Destaque" no Woo
- [ ] Home — botões "Comprar agora": definir comportamento (adicionar ao carrinho direto ou abrir o produto) e renomear para algo como **"Adicionar ao pedido"**
- [ ] Home — "Ver todos os produtos" aponta para a página da loja
- [ ] Home — CTA "Não encontrou? Fale com a gente"
- [ ] Template de arquivo/loja (Loop Grid, 12–24 por página, filtros)
- [ ] Template de produto
- [ ] Carrinho, Finalizar pedido, Obrigado
- [ ] Versão mobile (é por onde a maioria dos clientes chega pelo WhatsApp)

## Fase 6 — Relatório de buscas sem resultado — Claude

- [ ] Tela no painel com os termos mais buscados que não tiveram resultado
- [ ] Atalho "Cadastrar produto" a partir do termo

## Fase 7 — Testes e lançamento

- [ ] Fluxo completo no celular (Android e iPhone) e no desktop
- [ ] Teste com carrinho grande (limite da mensagem)
- [ ] Teste de desempenho (PageSpeed)
- [ ] Treinamento dos donos e do atendente: cadastrar produtos, mudar o status do pedido, incluir item no pedido
- [ ] Publicação

## Fase 8 — Evolução (depois do lançamento)

- Importação em massa ou sincronização com ERP/fornecedor
- MCP do WooCommerce / Elementor para o Claude operar o catálogo
- Rodízio entre vários atendentes de WhatsApp
- Relatórios (mais pedidos, mais buscados, conversão)
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
