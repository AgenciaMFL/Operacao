# Prompt — Corrigir popup do formulário (não está abrindo)

O popup com o formulário LeadConnector NÃO abre quando clico nos botões. Corrija. Siga o CLAUDE.md.
Formulário: https://api.leadconnectorhq.com/widget/form/jF3lIMK8jKXF6b2zsZSL

## 1. Diagnosticar primeiro (não reescreva às cegas)
Com Playwright na página publicada (1440px e 390px), para cada botão abaixo:
clicar → verificar se o modal ficou visível → registrar erros do console.
Descubra a causa. As mais prováveis:
- A classe "hs-open-form" foi aplicada no WRAPPER do widget (div.elementor-widget-button),
  e não no <a>; o script procura só o <a> (ou o contrário).
- O botão tem link real (href da página/âncora) e navega antes do JS agir.
- O script está num widget HTML dentro de um template que não é renderizado em todas as páginas,
  ou roda antes dos elementos existirem.
- Cache/otimização da Hostinger (LiteSpeed Cache: "Delay JS", "Defer", "Combine JS") atrasando ou
  quebrando o script inline.
- Erro de JS em outro script travando o resto.
- Elementor Free usando "#agendar" esperando Popup do Pro (que não existe no Free).

## 2. Implementação robusta (independente de onde a classe esteja)
- Carregue o script do modal pelo MINI PLUGIN que já existe (hook wp_footer, prioridade alta)
  — não por widget HTML. Assim vale em todas as páginas, sempre.
- O próprio JS cria o HTML do modal e injeta no <body> (não depender de markup no Elementor).
- Delegação de evento no document (fase de captura):
  document.addEventListener('click', e => {
    const t = e.target.closest('.hs-open-form, .hs-open-form a, a[href$="#agendar"], [data-hs-form]');
    if (!t) return; e.preventDefault(); e.stopPropagation(); openModal();
  }, true);
- Nos botões que abrem o popup: link = "#agendar" E classe "hs-open-form" (Avançado → Classes CSS).
  Isso garante funcionamento mesmo se uma das duas formas falhar.
- O iframe (embed INLINE do LeadConnector) é criado só na 1ª abertura; o script
  https://link.msgsndr.com/js/form_embed.js é carregado uma única vez, junto.
- Modal: overlay navy semitransparente, card branco arredondado, X, fecha com ESC e clique fora,
  trava o scroll do body, foco no modal, z-index 99999 (acima do header e da barra mobile),
  esconde a barra fixa mobile enquanto aberto. Mobile: quase tela cheia com rolagem interna.
- Também abrir o modal se a URL chegar com #agendar.

## 3. Botões que DEVEM abrir o popup (todas as páginas)
- Header: "Agende sua visita" / "Agendar minha visita"
- Heros: "Agende uma visita"
- "Conheça a escola", "Venha conhecer a escola", "Conheça o próximo passo"
- CTA: "Agendar minha visita"; contato: "Quero conhecer a escola"
- Barra fixa mobile: "Agendar visita"
NÃO abrem popup: "Conheça o bilinguismo", "Conheça nossa história" e links do menu/rodapé
(exceto "Agende sua visita" do rodapé, que abre).
Varra TODAS as páginas (Home, A Escola, Proposta Pedagógica, Educação Bilíngue, Cultura Judaica,
Contraturno, header, footer e templates) e configure cada um desses botões.

## 4. Cache
- Se houver LiteSpeed Cache (ou outro): excluir o script do modal de "Delay JS"/"Defer"/"Combine",
  e limpar o cache do plugin e do Elementor (Elementor → Ferramentas → Regenerar CSS e dados).
- Me diga no resumo se eu preciso limpar algum cache manualmente no hPanel.

## 5. Verificação (obrigatória)
- Teste Playwright clicando em CADA botão da lista, em CADA página, em 1440px e 390px:
  modal abre, formulário carrega dentro, fecha com X, ESC e clique fora, página não rola atrás.
- Anexe no resumo uma tabela: página | botão | abre? (sim/não).
- Commit + push. Responder só com a causa encontrada, o que foi corrigido e a tabela.
