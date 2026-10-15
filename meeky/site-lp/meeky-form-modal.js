(function () {
  if (window.__meekyFormModal) return;

  var FORM_ID = 'CpduQRS40KxxCGUNOgLR';
  var FORM_SRC = 'https://api.leadconnectorhq.com/widget/form/' + FORM_ID;
  var overlay = null, card = null, iframe = null, lastFocus = null;

  function ensureEmbedScript() {
    if (document.querySelector('script[src*="link.msgsndr.com/js/form_embed.js"]')) return;
    var s = document.createElement('script');
    s.src = 'https://link.msgsndr.com/js/form_embed.js';
    s.async = true;
    document.head.appendChild(s);
  }

  function build() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Formulário Meeky');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999', 'display:flex',
      'align-items:center', 'justify-content:center', 'padding:20px',
      'box-sizing:border-box', 'background:rgba(10,10,10,.62)',
      '-webkit-backdrop-filter:blur(10px)', 'backdrop-filter:blur(10px)',
      'opacity:0', 'transition:opacity .32s cubic-bezier(.16,.84,.44,1)',
      'overflow-y:auto', 'overscroll-behavior:contain'
    ].join(';');

    card = document.createElement('div');
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
    eyebrow.textContent = 'Pré-cadastro';
    eyebrow.style.cssText = 'font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#C4863B;margin:0 0 8px';

    var title = document.createElement('h2');
    title.textContent = 'Garanta o seu Meeky';
    title.style.cssText = 'margin:0 0 4px;font-size:22px;font-weight:700;letter-spacing:-.025em;color:#F9F8F6';

    var sub = document.createElement('p');
    sub.textContent = 'Preencha os dados e nossa equipe entra em contato.';
    sub.style.cssText = 'margin:0 0 14px;font-size:14.5px;line-height:1.5;color:rgba(249,248,246,.62)';

    iframe = document.createElement('iframe');
    iframe.src = FORM_SRC;
    iframe.id = 'popup-' + FORM_ID;
    iframe.title = 'Formulário Meeky';
    iframe.setAttribute('data-layout', "{'id':'INLINE'}");
    iframe.setAttribute('data-trigger-type', 'alwaysShow');
    iframe.setAttribute('data-activation-type', 'alwaysActivated');
    iframe.setAttribute('data-deactivation-type', 'neverDeactivate');
    iframe.setAttribute('data-form-name', 'Form 0');
    iframe.setAttribute('data-layout-iframe-id', 'popup-' + FORM_ID);
    iframe.setAttribute('data-form-id', FORM_ID);
    iframe.setAttribute('data-height-mode', 'auto');
    iframe.style.cssText = 'width:100%;height:auto;min-height:390px;border:none;display:block;border-radius:10px;background:transparent';

    card.appendChild(close);
    card.appendChild(eyebrow);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(iframe);
    overlay.appendChild(card);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) hide(); });
    document.body.appendChild(overlay);
    ensureEmbedScript();
  }

  function show() {
    build();
    overlay.style.display = 'flex';
    lastFocus = document.activeElement;
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () {
      overlay.style.opacity = '1';
      card.style.transform = 'none';
    }, 20);
    document.addEventListener('keydown', onKey);
  }

  function hide() {
    if (!overlay) return;
    overlay.style.opacity = '0';
    card.style.transform = 'translateY(16px) scale(.98)';
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { if (overlay) overlay.style.display = 'none'; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) { if (e.key === 'Escape') hide(); }

  function isCta(el) {
    if (!el) return false;
    if (el.hasAttribute('data-meeky-form')) return true;
    var href = el.getAttribute('href') || '';
    if (/meeky\.com\.br\/checkout|\/pre-cadastro|#comprar/i.test(href)) return true;
    var style = el.getAttribute('style') || '';
    if (/Contato\.dc\.html/i.test(href) && /border-radius:\s*999px/i.test(style)) return true;
    return false;
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a,button,[data-meeky-form]');
    if (!isCta(el)) return;
    e.preventDefault();
    e.stopPropagation();
    show();
  }, true);

  window.__meekyFormModal = { open: show, close: hide };
})();
