// Worker "meeky-lp-proxy" — versão para o site da LP ser o site PRINCIPAL em meeky.com.br
//
// Rota no Cloudflare: meeky.com.br/*  (substitui a rota antiga meeky.com.br/lp*)
//
// Como decide quem responde:
//  1. /lp e /lp/...                     → redireciona (301) para o mesmo endereço sem /lp
//  2. páginas antigas da loja que têm
//     equivalente no site novo          → redireciona (301) para a página nova (ex.: /sobre → /Sobre)
//  3. páginas que só existem na loja    → busca na loja (Lovable / Cloudflare Pages), sem mexer em nada
//     (checkout antigo, admin, /r/ afiliados, termos, privacidade, arquivos do app da loja…)
//  4. todo o resto                      → busca no site novo (meeky-site); se não existir lá, cai na loja
//
// Se algo der errado aqui dentro, a requisição vai para a loja (o site nunca fica fora do ar).

const SITE_ORIGIN = 'https://meeky-site.contato-ceb.workers.dev';   // site novo (arquivos do site-lp)
const STORE_ORIGIN = 'https://meeky-focus-control.pages.dev';       // loja (Lovable)

// Páginas antigas da loja → página equivalente no site novo
const REDIRECTS = {
  '/headphone-anc-meeky-f5-pro': '/Produto',
  '/produto': '/Produto',
  '/motion-1': '/Motion1',
  '/sobre': '/Sobre',
  '/faq': '/Duvidas',
  '/contato': '/Contato',
  '/blog': '/Blog',
  '/empresas': '/#volume',
  '/home': '/',
};

// Artigos do blog que existem no site novo (/blog/<slug> → /Blog-<slug>)
const BLOG_SLUGS = new Set([
  'anc-ativo-vs-cancelamento-passivo-diferenca', 'anc-prejudica-qualidade-do-som-headphone',
  'bluetooth-54-53-50-diferenca-headphone', 'conducao-ossea-vs-fone-intra-auricular',
  'fone-conducao-ossea-ciclismo-treino', 'fone-conducao-ossea-como-funciona',
  'fone-conducao-ossea-faz-mal-audicao', 'fone-conducao-ossea-para-corrida',
  'guia-presente-corporativo-brindes-tecnologia-rh', 'headphone-70-horas-bateria',
  'headphone-anc-70-horas-bateria-por-que-importa', 'headphone-anc-academia',
  'headphone-anc-funciona-em-aviao', 'headphone-anc-para-autista-hipersensibilidade-sensorial',
  'headphone-anc-para-concurseiro', 'headphone-anc-para-estudar',
  'headphone-anc-para-programador-desenvolvedor', 'headphone-cancelamento-de-ruido-vale-a-pena',
  'headphone-home-office-anc', 'headphone-over-ear-anc-ou-earbuds-anc-qual-escolher',
  'jbl-770nc-ou-meeky-f5-vale-a-pena-pagar-mais', 'ldac-vs-aac-vs-sbc-diferenca-headphone-bluetooth',
  'meeky-f5-anc-pro-review', 'meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026',
  'meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc-comparativo-2026', 'meeky-f5-anc-pro-vs-qcy-h3',
  'meeky-f5-anc-pro-vs-redmi-buds-6-active-comparativo-2026', 'meeky-motion-1-especificacoes-preco-lancamento',
  'melhor-headphone-anc-ate-300-reais-brasil-2026', 'multiponto-bluetooth-conectar-notebook-e-celular',
  'o-que-e-cancelamento-de-ruido-ativo-anc', 'quanto-dura-bateria-headphone-anc-na-pratica',
  'black-friday-2026-como-escolher-fone-sem-cair-em-armadilha', 'presente-de-natal-2026-fone-bluetooth-guia',
  'corrida-de-rua-fim-de-ano-fone-conducao-ossea-seguranca', 'conducao-ossea-ou-anc-qual-fone-escolher',
  'bluetooth-6-0-o-que-muda-fone',
]);
const BLOG_ALIASES = {
  'melhor-headphone-anc-ate-300-reais': 'melhor-headphone-anc-ate-300-reais-brasil-2026',
  'meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc': 'meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc-comparativo-2026',
  'meeky-f5-anc-pro-vs-soundcore-q20i': 'meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026',
  'meeky-f5-anc-pro-vs-anker-soundcore-q20i': 'meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026',
  'meeky-f5-anc-pro-vs-soundcore-q20i-comparativo-2026': 'meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026',
};

