// Construtores de JSON do Elementor (Flexbox Container) + ponte com o editor aberto na aba.

export const uid = () => Math.random().toString(16).slice(2, 9).padEnd(7, '0');

export const sz = (size, unit = 'px') => ({ unit, size: Number(size), sizes: [] });

export function dims(t = 0, r = t, b = t, l = r, unit = 'px') {
  const s = (v) => String(Math.round(Number(v) * 100) / 100);
  return { unit, top: s(t), right: s(r), bottom: s(b), left: s(l), isLinked: t === r && r === b && b === l };
}

// Aceita número, [v], [v,h], [t,r,b,l]
export function toDims(v, unit = 'px') {
  if (v == null) return undefined;
  if (typeof v === 'number') return dims(v, v, v, v, unit);
  if (v.length === 1) return dims(v[0], v[0], v[0], v[0], unit);
  if (v.length === 2) return dims(v[0], v[1], v[0], v[1], unit);
  return dims(v[0], v[1], v[2], v[3], unit);
}

export function typo(t = {}) {
  const o = {};
  if (!t || !Object.keys(t).length) return o;
  o.typography_typography = 'custom';
  if (t.family) o.typography_font_family = t.family;
  if (t.size) o.typography_font_size = sz(t.size);
  if (t.sizeMobile) o.typography_font_size_mobile = sz(t.sizeMobile);
  if (t.weight) o.typography_font_weight = String(t.weight);
  if (t.lineHeight) o.typography_line_height = typeof t.lineHeight === 'object' ? t.lineHeight : sz(t.lineHeight, 'em');
  if (t.letterSpacing != null && t.letterSpacing !== 0) o.typography_letter_spacing = sz(t.letterSpacing);
  if (t.transform) o.typography_text_transform = t.transform;
  if (t.style) o.typography_font_style = t.style;
  if (t.decoration) o.typography_text_decoration = t.decoration;
  return o;
}

const clean = (o) => {
  Object.keys(o).forEach((k) => (o[k] === undefined || o[k] === null || o[k] === '') && delete o[k]);
  return o;
};

function commonAdvanced(s, o) {
  if (o.margin != null) s._margin = toDims(o.margin);
  if (o.padding != null && o._widgetPadding) s._padding = toDims(o.padding);
  if (o.widthPx) {
    s._element_width = 'initial';
    s._element_custom_width = sz(o.widthPx);
  }
  if (o.grow) s._flex_size = 'grow';
  if (o.animation) {
    s._animation = o.animation;
    if (o.animationDelay) s._animation_delay = o.animationDelay;
  }
  if (o.cssId) s._element_id = o.cssId;
  if (o.cssClass) s._css_classes = o.cssClass;
  return s;
}

/**
 * Container Flexbox.
 * opts: dir ('row'|'column'), gap, pad, bg, bgImage, gradient:[c1,c2,angle], radius, border:{width,color},
 *       shadow, width (em %), widthPx, minHeight, justify, align, wrap, boxed (px), inner, animation, stackMobile
 */
export function container(opts = {}, children = []) {
  const o = opts;
  const s = {
    content_width: o.boxed ? 'boxed' : 'full',
    flex_direction: o.dir || 'column',
  };
  if (o.boxed) s.boxed_width = sz(o.boxed);
  if (o.dir === 'row' && o.stackMobile !== false) s.flex_direction_mobile = 'column';
  if (o.gap != null) {
    const g = Array.isArray(o.gap) ? o.gap : [o.gap, o.gap];
    s.flex_gap = { column: String(g[1]), row: String(g[0]), isLinked: g[0] === g[1], unit: 'px', size: Number(g[0]) };
  }
  if (o.justify) s.flex_justify_content = o.justify;
  if (o.align) s.flex_align_items = o.align;
  if (o.wrap) s.flex_wrap = 'wrap';
  if (o.pad != null) s.padding = toDims(o.pad);
  if (o.padMobile != null) s.padding_mobile = toDims(o.padMobile);
  if (o.margin != null) s.margin = toDims(o.margin);
  if (o.bg || o.bgImage) {
    s.background_background = 'classic';
    if (o.bg) s.background_color = o.bg;
    if (o.bgImage) {
      s.background_image = { url: o.bgImage, id: '', size: '', source: 'library' };
      s.background_position = 'center center';
      s.background_size = 'cover';
      s.background_repeat = 'no-repeat';
    }
  }
  if (o.gradient) {
    s.background_background = 'gradient';
    s.background_color = o.gradient[0];
    s.background_color_b = o.gradient[1];
    s.background_gradient_angle = sz(o.gradient[2] ?? 135, 'deg');
  }
  if (o.overlay) {
    s.background_overlay_background = 'classic';
    s.background_overlay_color = o.overlay;
  }
  if (o.radius != null) s.border_radius = toDims(o.radius);
  if (o.border) {
    s.border_border = o.border.style || 'solid';
    s.border_width = toDims(o.border.width ?? 1);
    s.border_color = o.border.color;
  }
  if (o.shadow) {
    s.box_shadow_box_shadow_type = 'yes';
    s.box_shadow_box_shadow = typeof o.shadow === 'object' ? o.shadow : { horizontal: 0, vertical: 10, blur: 30, spread: 0, color: 'rgba(0,0,0,0.12)' };
  }
  if (o.width != null) {
    s.width = sz(o.width, '%');
    s.width_mobile = sz(100, '%');
  }
  if (o.widthPx != null) {
    s.width = sz(o.widthPx, 'px');
    s.width_mobile = sz(100, '%');
  }
  if (o.minHeight != null) s.min_height = typeof o.minHeight === 'object' ? o.minHeight : sz(o.minHeight);
  if (o.grow) s._flex_size = 'grow';
  if (o.animation) {
    s.animation = o.animation;
    if (o.animationDelay) s.animation_delay = o.animationDelay;
  }
  if (o.cssId) s._element_id = o.cssId;
  if (o.cssClass) s.css_classes = o.cssClass;
  if (o.name) s._title = o.name;
  return { id: uid(), elType: 'container', isInner: !!o.inner, settings: s, elements: children.filter(Boolean) };
}

