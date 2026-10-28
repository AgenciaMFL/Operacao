Faça **só estes ajustes** na página **Escola** (`/escola`) do site onlysounds.com.br usando o MCP `only-sounds-elementor`. Não mexa em mais nada. Confira cada um numa **aba anônima** no celular (375px) e no desktop (1440px).

---

## 1. Hero: o vídeo tem que aparecer assim que a página abre
Hoje o vídeo da hero só aparece/carrega depois que a pessoa toca na tela. Troque por uma **capa (imagem) que aparece na hora**, com botão de play; o player do YouTube só carrega quando a pessoa clica no play (e já começa a tocar).

1. Pegue o **ID do vídeo do YouTube** que está hoje na hero (é o vídeo "BEM-VINDOS À ONLY SOUNDS"; o ID é o código depois de `v=` ou de `youtu.be/`).
2. **Capa:** baixe a miniatura `https://i.ytimg.com/vi/ID_DO_VIDEO/maxresdefault.jpg`, converta para **WebP** (até ~120 KB) e suba na Biblioteca de Mídia com o nome `escola-hero-video-capa.webp`. Use a URL dela abaixo. (Se a miniatura não existir em `maxresdefault`, use `hqdefault`.)
3. Substitua o widget de vídeo da hero por um widget **HTML** com este código (troque `ID_DO_VIDEO` e `URL_DA_CAPA`):

```html
<div class="os-yt" data-id="ID_DO_VIDEO">
  <img class="os-yt__cover" src="URL_DA_CAPA" alt="Assista ao vídeo da OnlySounds" width="1280" height="720" fetchpriority="high" loading="eager" decoding="async">
  <button type="button" class="os-yt__play" aria-label="Assistir ao vídeo">
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="#fff"/></svg>
  </button>
</div>
<style>
  .os-yt{position:relative;width:100%;max-width:880px;margin:0 auto;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#0a0b0f;box-shadow:0 30px 80px -30px rgba(0,0,0,.7);cursor:pointer}
  .os-yt__cover{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease}
  .os-yt:hover .os-yt__cover{transform:scale(1.03)}
  .os-yt .os-yt__play{all:unset;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:68px;height:68px;border-radius:50%;background:#2F7AFF;display:grid;place-items:center;cursor:pointer;box-shadow:0 0 0 8px rgba(47,122,255,.25);transition:transform .2s ease}
  .os-yt:hover .os-yt__play{transform:translate(-50%,-50%) scale(1.06)}
  .os-yt .os-yt__play svg{margin-left:4px}
  .os-yt iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  @media (max-width:767px){.os-yt{border-radius:14px}.os-yt .os-yt__play{width:56px;height:56px}}
</style>
<script>
(function(){
  document.querySelectorAll(".os-yt").forEach(function(box){
    box.addEventListener("click", function(){
      if (box.querySelector("iframe")) return;
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + box.getAttribute("data-id") + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      f.title = "Vídeo da OnlySounds"; f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"; f.allowFullscreen = true;
      box.appendChild(f);
    });
  });
})();
</script>

```

- Mantenha o vídeo **sem moldura**, com cantos de 16px, e com o mesmo tamanho de antes.
- A capa é a imagem principal da página: **não** use lazy load nela (o código já usa `loading="eager"` e `fetchpriority="high"`).
- Confira: ao abrir a página (sem tocar em nada), a capa do vídeo aparece na hora; ao clicar no play, o vídeo começa a tocar.

---

## 2. Carrossel com setas para interagir (Triplo I no mobile e bônus no mobile)
Os dois carrosséis do mobile precisam deixar a pessoa **interagir**: setas para passar, bolinhas e arrastar com o dedo. O carrossel de bônus atual (a "esteira" contínua `os-mq`) ficou **bugado** e deve ser **removido**.

Use este mesmo componente nos dois lugares (um widget **HTML** em cada, visível **só no mobile**; no desktop as seções ficam como estão):

