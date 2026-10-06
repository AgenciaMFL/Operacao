/*
 * Proposta comercial dinâmica — MFL Sales.
 *
 * O conteúdo é gerado a partir das escolhas do gerador (modelo, público, CRM,
 * escopo e valores), seguindo a especificação "Gerador de Propostas MFL Sales":
 *   modelo 1 · Inbound
 *   modelo 2 · Outbound com BDR + SDR
 *   modelo 3 · Outbound com Treinamento
 *   modelo 4 · Inbound + Outbound (Outbound BDR + SDR ou Treinamento)
 *
 *   index.html?p=nome-do-arquivo   → carrega propostas/nome-do-arquivo.json
 *   index.html?preview=1           → usado pelo editor (lê o rascunho do navegador)
 */
(() => {
  'use strict';

  const PREVIEW_KEY = 'mfl-proposta-rascunho';
  const params = new URLSearchParams(location.search);
  const isPreview = params.has('preview');
  const slug = (params.get('p') || 'padrao').replace(/[^a-z0-9_-]/gi, '');

  // Identidade fixa da agência
  const AGENCIA = {
    nome: 'MFL Sales',
    slogan: 'Estratégia · Performance · Resultados',
    logo: 'assets/img/mfl-sales-logo.png',
    site: 'https://www.agenciamfl.com.br',
    instagram: '@agenciamfl'
  };

  // Padrões da capa (layout do Figma) — editáveis em "Capa" no editor
  const CAPA_PADRAO = {
    rotulo: 'Proposta comercial para',
    provaDestaque: '+370 Negócios',
    provaTexto: 'com resultados',
    frase: 'Enquanto outras agências mandam relatório 2x por semana, você acompanha **cada real investido em tempo real** e vê exatamente onde ele virou venda.',
    faixa: ['+7 anos'],
    botao: 'Ver meu orçamento',
    video: 'assets/video/capa-fundo.mp4',
    videoWebm: 'assets/video/capa-fundo.webm',
    poster: 'assets/video/capa-fundo.jpg'
  };

  const SCOPE_PADRAO = { meta: true, google: true, lp: true, wpp: true, remkt: true, criativos: true, roteiro: true, relatorio: true };

  const $ = (sel) => document.querySelector(sel);

  let S = null;          // estado da proposta
  let aberta = isPreview;
  let observer = null;
  let catalogo = [];     // biblioteca de depoimentos (depoimentos/catalogo.json)

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

  const lista = (v) => (Array.isArray(v) ? v : []);
  const vazio = (texto) => el('span', { class: 'ph-vazio', text: texto });

  // Texto com trechos em **negrito**, sem interpretar HTML
  function rico(texto) {
    return String(texto || '').split(/\*\*(.+?)\*\*/g)
      .map((parte, i) => (i % 2 ? el('strong', { text: parte }) : parte))
      .filter((parte) => parte !== '');
  }

  function lerData(iso) {
    if (!iso) return null;
    const [a, m, d] = String(iso).split('-').map(Number);
    if (!a || !m || !d) return null;
    return new Date(a, m - 1, d);
  }

  const formatarData = (data) => data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  function dataValidade() {
    const base = lerData(S.data);
    const dias = Number(S.validadeDias);
    if (!base || !dias) return null;
    base.setDate(base.getDate() + dias);
    return base;
  }

  // Valores aceitam "1.500", "1.500,00" ou "R$ 1.500/mês"
  const limpar = (v) => String(v ?? '').replace(/^\s*R\$\s*/i, '').replace(/\/\s*m[eê]s\s*$/i, '').trim();
  function paraNumero(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const t = limpar(v);
    if (!t) return null;
    const n = Number(t.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }
  const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

  // Preço por mês, ou marcador "R$ [valor]/mês" quando ainda não foi preenchido
  function precoMes(v, classe) {
    const n = paraNumero(v);
    if (n == null) return el('strong', { class: classe }, vazio('R$ [valor]'), el('small', { text: '/mês' }));
    return el('strong', { class: classe }, brl(n), el('small', { text: '/mês' }));
  }

  function linkContato(mensagem) {
    const r = S.responsavel || {};
    const zap = String(r.whatsapp || '').replace(/\D/g, '');
    if (zap) return `https://wa.me/${zap}?text=${encodeURIComponent(mensagem || '')}`;
    if (r.email) return `mailto:${r.email}?subject=${encodeURIComponent('Proposta MFL Sales')}&body=${encodeURIComponent(mensagem || '')}`;
    return null;
  }

  function formatarTelefone(t) {
    const d = String(t).replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return t;
  }

  function iniciais(nome) {
    const partes = String(nome || '').trim().split(/\s+/);
    return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  }

  const marca = (classe) => el('img', { src: AGENCIA.logo, alt: AGENCIA.nome, class: `marca-logo ${classe || ''}` });
  const nomeCliente = () => (S.cliente || '').trim();

  /* ---------- configuração derivada (cfg da especificação) ---------- */

  function cfg() {
    const m = String(S.modelo || '4');
    const hasIn = m === '1' || m === '4';
    const mfl = S.crm !== 'cli';
    return {
      m, hasIn, mfl,
      b2c: hasIn && S.pub === 'b2c',
      crm: mfl ? 'CRM MFL Sales' : 'CRM',
      crmDo: mfl ? 'no CRM MFL Sales' : 'no CRM da sua empresa',
      out: m === '2' ? 'bdr' : m === '3' ? 'train' : m === '4' ? (S.outTipo === 'train' ? 'train' : 'bdr') : null,
      sc: { ...SCOPE_PADRAO, ...(S.sc || {}) }
    };
  }

  const anuncios = (sc) => [sc.meta && 'Meta Ads', sc.google && 'Google Ads'].filter(Boolean).join(' + ') || 'Anúncios';
  const FUNIL_CLIENTE = 'Estruturação do funil, automações e follow-ups no CRM da sua empresa';

  const itensInbound = (c) => [
    'Estratégia de campanhas',
    c.sc.meta && 'Tráfego no Meta Ads (Instagram e Facebook)',
    c.sc.google && 'Tráfego no Google Ads',
    c.sc.lp && (c.b2c ? 'Landing Page focada na oferta' : 'Landing Page focada na dor do cliente'),
    c.sc.wpp && 'Campanhas de conversa no WhatsApp',
    c.sc.remkt && 'Remarketing',
    c.sc.criativos && 'Copys, criativos estáticos e edições de vídeos',
    'Testes e otimização contínua',
    c.sc.roteiro && 'Roteiro de atendimento para o time',
    c.sc.relatorio && 'Relatório mensal de resultados',
    !c.mfl && FUNIL_CLIENTE
  ].filter(Boolean);

  const itensBdr = (c) => ['Definição de ICP e segmentação', 'BDR: extração mensal de contatos e importação ' + c.crmDo,
    'SDR: primeiro contato, cadência, qualificação e agendamento', 'Scripts, templates e ligações', 'Relatório mensal de prospecção',
    !c.mfl && FUNIL_CLIENTE].filter(Boolean);

  const itensTrain = (c) => ['Definição de ICP e segmentação', 'Extração mensal de contatos', 'Importação e organização ' + c.crmDo,
    'Scripts, templates e cadência de contato', 'Treinamento da equipe comercial', 'Relatório mensal de prospecção',
    !c.mfl && FUNIL_CLIENTE].filter(Boolean);

  const itensCrm = (c) => ['Implantação e configuração do CRM', 'Funil de vendas personalizado', 'Integração com o WhatsApp', 'Automações e follow-ups',
    (c.out || !c.b2c) ? 'Agendamento com lembretes de reunião' : 'Mensagens automáticas de atendimento',
    'Recuperação de oportunidades paradas', 'Rastreamento da origem dos leads', 'Painel de resultados e IA no atendimento'];

  /* ---------- componentes ---------- */

  const blocoTitulo = (t) => (t ? el('h3', { class: 'bloco-titulo', text: t }) : null);
  const bloco = (classe, ...filhos) => el('div', { class: `bloco ${classe || ''} revelar` }, ...filhos);
  const par = (...blocos) => el('div', { class: 'blocos-par' }, ...blocos);

  function listaCheck(itens, colunas = 2) {
    return el('ul', { class: `b-lista${colunas === 2 ? ' duas-colunas' : ''}` }, itens.filter(Boolean).map((t) => el('li', {}, rico(t))));
  }

  // Etapas numeradas; { divisor: 'texto' } vira a linha de passagem para o time do cliente
  function etapas(lista_, { inicio = 1, compacto = false } = {}) {
    const itens = lista_.filter(Boolean);
    let n = inicio - 1;
    const numeradas = itens.filter((e) => !e.divisor).length;
    const porLinha = numeradas <= 5 ? numeradas : [4, 3, 5].find((q) => numeradas % q === 0) || 4;
    let doCliente = false;
    return el('ol', { class: `b-fluxo${compacto ? ' compacto' : ''}`, style: compacto ? `--por-linha:${porLinha}` : null },
      itens.map((e) => {
        if (e.divisor) { doCliente = true; return el('li', { class: 'fluxo-divisor' }, rico(e.divisor)); }
        n += 1;
        return el('li', { class: `fluxo-etapa${(n - inicio + 1) % porLinha === 0 ? ' fim-linha' : ''}${doCliente || e.cliente ? ' do-cliente' : ''}` },
          el('span', { class: 'fluxo-num', text: n }),
          el('div', { class: 'fluxo-texto' }, el('strong', { text: e[0] }), e[1] && el('span', { text: e[1] })));
      }));
  }

  function cartoes(lista_, colunas) {
    const itens = lista_.filter(Boolean);
    return el('div', { class: `b-cartoes col-${colunas || Math.min(itens.length, 3)}` },
      itens.map((c) => el('article', { class: 'cartao' },
        c.etiqueta && el('span', { class: 'cartao-etiqueta', text: c.etiqueta }),
        el('h4', { text: c.titulo }),
        c.texto && el('p', { text: c.texto }),
        c.conteudo || null)));
  }

  const destaque = (t) => el('p', { class: 'b-destaque' }, rico(t));
  const nota = (t) => el('p', { class: 'b-nota', text: t });

  // Uma faixa da página: rótulo, título, texto de abertura e blocos
  function faixaSecao(id, rotulo, titulo, texto, blocos, extra = {}) {
    return el('section', { class: `secao secao-banda ${extra.classe || ''}`, id, 'data-estilo': extra.estilo || null },
      el('div', { class: 'container' },
        el('header', { class: 'secao-cabecalho revelar' },
          el('span', { class: 'secao-rotulo' }, el('span', { text: rotulo })),
          el('h2', { class: 'secao-titulo', text: titulo }),
          texto && el('div', { class: 'secao-texto' }, el('p', {}, rico(texto)))
        ),
        el('div', { class: 'blocos' }, blocos.filter(Boolean))
      ));
  }

  /* ---------- seções (ordem da especificação) ---------- */

  const SECOES = {};

  SECOES.porque = (c) => faixaSecao('por-que-a-mfl', 'Por que a MFL Sales',
    'Não entregamos leads. Entregamos um processo comercial funcionando.',
    `Muitas empresas já contrataram tráfego, compraram listas ou implantaram um CRM, e continuaram sem previsibilidade de vendas. Isso acontece porque cada peça foi resolvida separadamente. A MFL Sales une estratégia, execução e tecnologia em uma única operação, ${c.b2c ? 'do primeiro contato até o fechamento da venda' : 'do primeiro contato até a reunião com o seu comercial'}.`,
    [
      bloco('', blocoTitulo('O que nos diferencia'), cartoes([
        { titulo: 'Processo completo, não peças soltas', texto: 'Atração, prospecção, CRM e follow-up são pensados juntos e conversam entre si.' },
        c.mfl
          ? { titulo: 'CRM próprio, implantado por nós', texto: 'Você não recebe só um acesso. Recebe o funil montado, as automações rodando e o processo desenhado para o seu negócio.' }
          : { titulo: 'Seu CRM, organizado por nós', texto: 'Trabalhamos no CRM que sua empresa já usa e estruturamos dentro dele o funil, as etapas e as rotinas de follow-up.' },
        c.b2c
          ? { titulo: 'Foco em venda, não em volume', texto: 'Cada etapa é feita para atrair e levar ao seu time quem tem potencial real de compra.' }
          : { titulo: 'Foco em reunião, não em volume', texto: 'Cada etapa é feita para qualificar e levar ao seu comercial quem tem potencial real de compra.' },
        { titulo: 'Nenhuma oportunidade perdida', texto: 'Follow-ups, lembretes e recuperação de contatos parados garantem que nenhum lead fique esquecido.' },
        { titulo: 'Decisões baseadas em dados', texto: 'Você acompanha de onde vêm as oportunidades, em que etapa estão e o que está convertendo.' },
        { titulo: 'Ajuste contínuo', texto: 'Campanhas, listas, abordagens e funil são testados e otimizados conforme os resultados.' }
      ], 3)),
      bloco('', destaque('Sua empresa foca em vender e entregar. A MFL Sales estrutura e opera a máquina que traz as oportunidades.'))
    ]);

  SECOES.como = () => faixaSecao('como-funciona', 'Como trabalhamos', 'Quatro etapas, do diagnóstico à otimização',
    'Uma operação montada em etapas claras, com acompanhamento próximo em cada uma delas.',
    [
      bloco('', etapas([
        ['Diagnóstico', 'Entendemos o seu negócio, o seu cliente ideal e o seu processo de venda atual'],
        ['Estruturação', 'Montamos canais, funil, automações e materiais de abordagem'],
        ['Execução', 'Colocamos a operação para rodar e gerar oportunidades todos os meses'],
        ['Otimização', 'Analisamos os números e ajustamos o que traz mais resultado']
      ], { compacto: true }))
    ]);

  SECOES.resultados = (c) => {
    const url = String(S.videoUrl || '').trim();
    const ok = /^https?:\/\//i.test(url) || /\.(mp4|webm)$/i.test(url);
    const fonte = ok ? fonteVideo(url) : null;
    const capa = S.thumb || fonte?.capa;
    const principal = el('div', { class: 'video-principal' },
      el('button', {
        type: 'button', class: 'depoimento-video video-grande', disabled: !fonte,
        'aria-label': fonte ? 'Assistir ao depoimento em vídeo' : 'Vídeo ainda não adicionado',
        onclick: () => abrirVideo({ video: url, pessoa: 'Depoimento em vídeo' })
      },
        capa ? el('img', { src: capa, alt: '' }) : el('span', { class: 'video-sem-capa', text: 'DEPOIMENTO EM VÍDEO' }),
        el('span', { class: 'depoimento-play', 'aria-hidden': 'true' })
      ),
      fonte
        ? el('a', { class: 'video-link', href: url, target: '_blank', rel: 'noopener', text: 'Assistir ao vídeo →' })
        : el('p', { class: 'video-link' }, vazio('[Adicione o link do vídeo no painel]'))
    );

    const extras = lista(S.depoimentos).map((id) => catalogo.find((d) => d.id === id)).filter(Boolean);
    return faixaSecao('resultados', 'Resultados', 'Quem já estruturou o comercial com a MFL Sales',
      'Antes de falar do que vamos fazer, veja quem já passou por esse processo.',
      [
        bloco('', principal),
        extras.length ? bloco('', blocoTitulo('Mais depoimentos'), cartoesDepoimento(extras)) : null,
        bloco('', cartoes([
          { titulo: 'Estratégia', texto: 'Definimos para quem vender, com qual mensagem e por quais canais.' },
          { titulo: 'Execução', texto: 'Operamos campanhas, prospecção e follow-up com rotina e método.' },
          { titulo: 'Tecnologia', texto: 'Funil e automações organizam cada oportunidade até o fechamento.' }
        ], 3)),
        bloco('', destaque(`A MFL Sales estrutura operações comerciais de aquisição, ${c.b2c ? 'do primeiro contato à venda' : 'do primeiro contato à reunião agendada'}, com método, tecnologia e acompanhamento próximo.`))
      ]);
  };

  SECOES.inbound = (c) => {
    const b2c = c.b2c;
    const lp = c.sc.lp;
    const dest = lp ? (b2c ? 'para uma Landing Page focada na oferta' : 'para uma Landing Page focada no problema')
      : (c.sc.wpp ? 'direto para uma conversa no WhatsApp ou para um formulário' : 'direto para um formulário de contato');
    const texto = b2c
      ? `O Inbound alcança quem já procura o que sua empresa vende e desperta interesse em quem ainda não começou a procurar. O anúncio não leva para o site institucional. Ele leva ${dest}, onde o cliente deixa o contato e entra direto no seu atendimento.`
      : `O Inbound captura a demanda que já existe, ou seja, pessoas e empresas que já buscam uma solução. Também alcança quem tem o problema mas ainda não começou a procurar. O anúncio não leva para o site institucional. Ele leva ${dest}, com perguntas que qualificam o lead antes do primeiro contato.`;
    const captura = c.sc.wpp ? 'Formulário ou WhatsApp' : 'Formulário';
    const fluxo = b2c ? [
      [anuncios(c.sc), 'Anúncio sobre o produto ou serviço que sua empresa vende'],
      lp && ['Landing Page', 'Página focada na oferta, não no institucional'],
      ['Captura do contato', captura + ', com as informações do cliente'],
      [c.crm, 'Entrada automática, com todo o contexto'],
      ['Automação e follow-up', 'Resposta rápida e nenhum contato esquecido'],
      ['Atendimento', 'Seu time continua a conversa já sabendo o que o cliente procura'],
      ['Proposta, pedido ou negociação', 'Conduzidos pelo seu time até o fechamento']
    ] : [
      [anuncios(c.sc), 'Anúncio sobre o problema que sua empresa resolve'],
      lp && ['Landing Page', 'Página focada na dor, não no institucional'],
      ['Formulário de qualificação', (c.sc.wpp ? 'Formulário ou WhatsApp, ' : '') + 'informações do lead antes do primeiro contato'],
      [c.crm, 'Entrada automática, com todo o contexto'],
      ['Automação e follow-up', 'Nenhum lead esquecido'],
      ['Contato comercial', 'Seu time já sabe o problema antes de ligar'],
      ['Reunião agendada', 'Com o contexto completo do lead']
    ];
    const pratica = b2c
      ? `Alguém vê um anúncio do que sua empresa vende e clica. ${lp ? 'Chega a uma página feita para aquela oferta e deixa o contato.' : 'Já cai em uma conversa ou formulário e deixa o contato.'} Em segundos, está no CRM com todas as informações e recebe a primeira mensagem. Seu time continua o atendimento até a venda.`
      : `Alguém pesquisa pelo problema que sua empresa resolve e clica em um anúncio que fala exatamente dele. ${lp ? 'Chega a uma página feita para essa pessoa e preenche o formulário.' : 'Responde às perguntas de qualificação e deixa o contato.'} Em segundos, o lead está no CRM com todas as informações.`;
    return faixaSecao('inbound', 'Inbound',
      b2c ? 'Atrair clientes no momento em que eles estão prontos para comprar' : 'Capturar clientes no momento em que a necessidade aparece',
      texto,
      [
        bloco('', blocoTitulo(b2c ? 'Do anúncio à venda' : 'Do anúncio à reunião'), etapas(fluxo)),
        par(
          bloco('', blocoTitulo('O que entregamos'), listaCheck(itensInbound(c).filter((i) => i !== FUNIL_CLIENTE), 1)),
          bloco('', el('figure', { class: 'b-citacao caixa-pratica' }, el('figcaption', { text: 'Na prática' }), el('blockquote', { text: pratica })))
        ),
        bloco('', nota('A verba de anúncios é paga diretamente pelo cliente às plataformas e não está incluída neste investimento.')),
        bloco('', destaque(b2c ? 'O objetivo não é gerar cliques. É gerar atendimentos com quem tem potencial real de compra.'
          : 'O objetivo não é gerar formulários. É gerar conversas com quem tem potencial real de compra.'))
      ]);
  };

  const SINAIS = 'Não buscamos contatos aleatórios. Buscamos perfis com sinais de que precisam do que vocês vendem: segmento, porte, momento de crescimento e estrutura atual.';

  // Coluna "quem faz" com etapas numeradas
  function colunaQuem(quem, titulo, texto, etapasLista, inicio, escura) {
    return el('article', { class: `quem${escura ? ' quem-cliente' : ''}` },
      el('span', { class: 'quem-rotulo', text: quem }),
      el('h4', { text: titulo }),
      texto && el('p', { text: texto }),
      etapas(etapasLista, { inicio }));
  }

  SECOES.bdr = (c) => faixaSecao('outbound', 'Outbound',
    'Ir até quem ainda não está procurando, mas tem o perfil para comprar',
    'O Outbound não é disparo em massa. É um processo para encontrar quem tem o perfil ideal, chegar até o decisor e transformar o contato em reunião. Neste modelo, a MFL Sales executa toda a prospecção com dois profissionais dedicados a etapas diferentes, e o seu time recebe a reunião agendada.',
    [
      bloco('', el('div', { class: 'quem-grade col-3' },
        colunaQuem('MFL Sales', 'Estratégia', 'Define quem deve ser abordado e com qual mensagem.',
          [['ICP', 'Perfil ideal de cliente'], ['Segmentação', 'Setor, porte, região e características']], 1),
        colunaQuem('MFL Sales · BDR', 'Construção da base', 'Encontra as empresas e os decisores certos e organiza tudo no CRM.',
          [['Extração', 'Empresa, decisor e dados de contato'], ['Importação', 'Lista organizada ' + c.crmDo]], 3),
        colunaQuem('MFL Sales · SDR', 'Contato e agendamento', 'Faz o primeiro contato, conduz a cadência, qualifica e agenda.',
          [['Abordagem', 'Scripts, templates e ligações'], ['Cadência', 'Follow-ups até gerar conexão'], ['Qualificação', 'Necessidade, momento e fit'], ['Agendamento', 'Reunião na agenda do seu comercial']], 5)
      )),
      bloco('', etapas([{ divisor: 'A partir daqui: **o comercial da sua empresa** assume, com a reunião agendada e o contexto do lead.' },
        ['Reunião, proposta e fechamento', 'Conduzidos pelo seu time, com todo o histórico do lead no CRM']], { inicio: 9 })),
      bloco('', cartoes([
        { titulo: 'Base qualificada', texto: 'Contatos que seguem o perfil ideal definido na estratégia.' },
        { titulo: 'Cadência estruturada', texto: 'Ligações, mensagens e follow-ups com ritmo e roteiro.' },
        { titulo: 'Reunião na agenda', texto: 'Seu time recebe o lead pronto para a conversa comercial.' }
      ], 3)),
      bloco('', destaque(SINAIS))
    ]);

  SECOES.train = (c) => faixaSecao('outbound', 'Outbound',
    'Estruturar a prospecção e preparar o seu time para executar',
    'O Outbound não é disparo em massa. É um processo para encontrar quem tem o perfil ideal, chegar até o decisor e transformar o contato em reunião. Neste modelo, a MFL Sales monta toda a inteligência e a estrutura da prospecção e treina a sua equipe comercial para executar os contatos. O conhecimento fica dentro da empresa.',
    [
      bloco('', el('div', { class: 'quem-grade col-2' },
        colunaQuem('Executado pela MFL Sales', 'Inteligência, base e preparação', null, [
          ['ICP', 'Definição do perfil ideal de cliente'],
          ['Segmentação', 'Setor, porte, região e características'],
          ['Extração', 'Empresa, decisor e dados de contato'],
          ['Importação', 'Lista organizada ' + c.crmDo],
          ['Material de abordagem', 'Scripts de ligação, templates de mensagem e cadência de follow-up'],
          ['Treinamento', 'Preparação da equipe para abordagem, qualificação e agendamento']], 1),
        colunaQuem('Executado pelo seu time', 'Contato e fechamento', 'Com script e cadência entregues por nós.', [
          ['Abordagem e cadência', 'Contatos feitos com o material entregue'],
          ['Qualificação e agendamento', 'Com o roteiro de descoberta'],
          ['Reunião, proposta e fechamento', 'Conduzidos pelo seu time']], 7, true)
      )),
      bloco('', cartoes([
        { titulo: 'O que fica com a sua empresa', texto: 'Lista qualificada, scripts, templates, cadência e um time treinado para usar tudo isso.' },
        { titulo: 'Por que esse modelo', texto: 'Ideal para quem já tem time comercial e quer prospectar com método, sem depender de terceiros.' }
      ], 2)),
      bloco('', destaque(SINAIS)),
      bloco('', destaque('Vocês recebem a lista certa, o roteiro pronto e o time preparado, e mantêm o controle da operação.'))
    ]);

  SECOES.crm = (c) => {
    const fIn = c.b2c
      ? ['Lead captado', 'Primeiro atendimento', 'Interesse confirmado', 'Proposta / orçamento', 'Negociação', 'Pedido / fechamento', 'Fechado ganho / perdido']
      : ['Lead captado', 'Qualificação', 'Contato', 'Reunião agendada', 'Reunião realizada', 'Proposta', 'Negociação', 'Fechado ganho / perdido'];
    const fOut = ['Contato importado', 'Em abordagem', 'Conexão', 'Interesse', 'Reunião agendada', 'Reunião realizada', 'Proposta', 'Negociação', 'Fechado ganho / perdido'];
    const ambos = c.hasIn && c.out;
    const config = c.mfl
      ? ['Funil de vendas adaptado ao seu processo', 'Caixa de entrada unificada (WhatsApp, e-mail, formulários e ligações)', 'Automações em cada etapa do funil', 'Follow-ups automáticos',
        (c.out || !c.b2c) ? 'Agenda integrada, com confirmação e lembrete de reunião' : 'Mensagens automáticas de boas-vindas e retomada de contato',
        'Tarefas e distribuição de leads para o time', 'Recuperação de oportunidades paradas', 'Histórico completo de cada contato', 'Painel de acompanhamento dos resultados',
        'Recursos de IA para apoiar o atendimento inicial e organizar as informações dos leads']
      : ['Funil de vendas adaptado ao seu processo', 'Etapas e critérios claros para cada fase do funil', 'Cadastro organizado de leads e contatos', 'Rotinas de follow-up para cada etapa',
        'Automações, de acordo com os recursos do seu CRM', 'Padronização dos registros e do histórico', 'Orientação do time para usar o funil no dia a dia'];
    const funil = (t, arr) => bloco('', blocoTitulo(t), etapas(arr.map((s) => [s, ''])));
    const configBloco = (colunas) => bloco('', blocoTitulo(c.mfl ? 'O que configuramos' : 'O que estruturamos no seu CRM'), listaCheck(config, colunas));
    const texto = c.mfl
      ? `${ambos ? 'Todos os canais, Inbound e Outbound, convergem para o mesmo CRM MFL Sales' : 'Todas as oportunidades entram no CRM MFL Sales'}. Montamos o funil de vendas, as automações e os follow-ups para que nenhuma oportunidade se perca entre o primeiro contato e o fechamento.`
      : `${ambos ? 'Todos os canais, Inbound e Outbound, convergem para o CRM que sua empresa já utiliza' : 'Todas as oportunidades entram no CRM que sua empresa já utiliza'}. Estruturamos dentro dele o funil de vendas, as etapas e as rotinas de follow-up, aproveitando os recursos que a ferramenta oferece.`;
    return faixaSecao('tecnologia', 'Tecnologia da operação',
      'Do primeiro contato ao fechamento: um processo comercial estruturado', texto,
      [
        ambos ? par(funil('Funil Inbound', fIn), funil('Funil Outbound', fOut)) : par(c.hasIn ? funil('Funil Inbound', fIn) : funil('Funil Outbound', fOut), configBloco(1)),
        ambos ? configBloco(2) : null,
        !ambos ? bloco('', cartoes([
          { titulo: 'Visão do funil', texto: 'Saiba quantas oportunidades existem em cada etapa.' },
          { titulo: 'Origem dos leads', texto: 'Entenda quais canais trazem mais resultado.' },
          { titulo: 'Rotina do time', texto: 'Cada contato com próximo passo e responsável.' }
        ], 3)) : null,
        bloco('', destaque('A tecnologia faz o trabalho operacional para que o comercial gaste tempo apenas com quem pode comprar.'))
      ]);
  };

  function calcularInvestimento(c) {
    const crm = c.mfl ? paraNumero(S.vCrm) : 0;
    const soma = (v) => { const n = paraNumero(v); return n != null && crm != null ? n + crm : null; };
    if (c.m === '4') {
      return [
        { nome: 'Plano 1 · Inbound' + (c.mfl ? ' + CRM MFL Sales' : ''), valor: soma(S.vIn) },
        { nome: 'Plano 2 · Inbound + Outbound' + (c.mfl ? ' + CRM MFL Sales' : ''), valor: soma(S.vCombo), destaque: true }
      ];
    }
    const v = c.m === '1' ? S.vIn : S.vOut;
    return [{ nome: 'Investimento mensal total', valor: soma(v), destaque: true }];
  }

  SECOES.invest = (c) => {
    const plano = ({ selo, rotulo, titulo, valor, cap, itens, escuro, largo }) =>
      el('article', { class: `plano${escuro ? ' plano-destaque' : ''}${largo ? ' plano-largo' : ''}` },
        el('div', { class: 'plano-topo' }, el('span', { class: 'plano-rotulo', text: rotulo }), selo && el('span', { class: 'plano-selo', text: selo })),
        el('h3', { class: 'plano-nome', text: titulo }),
        el('div', { class: 'plano-preco' }, precoMes(valor)),
        cap && el('p', { class: 'plano-descricao', text: cap }),
        el('ul', { class: 'plano-itens' }, itens.map((t) => el('li', { text: t }))));

    const cartaoCrm = (rotulo) => plano({ rotulo, titulo: 'CRM MFL Sales', valor: S.vCrm, cap: 'Plataforma + configuração:', itens: itensCrm(c) });
    const crmNum = paraNumero(S.vCrm);
    let planos;
    let totais = [];

    if (c.m !== '4') {
      const svc = c.m === '1' ? { selo: 'Gestão de tráfego', titulo: 'Inbound' + (c.b2c ? ' · B2C' : ''), v: S.vIn, itens: itensInbound(c), cap: 'Gestão completa das campanhas:' }
        : c.m === '2' ? { selo: 'Prospecção ativa', titulo: 'Outbound com BDR + SDR', v: S.vOut, itens: itensBdr(c), cap: 'Prospecção executada pela MFL Sales:' }
          : { selo: 'Prospecção + treinamento', titulo: 'Outbound com Treinamento', v: S.vOut, itens: itensTrain(c), cap: 'Estrutura e preparação do seu time:' };
      planos = el('div', { class: `planos col-${c.mfl ? 2 : 1}` },
        plano({ selo: svc.selo, rotulo: 'Serviço 1', titulo: svc.titulo, valor: svc.v, cap: svc.cap, itens: svc.itens, escuro: true, largo: !c.mfl }),
        c.mfl ? cartaoCrm('Serviço 2') : null);
      if (c.mfl) {
        const a = paraNumero(svc.v);
        totais = [{ nome: 'Investimento mensal total', composicao: `${svc.titulo} ${a != null ? brl(a) : 'R$ [valor]'} + CRM MFL Sales ${crmNum != null ? brl(crmNum) : 'R$ [valor]'}`, valor: a != null && crmNum != null ? a + crmNum : null, destaque: true }];
      }
    } else {
      const itensOut = (c.out === 'bdr' ? itensBdr(c) : itensTrain(c)).filter((i) => i !== FUNIL_CLIENTE);
      planos = el('div', { class: 'planos col-2' },
        plano({ rotulo: 'Plano 1', titulo: 'Inbound', valor: S.vIn, cap: 'Gestão completa das campanhas:', itens: itensInbound(c) }),
        plano({ selo: 'Recomendado', rotulo: 'Plano 2', titulo: 'Inbound + Outbound', valor: S.vCombo, cap: 'Tudo do plano Inbound, mais:', itens: itensOut, escuro: true }));
      if (c.mfl) {
        const a = paraNumero(S.vIn);
        const b = paraNumero(S.vCombo);
        const soma = (x) => (x != null && crmNum != null ? x + crmNum : null);
        totais = [
          { nome: 'Plano 1 · Inbound + CRM MFL Sales', composicao: `Plano escolhido + CRM MFL Sales ${crmNum != null ? brl(crmNum) : 'R$ [valor]'}`, valor: soma(a) },
          { nome: 'Plano 2 · Inbound + Outbound + CRM MFL Sales', composicao: `Plano escolhido + CRM MFL Sales ${crmNum != null ? brl(crmNum) : 'R$ [valor]'}`, valor: soma(b), destaque: true }
        ];
      }
    }

    const crmLargo = c.m === '4' && c.mfl
      ? el('article', { class: 'plano plano-crm-largo revelar' },
        el('div', { class: 'plano-crm-info' },
          el('span', { class: 'plano-rotulo', text: 'Serviço adicional' }),
          el('h3', { class: 'plano-nome', text: 'CRM MFL Sales' }),
          el('p', { class: 'plano-descricao', text: 'Plataforma + configuração, válido para os dois planos:' }),
          el('ul', { class: 'plano-itens duas-colunas' }, itensCrm(c).map((t) => el('li', { text: t })))),
        el('div', { class: 'plano-preco' }, precoMes(S.vCrm)))
      : null;

    const validade = dataValidade();
    const condicoes = [
      ['Contrato', `Mínimo de ${S.contrato || '[X]'} ${Number(S.contrato) === 1 ? 'mês' : 'meses'}`],
      c.hasIn && ['Mídia', 'Verba de anúncios paga à parte, direto às plataformas'],
      ...String(S.cond || '').split('\n').map((t) => t.trim()).filter(Boolean).map((t) => ['Condição', t])
    ].filter(Boolean);

    return faixaSecao('investimento', 'Investimento', 'Plano de aquisição comercial', null, [
      bloco('', planos),
      crmLargo,
      totais.length ? bloco('totais', totais.map((t) => el('div', { class: `total${t.destaque ? ' total-destaque' : ''}` },
        el('div', { class: 'total-info' }, el('strong', { text: t.nome }), t.composicao && el('span', { text: t.composicao })),
        el('div', { class: 'total-valor' }, t.valor != null
          ? el('strong', {}, brl(t.valor), el('small', { text: '/mês' }))
          : el('strong', {}, vazio('R$ [total]'), el('small', { text: '/mês' })))))) : null,
      c.hasIn ? verbaAnuncios() : null,
      bloco('condicoes', blocoTitulo('Condições'), el('div', { class: 'condicoes-grade' },
        condicoes.map(([k, v]) => el('div', { class: 'condicao' }, el('span', { class: 'condicao-chave', text: k }), el('strong', { text: v }))))),
      bloco('', nota(`Todos os valores são mensais.${validade ? ` Proposta válida até ${formatarData(validade)}.` : ''}`))
    ], { classe: 'secao-investimento' });
  };

  // Investimento em anúncios sugerido (editável no painel)
  function verbaAnuncios() {
    const dia = paraNumero(S.verbaDia);
    if (!dia) return null;
    return el('div', { class: 'verba revelar' },
      el('span', { class: 'verba-icone', 'aria-hidden': 'true', text: '↗' }),
      el('div', { class: 'verba-info' },
        el('strong', { text: 'Investimento em anúncios sugerido' }),
        el('span', { text: 'Pago direto à Meta e ao Google, fora dos valores acima. Pode ser ajustado conforme os resultados das campanhas.' })),
      el('div', { class: 'verba-valor' },
        el('strong', {}, brl(dia), el('small', { text: '/dia' })),
        el('span', { text: `≈ ${brl(dia * 30)} por mês` })));
  }

  SECOES.next = (c) => {
    const canais = [c.hasIn && (c.sc.lp ? 'campanhas e Landing Page' : 'campanhas'), c.out && 'listas, scripts e cadência'].filter(Boolean).join(', ');
    const inicio = c.hasIn && c.out ? 'Início das campanhas e da prospecção' : c.hasIn ? 'Início das campanhas' : 'Início da prospecção';
    return faixaSecao('proximos-passos', 'Próximos passos', 'Como começamos',
      'Depois da aprovação, a operação é montada em etapas curtas e objetivas. Este é o caminho até as primeiras oportunidades chegarem ao seu time.',
      [
        bloco('', etapas([
          ['Aprovação da proposta', 'Assinatura do contrato e definição da data de início'],
          ['Reunião de onboarding', 'Alinhamos público, oferta, metas, processo de venda e acessos'],
          [c.mfl ? 'Implantação do CRM MFL Sales' : 'Estruturação do funil no seu CRM', 'Funil, etapas, automações e follow-ups configurados'],
          ['Preparação dos canais', 'Estruturação de ' + canais],
          [inicio, 'A operação entra no ar e as oportunidades começam a ser trabalhadas'],
          ['Acompanhamento e otimização', 'Análise dos resultados e ajustes contínuos' + ((c.hasIn && c.sc.relatorio) || c.out ? ', com relatório mensal' : '')]
        ])),
        bloco('', blocoTitulo('O que precisamos de vocês'), listaCheck([
          c.hasIn && 'Acesso às contas de anúncio e às redes sociais',
          'Informações sobre produtos, ofertas e diferenciais',
          c.out && 'Definição conjunta do perfil ideal de cliente',
          !c.mfl && 'Acesso administrativo ao CRM da sua empresa',
          'Um responsável para aprovar materiais e acompanhar os resultados',
          (c.out || !c.b2c) ? 'Agenda do comercial disponível para as reuniões' : 'Time preparado para responder os contatos rapidamente'
        ], 2))
      ], { classe: 'secao-proximos' });
  };

  /* ---------- depoimentos em vídeo ---------- */

  // Aceita link do YouTube, do Vimeo ou um arquivo de vídeo (mp4/webm)
  function fonteVideo(url) {
    const u = String(url || '').trim();
    if (!u) return null;
    const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{11})/);
    if (yt) return { tipo: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`, capa: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` };
    const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { tipo: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
    if (/^https?:\/\//i.test(u) && !/\.(mp4|webm|mov)(\?|$)/i.test(u)) return { tipo: 'link', src: u };
    return { tipo: 'arquivo', src: u };
  }

  function abrirVideo(dep) {
    const fonte = fonteVideo(dep.video);
    if (!fonte) return;
    if (fonte.tipo === 'link') { window.open(fonte.src, '_blank', 'noopener'); return; }
    let dialogo = $('#player-depoimento');
    if (!dialogo) {
      dialogo = el('dialog', { id: 'player-depoimento', class: 'player' });
      dialogo.addEventListener('close', () => dialogo.replaceChildren());
      dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
      document.body.append(dialogo);
    }
    const midia = fonte.tipo === 'iframe'
      ? el('iframe', { src: fonte.src, title: 'Depoimento em vídeo', allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true })
      : el('video', { src: fonte.src, controls: true, autoplay: true, playsinline: true });
    dialogo.replaceChildren(
      el('div', { class: 'player-moldura' }, midia),
      el('div', { class: 'player-legenda' },
        el('span', {}, el('strong', { text: dep.pessoa || dep.cliente || '' }), [dep.cargo, dep.cliente].filter(Boolean).length && dep.pessoa ? ` · ${[dep.cargo, dep.cliente].filter(Boolean).join(', ')}` : ''),
        el('button', { type: 'button', class: 'player-fechar', onclick: () => dialogo.close(), text: 'Fechar ✕' })));
    dialogo.showModal();
  }

  function cartoesDepoimento(lista_) {
    return el('div', { class: `depoimentos col-${Math.min(lista_.length, 3)}` },
      lista_.map((dep) => {
        const fonte = fonteVideo(dep.video);
        const capa = dep.capa || fonte?.capa;
        return el('article', { class: 'depoimento' },
          el('button', {
            type: 'button', class: 'depoimento-video', disabled: !fonte,
            'aria-label': fonte ? `Assistir ao depoimento de ${dep.pessoa || dep.cliente}` : 'Vídeo ainda não cadastrado',
            onclick: () => abrirVideo(dep)
          },
            capa ? el('img', { src: capa, alt: '', loading: 'lazy' }) : null,
            el('span', { class: 'depoimento-play', 'aria-hidden': 'true' }),
            !fonte && el('span', { class: 'depoimento-aviso', text: 'Vídeo ainda não cadastrado' })),
          el('div', { class: 'depoimento-info' },
            dep.segmento && el('span', { class: 'depoimento-segmento', text: dep.segmento }),
            dep.resultado && el('strong', { class: 'depoimento-resultado', text: dep.resultado }),
            dep.citacao && el('p', { class: 'depoimento-citacao', text: `“${dep.citacao}”` }),
            el('p', { class: 'depoimento-autor' },
              el('strong', { text: dep.pessoa || dep.cliente || '' }),
              [dep.cargo, dep.pessoa ? dep.cliente : ''].filter(Boolean).length ? el('span', { text: [dep.cargo, dep.pessoa ? dep.cliente : ''].filter(Boolean).join(' · ') }) : null)));
      }));
  }

  /* ---------- capa (layout do Figma) ---------- */

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

  function faixaAnimada(textosFaixa, classe) {
    const itens = textosFaixa.length ? textosFaixa : ['+7 anos'];
    const sequencia = [];
    while (sequencia.length < 24) sequencia.push(...itens);
    const trilha = () => el('div', { class: 'faixa-trilha' }, sequencia.map((t) => el('span', { text: t })));
    return el('div', { class: `capa-faixa ${classe}`, 'aria-hidden': 'true' }, el('div', { class: 'faixa-conteudo' }, trilha(), trilha()));
  }

  function renderCapa() {
    const capa = $('#capa');
    const c = { ...CAPA_PADRAO, ...(S.capa || {}) };
    const textosFaixa = lista(c.faixa).filter(Boolean);
    const video = fundoVideo(c.video, c.poster, c.videoWebm);

    capa.replaceChildren(
      el('div', { class: 'capa-fundo', 'aria-hidden': 'true' }, video, el('span', { class: 'capa-luz capa-luz-1' }), el('span', { class: 'capa-luz capa-luz-2' })),
      faixaAnimada(textosFaixa, 'faixa-1'),
      faixaAnimada(textosFaixa, 'faixa-2'),
      el('div', { class: 'capa-centro' },
        (c.provaDestaque || c.provaTexto) && el('p', { class: 'capa-prova' },
          el('img', { class: 'capa-avatares', src: 'assets/img/capa-avatares.png', alt: '', width: 141, height: 56 }),
          el('span', {}, c.provaDestaque && el('strong', { text: c.provaDestaque }), c.provaTexto && ` ${c.provaTexto}`)),
        el('h1', { class: 'capa-titulo' },
          el('span', { class: 'capa-rotulo', text: c.rotulo }),
          el('span', { class: 'capa-cliente' }, nomeCliente() || vazio('[Nome do cliente]'))),
        c.frase && el('p', { class: 'capa-subtitulo' }, rico(c.frase)),
        el('button', { type: 'button', class: 'capa-botao', onclick: abrirProposta, text: c.botao || 'Ver meu orçamento' })));
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

  // Transição circular: anel verde a partir do botão, depois a proposta aparece em fade
  let abrindo = false;
  function transicaoCirculo(noMeio) {
    abrindo = true;
    const botao = $('.capa-botao');
    const r = botao ? botao.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;
    const anel = el('div', { class: 'transicao-anel', 'aria-hidden': 'true' });
    const cobertura = el('div', { class: 'transicao-cobertura', 'aria-hidden': 'true' });
    document.body.append(anel, cobertura);
    const curva = 'cubic-bezier(.7, 0, .2, 1)';
    const circulo = (raioPx) => `circle(${raioPx}px at ${x}px ${y}px)`;
    const duracao = 850;
    botao?.animate([{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
    $('.capa-centro')?.animate([{ transform: 'scale(1)', filter: 'blur(0)', opacity: 1 }, { transform: 'scale(.94)', filter: 'blur(6px)', opacity: 0 }],
      { duration: duracao * 0.7, easing: curva, fill: 'forwards' });
    anel.animate([{ clipPath: circulo(0) }, { clipPath: circulo(raio) }], { duration: duracao, easing: curva, fill: 'forwards' });
    const cobrir = cobertura.animate([{ clipPath: circulo(0) }, { clipPath: circulo(raio) }], { duration: duracao, delay: 80, easing: curva, fill: 'forwards' });
    cobrir.finished.then(() => {
      noMeio();
      anel.remove();
      const revelar = cobertura.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-out', fill: 'forwards' });
      $('.intro .container')?.animate([{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: 'cubic-bezier(.2, .7, .1, 1)' });
      revelar.finished.then(() => {
        cobertura.remove();
        $('.capa-centro')?.getAnimations().forEach((an) => an.cancel());
        abrindo = false;
      });
    });
  }

  /* ---------- página ---------- */

  const NOMES_MODELO = {
    1: 'Inbound',
    2: 'Outbound com BDR + SDR',
    3: 'Outbound com Treinamento',
    4: 'Inbound + Outbound'
  };

  const mensagemAprovar = () => `Olá! Li a proposta da MFL Sales${nomeCliente() ? ' para ' + nomeCliente() : ''} e quero seguir.`;

  // Primeira seção: só o nome do cliente e os entregáveis (sem valores)
  function hero(c) {
    const itensCrmCliente = ['Funil de vendas adaptado ao seu processo', 'Etapas e critérios claros para cada fase do funil', 'Cadastro organizado de leads e contatos',
      'Rotinas de follow-up para cada etapa', 'Automações, de acordo com os recursos do seu CRM', 'Orientação do time para usar o funil no dia a dia'];
    const frentes = [
      c.hasIn && { rotulo: 'Inbound', titulo: 'Gestão de tráfego' + (c.b2c ? ' · B2C' : ''), itens: itensInbound(c).filter((i) => i !== FUNIL_CLIENTE) },
      c.out === 'bdr' && { rotulo: 'Outbound', titulo: 'Prospecção com BDR + SDR', itens: itensBdr(c).filter((i) => i !== FUNIL_CLIENTE) },
      c.out === 'train' && { rotulo: 'Outbound', titulo: 'Prospecção + treinamento', itens: itensTrain(c).filter((i) => i !== FUNIL_CLIENTE) },
      c.mfl
        ? { rotulo: 'CRM', titulo: 'CRM MFL Sales', itens: itensCrm(c) }
        : { rotulo: 'CRM', titulo: 'Estruturação no seu CRM', itens: itensCrmCliente }
    ].filter(Boolean);

    return el('section', { class: 'intro hero tema-escuro', id: 'inicio' },
      el('div', { class: 'container' },
        el('p', { class: 'intro-eyebrow revelar', text: 'Proposta comercial para' }),
        el('h1', { class: 'hero-cliente revelar' }, nomeCliente() || vazio('[Nome do cliente]')),
        el('h2', { class: 'hero-entregaveis-titulo revelar', text: 'Entregáveis' }),
        el('div', { class: `entregaveis col-${frentes.length} revelar` },
          frentes.map((f) => el('article', { class: 'entregavel' },
            el('span', { class: 'entregavel-rotulo', text: f.rotulo }),
            el('h3', { text: f.titulo }),
            el('ul', { class: 'plano-itens' }, f.itens.map((t) => el('li', { text: t }))))))));
  }

  // Faixa de números da MFL logo abaixo do hero
  function numerosMfl() {
    return el('section', { class: 'faixa-numeros', 'aria-label': 'MFL Sales em números' },
      el('div', { class: 'container numeros-grade' },
        [['+370', 'negócios acelerados'], ['+R$ 10 mi', 'em receita gerada para clientes'], ['+R$ 700 mil', 'investidos em anúncios por mês'], ['+7 anos', 'de mercado, em 2 países e 25 cidades']]
          .map(([n, t]) => el('div', { class: 'numero-item' }, el('strong', { text: n }), el('span', { text: t })))));
  }

  // Solução em abas: Inbound | Outbound | Tecnologia (só os módulos do modelo)
  let abaAtiva = null;
  function secaoSolucao(c) {
    const modulos = [
      c.hasIn && ['inbound', 'Inbound', SECOES.inbound(c)],
      c.out === 'bdr' && ['outbound', 'Outbound · BDR + SDR', SECOES.bdr(c)],
      c.out === 'train' && ['outbound', 'Outbound · Treinamento', SECOES.train(c)],
      ['tecnologia', 'Tecnologia (CRM)', SECOES.crm(c)]
    ].filter(Boolean);
    if (!modulos.some(([id]) => id === abaAtiva)) abaAtiva = modulos[0][0];

    const abas = el('div', { class: 'abas', role: 'tablist', 'aria-label': 'Frentes da solução' });
    const paineis = [];
    modulos.forEach(([id, rotulo, secao]) => {
      const ativo = id === abaAtiva;
      const botao = el('button', {
        type: 'button', role: 'tab', id: `aba-${id}`, class: 'aba', 'aria-selected': ativo ? 'true' : 'false',
        'aria-controls': `painel-${id}`, tabindex: ativo ? null : '-1', text: rotulo
      });
      botao.addEventListener('click', () => trocarAba(id));
      botao.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const i = modulos.findIndex(([m]) => m === id);
        const prox = modulos[(i + (e.key === 'ArrowRight' ? 1 : modulos.length - 1)) % modulos.length][0];
        trocarAba(prox);
        document.getElementById(`aba-${prox}`)?.focus();
      });
      abas.append(botao);
      const conteudo = secao.querySelector('.container');
      paineis.push(el('div', { class: 'painel-aba', role: 'tabpanel', id: `painel-${id}`, 'aria-labelledby': `aba-${id}`, hidden: !ativo }, [...conteudo.childNodes]));
    });

    function trocarAba(id) {
      abaAtiva = id;
      abas.querySelectorAll('.aba').forEach((b) => {
        const sel = b.id === `aba-${id}`;
        b.setAttribute('aria-selected', sel ? 'true' : 'false');
        if (sel) b.removeAttribute('tabindex'); else b.setAttribute('tabindex', '-1');
      });
      paineis.forEach((p) => { p.hidden = p.id !== `painel-${id}`; });
      paineis.forEach((p) => p.querySelectorAll('.revelar').forEach((n) => n.classList.add('visivel')));
    }

    return el('section', { class: 'secao secao-banda secao-solucao', id: 'solucao' },
      el('div', { class: 'container' },
        el('header', { class: 'secao-cabecalho revelar' },
          el('span', { class: 'secao-rotulo' }, el('span', { text: 'A solução' })),
          el('h2', { class: 'secao-titulo', text: 'Como vamos gerar oportunidades para a sua empresa' }),
          el('div', { class: 'secao-texto' }, el('p', { text: 'Escolha uma frente para ver o que fazemos, passo a passo.' }))),
        el('div', { class: 'abas-barra revelar' }, abas),
        paineis));
  }

  // Perguntas frequentes, com respostas tiradas da própria proposta
  function secaoFaq(c) {
    const perguntas = [
      c.hasIn && ['A verba de anúncios está incluída no investimento?',
        `Não. A verba é paga diretamente pelo cliente às plataformas (Meta e Google), fora dos valores da MFL Sales.${paraNumero(S.verbaDia) ? ` A sugestão inicial é de ${brl(paraNumero(S.verbaDia))} por dia.` : ''}`],
      ['Qual é o tempo mínimo de contrato?', `O contrato mínimo é de ${S.contrato || '[X]'} ${Number(S.contrato) === 1 ? 'mês' : 'meses'}.`],
      c.mfl
        ? ['Em qual CRM a operação vai rodar?', 'No CRM MFL Sales, implantado por nós: você recebe o funil montado, as automações rodando e o processo desenhado para o seu negócio.']
        : ['Preciso trocar o CRM que já uso?', 'Não. Estruturamos o funil, as etapas e as rotinas de follow-up dentro do CRM que sua empresa já utiliza, aproveitando os recursos que ele oferece.'],
      c.out === 'bdr' && ['Quem faz os contatos com os leads do Outbound?', 'A MFL Sales executa toda a prospecção, com um BDR para construir a base e um SDR para abordar, qualificar e agendar. Seu comercial recebe a reunião agendada, com o contexto do lead.'],
      c.out === 'train' && ['Quem faz os contatos com os leads do Outbound?', 'O seu time, com a lista qualificada, os scripts, os templates e a cadência entregues pela MFL Sales, depois de um treinamento para abordagem, qualificação e agendamento.'],
      ['Como acompanho os resultados?', `Pelo painel de acompanhamento do CRM, que mostra de onde vêm as oportunidades, em que etapa estão e o que está convertendo${(c.hasIn && c.sc.relatorio) || c.out ? ', e pelo relatório mensal' : ''}.`],
      ['O que acontece depois que eu aprovar?', 'Assinamos o contrato, fazemos a reunião de onboarding, implantamos o CRM, preparamos os canais e colocamos a operação no ar, com acompanhamento e ajustes contínuos.']
    ].filter(Boolean);
    return faixaSecao('duvidas', 'Dúvidas frequentes', 'Perguntas que costumamos ouvir', null, [
      bloco('', el('div', { class: 'faq' }, perguntas.map(([p, r], i) =>
        el('details', { class: 'faq-item', open: i === 0 }, el('summary', { text: p }), el('p', { text: r })))))
    ]);
  }

  // Fechamento do site: frase final, botão de aprovação e responsável
  function ctaFinal() {
    const r = S.responsavel || {};
    const href = linkContato(mensagemAprovar());
    return el('section', { class: 'cta-final tema-escuro', id: 'aprovar' },
      el('div', { class: 'container' },
        el('div', { class: 'cta revelar' },
          el('div', { class: 'cta-texto' },
            el('h3', { text: 'Nosso objetivo não é apenas gerar leads. É construir um processo comercial que coloque sua empresa diante das pessoas certas e transforme interesse em vendas.' }),
            href && el('a', { class: 'cta-botao', href, target: '_blank', rel: 'noopener' }, el('span', { text: 'Quero aprovar a proposta' }), el('span', { 'aria-hidden': 'true', text: '→' }))),
          r.nome && el('div', { class: 'responsavel' },
            el('span', { class: 'responsavel-avatar', 'aria-hidden': 'true', text: iniciais(r.nome) }),
            el('div', {},
              el('strong', { text: r.nome }),
              r.cargo && el('span', { text: r.cargo }),
              el('span', { class: 'responsavel-contatos' },
                r.whatsapp && el('a', { href: `https://wa.me/${String(r.whatsapp).replace(/\D/g, '')}`, target: '_blank', rel: 'noopener', text: formatarTelefone(r.whatsapp) }),
                r.email && el('a', { href: `mailto:${r.email}`, text: r.email })))))));
  }

  function renderProposta() {
    const c = cfg();

    // Estrutura de site: hero, números, por que, como funciona, solução (abas),
    // resultados, investimento, próximos passos, dúvidas e fechamento
    const secoes = [
      ['porque', 'Por que a MFL', SECOES.porque(c)],
      ['como', 'Como funciona', SECOES.como(c)],
      ['solucao', 'Solução', secaoSolucao(c)],
      ['resultados', 'Resultados', SECOES.resultados(c)],
      ['invest', 'Investimento', SECOES.invest(c)],
      ['next', 'Próximos passos', SECOES.next(c)],
      ['faq', 'Dúvidas', secaoFaq(c)]
    ];

    // Faixas alternam claro/escuro depois do hero escuro
    let anterior = 'escuro';
    secoes.forEach(([, , secao]) => {
      const tema = anterior === 'escuro' ? 'claro' : 'escuro';
      secao.classList.add(`tema-${tema}`);
      anterior = tema;
    });

    $('#conteudo').replaceChildren(hero(c), numerosMfl(), ...secoes.map(([, , secao]) => secao), ctaFinal());
    $('#barra-cta').replaceChildren(...barraCta(c));

    $('#rodape').replaceChildren(
      el('div', { class: 'container rodape-inner' },
        el('div', { class: 'rodape-marca' }, marca('marca-logo-rodape'), el('span', { text: AGENCIA.slogan })),
        el('div', { class: 'rodape-links' },
          el('a', { href: AGENCIA.site, target: '_blank', rel: 'noopener', text: 'www.agenciamfl.com.br' }),
          el('a', { href: 'https://instagram.com/agenciamfl', target: '_blank', rel: 'noopener', text: AGENCIA.instagram }),
          el('button', { type: 'button', class: 'rodape-pdf', onclick: imprimir, text: 'Salvar em PDF' })),
        el('p', { class: 'rodape-legal', text: `© ${new Date().getFullYear()} ${AGENCIA.nome}. Proposta confidencial preparada exclusivamente para ${nomeCliente() || 'o cliente'}.` })));

    ativarRevelar();
  }

  // Barra fixa no rodapé do celular: valor principal + botão de aprovação
  function barraCta(c) {
    const href = linkContato(mensagemAprovar());
    if (!href) return [];
    const t = calcularInvestimento(c).find((x) => x.destaque && x.valor != null) || calcularInvestimento(c).find((x) => x.valor != null);
    return [
      el('div', { class: 'barra-cta-total' },
        t ? [el('span', { text: t.nome }), el('strong', {}, brl(t.valor), el('small', { text: '/mês' }))] : el('strong', { text: nomeCliente() })),
      el('a', { href, target: '_blank', rel: 'noopener', text: 'Aprovar' })
    ];
  }

  function render(novos) {
    S = normalizar(novos);
    document.documentElement.style.removeProperty('--destaque');
    document.title = `Proposta MFL Sales${nomeCliente() ? ' - ' + nomeCliente() : ''}`;
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

  // Completa campos ausentes com os padrões da especificação
  function normalizar(d) {
    const hoje = new Date();
    const iso = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const base = {
      cliente: '', data: iso, modelo: '4', outTipo: 'bdr', pub: 'b2b', crm: 'mfl', sc: { ...SCOPE_PADRAO },
      vIn: '', vOut: '', vCombo: '', vCrm: '297', contrato: 3, cond: '', videoUrl: '', thumb: '',
      verbaDia: 100, validadeDias: 7, depoimentos: [], responsavel: {}, capa: {}
    };
    const out = { ...base, ...(d && typeof d === 'object' ? d : {}) };
    out.sc = { ...SCOPE_PADRAO, ...(out.sc || {}) };
    return out;
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
        if (e.isIntersecting) { e.target.classList.add('visivel'); observer.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    alvos.forEach((n) => observer.observe(n));
  }

  function aoRolar() {
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#progresso').style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    const intro = $('#inicio');
    const cta = document.querySelector('.cta-final');
    const passouIntro = intro && intro.getBoundingClientRect().bottom < 0;
    const r = cta && cta.getBoundingClientRect();
    const ctaVisivel = r && r.top < innerHeight && r.bottom > 0;
    document.body.classList.toggle('mostrar-barra', Boolean(passouIntro && !ctaVisivel));
  }

  function mostrarErro(msg) {
    const estado = $('#estado');
    estado.classList.add('erro');
    estado.replaceChildren(el('p', { class: 'estado-titulo', text: 'Não foi possível abrir a proposta' }), el('p', { text: msg }));
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

  async function carregarCatalogo() {
    try {
      const resp = await fetch('depoimentos/catalogo.json', { cache: 'no-store' });
      if (resp.ok) catalogo = lista((await resp.json()).depoimentos);
    } catch (e) { /* sem catálogo */ }
  }

  // O editor envia atualizações ao vivo para a pré-visualização.
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin) return;
    if (e.data?.tipo === 'proposta:atualizar') render(e.data.dados);
    else if (e.data?.tipo === 'proposta:capa' && S) { aberta = !e.data.mostrar; render(S); }
    else if (e.data?.tipo === 'proposta:imprimir') { imprimir(); return; }
    else return;
    aoRolar();
  });

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  function imprimir() {
    document.querySelectorAll('.revelar').forEach((n) => n.classList.add('visivel'));
    window.print();
  }

  try { if (sessionStorage.getItem(`aberta:${slug}`)) aberta = true; } catch (e) { /* sem storage */ }

  Promise.all([carregar(), carregarCatalogo()])
    .then(([d]) => { render(d); aoRolar(); })
    .catch((err) => {
      console.error(err);
      mostrarErro(location.protocol === 'file:'
        ? 'Abra a proposta por um servidor (ex.: GitHub Pages); o navegador bloqueia a leitura de arquivos locais.'
        : err.message);
    });
})();
