# Gera Blog.html e Blog-<slug>.html no site-lp a partir dos posts extraidos do site da loja
import json, re, os, shutil, html, sys
SP=sys.argv[1]; SITE='/home/user/Operacao/meeky/site-lp'
d=json.load(open(SP+'/blog/posts.json')); posts=d['posts']; imgmap=d['imgmap']
# corrige nome de imagem renomeada errado na extracao
for k,v in list(imgmap.items()):
    imgmap[k]='assets/blog/'+os.path.basename(k.split('?')[0])
os.makedirs(SITE+'/assets/blog',exist_ok=True)
for f in os.listdir(SP+'/blog/img'): pass
for k,v in imgmap.items():
    src=SP+'/blog/img/'+(os.path.basename(k).replace('cover-anc-academia.webp','cover-anc.webp'))
    shutil.copy(src, SITE+'/'+v)
slugs={p['slug'] for p in posts}
REDIR={'melhor-headphone-anc-ate-300-reais':'melhor-headphone-anc-ate-300-reais-brasil-2026',
 'meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc':'meeky-f5-anc-pro-vs-qcy-h3-vs-jbl-770nc-comparativo-2026',
 'meeky-f5-anc-pro-vs-soundcore-q20i':'meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026',
 'meeky-f5-anc-pro-vs-anker-soundcore-q20i':'meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026',
 'meeky-f5-anc-pro-vs-soundcore-q20i-comparativo-2026':'meeky-f5-anc-pro-vs-anker-soundcore-q20i-comparativo-2026'}
PAGES={'/':'Home.html','/headphone-anc-meeky-f5-pro':'Produto.html','/produto':'Produto.html','/motion-1':'Motion1.html',
 '/sobre':'Sobre.html','/faq':'Duvidas.html','/contato':'Contato.html','/empresas':'Home.html#volume','/blog':'Blog.html'}
def link(h):
    if h.startswith(('http','mailto:','tel:','#')): return h
    path,_,frag=h.partition('#'); path=path.rstrip('/') or '/'
    base,_,q=path.partition('?')
    m=re.match(r'^/blog/([^/?#]+)$',base)
    if m:
        s=REDIR.get(m.group(1),m.group(1))
        if s in slugs: return 'Blog-%s.html'%s
    if base=='/checkout': return 'https://meeky.com.br'+path
    if base in PAGES: return PAGES[base]+('#'+frag if frag else '')
    return 'https://meeky.com.br'+h
def fix(h):
    h=re.sub(r'<a href="([^"]*)"',lambda m:'<a href="%s"'%html.escape(link(html.unescape(m.group(1))),quote=True),h)
    h=re.sub(r'<img src="([^"]*)"',lambda m:'<img src="%s"'%imgmap.get(m.group(1),m.group(1)),h)
    return h
