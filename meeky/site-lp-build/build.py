import sys, re
S = '/tmp/claude-0/-home-user-Operacao/fbca03c4-7417-5cc6-bb7f-c3884c6dd20f/scratchpad/hv2/'
SITE = '/home/user/Operacao/meeky/site-lp/'
A = 'assets/home-v2/'

old = open(SITE + 'Home-antiga.html').read()
head = old[:old.index('<body>')].replace('<meta name="robots" content="noindex">\n', '')
tail_noscript = old[old.index('<!-- Google Tag Manager (noscript) -->'):]
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

# ---------------- DESKTOP ----------------
D = []
D.append(f'''
  <!-- Hero (Figma 3402:35) -->
  <section style="position:relative;height:{{{{ heroH }}}};background:#EFE9EA url('assets/hero-home-v3.webp') center top/{{{{ heroBg }}}} no-repeat;overflow:hidden">
    <div class="hv" style="height:829px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:615px;width:706px;display:flex;flex-direction:column;gap:10px">
        <h1 class="hub" style="animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .15s both;margin:0;height:58px;display:flex;align-items:center;font-weight:500;font-size:54.708px;letter-spacing:-1.6412px;line-height:.94;color:#09010F;white-space:nowrap">Quanto do mundo você&nbsp;<span class="roxo">quer ouvir agora?</span></h1>
        <p class="pop" style="animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .38s both;margin:0;width:667px;font-size:20.323px;letter-spacing:-.32px;line-height:1.2;color:#8F8A94">A Meeky faz fones para quem decide quanto do mundo quer ouvir. Existe o momento de amenizar o ruído e o de se <span style="font-weight:600">conectar com o seu entorno.&nbsp; Quem controla isso é você.</span></p>
      </div>
      <div class="ab" style="left:1018px;top:655.56px;animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .6s both">
        <a href="#modelos" class="btn-g" style="width:299px;height:63.873px;font-size:16px;box-shadow:0 1.851px 0 #470E6D">Conhecer os modelos</a>
      </div>
    </div>
  </section>
''')

def marquee(zoom):
    g = (f'<div class="mq-g"><img src="{A}techtudo.svg" alt="TechTudo" width="136" height="24" style="width:136.265px;height:23.992px">'
         '<span>Top 7 ANC 2026</span><span>70h Bateria ANC</span></div>')
    return (f'<section style="background:#731D87;overflow:hidden"><div style="zoom:{zoom};height:82px;display:flex;align-items:center;padding-left:12px">'
            f'<div class="mq-track">{g * 6}{g * 6}</div></div></section>')

D.append('\n  <!-- Faixa TechTudo (Figma 2630:206) -->\n  ' + marquee('{{ mqZoom }}') + '\n')

D.append(f'''
  <!-- Tem hora de… (Figma 3440:768) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:1738px;zoom:{{{{ k }}}}">
      <img class="ab" src="{A}eq-bars.svg" alt="" width="1634" height="439" style="left:-159.94px;top:1299px;width:1634.41px;height:439px">
      <img class="ab" src="{A}motion-card.webp" alt="Mulher usando o Meeky Motion 1" width="640" height="427" loading="lazy" style="left:35px;top:129px;width:640px;height:427px;border-radius:10px" data-reveal="">
      <div class="ab" style="left:765px;top:182px;width:447px;display:flex;flex-direction:column;gap:23px" data-reveal=".1">
        <h2 class="h55 hub" style="width:363px">Tem hora de ouvir o<br>que <span class="roxo">está em volta</span></h2>
        <p class="pop" style="margin:0;width:434px;font-size:18px;line-height:1.29;color:#8F8A94">O Motion 1 transmite o som por vibração óssea e mantém o canal do ouvido livre. Você escuta sua música e <b style="font-weight:700">continua acompanhando<br>o entorno.</b></p>
      </div>
      <div class="ab" style="left:765px;top:423px;display:flex;gap:6px">{btn_g("Comprar o motion 1", BUY_M, "m", 215, 45)}{btn_o("Ver detalhes", MOTION, 199, 45)}</div>

      <img class="ab" src="{A}f5-card.webp" alt="Mulher usando o Meeky F5 ANC Pro" width="640" height="422" loading="lazy" style="left:657px;top:656px;width:640px;height:422px;border-radius:10px" data-reveal="">
      <div class="ab" style="left:125px;top:709px;width:447px;display:flex;flex-direction:column;gap:23px" data-reveal=".1">
        <h2 class="h55 hub" style="width:399px">Tem hora de<br><span class="roxo">amenizar o ruído</span></h2>
        <p class="pop" style="margin:0;width:435px;font-size:18px;line-height:1.29;color:#8F8A94">O motor do ônibus. O ar-condicionado do escritório. O barulho constante que acompanha o seu dia. Quando você prefere ouvir menos do ambiente, o F5 ANC Pro usa cancelamento <b style="font-weight:700">ativo para reduzir esses ruídos.</b></p>
      </div>
      <div class="ab" style="left:125px;top:975px;display:flex;align-items:center;gap:9px">{btn_g("Comprar o F5 ANC Pro", BUY_F, "f", 215, 49)}{btn_o("Ver detalhes", F5, 199, 45)}</div>

      <img class="ab" src="{A}smile-woman.webp" alt="Mulher sorrindo com o Meeky F5 ANC Pro" width="738" height="738" loading="lazy" style="left:301px;top:1043px;width:738px;height:738px">
    </div>
  </section>
''')

