Faça estes 5 ajustes na página **Escola** (`/escola`, em rascunho) do site onlysounds.com.br usando o MCP `only-sounds-elementor`. Não mexa em nenhuma outra página nem em outras partes desta página.

## 1. Remover a luz azul da hero
- Remova os brilhos/luzes azuis desfocados da seção hero: os círculos e elipses azuis com blur (os "glows" atrás do vídeo e nas laterais do botão), seja widget, pseudo-elemento (`::before`/`::after`), `box-shadow` grande ou `radial-gradient` aplicado no fundo do contêiner.
- Mantenha: o vídeo de fundo `hero-bg-720-1.webm`, o overlay escuro e a foto do Rodrigo a 17%.
- A moldura do vídeo principal continua com a borda azul fina, mas **sem** sombra/brilho azul em volta.
- O fundo final deve ficar escuro (azul quase preto `#04102E`) com o vídeo de fumaça aparecendo por trás, sem manchas de luz.

## 2. Logo: usar a imagem que já está na biblioteca
- Substitua a logo atual da hero (a que está desalinhada) pela imagem que **já existe na Biblioteca de Mídia** chamada **`group_8.webp`**. Busque pelo MCP (pesquisar "group_8") e use a URL dela num widget **Imagem**.
- Largura: 200px no desktop, 160px no mobile, centralizada, `height: auto`.
- Texto alternativo: `OnlySounds`.
- Remova o SVG/imagem de logo antigo para não ficar duplicado.
- Se não encontrar `group_8.webp`, pare e me avise.

## 3. Temporizador: refazer e deixar funcionando
Substitua a barra atual inteira por um único widget **HTML** no topo da página com o código abaixo (pode ajustar só cores/tamanhos se precisar encaixar no tema). Ele:
- fica **fixo no topo** e acompanha a rolagem;
- fica abaixo da admin bar quando estou logado;
- reserva o espaço da barra para não cobrir a hero;
- conta em horas totais, no horário de Brasília: antes de 27/10 mostra "Oferta começa em:", de 27/10 00:00 até 28/10 23:59:59 mostra "Oferta termina em:", depois mostra "Oferta encerrada";
- usa `aria-live="off"` para leitor de tela não anunciar cada segundo.

```html
<div class="os-bar" role="region" aria-label="Contagem regressiva da oferta">
  <div class="os-bar__in">
    <span class="os-bar__label" data-os-label>Oferta termina em:</span>
    <span class="os-bar__time" data-os-time aria-live="off">
      <b data-h>00</b><i>h</i> <b data-m>00</b><i>m</i> <b data-s>00</b><i>s</i>
    </span>
    <a class="os-bar__cta" href="https://pay.kiwify.com.br/201xbLn" target="_blank" rel="noopener">Garantir vaga</a>
  </div>
</div>
<div class="os-bar-spacer" aria-hidden="true"></div>
<style>
  .os-bar{position:fixed;left:0;right:0;top:0;z-index:9999;background:#ED3838;color:#fff;font-family:"Plus Jakarta Sans",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25)}
  .admin-bar .os-bar{top:32px}
  @media (max-width:782px){.admin-bar .os-bar{top:46px}}
  .os-bar__in{max-width:1140px;margin:0 auto;padding:0 20px;height:54px;display:flex;align-items:center;justify-content:space-between;gap:16px}
  .os-bar__label{font-weight:700;font-size:20px;white-space:nowrap}
  .os-bar__time{font-weight:800;font-size:23px;font-variant-numeric:tabular-nums;white-space:nowrap;letter-spacing:.01em}
  .os-bar__time i{font-style:normal;font-weight:700;opacity:.85;margin-left:1px}
  .os-bar__cta{display:inline-flex;align-items:center;height:36px;padding:0 18px;border-radius:999px;background:#fff;color:#ED3838;font-weight:800;font-size:14px;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease}
  .os-bar__cta:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.25)}
  .os-bar-spacer{height:54px}
  .os-bar.is-ended{background:#2A2D35}
  @media (max-width:767px){
    .os-bar__in{height:46px;gap:10px}
    .os-bar__label{font-size:14px}
    .os-bar__time{font-size:17px}
    .os-bar__cta{display:none}
    .os-bar-spacer{height:46px}
  }
</style>
<script>
(function(){
  var OPEN  = Date.parse("2026-10-27T00:00:00-03:00");
  var CLOSE = Date.parse("2026-10-28T23:59:59-03:00");
  var bar = document.querySelector(".os-bar");
  if (!bar) return;
  var lab = bar.querySelector("[data-os-label]");
  var H = bar.querySelector("[data-h]"), M = bar.querySelector("[data-m]"), S = bar.querySelector("[data-s]");
  function p(n){ return String(n).padStart(2,"0"); }
  function tick(){
    var now = Date.now(), target;
    if (now < OPEN) { lab.textContent = "Oferta começa em:"; target = OPEN; }
    else if (now <= CLOSE) { lab.textContent = "Oferta termina em:"; target = CLOSE; }
    else { lab.textContent = "Oferta encerrada"; target = now; bar.classList.add("is-ended"); }
    var d = Math.max(0, Math.floor((target - now) / 1000));
    H.textContent = p(Math.floor(d / 3600));
    M.textContent = p(Math.floor((d % 3600) / 60));
    S.textContent = p(d % 60);
  }
  tick();
  setInterval(tick, 1000);
})();
</script>
```

Depois de colar, confira e me confirme:
- a barra aparece e os números mudam a cada segundo;
- ela continua no topo ao rolar até o fim da página;
- com login (admin bar) e sem login (aba anônima) ela não cobre nada;
- no mobile (375px) cabe numa linha só;
- não há outra barra/temporizador antigo duplicado na página nem erros no console.

