# Prompt — Página "Política de Privacidade" da Hebraica School

Crie a página de Política de Privacidade PRÓPRIA do site da Hebraica School (Elementor). Ela é
específica do site (formulário, cookies, CRM HighLevel/GHL e comunicados) e complementa a política
geral da Hebraica. Siga o CLAUDE.md. Não precisa ler o Figma.

Este prompt SUBSTITUI o item 1 de prompts/lgpd-privacidade-cookies.md: NÃO redirecione para a
política externa (se o redirecionamento já existir, remova-o). A página fica dentro do site.

## Conteúdo
- Use EXATAMENTE o texto de docs/politica-de-privacidade-hebraica-school.md.
  NÃO reescreva, NÃO resuma, NÃO acrescente nada.
- Os trechos entre [colchetes] (data, CNPJ, domínio, prazo, hospedagem) ficam como estão:
  liste-os no resumo para eu preencher. Destaque-os em amarelo SÓ no modo de edição, não no site.
- O link para a política geral da Hebraica (https://www.ahebraica.org.br/politica-de-privacidade-externa/)
  abre em nova aba.
- (docs/politica-de-privacidade-hebraica.md é só a cópia de referência da política geral; não publicar.)

## Página
- Slug /politica-de-privacidade/, título "Política de Privacidade".
- Configurações → Privacidade do WordPress: definir como página de privacidade. Indexável.

## Layout (simples e legível, com a identidade do site)
- Header e footer globais.
- Topo: faixa navy curta (~220px desktop / ~160px mobile), tag cyan "PRIVACIDADE E LGPD",
  H1 branco "Política de Privacidade". Sem foto.
- Corpo em fundo branco, coluna de leitura com largura máxima ~760px centralizada.
  - Desktop (≥1025px): sumário fixo (sticky) à esquerda com links para as seções 1 a 11,
    destacando a seção atual ao rolar.
  - Mobile: sumário recolhível ("Nesta página") no topo do conteúdo.
- H2 navy 24–28px com id em cada seção; subtítulos em negrito ("a) Formulário...", "Dados de crianças")
  em negrito navy;
- A tabela do item 3 (finalidade / dados / base legal) deve ser responsiva: no mobile vira cards.
- Bloco destacado (fundo ice, cantos arredondados) no item 9 com botão "Exercer meus direitos"
  (mailto:lgpd@hebraica.org.br?subject=Solicitação LGPD – Hebraica School).
  corpo 17px, line-height 1.7, cor muted; listas com espaçamento confortável.
- lgpd@hebraica.org.br sempre como link mailto.
- Sem animações. A barra fixa mobile não pode cobrir o fim do texto.

## Links para esta página
- Rodapé (todas as páginas): "Política de Privacidade" ao lado de "Todos os direitos reservados".
- Banner de cookies e aviso do formulário "Agende uma visita" (home e popup): apontar para
  /politica-de-privacidade/ (no popup, abrir em nova aba).

## Verificação
- Conferir que o texto publicado é idêntico ao do arquivo (comparar seção por seção).
- O link "Preferências de cookies" citado no item 8 existe no rodapé e reabre o painel do banner.
- Playwright 1440px e 390px: sumário funciona, âncoras não ficam escondidas pelo header,
  links do rodapé/banner/formulário levam à página.
- Commit + push. Responder só com o resumo.
