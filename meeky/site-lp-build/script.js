class Component extends DCLogic {
  state = { isMobile: false, w: 1440 };
  renderVals() {
    const m = this.state.isMobile, w = this.state.w;
    // conteúdo do Figma tem 1322px; em telas menores tudo é reduzido na mesma proporção
    const k = Math.min(1, (w - 48) / 1322);
    const cw = Math.max(280, w - 40);
    return {
      isMobile: m, isDesktop: !m,
      k: k.toFixed(4),
      mqZoom: k.toFixed(4),
      heroH: Math.round(829 * k) + 'px',
      heroBg: Math.round(2560 * k) + 'px ' + Math.round(829 * k) + 'px',
      topPad: m ? '74px' : '94px',
      kmCard: (cw / 519).toFixed(4),
      kmGrid: (cw / 646).toFixed(4),
      // valores extras de cada página (alturas das seções etc.)
      ...(window.__pageVals ? window.__pageVals(k, m, w) : {})
    };
  }
  componentDidMount() { this.setupViewport(); this.setupReveal(); this.setupCursor(); this.kickVideos(); this.setupSmoothScroll(); this.scrollToHash(); }
  scrollToHash() {
    // menu links like Home.html#volume: wait for the section to render, then scroll to it
    const id = (location.hash || '').slice(1);
    if (!id) return;
    // a Home nova não tem mais a seção de compra em volume: links antigos (Home.html#volume) abrem o formulário
    if (id === 'volume') {
      const open = () => window.__meekyFormModal ? window.__meekyFormModal.open('volume') : setTimeout(open, 200);
      setTimeout(open, 400);
      return;
    }
    let tries = 0;
    const go = () => {
      const el = document.getElementById(id);
      if (!el) { if (++tries < 40) setTimeout(go, 100); return; }
      const y = el.getBoundingClientRect().top + window.pageYOffset - (this.state.isMobile ? 74 : 94);
      if (window.__meekyLenis) window.__meekyLenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    };
    // repete depois que imagens/rolagem suave carregam, para não parar atrás do menu
    setTimeout(go, 150);
    setTimeout(() => { tries = 0; go(); }, 1200);
  }
  setupViewport() {
    const check = () => {
      const w = document.documentElement.clientWidth || window.innerWidth || 0;
      if (!w) return;
      const m = w <= 860;
      if (m !== this.state.isMobile || w !== this.state.w) this.setState({ isMobile: m, w });
    };
    this._onMq = check;
    window.addEventListener('resize', check);
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(check);
      this._ro.observe(document.documentElement);
    }
    requestAnimationFrame(check);
    setTimeout(check, 300);
    check();
  }
  setupSmoothScroll() {
    if (window.__meekyLenis) return;
    const start = () => {
      if (!window.Lenis) return;
      const opts = { duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, touchMultiplier: 1.6 };
      // probe which element actually accepts a scroll write
      const canScroll = el => {
        if (!el || el.scrollHeight <= el.clientHeight + 4) return false;
        const prev = el.scrollTop;
        el.scrollTop = prev + 2;
        const moved = el.scrollTop !== prev;
        el.scrollTop = prev;
        return moved;
      };
      const root = document.scrollingElement || document.documentElement;
      if (!canScroll(root)) {
        let found = null, node = document.body;
        const walk = el => {
          if (found || !el) return;
          if (el !== root && canScroll(el)) { found = el; return; }
          for (const c of el.children) walk(c);
        };
        walk(document.body);
        if (!found) return;
        opts.wrapper = found;
        opts.content = found.firstElementChild || found;
      }
      const lenis = new window.Lenis(opts);
      window.__meekyLenis = lenis;
      let lastFrame = 0;
      const raf = t => { lastFrame = t; lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      // backup ticker for contexts where requestAnimationFrame is throttled
      setInterval(() => { const n = performance.now(); if (n - lastFrame > 100) lenis.raf(n); }, 16);
      document.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        // se alguma imagem acima carregar durante a rolagem, a seção muda de lugar: corrige no final
        const off = this.state.isMobile ? 74 : 94;
        const fix = (n) => { const t = el.getBoundingClientRect().top; if (n > 0 && Math.abs(t - off) > 12) lenis.scrollTo(el, { offset: -off, onComplete: () => fix(n - 1) }); };
        lenis.scrollTo(el, { offset: -off, onComplete: () => fix(3) });
      });
    };
    if (window.Lenis) return start();
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lenis@1.1.20/dist/lenis.min.js';
    s.onload = start;
    document.head.appendChild(s);
  }
  componentDidUpdate() { this.setupReveal(); }
  setupCursor() {
    if (document.getElementById('om-cursor-ring')) return;
    // só em computador com mouse: no celular (toque) o círculo ficava preso na tela
    if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
    const ring = document.createElement('div');
    ring.id = 'om-cursor-ring';
    ring.style.cssText = 'position:fixed;top:0;left:0;width:34px;height:34px;margin:-17px 0 0 -17px;border:1.5px solid rgba(158,105,193,.85);border-radius:50%;pointer-events:none;z-index:9998;transform:translate3d(-200px,-200px,0);transition:width .25s ease,height .25s ease,margin .25s ease,background-color .25s ease,border-color .25s ease';
    const dot = document.createElement('div');
    dot.id = 'om-cursor-dot';
    dot.style.cssText = 'position:fixed;top:0;left:0;width:6px;height:6px;margin:-3px 0 0 -3px;background:#9E69C1;border-radius:50%;pointer-events:none;z-index:9999;transform:translate3d(-200px,-200px,0)';
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    let mx = -200, my = -200, rx = -200, ry = -200;
    this._cursorMove = e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
      const t = e.target && e.target.closest ? e.target.closest('a,button,summary,input,textarea') : null;
      const big = !!t;
      ring.style.width = big ? '58px' : '34px';
      ring.style.height = big ? '58px' : '34px';
      ring.style.margin = big ? '-29px 0 0 -29px' : '-17px 0 0 -17px';
      ring.style.backgroundColor = big ? 'rgba(158,105,193,.14)' : 'transparent';
      ring.style.borderColor = big ? 'rgba(158,105,193,1)' : 'rgba(158,105,193,.85)';
    };
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      this._raf = requestAnimationFrame(loop);
    };
    document.addEventListener('mousemove', this._cursorMove);
    loop();
  }
  kickVideos() {
    const go = () => document.querySelectorAll('video').forEach(v => {
      v.muted = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
    go(); setTimeout(go, 600); setTimeout(go, 2000);
  }
  setupReveal() {
    const nodes = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]:not([data-reveal-ready])'));
    nodes.forEach(el => {
      el.setAttribute('data-reveal-ready', '');
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      const d = parseFloat(el.getAttribute('data-reveal')) || 0;
      el.style.transition = 'opacity 1s cubic-bezier(.16,.84,.44,1) ' + d + 's, transform 1s cubic-bezier(.16,.84,.44,1) ' + d + 's';
    });
    if (!this._onScroll) {
      this._onScroll = () => this.tickReveal();
      window.addEventListener('scroll', this._onScroll, true);
      window.addEventListener('resize', this._onScroll);
      this._poll = setInterval(this._onScroll, 400);
    }
    this.tickReveal();
  }
  tickReveal() {
    const h = window.innerHeight || document.documentElement.clientHeight || 0;
    const list = document.querySelectorAll('[data-reveal-ready]:not([data-reveal-done])');
    if (!list.length) { clearInterval(this._poll); this._poll = null; return; }
    list.forEach(el => {
      const r = el.getBoundingClientRect();
      if (!h || (r.top < h * 0.88 && r.bottom > 0)) {
        el.setAttribute('data-reveal-done', '');
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }
  componentWillUnmount() {
    if (this._onMq) window.removeEventListener('resize', this._onMq);
    if (this._ro) this._ro.disconnect();
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._cursorMove) document.removeEventListener('mousemove', this._cursorMove);
    ['om-cursor-ring','om-cursor-dot'].forEach(id => { const n = document.getElementById(id); if (n) n.remove(); });
    clearInterval(this._poll);
    if (this._onScroll) {
      window.removeEventListener('scroll', this._onScroll, true);
      window.removeEventListener('resize', this._onScroll);
    }
  }
}
