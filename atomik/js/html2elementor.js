// Código → Elementor
// Renderiza o HTML/CSS num iframe oculto, lê os estilos computados de cada nó
// e monta a árvore equivalente em Flexbox Containers + widgets do Elementor.
import { container, heading, text, button, image, html as htmlWidget, sz, toDims, typo } from './elementor.js';

const SKIP = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'TITLE', 'BR']);
const RAW = new Set(['IFRAME', 'VIDEO', 'AUDIO', 'FORM', 'TABLE', 'CANVAS', 'SELECT', 'INPUT', 'TEXTAREA', 'SVG', 'OBJECT', 'EMBED', 'PICTURE', 'DETAILS', 'DL']);
const HEADINGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
const INLINE = new Set(['A', 'SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'SMALL', 'CODE', 'MARK', 'SUP', 'SUB', 'LABEL', 'S', 'ABBR', 'TIME', 'BR', 'Q', 'CITE', 'KBD', 'DEL', 'INS']);
const LISTS = new Set(['UL', 'OL']);

// ---------- helpers de estilo ----------

const px = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

function parseColor(c) {
  if (!c) return null;
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return c;
  const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (a === 0) return null;
  const hex = '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase();
  return a < 1 ? `rgba(${r},${g},${b},${Math.round(a * 100) / 100})` : hex;
}

const firstFont = (f) => (f || '').split(',')[0].replace(/["']/g, '').trim();
const GENERIC_FONTS = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'cursive', '-apple-system', 'ui-sans-serif', 'Times New Roman']);

function typography(cs, base) {
  const size = px(cs.fontSize);
  const t = { size, weight: cs.fontWeight };
  const fam = firstFont(cs.fontFamily);
  if (fam && !GENERIC_FONTS.has(fam)) t.family = fam;
  if (cs.lineHeight !== 'normal') t.lineHeight = Math.round((px(cs.lineHeight) / size) * 100) / 100;
  if (cs.letterSpacing !== 'normal' && px(cs.letterSpacing)) t.letterSpacing = px(cs.letterSpacing);
  if (cs.textTransform && cs.textTransform !== 'none') t.transform = cs.textTransform;
  if (cs.fontStyle === 'italic') t.style = 'italic';
  if (base && base.mobileScale && size > 28) t.sizeMobile = Math.round(size * base.mobileScale);
  return t;
}

function textAlign(cs) {
  const a = cs.textAlign;
  if (a === 'center' || a === 'right' || a === 'justify') return a;
  if (a === 'end') return 'right';
  return undefined;
}

const boxPad = (cs) => [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)];
const hasPad = (p) => p.some((v) => v > 0);

function radius(cs) {
  const r = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(px);
  return r.some((v) => v > 0) ? r : undefined;
}

function border(cs) {
  const w = px(cs.borderTopWidth);
  if (!w || cs.borderTopStyle === 'none') return undefined;
  const c = parseColor(cs.borderTopColor);
  if (!c) return undefined;
  const all = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(px);
  return { width: all, color: c, style: cs.borderTopStyle };
}

function shadow(cs) {
  const s = cs.boxShadow;
  if (!s || s === 'none') return undefined;
  const color = (s.match(/rgba?\([^)]+\)/) || ['rgba(0,0,0,0.15)'])[0];
  const nums = s.replace(color, '').match(/-?[\d.]+px/g) || [];
  const [h = 0, v = 0, blur = 0, spread = 0] = nums.map(px);
  return { horizontal: h, vertical: v, blur, spread, color: parseColor(color) || color };
}

function background(cs, win) {
  const out = {};
  const bg = parseColor(cs.backgroundColor);
  if (bg) out.bg = bg;
  const img = cs.backgroundImage;
  if (img && img !== 'none') {
    const url = img.match(/url\(["']?([^"')]+)["']?\)/);
    const grad = img.match(/linear-gradient\((.+)\)/);
    if (url) out.bgImage = new URL(url[1], win.location.href).href;
    else if (grad) {
      const colors = grad[1].match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/gi) || [];
      const ang = grad[1].match(/(-?[\d.]+)deg/);
      if (colors.length >= 2) out.gradient = [parseColor(colors[0]), parseColor(colors[colors.length - 1]), ang ? Number(ang[1]) : 180];
    }
  }
  return out;
}

