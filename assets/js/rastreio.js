/*
 * Acompanhamento das visitas de uma proposta publicada (alimenta a tela de Mapa de calor).
 * Registra: abertura, tempo em cada seção, até onde rolou, cliques (posição relativa à seção,
 * para o mapa de calor funcionar em qualquer tela), ações (aprovar, WhatsApp, PDF, vídeo, abas)
 * e a gravação da visita (rrweb, com campos digitáveis mascarados).
 * Só roda em propostas publicadas; nunca na pré-visualização do editor.
 */
(() => {
  'use strict';

  const cfg = window.MFL_RASTREIO;
  if (!cfg || !/^[a-z0-9]{10}$/.test(cfg.id) || navigator.webdriver && !cfg.teste) return;

  const ENDPOINT = 'api/evento.php';
  const aleatorio = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
  let visitante = '';
  try {
    visitante = localStorage.getItem('mfl-visitante') || '';
    if (!/^[a-z0-9]{12}$/.test(visitante)) { visitante = aleatorio(12); localStorage.setItem('mfl-visitante', visitante); }
  } catch (e) { visitante = aleatorio(12); }
  const visita = aleatorio(12);
  const dispositivo = Math.min(screen.width, innerWidth) <= 760 ? 'celular' : 'computador';

  // buffers enviados em lotes
  let cliques = [];
  let acoes = [];
  let tempo = {};      // ms por seção desde o último envio
  let ativo = 0;       // ms de leitura ativa desde o último envio
  let rolagem = 0;     // maior fração da página já vista
  let gravacao = [];   // eventos do rrweb
  let ultimaInteracao = Date.now();

  const secaoDe = (no) => no?.closest?.('#conteudo > section[id], #rodape, #capa');

  function rolagemAtual() {
    const doc = document.documentElement;
    const total = doc.scrollHeight;
    return total > 0 ? Math.min(1, (scrollY + innerHeight) / total) : 0;
  }

  // ---------- cliques e ações ----------
  document.addEventListener('click', (e) => {
    ultimaInteracao = Date.now();
    const alvo = e.target;
    const sec = secaoDe(alvo);
    if (sec) {
      const r = sec.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        cliques.push({ s: sec.id, x: +((e.clientX - r.left) / r.width).toFixed(4), y: +((e.clientY - r.top) / r.height).toFixed(4) });
      }
    }
    const link = alvo.closest('a');
    let acao = null;
    if (alvo.closest('.capa-botao')) acao = 'abriu-capa';
    else if (link && /wa\.me/.test(link.href)) acao = link.closest('#aprovar .cta-botao, #barra-cta') ? 'aprovar' : 'whatsapp';
    else if (link && link.href.startsWith('mailto:')) acao = 'email';
    else if (alvo.closest('.rodape-pdf')) acao = 'pdf';
    else if (alvo.closest('.depoimento-video')) acao = 'video';
    else if (alvo.closest('.aba')) acao = `aba:${alvo.closest('.aba').textContent.trim()}`;
    else if (alvo.closest('.faq summary, summary')) acao = `duvida:${alvo.closest('summary').textContent.trim().slice(0, 80)}`;
    if (acao) acoes.push({ a: acao, t: Date.now() });
  }, true);

  ['scroll', 'mousemove', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, () => {
    ultimaInteracao = Date.now();
    if (ev === 'scroll') rolagem = Math.max(rolagem, rolagemAtual());
  }, { passive: true }));

  // ---------- tempo por seção: a cada segundo, conta a seção no centro da tela ----------
  setInterval(() => {
    if (document.visibilityState !== 'visible' || Date.now() - ultimaInteracao > 60000) return;
    ativo += 1000;
    const capa = document.getElementById('capa');
    let sec = capa && !capa.hidden ? capa : secaoDe(document.elementFromPoint(innerWidth / 2, innerHeight / 2));
    if (sec?.id) tempo[sec.id] = (tempo[sec.id] || 0) + 1000;
  }, 1000);

  // ---------- envio ----------
  let enviando = false;
  function lote(final) {
    const dados = { id: cfg.id, visita, visitante, dispositivo, largura: innerWidth, altura: innerHeight };
    if (cliques.length) dados.cliques = cliques;
    if (acoes.length) dados.acoes = acoes;
    if (Object.keys(tempo).length) dados.tempo = tempo;
    if (ativo) dados.ativo = ativo;
    dados.rolagem = +rolagem.toFixed(4);
    if (gravacao.length) dados.gravacao = gravacao;
    cliques = []; acoes = []; tempo = {}; ativo = 0; gravacao = [];
    return dados;
  }

  function enviar(final = false) {
    if (enviando && !final) return;
    const corpo = JSON.stringify(lote(final));
    if (final) {
      // ao sair da página: sendBeacon aceita até ~64 KB; acima disso tenta fetch com keepalive
      if (corpo.length < 60000 && navigator.sendBeacon?.(ENDPOINT, new Blob([corpo], { type: 'text/plain' }))) return;
      fetch(ENDPOINT, { method: 'POST', body: corpo, keepalive: corpo.length < 60000, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
      return;
    }
    enviando = true;
    fetch(ENDPOINT, { method: 'POST', body: corpo, headers: { 'Content-Type': 'text/plain' } })
      .catch(() => {}).finally(() => { enviando = false; });
  }

  // primeira mensagem: a abertura
  fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({
    id: cfg.id, visita, visitante, dispositivo, largura: innerWidth, altura: innerHeight, inicio: true,
    origem: document.referrer ? new URL(document.referrer).hostname : ''
  }) }).catch(() => {});

  setInterval(() => enviar(false), 8000);
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') enviar(true); });
  addEventListener('pagehide', () => enviar(true));

  // ---------- gravação da visita (rrweb), carregada depois da página ----------
  const script = document.createElement('script');
  script.src = 'assets/vendor/rrweb.min.js';
  script.async = true;
  script.onload = () => {
    if (!window.rrweb?.record) return;
    window.rrweb.record({
      emit: (ev) => { gravacao.push(ev); if (gravacao.length > 400) enviar(false); },
      maskAllInputs: true,
      sampling: { mousemove: 50, scroll: 150, input: 'last' },
      recordCanvas: false,
      collectFonts: false
    });
  };
  document.head.append(script);
})();
