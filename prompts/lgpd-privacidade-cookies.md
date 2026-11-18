# Prompt — Adequação LGPD: Política de Privacidade, cookies e aviso no formulário

Ajustes de privacidade no site da Hebraica School (Elementor), pedidos pelo jurídico da Hebraica.
Siga o CLAUDE.md. Não precisa ler o Figma.

Política de Privacidade oficial (externa, NÃO copiar o texto, só linkar):
https://www.ahebraica.org.br/politica-de-privacidade-externa/

## 1. Política de Privacidade no site
- Rodapé (todas as páginas): link "Política de Privacidade" na linha de baixo, ao lado do
  "Todos os direitos reservados", abrindo em nova aba (target="_blank" rel="noopener").
- (SUBSTITUÍDO por prompts/pagina-politica-privacidade.md — a página agora tem conteúdo próprio, sem redirecionamento.)
- ~~Crie a página /politica-de-privacidade/ que REDIRECIONA (301) para a URL oficial acima~~
  (pelo mini plugin, hook template_redirect), para termos um endereço próprio para usar no
  banner de cookies e no aviso do formulário.
- Em Configurações → Privacidade do WordPress, defina essa página como página de privacidade.

## 2. Aviso e gerenciamento de cookies
- Faça um levantamento ANTES: liste todos os cookies e scripts de terceiros que o site carrega
  hoje (Playwright: abrir cada página, listar cookies e requisições externas). Ex.: LeadConnector
  (form_embed.js / iframe), Google Fonts, Analytics/Tag Manager/Meta Pixel se existirem.
  Coloque essa lista no resumo.
- Instale o plugin gratuito "CookieYes" (ou "Complianz" se o CookieYes não atender) pela REST API
  (/wp/v2/plugins, slug do wordpress.org) e configure:
  - idioma português, lei LGPD;
  - banner discreto no rodapé da tela, com as cores do site (navy/cyan, fonte global, cantos
    arredondados), botões "Aceitar todos", "Rejeitar" e "Personalizar" com o mesmo peso visual;
  - categorias: Necessários (sempre ativos), Funcionais, Análise, Marketing;
  - scripts de análise/marketing BLOQUEADOS até o consentimento;
  - link para /politica-de-privacidade/;
  - ícone/link fixo "Preferências de cookies" (no rodapé) para a pessoa mudar a escolha depois.
- O formulário LeadConnector é necessário para o agendamento: classifique-o como Funcional
  e garanta que o formulário continua funcionando (se for bloqueado sem consentimento, mostrar
  no lugar dele uma mensagem com botão para aceitar os cookies funcionais).
- MOBILE: o banner não pode cobrir a barra fixa "Agendar visita" nem o botão do popup —
  ajuste z-index/posição. Depois de aceitar/rejeitar, a barra fixa volta ao normal.
- Se não for possível instalar plugin pela API, implemente o banner no mini plugin com as mesmas
  regras (consentimento salvo por 12 meses, bloqueio prévio dos scripts) e avise no resumo.

## 3. Aviso de privacidade no formulário "Agende uma visita"
Texto (exatamente este, com o link):
"Os dados pessoais fornecidos neste formulário serão utilizados para gerenciar o agendamento da
visita, entrar em contato com os responsáveis, compreender o interesse da família na Hebraica School
e prestar as informações solicitadas. Os dados serão tratados de forma segura, em conformidade com
a legislação aplicável e com a nossa Política de Privacidade."
("Política de Privacidade" = link para /politica-de-privacidade/, nova aba.)
- Coloque o texto logo ABAIXO do formulário em TODOS os lugares onde ele aparece:
  card de contato da Home e popup do formulário. Estilo: 12–13px, cor muted, line-height 1.5,
  link sublinhado em navy/cyan. No popup o texto deve ficar visível sem precisar rolar muito.
- Me diga no resumo que o ideal é TAMBÉM colocar esse texto DENTRO do formulário no painel do
  LeadConnector (elemento de texto acima do botão de envio), porque isso eu faço manualmente.

## 4. Verificação
- Playwright em 1440px e 390px, navegação anônima (sem cookies):
  - banner aparece na 1ª visita; "Rejeitar" não carrega scripts de análise/marketing;
    "Aceitar" carrega; a escolha fica salva ao trocar de página; "Preferências de cookies" reabre;
  - formulário da Home e do popup funcionando, com o aviso de privacidade visível;
  - link do rodapé e do aviso levam à política oficial;
  - no mobile, banner não cobre a barra "Agendar visita".
- Commit + push. Responder só com: lista de cookies/scripts encontrados, o que foi feito e o que eu
  preciso fazer manualmente.
