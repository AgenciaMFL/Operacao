import sys
sys.path.insert(0, '/tmp/claude-0/-home-user-Operacao/fbca03c4-7417-5cc6-bb7f-c3884c6dd20f/scratchpad/hv2')
from lib import *

P = 'assets/sobre-v2/'
H = 'assets/home-v2/'
MODELOS = 'Home.html#modelos'

PILARES = [
    ('ic-ear.svg', 11.72, 19.52, 'Foco para produzir', 'Menos distrações para trabalhar, estudar e aproveitar sua música.'),
    ('ic-mic.svg', 17.3, 22.72, 'Liberdade para se mover', 'Áudio que acompanha o treino e diferentes momentos do dia.'),
    ('ic-headset.svg', 23.8, 19.84, 'Proximidade para cuidar', 'Suporte nacional e uma relação que continua depois da compra.'),
]
FUND = [
    ('FC', 'Filipe Cardoso', 'COFUNDADOR', 'Engenheiro e empreendedor no mercado de tecnologia e marketplaces. Lidera produto, fornecedores e estratégia comercial, do conceito à experiência de quem usa.', 'Produto, tecnologia e estratégia'),
    ('FM', 'Fernanda Micchi', 'COFUNDADORA', 'Especialista em RH, saúde emocional e desenvolvimento humano. Conecta tecnologia com foco, presença e bem-estar.', 'Pessoas, foco e bem-estar'),
]

def pilar(f, w, h, t, d, mobile=False):
    pad = '20px' if mobile else '24px'
    return f'''<div style="box-sizing:border-box;{'' if mobile else 'width:424.66px;height:190px;'}padding:{pad};border-radius:22px;background:#fff;border:1px solid #EAD8FF;display:flex;flex-direction:column;justify-content:center;gap:12px">
          <span style="width:26px;height:26px;display:flex;align-items:center;justify-content:center"><img src="{P}{f}" alt="" width="{w:.0f}" height="{h:.0f}" style="width:{w}px;height:{h}px"></span>
          <p class="hub" style="margin:0;font-weight:700;font-size:25px;line-height:28.75px;color:#09010F">{t}</p>
          <p class="pop" style="margin:0;font-size:14px;line-height:22.4px;color:#6E6678">{d}</p></div>'''

def fund(ini, n, c, bio, area, mobile=False):
    return f'''<div style="box-sizing:border-box;{'' if mobile else 'width:649px;height:280px;'}padding:{'22px' if mobile else '28px'};border-radius:24px;background:#F2EDFA;display:flex;flex-direction:column;gap:18px">
          <div style="display:flex;align-items:center;gap:20px">
            <div style="flex:0 0 auto;width:64px;height:64px;border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center"><span class="hub" style="font-weight:700;font-size:25px;line-height:30px;color:#7D47B8">{ini}</span></div>
            <div><p class="hub" style="margin:0;font-weight:700;font-size:32px;line-height:35.2px;color:#09010F">{n}</p><p class="pop" style="margin:5px 0 0;font-weight:600;font-size:12px;line-height:18px;color:#7D47B8">{c}</p></div>
          </div>
          <p class="pop" style="margin:0;{'' if mobile else 'height:75px;'}font-size:16px;line-height:25px;color:#594F66">{bio}</p>
          <div style="display:flex;align-items:center;gap:8px"><img src="{P}dot.svg" alt="" width="6" height="6" style="width:6px;height:6px"><p class="pop" style="margin:0;font-weight:500;font-size:12px;line-height:18px;color:#7D47B8">{area}</p></div>
        </div>'''

def card_f5():
    return f'''<div style="position:relative;width:534.53px;height:523px;border-radius:23px;background:#F2EDFA;overflow:hidden">
          <div class="ab" style="left:-228.97px;top:-9.88px;width:763.75px;height:600.42px;border-radius:16.8px;overflow:hidden"><img class="ab" src="{P}card-f5.webp" alt="Meeky F5 ANC Pro" width="1195" height="625" loading="lazy" style="left:-34.31%;top:-4.05%;width:156.43%;height:104.02%"></div>
          <div class="ab" style="left:2.41px;top:328px;width:559px;height:236px;background:linear-gradient(180deg,rgba(24,18,46,0),#18122E)"></div>
          <div class="ab" style="left:2.41px;top:328px;width:559px;height:236px;background:linear-gradient(180deg,rgba(24,18,46,0),#18122E)"></div>
          <p class="ab sf" style="left:0;right:0;top:372px;margin:0;text-align:center;font-weight:700;font-size:50.096px;letter-spacing:-1.0019px;line-height:50px;color:#fff;text-transform:uppercase">F5 ANC Pro</p>
          <div class="ab" style="left:159.27px;top:439.45px">{btn_g("Comprar o F5 ANC Pro", BUY_F, "f", 216, 47.25, "gap:7.3px;box-shadow:0 1.929px 0 #470E6D", 13)}</div>
        </div>'''