## 4. Efeito nos botões
Aplique em **todos os botões da página** (o "Entrar na OnlySounds" da hero e os demais), mantendo o degradê atual. Coloque o CSS no **Custom CSS da página** (ou num widget HTML no fim da página) e dê a classe `os-btn` aos botões (Avançado > Classes CSS):

```css
.os-btn .elementor-button{
  position:relative; overflow:hidden; isolation:isolate;
  transition:transform .25s ease, box-shadow .25s ease, filter .25s ease;
  box-shadow:0 10px 30px -12px rgba(47,122,255,.75);
}
.os-btn .elementor-button::after{
  content:""; position:absolute; top:0; left:-75%; width:50%; height:100%;
  background:linear-gradient(120deg, transparent, rgba(255,255,255,.45), transparent);
  transform:skewX(-20deg); z-index:-1; animation:os-shine 3.2s ease-in-out infinite;
}
.os-btn .elementor-button:hover{
  transform:translateY(-3px) scale(1.02);
  box-shadow:0 18px 40px -12px rgba(47,122,255,.95);
  filter:brightness(1.08);
}
.os-btn .elementor-button:active{ transform:translateY(0) scale(.98); }
.os-btn .elementor-button:focus-visible{ outline:3px solid #fff; outline-offset:3px; }
@keyframes os-shine{ 0%{left:-75%} 60%,100%{left:130%} }
@media (prefers-reduced-motion:reduce){
  .os-btn .elementor-button, .os-btn .elementor-button::after{ animation:none; transition:none; }
}
```

Efeito esperado: um brilho branco passa pelo botão a cada ~3 segundos; ao passar o mouse, o botão sobe um pouco, cresce levemente e a sombra azul aumenta; ao clicar, ele "afunda".

## 5. Foto do Rodrigo sumiu depois do vídeo de fundo
**Problema:** o widget HTML do vídeo de fundo é absoluto e fica por cima do fundo do contêiner, então a foto do Rodrigo (que estava como imagem de fundo do contêiner) ficou escondida atrás do vídeo.

**Correção:** não use a foto como "imagem de fundo" do contêiner. Substitua o widget HTML do vídeo de fundo por este, que monta as 3 camadas na ordem certa (vídeo → foto do Rodrigo a 17% → escurecimento), todas atrás do conteúdo:

```html
<div class="os-hero-bg" aria-hidden="true">
  <div class="os-hero-bg__video" data-src-webm="URL_DO_hero-bg-720-1.webm"></div>
  <div class="os-hero-bg__photo"></div>
  <div class="os-hero-bg__shade"></div>
</div>
<style>
  /* o contêiner da hero precisa da classe os-hero (Avançado > Classes CSS) */
  .os-hero{position:relative;overflow:hidden;background:#04102E}
  .os-hero > .e-con-inner, .os-hero > .elementor-container{position:relative;z-index:3}
  .os-hero-bg{position:absolute;inset:0;z-index:0;pointer-events:none}
  .os-hero-bg > div{position:absolute;inset:0}
  .os-hero-bg__video video{width:100%;height:100%;object-fit:cover;display:block}
  .os-hero-bg__video{z-index:1}
  .os-hero-bg__photo{z-index:2;opacity:.17;background:url("https://onlysounds.com.br/wp-content/uploads/2026/02/foto_rodrigosuricato-scaled.webp") center/cover no-repeat}
  .os-hero-bg__shade{z-index:3;background:rgba(0,0,0,.10)}
  @media (max-width:767px){
    .os-hero-bg__photo{opacity:.22;background-image:url("https://onlysounds.com.br/wp-content/uploads/2026/02/mobile.webp");background-position:center top}
  }
</style>
<script>
(function(){
  var box = document.querySelector(".os-hero-bg__video");
  if (!box || !window.matchMedia("(min-width: 768px)").matches) return; /* no mobile não carrega o vídeo */
  var v = document.createElement("video");
  v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
  v.setAttribute("muted",""); v.setAttribute("playsinline",""); v.preload = "metadata";
  var s = document.createElement("source"); s.src = box.getAttribute("data-src-webm"); s.type = "video/webm";
  v.appendChild(s);
  /* se existir o MP4 na biblioteca, descomente e troque a URL:
  var s2 = document.createElement("source"); s2.src = "URL_DO_hero-bg-720.mp4"; s2.type = "video/mp4"; v.appendChild(s2); */
  box.appendChild(v);
  var pr = v.play(); if (pr && pr.catch) pr.catch(function(){});
})();
</script>
```

Passos:
1. Troque `URL_DO_hero-bg-720-1.webm` pela URL real do arquivo `hero-bg-720-1.webm` da Biblioteca de Mídia.
2. Confirme que as duas imagens existem: `foto_rodrigosuricato-scaled.webp` e `mobile.webp` (pasta `uploads/2026/02`). Se a URL for outra, busque na biblioteca e corrija.
3. Dê a classe **`os-hero`** ao contêiner da hero e remova dele a imagem de fundo antiga (deixe só a cor `#04102E`).
4. Coloque este widget HTML como **primeiro elemento** dentro do contêiner da hero e garanta que logo, título, texto, vídeo e botão fiquem **por cima** dele (z-index 3).
5. Confira no desktop: a fumaça do vídeo se mexendo **e** a foto do Rodrigo aparecendo bem suave por cima dela. No mobile: sem vídeo, só a foto suave sobre o azul-escuro.

## Entrega
Me mande o link de pré-visualização e prints de desktop e mobile mostrando: a hero sem a luz azul, com o vídeo de fundo e a foto do Rodrigo aparecendo juntos, a logo nova, a barra do temporizador funcionando (de preferência dois prints com alguns segundos de diferença) e o botão com o hover.
