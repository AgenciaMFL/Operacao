Faça esta lista de ajustes na página **Escola** (`/escola`, em rascunho) do site onlysounds.com.br usando o MCP `only-sounds-elementor`. Faça **um item de cada vez**, na ordem, e não mexa em nenhuma outra página. Vários destes pedidos já foram feitos antes e **não foram aplicados** (o play gigante, a moldura do vídeo e a barra no topo continuam lá): confira no front-end, numa aba anônima, se cada mudança realmente apareceu antes de passar para o próximo item.

---

## 1. Hero — vídeo principal
- **Remova o ícone de play gigante** (o triângulo branco/cinza enorme no meio da capa), seja imagem, ícone, SVG ou polígono.
- No lugar, use só o **play padrão pequeno**: círculo de 64px (52px no mobile), fundo `#2F7AFF`, triângulo branco, leve sombra.
- **Remova a moldura**: o retângulo externo escuro com borda azul e o desfoque, e também a borda azul do retângulo interno. O vídeo fica limpo, com cantos de 16px e sombra suave (`0 30px 80px -30px rgba(0,0,0,.7)`).
- **Aumente o vídeo**: 880px de largura no desktop (máx. 100%), 90% no tablet, 100% no mobile, proporção 16:9.
- Mantenha **Image Overlay + Lazy Load** (YouTube só carrega no clique).

## 2. Barra do temporizador: ir para baixo + design novo + corrigir o bug do mobile
- Hoje a barra fica **em cima** e, no mobile, **cobre a logo** (bug). Ela vai para a **parte de baixo da tela**, fixa, com um design melhor.
- Substitua **o widget HTML da barra inteiro** (HTML + CSS + JS) por este:

```html
<div class="os-bar" role="region" aria-label="Contagem regressiva da oferta">
  <div class="os-bar__in">
    <div class="os-bar__info">
      <span class="os-bar__dot" aria-hidden="true"></span>
      <div class="os-bar__txt">
        <strong data-os-label>Oferta começa em</strong>
        <small>27 e 28 de outubro · vagas com bônus para os 20 primeiros</small>
      </div>
    </div>
    <div class="os-bar__clock" aria-live="off">
      <div><b data-h>00</b><span>horas</span></div><i>:</i>
      <div><b data-m>00</b><span>min</span></div><i>:</i>
      <div><b data-s>00</b><span>seg</span></div>
    </div>
    <a class="os-bar__cta" href="https://pay.kiwify.com.br/201xbLn" target="_blank" rel="noopener">Garantir vaga</a>
  </div>
</div>
<style>
  .os-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;color:#fff;font-family:"Plus Jakarta Sans",sans-serif;
    background:linear-gradient(90deg,#B3161F 0%,#ED3838 50%,#B3161F 100%);box-shadow:0 -10px 30px rgba(0,0,0,.35);
    border-top:1px solid rgba(255,255,255,.18);padding-bottom:env(safe-area-inset-bottom,0px)}
  .os-bar__in{max-width:1140px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px}
  .os-bar__info{display:flex;align-items:center;gap:12px;min-width:0}
  .os-bar__dot{width:10px;height:10px;border-radius:50%;background:#fff;flex:none;box-shadow:0 0 0 0 rgba(255,255,255,.7);animation:os-pulse 1.6s infinite}
  @keyframes os-pulse{70%{box-shadow:0 0 0 10px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}
  .os-bar__txt{display:grid;line-height:1.2;min-width:0}
  .os-bar__txt strong{font-size:17px;font-weight:800}
  .os-bar__txt small{font-size:12px;font-weight:600;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .os-bar__clock{display:flex;align-items:center;gap:6px;font-variant-numeric:tabular-nums}
  .os-bar__clock div{display:grid;justify-items:center;min-width:58px;padding:6px 8px 4px;border-radius:10px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.18)}
  .os-bar__clock b{font-size:24px;font-weight:800;line-height:1}
  .os-bar__clock span{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin-top:3px}
  .os-bar__clock i{font-style:normal;font-weight:800;font-size:20px;opacity:.7}
  .os-bar__cta{display:inline-flex;align-items:center;height:42px;padding:0 22px;border-radius:999px;background:#fff;color:#C41E26;font-weight:800;font-size:15px;text-decoration:none;white-space:nowrap;transition:transform .2s ease,box-shadow .2s ease}
  .os-bar__cta:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.3)}
  .os-bar.is-ended{background:#2A2D35}
  body{padding-bottom:72px}
  @media (max-width:767px){
    .os-bar__in{padding:8px 14px;gap:10px}
    .os-bar__txt small,.os-bar__cta{display:none}
    .os-bar__txt strong{font-size:13px}
    .os-bar__dot{width:8px;height:8px}
    .os-bar__clock{gap:3px}
    .os-bar__clock div{min-width:44px;padding:5px 4px 3px;border-radius:8px}
    .os-bar__clock b{font-size:18px}
    .os-bar__clock span{font-size:8px;letter-spacing:.08em}
    .os-bar__clock i{font-size:14px}
    body{padding-bottom:calc(60px + env(safe-area-inset-bottom,0px))}
  }
</style>
<script>
(function(){
  var OPEN  = Date.parse("2026-10-27T00:00:00-03:00");
  var CLOSE = Date.parse("2026-10-28T23:59:59-03:00");
  var bar = document.querySelector(".os-bar"); if (!bar) return;
  var lab = bar.querySelector("[data-os-label]");
  var H = bar.querySelector("[data-h]"), M = bar.querySelector("[data-m]"), S = bar.querySelector("[data-s]");
  function p(n){ return String(n).padStart(2,"0"); }
  function tick(){
    var now = Date.now(), t;
    if (now < OPEN) { lab.textContent = "Oferta começa em"; t = OPEN; }
    else if (now <= CLOSE) { lab.textContent = "Oferta termina em"; t = CLOSE; }
    else { lab.textContent = "Oferta encerrada"; t = now; bar.classList.add("is-ended"); }
    var d = Math.max(0, Math.floor((t - now) / 1000));
    H.textContent = p(Math.floor(d / 3600)); M.textContent = p(Math.floor((d % 3600) / 60)); S.textContent = p(d % 60);
  }
  tick(); setInterval(tick, 1000);
})();
</script>

```

