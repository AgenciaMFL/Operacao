# Prompt — Página "Política de Privacidade" (texto oficial da Hebraica)

Crie a página de Política de Privacidade no site da Hebraica School (Elementor), com o texto OFICIAL
da Hebraica. Siga o CLAUDE.md. Não precisa ler o Figma.

Este prompt SUBSTITUI o item 1 de prompts/lgpd-privacidade-cookies.md: NÃO redirecione para a
política externa (se o redirecionamento já existir, remova-o). A página fica dentro do site.

## Conteúdo
- Use EXATAMENTE o texto de docs/politica-de-privacidade-hebraica.md (texto oficial da Hebraica,
  copiado de https://www.ahebraica.org.br/politica-de-privacidade-externa/).
  NÃO reescreva, NÃO resuma, NÃO acrescente nada ao texto da política.
- Ignore a nota de citação do topo do arquivo (linha com ">"), ela é só para nós.
- No fim da página, uma linha discreta: "Esta política também está disponível no site da Hebraica"
  com link para a URL oficial (nova aba).

## Página
- Slug /politica-de-privacidade/, título "Política de Privacidade".
- Configurações → Privacidade do WordPress: definir como página de privacidade. Indexável.

## Layout (simples e legível, com a identidade do site)
- Header e footer globais.
- Topo: faixa navy curta (~220px desktop / ~160px mobile), tag cyan "PRIVACIDADE E LGPD",
  H1 branco "Política de Privacidade". Sem foto.
- Corpo em fundo branco, coluna de leitura com largura máxima ~760px centralizada.
  - Desktop (≥1025px): sumário fixo (sticky) à esquerda com links para as seções 1.0 a 11,
    destacando a seção atual ao rolar.
  - Mobile: sumário recolhível ("Nesta página") no topo do conteúdo.
- H2 navy 24–28px com id em cada seção; subtítulos ("Dados Sensíveis", "Dados de Crianças") como H3;
  itens que no texto são tópicos em negrito (ex.: "Dados biométricos") em negrito navy;
  corpo 17px, line-height 1.7, cor muted; listas com espaçamento confortável.
- lgpd@hebraica.org.br sempre como link mailto.
- Sem animações. A barra fixa mobile não pode cobrir o fim do texto.

## Links para esta página
- Rodapé (todas as páginas): "Política de Privacidade" ao lado de "Todos os direitos reservados".
- Banner de cookies e aviso do formulário "Agende uma visita" (home e popup): apontar para
  /politica-de-privacidade/ (no popup, abrir em nova aba).

## Verificação
- Conferir que o texto publicado é idêntico ao do arquivo (comparar seção por seção).
- Playwright 1440px e 390px: sumário funciona, âncoras não ficam escondidas pelo header,
  links do rodapé/banner/formulário levam à página.
- Commit + push. Responder só com o resumo.
