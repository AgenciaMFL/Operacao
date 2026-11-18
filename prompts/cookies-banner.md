# Prompt 2 — Aviso e gerenciamento de cookies (LGPD)

Site: https://hebraicaschool.org.br (WordPress + Elementor, VPS na Oracle Cloud).
Siga o CLAUDE.md. Rode DEPOIS do prompt da Política de Privacidade (a página
/politica-de-privacidade/ já deve existir — o item 8 dela descreve exatamente estas regras).

## 1. Levantamento (antes de instalar qualquer coisa)
- Playwright em navegação anônima, abrindo cada página (Home, A Escola, Proposta Pedagógica,
  Educação Bilíngue, Cultura Judaica, Contraturno, Política de Privacidade) e o popup do formulário:
  liste TODOS os cookies criados e todos os scripts/requisições de terceiros
  (ex.: GHL/LeadConnector form_embed.js e iframe, Google Fonts, Google Analytics/Tag Manager,
  Meta Pixel, YouTube, etc.).
- Classifique cada um em: Necessários, Funcionais, Análise, Marketing. Mostre a tabela no resumo.
- Se as fontes vierem do Google Fonts, hospede-as localmente no servidor (Elementor → Configurações
  → Desempenho / ou baixar e servir local), para não enviar o IP do visitante ao Google sem necessidade.

## 2. Plugin de consentimento
- Instale o plugin gratuito "CookieYes | GDPR Cookie Consent" (slug cookie-law-info) pela REST API
  (/wp/v2/plugins). Se não atender, use "Complianz" (slug complianz-gdpr). Configure:
  - idioma português (Brasil), lei LGPD;
  - categorias: Necessários (sempre ativos), Funcionais, Análise, Marketing, com descrições curtas
    em português e a lista de cookies do levantamento em cada categoria;
  - BLOQUEIO PRÉVIO: scripts de Análise e Marketing só carregam depois do consentimento;
  - consentimento salvo por 12 meses; registro do consentimento (log) ativado se o plugin oferecer;
  - link para /politica-de-privacidade/ no banner.
- Se não for possível instalar plugin pela API, implemente no MINI PLUGIN com as mesmas regras e avise.

## 3. Visual do banner (identidade do site, nada de banner genérico)
- Card flutuante no canto inferior esquerdo no desktop (largura ~420px) e barra inferior no mobile.
- Fundo branco, cantos arredondados 16px, sombra suave, fonte global do site, texto navy/muted.
- Texto: "Usamos cookies para garantir o funcionamento do site e, com a sua permissão, para entender
  como ele é usado e melhorar sua experiência. Saiba mais na nossa Política de Privacidade."
- Botões com o MESMO destaque visual (sem "Aceitar" chamativo e "Rejeitar" escondido):
  "Aceitar todos", "Rejeitar" e "Personalizar" — pílulas no estilo .hs-btn (cyan/navy), lado a lado
  no desktop e empilhados no mobile.
- "Personalizar" abre painel com as categorias e chaves liga/desliga (Necessários travado em ligado).
- Esconder o selo/logo "Powered by" do plugin se a versão gratuita permitir.

## 4. Convivência com o resto do site
- Formulário GHL (Home e popup) = FUNCIONAL. Se a pessoa rejeitar funcionais, no lugar do formulário
  aparece uma mensagem: "Para agendar sua visita, permita os cookies funcionais." + botão
  "Permitir e mostrar formulário". Testar que o agendamento funciona nos dois cenários.
- MOBILE: o banner não pode cobrir a barra fixa "Agendar visita". Enquanto o banner estiver aberto,
  posicione-o acima da barra (ou esconda a barra) e devolva a barra ao normal depois da escolha.
- z-index: banner acima do conteúdo e da barra mobile, abaixo do popup do formulário e do menu mobile.
- Rodapé: link "Preferências de cookies" (ao lado de "Política de Privacidade") que reabre o painel.
- Cache: se houver cache de página no servidor/plugin, garantir que o banner não fica "preso" em cache
  (excluir os cookies de consentimento do cache) e limpar o cache no final.

## 5. Verificação
- Playwright em 1440px e 390px, navegação anônima:
  - banner aparece na 1ª visita;
  - "Rejeitar": nenhum cookie/script de Análise/Marketing é carregado (comprovar pela lista de requisições);
  - "Aceitar todos": carregam; a escolha persiste ao trocar de página e ao recarregar;
  - "Preferências de cookies" no rodapé reabre o painel e permite mudar;
  - formulário funciona (ou mostra a mensagem com botão, se funcionais rejeitados);
  - no mobile o banner não cobre a barra "Agendar visita".
- Commit + push. Responder só com: tabela de cookies/scripts encontrados, o que foi configurado e o que
  eu preciso fazer manualmente.
