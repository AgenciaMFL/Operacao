Faça estes 2 ajustes na página **Escola** (`/escola`, em rascunho) do site onlysounds.com.br usando o MCP `only-sounds-elementor`. Não mexa em nenhuma outra página nem em outras partes desta página.

## 1. Trocar o fundo da hero pelos vídeos novos (desktop e mobile)
Os dois vídeos **já estão na Biblioteca de Mídia** do WordPress:
- **`suricato-fundo-desktop.webm`** — 1280x720 (horizontal), para telas a partir de 768px
- **`suricato-fundo-mobile.webm`** — 720x1280 (vertical), para telas até 767px

Busque os dois pelo MCP (pesquisar "suricato-fundo") e pegue a URL pública de cada um. Se não encontrar algum, pare e me avise.

Esses vídeos **já têm a foto do Rodrigo e a fumaça dentro**. Então:
- **Remova** a camada separada da foto do Rodrigo a 17% (`.os-hero-bg__photo`) e qualquer imagem de fundo antiga do contêiner da hero.
- **Remova** o vídeo de fundo antigo (`hero-bg-720-1.webm`) da hero.
- Mantenha só um escurecimento leve (preto 10%) por cima do vídeo, para o texto continuar legível.

Substitua o widget HTML de fundo da hero por este (troque as duas URLs):

```html
<div class="os-hero-bg" aria-hidden="true">
  <video class="os-hero-bg__video" muted loop autoplay playsinline preload="metadata"></video>
  <div class="os-hero-bg__shade"></div>
</div>
<style>
  /* o contêiner da hero precisa da classe os-hero (Avançado > Classes CSS) */
  .os-hero{position:relative;overflow:hidden;background:#04102E}
  .os-hero-bg{position:absolute;inset:0;z-index:0;pointer-events:none}
  .os-hero-bg__video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
  .os-hero-bg__shade{position:absolute;inset:0;background:rgba(0,0,0,.10)}
</style>
<script>
(function(){
  var DESKTOP = "URL_DO_suricato-fundo-desktop.webm";
  var MOBILE  = "URL_DO_suricato-fundo-mobile.webm";
  var v = document.querySelector(".os-hero-bg__video");
  if (!v) return;
  var mq = window.matchMedia("(min-width: 768px)");
  function load(){
    var src = mq.matches ? DESKTOP : MOBILE;
    if (v.getAttribute("data-current") === src) return;
    v.setAttribute("data-current", src);
    v.src = src;
    v.muted = true;
    var p = v.play(); if (p && p.catch) p.catch(function(){});
  }
  load();
  if (mq.addEventListener) mq.addEventListener("change", load); else mq.addListener(load);
})();
</script>
```

Garanta que:
- o contêiner da hero tem a classe **`os-hero`** e fica só com a cor `#04102E` de fundo;
- este widget HTML é o **primeiro elemento** da hero e fica **atrás** de todo o conteúdo (logo, título, texto, vídeo do YouTube e botão ficam por cima, com `position: relative; z-index: 2` no que for preciso);
- o widget HTML em si não ocupa espaço no layout (se o Elementor deixar um espaço vazio, coloque o widget com posição **Absoluta** em Avançado > Posicionamento, ocupando 100% da largura e altura da hero);
- no desktop toca o vídeo horizontal e no celular toca o vertical (cada aparelho baixa só o seu vídeo).

## 2. Voltar a barra do topo (temporizador)
A barra vermelha fixa do topo, com "Oferta começa em / Oferta termina em" e a contagem, **sumiu**. Coloque-a de volta como **primeiro elemento da página** (antes da hero), num widget **HTML**, com este código:

```html
<div class="os-bar" role="region" aria-label="Contagem regressiva da oferta">
  <div class="os-bar__in">
    <span class="os-bar__label" data-os-label>Oferta termina em:</span>
    <span class="os-bar__time" aria-live="off">
      <b data-h>00</b><i>h</i> <b data-m>00</b><i>m</i> <b data-s>00</b><i>s</i>
    </span>
  </div>
</div>
<div class="os-bar-spacer" aria-hidden="true"></div>
<style>
  .os-bar{position:fixed;left:0;right:0;top:0;z-index:9999;background:#ED3838;color:#fff;font-family:"Plus Jakarta Sans",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.25)}
  .admin-bar .os-bar{top:32px}
  @media (max-width:782px){.admin-bar .os-bar{top:46px}}
  .os-bar__in{max-width:1140px;margin:0 auto;padding:0 20px;height:54px;display:flex;align-items:center;justify-content:space-between;gap:16px}
  .os-bar__label{font-weight:700;font-size:20px;white-space:nowrap}
  .os-bar__time{font-weight:800;font-size:23px;font-variant-numeric:tabular-nums;white-space:nowrap}
  .os-bar__time i{font-style:normal;font-weight:700;opacity:.85;margin-left:1px}
  .os-bar-spacer{height:54px}
  .os-bar.is-ended{background:#2A2D35}
  @media (max-width:767px){
    .os-bar__in{height:46px;gap:10px}
    .os-bar__label{font-size:14px}
    .os-bar__time{font-size:17px}
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

- A barra fica **fixa no topo** e acompanha a rolagem, por cima de tudo (inclusive do vídeo de fundo).
- Confira se não sobrou nenhuma barra/temporizador antigo duplicado.
- Se você descobrir que o que sumiu foi **outra coisa** (por exemplo, o cabeçalho/menu de navegação do tema por causa do template Canvas), **não troque o template sozinho**: me avise e espere eu confirmar.

## Entrega
Me mande o link de pré-visualização e prints:
- desktop: hero com o vídeo horizontal tocando e a barra vermelha no topo;
- desktop rolado para baixo: a barra continua no topo;
- mobile (375px): hero com o vídeo vertical e a barra numa linha só.
