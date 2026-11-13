# Prompt — Corrigir e modernizar o menu (header + dropdown)

O menu novo está QUEBRADO e com visual de site antigo. Corrija e modernize. Siga o CLAUDE.md.
Referência visual do header original (Figma, só o nó do menu):
https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3915-600

## Problemas atuais (corrigir todos)
1. QUEBRA DE LINHA: "Agende sua visita" foi como ITEM do menu e caiu para uma 2ª linha.
   Remova esse item da lista do menu (Aparência → Menus) — ele já existe como botão à direita.
   O menu inteiro deve caber em UMA linha (white-space: nowrap nos itens).
2. FONTE ERRADA: menu e botão estão em Arial/fonte do sistema. Use a fonte global do site
   (a mesma dos títulos/corpo, ex.: Fira Sans — confirme no CLAUDE.md), carregada corretamente.
3. COR: itens cinza apagado. Use navy (#022169) com hover/ativo em cyan (#00ADE9).
4. SETAS: os triângulos cheios (ícone de fonte) parecem antigos. Troque por chevron SVG fino
   (stroke 1.75–2px, 12–14px), que gira 180° ao abrir.
5. BOTÃO: está navy, com letras apertadas e fonte errada. Deve ficar igual ao Figma:
   pílula cyan, texto branco "Agendar minha visita", fonte global 15px peso 600, letter-spacing normal,
   padding ~12px 22px, com o hover .hs-btn. Continua abrindo o popup (.hs-open-form).
6. DROPDOWN antigo (texto centralizado, negrito grande, sem estrutura). Refazer (ver abaixo).

## Header moderno
- Altura ~80px desktop, conteúdo alinhado ao grid de 1280px: logo à esquerda, menu centralizado,
  botão à direita, tudo centralizado na vertical.
- Itens: 15–16px, peso 500, navy, espaçamento ~32px entre itens.
- Hover: cor cyan + sublinhado fino que cresce da esquerda (2px, transição 200ms).
  Item da página atual: cyan com o sublinhado fixo.
- Header fixo (sticky): fundo branco; ao rolar a página ganha sombra suave
  (0 4px 20px rgba(2,33,105,.08)) e fica um pouco mais baixo (~68px). Transição suave.

## Dropdown moderno
- Card branco, border-radius 14px, sombra suave (0 12px 32px rgba(2,33,105,.12)),
  borda 1px rgba(2,33,105,.06), padding 8px, largura mínima ~240px.
- Abre logo abaixo do item, alinhado à esquerda do item, com espaço de ~10px
  (área invisível de "ponte" para o mouse não perder o hover no caminho).
- Itens: texto ALINHADO À ESQUERDA, 15px peso 500, navy, padding 10px 14px, border-radius 10px;
  hover: fundo ice claro (#EEF4F9 ou o ice do CLAUDE.md) e texto cyan.
- Opcional (se ficar bom): uma linha curta de descrição em cinza (13px) abaixo de cada subitem.
- Animação: opacity 0→1 + translateY(6px→0), 180ms ease-out. Nada de bounce.
- Abre no hover (atraso de fechamento ~150ms) e no clique/teclado; fecha com ESC e clique fora.

## Mobile/tablet (≤1024px)
- Conferir que o hambúrguer + painel com accordion estão funcionando e com o mesmo cuidado visual:
  fonte global, itens 18px, subitens 16px indentados, chevrons SVG, divisórias finas,
  botão cyan "Agende sua visita" no fim. Nada de quebra de linha estranha.

## Verificação
- Screenshots (Playwright) do header em 1440px, 1280px, 1024px e 390px, com e sem dropdown aberto,
  e com a página rolada (header sticky). O menu tem que caber em uma linha em 1280px.
- Teste: todos os links e âncoras funcionam; botão abre o popup.
- Commit + push. Responder só com o resumo e os screenshots salvos no repositório.
