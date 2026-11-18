# Prompt 1 — Página "Política de Privacidade" da Hebraica School + aviso no formulário

Site: https://hebraicaschool.org.br (WordPress + Elementor, hospedado em VPS na Oracle Cloud).
Siga o CLAUDE.md. Não precisa ler o Figma.

## 1. Criar a página
- Slug /politica-de-privacidade/, título "Política de Privacidade". Indexável.
- Configurações → Privacidade do WordPress: definir como página de privacidade.
- Se existir algum redirecionamento antigo de /politica-de-privacidade/ para o site da Hebraica, remova.

## 2. Conteúdo
- Use EXATAMENTE o texto de docs/politica-de-privacidade-hebraica-school.md.
  NÃO reescreva, NÃO resuma, NÃO acrescente nada.
- Troque {{DATA_DE_PUBLICACAO}} pela data de hoje (formato DD/MM/AAAA).
- Links para a política geral da Hebraica (https://www.ahebraica.org.br/politica-de-privacidade-externa/)
  abrem em nova aba. lgpd@hebraica.org.br sempre como link mailto.
- docs/politica-de-privacidade-hebraica.md é só referência da política geral: NÃO publicar.

## 3. Layout (simples, legível, identidade do site)
- Header e footer globais.
- Topo: faixa navy curta (~220px desktop / ~160px mobile), tag cyan "PRIVACIDADE E LGPD",
  H1 branco "Política de Privacidade", linha "Última atualização: DD/MM/AAAA". Sem foto.
- Corpo em fundo branco, coluna de leitura com largura máxima ~760px centralizada.
  - Desktop (≥1025px): sumário fixo (sticky) à esquerda com links para as seções 1 a 11,
    destacando a seção atual ao rolar.
  - Mobile: sumário recolhível ("Nesta página") no topo do conteúdo.
- H2 navy 24–28px com id em cada seção; subtítulos em negrito navy; corpo 17px, line-height 1.7,
  cor muted; listas com espaçamento confortável; links sublinhados.
- Tabela do item 3 (finalidade / dados / base legal) responsiva: no mobile vira cards.
- Bloco destacado (fundo ice, cantos arredondados) no item 9 com botão "Exercer meus direitos"
  (mailto:lgpd@hebraica.org.br?subject=Solicitação LGPD – Hebraica School).
- Sem animações. A barra fixa mobile não pode cobrir o fim do texto.

## 4. Link no rodapé
- Rodapé (todas as páginas): "Política de Privacidade" ao lado de "Todos os direitos reservados".

## 5. Aviso de privacidade no formulário "Agende uma visita"
Texto (exatamente este):
"Os dados pessoais fornecidos neste formulário serão utilizados para gerenciar o agendamento da visita,
entrar em contato com os responsáveis, compreender o interesse da família na Hebraica School e prestar
as informações solicitadas. Os dados serão tratados de forma segura, em conformidade com a legislação
aplicável e com a nossa Política de Privacidade."
- "Política de Privacidade" = link para /politica-de-privacidade/ (no popup, em nova aba).
- Logo ABAIXO do formulário em TODOS os lugares: card de contato da Home e popup.
  12–13px, cor muted, line-height 1.5. No popup, visível sem rolar muito.
- Lembre no resumo que eu também devo colocar esse texto DENTRO do formulário no painel do GHL.

## 6. Verificação
- Texto publicado idêntico ao arquivo (comparar seção por seção), sem "{{" nem colchetes.
- Playwright 1440px e 390px: sumário funciona, âncoras não ficam escondidas pelo header, tabela vira
  cards no mobile, link do rodapé funciona, aviso aparece abaixo do formulário na Home e no popup.
- Commit + push. Responder só com o resumo.
