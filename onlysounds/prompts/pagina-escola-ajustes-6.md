Aplique esta rodada de ajustes na página **Escola** (`/escola`) do site onlysounds.com.br usando o MCP `only-sounds-elementor`. Faça **uma seção por vez, na ordem**, confira cada uma numa **aba anônima** (desktop 1440px e mobile 375px) antes de seguir, e não mexa em nenhuma outra página.

Para cada link do Figma abaixo, use o MCP do Figma (`get_screenshot` + `get_design_context` no node indicado) e siga o design: textos, cores, fontes, tamanhos, espaçamentos e imagens. Antes de exportar imagens do Figma, procure na Biblioteca de Mídia se já existem e reutilize.

Atue como designer de UI/UX: a página deve ficar **mais curta de rolar**, sem perder clareza (veja o item 7).

---

## 0. Trocar o link do checkout (página inteira)
- Troque **todos** os links `https://pay.kiwify.com.br/201xbLn` da página pelo novo: **`https://pay.kiwify.com.br/Yp8zRLn`** (botões, barra/contador, cards, qualquer widget HTML).
- Depois de trocar, procure na página inteira por `201xbLn` e confirme que **não sobrou nenhum**. Me diga quantos links você trocou.

---

## 1. Seção 1 (hero) + contador
- **Desktop:** siga o Figma https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3650-665&m=dev (node `3650:665`).
- **Contador:**
  - Conta **de agora até 31/10/2026 às 23:59:59 (horário de Brasília)**, com o texto **"Oferta termina em"** e dias, horas, minutos e segundos. Depois disso mostra "Oferta encerrada".
  - **Desktop:** ao abrir a página ele não aparece por cima da hero; **assim que a pessoa rola para baixo**, ele **desliza para o canto inferior direito** como um card flutuante **em destaque** (fundo vermelho em degradê, brilho pulsando, botão "Garantir minha vaga").
  - **Mobile:** fica **fixo na parte inferior** da tela, sempre visível e em destaque, seguindo o Figma https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3650-1013&m=dev (node `3650:1013`).
- **Remova a barra/contador antigo inteiro** (o widget HTML com `class="os-bar"` e qualquer espaçador dele) e coloque este widget HTML no lugar (ajuste cores, fontes e tamanhos para ficar igual ao Figma, **sem mudar a lógica**):

