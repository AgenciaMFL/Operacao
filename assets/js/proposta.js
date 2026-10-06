/*
 * Proposta comercial dinâmica — MFL Sales.
 * Todo o conteúdo vem de propostas/<id>.json; este arquivo só cuida da apresentação.
 *
 *   index.html?p=nome-do-arquivo   → carrega propostas/nome-do-arquivo.json
 *   index.html?preview=1           → usado pelo editor (lê o rascunho do navegador)
 *
 * A proposta é montada por seções; cada seção tem blocos (lista, fluxo, cartões,
 * comparativo, chips, citação, destaque, nota, números). O investimento e o
 * fechamento são seções fixas no fim.
 */
(() => {
  'use strict';

  const PREVIEW_KEY = 'mfl-proposta-rascunho';
  const params = new URLSearchParams(location.search);
  const isPreview = params.has('preview');
  const slug = (params.get('p') || 'padrao').replace(/[^a-z0-9_-]/gi, '');

  const RECORRENCIAS = {
    mensal: { sufixo: '/mês', total: 'Investimento mensal' },
    unico: { sufixo: '', total: 'Investimento único' },
    trimestral: { sufixo: '/trimestre', total: 'Investimento trimestral' },
    semestral: { sufixo: '/semestre', total: 'Investimento semestral' },
    anual: { sufixo: '/ano', total: 'Investimento anual' }
  };

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
    for (const f of filhos.flat(Infinity)) {
      if (f == null || f === false || f === '') continue;
      node.append(f instanceof Node ? f : document.createTextNode(String(f)));
    }
    return node;
  }

  function preencher(texto) {
    if (texto == null || texto === '') return '';
    const p = dados.proposta || {};
    const vars = {
      cliente: dados.cliente?.nome,
      empresa: dados.cliente?.nome,
      contato: primeiroNome(dados.cliente?.contato),
      agencia: dados.agencia?.nome,
      responsavel: primeiroNome(p.responsavel?.nome),
      numero: p.numero,
      validade: dataValidade() ? formatarData(dataValidade()) : ''
    };
    return String(texto).replace(/\{(\w+)\}/g, (m, k) => (vars[k] ? vars[k] : m));
  }

  const lista = (v) => (Array.isArray(v) ? v : []);
  const textos = (v) => lista(v).map((t) => preencher(t)).filter(Boolean);

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
    return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function dataValidade() {
    const base = lerData(dados.proposta?.data);
    const dias = Number(dados.proposta?.validadeDias);
    if (!base || !dias) return null;
    base.setDate(base.getDate() + dias);
    return base;
  }

  function num(v) {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }

  // R$ 2.000 quando é inteiro, R$ 297,90 quando tem centavos
  function moeda(v) {
    const n = num(v);
    return n.toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL',
      minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2
    });
  }

  function recorrencia(chave) {
    return RECORRENCIAS[chave] || RECORRENCIAS.mensal;
  }

  function ativo(secao) {
    return secao && secao.ativo !== false;
  }

  function slugificar(t) {
    return String(t || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function linkContato(mensagem) {
    const r = dados.proposta?.responsavel || {};
    const zap = String(r.whatsapp || '').replace(/\D/g, '');
    if (zap) return `https://wa.me/${zap}?text=${encodeURIComponent(mensagem || '')}`;
    if (r.email) {
      const assunto = `Proposta comercial ${dados.proposta?.numero || ''}`.trim();
      return `mailto:${r.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem || '')}`;
    }
    return null;
  }

  function marca(classe) {
    const a = dados.agencia || {};
    if (a.logo) return el('img', { src: a.logo, alt: a.nome || 'Logo', class: `marca-logo ${classe || ''}` });
    return el('span', { class: 'marca-texto', text: a.nome || '' });
  }

  function formatarTelefone(t) {
    const d = String(t).replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return t;
  }

  function iniciais(nome) {
    const partes = nome.trim().split(/\s+/);
    return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  /* ---------- capa ---------- */

  // Texto com trechos em **negrito**, sem interpretar HTML
  function rico(texto) {
    return preencher(texto).split(/\*\*(.+?)\*\*/g)
      .map((parte, i) => (i % 2 ? el('strong', { text: parte }) : parte))
      .filter((parte) => parte !== '');
  }

  // O vídeo é criado uma vez só: as atualizações ao vivo do editor não reiniciam o fundo
  let videoCapa = null;
  function fundoVideo(src, poster, webm) {
    if (!src) return null;
    if (!videoCapa || videoCapa.dataset.src !== src) {
      videoCapa = el('video', {
        class: 'capa-video', autoplay: true, muted: true, loop: true, playsinline: true,
        preload: 'auto', poster: poster || null, 'aria-hidden': 'true', 'data-src': src
      }, el('source', { src, type: 'video/mp4' }), webm && el('source', { src: webm, type: 'video/webm' }));
      videoCapa.muted = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) videoCapa.removeAttribute('autoplay');
    }
    return videoCapa;
  }

  // Faixa inclinada com texto repetido em movimento
  function faixa(textosFaixa, classe) {
    const itens = textosFaixa.length ? textosFaixa : ['+7 anos'];
    const sequencia = [];
    while (sequencia.length < 24) sequencia.push(...itens);
    const trilha = () => el('div', { class: 'faixa-trilha' }, sequencia.map((t) => el('span', { text: t })));
    return el('div', { class: `capa-faixa ${classe}`, 'aria-hidden': 'true' },
      el('div', { class: 'faixa-conteudo' }, trilha(), trilha()));
  }

  function renderCapa() {
    const capa = $('#capa');
    const c = dados.capa || {};
    const cli = dados.cliente || {};
    const prova = c.provaSocial || {};
    const textosFaixa = textos(c.faixa);
    const video = fundoVideo(c.video, c.poster, c.videoWebm);

    capa.replaceChildren(
      el('div', { class: 'capa-fundo', 'aria-hidden': 'true' },
        video,
        el('span', { class: 'capa-luz capa-luz-1' }),
        el('span', { class: 'capa-luz capa-luz-2' })
      ),
      faixa(textosFaixa, 'faixa-1'),
      faixa(textosFaixa, 'faixa-2'),
      el('div', { class: 'capa-centro' },
        (prova.destaque || prova.texto) && el('p', { class: 'capa-prova' },
          el('img', { class: 'capa-avatares', src: c.avatares || 'assets/img/capa-avatares.png', alt: '', width: 141, height: 56 }),
          el('span', {}, prova.destaque && el('strong', { text: preencher(prova.destaque) }), prova.texto && ` ${preencher(prova.texto)}`)
        ),
        el('h1', { class: 'capa-titulo' },
          el('span', { class: 'capa-rotulo', text: preencher(c.rotulo) || 'Proposta comercial para' }),
          el('span', { class: 'capa-cliente', text: cli.nome || 'Cliente' })
        ),
        c.subtitulo && el('p', { class: 'capa-subtitulo' }, rico(c.subtitulo)),
        el('button', { type: 'button', class: 'capa-botao', onclick: abrirProposta, text: preencher(c.textoBotao) || 'Ver meu orçamento' })
      )
    );
    if (video && video.paused && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.play().catch(() => { /* o navegador pode bloquear; fica o poster */ });
    }
  }

  function abrirProposta() {
    if (abrindo) return;
    aberta = true;
    const capa = $('#capa');
    const trocar = () => {
      capa.hidden = true;
      videoCapa?.pause();
      $('#proposta').hidden = false;
      document.body.classList.add('aberta');
      window.scrollTo(0, 0);
      aoRolar();
    };
    try { sessionStorage.setItem(`aberta:${slug}`, '1'); } catch (e) { /* sem storage */ }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { trocar(); return; }
    transicaoCirculo(trocar);
  }

  /*
   * Transição circular: a partir do botão, um anel verde se expande pela tela
   * (eco do círculo do logo) seguido pela cor de fundo da proposta. Com a tela
   * coberta, a capa sai; depois a cobertura some em fade revelando a proposta.
   */
  let abrindo = false;
  function transicaoCirculo(noMeio) {
    abrindo = true;
    const botao = $('.capa-botao');
    const r = botao ? botao.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    // raio até o canto mais distante da tela
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;

    const anel = el('div', { class: 'transicao-anel', 'aria-hidden': 'true' });
    const cobertura = el('div', { class: 'transicao-cobertura', 'aria-hidden': 'true' });
    document.body.append(anel, cobertura);

    const curva = 'cubic-bezier(.7, 0, .2, 1)';
    const circulo = (raioPx) => `circle(${raioPx}px at ${x}px ${y}px)`;
    const duracao = 850;

    botao?.animate([{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
    $('.capa-centro')?.animate(
      [{ transform: 'scale(1)', filter: 'blur(0)', opacity: 1 }, { transform: 'scale(.94)', filter: 'blur(6px)', opacity: 0 }],
      { duration: duracao * 0.7, easing: curva, fill: 'forwards' }
    );
    anel.animate([{ clipPath: circulo(0) }, { clipPath: circulo(raio) }], { duration: duracao, easing: curva, fill: 'forwards' });
    const cobrir = cobertura.animate(
      [{ clipPath: circulo(0) }, { clipPath: circulo(raio) }],
      { duration: duracao, delay: 80, easing: curva, fill: 'forwards' }
    );

    cobrir.finished.then(() => {
      noMeio();
      anel.remove();
      const revelar = cobertura.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-out', fill: 'forwards' });
      $('.intro .container')?.animate(
        [{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 700, easing: 'cubic-bezier(.2, .7, .1, 1)' }
      );
      revelar.finished.then(() => {
        cobertura.remove();
        $('.capa-centro')?.getAnimations().forEach((an) => an.cancel());
        abrindo = false;
      });
    });
  }

  /* ---------- blocos ---------- */

  function tituloBloco(b) {
    return b.titulo ? el('h3', { class: 'bloco-titulo', text: preencher(b.titulo) }) : null;
  }

  const BLOCOS = {
    // Lista com marcadores, em 1 ou 2 colunas
    lista(b) {
      const itens = textos(b.itens);
      if (!itens.length) return null;
      return [tituloBloco(b), el('ul', { class: `b-lista${Number(b.colunas) === 1 ? '' : ' duas-colunas'}` },
        itens.map((t) => el('li', { text: t })))];
    },

    // Etapas numeradas em sequência (jornada, funil, processo)
    fluxo(b) {
      const etapas = lista(b.etapas).filter((e) => e.titulo || e.descricao);
      if (!etapas.length) return null;
      let n = 0;
      const numeradas = etapas.filter((e) => e.tipo !== 'divisor').length;
      // trilha horizontal: escolhe quantas etapas por linha para não deixar uma sozinha
      const porLinha = numeradas <= 5 ? numeradas : [4, 3, 5].find((c) => numeradas % c === 0) || 4;
      const compacto = !etapas.some((e) => e.descricao);
      return [tituloBloco(b), el('ol', { class: `b-fluxo${compacto ? ' compacto' : ''}`, style: compacto ? `--por-linha:${porLinha}` : null },
        etapas.map((e) => {
          if (e.tipo === 'divisor') {
            return el('li', { class: 'fluxo-divisor', text: preencher(e.titulo || e.descricao) });
          }
          n += 1;
          return el('li', { class: `fluxo-etapa${n % porLinha === 0 ? ' fim-linha' : ''}` },
            el('span', { class: 'fluxo-num', text: n }),
            el('div', { class: 'fluxo-texto' },
              e.titulo && el('strong', { text: preencher(e.titulo) }),
              e.descricao && el('span', { text: preencher(e.descricao) })
            )
          );
        }))];
    },

    // Cartões em grade (campanhas, perfis, meses, indicadores, condições)
    cartoes(b) {
      const cartoes = lista(b.cartoes).filter((c) => c.titulo || c.texto || lista(c.itens).length);
      if (!cartoes.length) return null;
      const colunas = Math.min(Math.max(Number(b.colunas) || Math.min(cartoes.length, 3), 1), 4);
      return [tituloBloco(b), el('div', { class: `b-cartoes col-${colunas}` },
        cartoes.map((c, i) =>
          el('article', { class: 'cartao' },
            (c.etiqueta || b.numerados) && el('span', { class: 'cartao-etiqueta', text: preencher(c.etiqueta) || String(i + 1).padStart(2, '0') }),
            c.titulo && el('h4', { text: preencher(c.titulo) }),
            c.texto && el('p', { text: preencher(c.texto) }),
            textos(c.itens).length ? el('ul', {}, textos(c.itens).map((t) => el('li', { text: t }))) : null
          )
        ))];
    },

    // Colunas lado a lado: antes × depois, quem faz o quê
    comparativo(b) {
      const colunas = lista(b.colunas).filter((c) => c.titulo || textos(c.itens).length);
      if (!colunas.length) return null;
      return [tituloBloco(b), el('div', { class: `b-comparativo col-${Math.min(colunas.length, 3)}` },
        colunas.map((c) =>
          el('div', { class: `comp-coluna tom-${c.tom || 'neutro'}` },
            el('h4', { text: preencher(c.titulo) }),
            el('ul', {}, textos(c.itens).map((t) => el('li', { text: t })))
          )
        ))];
    },

    // Etiquetas curtas (temas de campanha, segmentos)
    chips(b) {
      const itens = textos(b.itens);
      if (!itens.length) return null;
      return [tituloBloco(b), el('ul', { class: 'b-chips' }, itens.map((t) => el('li', { text: t })))];
    },

    // Números grandes (trajetória, resultados)
    numeros(b) {
      const itens = lista(b.itens).filter((i) => i.numero || i.legenda);
      if (!itens.length) return null;
      return [tituloBloco(b), el('div', { class: 'b-numeros' },
        itens.map((i) => el('div', { class: 'numero' },
          el('strong', { text: preencher(i.numero) }),
          el('span', { text: preencher(i.legenda) })
        )))];
    },

    // Exemplo de mensagem/fala
    citacao(b) {
      if (!b.texto) return null;
      return el('figure', { class: 'b-citacao' },
        b.titulo && el('figcaption', { text: preencher(b.titulo) }),
        el('blockquote', { text: preencher(b.texto) })
      );
    },

    // Frase de impacto
    destaque(b) {
      if (!b.texto) return null;
      return el('p', { class: 'b-destaque', text: preencher(b.texto) });
    },

    // Subtítulo que abre uma parte dentro de um capítulo
    subsecao(b) {
      if (!b.titulo && !b.rotulo) return null;
      return el('header', { class: 'b-subsecao' },
        b.rotulo && el('span', { class: 'b-subsecao-rotulo', text: preencher(b.rotulo) }),
        b.titulo && el('h3', { text: preencher(b.titulo) }),
        b.texto ? paragrafos(b.texto) : null
      );
    },

    // Observação discreta
    nota(b) {
      if (!b.texto) return null;
      return el('p', { class: 'b-nota', text: preencher(b.texto) });
    }
  };

  function renderBlocos(blocos) {
    const saida = [];
    let par = null;
    for (const b of lista(blocos)) {
      const fn = BLOCOS[b?.tipo];
      if (!fn) continue;
      const conteudo = fn(b);
      if (!conteudo) continue;
      const node = el('div', { class: `bloco bloco-${b.tipo} revelar` }, conteudo);
      // blocos marcados como "metade" seguidos ficam lado a lado
      if (b.largura === 'metade') {
        if (!par) { par = el('div', { class: 'blocos-par' }); saida.push(par); }
        par.append(node);
        if (par.children.length === 2) par = null;
      } else {
        par = null;
        saida.push(node);
      }
    }
    return saida;
  }

  /* ---------- seções ---------- */

  function cabecalho(s, padrao) {
    return el('header', { class: 'secao-cabecalho revelar' },
      el('span', { class: 'secao-rotulo' }, el('span', { text: preencher(s.rotulo) || padrao })),
      s.titulo && el('h2', { class: 'secao-titulo', text: preencher(s.titulo) }),
      s.texto && el('div', { class: 'secao-texto' }, paragrafos(s.texto))
    );
  }

  // Um capítulo é dividido em faixas: cada "Subtítulo de parte" abre uma faixa nova,
  // e as faixas alternam claro/escuro para dar respiro na leitura.
  function secaoConteudo(s, id) {
    // Bloco com "Exibir" desligado some; uma parte desligada leva junto
    // todos os blocos dela, até o próximo "Subtítulo de parte".
    const grupos = [[]];
    let parteOculta = false;
    for (const b of lista(s.blocos)) {
      if (b?.tipo === 'subsecao') parteOculta = b.ativo === false;
      if (parteOculta || b?.ativo === false) continue;
      if (b?.tipo === 'subsecao' && grupos[grupos.length - 1].length) grupos.push([]);
      grupos[grupos.length - 1].push(b);
    }
    return el('section', { class: 'secao', id },
      grupos.map((blocos, i) =>
        el('div', { class: 'secao-banda', 'data-estilo': i === 0 ? (s.estilo || null) : null },
          el('div', { class: 'container' },
            i === 0 ? cabecalho(s, '') : null,
            el('div', { class: 'blocos' }, renderBlocos(blocos))
          )
        )
      )
    );
  }

  function calcularInvestimento(inv) {
    const servicos = lista(inv.servicos).filter((s) => s.ativo !== false && (s.nome || num(s.valor)));
    let combinacoes = lista(inv.combinacoes).filter((c) => c.nome || num(c.valor));
    // sem combinações cadastradas: soma automática dos serviços que não são opcionais
    // (desligue com somarServicos: false quando os serviços são planos alternativos)
    if (!combinacoes.length && servicos.length > 1 && inv.somarServicos !== false) {
      const fixos = servicos.filter((s) => !/opcional/i.test(s.selo || ''));
      const grupos = {};
      for (const s of fixos) (grupos[s.recorrencia || 'mensal'] ||= []).push(s);
      combinacoes = Object.entries(grupos).map(([rec, itens]) => ({
        nome: `${recorrencia(rec).total} total`,
        composicao: itens.map((s) => `${s.nome} ${moeda(s.valor)}`).join(' + '),
        valor: itens.reduce((t, s) => t + num(s.valor), 0),
        recorrencia: rec,
        destaque: true
      }));
    }
    return { servicos, combinacoes };
  }

  function precoEl(valor, rec, classe) {
    return el('strong', { class: classe }, moeda(valor), el('small', { text: recorrencia(rec).sufixo }));
  }

  function secaoInvestimento(inv) {
    const { servicos, combinacoes } = calcularInvestimento(inv);
    const condicoes = lista(inv.condicoes).filter((c) => c.titulo || c.texto);
    const validade = dataValidade();

    return el('section', { class: 'secao secao-banda secao-investimento', id: 'investimento', 'data-estilo': inv.estilo || null },
      el('div', { class: 'container' },
        cabecalho(inv, 'Investimento'),

        servicos.length ? el('div', { class: `planos col-${servicos.length === 4 ? 2 : Math.min(servicos.length, 3)}` },
          servicos.map((s, i) => {
            const opcional = /opcional/i.test(s.selo || '');
            return el('article', { class: `plano revelar${s.destaque ? ' plano-destaque' : ''}${opcional ? ' plano-opcional' : ''}` },
              el('div', { class: 'plano-topo' },
                el('span', { class: 'plano-rotulo', text: preencher(s.rotulo) || `Serviço ${i + 1}` }),
                s.selo && el('span', { class: 'plano-selo', text: preencher(s.selo) })
              ),
              el('h3', { class: 'plano-nome', text: preencher(s.nome) }),
              el('div', { class: 'plano-preco' },
                precoEl(s.valor, s.recorrencia),
                s.observacaoValor && el('span', { class: 'plano-obs', text: preencher(s.observacaoValor) })
              ),
              // outras formas de pagamento (ex.: à vista com desconto, parcelado no cartão)
              lista(s.formas).filter((f) => f.rotulo || f.valor).length
                ? el('dl', { class: 'plano-formas' },
                    lista(s.formas).filter((f) => f.rotulo || f.valor).map((f) =>
                      el('div', {}, el('dt', { text: preencher(f.rotulo) }), el('dd', { text: preencher(f.valor) }))))
                : null,
              s.descricao && el('p', { class: 'plano-descricao', text: preencher(s.descricao) }),
              textos(s.itens).length ? el('ul', { class: 'plano-itens' }, textos(s.itens).map((t) => el('li', { text: t }))) : null
            );
          })
        ) : null,

        combinacoes.length ? el('div', { class: 'totais revelar' },
          combinacoes.map((c) =>
            el('div', { class: `total${c.destaque ? ' total-destaque' : ''}` },
              el('div', { class: 'total-info' },
                el('strong', { text: preencher(c.nome) }),
                c.composicao && el('span', { text: preencher(c.composicao) })
              ),
              el('div', { class: 'total-valor' },
                precoEl(c.valor, c.recorrencia),
                c.observacao && el('span', { text: preencher(c.observacao) })
              )
            )
          ),
          validade && el('p', { class: 'total-validade', text: `Valores válidos até ${formatarData(validade)}` })
        ) : null,

        inv.nota && el('p', { class: 'b-nota revelar', text: preencher(inv.nota) }),

        condicoes.length ? el('div', { class: 'condicoes revelar' },
          el('h3', { class: 'bloco-titulo', text: 'Condições' }),
          el('div', { class: 'condicoes-grade' },
            condicoes.map((c) => el('div', { class: 'condicao' },
              el('strong', { text: preencher(c.titulo) }),
              c.texto && el('span', { text: preencher(c.texto) })
            ))
          )
        ) : null,

        inv.fechamento && el('p', { class: 'fechamento revelar', text: preencher(inv.fechamento) })
      )
    );
  }

  function secaoProximosPassos(s) {
    const passos = textos(s.passos);
    const r = dados.proposta?.responsavel || {};
    const href = linkContato(preencher(s.mensagemWhatsapp));
    return el('section', { class: 'secao secao-banda secao-proximos', id: 'proximos-passos', 'data-estilo': s.estilo || null },
      el('div', { class: 'container' },
        cabecalho(s, 'Próximos passos'),
        passos.length ? el('ol', { class: 'passos revelar' },
          passos.map((p, n) => el('li', {}, el('span', { class: 'passo-num', text: n + 1 }), el('span', { text: p })))
        ) : null,
        el('div', { class: 'cta tema-escuro revelar' },
          el('div', { class: 'cta-texto' },
            el('h3', { text: preencher(s.chamada) || 'Vamos começar?' }),
            href && el('a', { class: 'cta-botao', href, target: '_blank', rel: 'noopener' },
              el('span', { text: preencher(s.textoBotao) || 'Aprovar proposta' }),
              el('span', { 'aria-hidden': 'true', text: '→' })
            )
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

  /* ---------- página ---------- */

  function renderProposta() {
    const cli = dados.cliente || {};
    const p = dados.proposta || {};
    const a = dados.agencia || {};

    $('#topo-marca').replaceChildren(marca('marca-logo-topo'));

    const resumo = lista(p.resumo).filter((r) => r.rotulo || r.valor);
    const intro = el('section', { class: 'intro tema-escuro', id: 'inicio' },
      el('div', { class: 'container' },
        el('p', { class: 'intro-eyebrow revelar', text: `Proposta comercial${p.numero ? ' · Nº ' + p.numero : ''}` }),
        el('h1', { class: 'intro-titulo revelar' }, el('span', { text: 'Para ' }), el('em', { text: cli.nome || '' })),
        p.solucao && el('p', { class: 'intro-sub revelar', text: preencher(p.solucao) }),
        resumo.length ? el('div', { class: 'resumo revelar' },
          resumo.map((r) => el('div', { class: 'resumo-item' },
            el('span', { text: preencher(r.rotulo) }),
            el('strong', { text: preencher(r.valor) })
          ))
        ) : null,
        el('dl', { class: 'intro-meta revelar' },
          cli.contato && el('div', {}, el('dt', { text: 'Aos cuidados de' }), el('dd', { text: cli.contato + (cli.cargo ? ` · ${cli.cargo}` : '') })),
          lerData(p.data) && el('div', {}, el('dt', { text: 'Preparada em' }), el('dd', { text: formatarData(lerData(p.data)) })),
          dataValidade() && el('div', {}, el('dt', { text: 'Válida até' }), el('dd', { text: formatarData(dataValidade()) })),
          p.responsavel?.nome && el('div', {}, el('dt', { text: 'Responsável' }), el('dd', { text: p.responsavel.nome }))
        )
      )
    );

    const secoes = [];
    const menu = [];
    const usados = new Set(['inicio', 'investimento', 'proximos-passos']);
    for (const s of lista(dados.secoes)) {
      if (!ativo(s)) continue;
      let id = slugificar(s.menu || s.rotulo || s.titulo) || 'secao';
      while (usados.has(id)) id += '-2';
      usados.add(id);
      secoes.push(secaoConteudo(s, id));
      menu.push([id, preencher(s.menu || s.rotulo || s.titulo)]);
    }
    if (ativo(dados.investimento)) {
      secoes.push(secaoInvestimento(dados.investimento));
      menu.push(['investimento', preencher(dados.investimento.menu) || 'Investimento']);
    }
    if (ativo(dados.proximosPassos)) {
      secoes.push(secaoProximosPassos(dados.proximosPassos));
      menu.push(['proximos-passos', preencher(dados.proximosPassos.menu) || 'Próximos passos']);
    }

    // capítulos numerados e alternância claro/escuro (a abertura é escura, então começa no claro)
    secoes.forEach((secao, i) => {
      secao.querySelector('.secao-rotulo')?.prepend(el('span', { class: 'secao-num', text: String(i + 1).padStart(2, '0') }));
    });
    let anterior = 'escuro';
    for (const banda of secoes.flatMap((secao) => (secao.classList.contains('secao-banda') ? [secao] : [...secao.querySelectorAll('.secao-banda')]))) {
      const estilo = banda.dataset.estilo;
      const tema = estilo === 'claro' || estilo === 'escuro' ? estilo : (anterior === 'escuro' ? 'claro' : 'escuro');
      banda.classList.add(`tema-${tema}`);
      anterior = tema;
    }

    $('#topo-nav').replaceChildren(...menu.map(([id, rotulo]) => el('a', { href: `#${id}`, 'data-alvo': id, text: rotulo })));
    $('#conteudo').replaceChildren(intro, ...secoes);
    $('#barra-cta').replaceChildren(...barraCta());

    $('#rodape').replaceChildren(
      el('div', { class: 'container rodape-inner' },
        el('div', { class: 'rodape-marca' }, marca('marca-logo-rodape'), a.slogan && el('span', { text: a.slogan })),
        el('div', { class: 'rodape-links' },
          a.site && el('a', { href: a.site, target: '_blank', rel: 'noopener', text: a.site.replace(/^https?:\/\//, '').replace(/\/$/, '') }),
          a.instagram && el('a', { href: `https://instagram.com/${a.instagram.replace(/^@/, '')}`, target: '_blank', rel: 'noopener', text: a.instagram })
        ),
        el('p', { class: 'rodape-legal', text: `© ${new Date().getFullYear()} ${a.nome || ''}. Proposta confidencial preparada exclusivamente para ${cli.nome || 'o cliente'}.` })
      )
    );

    ativarRevelar();
  }

  // Barra fixa no rodapé do celular: valor principal + botão de aprovação sempre à mão.
  function barraCta() {
    const pp = dados.proximosPassos;
    const href = ativo(pp) ? linkContato(preencher(pp.mensagemWhatsapp)) : null;
    if (!href) return [];
    let principal = null;
    if (ativo(dados.investimento)) {
      const { servicos, combinacoes } = calcularInvestimento(dados.investimento);
      const c = combinacoes.find((x) => x.destaque) || combinacoes[0];
      const s = servicos.find((x) => x.destaque) || servicos[0];
      if (c) principal = { rotulo: preencher(c.nome), valor: c.valor, rec: c.recorrencia };
      else if (s) principal = { rotulo: preencher(s.nome), valor: s.valor, rec: s.recorrencia };
    }
    return [
      el('div', { class: 'barra-cta-total' },
        principal
          ? [el('span', { text: principal.rotulo }), precoEl(principal.valor, principal.rec)]
          : el('strong', { text: dados.cliente?.nome || '' })
      ),
      el('a', { href, target: '_blank', rel: 'noopener', text: 'Aprovar' })
    ];
  }

  function luminancia(hex) {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const [r, g, b] = [0, 2, 4].map((i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function aplicarTema() {
    const cor = dados.agencia?.corPrimaria;
    const raiz = document.documentElement.style;
    if (cor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cor)) {
      raiz.setProperty('--destaque', cor);
      // texto sobre a cor de destaque: escuro em cores claras, branco em cores escuras
      raiz.setProperty('--sobre-destaque', luminancia(cor) > 0.35 ? '#07130B' : '#FFFFFF');
    } else {
      raiz.removeProperty('--destaque');
      raiz.removeProperty('--sobre-destaque');
    }
    const cli = dados.cliente?.nome;
    document.title = `Proposta Comercial${cli ? ' · ' + cli : ''}`;
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
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
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
    for (const l of document.querySelectorAll('#topo-nav a')) {
      const era = l.classList.contains('atual');
      l.classList.toggle('atual', l === atual);
      // o menu rola de lado: mantém a seção atual visível
      if (l === atual && !era) {
        const nav = $('#topo-nav');
        nav.scrollTo({ left: l.offsetLeft - nav.clientWidth / 2 + l.clientWidth / 2, behavior: 'smooth' });
      }
    }

    // barra de aprovação: aparece depois da abertura e some quando o botão principal está na tela
    const intro = $('#inicio');
    const cta = document.querySelector('.cta');
    const passouIntro = intro && intro.getBoundingClientRect().bottom < 0;
    const r = cta && cta.getBoundingClientRect();
    const ctaVisivel = r && r.top < innerHeight && r.bottom > 0;
    document.body.classList.toggle('mostrar-barra', Boolean(passouIntro && !ctaVisivel));
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
        ? 'Abra a proposta por um servidor (ex.: GitHub Pages); o navegador bloqueia a leitura de arquivos locais.'
        : err.message);
    });
})();