def motion_cards():
    bg, bd = '#FDF3FF', '#9679BF'
    return ''.join([
        uso(0, 529, bg, bd, 'check-motion.svg', 14.63, 18.25, 'Na Caminhada', 59, 34.5, 18, 'Para ouvir sua música e continuar acompanhando os sons do entorno.', 209, 37.75, 285, 16, .32),
        uso(88, 529, bg, bd, 'check-motion.svg', 16, 17.5, 'Na Corrida', 57.5, 35.5, 18, 'Para quando manter o canal do ouvido livre faz parte da sua escolha.', 208.81, 36.5, 295, 16, .32),
        uso(176, 529, bg, bd, 'check-motion.svg', 17, 20, 'No Trajeto', 57.25, 35.5, 18, 'Para escutar seu áudio sem cobrir o canal do ouvido.', 209, 36.5, 273, 16, .32),
    ])

def f5_cards():
    bg, bd = '#F9E2FF', 'rgba(249,223,255,.18)'
    return ''.join([
        uso(0, 517, bg, bd, 'check-f5.svg', 13.75, 19.5, 'No Trabalho', 54, 38, 20, 'Menos distrações. Mais concentração para o que realmente importa.', 194, 36, 290, 14, .28),
        uso(88, 517, bg, bd, 'check-f5.svg', 18.25, 19, 'No Estudo', 58.5, 37.5, 20, 'Mais imersão nas aulas e nos conteúdos, com menos interferência dos ruídos ao redor.', 193, 37, 310, 14, .28),
        uso(176, 517, bg, bd, 'check-f5.svg', 18.5, 19.5, 'No Trajeto', 70.5, 37.5, 20, 'Para reduzir ruídos contínuos, como o motor do ônibus.', 194, 36.5, 285, 14, .28),
    ])

