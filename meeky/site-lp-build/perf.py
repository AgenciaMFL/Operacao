# Otimizações de carregamento aplicadas em todas as páginas do site-lp (rodar depois de gerar as páginas).
# Pode rodar mais de uma vez: o resultado é o mesmo.
import re, glob, os
SITE = '/home/user/Operacao/meeky/site-lp/'
MODAL_V = '?v=20261106a'

FONTS = 'https://fonts.googleapis.com/css2?family=Hubot+Sans:wdth,wght@75..125,400..700&family=Poppins:wght@400;500;600;700&display=swap'
SFPRO = 'https://fonts.cdnfonts.com/css/sf-pro-display'

# imagem principal (LCP) de cada página: carrega primeiro, com prioridade alta
LCP = {
    'index.html': [('assets/hero-home-mobile-v5.webp', '(max-width: 860px)'), ('assets/hero-home-v3.webp', '(min-width: 861px)')],
    'Home.html': [('assets/hero-home-mobile-v5.webp', '(max-width: 860px)'), ('assets/hero-home-v3.webp', '(min-width: 861px)')],
    'Produto.html': [('assets/f5-v2/hero-headphone.webp', '')],
    'Motion1.html': [('assets/motion-v2/motion.webp', '')],
    'Sobre.html': [('assets/sobre-v2/hero-woman.webp', '')],
}

HEAD_PERF = '''<!-- Desempenho: conexões antecipadas, fontes sem bloquear a tela e React servido pelo próprio site -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://fonts.cdnfonts.com" crossorigin>
<link rel="stylesheet" href="''' + FONTS + '''" media="print" onload="this.media='all'">
<link rel="stylesheet" href="''' + SFPRO + '''" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="''' + FONTS + '''"><link rel="stylesheet" href="''' + SFPRO + '''"></noscript>
<script>window.__resources = { "https://unpkg.com/react@18.3.1/umd/react.production.min.js": "./vendor/react.production.min.js", "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js": "./vendor/react-dom.production.min.js" };</script>
<link rel="preload" href="./vendor/react.production.min.js" as="script">
<link rel="preload" href="./vendor/react-dom.production.min.js" as="script">
%LCP%<!-- /Desempenho -->
'''

# GTM e Meta Pixel: os comandos (PageView, eventos) ficam na fila desde o início;
# os arquivos pesados só baixam na primeira interação ou 3,5 s depois de a página carregar.
TRACK = '''<!-- Google Tag Manager + Meta Pixel (carregamento adiado para não travar a abertura da página) -->
<script>
(function(w,d){
  w.dataLayer=w.dataLayer||[]; w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
  if(!w.fbq){var n=w.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!w._fbq)w._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];}
  fbq('init','1661170241699314'); fbq('track','PageView');
  var done=false;
  function add(src){var s=d.createElement('script');s.async=true;s.src=src;d.head.appendChild(s);}
  function go(){ if(done) return; done=true;
    add('https://www.googletagmanager.com/gtm.js?id=GTM-KWMG33GN');
    add('https://connect.facebook.net/en_US/fbevents.js'); }
  ['pointerdown','touchstart','keydown','wheel','mousemove'].forEach(function(e){ w.addEventListener(e,go,{once:true,passive:true}); });
  w.addEventListener('load',function(){ setTimeout(go,3500); });
})(window,document);
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1661170241699314&ev=PageView&noscript=1" /></noscript>
<!-- End Google Tag Manager + Meta Pixel -->
'''

