# Prompt — Fase 5: ajustes do menu lateral (Figma) e títulos das páginas

```
Ajustes da Fase 5. NÃO mexa no Git. Pode PUBLICAR direto (site em "Em
breve"). Antes de alterar, duplique o template do header como rascunho de
backup. No final, me mande só os links e um relatório ✅/❌; atualize o
RELATORIO.md.

1. MENU LATERAL: NOVO DESIGN DO FIGMA
   Implement this design from Figma.
   @https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3140-622&m=dev

   - Leia o frame pelo Figma MCP (get_design_context + get_screenshot) e
     reproduza fielmente: cores, fontes, tamanhos, espaçamentos, raios,
     divisórias e ícones. Largura do painel: 356px no computador; no
     celular, 85% da largura da tela (máx. 356px).
   - Estrutura, de cima para baixo (igual ao Figma):
     a. Bloco roxo: "Olá!" pequeno + "Bem-vindo à Brinquelândia" em
        destaque e o X de fechar no canto superior direito.
        SEM botão "Falar no WhatsApp" (remover o atual).
     b. Navegação: Início, Todos os produtos (/loja/), Destaques — cada um
        com ícone rosa dentro de círculo rosa-claro.
     c. "CATEGORIAS": Papelaria, Escritório, Brinquedos, Itens de Festa,
        cada uma com borda arredondada colorida à esquerda (azul, rosa,
        laranja, roxo — cores do Figma) e seta › à direita. A seta abre/
        fecha as subcategorias (acordeão) com transição suave; o nome leva
        à página da categoria.
     d. Contato: Instagram @bazarbrinquelandia (link do perfil) e WhatsApp
        (21) 97128-1678 (https://wa.me/5521971281678), com os ícones do
        Figma.
     e. Por último, "RETIRE NA LOJA": Av. Ataulfo de Paiva, 1060 Lj D –
        Leblon/RJ + link "Ver no Google Maps".
   - Ícones: use os do Figma; se não der para exportar algum, use o ícone
     nativo do Elementor/Font Awesome mais parecido, com a mesma cor e
     tamanho.

2. ABRIR PELA DIREITA, COM ANIMAÇÃO SUAVE
   - O painel desliza da DIREITA para a esquerda.
   - Animação suave, sem tranco: transform translateX(100%) → 0, duração
     ~400ms, easing cubic-bezier(0.22, 1, 0.36, 1); ao fechar, ~300ms.
   - Fundo escuro (overlay) com fade de 0 → ~45% de opacidade em ~300ms.
   - Conteúdo do menu entra com leve fade + deslize (itens em cascata de
     ~30ms cada), discreto.
   - Respeitar prefers-reduced-motion (sem animação para quem desativa
     animações no sistema).
   - Fecha por: X, clique no overlay, tecla Esc e ao clicar em qualquer
     link do menu.

3. TRAVAR A ROLAGEM DA PÁGINA COM O MENU ABERTO
   - Com o menu aberto, a página de fundo NÃO rola (mouse, touchpad,
     teclado e toque no celular); só o menu rola, se o conteúdo for maior
     que a tela.
   - Use overflow hidden no html/body enquanto aberto + overscroll-behavior:
     contain no painel. Compense a largura da barra de rolagem para a
     página não "pular" para o lado ao abrir. No iPhone, garanta que o
     fundo não role (fixar o body na posição atual e restaurar ao fechar).
   - Ao fechar, a página volta exatamente para onde estava.

4. BOTÃO ☰
   - Remover a borda/contorno preto que aparece ao clicar. Manter um
     indicador de foco acessível só para teclado (:focus-visible), na cor
     da marca.

5. REMOVER O TÍTULO DAS PÁGINAS ("Inicio", etc.)
   - O tema Hello Elementor está exibindo o título da página (ex.:
     "Inicio" acima do banner). Oculte o título em TODAS as páginas do
     WordPress: Inicio, Loja, Carrinho, Finalização de compra e as
     demais páginas comuns. Prefira a configuração do tema (Hello
     Elementor → desativar título da página) ou as Configurações do Site
     do Elementor; só use CSS se não houver opção.
   - NÃO esconda: o nome dos produtos na página do produto, nem o título
     das categorias na listagem.

6. PUBLICAR E DEVOLVER LINKS
   - Publique o header atualizado e as páginas alteradas.
   - Me mande os links: home, /loja/, uma categoria, um produto e o
     /carrinho/, e o link de edição do template do header.
   - No relatório, uma linha por diferença que ficou em relação ao Figma
     (se houver) e como desfazer.

NÃO FAÇA: não reative o LiteSpeed, não use o link privado, não altere o
número do WhatsApp do plugin, não mexa no checkout/carrinho do plugin.
```