D.append(f'''
  <!-- Motion 1 (Figma 3522:683) -->
  <section style="background:#F9F0FF;overflow:hidden">
    <div class="hv" style="height:814px;zoom:{{{{ k }}}}">
      <img class="ab" src="{A}motion-circles.svg" alt="" width="553" height="553" style="left:37px;top:105px;width:553px;height:553px">
      <p class="ab pop" style="left:-12px;top:709.16px;margin:0;font-weight:700;font-size:142.703px;letter-spacing:-4.2811px;line-height:1;color:rgba(112,79,132,.51);white-space:nowrap">MOTION 1</p>
      <img class="ab flt-p" src="{A}motion-product.webp" alt="Meeky Motion 1" width="606" height="606" loading="lazy" style="left:11px;top:68px;width:606px;height:606px">
      <div class="ab" style="left:722px;top:120px;width:529px" data-reveal=".1">
        <h2 class="h55 hub" style="width:407px;height:102px">Sua música.<br><span class="roxo">O entorno também.</span></h2>
        <p class="pop" style="margin:22px 0 0;width:494px;height:70px;font-size:22px;letter-spacing:-.44px;line-height:1.15;color:#645C6C">A condução óssea transmite o som por vibração e mantém o <span style="font-weight:600">canal do ouvido livre para acompanhar o ambiente.</span></p>
        <div style="position:relative;margin-top:40px;height:249px">{motion_cards()}</div>
        <div style="margin-top:40px;display:flex;align-items:flex-start;gap:7px">{btn_g("Comprar o motion 1", BUY_M, "m", 224, 49)}{btn_o("Ver detalhes", MOTION, 199, 45, True, "margin-top:2px")}</div>
      </div>
    </div>
  </section>

  <!-- F5 ANC Pro (Figma 3471:243) -->
  <section style="background:#36134B;overflow:hidden">
    <div class="hv" style="height:792px;zoom:{{{{ k }}}}">
      <img class="ab" src="{A}f5-circle.svg" alt="" width="852" height="852" style="left:514.49px;top:-42.36px;width:851.841px;height:851.841px">
      <p class="ab pop" style="left:527px;top:659.49px;margin:0;font-weight:700;font-size:171.948px;letter-spacing:-13.7558px;line-height:1;color:#704F84;white-space:nowrap">F5 ANC PRO</p>
      <div class="ab flt-p" style="left:607px;top:85.89px;width:615.042px;height:588.91px;display:flex;align-items:center;justify-content:center;animation-delay:-2.5s">
        <img src="{A}f5-product.webp" alt="Meeky F5 ANC Pro" width="523" height="488" loading="lazy" style="width:522.652px;height:488.399px;flex:none;transform:rotate(12.35deg)">
      </div>
      <div class="ab" style="left:75px;top:120px;width:517px" data-reveal=".1">
        <h2 class="h55 hub" style="width:407px;height:102px;color:#FFFDF9">Para quando você quer<br><span style="color:#CF87FF">amenizar o ruído.</span></h2>
        <p class="pop" style="margin:22px 0 0;width:494px;height:59px;font-size:22px;letter-spacing:-.44px;line-height:1.15;color:#D4C3E6">O cancelamento ativo reduz ruídos constantes do ambiente. Você escolhe <b style="font-weight:700">quando ouvir menos do que está em volta.</b></p>
        <div style="position:relative;margin-top:40px;height:249px">{f5_cards()}</div>
        <div style="margin-top:40px;display:flex;align-items:flex-start;gap:7px">{btn_g("Comprar o F5 ANC Pro", BUY_F, "f", 224, 49)}{btn_o("Ver detalhes", F5, 199, 45, True, "margin-top:2px")}</div>
      </div>
    </div>
  </section>
''')

GAL = ['g1-9', 'g2-8', 'g4-65', 'g5-66', 'g6-64', 'g8-62', 'g7-63']
def gal_track(w, h, gap, r):
    one = ''.join(f'<img src="{A}gal/{g}.webp" alt="" width="{w}" height="{h}" loading="lazy" style="width:{w}px;height:{h}px;margin-right:{gap}px;border-radius:{r}px">' for g in GAL)
    return f'<div class="gal-track">{one}{one}</div>'

def warr_f5():
    return f'''<div class="ab" style="left:613px;top:589px;width:313px;height:308px;border-radius:13.709px;background:#0A040F;overflow:hidden">
        <img class="ab" src="{A}warr-f5-bg.webp" alt="Meeky F5 ANC Pro com garantia de 12 meses" width="769" height="330" loading="lazy" style="left:-237px;top:42px;width:769px;height:330px;object-fit:cover">
        <div class="ab" style="left:90.18px;top:18px;width:133.071px;height:23.763px;box-sizing:border-box;border-radius:593px;border:.594px solid rgba(255,255,255,.6);background:linear-gradient(90deg,#FFFFFF,#E9C8FF);display:flex;align-items:center;justify-content:center"><span class="sf" style="font-weight:700;font-size:16.27px;letter-spacing:-.3254px;line-height:.95;color:#000;text-transform:uppercase">F5 ANC Pro</span></div>
        <p class="ab sf grad-txt" style="left:75.37px;top:49.07px;width:169.994px;height:37.472px;margin:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:32.967px;letter-spacing:-.6593px;line-height:.95;background-image:linear-gradient(180deg,#F9DDFF 0%,#FFFFFF 50%,#F9DDFF 100%);white-space:nowrap">Garantia de</p>
        <p class="ab hub grad-txt" style="left:-45px;top:79.23px;width:403.427px;height:61.234px;margin:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:64.964px;letter-spacing:-3.2482px;line-height:.95;background-image:linear-gradient(180deg,#F9DDFF 0%,#FFFFFF 50%,#F9DDFF 100%);white-space:nowrap">12 meses</p>
      </div>'''

