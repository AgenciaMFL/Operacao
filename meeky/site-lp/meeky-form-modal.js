(function () {
  if (window.__meekyFormModal) return;

  // Formulários do GoHighLevel abertos em popup.
  // "volume" = cotação para compra em volume (botões com data-meeky-form="volume").
  // "default" = pré-cadastro (links /pre-cadastro, #comprar ou data-meeky-form sem valor).
  var FORMS = {
    'default': {
      id: 'CpduQRS40KxxCGUNOgLR', name: 'Form 0', height: 390,
      eyebrow: 'Pré-cadastro', title: 'Garanta o seu Meeky',
      sub: 'Preencha os dados e nossa equipe entra em contato.'
    },
    volume: {
      id: 'SZDqyOMyVrVA9cIMA1Vi', name: 'Formulario de Volume', height: 434,
      eyebrow: 'Compra em volume', title: 'Solicite uma cotação',
      sub: 'Condições especiais para empresas e grandes quantidades. Nossa equipe responde rápido.'
    }
  };
  var EMBED_SRC = 'https://link.msgsndr.com/js/form_embed.js';
  var modals = {}, current = null, lastFocus = null;

  // Abre a conexão com o GoHighLevel cedo, para o popup carregar rápido
  ['https://api.leadconnectorhq.com', 'https://link.msgsndr.com'].forEach(function (h) {
    var l = document.createElement('link');
    l.rel = 'preconnect'; l.href = h; l.crossOrigin = '';
    document.head.appendChild(l);
  });

  function ensureEmbedScript() {
    if (document.querySelector('script[src*="link.msgsndr.com/js/form_embed.js"]')) return;
    var s = document.createElement('script');
    s.src = EMBED_SRC;
    s.async = true;
    document.head.appendChild(s);
  }

  function build(key) {
    if (modals[key]) return modals[key];
    var f = FORMS[key];
    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', f.title);
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999', 'display:none',
      'align-items:center', 'justify-content:center', 'padding:20px',
      'box-sizing:border-box', 'background:rgba(10,10,10,.62)',
      '-webkit-backdrop-filter:blur(10px)', 'backdrop-filter:blur(10px)',
      'opacity:0', 'transition:opacity .32s cubic-bezier(.16,.84,.44,1)',
      'overflow-y:auto', 'overscroll-behavior:contain'
    ].join(';');

    var card = document.createElement('div');
    card.style.cssText = [
      'position:relative', 'width:100%', 'max-width:470px', 'margin:auto',
      'background:#111111', 'border:1px solid rgba(255,255,255,.10)',
      'border-radius:18px', 'box-shadow:0 40px 90px -40px rgba(0,0,0,.85)',
      'padding:26px 22px 20px', 'box-sizing:border-box',
      'font-family:\'SF Pro Display\',-apple-system,BlinkMacSystemFont,\'Helvetica Neue\',Arial,sans-serif',
      'transform:translateY(16px) scale(.98)',
      'transition:transform .42s cubic-bezier(.16,.84,.44,1)'
    ].join(';');

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Fechar');
    close.innerHTML = '&#10005;';
    close.style.cssText = [
      'position:absolute', 'top:14px', 'right:14px', 'width:34px', 'height:34px',
      'display:flex', 'align-items:center', 'justify-content:center',
      'border-radius:999px', 'border:1px solid rgba(255,255,255,.16)',
      'background:rgba(255,255,255,.06)', 'color:#F9F8F6', 'font-size:13px',
      'line-height:1', 'cursor:pointer', 'padding:0', 'z-index:2',
      'transition:background .25s,border-color .25s'
    ].join(';');
    close.addEventListener('mouseenter', function () { close.style.background = 'rgba(255,255,255,.14)'; });
    close.addEventListener('mouseleave', function () { close.style.background = 'rgba(255,255,255,.06)'; });
    close.addEventListener('click', hide);

    var eyebrow = document.createElement('div');
    eyebrow.textContent = f.eyebrow;
    eyebrow.style.cssText = 'font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#C4863B;margin:0 0 8px';

    var title = document.createElement('h2');
    title.textContent = f.title;
    title.style.cssText = 'margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:-.025em;color:#F9F8F6';

    var sub = document.createElement('p');
    sub.textContent = f.sub;
    sub.style.cssText = 'margin:0 0 14px;font-size:14.5px;line-height:1.5;color:rgba(249,248,246,.62)';

    var iframe = document.createElement('iframe');
    iframe.src = 'https://api.leadconnectorhq.com/widget/form/' + f.id;
    iframe.id = 'popup-' + f.id;
    iframe.title = f.name;
    iframe.setAttribute('data-layout', "{'id':'INLINE'}");
    iframe.setAttribute('data-trigger-type', 'alwaysShow');
    iframe.setAttribute('data-trigger-value', '');
    iframe.setAttribute('data-activation-type', 'alwaysActivated');
    iframe.setAttribute('data-activation-value', '');
    iframe.setAttribute('data-deactivation-type', 'neverDeactivate');
    iframe.setAttribute('data-deactivation-value', '');
    iframe.setAttribute('data-form-name', f.name);
    iframe.setAttribute('data-height', String(f.height));
    iframe.setAttribute('data-layout-iframe-id', 'popup-' + f.id);
    iframe.setAttribute('data-form-id', f.id);
    iframe.setAttribute('data-cookie-consent', 'true');
    iframe.setAttribute('data-cookie-consent-provider', 'auto');
    iframe.style.cssText = 'width:100%;height:' + f.height + 'px;border:none;display:block;border-radius:8px;background:transparent';

    card.appendChild(close);
    card.appendChild(eyebrow);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(iframe);
    overlay.appendChild(card);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) hide(); });
    document.body.appendChild(overlay);
    ensureEmbedScript();
    modals[key] = { overlay: overlay, card: card };
    return modals[key];
  }

  function show(key) {
    key = FORMS[key] ? key : 'default';
    var m = build(key);
    current = m;
    m.overlay.style.display = 'flex';
    lastFocus = document.activeElement;
    if (window.__meekyLenis) window.__meekyLenis.stop();
    else document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      m.overlay.style.opacity = '1';
      m.card.style.transform = 'none';
    });
    document.addEventListener('keydown', onKey);
  }

  function hide() {
    var m = current;
    if (!m) return;
    current = null;
    m.overlay.style.opacity = '0';
    m.card.style.transform = 'translateY(16px) scale(.98)';
    if (window.__meekyLenis) window.__meekyLenis.start();
    else document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { if (current !== m) m.overlay.style.display = 'none'; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) { if (e.key === 'Escape') hide(); }

  function formKey(el) {
    if (!el) return null;
    if (el.hasAttribute('data-meeky-form')) return el.getAttribute('data-meeky-form') || 'default';
    var href = el.getAttribute('href') || '';
    if (/\/pre-cadastro|#comprar/i.test(href)) return 'default';
    return null;
  }

  // Leva UTMs e cupom da página atual para o checkout da loja
  function withTracking(href) {
    try {
      var u = new URL(href, location.href);
      var here = new URLSearchParams(location.search);
      here.forEach(function (v, k) {
        if (/^(utm_|cupom$|coupon$|ref$|gclid$|fbclid$)/i.test(k) && !u.searchParams.has(k)) u.searchParams.set(k, v);
      });
      return u.toString();
    } catch (e) { return href; }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a,button,[data-meeky-form]');
    if (!el) return;
    var key = formKey(el);
    if (key) {
      e.preventDefault();
      e.stopPropagation();
      show(key);
      return;
    }
    var href = el.getAttribute('href') || '';
    if (/meeky\.com\.br\/checkout/i.test(href) && location.search) el.setAttribute('href', withTracking(href));
  }, true);

  // Pré-carrega o formulário de volume escondido assim que a página termina de carregar,
  // para o popup abrir já pronto
  function preload() {
    if (!document.querySelector('[data-meeky-form="volume"]') && !/volume/i.test(location.hash)) {
      // o botão pode ainda não ter sido montado; tenta de novo por alguns segundos
      if ((preload.tries = (preload.tries || 0) + 1) < 20) setTimeout(preload, 500);
      return;
    }
    build('volume');
  }
  function schedulePreload() {
    var run = function () { (window.requestIdleCallback || function (cb) { setTimeout(cb, 300); })(preload); };
    if (document.readyState === 'complete') run(); else window.addEventListener('load', run);
  }
  if (document.body) schedulePreload(); else document.addEventListener('DOMContentLoaded', schedulePreload);

  window.__meekyFormModal = { open: show, close: hide };
})();
