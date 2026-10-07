/*
 * Gerador de Propostas MFL Sales — painel de edição.
 * Segue a especificação do gerador: modelo, público, escopo, CRM, valores,
 * condições e vídeo. A proposta ao lado (index.html?preview=1) atualiza ao vivo.
 */
(() => {
  'use strict';

  const RASCUNHO_KEY = 'mfl-proposta-rascunho';
  const MODELO = 'padrao';
  const SCOPE = ['meta', 'google', 'lp', 'wpp', 'remkt', 'criativos', 'roteiro', 'relatorio'];
  const SCOPE_PADRAO = Object.fromEntries(SCOPE.map((k) => [k, true]));

  const $ = (id) => document.getElementById(id);
  const iframe = $('previa');
  let S = {};
  let catalogo = { segmentos: [], depoimentos: [] };
  let timer = null;
  let filtroDepo = '';
  let online = false;      // editor aberto no site com servidor (login + publicar)
  let pendente = false;    // há alterações ainda não publicadas

  const hojeIso = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  function normalizar(d) {
    const base = {
      versao: 2, id: '', idPublicado: '', cliente: '', data: hojeIso(), validadeDias: 7, segmento: '',
      modelo: '4', outTipo: 'bdr', pub: 'b2b', crm: 'mfl', sc: { ...SCOPE_PADRAO },
      vIn: '', vOut: '', vCombo: '', vCrm: '297', contrato: 3, cond: '', verbaDia: 100,
      videoUrl: '', thumb: '', depoimentos: [], responsavel: {}, capa: {}
    };
    const out = { ...base, ...(d && typeof d === 'object' ? d : {}) };
    out.sc = { ...SCOPE_PADRAO, ...(out.sc || {}) };
    out.responsavel = { ...(out.responsavel || {}) };
    out.capa = { ...(out.capa || {}) };
    out.depoimentos = Array.isArray(out.depoimentos) ? out.depoimentos : [];
    return out;
  }

  const formatoAtual = (d) => d && typeof d === 'object' && Number(d.versao) === 2;

  function slugificar(t) {
    return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function cfg() {
    const m = String(S.modelo);
    const hasIn = m === '1' || m === '4';
    return { m, hasIn, mfl: S.crm !== 'cli', out: m === '2' ? 'bdr' : m === '3' ? 'train' : m === '4' ? S.outTipo : null };
  }

  /* ---------- ligação dos campos ---------- */

  function texto(id, ler, gravar) {
    const campo = $(id);
    campo.value = ler() ?? '';
    campo.addEventListener('input', () => { gravar(campo.value); alterado(); });
  }

  function preencherCampos() {
    // simples
    texto('cliente', () => S.cliente, (v) => { S.cliente = v; });
    texto('data', () => S.data, (v) => { S.data = v; });
    texto('validadeDias', () => S.validadeDias, (v) => { S.validadeDias = v === '' ? '' : Number(v); });
    texto('segmento', () => S.segmento, (v) => { S.segmento = v; });
    for (const id of ['vIn', 'vOut', 'vCombo', 'vCrm', 'cond', 'videoUrl']) texto(id, () => S[id], (v) => { S[id] = v; });
    texto('contrato', () => S.contrato, (v) => { S.contrato = v === '' ? '' : Number(v); });
    texto('verbaDia', () => S.verbaDia, (v) => { S.verbaDia = v; });
    for (const k of ['nome', 'cargo', 'whatsapp', 'email']) texto(`r-${k}`, () => S.responsavel[k], (v) => { S.responsavel[k] = v; });
    for (const k of ['provaDestaque', 'provaTexto', 'rotulo', 'frase', 'botao']) texto(`c-${k}`, () => S.capa[k], (v) => { S.capa[k] = v; });
    texto('c-faixa', () => (S.capa.faixa || []).join('\n'), (v) => { S.capa.faixa = v.split('\n').map((t) => t.trim()).filter(Boolean); });

    // escopo
    for (const k of SCOPE) {
      const c = $(`sc-${k}`);
      c.checked = !!S.sc[k];
      c.onchange = () => { S.sc[k] = c.checked; alterado(); };
    }
    // rádios
    for (const nome of ['modelo', 'outTipo', 'pub', 'crm']) {
      document.querySelectorAll(`input[name=${nome}]`).forEach((r) => {
        r.checked = r.value === String(S[nome]);
        r.onchange = () => { S[nome] = r.value; alterado(); };
      });
    }
    mostrarThumb();
    desenharDepoimentos();
  }

  // Os campos de texto ganham "listeners" novos a cada carga: recria o painel limpo
  function recriarPainel() {
    const painel = $('painel');
    const copia = painel.cloneNode(true);
    painel.replaceWith(copia);
    ligarAcoesDoPainel();
    preencherCampos();
    atualizarPainel();
  }

  /* ---------- imagem de capa do vídeo ---------- */

  function mostrarThumb() {
    $('thumbPrev').hidden = !S.thumb;
    $('thumbClear').hidden = !S.thumb;
    if (S.thumb) $('thumbPrev').src = S.thumb;
  }

  /* ---------- depoimentos da biblioteca ---------- */

  function desenharDepoimentos() {
    const filtro = $('depo-filtro');
    filtro.replaceChildren(new Option('Todos os segmentos', ''), ...catalogo.segmentos.map((s) => new Option(s, s)));
    filtro.value = filtroDepo;
    $('lista-segmentos').replaceChildren(...catalogo.segmentos.map((s) => new Option(s)));

    const caixa = $('depo-lista');
    const visiveis = catalogo.depoimentos.filter((d) => !filtroDepo || d.segmento === filtroDepo);
    if (!catalogo.depoimentos.length) { caixa.replaceChildren(Object.assign(document.createElement('small'), { textContent: 'Biblioteca vazia (depoimentos/catalogo.json).' })); return; }
    caixa.replaceChildren(...visiveis.map((d) => {
      const rotulo = document.createElement('label');
      rotulo.className = 'depo-item';
      const chk = Object.assign(document.createElement('input'), { type: 'checkbox', checked: S.depoimentos.includes(d.id) });
      chk.addEventListener('change', () => {
        const i = S.depoimentos.indexOf(d.id);
        if (chk.checked && i < 0) S.depoimentos.push(d.id);
        if (!chk.checked && i >= 0) S.depoimentos.splice(i, 1);
        alterado();
      });
      const txt = document.createElement('span');
      txt.className = 'depo-texto';
      txt.append(Object.assign(document.createElement('strong'), { textContent: d.cliente || d.pessoa || d.id }),
        Object.assign(document.createElement('span'), { textContent: [d.segmento, d.pessoa].filter(Boolean).join(' · ') }));
      rotulo.append(chk, txt);
      if (!d.video) rotulo.append(Object.assign(document.createElement('span'), { className: 'depo-sem-video', textContent: 'sem vídeo' }));
      return rotulo;
    }));
    if (!visiveis.length) caixa.append(Object.assign(document.createElement('small'), { textContent: 'Nenhum depoimento neste segmento.' }));
  }

  /* ---------- visibilidade, avisos e título ---------- */

  function atualizarPainel() {
    const c = cfg();
    $('outTipoWrap').hidden = c.m !== '4';
    $('pubWrap').hidden = !c.hasIn;
    $('scopeWrap').hidden = !c.hasIn;
    $('fIn').hidden = !c.hasIn;
    $('lIn').textContent = c.m === '4' ? 'Plano 1 · Inbound' : 'Valor Inbound';
    $('fOut').hidden = !(c.m === '2' || c.m === '3');
    $('fCombo').hidden = c.m !== '4';
    $('fCrm').hidden = !c.mfl;
    $('fVerba').hidden = !c.hasIn;

    const nomes = { 1: 'Modelo 1 · Inbound', 2: 'Modelo 2 · Outbound com BDR + SDR', 3: 'Modelo 3 · Outbound com Treinamento', 4: `Modelo 4 · Inbound + Outbound (${S.outTipo === 'train' ? 'Treinamento' : 'BDR + SDR'})` };
    $('pv-titulo').textContent = nomes[c.m] + (c.hasIn ? (S.pub === 'b2c' ? ' · B2C' : ' · B2B') : '') + (c.mfl ? ' · CRM MFL Sales' : ' · CRM do cliente');

    const falta = [];
    if (!String(S.cliente || '').trim()) falta.push('Nome do cliente');
    if (c.hasIn && !S.sc.meta && !S.sc.google) falta.push('Marque ao menos um canal de tráfego (Meta ou Google)');
    if (c.hasIn && !String(S.vIn || '').trim()) falta.push(c.m === '4' ? 'Valor do Plano 1' : 'Valor Inbound');
    if ((c.m === '2' || c.m === '3') && !String(S.vOut || '').trim()) falta.push('Valor Outbound');
    if (c.m === '4' && !String(S.vCombo || '').trim()) falta.push('Valor do Plano 2');
    if (c.mfl && !String(S.vCrm || '').trim()) falta.push('Valor do CRM MFL Sales');
    if (!/^https?:\/\//i.test(String(S.videoUrl || '').trim())) falta.push('Link do vídeo');
    const aviso = $('aviso');
    aviso.hidden = !falta.length;
    aviso.replaceChildren();
    if (falta.length) {
      aviso.append(Object.assign(document.createElement('b'), { textContent: 'Falta preencher:' }));
      const ul = document.createElement('ul');
      falta.forEach((f) => ul.append(Object.assign(document.createElement('li'), { textContent: f })));
      aviso.append(ul);
    }
  }

  /* ---------- sincronização ---------- */

  function alterado() {
    atualizarPainel();
    clearTimeout(timer);
    $('status').textContent = 'Salvando…';
    pendente = true;
    timer = setTimeout(() => {
      salvarRascunho();
      enviarParaPrevia();
      atualizarStatus();
    }, 200);
  }

  function salvarRascunho() {
    try { localStorage.setItem(RASCUNHO_KEY, JSON.stringify(S)); } catch (e) {
      // sem espaço: salva sem a imagem de capa do vídeo
      try { localStorage.setItem(RASCUNHO_KEY, JSON.stringify({ ...S, thumb: '' })); } catch (_) { /* sem storage */ }
    }
  }

  function enviarParaPrevia() {
    iframe.contentWindow?.postMessage({ tipo: 'proposta:atualizar', dados: structuredClone(S) }, location.origin);
  }

  function carregarDados(novos, origem) {
    S = normalizar(novos);
    recriarPainel();
    salvarRascunho();
    enviarParaPrevia();
    pendente = false;
    atualizarStatus(origem ? `Carregado: ${origem}` : '');
  }

  function atualizarStatus(textoFixo) {
    const status = $('status');
    status.replaceChildren();
    if (textoFixo) { status.textContent = textoFixo; return; }
    if (!online) { status.textContent = 'Rascunho salvo no navegador'; return; }
    if (!S.idPublicado) { status.textContent = 'Ainda não publicada'; return; }
    status.append(pendente ? 'Alterações ainda não publicadas · ' : 'Publicada · ',
      Object.assign(document.createElement('a'), { href: linkDe(S.idPublicado), target: '_blank', rel: 'noopener', textContent: 'abrir link' }));
  }

  async function buscar(nome) {
    const resp = await fetch(`propostas/${nome}.json`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Não encontrei propostas/${nome}.json`);
    return resp.json();
  }

  /* ---------- ações do painel (refeitas quando o painel é recriado) ---------- */

  function ligarAcoesDoPainel() {
    $('thumb').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const leitor = new FileReader();
      leitor.onload = () => { S.thumb = leitor.result; mostrarThumb(); alterado(); };
      leitor.readAsDataURL(f);
    });
    $('thumbClear').addEventListener('click', () => { S.thumb = ''; $('thumb').value = ''; mostrarThumb(); alterado(); });
    $('depo-filtro').addEventListener('change', (e) => { filtroDepo = e.target.value; desenharDepoimentos(); });
    $('depo-sugerir').addEventListener('click', () => {
      const seg = String(S.segmento || '').trim().toLowerCase();
      const ids = catalogo.depoimentos.filter((d) => (d.segmento || '').toLowerCase() === seg).map((d) => d.id);
      if (!ids.length) { alert('Nenhum depoimento cadastrado para o segmento do cliente. Preencha o campo Segmento ou escolha manualmente.'); return; }
      ids.forEach((id) => { if (!S.depoimentos.includes(id)) S.depoimentos.push(id); });
      filtroDepo = S.segmento;
      desenharDepoimentos();
      alterado();
    });
    $('exportar').addEventListener('click', () => {
      const antigo = document.title;
      document.title = `Proposta MFL Sales - ${S.cliente || 'Cliente'}`;
      iframe.contentWindow?.postMessage({ tipo: 'proposta:imprimir' }, location.origin);
      setTimeout(() => { document.title = antigo; }, 500);
    });
    let dentroDeQuadro = false;
    try { dentroDeQuadro = window.self !== window.top; } catch (e) { dentroDeQuadro = true; }
    if (dentroDeQuadro) $('nota-pdf').textContent = 'Para exportar o PDF, abra o editor fora da prévia (no site publicado) e clique em Exportar PDF. Aqui a impressão é bloqueada.';
  }

  /* ---------- ações da barra superior ---------- */

  $('acao-baixar').addEventListener('click', () => {
    if (!S.id) S.id = slugificar(S.cliente) || 'proposta';
    const blob = new Blob([JSON.stringify(S, null, 2) + '\n'], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${S.id}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $('acao-importar').addEventListener('click', () => $('arquivo').click());
  $('arquivo').addEventListener('change', async (e) => {
    const arquivo = e.target.files[0];
    e.target.value = '';
    if (!arquivo) return;
    try {
      const d = JSON.parse(await arquivo.text());
      if (!formatoAtual(d)) throw new Error('formato');
      carregarDados(d, arquivo.name);
    } catch (err) {
      alert('Este arquivo não é uma proposta válida do gerador.');
    }
  });

  $('acao-novo').addEventListener('click', async () => {
    if (!confirm('Começar uma nova proposta a partir do padrão? O rascunho atual será substituído.')) return;
    try {
      const modelo = await buscar(MODELO);
      modelo.id = '';
      modelo.idPublicado = '';
      modelo.data = hojeIso();
      carregarDados(modelo, 'proposta padrão');
    } catch (err) { alert(err.message); }
  });

  const dialogo = $('dialogo-abrir');
  $('acao-abrir').addEventListener('click', () => { $('abrir-nome').value = ''; dialogo.showModal(); });
  dialogo.addEventListener('close', async () => {
    if (dialogo.returnValue !== 'ok') return;
    const nome = slugificar($('abrir-nome').value);
    if (!nome) return;
    try {
      const d = await buscar(nome);
      if (!formatoAtual(d)) throw new Error('Essa proposta está no formato antigo e não abre no gerador.');
      carregarDados(d, `${nome}.json`);
    } catch (err) { alert(err.message); }
  });

  let mostrandoCapa = false;
  $('acao-capa').addEventListener('click', (e) => {
    mostrandoCapa = !mostrandoCapa;
    e.currentTarget.textContent = mostrandoCapa ? 'Ver proposta' : 'Ver capa';
    iframe.contentWindow?.postMessage({ tipo: 'proposta:capa', mostrar: mostrandoCapa }, location.origin);
  });

  $('acao-aba').addEventListener('click', () => {
    salvarRascunho();
    window.open('index.html?preview=1', '_blank');
  });

  document.querySelectorAll('.previa-tamanhos button').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.previa-tamanhos button').forEach((x) => x.classList.toggle('ativo', x === b));
      iframe.style.width = b.dataset.largura;
    });
  });

  // A pré-visualização pode terminar de carregar depois do editor.
  iframe.addEventListener('load', () => {
    enviarParaPrevia();
    if (mostrandoCapa) iframe.contentWindow?.postMessage({ tipo: 'proposta:capa', mostrar: true }, location.origin);
  });

  /* ---------- publicação (site hospedado com o servidor PHP) ---------- */

  const linkDe = (id) => new URL(`./?p=${id}`, location.href).href;

  async function api(caminho, opcoes = {}) {
    const headers = { 'X-MFL': '1' };
    if (opcoes.body) headers['Content-Type'] = 'application/json';
    const resp = await fetch(`api/${caminho}`, { cache: 'no-store', credentials: 'same-origin', ...opcoes, headers });
    if (!(resp.headers.get('content-type') || '').includes('application/json')) throw new Error('sem-servidor');
    const json = await resp.json();
    if (resp.status === 401) { location.href = 'editor.php'; throw new Error(json.erro || 'Faça login novamente.'); }
    if (!resp.ok) throw new Error(json.erro || 'Não foi possível concluir.');
    return json;
  }

  function ativarModoOnline(u) {
    online = true;
    $('acao-publicar').hidden = false;
    $('acao-lista').hidden = false;
    $('usuario').hidden = false;
    $('usuario-nome').textContent = u.nome || u.email;
    $('acao-abrir').hidden = true;
    $('acao-baixar').classList.remove('primario');
    atualizarStatus();
  }

  async function copiar(texto, botao) {
    try { await navigator.clipboard.writeText(texto); } catch (e) {
      const campo = $('publicado-link');
      campo.value = texto; campo.select(); document.execCommand('copy');
    }
    if (botao) {
      const antes = botao.textContent;
      botao.textContent = 'Copiado!';
      setTimeout(() => { botao.textContent = antes; }, 1500);
    }
  }

  function mostrarPublicado(id, novo) {
    const link = linkDe(id);
    $('publicado-titulo').textContent = novo ? 'Proposta publicada' : 'Proposta atualizada';
    $('publicado-link').value = link;
    $('publicado-abrir').href = link;
    $('publicado-whats').href = `https://wa.me/?text=${encodeURIComponent(`Olá! Segue a proposta comercial da MFL Sales${S.cliente ? ` para ${S.cliente}` : ''}: ${link}`)}`;
    $('dialogo-publicado').showModal();
  }

  $('publicado-copiar').addEventListener('click', (e) => copiar($('publicado-link').value, e.currentTarget));

  $('acao-publicar').addEventListener('click', async (e) => {
    const falta = [...document.querySelectorAll('#aviso li')].map((li) => li.textContent);
    if (falta.length && !confirm(`Ainda falta preencher:\n• ${falta.join('\n• ')}\n\nPublicar mesmo assim?`)) return;
    const botao = e.currentTarget;
    botao.disabled = true;
    botao.textContent = 'Publicando…';
    try {
      const r = await api('publicar.php', { method: 'POST', body: JSON.stringify({ id: S.idPublicado || '', dados: S }) });
      S.idPublicado = r.id;
      pendente = false;
      salvarRascunho();
      atualizarStatus();
      mostrarPublicado(r.id, r.novo);
    } catch (err) {
      alert(`Não foi possível publicar: ${err.message}`);
    } finally {
      botao.disabled = false;
      botao.textContent = 'Publicar';
    }
  });

  let publicadas = [];
  const dataHora = (iso) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  function desenharLista() {
    const busca = slugificar($('lista-busca').value);
    const itens = publicadas.filter((p) => !busca || slugificar(p.cliente).includes(busca));
    const caixa = $('lista-itens');
    if (!itens.length) {
      caixa.replaceChildren(Object.assign(document.createElement('p'), { className: 'lista-vazia', textContent: publicadas.length ? 'Nenhuma proposta com esse nome.' : 'Nenhuma proposta publicada ainda.' }));
      return;
    }
    caixa.replaceChildren(...itens.map((p) => {
      const linha = Object.assign(document.createElement('div'), { className: 'lista-item' });
      const info = document.createElement('div');
      info.append(Object.assign(document.createElement('strong'), { textContent: p.cliente || '(sem nome do cliente)' }),
        Object.assign(document.createElement('small'), { textContent: `Atualizada em ${dataHora(p.atualizadoEm)} por ${p.atualizadoPor}` }));
      const acoes = Object.assign(document.createElement('div'), { className: 'acoes' });
      const botao = (rotulo, fn) => { const b = Object.assign(document.createElement('button'), { type: 'button', textContent: rotulo }); b.addEventListener('click', fn); return b; };
      acoes.append(
        botao('Copiar link', (ev) => copiar(linkDe(p.id), ev.currentTarget)),
        Object.assign(document.createElement('a'), { href: linkDe(p.id), target: '_blank', rel: 'noopener', textContent: 'Abrir' }),
        botao('Editar', () => abrirPublicada(p.id, false)),
        botao('Duplicar', () => abrirPublicada(p.id, true)));
      linha.append(info, acoes);
      return linha;
    }));
  }

  async function abrirPublicada(id, duplicar) {
    if (pendente && !confirm('O rascunho atual tem alterações não publicadas. Substituir mesmo assim?')) return;
    try {
      const d = await api(`proposta.php?id=${id}`);
      $('dialogo-lista').close();
      if (duplicar) carregarDados({ ...d, idPublicado: '', cliente: d.cliente ? `${d.cliente} (cópia)` : '' }, 'cópia de proposta publicada');
      else carregarDados({ ...d, idPublicado: id });
    } catch (err) { alert(err.message); }
  }

  $('acao-lista').addEventListener('click', async () => {
    $('lista-busca').value = '';
    $('lista-itens').replaceChildren(Object.assign(document.createElement('p'), { className: 'lista-vazia', textContent: 'Carregando…' }));
    $('dialogo-lista').showModal();
    try { publicadas = (await api('lista.php')).propostas || []; desenharLista(); } catch (err) {
      $('lista-itens').replaceChildren(Object.assign(document.createElement('p'), { className: 'lista-vazia', textContent: err.message }));
    }
  });
  $('lista-busca').addEventListener('input', desenharLista);

  $('acao-sair').addEventListener('click', async () => {
    try { await api('sair.php', { method: 'POST' }); } catch (e) { /* segue para a tela de login */ }
    location.href = 'editor.php';
  });

  /* ---------- início ---------- */

  (async () => {
    try {
      const resp = await fetch('depoimentos/catalogo.json', { cache: 'no-store' });
      if (resp.ok) {
        const c = await resp.json();
        catalogo = { segmentos: Array.isArray(c.segmentos) ? c.segmentos : [], depoimentos: Array.isArray(c.depoimentos) ? c.depoimentos : [] };
      }
    } catch (e) { /* sem catálogo */ }
    let inicial = null;
    try { inicial = JSON.parse(localStorage.getItem(RASCUNHO_KEY) || 'null'); } catch (e) { /* sem rascunho */ }
    if (!formatoAtual(inicial)) {
      try { inicial = await buscar(MODELO); } catch (e) { inicial = {}; }
    }
    carregarDados(inicial);

    // No site hospedado, o servidor confirma o login e libera o botão Publicar
    try {
      const sessao = await api('sessao.php');
      if (sessao.logado) ativarModoOnline(sessao);
      else location.href = 'editor.php';
    } catch (e) { /* sem servidor (arquivos abertos localmente): só rascunho e .json */ }
  })();
})();