def card_motion():
    return f'''<div style="position:relative;width:534.53px;height:523px;border-radius:23px;background:#F2EDFA;overflow:hidden">
          <div class="ab" style="left:-12.35px;top:-40.36px;width:546.89px;height:591.36px;overflow:hidden"><img class="ab" src="{P}card-motion.webp" alt="Meeky Motion 1" width="576" height="591" loading="lazy" style="left:.03%;top:0;width:105.34%;height:99.95%"></div>
          {''.join('<div class="ab" style="left:-11.88px;top:338px;width:559px;height:236px;background:linear-gradient(180deg,rgba(24,18,46,0),#18122E)"></div>' for _ in range(4))}
          <p class="ab sf" style="left:0;right:0;top:372px;margin:0;text-align:center;font-weight:700;font-size:63.663px;letter-spacing:-1.2733px;line-height:50px;color:#fff">Motion 1</p>
          <div class="ab" style="left:159.27px;top:439.45px">{btn_g("Comprar o motion 1", BUY_M, "m", 216, 47.25, "gap:7.3px;box-shadow:0 1.929px 0 #470E6D", 13)}</div>
        </div>'''

def cta_desk():
    return f'''
  <!-- O mundo no seu volume (Figma 4172:1025) -->
  <section style="background:#F9F0FF;overflow:hidden">
    <div class="hv" style="height:581px;zoom:{{{{ k }}}}">
      <p class="ab hub" style="left:321.96px;top:137px;width:678.077px;height:215px;margin:0;font-weight:700;font-size:119.046px;line-height:.82;color:#441463;text-align:center">O mundo no<br>seu volume</p>
      <div class="ab" style="left:169px;top:-310px;width:984px;height:1038px;overflow:hidden;pointer-events:none"><img src="{H}cta-headphone.webp" alt="" width="984" height="1476" loading="lazy" style="width:100%;height:142.26%"></div>
      <div class="ab" style="left:511px;top:366px"><a href="{MODELOS}" class="btn-g" style="width:299px;height:63.873px;font-size:16px;box-shadow:0 1.851px 0 #470E6D">Conhecer os modelos</a></div>
      <div class="ab flt" style="left:40px;top:83px;width:179px;height:177px;border-radius:19px;overflow:hidden;animation-delay:-0s"><img class="ab" src="{H}cta-thumb-boxer.webp" alt="" width="179" height="225" loading="lazy" style="left:0;top:-.15%;width:100%;height:126.98%"></div>
      <div class="ab flt" style="left:1120px;top:381px;width:175px;height:161px;border-radius:22px;overflow:hidden;animation-delay:-2.4s"><img class="ab" src="{H}cta-thumb-f5.webp" alt="" width="230" height="290" loading="lazy" style="left:-15.74%;top:-69.06%;width:131.48%;height:180.24%"></div>
      <div class="ab flt" style="left:1040px;top:66px;width:159px;height:142px;border-radius:16px;overflow:hidden;animation-delay:-1.3s"><img class="ab" src="{H}cta-thumb-motion.webp" alt="" width="251" height="334" loading="lazy" style="left:-28.74%;top:-37.1%;width:158.02%;height:235.37%"></div>
    </div>
  </section>'''