```html
<div class="os-timer" id="os-timer" role="region" aria-label="Contagem regressiva da oferta">
  <div class="os-timer__head">
    <span class="os-timer__dot" aria-hidden="true"></span>
    <strong data-os-label>Oferta termina em</strong>
  </div>
  <div class="os-timer__clock" aria-live="off">
    <div><b data-d>00</b><span>dias</span></div><i>:</i>
    <div><b data-h>00</b><span>horas</span></div><i>:</i>
    <div><b data-m>00</b><span>min</span></div><i>:</i>
    <div><b data-s>00</b><span>seg</span></div>
  </div>
  <a class="os-timer__cta" href="https://pay.kiwify.com.br/Yp8zRLn" target="_blank" rel="noopener">Garantir minha vaga</a>
</div>
<style>
  .os-timer{position:fixed;z-index:9999;color:#fff;font-family:"Plus Jakarta Sans",sans-serif;
    background:linear-gradient(135deg,#C41E26 0%,#ED3838 55%,#FD4C74 100%);
    border:1px solid rgba(255,255,255,.22);box-shadow:0 18px 50px -12px rgba(237,56,56,.6),0 0 0 0 rgba(237,56,56,.5);
    transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .35s ease}
  .os-timer__head{display:flex;align-items:center;gap:8px}
  .os-timer__head strong{font-size:14px;font-weight:800;letter-spacing:.02em}
  .os-timer__dot{width:9px;height:9px;border-radius:50%;background:#fff;flex:none;animation:os-t-pulse 1.6s infinite}
  @keyframes os-t-pulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,.7)}70%{box-shadow:0 0 0 9px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}
  .os-timer__clock{display:flex;align-items:center;gap:5px;font-variant-numeric:tabular-nums}
  .os-timer__clock div{display:grid;justify-items:center;min-width:52px;padding:7px 6px 5px;border-radius:10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.2)}
  .os-timer__clock b{font-size:24px;font-weight:800;line-height:1}
  .os-timer__clock span{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.85;margin-top:3px}
  .os-timer__clock i{font-style:normal;font-weight:800;opacity:.7}
  .os-timer__cta{display:flex;align-items:center;justify-content:center;height:42px;border-radius:999px;background:#fff;color:#C41E26;font-weight:800;font-size:14px;text-decoration:none;transition:transform .2s ease}
  .os-timer__cta:hover{transform:translateY(-2px)}
  .os-timer.is-ended{background:#2A2D35;box-shadow:none}
  /* DESKTOP: card flutuante no canto inferior direito; aparece ao rolar */
  @media (min-width:768px){
    .os-timer{right:24px;bottom:24px;width:300px;padding:16px;border-radius:20px;display:grid;gap:12px;
      transform:translateY(140%);opacity:0;pointer-events:none;animation:os-t-glow 2.4s ease-in-out infinite}
    .os-timer.is-visible{transform:none;opacity:1;pointer-events:auto}
    .os-timer__clock{justify-content:space-between}
  }
  @keyframes os-t-glow{0%,100%{box-shadow:0 18px 50px -12px rgba(237,56,56,.6),0 0 0 0 rgba(237,56,56,.45)}50%{box-shadow:0 18px 50px -12px rgba(237,56,56,.6),0 0 0 8px rgba(237,56,56,0)}}
  /* MOBILE: barra fixa embaixo, sempre visível, em destaque */
  @media (max-width:767px){
    .os-timer{left:0;right:0;bottom:0;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));border-radius:18px 18px 0 0;
      display:grid;grid-template-columns:auto 1fr;align-items:center;gap:6px 10px}
    .os-timer__head{grid-column:1/-1;justify-content:center}
    .os-timer__head strong{font-size:13px}
    .os-timer__clock{grid-column:1/-1;justify-content:center;gap:4px}
    .os-timer__clock div{min-width:56px;padding:6px 4px 4px}
    .os-timer__clock b{font-size:20px}
    .os-timer__cta{display:none}
    body{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))}
  }
  @media (prefers-reduced-motion:reduce){.os-timer,.os-timer__dot{animation:none;transition:none}}
</style>
<script>
(function(){
  var CLOSE = Date.parse("2026-10-31T23:59:59-03:00");
  var el = document.getElementById("os-timer"); if (!el) return;
  var lab = el.querySelector("[data-os-label]"), D = el.querySelector("[data-d]"), H = el.querySelector("[data-h]"), M = el.querySelector("[data-m]"), S = el.querySelector("[data-s]");
  function p(n){ return String(n).padStart(2,"0"); }
  function tick(){
    var d = Math.max(0, Math.floor((CLOSE - Date.now()) / 1000));
    if (d === 0) { lab.textContent = "Oferta encerrada"; el.classList.add("is-ended"); } else { lab.textContent = "Oferta termina em"; }
    D.textContent = p(Math.floor(d / 86400)); H.textContent = p(Math.floor((d % 86400) / 3600)); M.textContent = p(Math.floor((d % 3600) / 60)); S.textContent = p(d % 60);
  }
  tick(); setInterval(tick, 1000);
  /* desktop: mostra o card só depois que a pessoa rola um pouco */
  function onScroll(){ el.classList.toggle("is-visible", window.scrollY > 320); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
})();
</script>

```

- Se o design do Figma do mobile (`3650:1013`) for diferente deste visual, ajuste **só o CSS do bloco `@media (max-width:767px)`** para ficar igual ao Figma.
- Se a página tiver o shortcode do contador de vagas (`[os_vagas]`), ele não deve ficar escondido atrás do contador.

---

## 2. Seção 2
- Deixe igual ao Figma https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3650-900&m=dev (node `3650:900`), no desktop e no mobile.

## 3. Seção 3
- **Permanece como está.** Não mexa.