def warr_motion():
    return f'''<div class="ab" style="left:946px;top:589px;width:313px;height:308px;border-radius:13.709px;background:#0A040F;overflow:hidden">
        <img class="ab" src="{A}warr-motion-bg.webp" alt="Meeky Motion 1 com garantia de 24 meses" width="313" height="348" loading="lazy" style="left:0;top:0;width:312.87px;height:347.86px">
        <img class="ab" src="{A}warr-motion-ellipse.svg" alt="" width="467" height="467" style="left:26.91px;top:-131.09px;width:467.2px;height:467.2px">
        <div class="ab" style="left:90.18px;top:18px;width:133.071px;height:23.763px;box-sizing:border-box;border-radius:593px;border:.594px solid rgba(255,255,255,.6);background:linear-gradient(102deg,#FFFFFF 48.146%,#F9DDFF 96.961%);display:flex;align-items:center;justify-content:center"><span class="sf" style="font-weight:700;font-size:16.27px;letter-spacing:-.3254px;line-height:.95;color:#0C0B0B;text-transform:uppercase">Motion 1</span></div>
        <p class="ab sf" style="left:75.37px;top:49.07px;width:169.994px;height:37.472px;margin:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:32.967px;letter-spacing:-.6593px;line-height:.95;color:#FFFDF9;white-space:nowrap">Garantia de</p>
        <p class="ab hub" style="left:-45px;top:79px;width:403.427px;height:61.234px;margin:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:64.964px;letter-spacing:-3.2482px;line-height:.95;color:#fff;white-space:pre">24  meses</p>
      </div>'''

def card_motion(left, top, mobile=False):
    btn = btn_g("Comprar o motion 1", BUY_M, "m", 300, 64, "gap:10px;box-shadow:0 2.5px 0 #470E6D", 18) if mobile else btn_g("Comprar o motion 1", BUY_M, "m", 216, 47.25, "gap:7.3px;box-shadow:0 1.929px 0 #470E6D", 13)
    btop = 530 if mobile else 541.45
    return f'''<div class="ab" style="left:{left}px;top:{top}px;width:519px;height:635px;border-radius:15px;background:#C4C4C4;overflow:hidden">
        <img class="ab" src="{A}card-motion.webp" alt="Meeky Motion 1" width="527" height="659" loading="lazy" style="left:-4px;top:-57px;width:527px;height:659px;object-fit:cover">
        <div class="ab" style="left:0;top:380px;width:519px;height:297px;background:linear-gradient(180deg,rgba(35,2,43,0),#23022B)"></div>
        <div class="ab" style="left:0;top:380px;width:519px;height:297px;background:linear-gradient(180deg,rgba(35,2,43,0),#23022B)"></div>
        <div class="ab" style="left:0;top:380px;width:519px;height:297px;background:linear-gradient(180deg,rgba(35,2,43,0),#23022B)"></div>
        <p class="ab sf grad-txt" style="left:40px;top:468px;width:max-content;height:50.293px;margin:0;display:flex;align-items:center;font-weight:700;font-size:63.663px;letter-spacing:-1.2733px;line-height:1.48;background-image:linear-gradient(90deg,#FFFFFF 0%,#F0B1FF 100%);white-space:nowrap">Motion 1</p>
        <div class="ab" style="left:40px;top:{btop}px">{btn}</div>
      </div>'''

def card_f5(left, top, mobile=False):
    btn = btn_g("Comprar o F5 ANC Pro", BUY_F, "f", 300, 64, "gap:10px;box-shadow:0 2.5px 0 #470E6D", 18) if mobile else btn_g("Comprar o F5 ANC Pro", BUY_F, "f", 216, 47.25, "gap:7.3px;box-shadow:0 1.929px 0 #470E6D")
    btop = 158 if mobile else 169.12
    ttop = 84 if mobile else 101
    return f'''<div class="ab" style="left:{left}px;top:{top}px;width:646px;height:308px;border-radius:15px;overflow:hidden;background:#23022B">
        <img class="ab" src="{A}card-f5.webp" alt="Meeky F5 ANC Pro" width="1066" height="457" loading="lazy" style="left:-36.19%;top:-18.34%;width:165.01%;height:148.43%">
        <div class="ab" style="left:-10px;top:0;width:372px;height:308px;background:linear-gradient(90deg,#23022B,rgba(35,2,43,0))"></div>
        <p class="ab sf grad-txt" style="left:32px;top:{ttop}px;width:max-content;height:39.344px;margin:0;display:flex;align-items:center;font-weight:700;font-size:50.096px;letter-spacing:-1.0019px;line-height:1.48;text-transform:uppercase;background-image:linear-gradient(90deg,#FFFFFF 0%,#F0B1FF 100%);white-space:pre"> F5 ANC Pro</p>
        <div class="ab" style="left:32px;top:{btop}px">{btn}</div>
      </div>'''