- **Remova** qualquer espaço/padding no topo da página ou da hero que existia só para compensar a barra antiga, e o `<div class="os-bar-spacer">`. A hero tem que começar colada no topo.
- Confira que não ficou nenhuma barra antiga duplicada e que não existe outra barra fixa embaixo no mobile (se existir, remova e me avise).
- Se o aviso "Role o mouse para baixo" da seção "Quanto custa…" ficar atrás da barra, adicione `bottom: 96px` em `.os-scrolly__hint` (mobile: `bottom: 80px`).

## 3. Títulos: todos centralizados e do mesmo tamanho
- **Todos os títulos de seção** (H2) da página ficam **centralizados** e com o **mesmo tamanho**. Dê a classe **`os-title`** a cada um (Avançado > Classes CSS), alinhamento centralizado, e use este CSS (Custom CSS da página):

```css
.os-title .elementor-heading-title, .os-title h2{
  text-align:center; font-family:"Plus Jakarta Sans",sans-serif; font-weight:800;
  font-size:44px; line-height:1.1; letter-spacing:-.02em; max-width:18ch; margin:0 auto;
}
@media (max-width:1024px){ .os-title .elementor-heading-title, .os-title h2{ font-size:36px; } }
@media (max-width:767px){ .os-title .elementor-heading-title, .os-title h2{ font-size:28px; } }
```

- O mesmo vale para os "sobretítulos" pequenos acima dos títulos (ex.: "Somente 26 e 27 de outubro"): centralizados.
- Textos de apoio logo abaixo dos títulos também centralizados, com largura máx. de ~60 caracteres.

## 4. Botões: menos largos
- Os botões estão muito largos. Padronize (todos com a classe `os-btn`):

```css
.os-btn .elementor-button{ width:auto; min-width:260px; max-width:340px; padding:0 36px; height:58px; display:inline-flex; align-items:center; justify-content:center; }
.os-btn{ text-align:center; }
@media (max-width:767px){ .os-btn .elementor-button{ width:100%; max-width:320px; min-width:0; height:54px; } }
```

- Botões sempre **centralizados** na seção.

## 5. Ícones: padronizar tamanhos (Triplo I, benefícios e checklist)
- Hoje os ícones estão com tamanhos diferentes (um violão grande, outros pequenos). Padronize **todos os ícones de destaque** da página assim:
  - quadrado de **48x48px**, raio 12px, fundo `#EAF1FF` (em fundo escuro: `rgba(47,122,255,.15)`);
  - ícone de **24px**, traço azul `#2F7AFF`, espessura 2, sem preenchimento.
- Nos **3 pilares do Triplo I** (Inspiração, Interpretação, Informação), use um ícone diferente para cada, no mesmo estilo:

```html
<!-- Inspiração (lâmpada) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F7AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>
<!-- Interpretação (microfone) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F7AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>
<!-- Informação (livro) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F7AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>
```

- Layout dos pilares: **ícone em cima, título embaixo e texto embaixo, tudo centralizado** (no desktop em 3 colunas, no mobile empilhados). O título do pilar ("Inspiração:") em negrito na linha de cima, o texto na linha de baixo.