```html
<div class="os-car" data-autoplay="5000" aria-roledescription="carrossel" aria-label="NOME_DO_CARROSSEL">
  <div class="os-car__track">
    <div class="os-car__slide"><!-- card 1 (conteúdo do card) --></div>
    <div class="os-car__slide"><!-- card 2 --></div>
    <div class="os-car__slide"><!-- card 3 --></div>
  </div>
  <div class="os-car__nav">
    <button type="button" class="os-car__btn" data-dir="-1" aria-label="Anterior"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
    <div class="os-car__dots"></div>
    <button type="button" class="os-car__btn" data-dir="1" aria-label="Próximo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
  </div>
</div>
<style>
  .os-car{position:relative;width:100%}
  .os-car__track{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:4px 2px 8px}
  .os-car__track::-webkit-scrollbar{display:none}
  .os-car__slide{flex:0 0 86%;scroll-snap-align:center;display:flex}
  .os-car__slide > *{flex:1;min-width:0}
  .os-car__nav{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:14px}
  .os-car .os-car__btn{all:unset;box-sizing:border-box;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:#fff;color:#0a0b0f;border:1px solid #d6dbe6;box-shadow:0 4px 14px rgba(10,20,60,.1);transition:background .2s,color .2s,border-color .2s}
  .os-car .os-car__btn svg{display:block;width:22px;height:22px;stroke:currentColor;fill:none}
  .os-car .os-car__btn:hover{background:#2F7AFF;border-color:#2F7AFF;color:#fff}
  .os-car .os-car__btn:focus-visible{outline:3px solid #2F7AFF;outline-offset:3px}
  .os-car__dots{display:flex;gap:7px}
  .os-car .os-car__dots button{all:unset;box-sizing:border-box;width:8px;height:8px;border-radius:99px;background:#c9d0dd;cursor:pointer;transition:width .25s,background .25s}
  .os-car .os-car__dots button[aria-current="true"]{width:24px;background:#2F7AFF}
  /* em fundo escuro: adicione a classe os-car--dark */
  .os-car--dark .os-car__btn{background:rgba(255,255,255,.08) !important;color:#fff !important;border-color:rgba(255,255,255,.18) !important;box-shadow:none !important}
  .os-car--dark .os-car__btn:hover{background:#2F7AFF !important;border-color:#2F7AFF !important}
  .os-car--dark .os-car__dots button{background:rgba(255,255,255,.25) !important}
  .os-car--dark .os-car__dots button[aria-current="true"]{background:#2F7AFF !important}
</style>
<script>
(function(){
  document.querySelectorAll(".os-car").forEach(function(root){
    if (root.dataset.ready) return; root.dataset.ready = "1";
    var track = root.querySelector(".os-car__track"), slides = root.querySelectorAll(".os-car__slide"), dots = root.querySelector(".os-car__dots"), cur = 0, n = slides.length, timer = null;
    var delay = parseInt(root.getAttribute("data-autoplay"), 10) || 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    slides.forEach(function(s, i){ s.setAttribute("aria-label", (i + 1) + " de " + n);
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Ir para o item " + (i + 1)); b.onclick = function(){ go(i); stop(); }; dots.appendChild(b); });
    function go(i){ i = (i % n + n) % n; var s = slides[i]; track.scrollTo({ left: s.offsetLeft - track.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: "smooth" }); }
    function update(){ var c = track.scrollLeft + track.clientWidth / 2, best = 0, bd = Infinity;
      slides.forEach(function(s, i){ var m = s.offsetLeft - track.offsetLeft + s.clientWidth / 2, dd = Math.abs(m - c); if (dd < bd) { bd = dd; best = i; } });
      cur = best; dots.querySelectorAll("button").forEach(function(b, k){ b.setAttribute("aria-current", k === cur ? "true" : "false"); }); }
    root.querySelector('[data-dir="-1"]').onclick = function(){ go(cur - 1); stop(); };
    root.querySelector('[data-dir="1"]').onclick = function(){ go(cur + 1); stop(); };
    var t; track.addEventListener("scroll", function(){ clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    function start(){ if (!delay || reduce || timer) return; timer = setInterval(function(){ if (!document.hidden) go(cur + 1); }, delay); }
    function stop(){ clearInterval(timer); timer = null; }
    ["pointerdown","touchstart","wheel","mouseenter","focusin"].forEach(function(e){ root.addEventListener(e, stop, { passive: true }); });
    root.addEventListener("mouseleave", start);
    update(); start();
  });
})();
</script>

```

Como usar:
- Coloque **cada card** dentro de um `<div class="os-car__slide">…</div>`, com o mesmo conteúdo e visual de hoje (ícone, título, texto). Pode ter quantos cards quiser.
- Troque `NOME_DO_CARROSSEL` por um nome (ex.: "Método Triplo I", "Bônus").
- Ele mostra **um card por vez com um pedaço do próximo** (para a pessoa entender que tem mais), **setas** embaixo, **bolinhas** de posição e permite **arrastar**. As setas fazem **loop** (do último volta para o primeiro).
- Ele **passa sozinho a cada 5 segundos** e **para assim que a pessoa toca, arrasta ou clica** nas setas (para não brigar com a leitura). Para desligar o automático, troque `data-autoplay="5000"` por `data-autoplay="0"`.
- Todos os cards com a **mesma altura** (o código já estica os cards da mesma linha).

**a) Triplo I ("Aqui o músico pensa como um ARTISTA") — mobile**
- Substitua o carrossel/lista atual dos 3 pilares (Inspiração, Interpretação, Informação) por esse componente.
- A seção tem fundo escuro: adicione a classe **`os-car--dark`** ao lado de `os-car` (fica `class="os-car os-car--dark"`), para as setas e bolinhas ficarem claras.
- Desligue o automático aqui (`data-autoplay="0"`): são só 3 cards e a pessoa navega pelas setas.

**b) Bônus ("Chegou a hora de afirmar sua identidade") — mobile**
- **Remova** a esteira atual (widget com `class="os-mq"`, incluindo o CSS/JS dela).
- Coloque os cards de bônus no componente acima, com o automático ligado (`data-autoplay="5000"`).
- Seção de fundo claro: **sem** a classe `os-car--dark`.
- Confira que nenhum card fica cortado, escuro ou sobreposto (o bug de hoje), e que não há rolagem horizontal da página.

---

## Entrega
Prints do mobile (375px): hero logo ao abrir (sem tocar), Triplo I com as setas (antes e depois de clicar na seta), bônus com as setas (antes e depois); e do desktop (1440px) mostrando que essas seções continuam iguais.