// Caminhos que continuam sendo da loja (o app, o checkout antigo, admin, afiliados, páginas legais…)
const STORE_PREFIXES = [
  '/checkout', '/admin', '/r/', '/parceiro/', '/vip', '/ativar', '/unsubscribe', '/.lovable',
  '/termos', '/privacidade', '/politica-de-devolucao', '/exclusao-de-dados', '/reviews',
  '/crosstraining', '/corrida', '/blog/', '/static-loader-data', '/blog-covers/', '/product/',
  '/robots.txt', '/sitemap.xml', '/llms.txt', '/og-image.jpg', '/og-motion1.jpg',
];

function redirect(url, path) {
  const to = new URL(path, url.origin);
  if (!path.includes('?')) to.search = url.search;
  return Response.redirect(to.toString(), 301);
}

// Busca na loja, preservando método, corpo e cabeçalhos; corrige redirecionamentos internos dela
async function fromStore(request, url, storeOrigin) {
  const target = storeOrigin + url.pathname + url.search;
  const res = await fetch(new Request(target, request), { redirect: 'manual' });
  const loc = res.headers.get('location');
  if (loc && loc.startsWith(storeOrigin)) {
    const headers = new Headers(res.headers);
    headers.set('location', url.origin + loc.slice(storeOrigin.length));
    return new Response(res.body, { status: res.status, headers });
  }
  return res;
}

// Busca no site novo: /Produto → /Produto.html, / → /index.html; links ".html" ficam sem a extensão
async function fromSite(request, url, siteOrigin) {
  let path = url.pathname;
  if (path === '/') path = '/index.html';
  const last = path.split('/').pop();
  if (last && !last.includes('.')) path += '.html';
  const res = await fetch(siteOrigin + path + url.search, { method: request.method, headers: request.headers });
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;

  class CleanHtmlLinks {
    element(el) {
      const href = el.getAttribute('href');
      if (!href || /^(https?:)?\/\//i.test(href) || /^(mailto|tel|javascript|data):/i.test(href) || href[0] === '#') return;
      // Home.html → /   ·   Produto.html?x=1#y → Produto?x=1#y
      const m = href.match(/^([^?#]*?)\.html([?#].*)?$/i);
      if (!m) return;
      const page = m[1], rest = m[2] || '';
      el.setAttribute('href', (/^(\.\/)?(index|Home)$/i.test(page) ? '/' : page) + rest);
    }
  }
  return new HTMLRewriter().on('a', new CleanHtmlLinks()).transform(res);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const SITE = (env && env.SITE_ORIGIN) || SITE_ORIGIN;
    const STORE = (env && env.STORE_ORIGIN) || STORE_ORIGIN;
    const path = url.pathname;
    try {
      // 1. endereços antigos com /lp
      if (path === '/lp' || path.startsWith('/lp/')) {
        let rest = path.slice(3) || '/';
        rest = rest.replace(/\.html$/i, '');
        if (/^\/(index|Home)$/i.test(rest)) rest = '/';
        return redirect(url, rest);
      }
      // 2. páginas antigas da loja com equivalente no site novo
      const clean = path.replace(/\/+$/, '') || '/';
      if (REDIRECTS[clean]) return redirect(url, REDIRECTS[clean]);
      const blog = clean.match(/^\/blog\/([^/]+)$/);
      if (blog) {
        const slug = BLOG_ALIASES[blog[1]] || blog[1];
        if (BLOG_SLUGS.has(slug)) return redirect(url, '/Blog-' + slug);
        // artigo novo: se já existe no site novo, vai para lá; senão continua na loja
        if (/^[a-z0-9-]+$/.test(slug)) {
          const head = await fetch(SITE + '/Blog-' + slug + '.html', { method: 'HEAD' });
          if (head.ok) return redirect(url, '/Blog-' + slug);
        }
      }
      // 3. páginas que são da loja
      if (STORE_PREFIXES.some((p) => path === p || path.startsWith(p.endsWith('/') ? p : p + '/') || (p.includes('.') && path === p))) {
        return fromStore(request, url, STORE);
      }
      // arquivos do app da loja (JS/CSS com nome "hash" em /assets/) vão direto para a loja
      if (/^\/assets\/.+-[A-Za-z0-9_-]{8}\.(js|css|map)$/.test(path)) return fromStore(request, url, STORE);
      // 4. site novo; se não existir lá, tenta a loja
      if (request.method === 'GET' || request.method === 'HEAD') {
        const res = await fromSite(request, url, SITE);
        if (res.status !== 404) return res;
      }
      return fromStore(request, url, STORE);
    } catch (err) {
      console.error('[meeky-router] erro, mandando para a loja:', err && err.stack || err);
      return fetch(new Request(STORE + url.pathname + url.search, request));
    }
  },
};