## 6. Checklist da seção "Para quem é"
- Troque os ícones de violão por um **check** limpo e melhore o visual da lista. Substitua a lista por um widget HTML com este código (mantendo os textos atuais):

```html
<ul class="os-check">
  <li>Quer construir uma identidade artística memorável</li>
  <li>Tem talento, mas ainda não é percebido como artista</li>
  <li>Se sente sozinho e sem clareza na jornada</li>
  <li>Quer saber, sem rodeios, onde está errando</li>
  <li>Cansou de guru e quer ouvir quem tem carreira real</li>
  <li>Quer entender como viver de música e onde investir</li>
  <li>Quer ampliar repertório e cultura artística</li>
</ul>
<style>
  .os-check{list-style:none;margin:0;padding:0;display:grid;max-width:560px}
  .os-check li{position:relative;padding:14px 0 14px 40px;border-bottom:1px solid rgba(10,11,15,.08);font-family:"Plus Jakarta Sans",sans-serif;font-weight:600;font-size:17px;line-height:1.4;color:inherit}
  .os-check li:first-child{border-top:1px solid rgba(10,11,15,.08)}
  .os-check li::before{content:"";position:absolute;left:0;top:13px;width:26px;height:26px;border-radius:8px;background:#2F7AFF url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 12.5 4.5 4.5L19 7.5'/%3E%3C/svg%3E") center/15px no-repeat}
  @media (max-width:767px){.os-check li{font-size:16px;padding:12px 0 12px 38px}.os-check li::before{top:11px}}
</style>
```

- Se a seção tiver fundo escuro, troque a cor das linhas divisórias para `rgba(255,255,255,.12)`.

## 7. Seção "Quanto custa…": frases menores no mobile
- No mobile as frases ficaram grandes demais. Adicione ao CSS do widget da seção:

```css
@media (max-width:767px){
  .os-scrolly__lines p{ font-size:clamp(24px,7.4vw,32px); max-width:13ch; }
  .os-scrolly.is-on{ height:340vh; }
}
```

## 8. Carrossel dos módulos passando sozinho no mobile
- No widget Carrossel dos módulos: ative **Autoplay** (3 segundos), **loop infinito** e **pausar ao interagir**.
- Se o Elementor permitir configuração por dispositivo, deixe o autoplay ligado **pelo menos no mobile** (no desktop pode ficar ligado também).
- No mobile mostre ~1,2 card por vez para indicar que dá para arrastar.

## 9. Benefícios (ícone + texto embaixo): tudo centralizado
- Na grade de benefícios ("Acesso ilimitado…", "Treinamentos exclusivos"…), deixe **ícone centralizado em cima, título e texto centralizados embaixo**, em todas as colunas, no desktop e no mobile.

## 10. Checkout (card da oferta)
- **Remova o contador** que está dentro do card (já existe a barra do temporizador).
- No lugar, deixe a **logo da OnlySounds centralizada e maior** no topo do card (use `group_8.webp` da biblioteca, 200px no desktop / 160px no mobile).
- **Melhore a diagramação dos textos** do card:
  - cada coluna (O que é / Assinatura anual / Bônus) com o rótulo pequeno em cima (12px, maiúsculas, espaçado, cinza `#6E7483`), o conteúdo principal embaixo e espaçamento igual entre eles (12px);
  - preço em destaque: "em até 12x de" pequeno, **R$ 163,20** grande (o "R$" menor), "ou R$ 1.578,00 à vista" embaixo;
  - as 3 colunas alinhadas pelo topo, com a mesma altura e divisórias finas entre elas;
  - no mobile, as colunas empilhadas e **centralizadas**, com divisória horizontal entre elas;
  - formas de pagamento centralizadas, com os 3 cartões do mesmo tamanho; botão centralizado com "Pagamento seguro via Kiwify" embaixo.

## 11. Depoimentos: vídeos em carrossel
- Troque os dois vídeos da seção de depoimentos por **um carrossel**: um vídeo por vez, setas para passar e bolinhas embaixo. A pessoa clica no vídeo para assistir; ao passar para o outro, o anterior para.
- Substitua os dois widgets dos vídeos por um único widget HTML com este código (já tem os dois vídeos da Panda e carrega só quando a pessoa chega na seção):

