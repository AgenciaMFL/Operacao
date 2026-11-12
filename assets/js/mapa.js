/*
 * Tela de Mapa de calor: lista das propostas enviadas e, para cada uma, relatório das visitas,
 * mapa de calor (cliques e rolagem/atenção) desenhado por cima da própria proposta e gravações.
 * Sem servidor (arquivos abertos localmente ou na prévia), mostra dados de exemplo.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);

  const NOMES = {
    capa: 'Capa', inicio: 'Abertura', 'por-que-a-mfl': 'Por que a MFL', 'como-funciona': 'Como trabalhamos',
    solucao: 'Solução', resultados: 'Resultados', investimento: 'Investimento', 'proximos-passos': 'Próximos passos',
    duvidas: 'Dúvidas', aprovar: 'Fechamento', rodape: 'Rodapé'
  };
  const ORDEM = Object.keys(NOMES);
  const ACOES = {
    'abriu-capa': 'Abriu a proposta pela capa', aprovar: 'Clicou em Aprovar', whatsapp: 'Chamou no WhatsApp',
    email: 'Clicou no e-mail', pdf: 'Salvou em PDF', video: 'Assistiu ao vídeo'
  };
  const STATUS = { engajada: 'Muito engajada', aberta: 'Aberta', 'nao-aberta': 'Não aberta' };

  let demo = false;
  let propostas = [];
  let atual = null;        // detalhe da proposta aberta
  let filtro = '';
  let tipoMapa = 'cliques';
  let aparelho = 'computador';
  let player = null;

  /* ---------- formatação ---------- */

  const el = (tag, attrs = {}, ...filhos) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    filhos.flat().forEach((f) => f != null && f !== false && n.append(f instanceof Node ? f : String(f)));
    return n;
  };
  const duracao = (ms) => {
    const s = Math.round((ms || 0) / 1000);
    if (s < 60) return `${s} s`;
    const m = Math.floor(s / 60);
    return m < 60 ? `${m} min ${String(s % 60).padStart(2, '0')} s` : `${Math.floor(m / 60)} h ${m % 60} min`;
  };
  const relativo = (seg) => {
    if (!seg) return 'nunca';
    const d = Date.now() / 1000 - seg;
    if (d < 60) return 'agora';
    if (d < 3600) return `há ${Math.floor(d / 60)} min`;
    if (d < 86400) return `há ${Math.floor(d / 3600)} h`;
    return `há ${Math.floor(d / 86400)} d`;
  };
  const dataHora = (seg) => new Date(seg * 1000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const pct = (v) => `${Math.round((v || 0) * 100)}%`;
  const normalizar = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const linkDe = (id) => new URL(`./?p=${id}`, location.href).href;

  /* ---------- dados ---------- */

  async function api(caminho) {
    const resp = await fetch(`api/${caminho}`, { cache: 'no-store', credentials: 'same-origin' });
    if (!(resp.headers.get('content-type') || '').includes('application/json')) throw new Error('sem-servidor');
    const json = await resp.json();
    if (resp.status === 401) { location.href = 'mapa.php'; throw new Error('login'); }
    if (!resp.ok) throw new Error(json.erro || 'Não foi possível carregar.');
    return json;
  }

  // Dados de exemplo (prévia sem servidor): a proposta "demo" com visitas simuladas
  function dadosDemo() {
    const agora = Math.floor(Date.now() / 1000);
    let semente = 7;
    const aleat = () => (semente = (semente * 9301 + 49297) % 233280) / 233280;
    const visita = (i, disp, ativo, rolagem, tempo, acoes, horas) => ({
      visita: `demo${String(i).padStart(8, '0')}`, visitante: i < 3 ? 'demo-a' : 'demo-b', dispositivo: disp,
      origem: i % 2 ? 'web.whatsapp.com' : '', inicio: agora - horas * 3600, fim: agora - horas * 3600 + ativo / 1000,
      ativo, rolagem, tempo, acoes, cliques: 0, gravacao: false
    });
    const visitas = [
      visita(1, 'computador', 412000, 1, { capa: 9000, inicio: 21000, 'por-que-a-mfl': 38000, 'como-funciona': 44000, solucao: 96000, resultados: 31000, investimento: 142000, 'proximos-passos': 14000, aprovar: 17000 }, ['abriu-capa', 'aba:Outbound · BDR + SDR', 'aba:Tecnologia (CRM)', 'video', 'aprovar'], 2),
      visita(2, 'celular', 186000, 0.86, { capa: 6000, inicio: 15000, 'por-que-a-mfl': 22000, 'como-funciona': 18000, solucao: 41000, resultados: 12000, investimento: 72000 }, ['abriu-capa', 'pdf'], 20),
      visita(3, 'computador', 64000, 0.42, { capa: 12000, inicio: 18000, 'por-que-a-mfl': 16000, 'como-funciona': 18000 }, ['abriu-capa'], 49)
    ];
    const cliques = [];
    const nuvem = (s, cx, cy, n, d, esp = 0.06) => { for (let i = 0; i < n; i += 1) cliques.push({ s, x: Math.min(1, Math.max(0, cx + (aleat() - 0.5) * esp * 2)), y: Math.min(1, Math.max(0, cy + (aleat() - 0.5) * esp * 2)), d }); };
    nuvem('solucao', 0.42, 0.1, 14, 'computador', 0.05); nuvem('solucao', 0.58, 0.1, 9, 'computador', 0.04);
    nuvem('investimento', 0.68, 0.32, 16, 'computador'); nuvem('investimento', 0.3, 0.3, 7, 'computador');
    nuvem('investimento', 0.5, 0.78, 6, 'computador', 0.08); nuvem('resultados', 0.5, 0.4, 8, 'computador', 0.05);
    nuvem('aprovar', 0.32, 0.55, 6, 'computador', 0.03); nuvem('inicio', 0.24, 0.62, 5, 'computador', 0.05);
    nuvem('investimento', 0.5, 0.25, 10, 'celular', 0.1); nuvem('solucao', 0.5, 0.06, 6, 'celular', 0.08);
    const meta = { id: 'demo', cliente: 'Empresa Exemplo', criadoEm: new Date((agora - 3 * 86400) * 1000).toISOString(), criadoPor: 'felipepessoa@agenciamfl.com.br', atualizadoEm: new Date((agora - 3 * 86400) * 1000).toISOString() };
    return {
      lista: [
        { ...meta, aberturas: 3, visitantes: 2, ultimaAbertura: visitas[0].fim, tempoTotal: 662000, rolagem: 1, aprovou: true, status: 'engajada' },
        { id: 'exemplo002', cliente: 'Construtora Horizonte', atualizadoEm: new Date((agora - 86400) * 1000).toISOString(), aberturas: 1, visitantes: 1, ultimaAbertura: agora - 7200, tempoTotal: 95000, rolagem: 0.55, aprovou: false, status: 'aberta' },
        { id: 'exemplo003', cliente: 'Clínica Bem Viver', atualizadoEm: new Date((agora - 3600) * 1000).toISOString(), aberturas: 0, visitantes: 0, ultimaAbertura: null, tempoTotal: 0, rolagem: 0, aprovou: false, status: 'nao-aberta' }
      ],
      detalhe: { meta, status: 'engajada', visitas, cliques }
    };
  }

  async function carregarLista() {
    try {
      propostas = (await api('acompanhamento.php')).propostas || [];
    } catch (e) {
      if (e.message !== 'sem-servidor') { $('lista').replaceChildren(el('p', { class: 'vazio', text: e.message })); return; }
      demo = true;
      $('aviso-demo').hidden = false;
      $('voltar-editor').href = 'editor.html';
      propostas = dadosDemo().lista;
    }
    desenharLista();
    const inicial = params.get('id') || (demo ? 'demo' : null);
    if (inicial && propostas.some((p) => p.id === inicial)) abrir(inicial);
  }

  /* ---------- lista ---------- */

  function desenharLista() {
    const busca = normalizar($('busca').value);
    const itens = propostas.filter((p) => (!filtro || p.status === filtro) && (!busca || normalizar(p.cliente).includes(busca)));
    if (!itens.length) {
      $('lista').replaceChildren(el('p', { class: 'vazio', text: propostas.length ? 'Nenhuma proposta neste filtro.' : 'Nenhuma proposta publicada ainda.' }));
      return;
    }
    $('lista').replaceChildren(...itens.map((p) => el('button', { type: 'button', class: `item${atual?.meta.id === p.id ? ' ativo' : ''}`, 'data-id': p.id, onclick: () => abrir(p.id) },
      el('span', { class: 'item-topo' }, el('i', { class: `ponto ${p.status}`, title: STATUS[p.status] }), el('strong', { text: p.cliente || '(sem nome)' })),
      el('small', { text: p.aberturas ? `${p.aberturas} ${p.aberturas === 1 ? 'abertura' : 'aberturas'} · ${relativo(p.ultimaAbertura)} · ${duracao(p.tempoTotal)} de leitura` : `Não aberta · publicada ${relativo(Date.parse(p.atualizadoEm) / 1000)}` }))));
  }

  $('busca').addEventListener('input', desenharLista);
  document.querySelectorAll('.filtros button').forEach((b) => b.addEventListener('click', () => {
    filtro = b.dataset.filtro;
    document.querySelectorAll('.filtros button').forEach((x) => x.classList.toggle('ativo', x === b));
    desenharLista();
  }));

  /* ---------- detalhe ---------- */

  async function abrir(id) {
    try {
      if (demo) {
        const item = propostas.find((p) => p.id === id);
        atual = id === 'demo' ? dadosDemo().detalhe : { meta: item, status: 'nao-aberta', visitas: [], cliques: [] };
      } else atual = await api(`acompanhamento.php?id=${id}`);
    } catch (e) { alert(e.message); return; }
    if (!demo) history.replaceState(null, '', `mapa.php?id=${id}`);
    $('sem-selecao').hidden = true;
    $('conteudo').hidden = false;
    desenharLista();
    desenharCabecalho();
    desenharRelatorio();
    desenharGravacoes();
    if (abaAtual === 'calor') montarMapa();
  }

  function desenharCabecalho() {
    const { meta, status, visitas } = atual;
    $('det-status').className = `status-chip ${status}`;
    $('det-status').textContent = STATUS[status];
    $('det-cliente').textContent = meta.cliente || '(sem nome do cliente)';
    $('det-info').textContent = `Publicada em ${new Date(meta.criadoEm || meta.atualizadoEm).toLocaleDateString('pt-BR')}${meta.criadoPor ? ` por ${meta.criadoPor}` : ''}`;
    $('det-url').value = linkDe(meta.id === 'demo' ? 'demo' : meta.id);
    $('det-abrir').href = $('det-url').value;

    const ativo = visitas.reduce((s, v) => s + v.ativo, 0);
    const visitantes = new Set(visitas.map((v) => v.visitante).filter(Boolean)).size || visitas.length;
    const aprovou = visitas.filter((v) => v.acoes.includes('aprovar')).length;
    const kpi = (rotulo, valor, sub, destaque) => el('div', { class: `kpi${destaque ? ' destaque' : ''}` }, el('span', { text: rotulo }), el('strong', { text: valor }), el('small', { text: sub }));
    $('kpis').replaceChildren(
      kpi('Aberturas', String(visitas.length), visitas.length ? `última ${relativo(Math.max(...visitas.map((v) => v.fim)))}` : 'ainda não abriu'),
      kpi('Pessoas', String(visitas.length ? visitantes : 0), 'aparelhos diferentes'),
      kpi('Tempo de leitura', duracao(ativo), visitas.length ? `média de ${duracao(ativo / visitas.length)} por visita` : '—'),
      kpi('Rolagem máxima', pct(Math.max(0, ...visitas.map((v) => v.rolagem))), 'da proposta vista'),
      kpi('Aprovar', aprovou ? 'Clicou' : 'Ainda não', aprovou ? `${aprovou} ${aprovou === 1 ? 'vez' : 'vezes'}` : 'botão de aprovar', aprovou > 0)
    );
  }

  function desenharRelatorio() {
    const { visitas } = atual;
    // atenção por seção: % das visitas que passaram pelo menos 2 s na seção e tempo médio (de quem viu)
    const linhas = ORDEM.map((id) => {
      const viram = visitas.filter((v) => (v.tempo[id] || 0) >= 2000);
      const total = viram.reduce((s, v) => s + v.tempo[id], 0);
      return { id, alcance: visitas.length ? viram.length / visitas.length : 0, medio: viram.length ? total / viram.length : 0 };
    }).filter((l) => l.alcance > 0 || ['inicio', 'solucao', 'investimento', 'aprovar'].includes(l.id));
    $('secoes').replaceChildren(...(visitas.length ? linhas.map((l) => el('div', { class: 'secao-linha' },
      el('b', { text: NOMES[l.id] }),
      el('div', { class: 'barra', title: `${pct(l.alcance)} das visitas` }, el('i', { style: `width:${Math.round(l.alcance * 100)}%` })),
      el('span', { text: l.alcance ? `${pct(l.alcance)} · ${duracao(l.medio)}` : '—' }))) : [el('p', { class: 'vazio', text: 'Sem visitas ainda.' })]));

    // ações
    const contagem = {};
    visitas.forEach((v) => v.acoes.forEach((a) => { contagem[a] = (contagem[a] || 0) + 1; }));
    const nomeAcao = (a) => ACOES[a] || (a.startsWith('aba:') ? `Abriu a aba ${a.slice(4)}` : a.startsWith('duvida:') ? `Abriu a dúvida “${a.slice(7)}”` : a);
    const ordem = Object.keys(contagem).sort((a, b) => (b === 'aprovar') - (a === 'aprovar') || contagem[b] - contagem[a]);
    $('acoes').replaceChildren(...(ordem.length ? ordem.map((a) => el('li', { class: a === 'aprovar' ? 'forte' : '' }, el('span', { text: nomeAcao(a) }), el('strong', { text: `${contagem[a]}×` })))
      : [el('li', {}, el('span', { text: 'Nenhuma ação registrada ainda.' }))]));

    // visitas
    $('visitas').replaceChildren(...(visitas.length ? visitas.map((v) => {
      const top = Object.entries(v.tempo).sort((a, b) => b[1] - a[1])[0];
      return el('tr', {},
        el('td', { text: dataHora(v.inicio) }),
        el('td', { text: v.dispositivo === 'celular' ? 'Celular' : 'Computador' }),
        el('td', { text: duracao(v.ativo) }),
        el('td', { text: pct(v.rolagem) }),
        el('td', { text: top ? `${NOMES[top[0]] || top[0]} (${duracao(top[1])})` : '—' }),
        el('td', { text: v.origem || 'link direto' }),
        el('td', {}, v.gravacao ? el('button', { type: 'button', text: 'Assistir', onclick: () => { trocarAba('gravacoes'); assistir(v.visita); } }) : ''));
    }) : [el('tr', {}, el('td', { colspan: '7', class: 'vazio', text: 'O cliente ainda não abriu esta proposta.' }))]));
  }

  /* ---------- abas ---------- */

  let abaAtual = 'relatorio';
  function trocarAba(aba) {
    abaAtual = aba;
    document.querySelectorAll('.abas button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.aba === aba)));
    document.querySelectorAll('.aba-painel').forEach((p) => { p.hidden = p.dataset.aba !== aba; });
    if (aba === 'calor') montarMapa();
  }
  document.querySelectorAll('.abas button').forEach((b) => b.addEventListener('click', () => trocarAba(b.dataset.aba)));

  /* ---------- mapa de calor ---------- */

  const LARGURA = { computador: 1280, celular: 390 };
  const ALTURA = { computador: 800, celular: 844 };
  let frameCarregado = '';

  function montarMapa() {
    if (!atual) return;
    const frame = $('calor-frame');
    const largura = LARGURA[aparelho];
    frame.style.width = `${largura}px`;
    frame.style.height = `${ALTURA[aparelho]}px`;
    ajustarEscala();
    const src = `index.html?p=${encodeURIComponent(atual.meta.id)}&preview=1&mapa=1&d=${aparelho}`;
    if (frameCarregado !== src) {
      frameCarregado = src;
      frame.onload = () => { [400, 1500, 3500].forEach((t) => setTimeout(desenharMapa, t)); };
      frame.src = src;
    } else desenharMapa();
  }

  // a proposta aparece no tamanho real do aparelho, reduzida para caber na tela
  function ajustarEscala() {
    const caixa = $('palco-caixa');
    const largura = LARGURA[aparelho];
    const disponivel = $('palco').clientWidth - 32;
    const escala = Math.min(1, disponivel / largura);
    caixa.style.transform = `scale(${escala})`;
    caixa.style.width = `${largura}px`;
    caixa.style.height = `${ALTURA[aparelho]}px`;
    $('palco').style.height = `${ALTURA[aparelho] * escala + 32}px`;
  }
  addEventListener('resize', () => { if (abaAtual === 'calor') ajustarEscala(); });

  function paleta() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 1;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 256, 0);
    [[0, '#2B6CFF'], [0.3, '#00E5FF'], [0.55, '#39D353'], [0.8, '#FFD400'], [1, '#FF2D2D']].forEach(([p, cor]) => grad.addColorStop(p, cor));
    g.fillStyle = grad; g.fillRect(0, 0, 256, 1);
    return g.getImageData(0, 0, 256, 1).data;
  }
  const PALETA = paleta();

  function desenharMapa() {
    const frame = $('calor-frame');
    const doc = frame.contentDocument;
    if (!doc?.body || !doc.getElementById('conteudo')) return;
    const largura = doc.documentElement.scrollWidth;
    const altura = doc.documentElement.scrollHeight;
    let canvas = doc.getElementById('mapa-calor-camada');
    if (!canvas) {
      canvas = doc.createElement('canvas');
      canvas.id = 'mapa-calor-camada';
      canvas.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:2147483000;';
      doc.body.append(canvas);
      const estilo = doc.createElement('style');
      estilo.textContent = '.barra-cta,.progresso-leitura{display:none!important}';
      doc.head.append(estilo);
    }
    canvas.width = largura; canvas.height = altura;
    canvas.style.width = `${largura}px`; canvas.style.height = `${altura}px`;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, largura, altura);
    const visitas = atual.visitas.filter((v) => v.dispositivo === aparelho);
    const caixaDe = (id) => {
      const n = doc.getElementById(id);
      if (!n || n.hidden) return null;
      const r = n.getBoundingClientRect();
      const sx = frame.contentWindow.scrollX;
      const sy = frame.contentWindow.scrollY;
      return r.height > 0 ? { x: r.left + sx, y: r.top + sy, w: r.width, h: r.height } : null;
    };

    if (tipoMapa === 'cliques') {
      const pontos = atual.cliques.filter((p) => p.d === aparelho).map((p) => {
        const b = caixaDe(p.s);
        return b ? [b.x + p.x * b.w, b.y + p.y * b.h] : null;
      }).filter(Boolean);
      $('calor-info').textContent = `${pontos.length} ${pontos.length === 1 ? 'clique' : 'cliques'} em ${visitas.length} ${visitas.length === 1 ? 'visita' : 'visitas'} no ${aparelho}`;
      desenharCalor(ctx, pontos, largura, altura);
    } else {
      desenharAtencao(ctx, visitas, caixaDe, largura, altura);
      $('calor-info').textContent = `${visitas.length} ${visitas.length === 1 ? 'visita' : 'visitas'} no ${aparelho}`;
    }
  }

  // mapa de calor de cliques: manchas acumuladas e coloridas do azul (pouco) ao vermelho (muito)
  function desenharCalor(ctx, pontos, largura, altura) {
    if (!pontos.length) return;
    const raio = aparelho === 'celular' ? 26 : 34;
    const mancha = document.createElement('canvas');
    mancha.width = mancha.height = raio * 2;
    const m = mancha.getContext('2d');
    const g = m.createRadialGradient(raio, raio, 0, raio, raio, raio);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g; m.fillRect(0, 0, raio * 2, raio * 2);
    const intensidade = Math.min(0.65, Math.max(0.2, 4.5 / Math.sqrt(pontos.length)));
    ctx.globalAlpha = intensidade;
    pontos.forEach(([x, y]) => ctx.drawImage(mancha, x - raio, y - raio));
    ctx.globalAlpha = 1;
    // colore só a faixa que tem pontos
    const ys = pontos.map((p) => p[1]);
    const y0 = Math.max(0, Math.floor(Math.min(...ys) - raio));
    const y1 = Math.min(altura, Math.ceil(Math.max(...ys) + raio));
    const img = ctx.getImageData(0, y0, largura, y1 - y0);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) {
      const a = d[i];
      if (!a) continue;
      const k = a * 4;
      d[i - 3] = PALETA[k]; d[i - 2] = PALETA[k + 1]; d[i - 1] = PALETA[k + 2];
      d[i] = Math.min(235, a * 1.6 + 30);
    }
    ctx.putImageData(img, 0, y0);
  }

  // mapa de rolagem e atenção: cada seção pintada pela fatia de visitas que chegou nela, com o tempo médio
  function desenharAtencao(ctx, visitas, caixaDe, largura, altura) {
    const total = visitas.length;
    ORDEM.forEach((id) => {
      const b = caixaDe(id);
      if (!b) return;
      // chegou na seção: rolou até o começo dela ou ficou lendo nela
      const chegaram = visitas.filter((v) => v.rolagem >= Math.min(1, (b.y + 120) / altura) || (v.tempo[id] || 0) >= 1000);
      const viram = visitas.filter((v) => (v.tempo[id] || 0) >= 2000);
      const alcance = total ? chegaram.length / total : 0;
      const medio = viram.length ? viram.reduce((s, v) => s + v.tempo[id], 0) / viram.length : 0;
      const k = Math.round(alcance * 255) * 4;
      ctx.fillStyle = `rgba(${PALETA[k]},${PALETA[k + 1]},${PALETA[k + 2]},${total ? 0.32 : 0.12})`;
      ctx.fillRect(0, b.y, largura, b.h);
      // etiqueta
      const texto = total ? `${NOMES[id]} · ${Math.round(alcance * 100)}% das visitas chegaram${medio ? ` · ${duracao(medio)} em média` : ''}` : NOMES[id];
      ctx.font = '700 15px "Plus Jakarta Sans", system-ui, sans-serif';
      const w = ctx.measureText(texto).width + 28;
      ctx.fillStyle = 'rgba(10,21,48,.92)';
      const x = 16;
      const y = b.y + 14;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, w, 34, 17) : ctx.rect(x, y, w, 34);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(texto, x + 14, y + 22);
    });
  }

  document.querySelectorAll('[data-tipo]').forEach((b) => b.addEventListener('click', () => {
    tipoMapa = b.dataset.tipo;
    document.querySelectorAll('[data-tipo]').forEach((x) => x.classList.toggle('ativo', x === b));
    $('legenda').hidden = false;
    desenharMapa();
  }));
  document.querySelectorAll('[data-aparelho]').forEach((b) => b.addEventListener('click', () => {
    aparelho = b.dataset.aparelho;
    document.querySelectorAll('[data-aparelho]').forEach((x) => x.classList.toggle('ativo', x === b));
    montarMapa();
  }));

  /* ---------- gravações ---------- */

  function desenharGravacoes() {
    const gravadas = atual.visitas.filter((v) => v.gravacao);
    $('gravacoes-lista').replaceChildren(...(gravadas.length ? gravadas.map((v) => el('button', { type: 'button', class: 'grav-item', 'data-visita': v.visita, onclick: () => assistir(v.visita) },
      el('strong', { text: dataHora(v.inicio) }),
      el('small', { text: `${v.dispositivo === 'celular' ? 'Celular' : 'Computador'} · ${duracao(v.ativo)} de leitura · ${pct(v.rolagem)} rolada` })))
      : [el('p', { class: 'vazio', text: demo ? 'As gravações aparecem aqui no site hospedado, assim que o cliente abrir a proposta.' : 'Nenhuma visita gravada ainda.' })]));
    $('player').replaceChildren(el('p', { class: 'vazio', text: gravadas.length ? 'Escolha uma visita para assistir.' : '' }));
  }

  async function assistir(visita) {
    document.querySelectorAll('.grav-item').forEach((b) => b.classList.toggle('ativo', b.dataset.visita === visita));
    const caixa = $('player');
    caixa.replaceChildren(el('p', { class: 'vazio', text: 'Carregando gravação…' }));
    try {
      const { eventos } = await api(`gravacao.php?id=${atual.meta.id}&visita=${visita}`);
      const Player = window.rrwebPlayer?.default || window.rrwebPlayer;
      if (!Player) throw new Error('Player de gravação não carregou.');
      caixa.replaceChildren();
      try { player?.$destroy?.(); } catch (e) { /* já destruído */ }
      const largura = Math.max(320, caixa.clientWidth - 8);
      player = new Player({ target: caixa, props: { events: eventos, width: largura, height: Math.round(largura * 0.56), autoPlay: true, skipInactive: true, showController: true, speedOption: [1, 2, 4, 8] } });
    } catch (e) {
      caixa.replaceChildren(el('p', { class: 'vazio', text: e.message }));
    }
  }

  /* ---------- link ---------- */

  $('det-copiar').addEventListener('click', async (e) => {
    try { await navigator.clipboard.writeText($('det-url').value); } catch (err) { $('det-url').select(); document.execCommand('copy'); }
    e.currentTarget.textContent = 'Copiado!';
    setTimeout(() => { $('det-copiar').textContent = 'Copiar'; }, 1500);
  });

  carregarLista();
})();
