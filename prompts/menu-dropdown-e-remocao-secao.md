# Prompt — Novo menu com dropdown (desktop e mobile) + remover seção da Home

Ajustes no site da Hebraica School (Elementor). Siga o CLAUDE.md. Não precisa ler o Figma.

## 1. Remover seção da Home
- Remova da Home a seção inteira de fundo azul-claro (ice) "O futuro não pedia que deixássemos
  de ser Hebraica." (subtítulo "Pedia uma nova forma de dizer quem sempre fomos.", parágrafos,
  destaque "Não faltava essência. Faltava tradução." e a foto da mãe com a criança).
- Confira se o espaçamento entre a seção anterior e a seguinte ficou correto (sem buraco nem
  seções coladas) em desktop e mobile.

## 2. Nova estrutura do menu
Menu principal (nesta ordem):
1. A Escola → /a-escola/
   - Quem somos → /a-escola/#quem-somos
   - Nossa História → /a-escola/#nossa-historia
   - Missão e Visão → /a-escola/#missao-e-visao
2. Proposta Pedagógica → /proposta-pedagogica/
   - Nossa Proposta → /proposta-pedagogica/
   - Educação Bilíngue → /educacao-bilingue/
3. Cultura Judaica → /cultura-judaica/
   - Pertencimento e identidade → /cultura-judaica/#pertencimento-e-identidade
   - Celebrações e Calendário Judaico → /cultura-judaica/#celebracoes
     (aponte para a seção "Tradições que atravessam gerações". Se eu precisar criar uma página
     própria para isso depois, avise no resumo.)
4. Contraturno → /contraturno/
5. Nosso Espaço → /#nosso-espaco (carrossel da Home)
6. Botão cyan "Agende sua visita" (.hs-btn + .hs-open-form) → abre o popup do formulário.

- Crie os IDs de âncora nas seções correspondentes (Avançado → ID CSS):
  quem-somos, nossa-historia, missao-e-visao, pertencimento-e-identidade, celebracoes, nosso-espaco.
- Rolagem suave até a âncora e scroll-margin-top igual à altura do header, para o título não
  ficar escondido atrás do menu fixo.
- O item pai continua clicável (vai para a página); a seta abre o dropdown.
- Destacar o item da página atual (cor cyan ou sublinhado).

## 3. Implementação (editável pelo painel)
- Crie o menu em WordPress → Aparência → Menus ("Menu principal") com essa hierarquia,
  para eu conseguir editar depois sem código.
- Elementor PRO: widget "Menu de navegação" no header, com dropdown.
- Elementor FREE: renderize o menu do WordPress por um shortcode no MINI PLUGIN
  (ex.: [hs_menu]) com HTML/CSS/JS próprios, e use o shortcode no header.

## 4. Desktop (≥ 1025px)
- Dropdown abre no hover (com atraso de ~150ms para não fechar sem querer) E no clique/teclado.
- Painel branco, cantos arredondados (12px), sombra suave, padding 8px, itens 15–16px navy com
  hover em fundo ice e texto cyan. Pequena seta (chevron) ao lado do item pai, que gira ao abrir.
- Transição curta (opacity + translateY 6px, 180ms). Nada exagerado.
- Acessível: aria-haspopup, aria-expanded, abre com Enter/Espaço, fecha com ESC e ao clicar fora.

## 5. Mobile e tablet (≤ 1024px)
- Header: logo à esquerda + ícone hambúrguer à direita (o botão "Agende sua visita" sai do header,
  pois já existe a barra fixa inferior no mobile).
- Hambúrguer abre um painel (tela cheia ou gaveta pela direita) fundo navy, texto branco:
  - itens com submenu em ACCORDION: toque na seta expande/recolhe os subitens (indentados, menores);
    toque no nome vai para a página;
  - botão "Agende sua visita" no fim do painel (abre o popup).
- Fecha no X, ESC, ao clicar num link e ao abrir o popup. Trava o scroll do body com o menu aberto.
- O menu fica acima da barra fixa inferior (z-index) e abaixo do popup do formulário.

## 6. Rodapé
- Atualize as colunas do footer para a mesma estrutura do menu (A Escola / Proposta Pedagógica /
  Cultura Judaica / Contraturno, Nosso Espaço, Agende sua visita), mantendo o visual atual.

## 7. Verificação
- Playwright em 1440px e 390px em todas as páginas: dropdown abre/fecha (hover, clique, teclado),
  todos os links levam à página/âncora certa sem o título ficar escondido, accordion do mobile
  funciona, botão abre o popup.
- Tabela no resumo: item do menu | link | funciona? (sim/não).
- Commit + push. Responder só com o resumo e o que eu preciso fazer manualmente.
