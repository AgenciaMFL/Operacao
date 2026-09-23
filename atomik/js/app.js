import { icon } from './icons.js';
import * as store from './storage.js';
import { page, insertIntoPage, copyElements, copyText, normalizeElements, countNodes } from './elementor.js';
import { convertHtml, toTemplateFile } from './html2elementor.js';

const $app = document.getElementById('app');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Catálogo da tela inicial (apenas "Código → Elementor" está implementado).
const GROUPS = [
  { title: 'Figma', items: [
    { id: 'figma', label: 'Figma → Elementor', icon: 'figma' },
    { id: 'figma-assets', label: 'Figma Assets', icon: 'assets' },
  ] },
  { title: 'Conversor de código', items: [
    { id: 'code', label: 'Código → Elementor', icon: 'code', ready: true, keys: 'html css converter' },
    { id: 'prompts', label: 'Gerador de prompts', icon: 'sparkles' },
  ] },
  { title: 'Criação', items: [
    { id: 'sections', label: 'Seções', icon: 'sections' },
    { id: 'components', label: 'Componentes', icon: 'components' },
    { id: 'jsons', label: 'JSONs Personalizados', icon: 'layers' },
    { id: 'styles', label: 'Estilos', icon: 'pen' },
    { id: 'copy', label: 'Copy', icon: 'file' },
    { id: 'animations', label: 'Animações', icon: 'wave' },
  ] },
];

let connected = false;
let toastTimer;

function toast(msg, kind = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = 'toast'), 2600);
}

function shell(inner, { home = false } = {}) {
  $app.innerHTML = `
    <header class="header">
      <div class="brand">${icon('logo', 26)}<span>Atomik</span></div>
      <div class="header-actions">
        <span class="status-dot ${connected ? 'on' : ''}" title="${connected ? 'Editor do Elementor conectado' : 'Elementor não detectado nesta aba'}"></span>
        <button class="icon-btn" data-act="news" title="Novidades">${icon('bell', 18)}</button>
        <button class="icon-btn" data-act="settings" title="Configurações">${icon('settings', 18)}</button>
      </div>
    </header>
    <main class="content">${inner}</main>
    <nav class="toolbar">
      <button class="tool" data-tb="undo" title="Desfazer" ${connected ? '' : 'disabled'}>${icon('undo', 18)}</button>
      <button class="tool" data-tb="toggleDirection" title="Inverter direção do container (linha/coluna)">${icon('swap', 18)}</button>
      <button class="tool" data-tb="duplicate" title="Duplicar selecionado">${icon('duplicate', 18)}</button>
      <button class="tool" data-tb="reload" title="Recarregar preview">${icon('refresh', 18)}</button>
      <button class="tool" data-tb="copySelected" title="Copiar JSON do selecionado">${icon('codeSimple', 18)}</button>
      <button class="tool" data-tb="paste" title="Inserir JSON da área de transferência">${icon('plus', 18)}</button>
    </nav>`;
  $app.querySelector('[data-act=settings]').onclick = renderSettings;
  $app.querySelector('[data-act=news]').onclick = () => toast('Atomik 1.0 — Código → Elementor disponível.');
  $app.querySelectorAll('[data-tb]').forEach((b) => (b.onclick = () => toolbar(b.dataset.tb)));
  if (home) $app.dataset.view = 'home';
}

// ---------- Home ----------

function renderHome(query = '') {
  const q = query.trim().toLowerCase();
  const groups = GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !q || (i.label + ' ' + (i.keys || '') + ' ' + g.title).toLowerCase().includes(q)) })).filter((g) => g.items.length);
  const body = groups
    .map(
      (g) => `<h3 class="group-title">${g.title}</h3><div class="grid">${g.items
        .map((i) => `<button class="tile ${i.ready ? '' : 'soon'}" data-tool="${i.id}">${i.ready ? '' : '<span class="badge">em breve</span>'}${icon(i.icon, 22)}<span>${i.label}</span></button>`)
        .join('')}</div>`,
    )
    .join('');
  shell(
    `<label class="search">${icon('search', 16)}<input id="q" placeholder="Digite aqui o que você procura" value="${esc(query)}" autocomplete="off" /></label>
     <div id="results">${body || '<p class="empty">Nada encontrado.</p>'}</div>`,
    { home: true },
  );
  const input = document.getElementById('q');
  input.oninput = () => {
    const pos = input.selectionStart;
    renderHome(input.value);
    const again = document.getElementById('q');
    again.focus();
    again.setSelectionRange(pos, pos);
  };
  $app.querySelectorAll('[data-tool]').forEach((b) => (b.onclick = () => openTool(b.dataset.tool)));
}

