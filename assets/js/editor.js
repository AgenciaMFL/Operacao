/*
 * Editor de propostas — gera o JSON que a página index.html exibe.
 * O formulário é montado a partir de ESQUEMA: para adicionar um campo novo,
 * basta incluí-lo aqui e usá-lo em assets/js/proposta.js.
 */
(() => {
  'use strict';

  const RASCUNHO_KEY = 'mfl-proposta-rascunho';
  const MODELO = 'exemplo';

  const RECORRENCIAS = [
    ['mensal', 'Mensal'],
    ['unico', 'Pagamento único'],
    ['trimestral', 'Trimestral'],
    ['semestral', 'Semestral'],
    ['anual', 'Anual']
  ];

  const AJUDA_VARIAVEIS = 'Pode usar {contato}, {empresa}, {agencia}, {responsavel}, {numero} e {validade}.';

  const ESQUEMA = [
    {
      titulo: 'Arquivo', caminho: null, aberto: true,
      campos: [
        { chave: 'id', rotulo: 'Nome do arquivo', tipo: 'slug', ajuda: 'Use letras minúsculas e hífens, ex.: bella-massa. O link ficará index.html?p=bella-massa' }
      ]
    },
    {
      titulo: 'Cliente', caminho: 'cliente', aberto: true,
      campos: [
        { chave: 'empresa', rotulo: 'Empresa' },
        { chave: 'contato', rotulo: 'Nome do contato' },
        { chave: 'cargo', rotulo: 'Cargo do contato' },
        { chave: 'logo', rotulo: 'Logo do cliente (URL, opcional)', tipo: 'url' }
      ]
    },
    {
      titulo: 'Dados da proposta', caminho: 'proposta', aberto: true,
      campos: [
        { chave: 'titulo', rotulo: 'Título' },
        { chave: 'numero', rotulo: 'Número' },
        { chave: 'data', rotulo: 'Data', tipo: 'date' },
        { chave: 'validadeDias', rotulo: 'Validade (dias)', tipo: 'number' },
        { chave: 'responsavel.nome', rotulo: 'Responsável — nome' },
        { chave: 'responsavel.cargo', rotulo: 'Responsável — cargo' },
        { chave: 'responsavel.whatsapp', rotulo: 'Responsável — WhatsApp', ajuda: 'Com DDI e DDD, só números. Ex.: 5511999999999' },
        { chave: 'responsavel.email', rotulo: 'Responsável — e-mail', tipo: 'email' }
      ]
    },
    {
      titulo: 'Capa', caminho: 'capa',
      campos: [
        { chave: 'saudacao', rotulo: 'Saudação', ajuda: AJUDA_VARIAVEIS },
        { chave: 'subtitulo', rotulo: 'Subtítulo', tipo: 'textarea' },
        { chave: 'textoBotao', rotulo: 'Texto do botão' }
      ]
    },
    {
      titulo: 'Quem somos', caminho: 'apresentacao', alternavel: true,
      campos: [
        { chave: 'titulo', rotulo: 'Título da seção' },
        { chave: 'texto', rotulo: 'Texto', tipo: 'textarea', ajuda: 'Deixe uma linha em branco para separar parágrafos.' },
        {
          chave: 'destaques', rotulo: 'Números de destaque', tipo: 'lista', item: 'destaque',
          campos: [
            { chave: 'numero', rotulo: 'Número', meia: true },
            { chave: 'legenda', rotulo: 'Legenda', meia: true }
          ]
        }
      ]
    },
    {
      titulo: 'Objetivos', caminho: 'objetivos', alternavel: true,
      campos: [
        { chave: 'titulo', rotulo: 'Título da seção' },
        { chave: 'texto', rotulo: 'Texto de introdução', tipo: 'textarea' },
        { chave: 'itens', rotulo: 'Objetivos', tipo: 'textos', item: 'objetivo' }
      ]
    },
    {
      titulo: 'Entregáveis', caminho: 'entregaveis', alternavel: true,
      campos: [
        { chave: 'titulo', rotulo: 'Título da seção' },
        { chave: 'texto', rotulo: 'Texto de introdução', tipo: 'textarea' },
        {
          chave: 'itens', rotulo: 'Entregáveis', tipo: 'lista', item: 'entregável',
          campos: [
            { chave: 'titulo', rotulo: 'Título' },
            { chave: 'descricao', rotulo: 'Descrição', tipo: 'textarea' },
            { chave: 'detalhes', rotulo: 'O que inclui', tipo: 'textos', item: 'item' }
          ]
        }
      ]
    },
    {
      titulo: 'Cronograma', caminho: 'cronograma', alternavel: true,
      campos: [
        { chave: 'titulo', rotulo: 'Título da seção' },
        {
          chave: 'etapas', rotulo: 'Etapas', tipo: 'lista', item: 'etapa',
          campos: [
            { chave: 'periodo', rotulo: 'Período', meia: true },
            { chave: 'titulo', rotulo: 'Título', meia: true },
            { chave: 'descricao', rotulo: 'Descrição', tipo: 'textarea' }
          ]
        }
      ]
    },
    {
      titulo: 'Investimento', caminho: 'investimento', alternavel: true,
      campos: [
        { chave: 'titulo', rotulo: 'Título da seção' },
        { chave: 'texto', rotulo: 'Texto de introdução', tipo: 'textarea' },
        {
          chave: 'itens', rotulo: 'Itens', tipo: 'lista', item: 'item',
          campos: [
            { chave: 'descricao', rotulo: 'Serviço' },
            { chave: 'detalhe', rotulo: 'Detalhe (opcional)' },
            { chave: 'valor', rotulo: 'Valor (R$)', tipo: 'money', meia: true },
            { chave: 'valorDe', rotulo: 'Valor "de" riscado (R$, opcional)', tipo: 'money', meia: true },
            { chave: 'quantidade', rotulo: 'Quantidade', tipo: 'number', meia: true, padrao: 1 },
            { chave: 'recorrencia', rotulo: 'Cobrança', tipo: 'select', opcoes: RECORRENCIAS, meia: true, padrao: 'mensal' }
          ]
        },
        { chave: 'condicoes', rotulo: 'Condições comerciais', tipo: 'textos', item: 'condição' },
        { chave: 'observacao', rotulo: 'Observação (opcional)', tipo: 'textarea' }
      ]
    },
    {
      titulo: 'Próximos passos', caminho: 'proximosPassos', alternavel: true,
      campos: [
        { chave: 'titulo', rotulo: 'Título da seção' },
        { chave: 'passos', rotulo: 'Passos', tipo: 'textos', item: 'passo' },
        { chave: 'textoBotao', rotulo: 'Texto do botão de aprovação' },
        { chave: 'mensagemWhatsapp', rotulo: 'Mensagem enviada no WhatsApp', tipo: 'textarea', ajuda: AJUDA_VARIAVEIS }
      ]
    },
    {
      titulo: 'Agência', caminho: 'agencia',
      campos: [
        { chave: 'nome', rotulo: 'Nome' },
        { chave: 'logo', rotulo: 'Logo (URL ou caminho, opcional)', tipo: 'url', ajuda: 'Sem logo, o nome aparece em texto.' },
        { chave: 'site', rotulo: 'Site', tipo: 'url' },
        { chave: 'instagram', rotulo: 'Instagram' },
        { chave: 'corPrimaria', rotulo: 'Cor de destaque', tipo: 'color' }
      ]
    }
  ];

  const $ = (sel) => document.querySelector(sel);
  const form = $('#formulario');
  const iframe = $('#previa');
  let dados = {};
  let timer = null;

  /* ---------- utilidades ---------- */

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

  function obter(obj, caminho) {
    return caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function definir(obj, caminho, valor) {
    const partes = caminho.split('.');
    const ultima = partes.pop();
    let alvo = obj;
    for (const p of partes) {
      if (typeof alvo[p] !== 'object' || alvo[p] === null) alvo[p] = {};
      alvo = alvo[p];
    }
    alvo[ultima] = valor;
  }

  function objetoDa(caminho) {
    if (!caminho) return dados;
    if (typeof dados[caminho] !== 'object' || dados[caminho] === null) dados[caminho] = {};
    return dados[caminho];
  }

  function slugificar(t) {
    return String(t || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  let uid = 0;
  const novoId = () => `campo-${++uid}`;

  /* ---------- campos ---------- */

  function campoSimples(def, obj) {
    const id = novoId();
    const valor = obter(obj, def.chave);
    let input;

    if (def.tipo === 'textarea') {
      input = el('textarea', { id, rows: 3 });
      input.value = valor ?? '';
      const ajustar = () => { input.style.height = 'auto'; input.style.height = `${input.scrollHeight + 2}px`; };
      input.addEventListener('input', ajustar);
      requestAnimationFrame(ajustar);
    } else if (def.tipo === 'select') {
      input = el('select', { id }, def.opcoes.map(([v, r]) => el('option', { value: v, text: r })));
      input.value = valor ?? def.padrao ?? def.opcoes[0][0];
    } else if (def.tipo === 'color') {
      input = el('input', { id, type: 'color' });
      input.value = /^#[0-9a-f]{6}$/i.test(valor) ? valor : '#ff5a1f';
    } else {
      const tipos = { number: 'number', money: 'number', date: 'date', email: 'email', url: 'text' };
      input = el('input', { id, type: tipos[def.tipo] || 'text' });
      if (def.tipo === 'money') { input.step = '0.01'; input.min = '0'; input.inputMode = 'decimal'; }
      if (def.tipo === 'number') { input.step = '1'; input.min = '0'; }
      input.value = valor ?? '';
    }

    input.addEventListener(def.tipo === 'select' || def.tipo === 'color' ? 'change' : 'input', () => {
      let v = input.value;
      if (def.tipo === 'number' || def.tipo === 'money') v = v === '' ? 0 : Number(v);
      if (def.tipo === 'slug') {
        v = slugificar(v);
        if (input.value !== v && !input.value.endsWith('-')) input.value = v;
      }
      definir(obj, def.chave, v);
      alterado();
    });
    if (def.tipo === 'color') input.addEventListener('input', () => { definir(obj, def.chave, input.value); alterado(); });

    return el('div', { class: `campo${def.meia ? ' meia' : ''}` },
      el('label', { for: id, text: def.rotulo }),
      input,
      def.ajuda && el('small', { text: def.ajuda })
    );
  }

  function botaoIcone(texto, titulo, onclick, extra) {
    return el('button', { type: 'button', class: `icone ${extra || ''}`, title: titulo, 'aria-label': titulo, onclick, text: texto });
  }

  function mover(arr, i, delta, redesenhar) {
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    redesenhar();
    alterado();
  }

  // Lista de textos simples (ex.: objetivos, condições)
  function campoTextos(def, obj) {
    if (!Array.isArray(obj[def.chave])) obj[def.chave] = [];
    const arr = obj[def.chave];
    const caixa = el('div', { class: 'campo lista-textos' });

    const desenhar = (foco) => {
      caixa.replaceChildren(
        el('label', { text: def.rotulo }),
        ...arr.map((valor, i) => {
          const input = el('input', { type: 'text', 'aria-label': `${def.item} ${i + 1}` });
          input.value = valor ?? '';
          input.addEventListener('input', () => { arr[i] = input.value; alterado(); });
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); arr.splice(i + 1, 0, ''); desenhar(i + 1); alterado(); }
          });
          if (foco === i) requestAnimationFrame(() => input.focus());
          return el('div', { class: 'linha-texto' },
            input,
            botaoIcone('↑', 'Subir', () => mover(arr, i, -1, desenhar)),
            botaoIcone('↓', 'Descer', () => mover(arr, i, 1, desenhar)),
            botaoIcone('×', 'Remover', () => { arr.splice(i, 1); desenhar(); alterado(); }, 'perigo')
          );
        }),
        el('button', {
          type: 'button', class: 'adicionar', text: `+ Adicionar ${def.item}`,
          onclick: () => { arr.push(''); desenhar(arr.length - 1); alterado(); }
        })
      );
    };
    desenhar();
    return caixa;
  }

  // Lista de blocos com vários campos (ex.: entregáveis, itens de investimento)
  function campoLista(def, obj) {
    if (!Array.isArray(obj[def.chave])) obj[def.chave] = [];
    const arr = obj[def.chave];
    const caixa = el('div', { class: 'campo lista-blocos' });

    const novo = () => {
      const item = {};
      for (const c of def.campos) {
        if (c.padrao != null) item[c.chave] = c.padrao;
        else if (c.tipo === 'textos') item[c.chave] = [];
        else if (c.tipo === 'money' || c.tipo === 'number') item[c.chave] = 0;
        else item[c.chave] = '';
      }
      return item;
    };

    const desenhar = () => {
      caixa.replaceChildren(
        el('label', { text: def.rotulo }),
        ...arr.map((item, i) =>
          el('div', { class: 'bloco' },
            el('div', { class: 'bloco-topo' },
              el('span', { text: `${def.item} ${i + 1}` }),
              el('div', { class: 'bloco-acoes' },
                botaoIcone('↑', 'Subir', () => mover(arr, i, -1, desenhar)),
                botaoIcone('↓', 'Descer', () => mover(arr, i, 1, desenhar)),
                botaoIcone('⧉', 'Duplicar', () => { arr.splice(i + 1, 0, structuredClone(item)); desenhar(); alterado(); }),
                botaoIcone('×', 'Remover', () => {
                  if (confirm(`Remover ${def.item} ${i + 1}?`)) { arr.splice(i, 1); desenhar(); alterado(); }
                }, 'perigo')
              )
            ),
            el('div', { class: 'bloco-campos' }, def.campos.map((c) => campo(c, item)))
          )
        ),
        el('button', {
          type: 'button', class: 'adicionar', text: `+ Adicionar ${def.item}`,
          onclick: () => { arr.push(novo()); desenhar(); alterado(); }
        })
      );
    };
    desenhar();
    return caixa;
  }

  function campo(def, obj) {
    if (def.tipo === 'lista') return campoLista(def, obj);
    if (def.tipo === 'textos') return campoTextos(def, obj);
    return campoSimples(def, obj);
  }

  /* ---------- formulário ---------- */

  function montarFormulario() {
    const abertos = new Set([...form.querySelectorAll('details[open]')].map((d) => d.dataset.grupo));
    const primeiraVez = !form.children.length;

    form.replaceChildren(...ESQUEMA.map((grupo) => {
      const obj = objetoDa(grupo.caminho);
      const resumo = el('summary', {}, el('span', { text: grupo.titulo }));

      if (grupo.alternavel) {
        const chave = el('input', { type: 'checkbox', title: 'Mostrar esta seção na proposta' });
        chave.checked = obj.ativo !== false;
        chave.addEventListener('click', (e) => e.stopPropagation());
        chave.addEventListener('change', () => {
          obj.ativo = chave.checked;
          detalhes.classList.toggle('desativado', !chave.checked);
          alterado();
        });
        resumo.append(el('label', { class: 'alternar', onclick: (e) => e.stopPropagation() }, chave, el('span', { text: 'Exibir' })));
      }

      const detalhes = el('details', {
        'data-grupo': grupo.titulo,
        class: grupo.alternavel && obj.ativo === false ? 'desativado' : null,
        open: primeiraVez ? !!grupo.aberto : abertos.has(grupo.titulo)
      }, resumo, el('div', { class: 'grupo-campos' }, grupo.campos.map((c) => campo(c, obj))));
      return detalhes;
    }));
  }

  /* ---------- sincronização ---------- */

  function alterado() {
    clearTimeout(timer);
    $('#status').textContent = 'Salvando…';
    timer = setTimeout(() => {
      salvarRascunho();
      enviarParaPrevia();
      $('#status').textContent = 'Rascunho salvo no navegador';
    }, 250);
  }

  function salvarRascunho() {
    try { localStorage.setItem(RASCUNHO_KEY, JSON.stringify(dados)); } catch (e) { /* sem storage */ }
  }

  function enviarParaPrevia() {
    iframe.contentWindow?.postMessage({ tipo: 'proposta:atualizar', dados: structuredClone(dados) }, location.origin);
  }

  function carregarDados(novos, origem) {
    dados = novos && typeof novos === 'object' ? novos : {};
    montarFormulario();
    salvarRascunho();
    enviarParaPrevia();
    $('#status').textContent = origem ? `Carregado: ${origem}` : 'Rascunho salvo no navegador';
  }

  async function buscar(nome) {
    const resp = await fetch(`propostas/${nome}.json`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Não encontrei propostas/${nome}.json`);
    return resp.json();
  }

  /* ---------- ações ---------- */

  $('#acao-baixar').addEventListener('click', () => {
    if (!dados.id) dados.id = slugificar(dados.cliente?.empresa) || 'proposta';
    const blob = new Blob([JSON.stringify(dados, null, 2) + '\n'], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `${dados.id}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    montarFormulario();
  });

  $('#acao-importar').addEventListener('click', () => $('#arquivo').click());
  $('#arquivo').addEventListener('change', async (e) => {
    const arquivo = e.target.files[0];
    e.target.value = '';
    if (!arquivo) return;
    try {
      carregarDados(JSON.parse(await arquivo.text()), arquivo.name);
    } catch (err) {
      alert('Este arquivo não é um JSON de proposta válido.');
    }
  });

  $('#acao-novo').addEventListener('click', async () => {
    if (!confirm('Começar uma nova proposta a partir do modelo? O rascunho atual será substituído.')) return;
    try {
      const modelo = await buscar(MODELO);
      modelo.id = '';
      carregarDados(modelo, 'modelo');
    } catch (err) { alert(err.message); }
  });

  const dialogo = $('#dialogo-abrir');
  $('#acao-abrir').addEventListener('click', () => { $('#abrir-nome').value = ''; dialogo.showModal(); });
  dialogo.addEventListener('close', async () => {
    if (dialogo.returnValue !== 'ok') return;
    const nome = slugificar($('#abrir-nome').value);
    if (!nome) return;
    try { carregarDados(await buscar(nome), `${nome}.json`); } catch (err) { alert(err.message); }
  });

  let mostrandoCapa = false;
  $('#acao-capa').addEventListener('click', (e) => {
    mostrandoCapa = !mostrandoCapa;
    e.currentTarget.textContent = mostrandoCapa ? 'Ver proposta' : 'Ver capa';
    iframe.contentWindow?.postMessage({ tipo: 'proposta:capa', mostrar: mostrandoCapa }, location.origin);
  });

  $('#acao-aba').addEventListener('click', () => {
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

  /* ---------- início ---------- */

  (async () => {
    let inicial = null;
    try { inicial = JSON.parse(localStorage.getItem(RASCUNHO_KEY) || 'null'); } catch (e) { /* sem rascunho */ }
    if (!inicial) {
      try { inicial = await buscar(MODELO); } catch (e) { inicial = {}; }
    }
    carregarDados(inicial);
  })();
})();
