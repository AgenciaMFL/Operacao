# Prompt — Página "A Escola" (Elementor)

Implemente a página "A ESCOLA" da Hebraica School no Elementor. Siga o CLAUDE.md
(tokens, cores/fontes globais, classes .hs-btn, .hs-marquee, header/footer já existentes).

## Figma
https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3718-6996
- get_metadata no frame 3718:6996 → get_design_context SEÇÃO POR SEÇÃO.
- IGNORE camadas ocultas (hidden="true") — são versões descartadas.
- Baixe as imagens desta página direto do Figma (download_assets / URLs de asset),
  webp máx. 1920px, suba na Biblioteca de Mídia e use ESSAS imagens. Uma vez cada.
- NÃO recrie header, footer nem o carrossel "Nosso Espaço": reutilize os da Home.

## Seções (em ordem)
1. HERO: foto full-width (família no parque) com degradê navy à esquerda.
   Tag "A ESCOLA • DESDE 1969", H1 "Tradição que acolhe. Educação que transforma.",
   texto, botão cyan "Agende uma visita" (.hs-btn).
2. QUEM SOMOS (fundo branco): imagem arredondada à esquerda; à direita tag "QUEM SOMOS",
   título "Um lugar para crescer e pertencer.", 3 parágrafos e, abaixo de uma linha divisória,
   3 números: "1969 — Nossa origem", "1 a 6 anos — Educação Infantil", "2027 — Ensino Bilíngue".
   (Opcional: contador animado nos números ao entrar na tela.)
3. NOSSA HISTÓRIA (fundo ice): tag "NOSSA HISTÓRIA", título "Uma trajetória de tradição,
   cuidado e transformação", parágrafos à esquerda, imagem arredondada à direita.
   Abaixo, LINHA DO TEMPO EM ABAS: 4 abas pílula (1969–1987, 1990–2005, 2012–2022, 2025–2027),
   aba ativa navy / inativas brancas. Conteúdo de cada aba = card branco com:
   - coluna esquerda navy: "NOSSA TRAJETÓRIA", período, título grande (ex.: "Origens e evolução")
     e o "H" cyan da marca na base;
   - coluna direita: lista ano + descrição com divisórias.
   Pegue no Figma os textos de TODAS as abas (se só a 1ª estiver desenhada, me avise no resumo).
   Widget Tabs do Elementor (ou Nested Tabs), estilizado; troca de aba com fade suave.
4. MISSÃO E VISÃO (fundo navy): título central "Conheça nossa missão e visão".
   - Card claro "Nossa missão" (texto com negritos em "formação integral" e "Cultura Judaica")
     sobreposto à imagem à direita.
   - Imagem à esquerda + "Nossa visão": texto + lista numerada 01–04 (Autonomia e valores,
     Aprendizagem compartilhada, Identidade e comunidade, + o 4º do Figma), cada item com
     número em círculo, título e descrição, separados por divisórias.
5. NOSSO ESPAÇO: reutilizar o carrossel contínuo da Home (.hs-marquee).
6. AGENDE SUA VISITA: card com foto à esquerda e bloco navy à direita
   (título "Agende sua visita", texto com negrito em "acolher, cuidar, educar e brincar",
   botão branco "Agendar minha visita"). SALVE COMO TEMPLATE REUTILIZÁVEL "CTA Agende sua visita"
   — ele se repete nas outras páginas internas.
7. FOOTER: o global.

## Regras
- Containers Flexbox, cores/fontes globais, botões com .hs-btn.
- Animações de entrada suaves iguais às da Home (Fade In Up escalonado), respeitando reduced-motion.
- Responsivo desktop/tablet/mobile; no mobile imagens acima do texto e abas com rolagem horizontal.
- Textos exatamente como no Figma.

## Entrega
- Publicar a página "A Escola" (slug /a-escola) via API, ou gerar elementor/escola.json + cta-visita.json.
- Atualizar o CLAUDE.md (novos templates e classes). Commit + push. Responder só com o resumo.