function openTool(id) {
  if (id === 'code') return renderCode();
  const item = GROUPS.flatMap((g) => g.items).find((i) => i.id === id);
  toast(`${item ? item.label : 'Ferramenta'} — em breve.`);
}

// ---------- Código → Elementor ----------

const SAMPLE_HTML = `<section class="hero">
  <div class="wrap">
    <div class="copy">
      <span class="tag">Novo lançamento</span>
      <h1>Crie páginas incríveis em minutos</h1>
      <p>Cole seu HTML e transforme em containers do Elementor, prontos para editar.</p>
      <div class="actions">
        <a href="#comecar" class="btn">Começar agora</a>
        <a href="#demo" class="btn ghost">Ver demonstração</a>
      </div>
    </div>
    <img src="https://picsum.photos/560/420" alt="Mockup" />
  </div>
</section>
<section class="features">
  <div class="wrap">
    <h2>Por que usar</h2>
    <div class="cards">
      <div class="card"><h3>Rápido</h3><p>Conversão instantânea, direto no navegador.</p></div>
      <div class="card"><h3>Fiel</h3><p>Cores, fontes, espaçamentos e layout preservados.</p></div>
      <div class="card"><h3>Editável</h3><p>Tudo vira widgets nativos do Elementor.</p></div>
    </div>
  </div>
</section>`;

const SAMPLE_CSS = `body { margin: 0; font-family: Inter, sans-serif; color: #1f2937; }
.wrap { max-width: 1140px; margin: 0 auto; padding: 0 20px; }
.hero { background: #0f172a; color: #fff; padding: 96px 0; }
.hero .wrap { display: flex; align-items: center; gap: 48px; }
.copy { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.tag { align-self: flex-start; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #f6ad55; }
.hero h1 { font-size: 52px; line-height: 1.1; margin: 0; }
.hero p { font-size: 18px; color: #cbd5e1; margin: 0; }
.actions { display: flex; gap: 12px; }
.btn { background: #f6ad55; color: #1a1206; padding: 14px 26px; border-radius: 10px; text-decoration: none; font-weight: 600; }
.btn.ghost { background: transparent; color: #fff; border: 1px solid #334155; }
.hero img { width: 520px; border-radius: 16px; }
.features { padding: 80px 0; background: #f8fafc; }
.features h2 { text-align: center; font-size: 36px; margin: 0 0 40px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 28px; }
.card h3 { margin: 0 0 8px; font-size: 20px; }
.card p { margin: 0; color: #64748b; }`;

let lastResult = null;

function treeHtml(elements, depth = 0, out = []) {
  for (const e of elements) {
    if (out.length > 400) break;
    const pad = '&nbsp;'.repeat(depth * 2);
    if (e.elType === 'container') {
      const s = e.settings;
      const label = [s.flex_direction === 'row' ? 'linha' : 'coluna', s.width ? `${s.width.size}${s.width.unit}` : '', s.content_width === 'boxed' ? `boxed ${s.boxed_width?.size}px` : ''].filter(Boolean).join(' · ');
      out.push(`<div class="node">${pad}<span class="t">▢ container</span> ${esc(label)}</div>`);
      treeHtml(e.elements || [], depth + 1, out);
    } else {
      const s = e.settings;
      const preview = (s.title || s.text || (s.editor || '').replace(/<[^>]+>/g, ' ') || s.image?.url || (s.html ? 'HTML' : '')).trim().slice(0, 48);
      out.push(`<div class="node">${pad}<span class="w">◆ ${e.widgetType}</span> ${esc(preview)}</div>`);
    }
  }
  return out.join('');
}

