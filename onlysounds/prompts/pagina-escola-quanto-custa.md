Implemente a seção **"Quanto custa…"** na página **Escola** (`/escola`, em rascunho) do site onlysounds.com.br usando o MCP `only-sounds-elementor`, **com efeito de rolagem**, no desktop e no mobile. Não mexa em nenhuma outra página nem nas seções que já existem.

## 1. Referência do design
- Figma: https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3326-2024&m=dev (node **`3326:2024`**)
- Use o MCP do Figma (`get_screenshot` e `get_design_context`) para conferir os textos, as cores e a posição da seção na página.
- Coloque a seção na posição em que ela aparece no Figma (a ordem das seções do frame da página). Se não der para saber, me pergunte.

## 2. Como o efeito funciona
- A seção fica **presa na tela** enquanto a pessoa rola o mouse.
- Aparece **uma frase por vez**: a frase atual sobe e some (com desfoque) enquanto a próxima entra por baixo.
  1. Quanto custa **errar por anos?**
  2. Quanto custa **não sair do lugar?**
  3. Quanto custa soar **igual a todo mundo?**
  (o trecho em negrito fica **azul `#2F7AFF`**, o resto branco)
- Embaixo das frases, 3 tracinhos enchem de azul mostrando o progresso.
- Na parte de baixo aparece o aviso **"Role o mouse para baixo / para ver as próximas frases"** com um mouse animado e setinhas (no celular vira **"Deslize o dedo para cima"**). Ele some quando entra a terceira frase.
- No fim, a **seção seguinte sobe por cima** desta, com cantos arredondados (efeito cortina), e a frase fica para trás escurecendo.
- Quem ativou "reduzir movimento" no sistema vê as 3 frases paradas, sem animação.
- Se os textos no Figma forem diferentes destes, use os do Figma e mantenha a parte final de cada frase em azul.

## 3. Fundo (imagens que já estão no WordPress)
- O fundo **já está na Biblioteca de Mídia**:
  - **desktop:** arquivo com o nome **`desktop-efeito`** (usar em telas a partir de 768px);
  - **mobile:** arquivo com o nome **`mobile-efeito`** (usar em telas até 767px).
- Busque os dois pelo MCP (pesquisar "efeito") e pegue a URL pública de cada um. Pode ser imagem ou vídeo: o código abaixo funciona com os dois (se terminar em `.webm`/`.mp4` ele toca como vídeo mudo em loop; se for imagem, usa como fundo). Se não encontrar, pare e me avise.
- Por cima do fundo há uma película escura leve (`rgba(2,12,26,.35)`) para o texto ficar legível. Ajuste a opacidade se o fundo já for escuro o bastante, comparando com o Figma.

## 4. Implementação
1. Crie um contêiner **largura total**, **sem padding**, e dentro dele um único widget **HTML** com o código abaixo.
2. Troque `URL_DO_desktop-efeito` e `URL_DO_mobile-efeito` pelas URLs reais.
3. **Importante para o efeito funcionar:** o "grudar na tela" usa `position: sticky`. Ele **quebra** se qualquer contêiner pai tiver `overflow: hidden`/`auto`. Garanta `overflow: visible` no contêiner desta seção e nos pais dele (Avançado > Overflow = Padrão/Visível), inclusive no widget HTML.
4. **Efeito cortina:** dê a classe **`os-curtain`** (Avançado > Classes CSS) ao contêiner da **seção que vem logo depois** desta. Ela vai subir por cima no final. Se essa seção tiver fundo transparente, dê a ela uma cor de fundo (a do Figma), senão a cortina não aparece.
5. Não pode existir outro elemento com `id="os-scrolly"` na página.