const isVisual = (cs, win) => {
  const b = background(cs, win);
  return !!(b.bg || b.bgImage || b.gradient || border(cs) || shadow(cs) || radius(cs));
};

const JUSTIFY = { normal: undefined, start: 'flex-start', 'flex-start': 'flex-start', left: 'flex-start', center: 'center', end: 'flex-end', 'flex-end': 'flex-end', right: 'flex-end', 'space-between': 'space-between', 'space-around': 'space-around', 'space-evenly': 'space-evenly' };
const ALIGN = { normal: undefined, stretch: undefined, start: 'flex-start', 'flex-start': 'flex-start', center: 'center', end: 'flex-end', 'flex-end': 'flex-end', baseline: 'flex-start' };

// ---------- classificação ----------

function isButtonLike(el, cs, win) {
  if (el.tagName === 'BUTTON') return true;
  if (el.tagName !== 'A') return false;
  if (el.querySelector('img, div, section, h1, h2, h3, h4, h5, h6, p')) return false;
  const b = background(cs, win);
  const hasBox = !!(b.bg || b.gradient || border(cs));
  return hasBox || (cs.display.includes('block') || cs.display.includes('flex')) && hasPad(boxPad(cs)) || /\b(btn|button|cta)\b/i.test(el.className || '');
}

function onlyInlineContent(el, win) {
  for (const n of el.childNodes) {
    if (n.nodeType !== 1) continue;
    if (!INLINE.has(n.tagName)) return false;
    const cs = win.getComputedStyle(n);
    if (isButtonLike(n, cs, win) && n.tagName !== 'SPAN') return false;
    if (cs.display.includes('flex') || cs.display === 'block' || cs.display === 'grid') return false;
  }
  return true;
}

function cleanInnerHtml(el) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('*').forEach((n) => {
    n.removeAttribute('class');
    n.removeAttribute('style');
    [...n.attributes].forEach((a) => a.name.startsWith('data-') && n.removeAttribute(a.name));
  });
  return clone.innerHTML.trim().replace(/\s+/g, ' ');
}

const hidden = (cs) => cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0';

// ---------- conversão ----------

class Converter {
  constructor(win, opts) {
    this.win = win;
    this.opts = opts;
    this.stats = { containers: 0, widgets: 0, raw: 0 };
    this.warnings = [];
  }

  cs(el) {
    return this.win.getComputedStyle(el);
  }

  // Posição horizontal do filho dentro da caixa de conteúdo do pai.
  hAlign(el, parent) {
    if (!parent) return undefined;
    const pd = this.cs(parent);
    if ((pd.display.includes('flex') && pd.flexDirection.startsWith('row')) || pd.display.includes('grid')) return undefined;
    const r = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    const pcs = this.cs(parent);
    const left = r.left - (pr.left + px(pcs.paddingLeft) + px(pcs.borderLeftWidth));
    const right = pr.right - px(pcs.paddingRight) - px(pcs.borderRightWidth) - r.right;
    if (Math.abs(left - right) < 2 && left > 2) return 'center';
    if (right < 2 && left > 2) return 'right';
    return undefined;
  }