def fix_page(f):
    s = open(f).read()
    if '<x-dc>' not in s or '<head>' not in s:
        return False
    o = s
    # 1) GTM + Pixel antigos -> versão adiada
    s = re.sub(r'<!-- Google Tag Manager -->.*?<!-- End Google Tag Manager -->\n*', '', s, flags=re.S)
    s = re.sub(r'<!-- Meta Pixel Code -->.*?<!-- End Meta Pixel Code -->\n*', '', s, flags=re.S)
    s = re.sub(r'<!-- Google Tag Manager \+ Meta Pixel .*?<!-- End Google Tag Manager \+ Meta Pixel -->\n*', '', s, flags=re.S)
    # 2) bloco de desempenho (refeito a cada execução)
    s = re.sub(r'<!-- Desempenho: .*?<!-- /Desempenho -->\n', '', s, flags=re.S)
    lcp = ''.join(f'<link rel="preload" as="image" href="{src}" fetchpriority="high"{(" media=" + chr(34) + m + chr(34)) if m else ""}>\n' for src, m in LCP.get(os.path.basename(f), []))
    block = HEAD_PERF.replace('%LCP%', lcp) + TRACK
    s = s.replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1">\n' + block, 1)
    # 3) folhas de fonte bloqueantes dentro do conteúdo -> removidas (já carregam no <head>)
    body_i = s.index('<body>')
    head, body = s[:body_i], s[body_i:]
    body = re.sub(r'<link rel="stylesheet" href="https://fonts\.(cdnfonts\.com|googleapis\.com)[^"]*">\n?', '', body)
    s = head + body
    # 3b) imagens: o modelo da página fica escondido até o React montar, mas o navegador baixaria
    # todas as <img> dele (inclusive as do computador no celular). Com loading="lazy" só baixa o que aparece.
    keep = {src for src, _ in LCP.get(os.path.basename(f), [])}
    def lazy(m):
        tag = m.group(0)
        if 'loading=' in tag: return tag
        src = re.search(r'src="([^"]*)"', tag)
        if src and src.group(1) in keep: return tag.replace('<img ', '<img fetchpriority="high" ', 1)
        return tag.replace('<img ', '<img loading="lazy" ', 1)
    bi = s.index('<body>')
    s = s[:bi] + re.sub(r'<img [^>]*>', lazy, s[bi:])
    # 4) scripts sem uso / servidos localmente
    s = s.replace('<script src="./image-slot.js"></script>\n', '')
    s = s.replace("'https://unpkg.com/lenis@1.1.20/dist/lenis.min.js'", "'./vendor/lenis.min.js'")
    s = re.sub(r'meeky-form-modal\.js(\?v=[^"]*)?"', 'meeky-form-modal.js' + MODAL_V + '"', s)
    # o noscript do GTM continua no fim do <body>
    if s != o:
        open(f, 'w').write(s)
        return True
    return False

def fix_component(f):
    s = open(f).read(); o = s
    s = re.sub(r'<link rel="stylesheet" href="https://fonts\.(cdnfonts\.com|googleapis\.com)[^"]*">\n?', '', s)
    s = re.sub(r'meeky-form-modal\.js(\?v=[^"]*)?"', 'meeky-form-modal.js' + MODAL_V + '"', s)
    if s != o: open(f, 'w').write(s)


# Topo "instantâneo" da Home: aparece antes do React montar a página (só imagem e menu, sem texto),
# e some assim que a página de verdade é desenhada. Melhora o LCP no celular.
SHELL = """<div id="pre-shell" aria-hidden="true" style="position:fixed;inset:0;z-index:9999;background:#FFFDF9;pointer-events:none">
<style>#pre-shell .m{display:none}@media (max-width:860px){#pre-shell .d{display:none}#pre-shell .m{display:block}}</style>
<div style="height:74px;background:#FDF6FF;display:flex;align-items:center;padding:0 20px"><img src="assets/home-v2/logo-menu.svg" alt="" width="112" height="19" style="width:112px;height:auto"></div>
<div class="m" style="background:#EEEFF4;overflow:hidden;line-height:0"><img src="assets/hero-home-mobile-v5.webp" alt="" fetchpriority="high" width="801" height="399" style="width:205%;max-width:none;margin-left:-55%;height:auto;display:block"></div>
<div class="d" style="height:calc(100vh - 74px);background:#EFE9EA url('assets/hero-home-v3.webp') center top/cover no-repeat"></div>
</div>
<script>(function(){var t0=0,t=setInterval(function(){var x=document.querySelector('[data-dc-tpl]');if(x&&!t0)t0=performance.now();var im=document.querySelector('img[data-dc-tpl][fetchpriority=high]');var ready=(x&&innerWidth>860)||(im&&im.complete&&im.naturalWidth);if(ready||(t0&&performance.now()-t0>2500)||performance.now()>15000){clearInterval(t);requestAnimationFrame(function(){requestAnimationFrame(function(){var s=document.getElementById('pre-shell');if(s)s.remove();});});}},50);})();</script>
"""
def add_shell(f):
    s = open(f).read()
    s = re.sub(r'<div id="pre-shell".*?</script>\n', '', s, flags=re.S)
    s = s.replace('</x-dc>\n', '</x-dc>\n' + SHELL, 1)
    open(f, 'w').write(s)

n = 0
for f in sorted(glob.glob(SITE + '*.html')):
    if f.endswith('.dc.html'): fix_component(f); continue
    if fix_page(f): n += 1
for f in ['index.html', 'Home.html']: add_shell(SITE + f)
print('páginas otimizadas:', n)