```html
<section class="os-scrolly" id="os-scrolly" data-bg-desktop="URL_DO_desktop-efeito" data-bg-mobile="URL_DO_mobile-efeito">
  <div class="os-scrolly__pin">
    <div class="os-scrolly__bg" aria-hidden="true"></div>
    <div class="os-scrolly__shade" aria-hidden="true"></div>
    <div class="os-scrolly__inner">
      <div class="os-scrolly__lines">
        <p>Quanto custa <em>errar por anos?</em></p>
        <p>Quanto custa <em>não sair do lugar?</em></p>
        <p>Quanto custa soar <em>igual a todo mundo?</em></p>
      </div>
      <div class="os-scrolly__dots" aria-hidden="true"><i><b></b></i><i><b></b></i><i><b></b></i></div>
    </div>
    <div class="os-scrolly__hint" aria-hidden="true">
      <span class="os-mouse"></span>
      <p><span class="os-hint-mouse">Role o mouse para baixo</span><span class="os-hint-touch">Deslize o dedo para cima</span><small>para ver as próximas frases</small></p>
      <span class="os-chev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
    </div>
  </div>
</section>
<style>
  .os-scrolly{position:relative;background:#020C1A;color:#fff;font-family:"Plus Jakarta Sans",sans-serif}
  .os-scrolly__pin{position:relative;overflow:hidden;display:grid;place-items:center;padding:120px 20px}
  .os-scrolly__bg{position:absolute;inset:0;background-size:cover;background-position:center;background-repeat:no-repeat}
  .os-scrolly__bg video{width:100%;height:100%;object-fit:cover;display:block}
  .os-scrolly__shade{position:absolute;inset:0;background:rgba(2,12,26,.35)}
  .os-scrolly__inner{position:relative;z-index:2;display:grid;justify-items:center;gap:36px;will-change:transform,opacity}
  .os-scrolly__lines{display:grid;gap:.18em;text-align:center}
  .os-scrolly__lines p{margin:0;font-weight:800;font-size:clamp(30px,5.4vw,76px);letter-spacing:-.035em;line-height:1.08;max-width:16ch;margin-inline:auto;text-wrap:balance;color:#fff;will-change:transform,opacity,filter}
  .os-scrolly__lines em{font-style:normal;color:#2F7AFF}
  .os-scrolly__dots{display:none;gap:8px}
  .os-scrolly__dots i{width:28px;height:4px;border-radius:4px;background:rgba(255,255,255,.18);overflow:hidden;position:relative}
  .os-scrolly__dots b{position:absolute;inset:0;background:#2F7AFF;transform-origin:left;transform:scaleX(0)}
  .os-scrolly__hint{position:absolute;z-index:2;left:50%;bottom:32px;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;gap:12px;text-align:center;pointer-events:none}
  .os-scrolly__hint p{margin:0;font-weight:700;font-size:15px}
  .os-scrolly__hint small{display:block;font-size:12px;font-weight:600;color:#8a8f9b;margin-top:2px}
  .os-mouse{width:28px;height:44px;border:2px solid rgba(255,255,255,.85);border-radius:16px;position:relative}
  .os-mouse::after{content:"";position:absolute;left:50%;top:8px;width:4px;height:8px;margin-left:-2px;border-radius:2px;background:#2F7AFF;animation:os-wheel 1.6s ease-in-out infinite}
  @keyframes os-wheel{0%{transform:translateY(0);opacity:1}70%{transform:translateY(14px);opacity:0}100%{transform:translateY(0);opacity:0}}
  .os-chev{display:grid;justify-items:center}
  .os-chev svg{width:22px;height:22px;color:#2F7AFF;animation:os-nudge 1.6s ease-in-out infinite}
  .os-chev svg+svg{margin-top:-12px;opacity:.5;animation-delay:.15s}
  @keyframes os-nudge{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
  .os-hint-touch{display:none}
  @media (hover:none) and (pointer:coarse){.os-mouse,.os-hint-mouse{display:none}.os-hint-touch{display:inline}}
  /* modo animado (só com JS e sem "reduzir movimento") */
  .os-scrolly.is-on{height:420vh}
  .os-scrolly.is-on .os-scrolly__pin{position:sticky;top:0;height:100vh;height:100svh;padding:0 20px}
  .os-scrolly.is-on .os-scrolly__lines p{grid-area:1/1;align-self:center;opacity:0}
  .os-scrolly.is-on .os-scrolly__lines p:first-child{opacity:1}
  .os-scrolly.is-on .os-scrolly__dots{display:flex}
  .os-scrolly.is-on .os-scrolly__hint{display:flex}
  /* a seção seguinte sobe por cima, como cortina (dar a classe os-curtain a ela) */
  .os-scrolly.is-on + .os-curtain, .os-curtain.os-curtain--on{position:relative;z-index:5;margin-top:-100vh;margin-top:-100svh;border-radius:36px 36px 0 0;box-shadow:0 -40px 80px -20px rgba(0,0,0,.55)}
</style>
<script>
(function(){
  var sc = document.getElementById("os-scrolly");
  if (!sc) return;
  var bg = sc.querySelector(".os-scrolly__bg");
  var mq = window.matchMedia("(min-width: 768px)");
  function setBg(){
    var url = mq.matches ? sc.getAttribute("data-bg-desktop") : sc.getAttribute("data-bg-mobile");
    if (!url || bg.getAttribute("data-current") === url) return;
    bg.setAttribute("data-current", url);
    bg.innerHTML = ""; bg.style.backgroundImage = "";
    if (/\.(webm|mp4)(\?|$)/i.test(url)) {
      var v = document.createElement("video");
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute("muted",""); v.setAttribute("playsinline",""); v.preload = "metadata"; v.src = url;
      bg.appendChild(v); var pr = v.play(); if (pr && pr.catch) pr.catch(function(){});
    } else {
      bg.style.backgroundImage = 'url("' + url + '")';
    }
  }
  setBg();
  if (mq.addEventListener) mq.addEventListener("change", setBg); else mq.addListener(setBg);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  sc.classList.add("is-on");
  var curtain = null;
  function findCurtain(){ curtain = document.querySelector(".os-curtain"); if (curtain) curtain.classList.add("os-curtain--on"); }
  findCurtain();
  var ps = sc.querySelectorAll(".os-scrolly__lines p"), bars = sc.querySelectorAll(".os-scrolly__dots b"),
      inner = sc.querySelector(".os-scrolly__inner"), hint = sc.querySelector(".os-scrolly__hint"), ticking = false;
  var clamp = function(v){ return v < 0 ? 0 : v > 1 ? 1 : v; };
  var seg = function(p, a, b){ return clamp((p - a) / (b - a)); };
  var ease = function(x){ return x * x * (3 - 2 * x); };
  var T = [[null,[.26,.40]], [[.26,.40],[.60,.74]], [[.60,.74],null]];
  function frame(){
    ticking = false;
    var vh = window.innerHeight, r = sc.getBoundingClientRect();
    var read = r.height - 2 * vh;
    var p = clamp(-r.top / read);
    var cover = curtain ? clamp((-r.top - read) / vh) : 0;
    for (var i = 0; i < 3; i++){
      var tin = T[i][0] ? ease(seg(p, T[i][0][0], T[i][0][1])) : 1;
      var tout = T[i][1] ? ease(seg(p, T[i][1][0], T[i][1][1])) : 0;
      ps[i].style.opacity = Math.min(tin, 1 - tout);
      ps[i].style.transform = "translateY(" + ((1 - tin) * 70 - tout * 70) + "px)";
      ps[i].style.filter = "blur(" + ((1 - tin) + tout) * 10 + "px)";
      var a = i === 0 ? 0 : T[i][0][1], b = i === 2 ? 1 : T[i][1][0];
      bars[i].style.transform = "scaleX(" + seg(p, a, b) + ")";
    }
    inner.style.transform = "scale(" + (1 - cover * .08) + ")";
    inner.style.opacity = 1 - cover * .7;
    hint.style.opacity = 1 - seg(p, .62, .74);
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(frame); } }
  frame();
  if (!curtain) document.addEventListener("DOMContentLoaded", function(){ findCurtain(); frame(); });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", frame);
})();
</script>
```

## 5. Verificação e entrega
- Teste rolando devagar no desktop: frase 1 → frase 2 → frase 3, tracinhos enchendo, aviso sumindo na 3ª, e no fim a próxima seção subindo por cima.
- Teste no mobile (375px): fundo `mobile-efeito`, texto "Deslize o dedo para cima", frases cabendo na tela, sem rolagem horizontal.
- Confira que a barra vermelha do temporizador continua fixa no topo por cima de tudo.
- Confira que não há erros no console.
- Me mande o link de pré-visualização e prints do desktop (frase 1, frase 3 e o momento da cortina) e do mobile.
