Faça estes 4 ajustes na página **Escola** (`/escola`, em rascunho) do site onlysounds.com.br usando o MCP `only-sounds-elementor`. **Os itens 2, 3 e 4 são só para o mobile (≤ 767px)**: não altere o desktop. Faça um item por vez e confira cada um numa aba anônima no celular (375px e 414px) antes de passar para o próximo. Não mexa em nenhuma outra página.

Atue como designer de UI/UX: o objetivo é que o mobile fique limpo, fácil de ler e sem esforço para o usuário.

---

## 1. Setas do carrossel de depoimentos (bug)
As setas estão bugadas: a da esquerda aparece apagada/sem fundo e o estilo do tema interfere nos botões. Substitua **o widget HTML inteiro** do carrossel de vídeos por este código. Ele:
- protege as setas e as bolinhas do estilo do tema (`all: unset`);
- deixa as duas setas **sempre ativas**, com o mesmo visual (círculo branco, borda cinza, ícone preto; no hover fica azul);
- funciona em **loop**: no último vídeo, a seta da direita volta para o primeiro, e vice-versa;
- para o vídeo anterior ao passar para o próximo.

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
  .os-vcar .os-vcar__btn{all:unset;box-sizing:border-box;width:48px;height:48px;border-radius:50%;border:1px solid #d6dbe6;background:#fff;color:#0a0b0f;display:grid;place-items:center;cursor:pointer;transition:background .2s,color .2s,border-color .2s;box-shadow:0 4px 14px rgba(10,20,60,.08)}
  .os-vcar .os-vcar__btn svg{display:block;width:22px;height:22px;stroke:currentColor;fill:none}
  .os-vcar .os-vcar__btn:focus-visible{outline:3px solid #2F7AFF;outline-offset:3px}
  .os-vcar .os-vcar__btn:hover{background:#2F7AFF;border-color:#2F7AFF;color:#fff}
  .os-vcar__dots{display:flex;gap:8px}
  .os-vcar .os-vcar__dots button{all:unset;box-sizing:border-box;width:9px;height:9px;border-radius:99px;background:#c9d0dd;cursor:pointer;transition:width .25s,background .25s}
  .os-vcar .os-vcar__dots button[aria-current="true"]{width:26px;background:#2F7AFF}
  @media (max-width:767px){.os-vcar__frame{border-radius:14px}.os-vcar .os-vcar__btn{width:44px;height:44px}}
</style>
<script>
(function(){
  document.querySelectorAll(".os-vcar").forEach(function(root){
    var track = root.querySelector(".os-vcar__track"), slides = root.querySelectorAll(".os-vcar__slide"),
        dots = root.querySelector(".os-vcar__dots"), prev = root.querySelector('[data-dir="-1"]'), next = root.querySelector('[data-dir="1"]'), cur = 0;
    slides.forEach(function(_, i){ var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Ir para o vídeo " + (i + 1)); b.onclick = function(){ go(i); }; dots.appendChild(b); });
    function pauseOthers(keep){ slides.forEach(function(s, i){ if (i === keep) return; var f = s.querySelector("iframe"); if (f && f.dataset.loaded) { var src = f.src; f.src = ""; f.src = src; } }); }
    function go(i){ var n = slides.length; i = (i % n + n) % n; track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" }); }
    function update(){ var i = Math.round(track.scrollLeft / track.clientWidth); if (i !== cur) { pauseOthers(i); cur = i; }
      dots.querySelectorAll("button").forEach(function(b, k){ b.setAttribute("aria-current", k === i ? "true" : "false"); }); }
    slides.forEach(function(s){ var f = s.querySelector("iframe"); if (f) f.addEventListener("load", function(){ f.dataset.loaded = "1"; }); });
    prev.onclick = function(){ go(cur - 1); }; next.onclick = function(){ go(cur + 1); };
    var t; track.addEventListener("scroll", function(){ clearTimeout(t); t = setTimeout(update, 80); }, { passive: true });
    update();
  });
})();
</script>

```

Confira: as duas setas ficam iguais, centralizadas com as bolinhas, e clicar em qualquer uma sempre muda o vídeo.

---

## 2. (Mobile) Blocos de "título + texto" viram cards
Hoje, no mobile, os blocos com ícone + título + texto ocupam a largura toda, soltos, e a leitura fica cansativa. Isso vale para:
- os **3 pilares do Triplo I** (Inspiração, Interpretação, Informação);
- os **6 benefícios** da oferta (Acesso ilimitado, Treinamentos exclusivos, Visões criativas, Conteúdos atualizados, Comunidade VIP, Encontros ao vivo).

**No mobile**, transforme cada bloco num **card**:
- largura total do conteúdo (com o padding lateral de 20px da página), um card embaixo do outro, **12px** de espaço entre eles;
- dentro do card: **ícone à esquerda** (quadrado 44x44, raio 12) e, à direita dele, **título** (17px, peso 700) com o **texto** embaixo (15px, line-height 1.5); tudo alinhado à esquerda dentro do card;
- padding interno de **18px**, raio **18px**;
- fundo claro (seções claras): `#FFFFFF`, borda `1px solid #E4E7EE`, sombra leve `0 8px 24px -16px rgba(10,20,60,.25)`;
- fundo escuro (Triplo I): fundo `rgba(255,255,255,.04)`, borda `1px solid rgba(255,255,255,.08)`, texto branco e cinza claro `#C4C8D1`;
- o título do pilar sem os dois-pontos no fim ("Inspiração", não "Inspiração:").

Use a classe **`os-mcards`** no contêiner que agrupa os blocos e **`os-mcard`** em cada bloco, e aplique o CSS no Custom CSS da página (adapte os seletores à estrutura real do Elementor, ex.: Icon Box ou contêiner com ícone + títulos):

```css
@media (max-width:767px){
  .os-mcards{display:grid !important;grid-template-columns:1fr !important;gap:12px !important}
  .os-mcard{display:grid !important;grid-template-columns:44px 1fr;column-gap:14px;align-items:start;text-align:left !important;
    padding:18px !important;border-radius:18px;background:#fff;border:1px solid #E4E7EE;box-shadow:0 8px 24px -16px rgba(10,20,60,.25)}
  .os-mcard *{text-align:left !important}
  .os-mcard .elementor-icon-box-wrapper{display:grid;grid-template-columns:44px 1fr;column-gap:14px;text-align:left}
  .os-mcard .elementor-icon-box-icon{margin:0 !important}
  .os-mcard .elementor-icon-box-title{font-size:17px;font-weight:700;margin:0 0 4px}
  .os-mcard .elementor-icon-box-description{font-size:15px;line-height:1.5;margin:0}
  .os-dark .os-mcard{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.08);box-shadow:none}
  .os-dark .os-mcard .elementor-icon-box-description{color:#C4C8D1}
}
```
(Dê a classe **`os-dark`** à seção do Triplo I.)

**Ícones do Triplo I:** os 3 pilares ainda estão com o mesmo ícone de violão. Troque por estes, um diferente para cada, no estilo de traço (24px, azul `#2F7AFF`, dentro do quadrado 44x44 com fundo `rgba(47,122,255,.15)`):

```html
<!-- Inspiração (lâmpada) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F7AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>
<!-- Interpretação (microfone) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F7AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>
<!-- Informação (livro) -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F7AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>
```

Os ícones dos benefícios já estão certos (traço azul): mantenha, só coloque no layout de card.

---

## 3. (Mobile) Quebra de linha harmônica nos títulos
No mobile, alguns títulos quebram deixando **uma ou duas palavras sozinhas** na última linha (ex.: "O que você acessa ao / entrar"). As linhas precisam ficar equilibradas.

1. Remova quebras manuais (`<br>`) dos títulos no mobile. Se o `<br>` for necessário no desktop, troque por um `<span class="os-br-d"></span>` com `.os-br-d{display:block}` só no desktop.
2. Adicione no Custom CSS da página:

```css
@media (max-width:767px){
  h1, h2, h3, .elementor-heading-title{ text-wrap:balance; }
  p, .elementor-widget-text-editor, .elementor-icon-box-description{ text-wrap:pretty; }
}
```

3. O `text-wrap: balance` não funciona em Safari antigo. Para garantir no iPhone, nos títulos que ainda ficarem com palavra sozinha, coloque um **espaço inquebrável** (`&nbsp;`) entre as **duas últimas palavras** (ex.: `acessa ao&nbsp;entrar`) e, se precisar, reduza a largura máxima do título no mobile (ex.: `max-width: 16ch` centralizado) para as linhas ficarem parecidas.
4. Confira **todos os títulos e sobretítulos** da página em **375px e 414px**: nenhuma linha final com só 1 palavra (ou 2 palavras curtas). Me mande prints mostrando cada título.

---

## 4. (Mobile) Carrossel dos módulos passando sozinho, contínuo
No mobile o carrossel dos módulos precisa **andar sozinho, de forma contínua** (sem a pessoa arrastar e sem "pulos" de um slide para outro), como uma esteira.

1. **No mobile, esconda** o widget Carrossel atual dos módulos (Avançado > Responsivo > Ocultar no mobile). No desktop ele continua igual.
2. Logo abaixo dele, adicione um widget **HTML** visível **só no mobile** (Ocultar no desktop e no tablet) com o código abaixo.
3. As URLs das imagens abaixo são as dos módulos que já estão na Biblioteca de Mídia (`uploads/2026/08`). **Confira se cada uma abre**; se alguma estiver diferente, troque pela URL correta da biblioteca. Mantenha a mesma ordem do carrossel do desktop.

```html
<div class="os-marquee" aria-label="Módulos da OnlySounds">
  <ul class="os-marquee__track"><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/262645_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/34_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/33_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/violao_folk_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/storytelling_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/sideman_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/perfomance_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/midia_e_visibilidade_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/imagem_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li><li><img src="https://onlysounds.com.br/wp-content/uploads/2026/08/guitarra_alem_2x-scaled.webp" alt="" width="300" height="169" loading="lazy" decoding="async"></li></ul>
</div>
<style>
  .os-marquee{overflow:hidden;width:100vw;margin-left:calc(50% - 50vw);-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
  .os-marquee__track{list-style:none;margin:0;padding:0;display:flex;gap:14px;width:max-content;animation:os-marquee 45s linear infinite}
  .os-marquee__track li{flex:none;width:72vw;max-width:320px}
  .os-marquee__track img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:14px}
  .os-marquee:hover .os-marquee__track,.os-marquee:active .os-marquee__track{animation-play-state:paused}
  @keyframes os-marquee{from{transform:translateX(0)}to{transform:translateX(calc(-50% - 7px))}}
  @media (prefers-reduced-motion:reduce){.os-marquee{overflow-x:auto}.os-marquee__track{animation:none}}
</style>
<script>
(function(){
  document.querySelectorAll(".os-marquee__track").forEach(function(t){
    if (t.dataset.cloned) return; t.dataset.cloned = "1";
    Array.prototype.slice.call(t.children).forEach(function(li){ var c = li.cloneNode(true); c.setAttribute("aria-hidden","true"); t.appendChild(c); });
  });
})();
</script>
```

- A esteira passa continuamente (um ciclo completo a cada ~45s), pausa se a pessoa tocar/segurar e as bordas laterais têm um leve esmaecimento.
- Se quiser mais rápido, troque `45s` por `30s`.
- Quem ativou "reduzir movimento" no celular vê a lista parada, com rolagem lateral manual.

---

## Verificação e entrega
- Desktop **não pode mudar** (exceto as setas do item 1). Confira em 1440px que está igual a antes.
- Mobile em 375px e 414px: sem rolagem horizontal da página, sem erros no console.
- Me mande prints do mobile: setas do carrossel de depoimentos, cards do Triplo I, cards dos benefícios, todos os títulos e a esteira dos módulos (dois prints com 2 segundos de diferença para ver que ela anda).
