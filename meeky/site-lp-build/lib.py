import re
S = '/tmp/claude-0/-home-user-Operacao/fbca03c4-7417-5cc6-bb7f-c3884c6dd20f/scratchpad/hv2/'
SITE = '/home/user/Operacao/meeky/site-lp/'
A = 'assets/home-v2/'
style = open(S + 'style.css').read()
script = open(S + 'script.js').read()

def btn_g(label, href, icon, w, h, extra='', fs=None):
    ic = '<span class="ic-m"></span>' if icon == 'm' else ('<span class="ic-f"></span>' if icon == 'f' else '')
    f = f'font-size:{fs}px;' if fs else ''
    return f'<a href="{href}" class="btn-g" style="width:{w}px;height:{h}px;{f}{extra}">{label}{ic}</a>'

def btn_o(label, href, w, h, white=False, extra=''):
    return f'<a href="{href}" class="btn-o{" white" if white else ""}" style="width:{w}px;height:{h}px;{extra}">{label}</a>'

def uso(top, w, bg, border, icon, ix, iy, label, lx, ly, lfs, desc, dx, dy, dw, dfs, dls):
    # ícone: frame 33px com o desenho em inset 3.13%
    return (f'<div class="uso" style="top:{top}px;width:{w}px;background:{bg};border:1px solid {border}">'
            f'<img src="{A}{icon}" alt="" width="31" height="31" style="left:{ix + 1.03 - 1:.2f}px;top:{iy + 1.03 - 1:.2f}px">'
            f'<p class="t" style="left:{lx - 1}px;top:{ly - 1}px;font-size:{lfs}px;letter-spacing:-{lfs * .02:.2f}px">{label}</p>'
            f'<p class="d" style="left:{dx - 1}px;top:{dy - 1}px;width:{dw}px;font-size:{dfs}px;letter-spacing:-{dls}px">{desc}</p></div>')

MOTION = 'Motion1.html'
F5 = 'Produto.html'
# botões Comprar: o meeky-form-modal.js abre o formulário do GHL e depois leva ao checkout com o produto
BUY_M = 'Checkout.html?produto=motion1&amp;qty=1'
BUY_F = 'Checkout.html?produto=f5&amp;qty=1'

def marquee(zoom):
    g = (f'<div class="mq-g"><img src="{A}techtudo.svg" alt="TechTudo" width="136" height="24" style="width:136.265px;height:23.992px">'
         '<span>Top 7 ANC 2026</span><span>70h Bateria ANC</span></div>')
    return (f'<section style="background:#731D87;overflow:hidden"><div style="zoom:{zoom};height:82px;display:flex;align-items:center;padding-left:12px">'
            f'<div class="mq-track">{g * 6}{g * 6}</div></div></section>')

def gal_track(w, h, gap, r):
    one = ''.join(f'<img src="{A}gal/{g}.webp" alt="" width="{w}" height="{h}" loading="lazy" style="width:{w}px;height:{h}px;margin-right:{gap}px;border-radius:{r}px">' for g in GAL)
    return f'<div class="gal-track">{one}{one}</div>'

GAL = ['g1-9', 'g2-8', 'g4-65', 'g5-66', 'g6-64', 'g8-62', 'g7-63']

def page(old_file, out_files, active, desk, mob, extra_head='', page_vals='', footer=True):
    old = open(SITE + old_file).read()
    head = old[:old.index('<body>')].replace('<meta name="robots" content="noindex">\n', '')
    tail = old[old.index('<!-- Google Tag Manager (noscript) -->'):]
    pv = f"<script>window.__pageVals = {page_vals};</script>" if page_vals else ''
    body = f"""<body>
<x-dc>
<helmet>
{style}
{extra_head}
{pv}
<script src="./meeky-form-modal.js?v=20261017a"></script>
</helmet>
<div style="font-family:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;background:#FFFDF9;color:#09010F;padding-top:{{{{ topPad }}}}">

  <div style="position:fixed;top:0;left:0;right:0;z-index:200">
    <dc-import name="HeaderV2" active="{active}" hint-size="100%,94px"></dc-import>
  </div>

  <sc-if value="{{{{ isDesktop }}}}" hint-placeholder-val="{{{{ true }}}}">
{desk}
  </sc-if>

  <sc-if value="{{{{ isMobile }}}}">
{mob}
  </sc-if>

  <dc-import name="FooterV2" hint-size="100%,592px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props="{{}}">
{script}
</script>
"""
    html = head + body + tail
    for f in out_files:
        open(SITE + f, 'w').write(html)
    return html