D.append(f'''
  <!-- Diferentes momentos + Primeiro, seu momento (Figma 3530:789, 3531:803, 3621:2, 3624:36, 3537:2388, 3531:840) -->
  <section id="modelos" style="position:relative;background:#FFFDF9;overflow:hidden;scroll-margin-top:94px">
    <div class="hv" style="height:1759px;zoom:{{{{ k }}}}">
      <h2 class="ab h55 hub" style="left:86px;top:112px;width:451px;height:103px" data-reveal="">Diferentes momentos.<br><span class="roxo">Uma escolha de cada vez.</span></h2>
      <img class="ab" src="{A}arrow-down-left.svg" alt="" width="44" height="44" style="left:1197px;top:171px;width:44px;height:44px;transform:rotate(180deg)">
      {card_motion(75, 262).replace('class="ab" style="left:75px', 'class="ab" data-reveal="" style="left:75px', 1)}
      {card_f5(613, 262)}
      {warr_f5()}
      {warr_motion()}
    </div>
    <div style="position:absolute;left:0;right:0;top:0;zoom:{{{{ k }}}}">
      <div style="position:absolute;left:0;right:0;top:1159px;height:391px;overflow:hidden">{gal_track(295, 391, 27, 30)}</div>
    </div>
    <div style="position:absolute;left:0;right:0;top:0;zoom:{{{{ k }}}}">
      <div class="hv">
        <div class="ab" style="left:32px;top:1075px;width:1258px;height:548px;border-radius:21px;overflow:hidden;background:linear-gradient(180deg,#1C0721,#30003B)" data-reveal="">
          <p class="ab hub" style="left:75px;top:90px;width:454px;height:353px;margin:0;display:flex;align-items:center;font-weight:500;font-size:91.903px;letter-spacing:-2.7571px;line-height:1;color:#EDDFF8"><span><b style="font-weight:700;color:#FFFDF9">Primeiro,<br>seu momento.</b><br>Depois,<br>a tecnologia.</span></p>
          <div class="ab" style="left:590px;top:-34px;width:706px;height:617px;background:#D9D9D9"></div>
          <img class="ab" src="{A}momento-woman.webp" alt="Mulher treinando com o Meeky F5 ANC Pro" width="780" height="974" loading="lazy" style="left:590px;top:-212px;width:780px;height:974px;object-fit:cover">
        </div>
      </div>
    </div>
  </section>

  <!-- O mundo no seu volume (Figma 3542:22) -->
  <section style="background:#F9F0FF;overflow:hidden">
    <div class="hv" style="height:581px;zoom:{{{{ k }}}}">
      <p class="ab hub" style="left:321.96px;top:137px;width:678.077px;height:215px;margin:0;font-weight:700;font-size:119.046px;line-height:.82;color:#441463;text-align:center">O mundo no<br>seu volume</p>
      <div class="ab" style="left:169px;top:-310px;width:984px;height:1038px;overflow:hidden;pointer-events:none"><img src="{A}cta-headphone.webp" alt="" width="984" height="1476" loading="lazy" style="width:100%;height:142.26%"></div>
      <div class="ab" style="left:511px;top:366px"><a href="#modelos" class="btn-g" style="width:299px;height:63.873px;font-size:16px;box-shadow:0 1.851px 0 #470E6D">Conhecer os modelos</a></div>
      <div class="ab flt" style="left:40px;top:83px;width:179px;height:177px;border-radius:19px;overflow:hidden;animation-delay:-0s"><img class="ab" src="{A}cta-thumb-boxer.webp" alt="" width="179" height="225" loading="lazy" style="left:0;top:-.15%;width:100%;height:126.98%"></div>
      <div class="ab flt" style="left:1120px;top:381px;width:175px;height:161px;border-radius:22px;overflow:hidden;animation-delay:-2.4s"><img class="ab" src="{A}cta-thumb-f5.webp" alt="" width="230" height="290" loading="lazy" style="left:-15.74%;top:-69.06%;width:131.48%;height:180.24%"></div>
      <div class="ab flt" style="left:1040px;top:66px;width:159px;height:142px;border-radius:16px;overflow:hidden;animation-delay:-1.3s"><img class="ab" src="{A}cta-thumb-motion.webp" alt="" width="251" height="334" loading="lazy" style="left:-28.74%;top:-37.1%;width:158.02%;height:235.37%"></div>
    </div>
  </section>
''')