async function renderCode() {
  const draft = await store.get('codeDraft', { html: '', css: '', tab: 'html' });
  const settings = await store.getSettings();
  let tab = draft.tab || 'html';

  shell(`
    <div class="view-head">
      <button class="icon-btn" data-act="back" title="Voltar">${icon('back', 18)}</button>
      <h2>${icon('code', 18)} Código → Elementor</h2>
    </div>
    <p class="lead">Cole HTML e CSS (ou uma página completa) e converta em Flexbox Containers e widgets nativos do Elementor.</p>
    <div class="tabs"><button data-tab="html">HTML</button><button data-tab="css">CSS</button></div>
    <textarea class="editor" id="src" spellcheck="false"></textarea>
    <div class="row-links">
      <button class="link" data-act="sample">Carregar exemplo</button>
      <button class="link muted" data-act="clear">Limpar</button>
    </div>
    <div class="opts">
      <label class="field">Largura boxed (px)<input type="number" id="boxed" min="600" max="2400" step="10" value="${settings.defaultBoxed}" /></label>
      <label class="check"><input type="checkbox" id="stack" ${settings.mobileStack ? 'checked' : ''} /> Empilhar linhas no mobile</label>
    </div>
    <button class="btn primary block" id="convert">${icon('bolt', 16)} Converter</button>
    <div id="out"></div>
  `);

  const src = document.getElementById('src');
  const setTab = (t) => {
    tab = t;
    $app.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
    src.value = draft[t] || '';
    src.placeholder = t === 'html' ? '<section class="hero">…</section>' : '.hero { padding: 80px 0; }';
  };
  const save = () => store.set('codeDraft', { ...draft, tab });
  setTab(tab);

  src.oninput = () => {
    draft[tab] = src.value;
    save();
  };
  src.onkeydown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      src.setRangeText('  ', src.selectionStart, src.selectionEnd, 'end');
      src.oninput();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) run();
  };
  $app.querySelectorAll('[data-tab]').forEach((b) => (b.onclick = () => (setTab(b.dataset.tab), save())));
  $app.querySelector('[data-act=back]').onclick = () => renderHome();
  $app.querySelector('[data-act=sample]').onclick = () => {
    draft.html = SAMPLE_HTML;
    draft.css = SAMPLE_CSS;
    setTab(tab);
    save();
  };
  $app.querySelector('[data-act=clear]').onclick = () => {
    draft.html = draft.css = '';
    setTab(tab);
    save();
    document.getElementById('out').innerHTML = '';
  };
  document.getElementById('boxed').onchange = (e) => store.saveSettings({ defaultBoxed: Number(e.target.value) || 1200 });
  document.getElementById('stack').onchange = (e) => store.saveSettings({ mobileStack: e.target.checked });
  document.getElementById('convert').onclick = run;

  if (lastResult) showResult(lastResult);

  async function run() {
    if (!draft.html?.trim()) return toast('Cole algum HTML primeiro.', 'err');
    const btn = document.getElementById('convert');
    btn.disabled = true;
    btn.innerHTML = `${icon('refresh', 16, 'spin')} Convertendo…`;
    try {
      const res = await convertHtml(draft.html, draft.css, {
        boxedWidth: Number(document.getElementById('boxed').value) || 1200,
        stackMobile: document.getElementById('stack').checked,
      });
      if (!res.elements.length) throw new Error('Nenhum elemento visível encontrado no HTML.');
      lastResult = res;
      showResult(res);
      toast('Conversão concluída!', 'ok');
    } catch (e) {
      toast(e.message, 'err');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `${icon('bolt', 16)} Converter`;
    }
  }
}

function showResult(res) {
  const out = document.getElementById('out');
  const { stats, warnings, elements } = res;
  out.innerHTML = `
    <div class="result">
      <div class="chips">
        <span class="chip"><b>${stats.sections}</b> seções</span>
        <span class="chip"><b>${stats.containers}</b> containers</span>
        <span class="chip"><b>${stats.widgets}</b> widgets</span>
        ${stats.raw ? `<span class="chip"><b>${stats.raw}</b> HTML bruto</span>` : ''}
      </div>
      ${warnings.length ? `<div class="warn">Atenção:<ul>${warnings.slice(0, 5).map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}
      <div class="tree">${treeHtml(elements)}</div>
      <button class="btn primary block" data-r="insert">${icon('insert', 16)} Inserir na página</button>
      <div class="btn-row">
        <button class="btn" data-r="copy">${icon('copy', 16)} Copiar</button>
        <button class="btn" data-r="download">${icon('download', 16)} Baixar .json</button>
      </div>
      <p class="hint"><b>Copiar:</b> no editor do Elementor clique com o botão direito numa área vazia → <i>Colar de outro site</i> e pressione <kbd>Ctrl</kbd>+<kbd>V</kbd>.<br/><b>.json:</b> importe em Modelos → Modelos salvos → Importar.</p>
    </div>`;
  out.querySelector('[data-r=insert]').onclick = async () => {
    const { insertMode } = await store.getSettings();
    const r = await insertIntoPage(elements, insertMode);
    r.ok ? toast(`${r.count} seção(ões) inserida(s) na página.`, 'ok') : toast(r.error, 'err');
  };
  out.querySelector('[data-r=copy]').onclick = async () => {
    const { siteUrl } = await store.getSettings();
    (await copyElements(elements, siteUrl)) ? toast('Copiado! Cole no Elementor com "Colar de outro site".', 'ok') : toast('Não foi possível copiar.', 'err');
  };
  out.querySelector('[data-r=download]').onclick = () => {
    const blob = new Blob([toTemplateFile(elements)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `atomik-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
}