def img(u): return imgmap.get(u,u) if u else ''
tpl=open(SITE+'/Sobre-antiga.html').read().replace('<meta name="robots" content="noindex">\n','')
HEAD=tpl[:tpl.index('<body>')]
MODAL_V=re.search(r'meeky-form-modal\.js(\?v=[^"]+)?"',tpl).group(1) or ''
TAIL=tpl[tpl.index('<!-- Google Tag Manager (noscript) -->'):]
CSS='''
  body { margin:0; background:#FFFDF9; color:#09010F; font-family:'Poppins','SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
  a { color:#7D47B8; text-decoration:none; }
  a:hover { color:#9E69C1; }
  img, video { max-width:100%; display:block; }
  .hub { font-family:'Hubot Sans','SF Pro Display',-apple-system,sans-serif; font-stretch:75%; font-variation-settings:"wdth" 75; }
  .b-hero { position:relative; overflow:hidden; background:linear-gradient(207.36deg,#4A3169 8.95%,#B987F8 88.12%); color:#fff; padding:166px 24px 92px; text-align:center; }
  .b-hero .eq { position:absolute; left:50%; bottom:-17.7%; width:1634px; max-width:none; height:auto; transform:translateX(-50%) rotate(180deg) scaleX(-1); mix-blend-mode:plus-lighter; pointer-events:none; }
  .b-hero > *:not(.eq) { position:relative; }
  .b-eyebrow { font-size:12px; font-weight:600; line-height:18px; letter-spacing:.02em; text-transform:uppercase; color:#D4C4E5; }
  .b-eyebrow i { display:none; }
  .b-hero h1 { margin:22px auto 0; max-width:820px; font-family:'Hubot Sans','SF Pro Display',sans-serif; font-stretch:75%; font-variation-settings:"wdth" 75; font-size:clamp(40px,4.2vw,64px); font-weight:700; line-height:1.04; text-wrap:balance; color:#fff; }
  .b-hero p { margin:22px auto 0; max-width:560px; font-size:clamp(16px,1.3vw,19px); line-height:1.6; color:#fff; }
  .b-meta { margin-top:22px; font-size:12px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#E8D9FA; }
  .b-search { margin:28px auto 0; max-width:620px; height:64px; box-sizing:border-box; display:flex; align-items:center; gap:14px; padding:0 20px; border-radius:16px; background:#fff; }
  .b-search img { width:20.5px; height:20.5px; flex:0 0 auto; }
  .b-search input { flex:1; min-width:0; height:100%; border:0; outline:0; background:transparent; font:inherit; font-size:15px; color:#09010F; }
  .b-search input::placeholder { color:#6E6678; }
  .b-float { position:fixed; left:0; right:0; top:94px; z-index:150; display:flex; justify-content:center; padding:12px 20px; pointer-events:none; opacity:0; transform:translateY(-14px); transition:opacity .3s, transform .35s cubic-bezier(.16,.84,.44,1); }
  .b-float.on { opacity:1; transform:none; pointer-events:auto; }
  .b-float .b-search { margin:0; width:100%; max-width:620px; height:56px; box-shadow:0 18px 40px -18px rgba(54,19,75,.45), 0 0 0 1px rgba(158,105,193,.25); }
  .b-clear { flex:0 0 auto; width:30px; height:30px; border:0; border-radius:999px; background:#F2EDFA; color:#7D47B8; font-size:18px; line-height:1; cursor:pointer; display:none; }
  .b-search.has .b-clear { display:block; }
  .b-search input::-webkit-search-cancel-button { -webkit-appearance:none; display:none; }
  .b-cover { max-width:1000px; margin:-40px auto 0; padding:0 20px; position:relative; }
  .b-cover img { width:100%; aspect-ratio:1200/630; object-fit:cover; border-radius:28px; box-shadow:0 30px 60px -30px rgba(54,19,75,.45); }
  .b-wrap { max-width:760px; margin:0 auto; padding:56px 20px 40px; }
  .b-prose { font-size:18px; line-height:1.75; color:#4C3F5C; }
  .b-prose > div { margin:0; }
  .b-prose p { margin:0 0 1.15em; }
  .b-prose h2 { margin:2em 0 .6em; font-family:'Hubot Sans','SF Pro Display',sans-serif; font-stretch:75%; font-variation-settings:"wdth" 75; font-size:clamp(28px,2.6vw,38px); font-weight:700; line-height:1.08; color:#09010F; }
  .b-prose h3 { margin:1.6em 0 .5em; font-family:'Hubot Sans','SF Pro Display',sans-serif; font-stretch:75%; font-variation-settings:"wdth" 75; font-size:25px; font-weight:700; line-height:1.15; color:#09010F; }
  .b-prose h4 { margin:1.4em 0 .4em; font-size:18px; color:#09010F; }
  .b-prose strong { color:#09010F; }
  .b-prose a { color:#7D47B8; text-decoration:underline; text-underline-offset:3px; }
  .b-prose ul, .b-prose ol { margin:0 0 1.2em; padding-left:1.3em; }
  .b-prose li { margin:.35em 0; }
  .b-prose li::marker { color:#9E69C1; }
  .b-prose img { width:100%; border-radius:20px; margin:1.6em 0; }
  .b-prose blockquote { margin:1.6em 0; padding:4px 0 4px 22px; border-left:3px solid #9E69C1; color:#09010F; font-style:italic; }
  .b-prose table { width:100%; border-collapse:collapse; margin:1.6em 0; font-size:15px; line-height:1.45; display:block; overflow-x:auto; }
  .b-prose th, .b-prose td { padding:11px 14px; border-bottom:1px solid #E5DEEB; text-align:left; vertical-align:top; }
  .b-prose th { background:#F2EDFA; color:#09010F; font-weight:600; }
  .b-prose hr { border:0; border-top:1px solid #E5DEEB; margin:2em 0; }
  .b-cta { margin:2.2em 0; padding:30px 28px; border-radius:24px; background:#241333; color:#D4C4E5; }
  .b-cta h3, .b-cta strong { color:#fff; margin-top:0; }
  .b-cta p { margin:0 0 .8em; font-size:16px; }
  .b-cta a { display:inline-flex; align-items:center; justify-content:center; margin:6px 0 12px; padding:15px 30px; border-radius:999px; background:linear-gradient(90deg,#9E69C1,#C574FB 50%,#9E69C1); box-shadow:0 2px 0 #470E6D; color:#fff !important; font-weight:600; font-size:14px; letter-spacing:.02em; text-transform:uppercase; text-decoration:none !important; transition:transform .35s, box-shadow .35s; }
  .b-cta a:hover { color:#fff !important; transform:translateY(-2px); box-shadow:0 4px 0 #470E6D, 0 16px 30px -16px rgba(94,45,128,.65); }
  .b-back { display:inline-block; margin-top:28px; font-size:14px; font-weight:600; color:#7D47B8; }
  .b-list { max-width:1322px; margin:0 auto; padding:119px 24px 100px; }
  .b-list-h { display:flex; align-items:center; justify-content:space-between; gap:40px; }
  .b-list-h h2 { margin:0; font-family:'Hubot Sans','SF Pro Display',sans-serif; font-stretch:75%; font-variation-settings:"wdth" 75; font-size:44px; font-weight:700; line-height:1.1; color:#09010F; }
  .b-list-h span { font-size:11px; font-weight:600; letter-spacing:.02em; color:#7D47B8; white-space:nowrap; }
  .b-grid { max-width:1322px; margin:0 auto; padding:37px 0 0; display:grid; grid-template-columns:repeat(3,1fr); gap:37px 24px; }
  .b-card { display:flex; flex-direction:column; border-radius:24px; overflow:hidden; background:#fff; color:#09010F; transition:transform .45s cubic-bezier(.16,.84,.44,1), box-shadow .45s; }
  .b-card:hover { transform:translateY(-4px); box-shadow:0 30px 50px -32px rgba(54,19,75,.45); color:#09010F; }
  .b-card img { width:100%; height:224px; object-fit:cover; border-radius:22px; background:#F2EDFA; }
  .b-card div { padding:24px; display:flex; flex-direction:column; gap:13px; flex:1; }
  .b-card small { font-size:12px; font-weight:600; line-height:18px; text-transform:uppercase; color:#7D47B8; }
  .b-card h2 { margin:0; font-family:'Hubot Sans','SF Pro Display',sans-serif; font-stretch:75%; font-variation-settings:"wdth" 75; font-size:27px; font-weight:700; line-height:1.12; color:#09010F; }
  .b-card p { margin:0; font-size:14px; line-height:22.4px; color:#6E6678; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
  .b-card span { margin-top:auto; padding-top:4px; font-size:13px; font-weight:600; color:#7D47B8; }
  .b-end { margin:37px 0 0; text-align:center; font-size:13px; font-weight:600; color:#6E6678; }
  .b-empty { display:none; margin:40px 0 0; text-align:center; font-size:16px; color:#6E6678; }
  .b-more { background:#F9F0FF; }
  .b-more .b-grid { padding:40px 24px 100px; }
  .b-more h2.b-mt { max-width:1322px; margin:0 auto; padding:72px 24px 0; font-family:'Hubot Sans','SF Pro Display',sans-serif; font-stretch:75%; font-variation-settings:"wdth" 75; font-size:clamp(32px,3vw,44px); font-weight:700; color:#09010F; }
  @media (max-width:1100px) { .b-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:860px) {
    .b-float { top:74px; padding:10px 14px; }
    .b-float .b-search { height:50px; }
    .b-hero { padding:120px 20px 64px; }
    .b-search { height:56px; }
    .b-cover { margin-top:-28px; }
    .b-cover img { border-radius:20px; }
    .b-wrap { padding:40px 20px 24px; }
    .b-prose { font-size:17px; }
    .b-list { padding:48px 20px 72px; }
    .b-list-h { flex-direction:column; align-items:flex-start; gap:8px; }
    .b-list-h h2 { font-size:34px; }
    .b-grid { grid-template-columns:1fr; gap:20px; padding-top:24px; }
    .b-card img { height:auto; aspect-ratio:424/224; }
    .b-more .b-grid { padding:24px 20px 72px; }
    .b-more h2.b-mt { padding:48px 20px 0; }
  }
'''
SCRIPT='''<script type="text/x-dc" data-dc-script data-props="{}">
class Component extends DCLogic {
  renderVals() { return {}; }
  componentDidMount() {
    if (window.__meekyLenis) return;
    const start = () => {
      if (!window.Lenis || window.__meekyLenis) return;
      const lenis = new window.Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      window.__meekyLenis = lenis;
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    };
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lenis@1.1.20/dist/lenis.min.js';
    s.onload = start;
    document.head.appendChild(s);
  }
}
</script>
'''
def page(title, desc, body):
    head=HEAD.replace('<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>%s</title>\n<meta name="description" content="%s">'%(html.escape(title),html.escape(desc,quote=True)),1)
    return head+'''<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.cdnfonts.com/css/sf-pro-display">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hubot+Sans:wdth,wght@75..125,400..700&family=Poppins:wght@400;500;600;700&display=swap">
<style>'''+CSS+'''</style>
<script src="./meeky-form-modal.js'''+MODAL_V+'''"></script>
</helmet>
<div style="font-family:'Poppins','SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;background:#FFFDF9;color:#09010F">
  <div style="position:fixed;top:0;left:0;right:0;z-index:200">
    <dc-import name="HeaderV2" active="blog" hint-size="100%,94px"></dc-import>
  </div>
'''+body+'''
  <dc-import name="FooterV2" hint-size="100%,592px"></dc-import>
</div>
</x-dc>
'''+SCRIPT+TAIL
def _split_tail(h):
    i=h.rindex('</body>'); return (h[:i], h[i:])