function widget(type, settings, o = {}) {
  return { id: uid(), elType: 'widget', widgetType: type, isInner: false, settings: clean(commonAdvanced(settings, o)), elements: [] };
}

export function heading(title, o = {}) {
  return widget('heading', { title, header_size: o.tag || 'h2', align: o.align, title_color: o.color, ...typo(o.font) }, o);
}

export function text(html, o = {}) {
  const content = /^\s*</.test(html) ? html : `<p>${html}</p>`;
  return widget('text-editor', { editor: content, align: o.align, text_color: o.color, ...typo(o.font) }, o);
}

export function button(label, o = {}) {
  const s = {
    text: label,
    link: { url: o.url || '#', is_external: o.external ? 'on' : '', nofollow: '', custom_attributes: '' },
    align: o.align,
    size: o.size || 'md',
    button_text_color: o.color,
    background_background: o.bg ? 'classic' : undefined,
    background_color: o.bg,
    hover_color: o.hoverColor,
    button_background_hover_color: o.hoverBg,
    border_radius: o.radius != null ? toDims(o.radius) : undefined,
    text_padding: o.pad != null ? toDims(o.pad) : undefined,
    ...typo(o.font),
  };
  if (o.border) {
    s.border_border = 'solid';
    s.border_width = toDims(o.border.width ?? 1);
    s.border_color = o.border.color;
  }
  if (o.icon) {
    s.selected_icon = { value: o.icon, library: 'fa-solid' };
    s.icon_align = o.iconAlign || 'right';
    s.icon_indent = sz(8);
  }
  return widget('button', s, o);
}

export function image(url, o = {}) {
  return widget(
    'image',
    {
      image: { url, id: '', size: '', alt: o.alt || '', source: 'library' },
      image_size: 'full',
      align: o.align,
      width: o.width != null ? sz(o.width, o.widthUnit || '%') : undefined,
      height: o.height != null ? sz(o.height) : undefined,
      object_fit: o.height != null ? 'cover' : undefined,
      image_border_radius: o.radius != null ? toDims(o.radius) : undefined,
      link_to: o.url ? 'custom' : undefined,
      link: o.url ? { url: o.url, is_external: '', nofollow: '' } : undefined,
    },
    o,
  );
}

export function html(code, o = {}) {
  return widget('html', { html: code }, o);
}

// ---------- Utilitários de árvore ----------

export function regenIds(el) {
  const copy = JSON.parse(JSON.stringify(el));
  (function walk(n) {
    n.id = uid();
    (n.elements || []).forEach(walk);
  })(copy);
  return copy;
}

export function walk(elements, fn) {
  (elements || []).forEach((e) => {
    fn(e);
    walk(e.elements, fn);
  });
}

export function countNodes(elements) {
  let n = 0;
  walk(elements, () => n++);
  return n;
}

/** Normaliza qualquer JSON colado (array, template exportado, clipboard do Elementor, elemento único). */
export function normalizeElements(input) {
  let data = typeof input === 'string' ? JSON.parse(input) : input;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.elements)) return data.elements; // {type:'elementor', elements}
  if (data && Array.isArray(data.content)) return data.content; // template .json exportado
  if (data && data.elType) return [data];
  throw new Error('JSON não reconhecido como estrutura do Elementor.');
}

/** O documento só aceita containers na raiz: envolve widgets soltos. */
export function wrapTopLevel(elements) {
  return elements.map((e) => {
    if (e.elType === 'widget') return container({ pad: 20 }, [e]);
    if (e.elType === 'container') return { ...e, isInner: false };
    return e;
  });
}

export function markInner(elements) {
  walk(elements, (e) => {
    (e.elements || []).forEach((c) => {
      if (c.elType === 'container') c.isInner = true;
    });
  });
  return elements;
}

