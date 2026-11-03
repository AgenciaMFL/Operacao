# Prompt — Ajustes 3: heros, imagem mobile da Home, sem animações de entrada e barra fixa no mobile

Ajustes no site da Hebraica School (Elementor). Siga o CLAUDE.md.
Figma: https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL (página "Hebraica Scholl", 3696:2534)
Leia no Figma SOMENTE o que for pedido abaixo.

## 1. Remover os efeitos de entrada
- Remova TODOS os efeitos de entrada do site: classes .hs-reveal*, .hs-delay-*, .hs-stagger
  dos elementos, o CSS/JS do reveal no widget HTML global e qualquer "Animação de entrada"
  nativa do Elementor que tenha sobrado. Tudo deve aparecer direto, sem fade e sem deslocamento.
- MANTENHA: hover dos botões (.hs-btn), carrossel contínuo (.hs-marquee) e faixa (.hs-ribbon).
- Atualize o CLAUDE.md (remover as classes de reveal da documentação).

## 2. Hero da Home no mobile — trocar a imagem
- Use a imagem do Figma "mobile home": frame "Mobile" (node 3932:592,
  https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3932-592).
  Se existir outra camada chamada "mobile home" na página 3696:2534, use ela.
- Exporte a composição INTEIRA (foto da família + "H" azul da marca), sem a área navy de cima,
  em webp 2x (~1500px de largura), suba na Biblioteca de Mídia.
- No mobile a hero da Home fica: bloco navy com o texto em cima e essa imagem embaixo,
  encostada nas laterais e na base da hero. Desktop continua como está.

## 3. Títulos das heros maiores (TODAS as páginas)
- Os H1 das heros estão pequenos. Pegue o font-size real de cada H1 no get_design_context
  (só o nó do título da hero de cada página) e aplique. Referência mínima:
  - Desktop: 60–72px, line-height 1.05, peso do Figma.
  - Tablet: 48–56px.
  - Mobile: 40–44px, line-height 1.08, quebra em 2–3 linhas sem palavra solta.
- Crie uma classe única .hs-hero-title com esses tamanhos e aplique em todas as heros
  (Home, A Escola, Proposta Pedagógica, Educação Bilíngue, Cultura Judaica, Contraturno).

## 4. Espaço sobrando nas heros
- Hoje há muito espaço vazio em cima/embaixo do conteúdo nas heros (principalmente no mobile).
- Desktop: altura pelo conteúdo, min-height ~640px, conteúdo centralizado na vertical,
  padding ~96px em cima e embaixo. Nada de 100vh.
- Mobile: padding 40px em cima / 32px embaixo do texto; espaçamentos internos menores
  (tag→título 12px, título→texto 16px, texto→botão 24px). A imagem começa logo após o botão.
- Garanta que não existe container vazio, spacer ou min-height herdado deixando buraco.

## 5. Botão das heros muito largo
- No mobile o botão "Agende uma visita" está ocupando a largura toda e com um anel/contorno
  escuro grosso em volta. Corrija:
  - largura automática (width:auto, inline-flex), padding ~14px 24px, altura ~52px, centralizado
    quando o texto estiver centralizado;
  - remova o anel/box-shadow/outline extra (manter o focus visível só no foco por teclado,
    via :focus-visible, fino);
  - mesmo estilo .hs-btn do desktop, só um pouco menor.
- Aplique em todos os botões das heros e confira os outros botões do site.

## 6. Barra fixa inferior — SÓ NO MOBILE
- Abaixo de 768px: barra fixa no rodapé da tela, fundo branco com sombra leve para cima
  (ou navy, o que ficar melhor com o site), altura ~72px, com padding-bottom
  env(safe-area-inset-bottom) para iPhone.
- Dentro: botão cyan largo "Agendar visita" (.hs-btn + .hs-open-form) que abre o MESMO popup
  do formulário LeadConnector.
- Adicione padding-bottom no body (mobile) para a barra não cobrir o footer nem o conteúdo.
- Esconder a barra quando o popup estiver aberto. z-index acima do conteúdo e abaixo do popup.
- Desktop e tablet: a barra não aparece.
- Coloque a barra no template global (footer ou widget HTML global) para valer em todas as páginas.

## Verificação final
- Screenshot (Playwright) de TODAS as heros em 1440px e 390px; compare com o Figma
  (get_screenshot só do nó da hero) e corrija até bater: tamanho do título, espaçamentos,
  botão e imagem.
- Confira no 390px: barra inferior visível, botão abre o popup, footer não fica escondido.
- Commit + push. Responder só com o resumo e o que eu preciso fazer manualmente.