  widgetFor(el, cs, parent) {
    const tag = el.tagName;
    const common = {};
    this.stats.widgets++;

    if (HEADINGS.has(tag)) {
      return heading(cleanInnerHtml(el), { tag: tag.toLowerCase(), align: textAlign(cs), color: parseColor(cs.color), font: typography(cs, this.opts), ...common });
    }
    if (tag === 'IMG') {
      const r = el.getBoundingClientRect();
      const pr = parent ? parent.getBoundingClientRect() : r;
      const full = r.width >= pr.width - 2 * px(this.cs(parent || el).paddingLeft) - 2;
      return image(el.src, {
        alt: el.alt,
        width: full ? 100 : Math.round(r.width),
        widthUnit: full ? '%' : 'px',
        height: cs.objectFit === 'cover' ? Math.round(r.height) : undefined,
        radius: radius(cs),
        align: this.hAlign(el, parent),
      });
    }
    if (isButtonLike(el, cs, this.win)) {
      const b = background(cs, this.win);
      return button(el.textContent.trim().replace(/\s+/g, ' '), {
        url: el.getAttribute('href') || '#',
        external: el.target === '_blank',
        bg: b.bg || (b.gradient && b.gradient[0]),
        color: parseColor(cs.color),
        radius: radius(cs),
        pad: boxPad(cs),
        border: border(cs),
        font: typography(cs),
        align: this.hAlign(el, parent),
      });
    }
    if (RAW.has(tag) || tag === 'svg') {
      this.stats.raw++;
      return htmlWidget(el.outerHTML);
    }
    // bloco de texto
    let inner;
    if (LISTS.has(tag)) inner = `<${tag.toLowerCase()}>${cleanInnerHtml(el)}</${tag.toLowerCase()}>`;
    else if (tag === 'BLOCKQUOTE') inner = `<blockquote>${cleanInnerHtml(el)}</blockquote>`;
    else inner = `<p>${cleanInnerHtml(el)}</p>`;
    return text(inner, { align: textAlign(cs), color: parseColor(cs.color), font: typography(cs) });
  }

