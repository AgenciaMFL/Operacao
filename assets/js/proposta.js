/*
 * Proposta comercial dinâmica.
 * Todo o conteúdo vem de propostas/<id>.json — este arquivo só cuida da apresentação.
 *
 *   index.html?p=nome-do-arquivo   → carrega propostas/nome-do-arquivo.json
 *   index.html?preview=1           → usado pelo editor (lê o rascunho do navegador)
 */
(() => {
  'use strict';

  const PREVIEW_KEY = 'mfl-proposta-rascunho';
  const params = new URLSearchParams(location.search);
  const isPreview = params.has('preview');
  const slug = (params.get('p') || 'exemplo').replace(/[^a-z0-9_-]/gi, '');

  const RECORRENCIAS = {
    unico: { rotulo: 'Pagamento único', sufixo: '', total: 'Investimento único' },
    mensal: { rotulo: 'Mensal', sufixo: '/mês', total: 'Investimento mensal' },
    trimestral: { rotulo: 'Trimestral', sufixo: '/trimestre', total: 'Investimento trimestral' },
    semestral: { rotulo: 'Semestral', sufixo: '/semestre', total: 'Investimento semestral' },
    anual: { rotulo: 'Anual', sufixo: '/ano', total: 'Investimento anual' }
  };

  const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const $ = (sel) => document.querySelector(sel);

  let dados = null;
  let aberta = isPreview;
  let observer = null;

  /* ---------- utilidades ---------- */

  // Cria elementos sempre com textContent: o texto do JSON nunca vira HTML.
  function el(tag, attrs, ...filhos) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const f of filhos.flat()) {
      if (f == null || f === false) continue;
      node.append(f instanceof Node ? f : document.createTextNode(String(f)));
    }
    return node;
  }

  function preencher(texto) {
    if (!texto) return '';
    const p = dados.proposta || {};
    const vars = {
      contato: primeiroNome(dados.cliente?.contato),
      contatoCompleto: dados.cliente?.contato,
      empresa: dados.cliente?.empresa,
      agencia: dados.agencia?.nome,
      responsavel: primeiroNome(p.responsavel?.nome),
      numero: p.numero,
      validade: dataValidade() ? formatarData(dataValidade()) : ''
    };
    return String(texto).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  }

  function primeiroNome(nome) {
    return (nome || '').trim().split(/\s+/)[0] || '';
  }

  function paragrafos(texto, classe) {
    return preencher(texto)
      .split(/\n\s*\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => el('p', { class: classe, text: t }));
  }

  function lerData(iso) {
    if (!iso) return null;
    const [a, m, d] = String(iso).split('-').map(Number);
    if (!a || !m || !d) return null;
    return new Date(a, m - 1, d);
  }

  function formatarData(data) {
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function dataValidade() {
    const base = lerData(dados.proposta?.data);
    const dias = Number(dados.proposta?.validadeDias);
    if (!base || !dias) return null;
    base.setDate(base.getDate() + dias);
    return base;
  }

  function num(v) {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }

  function ativo(secao) {
    return secao && secao.ativo !== false;
  }

  function linkContato(mensagem) {
    const r = dados.proposta?.responsavel || {};
    const zap = String(r.whatsapp || '').replace(/\D/g, '');
    if (zap) return `https://wa.me/${zap}?text=${encodeURIComponent(mensagem || '')}`;
    if (r.email) {
      const assunto = `${dados.proposta?.titulo || 'Proposta'} ${dados.proposta?.numero || ''}`.trim();
      return `mailto:${r.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem || '')}`;
    }
    return null;
  }

  function marca() {
    const a = dados.agencia || {};
    if (a.logo) return el('img', { src: a.logo, alt: a.nome || 'Logo', class: 'marca-logo' });
    return el('span', { class: 'marca-texto', text: a.nome || '' });
  }

  /* ---------- capa ---------- */

  function renderCapa() {
    const capa = $('#capa');
    const c = dados.capa || {};
    const cli = dados.cliente || {};
    const p = dados.proposta || {};
    const data = lerData(p.data);

    capa.replaceChildren(
      el('div', { class: 'capa-fundo', 'aria-hidden': 'true' },
        el('span', { class: 'capa-orbe capa-orbe-1' }),
        el('span', { class: 'capa-orbe capa-orbe-2' }),
        el('span', { class: 'capa-grade' })
      ),
      el('div', { class: 'capa-topo' },
        el('div', { class: 'capa-marca' }, marca()),
        el('div', { class: 'capa-meta' },
          p.numero && el('span', { text: `Nº ${p.numero}` }),
          data && el('span', { text: formatarData(data) })
        )
      ),
      el('div', { class: 'capa-centro' },
        el('p', { class: 'capa-eyebrow', text: `${p.titulo || 'Proposta Comercial'} para` }),
        cli.logo
          ? el('img', { class: 'capa-cliente-logo', src: cli.logo, alt: cli.empresa || '' })
          : null,
        el('h1', { class: 'capa-cliente', text: cli.empresa || 'Cliente' }),
        c.saudacao && el('p', { class: 'capa-saudacao', text: preencher(c.saudacao) }),
        c.subtitulo && el('p', { class: 'capa-subtitulo', text: preencher(c.subtitulo) }),
        el('button', { type: 'button', class: 'capa-botao', onclick: abrirProposta },
          el('span', { text: preencher(c.textoBotao) || 'Abrir proposta' }),
          el('span', { class: 'capa-botao-seta', 'aria-hidden': 'true', text: '→' })
        )
      ),
      el('div', { class: 'capa-rodape' },
        cli.contato && el('span', { text: `Preparada para ${cli.contato}${cli.cargo ? ' · ' + cli.cargo : ''}` }),
        el('span', { class: 'capa-confidencial', text: 'Documento confidencial' })
      )
    );
  }

  function abrirProposta() {
    aberta = true;
    const capa = $('#capa');
    const proposta = $('#proposta');
    proposta.hidden = false;
    document.body.classList.add('aberta');
    window.scrollTo(0, 0);
    capa.classList.add('saindo');
    const fim = () => {
      capa.hidden = true;
      capa.classList.remove('saindo');
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) fim();
    else capa.addEventListener('animationend', fim, { once: true });
    try { sessionStorage.setItem(`aberta:${slug}`, '1'); } catch (e) { /* sem storage */ }
  }

  /* ---------- seções ---------- */

  function cabecalho(indice, secao, tituloPadrao) {
    const titulo = preencher(secao.titulo) || tituloPadrao;
    return el('div', { class: 'secao-cabecalho revelar' },
      el('span', { class: 'secao-indice', text: String(indice).padStart(2, '0') }),
      el('h2', { class: 'secao-titulo', text: titulo })
    );
  }

  function secaoApresentacao(s, i) {
    const destaques = (s.destaques || []).filter((d) => d.numero || d.legenda);
    return el('section', { class: 'secao secao-apresentacao', id: 'apresentacao' },
      el('div', { class: 'container' },
        cabecalho(i, s, 'Quem somos'),
        el('div', { class: 'apresentacao-grid' },
          el('div', { class: 'texto-corrido revelar' }, paragrafos(s.texto)),
          destaques.length
            ? el('div', { class: 'destaques' },
                destaques.map((d) =>
                  el('div', { class: 'destaque revelar' },
                    el('strong', { text: preencher(d.numero) }),
                    el('span', { text: preencher(d.legenda) })
                  )
                )
              )
            : null
        )
      )
    );
  }

  function secaoObjetivos(s, i) {
    const itens = (s.itens || []).filter(Boolean);
    return el('section', { class: 'secao secao-objetivos', id: 'objetivos' },
      el('div', { class: 'container' },
        cabecalho(i, s, 'Objetivos'),
        s.texto && el('div', { class: 'texto-corrido texto-intro revelar' }, paragrafos(s.texto)),
        el('ul', { class: 'objetivos-lista' },
          itens.map((t, n) =>
            el('li', { class: 'objetivo revelar', style: `--atraso:${n * 60}ms` },
              el('span', { class: 'objetivo-check', 'aria-hidden': 'true', text: '✓' }),
              el('span', { text: preencher(t) })
            )
          )
        )
      )
    );
  }

  function secaoEntregaveis(s, i) {
    const itens = (s.itens || []).filter((e) => e.titulo || e.descricao);
    return el('section', { class: 'secao secao-entregaveis', id: 'entregaveis' },
      el('div', { class: 'container' },
        cabecalho(i, s, 'Entregáveis'),
        s.texto && el('div', { class: 'texto-corrido texto-intro revelar' }, paragrafos(s.texto)),
        el('div', { class: 'entregaveis-grid' },
          itens.map((e, n) =>
            el('article', { class: 'entregavel revelar', style: `--atraso:${(n % 2) * 80}ms` },
              el('span', { class: 'entregavel-num', text: String(n + 1).padStart(2, '0') }),
              el('h3', { text: preencher(e.titulo) }),
              e.descricao && el('p', { text: preencher(e.descricao) }),
              (e.detalhes || []).filter(Boolean).length
                ? el('ul', {}, e.detalhes.filter(Boolean).map((d) => el('li', { text: preencher(d) })))
                : null
            )
          )
        )
      )
    );
  }

  function secaoCronograma(s, i) {
    const etapas = (s.etapas || []).filter((e) => e.titulo || e.descricao);
    return el('section', { class: 'secao secao-cronograma', id: 'cronograma' },
      el('div', { class: 'container' },
        cabecalho(i, s, 'Cronograma'),
        el('ol', { class: 'linha-tempo' },
          etapas.map((e) =>
            el('li', { class: 'etapa revelar' },
              el('span', { class: 'etapa-ponto', 'aria-hidden': 'true' }),
              e.periodo && el('span', { class: 'etapa-periodo', text: preencher(e.periodo) }),
              el('h3', { text: preencher(e.titulo) }),
              e.descricao && el('p', { text: preencher(e.descricao) })
            )
          )
        )
      )
    );
  }

  function secaoInvestimento(s, i) {
    const itens = (s.itens || []).filter((it) => it.descricao || num(it.valor));
    const totais = {};
    for (const it of itens) {
      const rec = RECORRENCIAS[it.recorrencia] ? it.recorrencia : 'unico';
      totais[rec] = (totais[rec] || 0) + num(it.valor) * (num(it.quantidade) || 1);
    }
    const ordem = Object.keys(RECORRENCIAS).filter((k) => totais[k] != null);
    const validade = dataValidade();

    return el('section', { class: 'secao secao-investimento', id: 'investimento' },
      el('div', { class: 'container' },
        cabecalho(i, s, 'Investimento'),
        s.texto && el('div', { class: 'texto-corrido texto-intro revelar' }, paragrafos(s.texto)),
        el('div', { class: 'investimento-grid' },
          el('div', { class: 'investimento-itens revelar' },
            itens.map((it) => {
              const rec = RECORRENCIAS[it.recorrencia] || RECORRENCIAS.unico;
              const qtd = num(it.quantidade) || 1;
              const valor = num(it.valor);
              const de = num(it.valorDe);
              return el('div', { class: 'item' },
                el('div', { class: 'item-info' },
                  el('h3', {}, preencher(it.descricao), qtd > 1 ? el('span', { class: 'item-qtd', text: ` × ${qtd}` }) : null),
                  it.detalhe && el('p', { text: preencher(it.detalhe) }),
                  el('span', { class: 'item-tag', text: rec.rotulo })
                ),
                el('div', { class: 'item-valor' },
                  de > valor ? el('s', { text: moeda.format(de * qtd) }) : null,
                  el('strong', {}, moeda.format(valor * qtd), el('small', { text: rec.sufixo }))
                )
              );
            })
          ),
          el('aside', { class: 'investimento-total revelar' },
            ordem.map((k) =>
              el('div', { class: 'total-linha' },
                el('span', { text: RECORRENCIAS[k].total }),
                el('strong', {}, moeda.format(totais[k]), el('small', { text: RECORRENCIAS[k].sufixo }))
              )
            ),
            validade && el('p', { class: 'total-validade', text: `Proposta válida até ${formatarData(validade)}` })
          )
        ),
        (s.condicoes || []).filter(Boolean).length
          ? el('div', { class: 'condicoes revelar' },
              el('h3', { text: 'Condições' }),
              el('ul', {}, s.condicoes.filter(Boolean).map((c) => el('li', { text: preencher(c) })))
            )
          : null,
        s.observacao && el('div', { class: 'texto-corrido observacao revelar' }, paragrafos(s.observacao))
      )
    );
  }

  function secaoProximosPassos(s, i) {
    const passos = (s.passos || []).filter(Boolean);
    const r = dados.proposta?.responsavel || {};
    const href = linkContato(preencher(s.mensagemWhatsapp));
    return el('section', { class: 'secao secao-proximos', id: 'proximos-passos' },
      el('div', { class: 'container' },
        cabecalho(i, s, 'Próximos passos'),
        el('ol', { class: 'passos' },
          passos.map((p, n) =>
            el('li', { class: 'passo revelar', style: `--atraso:${n * 80}ms` },
              el('span', { class: 'passo-num', text: n + 1 }),
              el('span', { text: preencher(p) })
            )
          )
        ),
        el('div', { class: 'cta revelar' },
          href && el('a', { class: 'cta-botao', href, target: '_blank', rel: 'noopener' },
            el('span', { text: preencher(s.textoBotao) || 'Aprovar proposta' }),
            el('span', { 'aria-hidden': 'true', text: '→' })
          ),
          r.nome && el('div', { class: 'responsavel' },
            el('span', { class: 'responsavel-avatar', 'aria-hidden': 'true', text: iniciais(r.nome) }),
            el('div', {},
              el('strong', { text: r.nome }),
              r.cargo && el('span', { text: r.cargo }),
              el('span', { class: 'responsavel-contatos' },
                r.whatsapp && el('a', { href: `https://wa.me/${String(r.whatsapp).replace(/\D/g, '')}`, target: '_blank', rel: 'noopener', text: formatarTelefone(r.whatsapp) }),
                r.email && el('a', { href: `mailto:${r.email}`, text: r.email })
              )
            )
          )
        )
      )
    );
  }

  function iniciais(nome) {
    const partes = nome.trim().split(/\s+/);
    return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  function formatarTelefone(t) {
    const d = String(t).replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return t;
  }

  const SECOES = [
    { chave: 'apresentacao', id: 'apresentacao', menu: 'Sobre', render: secaoApresentacao },
    { chave: 'objetivos', id: 'objetivos', menu: 'Objetivos', render: secaoObjetivos },
    { chave: 'entregaveis', id: 'entregaveis', menu: 'Entregáveis', render: secaoEntregaveis },
    { chave: 'cronograma', id: 'cronograma', menu: 'Cronograma', render: secaoCronograma },
    { chave: 'investimento', id: 'investimento', menu: 'Investimento', render: secaoInvestimento },
    { chave: 'proximosPassos', id: 'proximos-passos', menu: 'Próximos passos', render: secaoProximosPassos }
  ];

  /* ---------- página ---------- */

  function renderProposta() {
    const cli = dados.cliente || {};
    const p = dados.proposta || {};
    const a = dados.agencia || {};

    $('#topo-marca').replaceChildren(marca());

    const intro = el('section', { class: 'intro', id: 'inicio' },
      el('div', { class: 'container' },
        el('p', { class: 'intro-eyebrow revelar', text: `${p.titulo || 'Proposta Comercial'}${p.numero ? ' · Nº ' + p.numero : ''}` }),
        el('h1', { class: 'intro-titulo revelar' },
          el('span', { text: 'Para ' }),
          el('em', { text: cli.empresa || '' })
        ),
        el('div', { class: 'intro-meta revelar' },
          cli.contato && el('div', {}, el('span', { text: 'Aos cuidados de' }), el('strong', { text: cli.contato + (cli.cargo ? ` · ${cli.cargo}` : '') })),
          lerData(p.data) && el('div', {}, el('span', { text: 'Data' }), el('strong', { text: formatarData(lerData(p.data)) })),
          dataValidade() && el('div', {}, el('span', { text: 'Válida até' }), el('strong', { text: formatarData(dataValidade()) })),
          p.responsavel?.nome && el('div', {}, el('span', { text: 'Responsável' }), el('strong', { text: p.responsavel.nome }))
        )
      )
    );

    const secoes = [];
    const menu = [];
    let indice = 1;
    for (const def of SECOES) {
      const s = dados[def.chave];
      if (!ativo(s)) continue;
      secoes.push(def.render(s, indice++));
      menu.push(el('a', { href: `#${def.id}`, 'data-alvo': def.id, text: def.menu }));
    }

    $('#topo-nav').replaceChildren(...menu);
    $('#conteudo').replaceChildren(intro, ...secoes);

    $('#rodape').replaceChildren(
      el('div', { class: 'container rodape-inner' },
        el('div', { class: 'rodape-marca' }, marca()),
        el('div', { class: 'rodape-links' },
          a.site && el('a', { href: a.site, target: '_blank', rel: 'noopener', text: a.site.replace(/^https?:\/\//, '').replace(/\/$/, '') }),
          a.instagram && el('a', {
            href: `https://instagram.com/${a.instagram.replace(/^@/, '')}`,
            target: '_blank', rel: 'noopener', text: a.instagram
          })
        ),
        el('p', { class: 'rodape-legal', text: `© ${new Date().getFullYear()} ${a.nome || ''}. Proposta confidencial preparada exclusivamente para ${cli.empresa || 'o cliente'}.` })
      )
    );

    ativarRevelar();
  }

  function aplicarTema() {
    const cor = dados.agencia?.corPrimaria;
    if (cor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cor)) {
      document.documentElement.style.setProperty('--destaque', cor);
    } else {
      document.documentElement.style.removeProperty('--destaque');
    }
    const cli = dados.cliente?.empresa;
    document.title = `${dados.proposta?.titulo || 'Proposta Comercial'}${cli ? ' · ' + cli : ''}`;
  }

  function render(novosDados) {
    dados = novosDados || {};
    aplicarTema();
    renderCapa();
    renderProposta();

    $('#estado').hidden = true;
    document.body.classList.remove('carregando');

    if (aberta) {
      $('#capa').hidden = true;
      $('#proposta').hidden = false;
      document.body.classList.add('aberta');
    } else {
      $('#capa').hidden = false;
      $('#proposta').hidden = true;
      document.body.classList.remove('aberta');
    }
  }

  /* ---------- interações ---------- */

  function ativarRevelar() {
    if (observer) observer.disconnect();
    const alvos = document.querySelectorAll('.revelar');
    if (!('IntersectionObserver' in window) || isPreview) {
      alvos.forEach((n) => n.classList.add('visivel'));
      return;
    }
    observer = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) {
          e.target.classList.add('visivel');
          observer.unobserve(e.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    alvos.forEach((n) => observer.observe(n));
  }

  function aoRolar() {
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#progresso').style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    document.body.classList.toggle('rolou', scrollY > 40);

    let atual = null;
    for (const link of document.querySelectorAll('#topo-nav a')) {
      const alvo = document.getElementById(link.dataset.alvo);
      if (alvo && alvo.getBoundingClientRect().top < innerHeight * 0.4) atual = link;
    }
    document.querySelectorAll('#topo-nav a').forEach((l) => l.classList.toggle('atual', l === atual));
  }

  function mostrarErro(msg) {
    const estado = $('#estado');
    estado.classList.add('erro');
    estado.replaceChildren(
      el('p', { class: 'estado-titulo', text: 'Não foi possível abrir a proposta' }),
      el('p', { text: msg })
    );
  }

  async function carregar() {
    if (isPreview) {
      try {
        const rascunho = localStorage.getItem(PREVIEW_KEY);
        if (rascunho) return JSON.parse(rascunho);
      } catch (e) { /* cai para o arquivo */ }
    }
    const resp = await fetch(`propostas/${slug}.json`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Proposta "${slug}" não encontrada.`);
    return resp.json();
  }

  // O editor envia atualizações ao vivo para a pré-visualização.
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin) return;
    if (e.data?.tipo === 'proposta:atualizar') render(e.data.dados);
    else if (e.data?.tipo === 'proposta:capa' && dados) {
      aberta = !e.data.mostrar;
      render(dados);
    } else return;
    aoRolar();
  });

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  $('#botao-pdf').addEventListener('click', () => {
    document.querySelectorAll('.revelar').forEach((n) => n.classList.add('visivel'));
    window.print();
  });

  try { if (sessionStorage.getItem(`aberta:${slug}`)) aberta = true; } catch (e) { /* sem storage */ }

  carregar()
    .then((d) => { render(d); aoRolar(); })
    .catch((err) => {
      console.error(err);
      mostrarErro(location.protocol === 'file:'
        ? 'Abra a proposta por um servidor (ex.: GitHub Pages) — o navegador bloqueia a leitura de arquivos locais.'
        : err.message);
    });
})();