## 4. Seção 4 (mobile)
- **Só no mobile**, deixe igual ao Figma https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3650-1129&m=dev (node `3650:1129`). O desktop dessa seção não muda.
- Compare o Figma com as seções da página para identificar qual é a seção certa. Se ficar em dúvida, me pergunte antes de alterar.

## 5. Remover a seção "Quanto custa…" (frases que mudam ao rolar)
- **Remova a seção inteira** do efeito de rolagem (widget HTML com `id="os-scrolly"` e o contêiner dela).
- Remova também a classe **`os-curtain`** da seção que vinha logo depois (e o CSS de cortina, se ficou em outro lugar), para ela não subir com margem negativa nem ficar com cantos arredondados estranhos no topo.
- A seção seguinte permanece como está.

## 6. Seção de bônus/oferta
- Deixe igual ao Figma https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3650-913&m=dev (node `3650:913`) no desktop.
- **No mobile, os cards de bônus viram um carrossel contínuo** (esteira que passa sozinha, sem pulos e sem a pessoa precisar arrastar), no mesmo estilo da esteira dos módulos:
  - coloque os cards dentro de um widget HTML assim (um `<li>` por card, com o conteúdo do card do Figma):

```html
<div class="os-mq" aria-label="Bônus">
  <ul class="os-mq__track">
    <li class="os-mq__item"><!-- card de bônus 1 --></li>
    <li class="os-mq__item"><!-- card de bônus 2 --></li>
    <li class="os-mq__item"><!-- card de bônus 3 --></li>
  </ul>
</div>
<style>
  .os-mq{overflow:hidden;width:100vw;margin-left:calc(50% - 50vw);-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
  .os-mq__track{list-style:none;margin:0;padding:0;display:flex;gap:14px;width:max-content;animation:os-mq 35s linear infinite}
  .os-mq__item{flex:none;width:78vw;max-width:320px}
  .os-mq:hover .os-mq__track,.os-mq:active .os-mq__track{animation-play-state:paused}
  @keyframes os-mq{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 7px))}}
  @media (prefers-reduced-motion:reduce){.os-mq{overflow-x:auto}.os-mq__track{animation:none}}
</style>
<script>
(function(){
  document.querySelectorAll(".os-mq__track").forEach(function(t){
    if (t.dataset.cloned) return; t.dataset.cloned = "1";
    Array.prototype.slice.call(t.children).forEach(function(li){ var c = li.cloneNode(true); c.setAttribute("aria-hidden","true"); t.appendChild(c); });
  });
})();
</script>
```

  - esse widget aparece **só no mobile**; no desktop os cards ficam como no Figma (esconda um ou outro com Avançado > Responsivo);
  - todos os cards com a **mesma altura**; com poucos cards (2–3), a esteira continua funcionando porque o código duplica os itens.

---

## 7. Rolagem mais curta (UI/UX), principalmente no mobile
Sem cortar conteúdo nem prejudicar a leitura:
- espaçamento vertical entre seções no mobile: **56–64px** (no desktop 96–112px), padronizado na página toda;
- espaço entre título e conteúdo: 20–24px no mobile;
- imagens decorativas grandes no mobile: reduza a altura (ex.: proporção 16:9 em vez de vertical) ou esconda se não carregam informação;
- listas e cards longos: cards compactos (padding 16–18px), sem espaços vazios dentro;
- carrosséis horizontais no lugar de listas verticais longas quando o conteúdo for repetitivo (já é o caso dos módulos e dos bônus);
- não repita o mesmo botão em seções seguidas; mantenha um botão a cada 1–2 seções;
- nada de alturas fixas grandes (ex.: `min-height: 100vh`) no mobile, exceto onde o Figma pedir.
- Me diga a **altura total da página no mobile antes e depois** (em px, com `document.documentElement.scrollHeight` a 375px).

---

## Verificação e entrega
- Desktop 1440px e mobile 375px: sem rolagem horizontal, sem erros no console, nenhum link antigo `201xbLn`.
- Contador: no desktop aparece no canto inferior direito só depois de rolar; no mobile fica fixo embaixo; mostra dias/horas/min/seg até 31/10 23:59:59.
- Me mande prints de cada seção alterada (desktop e mobile, lado a lado com o Figma) e do contador nos dois formatos.