# ---------- COMPUTADOR ----------
D = f'''
  <!-- Hero Sobre (Figma 4157:195) -->
  <section style="position:relative;overflow:hidden;background:linear-gradient(214.4deg,#4A3169 8.95%,#B987F8 88.12%)">
    <div class="hv" style="height:838px;zoom:{{{{ k }}}}">
      <img class="ab" src="{P}hero-eq.svg" alt="" width="1634" height="439" style="left:-168px;top:-154px;width:1634.41px;height:439px;mix-blend-mode:plus-lighter">
      <img class="ab" src="{P}hero-woman.webp" alt="Mulher sorrindo ouvindo música com o Meeky F5 ANC Pro" width="1036" height="1107" style="left:446px;top:-175px;width:1035.4px;height:1107px">
      <h1 class="ab hub grad-txt" style="left:0;top:295px;width:578px;height:123.49px;margin:0;display:flex;align-items:center;font-weight:700;font-size:67.836px;letter-spacing:-2.0351px;line-height:.94;background-image:linear-gradient(90deg,#FFFFFF 50%,#F4E2FF 100%);animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .15s both">Tecnologia brasileira<br>para foco e performance.</h1>
      <p class="ab pop" style="left:0;top:444px;width:535px;height:99.5px;margin:0;display:flex;align-items:center;font-size:24.884px;letter-spacing:-.4977px;line-height:1.27;color:#fff;animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .3s both">Foco para produzir. Liberdade para se mover. Do F5 ANC Pro ao Motion 1, a Meeky cria novas formas de ouvir o seu mundo.</p>
    </div>
  </section>

  <!-- Nossa origem (Figma 4167:73) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:618px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:316px;top:80px;width:690px;height:408px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;text-align:center" data-reveal="">
        <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:18px;color:#7D47B8">A NOSSA HISTÓRIA</p>
        <h2 class="hub" style="margin:0;font-weight:700;font-size:56px;line-height:60.48px;color:#09010F">Do problema real<br>ao seu dia a dia.</h2>
        <p class="pop" style="margin:0;width:659px;font-size:18px;line-height:30.6px;color:#6E6678">A Meeky nasceu de uma dificuldade que Filipe conhecia de perto: manter o foco e o equilíbrio em uma rotina cheia de ruído e distrações.</p>
        <p class="pop" style="margin:0;width:670px;font-size:18px;line-height:28.9px;color:#6E6678">O contato com fábricas e tendências de áudio na China se encontrou com uma necessidade do público brasileiro. Dessa conexão nasceu uma marca que aproxima tecnologia, presença e bem-estar.</p>
      </div>
      <div class="ab flt" style="left:69px;top:66px;width:208.88px;height:207.29px;display:flex;align-items:center;justify-content:center;box-shadow:none"><div style="flex:none;width:179px;height:177px;border-radius:19px;overflow:hidden;transform:rotate(10.75deg);box-shadow:0 22px 40px -22px rgba(54,19,75,.45)"><img src="{P}t-boxer.webp" alt="" width="179" height="225" loading="lazy" style="display:block;width:100%;height:126.98%;margin-top:-.27px"></div></div>
      <div class="ab flt" style="left:1028px;top:61px;width:195.14px;height:184.24px;display:flex;align-items:center;justify-content:center;animation-delay:-1.3s;box-shadow:none"><div style="position:relative;flex:none;width:159px;height:142px;border-radius:16px;overflow:hidden;transform:rotate(-18.03deg);box-shadow:0 22px 40px -22px rgba(54,19,75,.45)"><img class="ab" src="{P}t-motion.webp" alt="" width="251" height="334" loading="lazy" style="left:-28.74%;top:-37.1%;width:158.02%;height:235.37%"></div></div>
      <img class="ab flt" src="{P}t-9.webp" alt="" width="175" height="161" loading="lazy" style="left:77px;top:414px;width:175px;height:161px;animation-delay:-3.1s;box-shadow:none;filter:drop-shadow(0 22px 20px rgba(54,19,75,.25))">
      <div class="ab flt" style="left:1093px;top:421px;width:175px;height:161px;border-radius:22px;overflow:hidden;animation-delay:-2.4s"><img class="ab" src="{P}t-f5.webp" alt="" width="230" height="290" loading="lazy" style="left:-15.74%;top:-69.06%;width:131.48%;height:180.24%"></div>
    </div>
  </section>

  <!-- O que nos move (Figma 4167:83) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:371px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:35px;width:1322px" data-reveal="">
        <p class="pop" style="margin:0;text-align:center;font-weight:600;font-size:12px;line-height:18px;color:#7D47B8">O QUE NOS MOVE</p>
        <h2 class="hub" style="margin:26px 0 0;text-align:center;font-weight:700;font-size:44px;line-height:48.4px;color:#09010F">Tecnologia a serviço da sua rotina.</h2>
        <div style="margin-top:26px;display:flex;gap:24px">{''.join(pilar(*p) for p in PILARES)}</div>
      </div>
    </div>
  </section>

  <!-- Dois jeitos de escutar (Figma 4167:107) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:812px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:65px;width:1322px;text-align:center" data-reveal="">
        <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:18px;color:#7D47B8">ENCONTRE O SEU JEITO DE OUVIR</p>
        <h2 class="hub" style="margin:17px 0 0;font-weight:700;font-size:56px;line-height:60.48px;color:#09010F">Dois fones. A mesma ideia de liberdade.</h2>
      </div>
      <div class="ab" style="left:116.59px;top:206px;display:flex;gap:19.77px" data-reveal=".1">{card_f5()}{card_motion()}</div>
    </div>
  </section>

  <!-- Quem faz a Meeky (Figma 4167:136) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:542px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:60px;width:1322px" data-reveal="">
        <p class="pop" style="margin:0;text-align:center;font-weight:600;font-size:12px;line-height:18px;color:#7D47B8">PESSOAS POR TRÁS DO SOM</p>
        <h2 class="hub" style="margin:23px 0 0;text-align:center;font-weight:700;font-size:50px;line-height:55px;color:#09010F">Quem está por trás da Meeky.</h2>
        <div style="margin-top:23px;display:flex;gap:24px">{''.join(fund(*f) for f in FUND)}</div>
      </div>
    </div>
  </section>
{cta_desk()}
'''

