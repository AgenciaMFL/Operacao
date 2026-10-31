# Prompt — Ajustes 2: formulário LeadConnector, popup, animações e carrossel

Ajustes no site da Hebraica School (Elementor). Siga o CLAUDE.md. Não precisa ler o Figma nesta tarefa.

## 1. Trocar o formulário da Home pelo formulário LeadConnector
Formulário: https://api.leadconnectorhq.com/widget/form/jF3lIMK8jKXF6b2zsZSL
- Na seção de contato da Home (bloco navy "O próximo passo da sua família começa aqui."),
  REMOVA o formulário atual e coloque, dentro do mesmo card branco, um widget HTML com o embed inline:
  <iframe src="https://api.leadconnectorhq.com/widget/form/jF3lIMK8jKXF6b2zsZSL"
    style="width:100%;height:100%;border:none;border-radius:3px"
    id="inline-jF3lIMK8jKXF6b2zsZSL"
    data-layout="{'id':'INLINE'}" data-trigger-type="alwaysShow" data-trigger-value=""
    data-activation-type="alwaysActivated" data-activation-value=""
    data-deactivation-type="neverDeactivate" data-deactivation-value=""
    data-layout-iframe-id="inline-jF3lIMK8jKXF6b2zsZSL" data-form-id="jF3lIMK8jKXF6b2zsZSL"
    title="Agende uma visita"></iframe>
  <script src="https://link.msgsndr.com/js/form_embed.js"></script>
- O script form_embed.js ajusta a altura do iframe sozinho; carregue-o UMA vez no site
  (não repetir em cada embed). Confira se o formulário aparece inteiro, sem barra de rolagem interna,
  no desktop e no mobile.
- Mantenha o título "Agende uma visita" do card só se o formulário não tiver título próprio
  (não duplicar).

## 2. Popup com o mesmo formulário nos botões
- Crie UM popup reutilizável com o formulário:
  - Elementor PRO: Templates → Popups, com o mesmo iframe; acionar por link "#agendar".
  - Elementor FREE: modal próprio em um widget HTML global (no template do footer), com
    overlay navy semitransparente, card branco arredondado, botão X, fecha com ESC e clique fora,
    trava o scroll da página quando aberto, foco no modal (acessível).
    O iframe só é inserido/carregado na primeira abertura (não pesar o carregamento da página).
- Botões que abrem o popup (todas as páginas): "Agende sua visita" / "Agendar minha visita" (header e CTAs),
  "Agende uma visita" (heros), "Conheça a escola", "Venha conhecer a escola", "Quero conhecer a escola".
  Faça via classe CSS "hs-open-form" (Avançado → Classes CSS) ou link "#agendar" — um único script
  escuta os cliques. NÃO alterar os botões de navegação ("Conheça o bilinguismo", "Conheça nossa história").
- No mobile o popup ocupa quase a tela toda, com rolagem interna se precisar.

## 3. Refazer os efeitos de entrada (os atuais estão ruins)
- REMOVA todas as "Animações de entrada" nativas do Elementor em todas as páginas.
- Crie UM widget HTML global (no template do footer, aparece em todas as páginas) com CSS + JS:
  - Classes para aplicar nos elementos (Avançado → Classes CSS):
    .hs-reveal        → fade + sobe 24px
    .hs-reveal-fade   → só fade
    .hs-reveal-left / .hs-reveal-right → fade + desliza 32px lateral (imagens ao lado do texto)
    .hs-reveal-zoom   → fade + scale(.96 → 1) (imagens)
    .hs-delay-1 … .hs-delay-4 → atraso de 100/200/300/400ms (escalonar tag → título → texto → botão)
    .hs-stagger (no container pai) → filhos entram em sequência automaticamente (cards/grids)
  - Transição: 700ms, cubic-bezier(.22,1,.36,1), opacity + transform apenas (nada de layout).
  - IntersectionObserver (threshold ~0.15, rootMargin "0px 0px -10% 0px"), anima UMA vez só.
  - Só esconde os elementos se o JS rodar (adicionar classe "hs-js" no <html>); sem JS tudo aparece.
  - Elementos já visíveis no carregamento (hero) aparecem logo, sem "piscar".
  - prefers-reduced-motion: sem animação, tudo visível.
  - No modo de edição do Elementor (body.elementor-editor-active) não esconder nada.
- Aplique as classes em todas as páginas já feitas, de forma consistente:
  hero = .hs-reveal-fade; tags/títulos/textos/botões = .hs-reveal + delays;
  imagens = .hs-reveal-zoom ou left/right; grids de cards = .hs-stagger.
- Documente as classes no CLAUDE.md.

## 4. Bug do carrossel "Nosso Espaço" (aparece espaço vazio)
Problema: depois de algumas fotos a faixa fica em branco até o loop recomeçar.
Corrija o .hs-marquee:
- A trilha deve ter EXATAMENTE 2 cópias idênticas do conjunto de fotos e cada conjunto precisa
  ser mais largo que a tela: se as fotos não preencherem 1 tela larga (ex.: 2560px),
  repita as fotos dentro do conjunto até preencher (via JS no carregamento e no resize).
- Animação translateX(0 → -50%) linear infinite; trilha com width:max-content e itens flex-shrink:0.
- NÃO use "gap" no flex da trilha (quebra a conta dos -50%): use margin-right em cada item.
- Remova loading="lazy" das imagens do carrossel (loading="eager"): imagens fora da tela dentro de
  um transform às vezes não carregam e ficam em branco.
- Velocidade constante por px (ex.: duração = largura do conjunto / 60px por segundo).
- Teste em 390px, 1440px e 2560px de largura: nenhum espaço vazio em nenhum momento.

## Verificação final
- Screenshot (Playwright) de cada página em 1440px e 390px rolando até o fim: animações disparando,
  carrossel sem buraco, popup abrindo em todos os botões listados e fechando com ESC/X/clique fora,
  formulário da Home carregando.
- Commit + push. Responder só com o resumo e o que eu preciso fazer manualmente.
