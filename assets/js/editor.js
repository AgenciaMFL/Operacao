/*
 * Editor de propostas — gera o JSON que a página index.html exibe.
 * O formulário é montado a partir de ESQUEMA: para adicionar um campo novo,
 * basta incluí-lo aqui e usá-lo em assets/js/proposta.js.
 */
(() => {
  'use strict';

  const RASCUNHO_KEY = 'mfl-proposta-rascunho';
  const MODELO = 'padrao';

  const RECORRENCIAS = [
    ['mensal', 'Mensal'],
    ['unico', 'Pagamento único'],
    ['trimestral', 'Trimestral'],
    ['semestral', 'Semestral'],
    ['anual', 'Anual']
  ];

  const AJUDA_VARIAVEIS = 'Use {cliente} para o nome do cliente. Também: {contato}, {responsavel}, {numero}, {validade}.';

  const ITENS = (rotulo, item) => ({ chave: 'itens', rotulo, tipo: 'textos', item });

  // Campos de cada tipo de bloco de conteúdo
  const TIPOS_BLOCO = {
    subsecao: {
      nome: 'Subtítulo de parte',
      campos: [
        { chave: 'rotulo', rotulo: 'Rótulo (ex.: Tráfego pago)' },
        { chave: 'titulo', rotulo: 'Título', tipo: 'textarea' },
        { chave: 'texto', rotulo: 'Texto (opcional)', tipo: 'textarea' }
      ]
    },
    lista: {
      nome: 'Lista com ✓',
      campos: [
        { chave: 'titulo', rotulo: 'Título (opcional)' },
        { chave: 'colunas', rotulo: 'Colunas', tipo: 'select', opcoes: [['2', '2 colunas'], ['1', '1 coluna']], meia: true, numero: true },
        ITENS('Itens', 'item')
      ]
    },
    fluxo: {
      nome: 'Etapas numeradas',
      campos: [
        { chave: 'titulo', rotulo: 'Título (opcional)' },
        {
          chave: 'etapas', rotulo: 'Etapas', tipo: 'lista', item: 'etapa', resumo: (e) => e.titulo,
          campos: [
            { chave: 'titulo', rotulo: 'Título' },
            { chave: 'descricao', rotulo: 'Descrição (opcional)' },
            { chave: 'tipo', rotulo: 'Tipo', tipo: 'select', opcoes: [['', 'Etapa'], ['divisor', 'Linha divisória (texto sem número)']] }
          ]
        }
      ]
    },
    cartoes: {
      nome: 'Cartões',
      campos: [
        { chave: 'titulo', rotulo: 'Título (opcional)' },
        { chave: 'colunas', rotulo: 'Cartões por linha', tipo: 'select', opcoes: [['3', '3'], ['2', '2'], ['4', '4'], ['1', '1']], meia: true, numero: true },
        { chave: 'numerados', rotulo: 'Numerar cartões', tipo: 'toggle', meia: true },
        {
          chave: 'cartoes', rotulo: 'Cartões', tipo: 'lista', item: 'cartão', resumo: (c) => c.titulo,
          campos: [
            { chave: 'etiqueta', rotulo: 'Etiqueta (opcional)', meia: true },
            { chave: 'titulo', rotulo: 'Título', meia: true },
            { chave: 'texto', rotulo: 'Texto', tipo: 'textarea' },
            ITENS('Itens (opcional)', 'item')
          ]
        }
      ]
    },
    comparativo: {
      nome: 'Comparativo (colunas)',
      campos: [
        { chave: 'titulo', rotulo: 'Título (opcional)' },
        {
          chave: 'colunas', rotulo: 'Colunas', tipo: 'lista', item: 'coluna', resumo: (c) => c.titulo,
          campos: [
            { chave: 'titulo', rotulo: 'Título', meia: true },
            { chave: 'tom', rotulo: 'Marcador', tipo: 'select', meia: true, opcoes: [['positivo', '✓ Positivo (verde)'], ['negativo', '✕ Negativo (vermelho)'], ['neutro', '• Neutro']] },
            ITENS('Itens', 'item')
          ]
        }
      ]
    },
    chips: { nome: 'Etiquetas', campos: [{ chave: 'titulo', rotulo: 'Título (opcional)' }, ITENS('Etiquetas', 'etiqueta')] },
    numeros: {
      nome: 'Números grandes',
      campos: [
        { chave: 'titulo', rotulo: 'Título (opcional)' },
        {
          chave: 'itens', rotulo: 'Números', tipo: 'lista', item: 'número', resumo: (n) => n.numero,
          campos: [{ chave: 'numero', rotulo: 'Número', meia: true }, { chave: 'legenda', rotulo: 'Legenda', meia: true }]
        }
      ]
    },
    citacao: { nome: 'Mensagem de exemplo', campos: [{ chave: 'titulo', rotulo: 'Legenda (opcional)' }, { chave: 'texto', rotulo: 'Mensagem', tipo: 'textarea' }] },
    destaque: { nome: 'Frase de destaque', campos: [{ chave: 'texto', rotulo: 'Frase', tipo: 'textarea' }] },
    nota: { nome: 'Observação', campos: [{ chave: 'texto', rotulo: 'Texto', tipo: 'textarea' }] }
  };

  const CAMPO_LARGURA = { chave: 'largura', rotulo: 'Largura', tipo: 'select', opcoes: [['', 'Inteira'], ['metade', 'Metade (fica ao lado do próximo bloco "metade")']] };

  const ESQUEMA = [
    {
      titulo: 'Cliente e proposta', caminho: null, aberto: true,
      campos: [
        { chave: 'id', rotulo: 'Nome do arquivo', tipo: 'slug', ajuda: 'Letras minúsculas e hífens, ex.: clinica-exemplo. O link fica index.html?p=clinica-exemplo' },
        { chave: 'cliente.nome', rotulo: 'Nome do cliente (aparece na capa)' },
        { chave: 'cliente.contato', rotulo: 'Aos cuidados de', meia: true },
        { chave: 'cliente.cargo', rotulo: 'Cargo', meia: true },
        { chave: 'cliente.segmento', rotulo: 'Segmento do cliente', tipo: 'segmento', ajuda: 'Usado para sugerir depoimentos do mesmo segmento.' },
        { chave: 'proposta.solucao', rotulo: 'Solução proposta', ajuda: 'Aparece no início da proposta. Ex.: Inbound + Outbound + CRM para captação de novos clientes' },
        { chave: 'proposta.numero', rotulo: 'Número da proposta', meia: true },
        { chave: 'proposta.data', rotulo: 'Data', tipo: 'date', meia: true },
        { chave: 'proposta.validadeDias', rotulo: 'Validade (dias)', tipo: 'number', meia: true },
        { chave: 'proposta.responsavel.nome', rotulo: 'Responsável: nome', meia: true },
        { chave: 'proposta.responsavel.cargo', rotulo: 'Responsável: cargo', meia: true },
        { chave: 'proposta.responsavel.whatsapp', rotulo: 'Responsável: WhatsApp', meia: true, ajuda: 'Com DDI e DDD. Ex.: 5521992287210' },
        { chave: 'proposta.responsavel.email', rotulo: 'Responsável: e-mail', tipo: 'email' }
      ]
    },
    {
      titulo: 'Resumo da proposta', caminho: 'proposta',
      campos: [
        {
          chave: 'resumo', rotulo: 'Cartões de resumo (aparecem logo na abertura)', tipo: 'lista', item: 'cartão', resumo: (r) => r.rotulo,
          ajuda: 'O último cartão fica em destaque; use-o para o investimento.',
          campos: [{ chave: 'rotulo', rotulo: 'Rótulo', meia: true }, { chave: 'valor', rotulo: 'Valor', meia: true }]
        }
      ]
    },
    {
      titulo: 'Capa', caminho: 'capa',
      campos: [
        { chave: 'provaSocial.destaque', rotulo: 'Prova social: destaque', meia: true, ajuda: 'Ex.: +370 Negócios' },
        { chave: 'provaSocial.texto', rotulo: 'Prova social: complemento', meia: true, ajuda: 'Ex.: com resultados' },
        { chave: 'rotulo', rotulo: 'Texto acima do nome' },
        { chave: 'subtitulo', rotulo: 'Frase de impacto', tipo: 'textarea', ajuda: 'Coloque **entre asteriscos duplos** o trecho que deve ficar em negrito.' },
        { chave: 'textoBotao', rotulo: 'Texto do botão' },
        { chave: 'faixa', rotulo: 'Textos das faixas animadas', tipo: 'textos', item: 'texto' },
        { chave: 'video', rotulo: 'Vídeo de fundo (MP4)', meia: true },
        { chave: 'videoWebm', rotulo: 'Vídeo de fundo (WebM, opcional)', meia: true },
        { chave: 'poster', rotulo: 'Imagem enquanto o vídeo carrega' }
      ]
    },
    {
      titulo: 'Seções da proposta', caminho: null,
      campos: [
        {
          chave: 'secoes', rotulo: 'Seções (na ordem em que aparecem)', tipo: 'lista', item: 'seção', alternavel: true,
          resumo: (s) => s.menu || s.rotulo || s.titulo,
          novo: () => ({ ativo: true, menu: '', rotulo: '', titulo: '', texto: '', blocos: [] }),
          campos: [
            { chave: 'menu', rotulo: 'Nome no menu', meia: true },
            { chave: 'rotulo', rotulo: 'Rótulo (acima do título)', meia: true },
            { chave: 'titulo', rotulo: 'Título', tipo: 'textarea', ajuda: AJUDA_VARIAVEIS },
            { chave: 'texto', rotulo: 'Texto de abertura', tipo: 'textarea' },
            { chave: 'estilo', rotulo: 'Fundo', tipo: 'select', opcoes: [['', 'Automático (alterna claro e escuro)'], ['claro', 'Claro'], ['escuro', 'Escuro']] },
            { chave: 'blocos', rotulo: 'Blocos de conteúdo', tipo: 'blocos' }
          ]
        }
      ]
    },
    {
      titulo: 'Depoimentos', caminho: 'depoimentos', alternavel: true,
      campos: [
        { chave: 'menu', rotulo: 'Nome no menu', meia: true },
        { chave: 'rotulo', rotulo: 'Rótulo', meia: true },
        { chave: 'titulo', rotulo: 'Título' },
        { chave: 'texto', rotulo: 'Texto (opcional)', tipo: 'textarea' },
        { chave: 'selecionados', rotulo: 'Vídeos desta proposta', tipo: 'depoimentos' }
      ]
    },
    {
      titulo: 'Investimento', caminho: 'investimento', alternavel: true,
      campos: [
        { chave: 'rotulo', rotulo: 'Rótulo', meia: true },
        { chave: 'titulo', rotulo: 'Título', meia: true },
        { chave: 'texto', rotulo: 'Texto (opcional)', tipo: 'textarea' },
        {
          chave: 'servicos', rotulo: 'Serviços / planos (desmarque "Exibir" nos que não entram nesta proposta)', tipo: 'lista', item: 'serviço', resumo: (s) => s.nome, alternavel: true,
          novo: () => ({ ativo: true, rotulo: '', selo: '', nome: '', valor: 0, recorrencia: 'mensal', observacaoValor: '', formas: [], descricao: '', destaque: false, itens: [] }),
          campos: [
            { chave: 'rotulo', rotulo: 'Rótulo (vazio = Serviço 1, 2, 3…)', meia: true },
            { chave: 'selo', rotulo: 'Selo (ex.: Recomendado, Opcional)', meia: true, ajuda: 'Com o selo "Opcional", o serviço fica fora da soma automática.' },
            { chave: 'nome', rotulo: 'Nome do serviço' },
            { chave: 'valor', rotulo: 'Valor (R$)', tipo: 'money', meia: true },
            { chave: 'recorrencia', rotulo: 'Cobrança', tipo: 'select', opcoes: RECORRENCIAS, meia: true },
            { chave: 'observacaoValor', rotulo: 'Observação do valor', ajuda: 'Ex.: + comissionamento (a definir)' },
            {
              chave: 'formas', rotulo: 'Outras formas de pagamento (opcional)', tipo: 'lista', item: 'forma', resumo: (f) => f.rotulo,
              campos: [{ chave: 'rotulo', rotulo: 'Forma', meia: true, ajuda: 'Ex.: À vista (5% de desconto)' }, { chave: 'valor', rotulo: 'Valor', meia: true, ajuda: 'Ex.: R$ 8.550' }]
            },
            { chave: 'descricao', rotulo: 'Frase antes dos itens', ajuda: 'Ex.: Gestão completa das campanhas:' },
            { chave: 'destaque', rotulo: 'Destacar este serviço', tipo: 'toggle' },
            ITENS('O que inclui', 'item')
          ]
        },
        { chave: 'somarServicos', rotulo: 'Somar serviços automaticamente quando não houver totais abaixo', tipo: 'toggle', padrao: true, ajuda: 'Desligue quando os serviços forem planos alternativos (ex.: Plano 1 ou Plano 2).' },
        {
          chave: 'combinacoes', rotulo: 'Totais / combinações (opcional)', tipo: 'lista', item: 'total', resumo: (c) => c.nome,
          novo: () => ({ nome: '', composicao: '', valor: 0, recorrencia: 'mensal', observacao: '', destaque: false }),
          campos: [
            { chave: 'nome', rotulo: 'Nome', meia: true },
            { chave: 'composicao', rotulo: 'Composição', meia: true, ajuda: 'Ex.: R$ 2.000 + R$ 297' },
            { chave: 'valor', rotulo: 'Valor total (R$)', tipo: 'money', meia: true },
            { chave: 'recorrencia', rotulo: 'Cobrança', tipo: 'select', opcoes: RECORRENCIAS, meia: true },
            { chave: 'observacao', rotulo: 'Observação', meia: true },
            { chave: 'destaque', rotulo: 'Destacar', tipo: 'toggle', meia: true }
          ]
        },
        { chave: 'verbaAnuncios.ativo', rotulo: 'Mostrar investimento em anúncios sugerido', tipo: 'toggle', padrao: true },
        { chave: 'verbaAnuncios.valorDia', rotulo: 'Anúncios: valor sugerido por dia (R$)', tipo: 'money', meia: true, ajuda: 'A proposta mostra também a estimativa mensal (x30).' },
        { chave: 'verbaAnuncios.titulo', rotulo: 'Anúncios: título', meia: true },
        { chave: 'verbaAnuncios.observacao', rotulo: 'Anúncios: observação', tipo: 'textarea' },
        { chave: 'nota', rotulo: 'Observação (opcional)', tipo: 'textarea' },
        {
          chave: 'condicoes', rotulo: 'Condições', tipo: 'lista', item: 'condição', resumo: (c) => c.titulo,
          campos: [{ chave: 'titulo', rotulo: 'Título', meia: true }, { chave: 'texto', rotulo: 'Detalhe', meia: true }]
        },
        { chave: 'fechamento', rotulo: 'Frase de fechamento', tipo: 'textarea' }
      ]
    },
    {
      titulo: 'Próximos passos', caminho: 'proximosPassos', alternavel: true,
      campos: [
        { chave: 'rotulo', rotulo: 'Rótulo', meia: true },
        { chave: 'titulo', rotulo: 'Título', meia: true },
        { chave: 'passos', rotulo: 'Passos', tipo: 'textos', item: 'passo' },
        { chave: 'chamada', rotulo: 'Chamada final', ajuda: AJUDA_VARIAVEIS },
        { chave: 'textoBotao', rotulo: 'Texto do botão de aprovação' },
        { chave: 'mensagemWhatsapp', rotulo: 'Mensagem enviada no WhatsApp', tipo: 'textarea' }
      ]
    },
    {
      titulo: 'Agência', caminho: 'agencia',
      campos: [
        { chave: 'nome', rotulo: 'Nome', meia: true },
        { chave: 'slogan', rotulo: 'Slogan', meia: true },
        { chave: 'logo', rotulo: 'Logo (caminho ou URL)', ajuda: 'Padrão: assets/img/mfl-sales-logo.png' },
        { chave: 'site', rotulo: 'Site', meia: true },
        { chave: 'instagram', rotulo: 'Instagram', meia: true },
        { chave: 'corPrimaria', rotulo: 'Cor de destaque', tipo: 'color' }
      ]
    }
  ];

  const $ = (sel) => document.querySelector(sel);
  const form = $('#formulario');
  const iframe = $('#previa');
  let dados = {};
  let timer = null;
  let catalogo = { segmentos: [], depoimentos: [] };   // depoimentos/catalogo.json

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
    for (const f of filhos.flat(Infinity)) {
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

  function vazio(campos) {
    const item = {};
    for (const c of campos) {
      if (c.padrao != null) item[c.chave] = c.padrao;
      else if (c.tipo === 'textos' || c.tipo === 'lista' || c.tipo === 'blocos') item[c.chave] = [];
      else if (c.tipo === 'money' || c.tipo === 'number') item[c.chave] = 0;
      else if (c.tipo === 'toggle') item[c.chave] = false;
      else if (c.tipo === 'select') item[c.chave] = c.numero ? Number(c.opcoes[0][0]) : c.opcoes[0][0];
      else item[c.chave] = '';
    }
    return item;
  }

  let uid = 0;
  const novoId = () => `campo-${++uid}`;

  /* ---------- campos ---------- */

  function campoSimples(def, obj) {
    const id = novoId();
    const valor = obter(obj, def.chave);
    let input;

    if (def.tipo === 'toggle') {
      input = el('input', { id, type: 'checkbox' });
      input.checked = valor == null ? !!def.padrao : !!valor;
      input.addEventListener('change', () => { definir(obj, def.chave, input.checked); alterado(); });
      return el('div', { class: `campo campo-toggle${def.meia ? ' meia' : ''}` },
        el('label', { for: id }, input, el('span', { text: def.rotulo })),
        def.ajuda && el('small', { text: def.ajuda })
      );
    }

    if (def.tipo === 'textarea') {
      input = el('textarea', { id, rows: 2 });
      input.value = valor ?? '';
      const ajustar = () => { input.style.height = 'auto'; input.style.height = `${input.scrollHeight + 2}px`; };
      input.addEventListener('input', ajustar);
      requestAnimationFrame(ajustar);
    } else if (def.tipo === 'select') {
      input = el('select', { id }, def.opcoes.map(([v, r]) => el('option', { value: v, text: r })));
      input.value = valor == null ? (def.padrao ?? def.opcoes[0][0]) : String(valor);
      if (input.selectedIndex < 0) input.value = def.opcoes[0][0];
    } else if (def.tipo === 'color') {
      input = el('input', { id, type: 'color' });
      input.value = /^#[0-9a-f]{6}$/i.test(valor) ? valor : '#39d353';
    } else {
      const tipos = { number: 'number', money: 'number', date: 'date', email: 'email' };
      input = el('input', { id, type: tipos[def.tipo] || 'text' });
      if (def.tipo === 'money') { input.step = '0.01'; input.min = '0'; input.inputMode = 'decimal'; }
      if (def.tipo === 'number') { input.step = '1'; input.min = '0'; }
      input.value = valor ?? '';
    }

    const evento = def.tipo === 'select' ? 'change' : 'input';
    input.addEventListener(evento, () => {
      let v = input.value;
      if (def.tipo === 'number' || def.tipo === 'money' || def.numero) v = v === '' ? 0 : Number(v);
      if (def.tipo === 'slug') {
        v = slugificar(v);
        if (input.value !== v && !input.value.endsWith('-')) input.value = v;
      }
      definir(obj, def.chave, v);
      alterado();
      def.aoMudar?.();
    });

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

  // Lista de textos simples (itens, pilares, passos)
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

  // Lista de itens com vários campos; cada item é um painel recolhível
  function campoLista(def, obj, opcoes = {}) {
    if (!Array.isArray(obj[def.chave])) obj[def.chave] = [];
    const arr = obj[def.chave];
    const caixa = el('div', { class: 'campo lista-blocos' });
    const abertos = new WeakSet();

    const desenhar = () => {
      caixa.replaceChildren(
        el('label', { text: def.rotulo }),
        ...arr.map((item, i) => {
          const nomeItem = () => {
            const r = (opcoes.resumo || def.resumo)?.(item);
            return `${i + 1}. ${r || def.item}`;
          };
          const titulo = el('span', { class: 'bloco-nome', text: nomeItem() });
          const corpo = el('div', { class: 'bloco-campos' });
          let montado = false;
          const montar = () => {
            if (montado) return;
            montado = true;
            corpo.replaceChildren(...(opcoes.campos ? opcoes.campos(item, () => { montado = false; montar(); }) : def.campos.map((c) => campo(c, item))));
          };

          const acoes = el('div', { class: 'bloco-acoes', onclick: (e) => e.stopPropagation() },
            def.alternavel && (() => {
              const chave = el('input', { type: 'checkbox', title: 'Exibir na proposta' });
              chave.checked = item.ativo !== false;
              chave.addEventListener('change', () => { item.ativo = chave.checked; painel.classList.toggle('desativado', !chave.checked); alterado(); });
              return el('label', { class: 'alternar' }, chave, el('span', { text: 'Exibir' }));
            })(),
            botaoIcone('↑', 'Subir', () => mover(arr, i, -1, desenhar)),
            botaoIcone('↓', 'Descer', () => mover(arr, i, 1, desenhar)),
            botaoIcone('⧉', 'Duplicar', () => { arr.splice(i + 1, 0, structuredClone(item)); desenhar(); alterado(); }),
            botaoIcone('×', 'Remover', () => {
              if (confirm(`Remover ${def.item} ${i + 1}?`)) { arr.splice(i, 1); desenhar(); alterado(); }
            }, 'perigo')
          );

          const painel = el('details', { class: `bloco${def.alternavel && item.ativo === false ? ' desativado' : ''}` },
            el('summary', { class: 'bloco-topo' }, titulo, acoes),
            corpo
          );
          painel.addEventListener('toggle', () => {
            if (painel.open) { abertos.add(item); montar(); } else abertos.delete(item);
          });
          // atualiza o nome do painel quando o título muda
          corpo.addEventListener('input', () => { titulo.textContent = nomeItem(); });
          corpo.addEventListener('change', () => { titulo.textContent = nomeItem(); });
          if (abertos.has(item)) { painel.open = true; montar(); }
          return painel;
        }),
        el('div', { class: 'adicionar-linha' },
          opcoes.botoesAdicionar
            ? opcoes.botoesAdicionar((novo) => { arr.push(novo); abertos.add(novo); desenhar(); alterado(); })
            : el('button', {
                type: 'button', class: 'adicionar', text: `+ Adicionar ${def.item}`,
                onclick: () => { const n = def.novo ? def.novo() : vazio(def.campos); arr.push(n); abertos.add(n); desenhar(); alterado(); }
              })
        )
      );
    };
    desenhar();
    return caixa;
  }

  // Blocos de conteúdo de uma seção: o tipo define os campos
  function campoBlocos(def, obj) {
    return campoLista({ ...def, item: 'bloco', alternavel: true }, obj, {
      resumo: (b) => {
        const tipo = TIPOS_BLOCO[b.tipo]?.nome || 'Bloco';
        const texto = b.titulo || b.texto || '';
        return `${tipo}${texto ? ': ' + texto.slice(0, 40) : ''}`;
      },
      campos: (bloco, remontar) => {
        const tipo = TIPOS_BLOCO[bloco.tipo] ? bloco.tipo : 'lista';
        bloco.tipo = tipo;
        const seletor = campoSimples({
          chave: 'tipo', rotulo: 'Tipo de bloco', tipo: 'select', meia: true,
          opcoes: Object.entries(TIPOS_BLOCO).map(([k, t]) => [k, t.nome]),
          aoMudar: () => {
            // completa os campos do novo tipo sem apagar o que já foi digitado
            const base = vazio(TIPOS_BLOCO[bloco.tipo].campos);
            for (const [k, v] of Object.entries(base)) if (bloco[k] == null || (Array.isArray(v) && !Array.isArray(bloco[k]))) bloco[k] = v;
            remontar();
          }
        }, bloco);
        return [seletor, campoSimples({ ...CAMPO_LARGURA, meia: true }, bloco), ...TIPOS_BLOCO[tipo].campos.map((c) => campo(c, bloco))];
      },
      botoesAdicionar: (adicionar) => [
        el('span', { class: 'adicionar-rotulo', text: '+ Adicionar:' }),
        ...Object.entries(TIPOS_BLOCO).map(([k, t]) =>
          el('button', { type: 'button', class: 'adicionar', text: t.nome, onclick: () => adicionar({ tipo: k, ...vazio(t.campos) }) }))
      ]
    });
  }

  // Segmento do cliente: texto livre com sugestões vindas do catálogo
  function campoSegmento(def, obj) {
    const id = novoId();
    const lista = el('datalist', { id: `${id}-opcoes` }, catalogo.segmentos.map((s) => el('option', { value: s })));
    const input = el('input', { id, type: 'text', list: `${id}-opcoes` });
    input.value = obter(obj, def.chave) ?? '';
    input.addEventListener('input', () => { definir(obj, def.chave, input.value); alterado(); });
    return el('div', { class: 'campo' }, el('label', { for: id, text: def.rotulo }), input, lista, def.ajuda && el('small', { text: def.ajuda }));
  }

  // Seleção de vídeos de depoimento a partir do catálogo
  function campoDepoimentos(def, obj) {
    if (!Array.isArray(obj[def.chave])) obj[def.chave] = [];
    const escolhidos = obj[def.chave];
    const caixa = el('div', { class: 'campo selecao-depoimentos' });
    let filtro = '';

    const desenhar = () => {
      const todos = catalogo.depoimentos;
      const visiveis = todos.filter((d) => !filtro || d.segmento === filtro);
      const segmentoCliente = (dados.cliente?.segmento || '').trim().toLowerCase();

      const seletor = el('select', { 'aria-label': 'Filtrar por segmento' },
        el('option', { value: '', text: 'Todos os segmentos' }),
        catalogo.segmentos.map((sg) => el('option', { value: sg, text: sg })));
      seletor.value = filtro;
      seletor.addEventListener('change', () => { filtro = seletor.value; desenhar(); });

      const sugerir = el('button', {
        type: 'button', class: 'adicionar',
        text: 'Sugerir pelo segmento do cliente',
        onclick: () => {
          const doSegmento = todos.filter((d) => (d.segmento || '').toLowerCase() === segmentoCliente).map((d) => d.id);
          if (!doSegmento.length) { alert('Nenhum depoimento cadastrado para o segmento do cliente. Preencha o segmento em "Cliente e proposta" ou escolha manualmente.'); return; }
          for (const idDep of doSegmento) if (!escolhidos.includes(idDep)) escolhidos.push(idDep);
          filtro = dados.cliente?.segmento || '';
          desenhar(); alterado();
        }
      });

      const itens = visiveis.map((d) => {
        const chk = el('input', { type: 'checkbox' });
        chk.checked = escolhidos.includes(d.id);
        chk.addEventListener('change', () => {
          const i = escolhidos.indexOf(d.id);
          if (chk.checked && i < 0) escolhidos.push(d.id);
          if (!chk.checked && i >= 0) escolhidos.splice(i, 1);
          desenhar(); alterado();
        });
        return el('label', { class: 'depo-item' }, chk,
          el('span', { class: 'depo-texto' },
            el('strong', { text: d.cliente || d.pessoa || d.id }),
            el('span', { text: [d.segmento, d.pessoa].filter(Boolean).join(' · ') })
          ),
          !d.video && el('span', { class: 'depo-sem-video', text: 'sem vídeo' })
        );
      });

      const ordem = escolhidos.map((idDep, i) => {
        const d = todos.find((x) => x.id === idDep);
        return el('div', { class: 'linha-texto depo-ordem' },
          el('span', { class: 'depo-nome', text: `${i + 1}. ${d ? (d.cliente || d.pessoa) : idDep + ' (não encontrado no catálogo)'}` }),
          botaoIcone('↑', 'Subir', () => mover(escolhidos, i, -1, desenhar)),
          botaoIcone('↓', 'Descer', () => mover(escolhidos, i, 1, desenhar)),
          botaoIcone('×', 'Tirar da proposta', () => { escolhidos.splice(i, 1); desenhar(); alterado(); }, 'perigo')
        );
      });

      caixa.replaceChildren(
        el('label', { text: def.rotulo }),
        el('div', { class: 'depo-filtros' }, seletor, sugerir),
        todos.length
          ? el('div', { class: 'depo-lista' }, itens.length ? itens : el('small', { text: 'Nenhum depoimento neste segmento.' }))
          : el('small', { text: 'Catálogo vazio ou não encontrado (depoimentos/catalogo.json).' }),
        el('small', { text: escolhidos.length ? 'Ordem na proposta:' : 'Nenhum vídeo selecionado: a seção não aparece para o cliente.' }),
        ...ordem
      );
    };
    desenhar();
    return caixa;
  }

  function campo(def, obj) {
    if (def.tipo === 'depoimentos') return campoDepoimentos(def, obj);
    if (def.tipo === 'segmento') return campoSegmento(def, obj);
    if (def.tipo === 'lista') return campoLista(def, obj);
    if (def.tipo === 'blocos') return campoBlocos(def, obj);
    if (def.tipo === 'textos') return campoTextos(def, obj);
    return campoSimples(def, obj);
  }

  /* ---------- formulário ---------- */

  function montarFormulario() {
    const abertos = new Set([...form.querySelectorAll(':scope > details[open]')].map((d) => d.dataset.grupo));
    const primeiraVez = !form.children.length;

    form.replaceChildren(...ESQUEMA.map((grupo) => {
      const obj = objetoDa(grupo.caminho);
      const resumo = el('summary', {}, el('span', { text: grupo.titulo }));
      let detalhes;

      if (grupo.alternavel) {
        const chave = el('input', { type: 'checkbox', title: 'Mostrar esta seção na proposta' });
        chave.checked = obj.ativo !== false;
        chave.addEventListener('change', () => {
          obj.ativo = chave.checked;
          detalhes.classList.toggle('desativado', !chave.checked);
          alterado();
        });
        resumo.append(el('label', { class: 'alternar', onclick: (e) => e.stopPropagation() }, chave, el('span', { text: 'Exibir' })));
      }

      detalhes = el('details', {
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

  // Rascunhos do formato antigo (antes das seções) não abrem no editor novo
  function formatoAtual(d) {
    return d && typeof d === 'object' && Array.isArray(d.secoes) && d.cliente && 'nome' in d.cliente;
  }

  /* ---------- ações ---------- */

  $('#acao-baixar').addEventListener('click', () => {
    if (!dados.id) dados.id = slugificar(dados.cliente?.nome) || 'proposta';
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
      const d = JSON.parse(await arquivo.text());
      if (!formatoAtual(d)) throw new Error('formato');
      carregarDados(d, arquivo.name);
    } catch (err) {
      alert('Este arquivo não é um JSON de proposta válido.');
    }
  });

  $('#acao-novo').addEventListener('click', async () => {
    if (!confirm('Começar uma nova proposta a partir do modelo padrão? O rascunho atual será substituído.')) return;
    try {
      const modelo = await buscar(MODELO);
      modelo.id = '';
      carregarDados(modelo, 'modelo padrão');
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
  })();
})();
