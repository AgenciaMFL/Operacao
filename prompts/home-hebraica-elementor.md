# Prompt — Home Hebraica School (Elementor)

Implemente a HOME da Hebraica School no WordPress/Elementor a partir do Figma.

## Fontes do design
- Desktop: https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3855-318
- Mobile (hero): https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3932-592
- Site: https://hebraicaschool.mflsales.com.br (tema Hello Elementor + Elementor [FREE/PRO])

## Como ler o Figma (economia de crédito)
1. Rode get_metadata no frame 3855:318 para pegar os node IDs de cada seção.
2. Rode get_design_context SEÇÃO POR SEÇÃO (nunca o frame inteiro de uma vez).
3. Exporte cada imagem uma única vez para assets/home/ (webp, máx. 1920px de largura).
4. Não refaça leituras já feitas; não tire screenshots repetidas.

## Design tokens (cadastrar como Cores Globais do Elementor)
- Navy (primary)  #022169
- Cyan (accent)   #00ADE9
- Muted (text)    #5C6885
- Ice             #D8E5EF   (fundos claros; use também um tom mais claro de ice se o Figma indicar)
- Cream           #F5EFE4
- White           #FFFFFF
- Ribbon (faixa)  rosa/vermelho — pegar o hex exato no get_design_context
Tipografia: pegar famílias/pesos/tamanhos do get_design_context (títulos e corpo) e
cadastrar como Fontes Globais. Botões: pílula (border-radius 999px), ícone de seta em círculo à direita.
Cards e imagens: cantos arredondados (~16–24px). Largura de conteúdo ~1140px.

## Seções (em ordem)
0. HEADER (reutilizável): logo Hebraica School | menu: A escola, Proposta pedagógica,
   Educação bilíngue, Cultura Judaica, Contraturno | botão cyan "Agende sua visita".
1. HERO: foto de fundo full-width com overlay escuro à esquerda e o "H" azul da marca atrás da família.
   Badge "Hebraica School • Educação Infantil", H1 "Da herança para o mundo.",
   texto "Os primeiros passos ganham novos caminhos. E continuam perto de tudo o que faz a sua família pertencer.",
   botão cyan "Conheça o próximo passo".
   MOBILE (frame 3932:592): bloco navy sólido em cima com o texto e a foto embaixo — usar containers
   separados por breakpoint (ocultar/mostrar), não forçar o layout desktop.
2. NOSSA ESCOLA: imagem à esquerda + card azul-claro à direita. Tag "A NOSSA ESCOLA",
   título "Uma escola que vale uma escolha.", texto, botão branco "Conheça nossa história".
3. FUNDO ICE: título "O futuro não pedia que deixássemos de ser Hebraica.", subtítulo
   "Pedia uma nova forma de dizer quem sempre fomos.", 2 parágrafos, destaque cyan
   "Não faltava essência. Faltava tradução.", parágrafo final. Imagem arredondada à direita.
4. BILINGUISMO (fundo navy): tag "BILINGUISMO • JANEIRO DE 2027", título "Aprender o mundo. Em duas línguas.",
   texto, 3 bullets (Projetos, histórias e brincadeiras / Português e inglês no cotidiano de aprendizagem /
   Acolhimento e diálogo com as famílias), botão branco "Conheça o bilinguismo".
   Imagem com balões "Hello!" e "Olá!" (exportar a imagem já com os balões, se forem parte do design).
   Faixa diagonal rosa com texto repetido "Educação bilíngue -" cruzando a seção:
   container rotacionado (~-4°) com texto; animação marquee opcional via CSS.
5. NATUREZA (fundo cyan): imagem à esquerda, tag "NATUREZA, MOVIMENTO E CONVIVÊNCIA",
   título "O lado de fora faz parte do aprender.", texto, botão branco "Conheça a escola".
6. CULTURA JUDAICA (fundo cream): tag "CULTURA JUDAICA E PERTENCIMENTO", título "Raízes para ir mais longe.",
   texto, destaque cyan "O mundo cresce. O vínculo continua.", imagem à direita.
7. NOSSO ESPAÇO: título central + carrossel de imagens arredondadas com paginação em bolinhas
   (Image Carousel do Elementor).
8. FAQ: tag "VAMOS CONVERSAR?", título "O próximo passo também começa com perguntas." à esquerda;
   accordion à direita com 3 perguntas (Quando começa o bilinguismo? / A minha família ainda não é sócia.
   Como conhecer? / Como conhecer a rotina da escola?) — textos do Figma.
9. CONTATO (fundo navy) — REUTILIZÁVEL: tag "VENHA CONHECER A HEBRAICA SCHOOL",
   título "O próximo passo da sua família começa aqui.", texto, endereço com ícone
   "Dentro da Hebraica, em São Paulo. Rua Hungria, 1000 • Jardim Paulistano".
   Card branco "Agende uma visita" com formulário: Nome do responsável, E-mail, Telefone,
   Idade da criança (select), "A sua família já é sócia da Hebraica?" (select), botão cyan "Quero conhecer a escola".
   PRO: widget Form. FREE: deixar o card pronto com shortcode de formulário (avisar qual plugin instalar).
10. FOOTER (reutilizável, fundo ice): logo, frase, telefone/WhatsApp, colunas
    A Escola / Proposta Pedagógica / Agende sua visita (links das páginas), copyright.

## Regras de implementação
- Elementor com CONTAINERS (Flexbox), nada de seções/colunas antigas.
- Usar SEMPRE cores e fontes globais; nada de hex solto nos widgets.
- Header, footer e bloco de contato como templates salvos reutilizáveis
  (PRO: Theme Builder para header/footer).
- Responsivo: conferir desktop, tablet e mobile; no mobile, imagens acima/abaixo do texto e padding lateral 20px.
- Textos exatamente como no Figma (português, com acentos).
- Imagens: subir para a Biblioteca de Mídia com alt text descritivo.

## Entrega
- Se existirem WP_URL, WP_USER e WP_APP_PASSWORD no ambiente: publicar via REST API
  (página "Home" definida como página inicial), usando um mini plugin que registra _elementor_data,
  _elementor_edit_mode e _elementor_template_type no REST.
- Caso contrário: gerar elementor/home.json, elementor/header.json, elementor/footer.json e
  elementor/contato.json para importar em Templates → Importar.
- Salvar também um CLAUDE.md com tokens, padrões de componentes e IDs dos templates,
  para as próximas páginas reaproveitarem tudo.
- Commit + push ao final. Me responda só com o resumo do que foi feito e o que eu preciso fazer manualmente.