# ---------------- CELULAR ----------------
def m_uso(bg, border, icon, label, desc):
    return f'<div class="m-uso" style="background:{bg};border:1px solid {border}"><img src="{A}{icon}" alt="" width="28" height="28"><b>{label}</b><span>{desc}</span></div>'

def m_btns(buy, href, icon, white=False):
    ic = '<span class="ic-m"></span>' if icon == 'm' else '<span class="ic-f"></span>'
    buy_href = BUY_M if icon == 'm' else BUY_F
    return f'<div class="m-btns"><a href="{buy_href}" class="btn-g">{buy}{ic}</a><a href="{href}" class="btn-o{" white" if white else ""}">Ver detalhes</a></div>'

M = []
M.append(f'''
  <!-- Hero celular -->
  <section style="background:#EEEFF4">
    <div style="overflow:hidden;line-height:0"><img src="assets/hero-home-mobile-v5.webp" alt="Meeky F5 ANC Pro e Meeky Motion 1" width="801" height="399" style="width:205%;max-width:none;margin-left:-55%;height:auto;display:block"></div>
    <div style="position:relative;margin-top:-40%;padding:0 20px 40px;text-align:center">
      <h1 class="hub" style="animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .15s both;margin:0;font-weight:500;font-size:42px;letter-spacing:-1.26px;line-height:1;color:#09010F">Quanto do mundo você <span class="roxo">quer ouvir agora?</span></h1>
      <p class="pop" style="animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .38s both;margin:14px auto 0;max-width:360px;font-size:15.5px;letter-spacing:-.25px;line-height:1.3;color:#8F8A94">A Meeky faz fones para quem decide quanto do mundo quer ouvir. Existe o momento de amenizar o ruído e o de se <span style="font-weight:600">conectar com o seu entorno. Quem controla isso é você.</span></p>
      <div style="animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .6s both;margin-top:24px"><a href="#modelos" class="btn-g" style="height:56px;padding:0 34px;font-size:15.5px">Conhecer os modelos</a></div>
    </div>
  </section>
''')
M.append('\n  ' + marquee('.58') + '\n')
M.append(f'''
  <section style="background:#FFFDF9;overflow:hidden;padding-top:48px">
    <div class="m-sec">
      <img src="{A}motion-card.webp" alt="Mulher usando o Meeky Motion 1" width="640" height="427" loading="lazy" style="width:100%;height:auto;border-radius:10px" data-reveal="">
      <div style="margin-top:28px" data-reveal="">
        <h2 class="m-h hub">Tem hora de ouvir o<br>que <span class="roxo">está em volta</span></h2>
        <p class="m-p">O Motion 1 transmite o som por vibração óssea e mantém o canal do ouvido livre. Você escuta sua música e <b style="font-weight:700">continua acompanhando o entorno.</b></p>
        {m_btns("Comprar o motion 1", MOTION, "m")}
      </div>
      <div style="margin-top:56px" data-reveal="">
        <h2 class="m-h hub">Tem hora de<br><span class="roxo">amenizar o ruído</span></h2>
        <p class="m-p">O motor do ônibus. O ar-condicionado do escritório. O barulho constante que acompanha o seu dia. Quando você prefere ouvir menos do ambiente, o F5 ANC Pro usa cancelamento <b style="font-weight:700">ativo para reduzir esses ruídos.</b></p>
        {m_btns("Comprar o F5 ANC Pro", F5, "f")}
      </div>
      <img src="{A}f5-card.webp" alt="Mulher usando o Meeky F5 ANC Pro" width="640" height="422" loading="lazy" style="margin-top:28px;width:100%;height:auto;border-radius:10px" data-reveal="">
    </div>
    <div style="position:relative;margin-top:36px;height:92vw;max-height:440px">
      <img src="{A}eq-bars.svg" alt="" width="1634" height="439" style="position:absolute;left:-20%;bottom:0;width:140%;height:auto">
      <img src="{A}smile-woman.webp" alt="Mulher sorrindo com o Meeky F5 ANC Pro" width="738" height="738" loading="lazy" style="position:absolute;left:50%;bottom:-6%;width:92vw;max-width:470px;height:auto;transform:translateX(-50%)">
    </div>
  </section>

  <section style="background:#F9F0FF;overflow:hidden;padding-top:40px">
    <div class="m-sec">
      <div style="position:relative;width:100%;max-width:420px;margin:0 auto;aspect-ratio:1" data-reveal="">
        <img src="{A}motion-circles.svg" alt="" width="553" height="553" style="position:absolute;left:4.29%;top:6.1%;width:91.25%;height:91.25%">
        <img class="flt-p" src="{A}motion-product.webp" alt="Meeky Motion 1" width="606" height="606" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%">
      </div>
      <h2 class="m-h hub" style="margin-top:20px">Sua música.<br><span class="roxo">O entorno também.</span></h2>
      <p class="m-p" style="color:#645C6C;font-size:16.5px">A condução óssea transmite o som por vibração e mantém o <span style="font-weight:600">canal do ouvido livre para acompanhar o ambiente.</span></p>
      <div style="margin-top:22px;display:flex;flex-direction:column;gap:10px">
        {m_uso('#FDF3FF', '#9679BF', 'check-motion.svg', 'Na Caminhada', 'Para ouvir sua música e continuar acompanhando os sons do entorno.')}
        {m_uso('#FDF3FF', '#9679BF', 'check-motion.svg', 'Na Corrida', 'Para quando manter o canal do ouvido livre faz parte da sua escolha.')}
        {m_uso('#FDF3FF', '#9679BF', 'check-motion.svg', 'No Trajeto', 'Para escutar seu áudio sem cobrir o canal do ouvido.')}
      </div>
      {m_btns("Comprar o motion 1", MOTION, "m", True)}
    </div>
    <div style="height:14vw;overflow:hidden;margin-top:26px"><p class="pop" style="margin:0 0 0 14px;font-weight:700;font-size:19vw;letter-spacing:-.03em;line-height:1;color:rgba(112,79,132,.51);white-space:nowrap">MOTION 1</p></div>
  </section>

  <section style="background:#36134B;overflow:hidden;padding-top:44px">
    <div class="m-sec">
      <div style="position:relative;width:100%;max-width:420px;margin:0 auto;aspect-ratio:1" data-reveal="">
        <img src="{A}f5-circle.svg" alt="" width="852" height="852" style="position:absolute;left:-20%;top:-20%;width:140%;height:140%">
        <div class="flt-p" style="position:absolute;inset:0;animation-delay:-2.5s"><img src="{A}f5-product.webp" alt="Meeky F5 ANC Pro" width="523" height="488" loading="lazy" style="position:absolute;left:8%;top:9%;width:84%;height:auto;transform:rotate(12.35deg)"></div>
      </div>
      <h2 class="m-h hub" style="margin-top:20px;color:#FFFDF9">Para quando você quer<br><span style="color:#CF87FF">amenizar o ruído.</span></h2>
      <p class="m-p" style="color:#D4C3E6;font-size:16.5px">O cancelamento ativo reduz ruídos constantes do ambiente. Você escolhe <b style="font-weight:700">quando ouvir menos do que está em volta.</b></p>
      <div style="margin-top:22px;display:flex;flex-direction:column;gap:10px">
        {m_uso('#F9E2FF', 'rgba(249,223,255,.18)', 'check-f5.svg', 'No Trabalho', 'Menos distrações. Mais concentração para o que realmente importa.')}
        {m_uso('#F9E2FF', 'rgba(249,223,255,.18)', 'check-f5.svg', 'No Estudo', 'Mais imersão nas aulas e nos conteúdos, com menos interferência dos ruídos ao redor.')}
        {m_uso('#F9E2FF', 'rgba(249,223,255,.18)', 'check-f5.svg', 'No Trajeto', 'Para reduzir ruídos contínuos, como o motor do ônibus.')}
      </div>
      {m_btns("Comprar o F5 ANC Pro", F5, "f", True)}
    </div>
    <div style="height:12.4vw;overflow:hidden;margin-top:26px"><p class="pop" style="margin:0 0 0 10px;font-weight:700;font-size:17vw;letter-spacing:-.08em;line-height:1;color:#704F84;white-space:nowrap">F5 ANC PRO</p></div>
  </section>

  <section id="modelos" style="background:#FFFDF9;overflow:hidden;padding:52px 0 56px;scroll-margin-top:74px">
    <div class="m-sec">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:12px" data-reveal="">
        <h2 class="m-h hub" style="font-size:36px">Diferentes momentos.<br><span class="roxo">Uma escolha de cada vez.</span></h2>
        <img src="{A}arrow-down-left.svg" alt="" width="44" height="44" style="width:32px;height:32px;flex:0 0 auto;margin-bottom:4px;transform:rotate(180deg)">
      </div>
      <div style="margin-top:26px;width:519px;height:635px;position:relative;zoom:{{{{ kmCard }}}}">{card_motion(0, 0, True)}</div>
      <div style="margin-top:14px;width:646px;height:635px;position:relative;zoom:{{{{ kmGrid }}}}">{card_f5(0, 0, True)}{warr_f5().replace('left:613px;top:589px', 'left:0;top:327px')}{warr_motion().replace('left:946px;top:589px', 'left:333px;top:327px')}</div>
    </div>
    <div class="m-sec" style="margin-top:44px">
      <div style="border-radius:21px;overflow:hidden;background:linear-gradient(180deg,#1C0721,#30003B)" data-reveal="">
        <p class="hub" style="margin:0;padding:34px 26px 30px;font-weight:500;font-size:48px;letter-spacing:-1.44px;line-height:1;color:#EDDFF8"><b style="font-weight:700;color:#FFFDF9">Primeiro,<br>seu momento.</b><br>Depois,<br>a tecnologia.</p>
        <div style="height:68vw;max-height:340px;overflow:hidden"><img src="{A}momento-woman.webp" alt="Mulher treinando com o Meeky F5 ANC Pro" width="780" height="974" loading="lazy" class="cover" style="object-position:50% 30%"></div>
      </div>
    </div>
    <div style="margin-top:20px;overflow:hidden">{gal_track(160, 212, 12, 18)}</div>
  </section>

  <section style="position:relative;background:#F9F0FF;overflow:hidden;height:390px">
    <img src="{A}cta-headphone.webp" alt="" width="984" height="1476" loading="lazy" style="position:absolute;left:50%;top:-56px;width:430px;height:auto;transform:translateX(-50%);pointer-events:none">
    <div style="position:relative;padding-top:132px;text-align:center">
      <p class="hub" style="margin:0;font-weight:700;font-size:54px;line-height:.82;color:#441463">O mundo no<br>seu volume</p>
      <a href="#modelos" class="btn-g" style="margin-top:28px;height:54px;padding:0 30px;font-size:14.5px;box-shadow:0 1.851px 0 #470E6D">Conhecer os modelos</a>
    </div>
    <div class="flt" style="position:absolute;left:14px;top:30px;width:84px;height:84px;border-radius:14px;overflow:hidden;animation-delay:-0s"><img src="{A}cta-thumb-boxer.webp" alt="" width="84" height="105" loading="lazy" style="width:100%;height:126.98%"></div>
    <div class="flt" style="position:absolute;right:16px;top:22px;width:76px;height:68px;border-radius:12px;overflow:hidden;animation-delay:-1.3s"><img src="{A}cta-thumb-motion.webp" alt="" width="120" height="160" loading="lazy" style="position:absolute;left:-28.74%;top:-37.1%;width:158.02%;height:235.37%"></div>
    <div class="flt" style="position:absolute;right:14px;bottom:26px;width:84px;height:77px;border-radius:14px;overflow:hidden;animation-delay:-2.4s"><img src="{A}cta-thumb-f5.webp" alt="" width="110" height="139" loading="lazy" style="position:absolute;left:-15.74%;top:-69.06%;width:131.48%;height:180.24%"></div>
  </section>
''')

body = f'''<body>
<x-dc>
<helmet>
{style}
<script src="./image-slot.js"></script>
<script src="./meeky-form-modal.js?v=20261017a"></script>
</helmet>
<div style="font-family:'SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;background:#FFFDF9;color:#09010F;padding-top:{{{{ topPad }}}}">

  <div style="position:fixed;top:0;left:0;right:0;z-index:200">
    <dc-import name="HeaderV2" active="home" hint-size="100%,94px"></dc-import>
  </div>

  <sc-if value="{{{{ isDesktop }}}}" hint-placeholder-val="{{{{ true }}}}">
{''.join(D)}
  </sc-if>

  <sc-if value="{{{{ isMobile }}}}">
{''.join(M)}
  </sc-if>

  <dc-import name="FooterV2" hint-size="100%,592px"></dc-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props="{{}}">
{script}
</script>
'''
html = head + body + tail_noscript
open(SITE + 'index.html', 'w').write(html)
open(SITE + 'Home.html', 'w').write(html)
print('ok', len(html))