def esc(t): return html.escape(t).replace('{','&#123;').replace('}','&#125;')
def card(p, cover=True):
    return ('<a class="b-card" data-q="%s" href="Blog-%s.html"><img src="%s" alt="%s" loading="lazy"><div><small>%s · %s</small><h2>%s</h2><p>%s</p><span>Ler artigo →</span></div></a>'
        %(esc((p['title']+' '+p['excerpt']+' '+p['category']).lower()), p['slug'], img(p.get('coverImage') or p.get('heroImg')), esc(p['title']), esc(p['category']), esc(p['dateDisplay']), esc(p['title']), esc(p['excerpt'])))
# listagem (Figma 4168:63)
body='''  <section class="b-hero">
    <img class="eq" src="assets/blog-v2/eq.svg" alt="" width="1634" height="439">
    <div class="b-eyebrow">Blog Meeky</div>
    <h1>Conhecimento para<br>ouvir o seu mundo.</h1>
    <p>Guias, comparativos e ideias para escolher seu fone e aproveitar cada momento.</p>
    <label class="b-search" id="b-s1"><img src="assets/blog-v2/search.svg" alt="" width="21" height="21"><input id="b-q" class="b-qi" type="search" placeholder="O que você quer descobrir?" aria-label="Buscar no blog" autocomplete="off"><button type="button" class="b-clear" aria-label="Limpar busca">×</button></label>
  </section>
  <div class="b-float" id="b-float"><label class="b-search"><img src="assets/blog-v2/search.svg" alt="" width="21" height="21"><input class="b-qi" type="search" placeholder="Buscar no blog" aria-label="Buscar no blog" autocomplete="off"><button type="button" class="b-clear" aria-label="Limpar busca">×</button></label></div>
  <section class="b-list">
    <div class="b-list-h"><h2>Sua próxima leitura começa aqui.</h2><span id="b-count" data-all="GUIAS E COMPARATIVOS · %d ARTIGOS">GUIAS E COMPARATIVOS · %d ARTIGOS</span></div>
    <div class="b-grid">
''' % (len(posts), len(posts)) + '\n'.join('      '+card(p) for p in posts) + '''
    </div>
    <p id="b-empty" class="b-empty">Nenhum artigo encontrado. Tente outra palavra.</p>
    <p id="b-end" class="b-end">Fim das leituras</p>
  </section>'''
