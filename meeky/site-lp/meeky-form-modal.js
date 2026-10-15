(function () {
  if (window.__meekyFormModal) return;

  // Formulários do GoHighLevel abertos em popup.
  // "checkout" = dados do comprador antes do pagamento (todos os links para meeky.com.br/checkout).
  //   Ao enviar, a pessoa segue para o checkout da loja já com nome, e-mail e telefone preenchidos.
  // "volume"   = cotação para compra em volume (botões com data-meeky-form="volume").
  var FORMS = {
    checkout: {
      id: 'CpduQRS40KxxCGUNOgLR', name: 'Formulario Checkout', height: 470,
      eyebrow: 'Finalizar compra', title: 'Seus dados para o pedido',
      sub: 'Preencha e siga direto para o pagamento seguro.'
    },
    volume: {
      id: 'SZDqyOMyVrVA9cIMA1Vi', name: 'Formulario de Volume', height: 434,
      eyebrow: 'Compra em volume', title: 'Solicite uma cotação',
      sub: 'Condições especiais para empresas e grandes quantidades. Nossa equipe responde rápido.'
    }
  };
  FORMS['default'] = FORMS.checkout;

  // Checkout da loja (Lovable/Supabase). A chave é a "publishable" (pública por natureza,
  // a mesma que o site da loja já expõe no navegador).
  var STORE = {
    supabaseUrl: 'https://abmbodewtnldwvgqwbno.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFibWJvZGV3dG5sZHd2Z3F3Ym5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5ODQ1NTgsImV4cCI6MjA5MDU2MDU1OH0.AUpUHAVPL0oXOfcUEi04pOhQxkPIlUdHHt6Yh6d9OAI',
    sessionKey: 'meeky_abandoned_cart_token',
    skus: { f5: 'f5anc', motion1: 'motion1' }
  };

  var EMBED_SRC = 'https://link.msgsndr.com/js/form_embed.js';
  var DEBUG = /[?&]ghl-debug/.test(location.search);
  var modals = {}, current = null, lastFocus = null;
  var pending = null; // { href, product, captured: {}, done }

  // Abre a conexão com o GoHighLevel e a loja cedo, para o popup e o checkout carregarem rápido
  ['https://api.leadconnectorhq.com', 'https://link.msgsndr.com', STORE.supabaseUrl].forEach(function (h) {
    var l = document.createElement('link');
    l.rel = 'preconnect'; l.href = h; l.crossOrigin = '';
    document.head.appendChild(l);
  });

  function log() {
    if (!DEBUG) return;
    var args = [].slice.call(arguments);
    console.log.apply(console, ['[meeky-form]'].concat(args));
    var box = document.getElementById('meeky-ghl-debug');
    if (!box) {
      box = document.createElement('pre');
      box.id = 'meeky-ghl-debug';
      box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:100000;max-width:min(560px,95vw);max-height:40vh;overflow:auto;margin:0;padding:10px;background:rgba(0,0,0,.85);color:#9f9;font:11px/1.4 monospace;border-radius:8px;white-space:pre-wrap';
      document.body.appendChild(box);
    }
    box.textContent += args.map(function (a) { return typeof a === 'string' ? a : JSON.stringify(a); }).join(' ').slice(0, 600) + '\n';
    box.scrollTop = box.scrollHeight;
  }

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

    // Aviso "levando você para o pagamento" (só no checkout)
    var going = document.createElement('div');
    going.style.cssText = 'display:none;position:absolute;inset:0;border-radius:18px;background:#111;z-index:3;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#F9F8F6;font-size:16px;text-align:center;padding:24px';
    going.innerHTML = '<div style="width:34px;height:34px;border:3px solid rgba(222,168,94,.25);border-top-color:#DEA85E;border-radius:50%;animation:meeky-spin .8s linear infinite"></div><div>Tudo certo! Levando você para o pagamento…</div>';
    if (!document.getElementById('meeky-spin-kf')) {
      var st = document.createElement('style');
      st.id = 'meeky-spin-kf';
      st.textContent = '@keyframes meeky-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }

    var loads = 0;
    iframe.addEventListener('load', function () {
      loads++;
      log('iframe load #' + loads, key);
      // Se o GHL recarregar o iframe depois do envio, consideramos o formulário enviado
      if (key === 'checkout' && loads > 1 && pending && current === modals.checkout) onSubmitted('iframe-reload');
    });

    card.appendChild(close);
    card.appendChild(eyebrow);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(iframe);
    card.appendChild(going);
    overlay.appendChild(card);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) hide(); });
    document.body.appendChild(overlay);
    ensureEmbedScript();
    modals[key] = { overlay: overlay, card: card, iframe: iframe, going: going };
    return modals[key];
  }

  function show(key) {
    key = FORMS[key] ? key : 'checkout';
    var m = build(key);
    current = m;
    m.going.style.display = 'none';
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
    if (m === modals.checkout && pending && !pending.done) pending = null;
    m.overlay.style.opacity = '0';
    m.card.style.transform = 'translateY(16px) scale(.98)';
    if (window.__meekyLenis) window.__meekyLenis.start();
    else document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { if (current !== m) m.overlay.style.display = 'none'; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) { if (e.key === 'Escape') hide(); }

  // ---------- Dados enviados no formulário do GHL ----------

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Procura nome, e-mail e telefone em qualquer formato de mensagem/objeto do GHL
  function harvest(data, out, depth) {
    if (depth > 6 || data == null) return;
    if (typeof data === 'string') {
      var s = data.trim();
      if ((s[0] === '{' || s[0] === '[') && s.length < 200000) {
        try { harvest(JSON.parse(s), out, depth + 1); } catch (e) {}
      }
      return;
    }
    if (typeof data !== 'object') return;
    Object.keys(data).forEach(function (k) {
      var v = data[k];
      if (typeof v === 'string' || typeof v === 'number') {
        var val = String(v).trim();
        var lk = k.toLowerCase();
        if (!val) return;
        if (val[0] === '{' || val[0] === '[') return harvest(val, out, depth + 1);
        if (/e-?mail/.test(lk) && EMAIL_RE.test(val)) out.email = val;
        else if (/phone|telefone|whats|celular/.test(lk) && val.replace(/\D/g, '').length >= 10) out.phone = val;
        else if (/^(full_?name|name|nome|nome_completo)$/.test(lk)) out.name = val;
        else if (/^first_?name$/.test(lk)) out.first = val;
        else if (/^last_?name$/.test(lk)) out.last = val;
      } else {
        harvest(v, out, depth + 1);
      }
    });
  }

  function harvestStorage(out) {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i), v = localStorage.getItem(k);
        if (v && v.indexOf('@') > -1) harvest(v, out, 0);
      }
    } catch (e) {}
  }

  window.addEventListener('message', function (ev) {
    if (!/leadconnectorhq\.com|msgsndr\.com|leadconnector|gohighlevel/i.test(ev.origin || '')) return;
    log('msg', ev.origin, ev.data);
    if (!pending || pending.done) return;
    harvest(ev.data, pending.captured, 0);
    var txt = '';
    try { txt = typeof ev.data === 'string' ? ev.data : JSON.stringify(ev.data); } catch (e) {}
    if (/submitted|sticky|thank|success|redirect/i.test(txt) || pending.captured.email) onSubmitted('message');
  });

  function onSubmitted(why) {
    if (!pending || pending.done || pending.waiting) return;
    pending.waiting = true;
    log('submit detectado:', why);
    var m = modals.checkout;
    if (m) m.going.style.display = 'flex';
    // dá um instante para o GHL terminar de enviar e gravar o contato
    setTimeout(function () {
      harvestStorage(pending.captured);
      goToCheckout();
    }, 900);
  }

  function goToCheckout() {
    var p = pending;
    if (!p || p.done) return;
    p.done = true;
    var c = p.captured;
    if (!c.name && (c.first || c.last)) c.name = [c.first, c.last].filter(Boolean).join(' ');
    log('dados capturados:', c);
    var go = function (url) { log('indo para', url); if (!DEBUG) location.href = url; else setTimeout(function () { location.href = url; }, 4000); };
    if (!c.email || !EMAIL_RE.test(c.email)) return go(p.href);

    var token = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'lp-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    try { sessionStorage.setItem(STORE.sessionKey, token); } catch (e) {}
    var url = new URL(p.href);
    url.searchParams.set('resume', token);
    var utm = new URLSearchParams(location.search);
    var body = {
      session_token: token,
      email: c.email,
      phone: c.phone || null,
      name: c.name || null,
      product_id: STORE.skus[p.product] || STORE.skus.f5,
      quantity: Math.max(1, parseInt(url.searchParams.get('qty') || '1', 10) || 1),
      utm_source: utm.get('utm_source'),
      utm_medium: utm.get('utm_medium'),
      utm_campaign: utm.get('utm_campaign'),
      landing_referrer: document.referrer || null
    };
    var finished = false;
    var finish = function () { if (finished) return; finished = true; go(url.toString()); };
    // grava os dados na loja para o checkout abrir preenchido; se demorar, segue mesmo assim
    setTimeout(finish, 2500);
    fetch(STORE.supabaseUrl + '/functions/v1/upsert-abandoned-checkout', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: STORE.anonKey, Authorization: 'Bearer ' + STORE.anonKey },
      body: JSON.stringify(body)
    }).then(function (r) { log('loja respondeu', r.status); finish(); }, function (e) { log('erro loja', String(e)); finish(); });
  }

  // ---------- Cliques ----------

  function formKey(el) {
    if (!el) return null;
    if (el.hasAttribute('data-meeky-form')) return el.getAttribute('data-meeky-form') || 'checkout';
    var href = el.getAttribute('href') || '';
    if (/meeky\.com\.br\/checkout/i.test(href)) return 'checkout';
    if (/\/pre-cadastro|#comprar/i.test(href)) return 'checkout';
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
    var key = formKey(el);
    if (!key) return;
    e.preventDefault();
    e.stopPropagation();
    if (key === 'checkout') {
      var href = withTracking(/meeky\.com\.br\/checkout/i.test(el.getAttribute('href') || '') ? el.getAttribute('href') : 'https://meeky.com.br/checkout?produto=f5&qty=1');
      var prod = (new URL(href).searchParams.get('produto') || 'f5').toLowerCase();
      pending = { href: href, product: prod, captured: {}, done: false };
      log('checkout pendente', pending);
    }
    show(key);
  }, true);

  // Pré-carrega os formulários escondidos assim que a página termina de carregar,
  // para o popup abrir já pronto
  function preload() {
    var hasVolume = document.querySelector('[data-meeky-form="volume"]');
    var hasBuy = document.querySelector('a[href*="meeky.com.br/checkout"]');
    if (hasBuy) build('checkout');
    if (hasVolume) build('volume');
    if ((!hasBuy || !hasVolume) && (preload.tries = (preload.tries || 0) + 1) < 20) setTimeout(preload, 500);
  }
  function schedulePreload() {
    var run = function () { (window.requestIdleCallback || function (cb) { setTimeout(cb, 300); })(preload); };
    if (document.readyState === 'complete') run(); else window.addEventListener('load', run);
  }
  if (document.body) schedulePreload(); else document.addEventListener('DOMContentLoaded', schedulePreload);

  window.__meekyFormModal = { open: show, close: hide };
})();