```html
<div class="os-vcar" aria-roledescription="carrossel" aria-label="Depoimentos em vídeo">
  <div class="os-vcar__track">
    <div class="os-vcar__slide" aria-label="Depoimento 1 de 2">
      <div class="os-vcar__frame"><iframe id="panda-aa05afa7-f3a6-495b-b62c-e3c3de2e062a" src="https://player-vz-56a7d893-7bf.tv.pandavideo.com.br/embed/?v=aa05afa7-f3a6-495b-b62c-e3c3de2e062a" loading="lazy" style="border:none" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture" allowfullscreen="true" title="Depoimento 1"></iframe></div>
    </div>
    <div class="os-vcar__slide" aria-label="Depoimento 2 de 2">
      <div class="os-vcar__frame"><iframe id="panda-971785e1-f049-4351-9cb0-f029b631f24e" src="https://player-vz-56a7d893-7bf.tv.pandavideo.com.br/embed/?v=971785e1-f049-4351-9cb0-f029b631f24e" loading="lazy" style="border:none" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture" allowfullscreen="true" title="Depoimento 2"></iframe></div>
    </div>
  </div>
  <div class="os-vcar__nav">
    <button type="button" class="os-vcar__btn" data-dir="-1" aria-label="Vídeo anterior"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    <div class="os-vcar__dots"></div>
    <button type="button" class="os-vcar__btn" data-dir="1" aria-label="Próximo vídeo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>
  </div>
</div>
<style>
  .os-vcar{max-width:880px;margin:0 auto;position:relative}
  .os-vcar__track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;gap:20px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .os-vcar__track::-webkit-scrollbar{display:none}
  .os-vcar__slide{flex:0 0 100%;scroll-snap-align:center}
  .os-vcar__frame{position:relative;aspect-ratio:16/9;border-radius:20px;overflow:hidden;background:#0a0b0f;box-shadow:0 30px 70px -35px rgba(10,20,60,.6)}
  .os-vcar__frame iframe{position:absolute;inset:0;width:100%;height:100%}
  .os-vcar__nav{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:22px}
  .os-vcar__btn{width:48px;height:48px;border-radius:50%;border:1px solid #d6dbe6;background:#fff;color:#0a0b0f;display:grid;place-items:center;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
  .os-vcar__btn:hover{background:#2F7AFF;border-color:#2F7AFF;color:#fff}
  .os-vcar__btn:disabled{opacity:.35;cursor:default;background:#fff;color:#0a0b0f;border-color:#d6dbe6}
  .os-vcar__dots{display:flex;gap:8px}
  .os-vcar__dots button{width:9px;height:9px;padding:0;border-radius:99px;border:0;background:#c9d0dd;cursor:pointer;transition:width .25s,background .25s}
  .os-vcar__dots button[aria-current="true"]{width:26px;background:#2F7AFF}
  @media (max-width:767px){.os-vcar__frame{border-radius:14px}.os-vcar__btn{width:42px;height:42px}}
</style>
<script>
(function(){
  document.querySelectorAll(".os-vcar").forEach(function(root){
    var track = root.querySelector(".os-vcar__track"), slides = root.querySelectorAll(".os-vcar__slide"),
        dots = root.querySelector(".os-vcar__dots"), prev = root.querySelector('[data-dir="-1"]'), next = root.querySelector('[data-dir="1"]'), cur = 0;
    slides.forEach(function(_, i){ var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Ir para o vídeo " + (i + 1)); b.onclick = function(){ go(i); }; dots.appendChild(b); });
    function pauseOthers(keep){ slides.forEach(function(s, i){ if (i === keep) return; var f = s.querySelector("iframe"); if (f && f.dataset.loaded) { var src = f.src; f.src = ""; f.src = src; } }); }
    function go(i){ i = Math.max(0, Math.min(slides.length - 1, i)); track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" }); }
    function update(){ var i = Math.round(track.scrollLeft / track.clientWidth); if (i !== cur) { pauseOthers(i); cur = i; }
      dots.querySelectorAll("button").forEach(function(b, k){ b.setAttribute("aria-current", k === i ? "true" : "false"); });
      prev.disabled = i === 0; next.disabled = i === slides.length - 1; }
    slides.forEach(function(s){ var f = s.querySelector("iframe"); if (f) f.addEventListener("load", function(){ f.dataset.loaded = "1"; }); });
    prev.onclick = function(){ go(cur - 1); }; next.onclick = function(){ go(cur + 1); };
    var t; track.addEventListener("scroll", function(){ clearTimeout(t); t = setTimeout(update, 80); }, { passive: true });
    update();
  });
})();
</script>

```

- Se quiser adicionar mais vídeos depois, é só copiar um bloco `os-vcar__slide` com o novo ID da Panda.

---

## Verificação e entrega
- Teste tudo numa **aba anônima** (para não ver cache) no desktop 1440px e no mobile 375px.
- Sem rolagem horizontal em 375px, sem erros no console.
- Me mande prints de cada item (1 a 11), desktop e mobile, e me diga se algum não foi possível no Elementor.