BUSCA='''<script>
// Busca do blog: filtra os cards pelo título, resumo e categoria (sem diferenciar acentos).
// A barra do banner e a barra fixa (aparece ao rolar) usam o mesmo texto.
(function(){
  function norm(t){ return (t||'').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,''); }
  function apply(v, from){
    document.querySelectorAll('.b-qi').forEach(function(i){ if(i!==from) i.value=v; i.closest('.b-search').classList.toggle('has', !!v); });
    var words=norm(v).split(/\\s+/).filter(Boolean), n=0;
    document.querySelectorAll('.b-list .b-card').forEach(function(c){
      var t=norm(c.getAttribute('data-q')), ok=words.every(function(w){ return t.indexOf(w)>-1; });
      c.style.display=ok?'':'none'; if(ok) n++;
    });
    var em=document.getElementById('b-empty'), en=document.getElementById('b-end'), ct=document.getElementById('b-count');
    if(em) em.style.display=n?'none':'block'; if(en) en.style.display=n?'block':'none';
    if(ct) ct.textContent=v ? (n+(n===1?' ARTIGO ENCONTRADO':' ARTIGOS ENCONTRADOS')) : ct.getAttribute('data-all');
  }
  function toList(){
    var l=document.querySelector('.b-list'); if(!l) return;
    var off=(window.innerWidth<=860?74:94)+80, y=l.getBoundingClientRect().top+window.pageYOffset-off;
    if(window.__meekyLenis) window.__meekyLenis.scrollTo(y); else window.scrollTo({top:y,behavior:'smooth'});
  }
  document.addEventListener('input',function(e){
    if(!e.target.classList || !e.target.classList.contains('b-qi')) return;
    apply(e.target.value, e.target);
    if(e.target.closest('#b-float')) { var l=document.querySelector('.b-list'); if(l && l.getBoundingClientRect().bottom<200) toList(); }
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Enter' && e.target.classList && e.target.classList.contains('b-qi')){ e.preventDefault(); e.target.blur(); toList(); } });
  document.addEventListener('click',function(e){ var b=e.target.closest && e.target.closest('.b-clear'); if(!b) return; e.preventDefault(); apply('', null); var i=b.parentNode.querySelector('.b-qi'); if(i) i.focus(); });
  // mostra a barra fixa quando a busca do banner sai da tela
  function tick(){
    var s1=document.getElementById('b-s1'), f=document.getElementById('b-float'); if(!s1||!f) return;
    var top=window.innerWidth<=860?74:94;
    f.classList.toggle('on', s1.getBoundingClientRect().bottom < top+8);
  }
  window.addEventListener('scroll',tick,{passive:true}); window.addEventListener('resize',tick); setInterval(tick,250);
})();
</script>
'''
open(SITE+'/Blog.html','w').write(BUSCA.join(_split_tail(page('Blog | Meeky Audio','Guias, comparativos e reviews sobre headphones com cancelamento de ruído, foco e produtividade.',body))))
# posts
for i,p in enumerate(posts):
    others=[q for q in posts if q['slug']!=p['slug'] and q['category']==p['category']][:3] or [q for q in posts if q['slug']!=p['slug']][:3]
    cover=img(p.get('coverImage') or p.get('heroImg'))
    body='''  <section class="b-hero">
    <div class="b-eyebrow"><i></i>%s<i></i></div>
    <h1>%s</h1>
    %s
    <div class="b-meta">%s · %s de leitura</div>
  </section>
  <div class="b-cover"><img src="%s" alt="%s"></div>
  <article class="b-wrap">
    <div class="b-prose">%s</div>
    <a class="b-back" href="Blog.html">← Voltar ao blog</a>
  </article>
  <section class="b-more">
    <h2 class="b-mt">Continue lendo</h2>
    <div class="b-grid">
%s
    </div>
  </section>''' % (esc(p['category']), esc(p['h1'] or p['title']), ('<p>%s</p>'%esc(p['sub'])) if p['sub'] else '',
        esc(p['dateDisplay']), esc(p['readTime']), cover, esc(p['title']), fix(p['html']),
        '\n'.join('      '+card(q) for q in others))
    open(SITE+'/Blog-%s.html'%p['slug'],'w').write(page(p['title']+' | Meeky Audio', p['excerpt'], body))
print('ok', len(posts))
