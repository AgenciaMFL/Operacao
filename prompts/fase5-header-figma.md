# Prompt — Fase 5: Header global (Figma) + menu lateral + home

Para colar no Claude Code local (Elementor MCP e Figma MCP conectados).

```
Fase 5 (versão final). NÃO mexa no Git. Relatório ✅/❌ no final e
atualize o RELATORIO.md.

0. LIMPEZA ANTES
   - Imagem antiga da Tinta Óleo (frasco, sem uso): aprovado excluir
     definitivamente, com as mesmas checagens de antes.
   - Temporary Login Without Password: confirme que não há logins
     temporários ativos e DESINSTALE o plugin.
   - Temp User (ID 2): confira se é autor de algum conteúdo. Se não for,
     me peça confirmação para excluí-lo (atribuindo conteúdo ao usuário 1).
     Não exclua sem eu confirmar.
   - Backups: mantenha a 2059 intacta. Antes de alterar qualquer template
     existente, duplique como rascunho.

1. HEADER GLOBAL A PARTIR DO FIGMA (NÃO usar canvas)
   Implement this design from Figma.
   @https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3119-82&m=dev

   - Crie o header como template de HEADER no Theme Builder do Elementor
     Pro, condição "Site inteiro", como RASCUNHO até eu aprovar.
   - Leia o frame pelo Figma MCP (get_design_context + get_screenshot)
     e reproduza fielmente: cores, fontes, tamanhos, espaçamentos, raios,
     sombra e alinhamentos. O frame tem 2560px de largura; a área de
     conteúdo é centralizada (~1460px) — adapte para o container do site.
   - Estrutura do design:
     a. Faixa superior roxa: à esquerda ícone de localização + "Av Ataulfo
        De Paiva, 1060 Lj D - Leblon/RJ" (link Google Maps); à direita
        ícone Instagram + "@bazarbrinquelandia" (link do perfil),
        separador vertical, ícone WhatsApp + "(21) 97128-1678"
        (https://wa.me/5521971281678).
     b. Faixa branca: logo à esquerda (link para a home); no centro, busca
        larga com placeholder "Buscar produtos" e ícone de lupa (widget de
        busca do Elementor Pro, restrita a PRODUTOS); à direita dois
        botões redondos rosa: carrinho (widget Menu Cart com contador real
        de itens, levando ao /carrinho/) e ☰ (abre o menu lateral).
   - NÃO há menu de texto no topo (Início, Sobre nós, Produtos, Contato
     saem). A navegação é pelo ☰ e pela busca.
   - ÍCONES: use os do Figma. Se não conseguir exportar algum, use os
     ícones nativos do Elementor (Font Awesome / ícones do Elementor) mais
     parecidos: map-marker, instagram, whatsapp, search, shopping-cart,
     bars. Mantenha cor e tamanho do design.
   - Celular (o design é desktop; adapte com bom senso): faixa roxa mais
     compacta (só ícones ou só WhatsApp), logo menor à esquerda, carrinho
     e ☰ à direita, busca em linha própria logo abaixo, ocupando a
     largura toda. Tablet: intermediário.
   - Header fixo (sticky) ao rolar, só a faixa branca, se ficar bom.

2. MENU LATERAL (off-canvas), dentro do template do header
   - Abre pela esquerda ao tocar no ☰ (widget Off-Canvas do Elementor Pro,
     ou Popup slide-in se não houver). Funciona em todas as páginas.
   - Conteúdo, nesta ordem:
     a. Topo roxo: "Olá! Bem-vindo à Brinquelândia" + botão "Falar no
        WhatsApp" (https://wa.me/5521971281678).
     b. "Retire na loja": Av. Ataulfo de Paiva, 1060 Lj D – Leblon/RJ,
        com link para o Google Maps.
     c. Links com ícone: Início, Todos os produtos (/loja/), Destaques.
     d. Categorias com seta › que expande as subcategorias (acordeão),
        com as categorias reais do Woo: Papelaria, Escritório,
        Brinquedos, Itens de Festa.
     e. Rodapé: Instagram @bazarbrinquelandia e WhatsApp (21) 97128-1678.
   - Fundo branco, ícones nas cores da marca, mesma fonte do header,
     fechar com ✕ ou tocando fora, animação suave.
   - NÃO incluir: Sobre nós, Contato, login/conta, pedidos, CEP.

3. HOME (rascunho 2060) SEM CANVAS
   - Continue na página 2060 ("Inicio – nova versão"); não recomece.
   - Remova o header (topbar + header) que está dentro da página e troque
     o modelo de "Elementor Canvas" para "Elementor Largura total"
     (ou o padrão do tema), para que use o header global do item 1.
   - Se a home tiver rodapé próprio dentro da página, transforme-o em
     template de FOOTER no Theme Builder ("Site inteiro", rascunho) e
     remova da página.
   - Confira o que já está na 2060: carrossel de Destaques com os 10
     produtos reais e fotos novas; selos com cor por categoria; links
     "Ver todos os produtos"/banner → /loja/ e "Ver produtos" de cada
     categoria → /categoria-produto/[slug]/.

4. PRÉ-VISUALIZAÇÃO (NÃO PUBLIQUE)
   - Gere pré-visualização e me mostre prints, em computador e celular:
     home (2060), menu lateral aberto, /loja/, uma página de produto,
     resultado de busca e carrinho com 1 item.
   - Compare lado a lado com o print do Figma e liste as diferenças que
     sobraram.
   - Plano de publicação (só quando eu aprovar): copiar o conteúdo da 2060
     para a Inicio (ID 10, que continua sendo a página inicial) com o
     novo modelo de página, publicar header/footer, manter a 2059 como
     backup. Não execute agora.

NÃO FAÇA: não reative o LiteSpeed, não use o link privado, não altere o
número do WhatsApp do plugin (segue o de teste), não mexa no checkout/
carrinho do plugin.
```
