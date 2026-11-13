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
  const STATUS = { engajada: 'Quente', aberta: 'Aberta', 'nao-aberta': 'Não aberta' };

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

  // Dados de exemplo (prévia sem servidor): a proposta "demo" com visitas simuladas em vários dias
  function dadosDemo() {
    const agora = Math.floor(Date.now() / 1000);
    let semente = 7;
    const aleat = () => (semente = (semente * 9301 + 49297) % 233280) / 233280;
    const visita = (i, disp, diasAtras, hora, ativo, rolagem, tempo, acoes, origem) => {
      const d = new Date(); d.setDate(d.getDate() - diasAtras); d.setHours(hora, Math.floor(aleat() * 50), 0, 0);
      const inicio = Math.min(agora - 600, Math.floor(d.getTime() / 1000));
      let t = inicio + 12;
      return {
        visita: `demo${String(i).padStart(8, '0')}`, visitante: i % 3 === 0 ? 'demo-b' : 'demo-a', dispositivo: disp, origem,
        inicio, fim: inicio + Math.round(ativo / 1000), ativo, rolagem, tempo, acoes,
        eventos: acoes.map((a) => ({ a, t: (t += 25 + Math.floor(aleat() * 60)) })), cliques: 0, gravacao: false
      };
    };
    const visitas = [
      visita(1, 'computador', 0, 10, 412000, 1, { capa: 9000, inicio: 21000, 'por-que-a-mfl': 38000, 'como-funciona': 44000, solucao: 96000, resultados: 31000, investimento: 142000, 'proximos-passos': 14000, aprovar: 17000 }, ['abriu-capa', 'aba:Outbound · BDR + SDR', 'aba:Tecnologia (CRM)', 'video', 'aprovar'], 'web.whatsapp.com'),
      visita(2, 'celular', 1, 21, 186000, 0.86, { capa: 6000, inicio: 15000, 'por-que-a-mfl': 22000, 'como-funciona': 18000, solucao: 41000, resultados: 12000, investimento: 72000 }, ['abriu-capa', 'pdf'], ''),
      visita(3, 'computador', 2, 15, 132000, 0.74, { capa: 7000, inicio: 16000, 'por-que-a-mfl': 19000, solucao: 38000, investimento: 52000 }, ['abriu-capa', 'aba:Outbound · BDR + SDR'], 'web.whatsapp.com'),
      visita(4, 'celular', 4, 8, 58000, 0.4, { capa: 8000, inicio: 20000, 'por-que-a-mfl': 18000, 'como-funciona': 12000 }, ['abriu-capa'], ''),
      visita(5, 'computador', 6, 11, 205000, 0.92, { capa: 6000, inicio: 18000, 'por-que-a-mfl': 24000, 'como-funciona': 21000, solucao: 52000, resultados: 26000, investimento: 58000 }, ['abriu-capa', 'video'], 'web.whatsapp.com'),
      visita(6, 'computador', 9, 16, 64000, 0.42, { capa: 12000, inicio: 18000, 'por-que-a-mfl': 16000, 'como-funciona': 18000 }, ['abriu-capa'], 'mail.google.com'),
      visita(7, 'celular', 11, 19, 41000, 0.3, { capa: 9000, inicio: 21000, 'por-que-a-mfl': 11000 }, ['abriu-capa'], '')
    ];
    const cliques = [];
    const nuvem = (s, cx, cy, n, d, esp = 0.06) => { for (let i = 0; i < n; i += 1) cliques.push({ s, x: Math.min(1, Math.max(0, cx + (aleat() - 0.5) * esp * 2)), y: Math.min(1, Math.max(0, cy + (aleat() - 0.5) * esp * 2)), d }); };
    nuvem('solucao', 0.42, 0.1, 14, 'computador', 0.05); nuvem('solucao', 0.58, 0.1, 9, 'computador', 0.04);
    nuvem('investimento', 0.68, 0.32, 16, 'computador'); nuvem('investimento', 0.3, 0.3, 7, 'computador');
    nuvem('investimento', 0.5, 0.78, 6, 'computador', 0.08); nuvem('resultados', 0.5, 0.4, 8, 'computador', 0.05);
    nuvem('aprovar', 0.32, 0.55, 6, 'computador', 0.03); nuvem('inicio', 0.24, 0.62, 5, 'computador', 0.05);
    nuvem('investimento', 0.5, 0.25, 10, 'celular', 0.1); nuvem('solucao', 0.5, 0.06, 6, 'celular', 0.08);
    const criado = new Date((agora - 12 * 86400) * 1000).toISOString();
    const meta = { id: 'demo', cliente: 'Empresa Exemplo', criadoEm: criado, criadoPor: 'felipepessoa@agenciamfl.com.br', atualizadoEm: criado };
    const total = visitas.reduce((s, v) => s + v.ativo, 0);
    return {
      lista: [
        { ...meta, aberturas: visitas.length, visitantes: 2, ultimaAbertura: visitas[0].fim, tempoTotal: total, rolagem: 1, aprovou: true, status: 'engajada' },
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
      $('link-editor').href = 'editor.html';
      $('topo-editor').href = 'editor.html';
      $('sair').hidden = true;
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

  /* ---------- visão geral (painel em blocos) ---------- */

  const NS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}, ...filhos) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => v != null && n.setAttribute(k, v));
    filhos.flat().forEach((f) => f != null && n.append(f instanceof Node ? f : String(f)));
    return n;
  };
  const ICONES = {
    olho: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    relogio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    rolagem: 'M12 3v18M7 16l5 5 5-5M8 7h8',
    check: 'M20 6 9 17l-5-5',
    seta: 'M7 17 17 7M9 7h8v8',
    abrir: 'M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5',
    clique: 'M9 9l11 4-5 2-2 5zM4 4l2.5 2.5M9 2v3M2 9h3',
    pdf: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M12 12v6M9 15l3 3 3-3',
    video: 'M2.5 7a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2zM10 9l5 3-5 3z',
    whats: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
    aba: 'M3 6h7l2 3h9v10H3z',
    duvida: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01'
  };
  const icone = (nome) => svg('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, svg('path', { d: ICONES[nome] }));

  // Pontuação de interesse (regras, sem IA): aberturas, leitura, rolagem, tempo no Investimento e Aprovar
  function pontuacao(visitas) {
    if (!visitas.length) return 0;
    const ativo = visitas.reduce((s, v) => s + v.ativo, 0);
    const invest = visitas.reduce((s, v) => s + (v.tempo.investimento || 0), 0);
    const aprovou = visitas.some((v) => v.acoes.includes('aprovar'));
    const p = Math.min(25, visitas.length * 7) + Math.min(25, (ativo / 60000) * 4) + Math.max(...visitas.map((v) => v.rolagem)) * 15
      + Math.min(15, invest / 8000) + (aprovou ? 20 : 0);
    return Math.round(Math.min(100, p));
  }
  const nivel = (p) => (p >= 65 ? 'Quente' : p >= 35 ? 'Morno' : 'Frio');

  function desenharCabecalho() {
    const { meta, status } = atual;
    $('det-status').className = `status-chip ${status}`;
    $('det-status').textContent = STATUS[status];
    $('det-cliente').textContent = meta.cliente || '(sem nome do cliente)';
    $('det-info').textContent = `Publicada em ${new Date(meta.criadoEm || meta.atualizadoEm).toLocaleDateString('pt-BR')}${meta.criadoPor ? ` por ${meta.criadoPor}` : ''}`;
    $('det-url').value = linkDe(meta.id);
    $('det-abrir').href = $('det-url').value;
  }

  function desenharRelatorio() {
    const { visitas } = atual;
    desenharKpis(visitas);
    desenharMedidor(visitas);
    desenharGrafico(visitas);
    desenharHorarios(visitas);
    desenharDestaque(visitas);
    desenharSecoes(visitas);
    desenharRosca(visitas);
    desenharFeed(visitas);
    desenharTabela(visitas);
  }

  function desenharKpis(visitas) {
    const agora = Date.now() / 1000;
    const ativo = visitas.reduce((s, v) => s + v.ativo, 0);
    const pessoas = new Set(visitas.map((v) => v.visitante).filter(Boolean)).size || visitas.length;
    const ultimas24 = visitas.filter((v) => agora - v.inicio < 86400).length;
    const rolagem = Math.max(0, ...visitas.map((v) => v.rolagem));
    const aprovou = visitas.filter((v) => v.acoes.includes('aprovar')).length;
    const kpi = ({ rotulo, ic, valor, chip, chipTipo, sub, classe }) => el('article', { class: `cartao kpi ${classe || ''}` },
      el('div', { class: 'kpi-topo' }, el('span', { class: 'kpi-rotulo' }, el('span', { class: 'kpi-icone' }, icone(ic)), rotulo), el('span', { class: 'kpi-seta' }, icone('seta'))),
      el('div', {}, el('div', { class: 'kpi-valor' }, el('strong', { text: valor }), chip && el('span', { class: `chip ${chipTipo || ''}`, text: chip })), el('small', { text: sub })));
    $('kpis').replaceChildren(
      kpi({ rotulo: 'Aberturas', ic: 'olho', valor: String(visitas.length), chip: ultimas24 ? `+${ultimas24} em 24 h` : null, chipTipo: 'bom', sub: visitas.length ? `${pessoas} ${pessoas === 1 ? 'pessoa' : 'pessoas'} · última ${relativo(Math.max(...visitas.map((v) => v.fim)))}` : 'ainda não abriu' }),
      kpi({ rotulo: 'Tempo de leitura', ic: 'relogio', valor: duracao(ativo), chip: visitas.length ? `${duracao(ativo / visitas.length)}/visita` : null, sub: 'soma de todas as visitas' }),
      kpi({ rotulo: 'Rolagem máxima', ic: 'rolagem', valor: pct(rolagem), chip: rolagem >= 0.95 ? 'leu até o fim' : rolagem ? 'não chegou ao fim' : null, chipTipo: rolagem >= 0.95 ? 'bom' : 'alerta', sub: 'da proposta vista' }),
      kpi({ rotulo: 'Aprovar', ic: 'check', valor: aprovou ? 'Clicou' : 'Ainda não', chip: aprovou ? `${aprovou}×` : null, chipTipo: 'bom', sub: aprovou ? 'clicou no botão de aprovar' : 'botão de aprovar', classe: aprovou ? 'aprovou' : '' })
    );
  }

  // arco de 22 segmentos, como um velocímetro
  function desenharMedidor(visitas) {
    const p = pontuacao(visitas);
    const n = 22;
    const cx = 120; const cy = 118; const r1 = 82; const r2 = 108;
    const pecas = [];
    for (let i = 0; i < n; i += 1) {
      const a0 = Math.PI + (i / n) * Math.PI + 0.025;
      const a1 = Math.PI + ((i + 1) / n) * Math.PI - 0.025;
      const ponto = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      const ligado = (i + 0.5) / n <= p / 100;
      const cor = ligado ? (p >= 65 ? '#39D353' : p >= 35 ? '#F5A524' : '#5B8CFF') : 'rgba(157,189,255,.12)';
      pecas.push(svg('path', { d: `M${ponto(r1, a0)} L${ponto(r2, a0)} A${r2},${r2} 0 0 1 ${ponto(r2, a1)} L${ponto(r1, a1)} A${r1},${r1} 0 0 0 ${ponto(r1, a0)} Z`, fill: cor, stroke: 'none' }));
    }
    $('medidor').replaceChildren(svg('svg', { viewBox: '0 0 240 130', role: 'img', 'aria-label': `Interesse ${p} de 100` },
      ...pecas,
      svg('text', { x: cx, y: cy - 22, 'text-anchor': 'middle', class: 'medidor-valor' }, String(p)),
      svg('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', class: 'medidor-rotulo' }, visitas.length ? nivel(p) : 'Sem visitas')));
    $('medidor-nota').textContent = 'Calculado pelas aberturas, tempo de leitura, rolagem, tempo no Investimento e clique em Aprovar.';
  }

  // leitura (minutos) por dia nos últimos 14 dias, em linha suave com área
  function desenharGrafico(visitas) {
    const dias = [];
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i -= 1) { const d = new Date(hoje); d.setDate(d.getDate() - i); dias.push({ d, min: 0 }); }
    visitas.forEach((v) => {
      const d = new Date(v.inicio * 1000); d.setHours(0, 0, 0, 0);
      const alvo = dias.find((x) => x.d.getTime() === d.getTime());
      if (alvo) alvo.min += v.ativo / 60000;
    });
    const W = Math.max(320, Math.round($('grafico').clientWidth || 640)); const H = 200; const esq = 34; const dir = 14; const topo = 34; const base = 26;
    const max = Math.max(1, ...dias.map((x) => x.min));
    const teto = max <= 1 ? 1 : Math.ceil(max / 2) * 2;
    const rotuloEixo = (v) => (v === 0 ? '0' : v < 1 ? `${Math.round(v * 60)}s` : Number.isInteger(v) ? `${v}m` : `${v.toFixed(1)}m`);
    const X = (i) => esq + (i / (dias.length - 1)) * (W - esq - dir);
    const Y = (m) => topo + (1 - m / teto) * (H - topo - base);
    const pts = dias.map((x, i) => [X(i), Y(x.min)]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const [x0, y0] = pts[Math.max(0, i - 1)]; const [x1, y1] = pts[i]; const [x2, y2] = pts[i + 1]; const [x3, y3] = pts[Math.min(pts.length - 1, i + 2)];
      d += ` C${x1 + (x2 - x0) / 6},${Math.min(H - base, y1 + (y2 - y0) / 6)} ${x2 - (x3 - x1) / 6},${Math.min(H - base, y2 - (y3 - y1) / 6)} ${x2},${y2}`;
    }
    const filhos = [
      svg('defs', {}, svg('linearGradient', { id: 'area-verde', x1: '0', y1: '0', x2: '0', y2: '1' },
        svg('stop', { offset: '0', 'stop-color': '#39D353', 'stop-opacity': '.35' }), svg('stop', { offset: '1', 'stop-color': '#39D353', 'stop-opacity': '0' })))
    ];
    for (let g = 0; g <= 4; g += 1) {
      const v = (teto / 4) * g;
      filhos.push(svg('line', { x1: esq, x2: W - dir, y1: Y(v), y2: Y(v), class: 'grade' }));
      filhos.push(svg('text', { x: esq - 8, y: Y(v) + 3, 'text-anchor': 'end', class: 'eixo' }, rotuloEixo(v)));
    }
    dias.forEach((x, i) => { if (i % 2 === 1 || i === dias.length - 1) filhos.push(svg('text', { x: X(i), y: H - 6, 'text-anchor': 'middle', class: 'eixo' }, String(x.d.getDate()))); });
    filhos.push(svg('path', { d: `${d} L${X(dias.length - 1)},${H - base} L${X(0)},${H - base} Z`, fill: 'url(#area-verde)', stroke: 'none' }));
    filhos.push(svg('path', { d, class: 'linha' }));
    // pico com etiqueta
    const iPico = dias.reduce((m, x, i) => (x.min > dias[m].min ? i : m), 0);
    if (dias[iPico].min > 0) {
      const [px, py] = pts[iPico];
      filhos.push(svg('line', { x1: px, x2: px, y1: py, y2: H - base, stroke: 'rgba(57,211,83,.35)', 'stroke-dasharray': '3 4' }));
      const txt = duracao(dias[iPico].min * 60000);
      const w = txt.length * 6.4 + 16;
      const lx = Math.min(W - dir - w / 2, Math.max(esq + w / 2, px));
      filhos.push(svg('rect', { x: lx - w / 2, y: py - 32, width: w, height: 22, rx: 11, fill: '#EEF2FA' }));
      filhos.push(svg('text', { x: lx, y: py - 17, 'text-anchor': 'middle', class: 'rotulo-pico', fill: '#050A18' }, txt));
      filhos.push(svg('circle', { cx: px, cy: py, r: 5, class: 'ponto-g' }));
    }
    $('grafico').replaceChildren(svg('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': 'Tempo de leitura por dia' }, ...filhos));
  }

  // grade dia da semana × período do dia
  function desenharHorarios(visitas) {
    const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const FAIXAS = [['Manhã', 6, 12], ['Tarde', 12, 18], ['Noite', 18, 24], ['Madrugada', 0, 6]];
    const conta = FAIXAS.map(() => Array(7).fill(0));
    visitas.forEach((v) => {
      const d = new Date(v.inicio * 1000);
      const h = d.getHours();
      const f = FAIXAS.findIndex(([, a, b]) => h >= a && h < b);
      conta[f][d.getDay()] += 1;
    });
    const max = Math.max(1, ...conta.flat());
    const filhos = [el('span'), ...DIAS.map((d) => el('span', { class: 'dia', text: d }))];
    FAIXAS.forEach(([nome], f) => {
      filhos.push(el('span', { text: nome }));
      conta[f].forEach((n) => filhos.push(el('i', { class: `celula${n ? ` n${Math.ceil((n / max) * 3)}` : ''}`, title: `${n} ${n === 1 ? 'abertura' : 'aberturas'}` })));
    });
    $('horarios').replaceChildren(...filhos);
    const total = visitas.length || 1;
    const por = (a, b) => visitas.filter((v) => { const h = new Date(v.inicio * 1000).getHours(); return h >= a && h < b; }).length / total;
    const periodos = [['Manhã', por(6, 12)], ['Tarde', por(12, 18)], ['Noite', por(18, 24) + por(0, 6)]];
    $('periodos').replaceChildren(...periodos.map(([n, v]) => el('div', { class: 'periodo' }, el('i', {}, el('b', { style: `width:${Math.round(v * 100)}%` })), el('strong', { text: visitas.length ? pct(v) : '—' }), el('small', { text: n }))));
  }

  // frase de destaque calculada (sem IA) a partir do comportamento
  function desenharDestaque(visitas) {
    const p = pontuacao(visitas);
    const mediaDe = (id) => { const vs = visitas.filter((v) => (v.tempo[id] || 0) >= 2000); return vs.length ? vs.reduce((s, v) => s + v.tempo[id], 0) / vs.length : 0; };
    const top = ORDEM.filter((id) => id !== 'capa').map((id) => [id, mediaDe(id)]).sort((a, b) => b[1] - a[1])[0];
    const texto = $('destaque-texto');
    texto.replaceChildren();
    const frase = (...partes) => partes.forEach((pt) => texto.append(typeof pt === 'string' ? pt : el('b', { text: pt.b })));
    if (!visitas.length) frase('Ainda não abriu. Que tal ', { b: 'reenviar o link' }, ' pelo WhatsApp com uma mensagem curta?');
    else if (visitas.some((v) => v.acoes.includes('aprovar'))) frase('Clicou em ', { b: 'Aprovar' }, '. Hora de falar com o cliente e fechar.');
    else if (top && top[0] === 'investimento') frase('O ', { b: 'Investimento' }, ` foi a parte mais lida (${duracao(top[1])} em média). Bom momento pra conversar sobre valores.`);
    else if (!visitas.some((v) => (v.tempo.resultados || 0) >= 2000)) frase('Ainda não viu os ', { b: 'Resultados' }, '. Mande o vídeo de depoimento pra reforçar a prova social.');
    else if (top) frase('A seção mais lida foi ', { b: NOMES[top[0]] }, ` (${duracao(top[1])} em média).`);
    const on = Math.round((p / 100) * 14);
    $('destaque-barras').replaceChildren(...Array.from({ length: 14 }, (_, i) => el('i', { class: i < on ? 'on' : '' })));
  }

  function desenharSecoes(visitas) {
    const linhas = ORDEM.map((id) => {
      const viram = visitas.filter((v) => (v.tempo[id] || 0) >= 2000);
      const total = viram.reduce((s, v) => s + v.tempo[id], 0);
      return { id, alcance: visitas.length ? viram.length / visitas.length : 0, medio: viram.length ? total / viram.length : 0 };
    }).filter((l) => l.alcance > 0 || ['inicio', 'solucao', 'investimento', 'aprovar'].includes(l.id));
    $('secoes').replaceChildren(...(visitas.length ? linhas.map((l) => el('div', { class: 'secao-linha' },
      el('b', { text: NOMES[l.id] }),
      el('div', { class: 'barra', title: `${pct(l.alcance)} das visitas` }, el('i', { style: `width:${Math.round(l.alcance * 100)}%` })),
      el('span', { text: l.alcance ? `${pct(l.alcance)} · ${duracao(l.medio)}` : '—' }))) : [el('p', { class: 'vazio', text: 'Sem visitas ainda.' })]));
  }

  function desenharRosca(visitas) {
    const comp = visitas.filter((v) => v.dispositivo !== 'celular').length;
    const cel = visitas.length - comp;
    const total = visitas.length;
    const r = 52; const c = 2 * Math.PI * r;
    const arco = (frac, inicio, cor) => svg('circle', { cx: 65, cy: 65, r, fill: 'none', stroke: cor, 'stroke-width': 14, 'stroke-linecap': 'round',
      'stroke-dasharray': `${Math.max(0, frac * c - 6)} ${c}`, 'stroke-dashoffset': -inicio * c, transform: 'rotate(-90 65 65)' });
    const filhos = [svg('circle', { cx: 65, cy: 65, r, fill: 'none', stroke: 'rgba(157,189,255,.1)', 'stroke-width': 14 })];
    if (total) {
      if (comp) filhos.push(arco(comp / total, 0, '#39D353'));
      if (cel) filhos.push(arco(cel / total, comp / total, '#5B8CFF'));
    }
    filhos.push(svg('text', { x: 65, y: 66, 'text-anchor': 'middle', class: 'rosca-total' }, String(total)));
    filhos.push(svg('text', { x: 65, y: 84, 'text-anchor': 'middle', class: 'rosca-rotulo' }, total === 1 ? 'visita' : 'visitas'));
    const item = (cor, nome, n) => el('li', {}, el('span', {}, el('i', { style: `background:${cor}` }), nome), el('strong', { text: total ? `${n} · ${pct(n / total)}` : '0' }));
    $('rosca').replaceChildren(svg('svg', { viewBox: '0 0 130 130', role: 'img', 'aria-label': 'Visitas por aparelho' }, ...filhos),
      el('ul', {}, item('#39D353', 'Computador', comp), item('#5B8CFF', 'Celular', cel)));
  }

  function desenharFeed(visitas) {
    const itens = [];
    visitas.forEach((v) => {
      const aparelho = v.dispositivo === 'celular' ? 'celular' : 'computador';
      itens.push({ t: v.inicio, ic: 'abrir', cor: 'azul', titulo: 'Abriu a proposta', sub: `${aparelho}${v.origem ? ` · via ${v.origem.replace(/^web\./, '')}` : ''}` });
      (v.eventos || []).forEach((e) => {
        const a = e.a;
        if (a === 'abriu-capa') return;
        const base = { t: e.t, sub: aparelho };
        if (a === 'aprovar') itens.push({ ...base, ic: 'check', cor: 'verde', titulo: 'Clicou em Aprovar' });
        else if (a === 'whatsapp') itens.push({ ...base, ic: 'whats', cor: 'verde', titulo: 'Chamou no WhatsApp' });
        else if (a === 'pdf') itens.push({ ...base, ic: 'pdf', titulo: 'Salvou a proposta em PDF' });
        else if (a === 'video') itens.push({ ...base, ic: 'video', titulo: 'Assistiu ao vídeo de depoimento' });
        else if (a === 'email') itens.push({ ...base, ic: 'clique', titulo: 'Clicou no e-mail do responsável' });
        else if (a.startsWith('aba:')) itens.push({ ...base, ic: 'aba', titulo: `Abriu a aba ${a.slice(4)}` });
        else if (a.startsWith('duvida:')) itens.push({ ...base, ic: 'duvida', titulo: `Abriu a dúvida “${a.slice(7)}”` });
      });
    });
    itens.sort((a, b) => b.t - a.t);
    $('feed').replaceChildren(...(itens.length ? itens.slice(0, 14).map((i) => el('li', {},
      el('span', { class: `feed-icone ${i.cor || ''}` }, icone(i.ic)),
      el('div', {}, el('strong', { text: i.titulo }), el('small', { text: i.sub })),
      el('time', { text: relativo(i.t) }))) : [el('li', {}, el('span'), el('small', { class: 'vazio', text: 'Nenhuma atividade ainda.' }))]));
  }

  function desenharTabela(visitas) {
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
    document.querySelectorAll('.pilulas button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.aba === aba)));
    document.querySelectorAll('.aba-painel').forEach((p) => { p.hidden = p.dataset.aba !== aba; });
    if (aba === 'calor') montarMapa();
  }
  document.querySelectorAll('.pilulas button').forEach((b) => b.addEventListener('click', () => trocarAba(b.dataset.aba)));

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
  addEventListener('resize', () => {
    if (abaAtual === 'calor') ajustarEscala();
    else if (atual) desenharGrafico(atual.visitas);
  });

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

  // Sair: encerra a sessão e volta para a tela de login
  $('sair').addEventListener('click', async () => {
    try { await fetch('api/sair.php', { method: 'POST', headers: { 'X-MFL': '1' }, credentials: 'same-origin' }); } catch (e) { /* segue */ }
    location.href = 'mapa.php';
  });

  carregarLista();
})();
