# Prompt — Fase 5: Home ligada ao WooCommerce + menu lateral

Para colar no Claude Code local (com o Elementor MCP conectado). Use depois que as imagens dos produtos estiverem no site.

```
Fase 5: ligar a home (página Inicio, ID 10) ao WooCommerce e criar o menu
lateral, usando o Elementor MCP. Relatório ✅/❌ no final e atualize o
RELATORIO.md.

0. BACKUP
   - Duplique a página Inicio como rascunho "Inicio – backup [data]".
   - Se o header/footer forem templates do Theme Builder, duplique também
     como rascunho antes de alterar.

1. CARROSSEL "DESTAQUES" DINÂMICO
   - Crie um template Loop Item (tipo Produto) que reproduza o card atual:
     imagem do produto, título, selo da categoria (contorno arredondado,
     cor por categoria) e botão rosa arredondado de adicionar ao carrinho
     (o texto "Adicionar ao pedido" vem do plugin). Mesmo raio, borda,
     sombra, fontes e espaçamentos dos cards atuais.
   - Substitua o carrossel fixo de 5 slides por um Loop Carousel com esse
     template, consulta: Produtos → em destaque. Mantenha setas, pontos,
     título "DESTAQUES" e o botão "Ver todos os produtos".
   - Cores do selo por categoria (CSS do site, classe product_cat-*):
     use as cores exatas dos selos atuais da home (Papelaria azul,
     Escritório rosa, Brinquedos amarelo/laranja, Itens de Festa roxo).

2. LINKS
   - "Ver todos os produtos" → /loja/
   - "Conheça nossos produtos" (banner) → /loja/
   - "Ver produtos" de cada card de "Nossas Categorias" →
     /categoria-produto/papelaria/, /categoria-produto/escritorio/,
     /categoria-produto/brinquedos/, /categoria-produto/itens-de-festa/
   - Menu do topo, item "Produtos": dropdown com as 4 categorias.
     Não altere os outros itens do menu do topo.

3. HEADER
   - Troque o ícone de carrinho fixo pelo widget Menu Cart do Elementor
     Pro (contador real de itens), mesmo estilo/cor/posição, levando ao
     /carrinho/.
   - Adicione uma busca de produtos (widget de busca do Elementor Pro,
     restrita a produtos), discreta, ao lado do carrinho, no estilo do
     site. Quando não houver resultado, o plugin já mostra o quadro
     "Não encontrou? Fale com a gente".

4. MENU LATERAL (off-canvas)
   - Menu que abre pela esquerda ao tocar no ícone ☰, com o widget
     Off-Canvas do Elementor Pro (ou Popup slide-in, se o Off-Canvas não
     estiver disponível), dentro do template do header.
   - Conteúdo, nesta ordem:
     a. Topo roxo da marca: "Olá! Bem-vindo à Brinquelândia" + botão
        "Falar no WhatsApp" (https://wa.me/5521971281678).
     b. Bloco "Retire na loja": Av. Ataulfo de Paiva, 1060 Lj D –
        Leblon/RJ, com link para o Google Maps.
     c. Links com ícone: Início, Todos os produtos (/loja/), Destaques.
     d. Categorias com seta › que expande as subcategorias (acordeão),
        com as categorias reais do Woo: Papelaria, Escritório,
        Brinquedos, Itens de Festa.
     e. Rodapé: Instagram @bazarbrinquelandia e WhatsApp (21) 97128-1678.
   - Visual: fundo branco, ícones nas cores da marca, fonte do site,
     fechar com ✕ ou tocando fora, animação suave.
   - Celular: o ☰ substitui o menu do topo. Computador: manter o menu do
     topo e mostrar o ☰ com o texto "Categorias".
   - NÃO incluir: Sobre nós, Contato, login/conta, pedidos,
     "entregar em CEP".

5. ANTES DE PUBLICAR
   - Gere link de pré-visualização (computador e celular) e me mostre o
     que mudou em cada item.
   - ESPERE minha aprovação para publicar.

NÃO FAÇA: não reative o LiteSpeed, não use o link privado, não altere o
número do WhatsApp do plugin (segue o de teste), não mexa no checkout/
carrinho.
```
