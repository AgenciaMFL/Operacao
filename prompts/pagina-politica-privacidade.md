# Prompt — Página "Política de Privacidade" da Hebraica School

Crie a página de Política de Privacidade no site da Hebraica School (Elementor). Siga o CLAUDE.md.
Não precisa ler o Figma.

Este prompt SUBSTITUI o item 1 de prompts/lgpd-privacidade-cookies.md: NÃO faça mais o
redirecionamento para a política externa. A página agora tem conteúdo próprio.
(Se o redirecionamento já foi criado, remova-o.)

## Conteúdo
- Use EXATAMENTE o texto de docs/politica-de-privacidade-hebraica-school.md (não reescreva,
  não resuma). Os trechos entre [colchetes] ficam como estão e você me lista no resumo.

## Página
- Slug /politica-de-privacidade/, título "Política de Privacidade".
- Definir em Configurações → Privacidade do WordPress como página de privacidade.
- noindex NÃO: a página deve ser indexável.

## Layout (simples, legível, com a identidade do site)
- Header e footer globais do site.
- Topo: faixa navy curta (~240px desktop / ~180px mobile) com tag cyan "PRIVACIDADE E LGPD",
  H1 branco "Política de Privacidade" e a linha "Última atualização: ...". Sem foto.
- Corpo em fundo branco, coluna de leitura com largura máxima ~760px centralizada.
  - Desktop (≥1025px): sumário fixo (sticky) à esquerda com os links para as 11 seções,
    destacando a seção atual ao rolar.
  - Mobile: sumário recolhível ("Nesta página") no topo do conteúdo.
- Tipografia: H2 navy 26–28px com âncora (id) em cada seção; corpo 17px, line-height 1.7,
  cor muted; listas com espaçamento confortável; links sublinhados em navy/cyan.
- A tabela do item 3 deve ser responsiva: no mobile vira cards (Finalidade / Dados / Base legal).
- E-mail lgpd@hebraica.org.br como link mailto.
- Bloco de destaque (fundo ice, cantos arredondados) no item 9 com o botão "Exercer meus direitos"
  (mailto:lgpd@hebraica.org.br?subject=Solicitação LGPD – Hebraica School).
- Sem animações. Sem barra fixa de agendamento sobrepondo o texto final (padding-bottom correto).

## Links para esta página
- Rodapé (todas as páginas): "Política de Privacidade" ao lado de "Todos os direitos reservados".
- Banner de cookies e aviso do formulário "Agende uma visita" (home e popup): apontar para
  /politica-de-privacidade/ (mesma aba no site; nova aba dentro do popup).
- Item 8 da política menciona "Preferências de cookies" no rodapé: garanta que esse link existe
  e reabre o painel do banner.

## Verificação
- Playwright 1440px e 390px: sumário funciona e destaca a seção, âncoras não ficam escondidas
  pelo header, tabela vira cards no mobile, links do rodapé/banner/formulário levam à página.
- Commit + push. Responder só com o resumo e a lista de [colchetes] pendentes.