# ---------- CELULAR ----------
M = f'''
  <!-- Hero Sobre celular (Figma 4172:1196) -->
  <section style="position:relative;overflow:hidden;background:linear-gradient(240.97deg,#4A3169 8.95%,#B987F8 88.12%)">
    <div style="position:relative;height:118vw;max-height:600px;overflow:hidden">
      <div style="position:absolute;left:0;right:0;bottom:0;height:68%;background:linear-gradient(180deg,rgba(85,57,119,0),#553977)"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:68%;background:linear-gradient(180deg,rgba(85,57,119,0),#553977)"></div>
      <img src="{P}m-eq.svg" alt="" width="946" height="254" style="position:absolute;left:-17%;bottom:-2%;width:124%;height:auto;transform:scaleY(-1) rotate(180deg);mix-blend-mode:plus-lighter">
      <img src="{P}hero-woman.webp" alt="Mulher sorrindo ouvindo música com o Meeky F5 ANC Pro" width="480" height="513" style="position:absolute;left:50%;bottom:0;width:126vw;max-width:640px;height:auto;transform:translateX(-50%)">
    </div>
    <div style="position:relative;background:#553977;padding:4px 20px 44px;text-align:center">
      <h1 class="hub grad-txt" style="margin:0;font-weight:700;font-size:44px;letter-spacing:-1.3px;line-height:.98;background-image:linear-gradient(90deg,#FFFFFF 50%,#F4E2FF 100%)">Tecnologia brasileira para foco e performance.</h1>
      <p class="pop" style="margin:14px auto 0;max-width:380px;font-size:16px;letter-spacing:-.3px;line-height:1.35;color:#fff">Foco para produzir. Liberdade para se mover. Do F5 ANC Pro ao Motion 1, a Meeky cria novas formas de ouvir o seu mundo.</p>
    </div>
  </section>

  <section style="position:relative;background:#FFFDF9;overflow:hidden;padding:44px 20px 48px;text-align:center">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px">
      <div class="flt" style="width:96px;height:95px;border-radius:14px;overflow:hidden;transform:rotate(10.75deg)"><img src="{P}t-boxer.webp" alt="" width="96" height="122" loading="lazy" style="width:100%;height:126.98%"></div>
      <div class="flt" style="position:relative;width:96px;height:86px;border-radius:12px;overflow:hidden;animation-delay:-1.3s"><img src="{P}t-motion.webp" alt="" width="152" height="202" loading="lazy" style="position:absolute;left:-28.74%;top:-37.1%;width:158.02%;height:235.37%"></div>
    </div>
    <p class="pop" style="margin:0;font-weight:600;font-size:11.5px;color:#7D47B8">A NOSSA HISTÓRIA</p>
    <h2 class="m-h hub" style="margin-top:12px;font-weight:700;font-size:40px">Do problema real<br>ao seu dia a dia.</h2>
    <p class="m-p" style="color:#6E6678;line-height:1.6">A Meeky nasceu de uma dificuldade que Filipe conhecia de perto: manter o foco e o equilíbrio em uma rotina cheia de ruído e distrações.</p>
    <p class="m-p" style="color:#6E6678;line-height:1.6">O contato com fábricas e tendências de áudio na China se encontrou com uma necessidade do público brasileiro. Dessa conexão nasceu uma marca que aproxima tecnologia, presença e bem-estar.</p>
  </section>

  <section style="background:#FFFDF9;padding:8px 20px 44px">
    <p class="pop" style="margin:0;text-align:center;font-weight:600;font-size:11.5px;color:#7D47B8">O QUE NOS MOVE</p>
    <h2 class="m-h hub" style="margin-top:12px;text-align:center;font-weight:700;font-size:36px">Tecnologia a serviço da sua rotina.</h2>
    <div style="margin-top:22px;display:flex;flex-direction:column;gap:12px">{''.join(pilar(*p, mobile=True) for p in PILARES)}</div>
  </section>

  <section style="background:#FFFDF9;padding:8px 20px 44px">
    <p class="pop" style="margin:0;text-align:center;font-weight:600;font-size:11.5px;color:#7D47B8">ENCONTRE O SEU JEITO DE OUVIR</p>
    <h2 class="m-h hub" style="margin-top:12px;text-align:center;font-weight:700;font-size:38px">Dois fones. A mesma ideia de liberdade.</h2>
    <div style="margin-top:22px;width:534.53px;display:flex;flex-direction:column;gap:14px;zoom:{{{{ kmCard2 }}}}">{card_f5()}{card_motion()}</div>
  </section>

  <section style="background:#FFFDF9;padding:8px 20px 48px">
    <p class="pop" style="margin:0;text-align:center;font-weight:600;font-size:11.5px;color:#7D47B8">PESSOAS POR TRÁS DO SOM</p>
    <h2 class="m-h hub" style="margin-top:12px;text-align:center;font-weight:700;font-size:38px">Quem está por trás da Meeky.</h2>
    <div style="margin-top:22px;display:flex;flex-direction:column;gap:14px">{''.join(fund(*f, mobile=True) for f in FUND)}</div>
  </section>

  <section style="position:relative;background:#F9F0FF;overflow:hidden;height:390px">
    <img src="{H}cta-headphone.webp" alt="" width="984" height="1476" loading="lazy" style="position:absolute;left:50%;top:-56px;width:430px;height:auto;transform:translateX(-50%);pointer-events:none">
    <div style="position:relative;padding-top:132px;text-align:center">
      <p class="hub" style="margin:0;font-weight:700;font-size:54px;line-height:.82;color:#441463">O mundo no<br>seu volume</p>
      <a href="{MODELOS}" class="btn-g" style="margin-top:28px;height:54px;padding:0 30px;font-size:14.5px;box-shadow:0 1.851px 0 #470E6D">Conhecer os modelos</a>
    </div>
    <div class="flt" style="position:absolute;left:14px;top:30px;width:84px;height:84px;border-radius:14px;overflow:hidden"><img src="{H}cta-thumb-boxer.webp" alt="" width="84" height="105" loading="lazy" style="width:100%;height:126.98%"></div>
    <div class="flt" style="position:absolute;right:16px;top:22px;width:76px;height:68px;border-radius:12px;overflow:hidden;animation-delay:-1.3s"><img src="{H}cta-thumb-motion.webp" alt="" width="120" height="160" loading="lazy" style="position:absolute;left:-28.74%;top:-37.1%;width:158.02%;height:235.37%"></div>
    <div class="flt" style="position:absolute;right:14px;bottom:26px;width:84px;height:77px;border-radius:14px;overflow:hidden;animation-delay:-2.4s"><img src="{H}cta-thumb-f5.webp" alt="" width="110" height="139" loading="lazy" style="position:absolute;left:-15.74%;top:-69.06%;width:131.48%;height:180.24%"></div>
  </section>
'''

PAGE_VALS = "(k, m, w) => ({ kmCard2: (Math.max(280, w - 40) / 534.53).toFixed(4) })"
page('Sobre-antiga.html', ['Sobre.html'], 'sobre', D, M, '', PAGE_VALS)
print('ok')
