export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Remove o prefixo /lp da URL pra saber o que buscar no site original
    let path = url.pathname.replace(/^\/lp/, '');
    if (path === '') path = '/';

    // Se o caminho não tem extensão de arquivo (tipo /Contato, /Duvidas),
    // adiciona ".html" pra buscar o arquivo certo no site original
    const lastSegment = path.split('/').pop();
    if (path !== '/' && lastSegment && !lastSegment.includes('.')) {
      path = path + '.html';
    }

    const originUrl = 'https://meeky-site.contato-ceb.workers.dev' + path + url.search;

    const originResponse = await fetch(originUrl, {
      method: request.method,
      headers: request.headers,
    });

    const contentType = originResponse.headers.get('content-type') || '';

    // Páginas HTML: reescreve os atributos (src, href) das tags
    if (contentType.includes('text/html')) {
      class AttributeRewriter {
        constructor(attributeName) {
          this.attributeName = attributeName;
        }
        element(element) {
          let attr = element.getAttribute(this.attributeName);
          if (!attr) return;

          // Ignora links externos, âncoras, e-mail, telefone, javascript
          if (
            /^(https?:)?\/\//i.test(attr) ||
            /^(mailto|tel|javascript|data):/i.test(attr) ||
            attr.startsWith('#')
          ) {
            return;
          }

          // Remove o ".html" do final pra deixar a URL limpa
          if (attr.toLowerCase().endsWith('.html')) {
            attr = attr.slice(0, -5);
            if (attr === '') attr = '/';
          }

          if (attr.startsWith('/')) {
            // Caminho absoluto: adiciona o prefixo /lp
            element.setAttribute(this.attributeName, '/lp' + attr);
          } else {
            // Caminho relativo: deixa como está, a tag <base> já resolve certo
            element.setAttribute(this.attributeName, attr);
          }
        }
      }

      // Adiciona <base href="/lp/"> no <head> — corrige caminhos
      // relativos (sem "/" no início) que senão "perdem" o /lp
      class BaseTagInjector {
        element(element) {
          element.prepend('<base href="/lp/">', { html: true });
        }
      }

      // Script que corrige links criados dinamicamente pelo JavaScript
      // do próprio site (depois que a página já carregou)
      const fixLinksScript = `
<script>
(function() {
  function fixLink(a) {
    if (!a || !a.getAttribute) return;
    if (a.dataset.lpFixed) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (/^(https?:)?\\/\\//i.test(href) || /^(mailto|tel|javascript|data):/i.test(href) || href.charAt(0) === '#') {
      a.dataset.lpFixed = '1';
      return;
    }
    if (href.indexOf('/lp/') === 0 || href === '/lp') {
      a.dataset.lpFixed = '1';
      return;
    }
    var clean = href;
    if (clean.toLowerCase().slice(-5) === '.html') {
      clean = clean.slice(0, -5);
    }
    if (clean.charAt(0) === '/') {
      a.setAttribute('href', '/lp' + (clean === '/' ? '/' : clean));
    } else {
      a.setAttribute('href', clean);
    }
    a.dataset.lpFixed = '1';
  }
  function scan() {
    document.querySelectorAll('a[href]').forEach(fixLink);
  }
  scan();
  var observer = new MutationObserver(scan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
</script>`;

      class BodyScriptInjector {
        element(element) {
          element.append(fixLinksScript, { html: true });
        }
      }

      return new HTMLRewriter()
        .on('head', new BaseTagInjector())
        .on('body', new BodyScriptInjector())
        .on('a', new AttributeRewriter('href'))
        .on('link', new AttributeRewriter('href'))
        .on('script', new AttributeRewriter('src'))
        .on('img', new AttributeRewriter('src'))
        .on('source', new AttributeRewriter('src'))
        .on('video', new AttributeRewriter('src'))
        .transform(originResponse);
    }

    // Arquivos JS e CSS: corrige caminhos absolutos "escondidos" no código
    // (imagens/fontes referenciadas dentro do bundle compilado do React/Vite)
    if (
      contentType.includes('javascript') ||
      contentType.includes('css') ||
      contentType.includes('application/json')
    ) {
      let text = await originResponse.text();

      // Troca qualquer referência a "/assets/" por "/lp/assets/"
      text = text.replaceAll('/assets/', '/lp/assets/');

      // Cobre outras pastas comuns na raiz que podem ser referenciadas
      const rootFolders = ['fonts', 'images', 'img', 'static', 'media'];
      for (const folder of rootFolders) {
        text = text.replaceAll(`"/${folder}/`, `"/lp/${folder}/`);
        text = text.replaceAll(`'/${folder}/`, `'/lp/${folder}/`);
      }

      const newHeaders = new Headers(originResponse.headers);
      newHeaders.delete('content-encoding');
      newHeaders.delete('content-length');

      return new Response(text, {
        status: originResponse.status,
        headers: newHeaders,
      });
    }

    return originResponse;
  },
};