  // Remove wrappers "invisíveis" com um único filho, somando o padding.
  flatten(el) {
    let node = el;
    let pad = [0, 0, 0, 0];
    let boxed;
    for (;;) {
      const kids = [...node.children].filter((k) => !SKIP.has(k.tagName) && !hidden(this.cs(k)));
      if (kids.length !== 1) break;
      const only = kids[0];
      const cs = this.cs(only);
      if (HEADINGS.has(only.tagName) || RAW.has(only.tagName) || INLINE.has(only.tagName) || only.tagName === 'IMG' || LISTS.has(only.tagName) || only.tagName === 'P') break;
      if (isVisual(cs, this.win)) break;
      if ([...node.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) break;
      if (cs.maxWidth !== 'none' && px(cs.maxWidth) > 0) boxed = px(cs.maxWidth);
      const p = boxPad(cs);
      pad = pad.map((v, i) => v + p[i]);
      node = only;
    }
    return { node, pad, boxed };
  }

  containerFor(el, cs, parent, top) {
    const { node, pad: extraPad, boxed: flatBoxed } = this.flatten(el);
    const ncs = node === el ? cs : this.cs(node);
    const layoutCs = ncs;
    const display = layoutCs.display;
    const isFlex = display.includes('flex');
    const isGrid = display.includes('grid');
    const row = (isFlex && layoutCs.flexDirection.startsWith('row')) || isGrid;

    const opts = { ...background(cs, this.win) };
    // padding dos wrappers achatados (flatten) já vem somado em extraPad
    opts.pad = boxPad(cs).map((v, i) => v + extraPad[i]);
    opts.radius = radius(cs);
    opts.border = border(cs);
    opts.shadow = shadow(cs);
    opts.dir = row ? 'row' : 'column';
    opts.stackMobile = this.opts.stackMobile;
    if (row && (layoutCs.flexWrap === 'wrap' || isGrid)) opts.wrap = true;
    if (isFlex || isGrid) {
      opts.justify = JUSTIFY[layoutCs.justifyContent];
      opts.align = ALIGN[layoutCs.alignItems];
    }
    const minH = px(cs.minHeight);
    if (minH > 0) opts.minHeight = cs.minHeight.endsWith('vh') ? sz(px(cs.minHeight), 'vh') : minH;
    if (el.id) opts.cssId = el.id;

    if (top) {
      const maxW = flatBoxed || (cs.maxWidth !== 'none' ? px(cs.maxWidth) : 0);
      opts.boxed = maxW || this.opts.boxedWidth;
      if (!maxW && !opts.bg && !opts.bgImage && !opts.gradient) opts.boxed = this.opts.boxedWidth;
      if (maxW && maxW < 9000) {
        // o padding lateral externo vira "respiro"; mantemos o mínimo de 20px
        opts.pad[1] = Math.max(Math.min(opts.pad[1], 40), 0);
        opts.pad[3] = Math.max(Math.min(opts.pad[3], 40), 0);
      }
    } else {
      opts.inner = true;
      const maxW = flatBoxed || (cs.maxWidth !== 'none' ? px(cs.maxWidth) : 0);
      if (maxW) opts.widthPx = Math.min(maxW, Math.round(el.getBoundingClientRect().width));
    }

    // filhos
    const kids = [];
    for (const n of node.childNodes) {
      if (n.nodeType === 3) {
        const t = n.textContent.trim();
        if (t) {
          this.stats.widgets++;
          kids.push({ dom: null, rect: null, el: text(`<p>${t}</p>`, { color: parseColor(ncs.color), font: typography(ncs), align: textAlign(ncs) }) });
        }
        continue;
      }
      if (n.nodeType !== 1 || SKIP.has(n.tagName)) continue;
      const kcs = this.cs(n);
      if (hidden(kcs) || kcs.position === 'absolute' || kcs.position === 'fixed') {
        if (kcs.position === 'absolute' || kcs.position === 'fixed') this.warnings.push(`Elemento <${n.tagName.toLowerCase()}> com position:${kcs.position} foi ignorado.`);
        continue;
      }
      const conv = this.convert(n, node, false);
      if (conv) kids.push({ dom: n, rect: n.getBoundingClientRect(), el: conv });
    }

    // espaçamento
    if (isFlex || isGrid) {
      const rg = px(layoutCs.rowGap);
      const cg = px(layoutCs.columnGap);
      opts.gap = [rg, cg];
    } else {
      // layout em bloco: deduz o gap pelas distâncias verticais entre irmãos
      const spaces = [];
      for (let i = 1; i < kids.length; i++) {
        if (kids[i].rect && kids[i - 1].rect) spaces.push(Math.max(0, Math.round(kids[i].rect.top - kids[i - 1].rect.bottom)));
      }
      const gap = spaces.length ? Math.min(...spaces) : 0;
      opts.gap = [gap, gap];
      spaces.forEach((s, i) => {
        const extra = s - gap;
        if (extra > 1) {
          const k = kids[i + 1].el;
          if (k.elType === 'widget') k.settings._margin = toDims([extra, 0, 0, 0]);
          else k.settings.margin = toDims([extra, 0, 0, 0]);
        }
      });
    }

    // larguras dos filhos em linha (%) calculadas pela caixa renderizada
    if (row) {
      const nr = node.getBoundingClientRect();
      const content = nr.width - px(ncs.paddingLeft) - px(ncs.paddingRight) - px(ncs.borderLeftWidth) - px(ncs.borderRightWidth);
      kids.forEach((k) => {
        if (!k.rect || k.el.elType !== 'container') return;
        const pct = Math.floor((k.rect.width / content) * 1000) / 10;
        k.el.settings.width = sz(pct, '%');
        k.el.settings.width_mobile = sz(100, '%');
        delete k.el.settings._flex_size;
      });
    } else if (!top) {
      // filhos de coluna centralizados com largura fixa
      kids.forEach((k) => {
        if (k.el.elType === 'container' && k.el.settings.width?.unit === 'px' && k.dom && this.hAlign(k.dom, node) === 'center') {
          k.el.settings._flex_align_self = 'center';
        }
      });
    }

    this.stats.containers++;
    const c = container(opts, kids.map((k) => k.el));
    if (el.tagName !== 'DIV') c.settings.html_tag = ['SECTION', 'HEADER', 'FOOTER', 'NAV', 'MAIN', 'ARTICLE', 'ASIDE'].includes(el.tagName) ? el.tagName.toLowerCase() : undefined;
    if (!c.settings.html_tag) delete c.settings.html_tag;
    return c;
  }

  convert(el, parent, top) {
    const cs = this.cs(el);
    if (hidden(cs) || SKIP.has(el.tagName)) return null;
    const tag = el.tagName;

    if (HEADINGS.has(tag) || tag === 'IMG' || RAW.has(tag) || tag === 'svg' || LISTS.has(tag) || tag === 'P' || tag === 'BLOCKQUOTE') {
      return top ? container({ boxed: this.opts.boxedWidth, pad: 20 }, [this.widgetFor(el, cs, parent)]) : this.widgetFor(el, cs, parent);
    }
    if (isButtonLike(el, cs, this.win)) return this.widgetFor(el, cs, parent);

    const hasText = el.textContent.trim().length > 0;
    const hasElementKids = el.children.length > 0;
    if (!hasElementKids && !hasText) {
      // caixa vazia decorativa → container vazio (mantém fundo/tamanho) ou descartada
      if (!isVisual(cs, this.win)) return null;
      const r = el.getBoundingClientRect();
      this.stats.containers++;
      return container({ inner: !top, ...background(cs, this.win), radius: radius(cs), widthPx: Math.round(r.width), minHeight: Math.round(r.height), border: border(cs) });
    }
    if (!top && onlyInlineContent(el, this.win) && !isVisual(cs, this.win) && !hasPad(boxPad(cs))) {
      return this.widgetFor(el, cs, parent);
    }
    return this.containerFor(el, cs, parent, top);
  }
}

function buildDoc(source, css) {
  const clean = source.replace(/<script[\s\S]*?<\/script>/gi, '');
  const isFull = /<html[\s>]|<body[\s>]/i.test(clean);
  const style = css ? `<style>${css}</style>` : '';
  if (isFull) return /<\/head>/i.test(clean) ? clean.replace(/<\/head>/i, `${style}</head>`) : style + clean;
  return `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>${clean}</body></html>`;
}

/** Converte HTML (+ CSS opcional) em elementos do Elementor. */
export function convertHtml(source, css = '', options = {}) {
  const opts = { boxedWidth: 1200, stackMobile: true, viewport: 1440, mobileScale: 0.7, ...options };
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.style.cssText = `position:fixed;left:-99999px;top:0;width:${opts.viewport}px;height:900px;border:0;visibility:hidden;`;
    frame.setAttribute('sandbox', 'allow-same-origin');
    document.body.appendChild(frame);
    const done = () => {
      try {
        const win = frame.contentWindow;
        const body = win.document.body;
        if (!body) throw new Error('HTML vazio.');
        const conv = new Converter(win, opts);
        // desembrulha wrappers de página sem estilo (ex.: <main>, <div id="app">)
        let rootEl = body;
        for (;;) {
          const kids = [...rootEl.children].filter((k) => !SKIP.has(k.tagName));
          if (kids.length === 1 && !isVisual(win.getComputedStyle(kids[0]), win) && !HEADINGS.has(kids[0].tagName) && kids[0].children.length > 1 && win.getComputedStyle(kids[0]).display === 'block' && [...kids[0].children].some((c) => /^(SECTION|HEADER|FOOTER|NAV|DIV)$/.test(c.tagName))) rootEl = kids[0];
          else break;
        }
        const elements = [];
        const looseText = [...rootEl.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
        looseText.forEach((n) => elements.push(container({ boxed: opts.boxedWidth, pad: 20 }, [text(`<p>${n.textContent.trim()}</p>`)])));
        for (const el of rootEl.children) {
          const out = conv.convert(el, rootEl, true);
          if (out) elements.push(out.elType === 'widget' ? container({ boxed: opts.boxedWidth, pad: 20 }, [out]) : out);
        }
        resolve({ elements, stats: { ...conv.stats, sections: elements.length }, warnings: [...new Set(conv.warnings)] });
      } catch (e) {
        reject(e);
      } finally {
        frame.remove();
      }
    };
    frame.onload = () => {
      // aguarda fontes/imagens para medir corretamente
      const win = frame.contentWindow;
      const imgs = [...win.document.images].filter((i) => !i.complete);
      const fonts = win.document.fonts ? win.document.fonts.ready : Promise.resolve();
      Promise.race([Promise.all([fonts, ...imgs.map((i) => new Promise((r) => (i.onload = i.onerror = r)))]), new Promise((r) => setTimeout(r, 2500))]).then(done);
    };
    frame.srcdoc = buildDoc(source, css);
  });
}

/** Formato de template importável em Elementor → Modelos → Importar. */
export function toTemplateFile(elements, title = 'Atomik - Código convertido') {
  return JSON.stringify({ version: '0.4', title, type: 'container', content: elements, page_settings: [] }, null, 2);
}

export { typo };