export function toClipboardPayload(elements, siteurl = '') {
  return JSON.stringify({ type: 'elementor', siteurl: siteurl || 'https://atomik.local/', elements: markInner(wrapTopLevel(elements)) });
}

// ---------- Ponte com a aba ativa ----------

const hasChrome = typeof chrome !== 'undefined' && chrome.scripting;

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

// Esta função roda no contexto (MAIN world) da página do editor. Precisa ser autocontida.
function atomikPageAPI(cmd, args) {
  const E = window.elementor;
  const R = window.$e;
  if (cmd === 'status') {
    return { ok: !!(E && R), version: (window.ELEMENTOR_VERSION || (E && E.config && E.config.version)) || null, title: document.title };
  }
  if (!E || !R) return { ok: false, error: 'Abra o editor do Elementor nesta aba.' };

  const opts = { remove: ['default', 'editSettings', 'defaultEditSettings'] };
  const getSel = () => {
    try {
      const s = E.selection && E.selection.getElements();
      if (s && s.length) return s;
    } catch (e) {}
    try {
      const v = E.getPanelView().getCurrentPageView();
      const ev = v && v.getOption && v.getOption('editedElementView');
      if (ev) return [ev.getContainer()];
    } catch (e) {}
    return [];
  };
  const walkC = (c, fn) => {
    fn(c);
    (c.children || []).forEach((ch) => walkC(ch, fn));
  };
  const root = () => E.getPreviewContainer();
  const set = (c, settings) => R.run('document/elements/settings', { container: c, settings, options: { external: true } });
  const isWidget = (c) => c.model.get('elType') === 'widget';

  try {
    switch (cmd) {
      case 'insert': {
        const sel = getSel();
        let target = root();
        let at;
        if (args.mode === 'inside' && sel[0] && !isWidget(sel[0])) target = sel[0];
        if (args.mode === 'after' && sel[0]) {
          let top = sel[0];
          while (top.parent && top.parent !== root() && top.parent.id !== root().id) top = top.parent;
          at = root().children.indexOf(top) + 1;
        }
        let n = 0;
        args.elements.forEach((model, i) => {
          R.run('document/elements/create', { container: target, model, options: { at: at != null ? at + i : undefined, edit: false } });
          n++;
        });
        return { ok: true, count: n };
      }
      case 'undo':
        R.run('document/history/undo');
        return { ok: true };
      case 'redo':
        R.run('document/history/redo');
        return { ok: true };
      case 'reload':
        E.reloadPreview();
        return { ok: true };
      case 'save':
        R.run('document/save/update');
        return { ok: true };
      case 'duplicate': {
        const sel = getSel();
        if (!sel.length) return { ok: false, error: 'Selecione um elemento no editor.' };
        R.run('document/elements/duplicate', { containers: sel });
        return { ok: true, count: sel.length };
      }
      case 'toggleDirection': {
        const sel = getSel().filter((c) => c.model.get('elType') === 'container');
        if (!sel.length) return { ok: false, error: 'Selecione um container.' };
        sel.forEach((c) => {
          const cur = c.settings.get('flex_direction') || 'column';
          set(c, { flex_direction: cur.startsWith('row') ? 'column' : 'row' });
        });
        return { ok: true, count: sel.length };
      }
      case 'getSelected': {
        const sel = getSel();
        if (!sel.length) return { ok: false, error: 'Selecione um elemento no editor.' };
        return { ok: true, elements: sel.map((c) => c.model.toJSON(opts)) };
      }
      case 'getPage':
        return { ok: true, elements: E.elements.toJSON(opts), title: E.config.document && E.config.document.settings && E.config.document.settings.settings && E.config.document.settings.settings.post_title };
      default:
        return { ok: false, error: 'Comando desconhecido: ' + cmd };
    }
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err) };
  }
}

export async function page(cmd, args = {}) {
  if (!hasChrome) return { ok: false, error: 'Disponível apenas dentro da extensão.' };
  const tab = await activeTab();
  if (!tab || !/^https?:/.test(tab.url || '')) return { ok: false, error: 'Abra o editor do Elementor em uma aba.' };
  try {
    const [res] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: 'MAIN', func: atomikPageAPI, args: [cmd, args] });
    return res?.result ?? { ok: false, error: 'Sem resposta da página.' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function insertIntoPage(elements, mode) {
  let els = mode === 'inside' ? elements : wrapTopLevel(elements);
  els = els.map(regenIds);
  markInner(els);
  if (mode === 'inside') els.forEach((e) => e.elType === 'container' && (e.isInner = true));
  return page('insert', { elements: els, mode });
}

export async function copyText(str) {
  try {
    await navigator.clipboard.writeText(str);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = str;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export async function copyElements(elements, siteurl) {
  return copyText(toClipboardPayload(elements.map(regenIds), siteurl));
}