// ---------- Configurações ----------

async function renderSettings() {
  const s = await store.getSettings();
  shell(`
    <div class="view-head">
      <button class="icon-btn" data-act="back" title="Voltar">${icon('back', 18)}</button>
      <h2>${icon('settings', 18)} Configurações</h2>
    </div>
    <div class="settings">
      <label class="field">Ao inserir na página
        <select id="insertMode">
          <option value="end" ${s.insertMode === 'end' ? 'selected' : ''}>No final da página</option>
          <option value="after" ${s.insertMode === 'after' ? 'selected' : ''}>Depois da seção selecionada</option>
          <option value="inside" ${s.insertMode === 'inside' ? 'selected' : ''}>Dentro do container selecionado</option>
        </select>
      </label>
      <label class="field">Largura boxed padrão (px)<input type="number" id="defaultBoxed" value="${s.defaultBoxed}" /></label>
      <label class="check"><input type="checkbox" id="mobileStack" ${s.mobileStack ? 'checked' : ''} /> Empilhar linhas no mobile</label>
    </div>`);
  $app.querySelector('[data-act=back]').onclick = () => renderHome();
  document.getElementById('insertMode').onchange = (e) => store.saveSettings({ insertMode: e.target.value });
  document.getElementById('defaultBoxed').onchange = (e) => store.saveSettings({ defaultBoxed: Number(e.target.value) || 1200 });
  document.getElementById('mobileStack').onchange = (e) => store.saveSettings({ mobileStack: e.target.checked });
}

// ---------- Barra inferior ----------

async function toolbar(cmd) {
  if (cmd === 'copySelected') {
    const r = await page('getSelected');
    if (!r.ok) return toast(r.error, 'err');
    await copyElements(r.elements);
    return toast(`JSON copiado (${countNodes(r.elements)} elementos).`, 'ok');
  }
  if (cmd === 'paste') {
    let els;
    try {
      els = normalizeElements(await navigator.clipboard.readText());
    } catch (e) {
      return toast('A área de transferência não contém um JSON do Elementor.', 'err');
    }
    const { insertMode } = await store.getSettings();
    const r = await insertIntoPage(els, insertMode);
    return r.ok ? toast(`${r.count} elemento(s) inserido(s).`, 'ok') : toast(r.error, 'err');
  }
  const r = await page(cmd);
  if (!r.ok) return toast(r.error, 'err');
  const msgs = { undo: 'Desfeito.', toggleDirection: 'Direção invertida.', duplicate: 'Duplicado.', reload: 'Preview recarregado.' };
  toast(msgs[cmd] || 'Feito.', 'ok');
}

// ---------- Status de conexão com o Elementor ----------

async function checkStatus() {
  const r = await page('status');
  const now = !!r.ok;
  if (now !== connected) {
    connected = now;
    const dot = $app.querySelector('.status-dot');
    if (dot) {
      dot.classList.toggle('on', connected);
      dot.title = connected ? 'Editor do Elementor conectado' : 'Elementor não detectado nesta aba';
    }
    const undo = $app.querySelector('[data-tb=undo]');
    if (undo) undo.disabled = !connected;
  }
}

if (typeof chrome !== 'undefined' && chrome.tabs) {
  chrome.tabs.onActivated.addListener(checkStatus);
  chrome.tabs.onUpdated.addListener((_, info) => info.status === 'complete' && checkStatus());
  setInterval(checkStatus, 4000);
}

renderHome();
checkStatus();

// exposto para testes
window.__atomik = { convertHtml, toTemplateFile };
