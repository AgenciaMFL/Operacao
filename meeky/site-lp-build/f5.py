import sys
sys.path.insert(0, '/tmp/claude-0/-home-user-Operacao/fbca03c4-7417-5cc6-bb7f-c3884c6dd20f/scratchpad/hv2')
from lib import *

P = 'assets/f5-v2/'
H = 'assets/home-v2/'

# ---------- peças reaproveitadas ----------
def pattern(left, tops, fs, ls):
    # "F5 ANC PRO" repetido no fundo (Figma: Poppins Bold, #D5B8F7, 9% de opacidade, overlay)
    return ''.join(f'<p class="ab pop" style="left:{left}px;top:{t:.2f}px;margin:0;transform:translateY(-50%);font-weight:700;font-size:{fs}px;letter-spacing:{ls}px;line-height:1;color:#D5B8F7;opacity:.09;mix-blend-mode:overlay;white-space:nowrap">F5 ANC PRO</p>' for t in tops)

def price(top, alpha):
    # cartão do preço: 6x R$ 49,50 / ou à vista de R$ 297
    return f'''<div class="ab" style="left:0;top:{top}px;width:434px;height:148px;border-radius:10px;background:linear-gradient(108.8deg,rgba(255,253,249,{alpha}) .8%,rgba(255,251,242,{alpha}) 102.9%)"></div>
        <p class="ab pop" style="left:30.44px;top:{top + 35.9:.2f}px;margin:0;width:61.262px;height:41.976px;display:flex;align-items:center;font-weight:700;font-size:47.243px;letter-spacing:-.9449px;line-height:1.2;color:#31023C;mix-blend-mode:hard-light">6x</p>
        <p class="ab pop" style="left:89.44px;top:{top + 22:.2f}px;margin:0;width:313.119px;height:69.792px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:78.549px;letter-spacing:-5.4984px;line-height:1.2;color:#31023C;mix-blend-mode:hard-light;white-space:nowrap">R$ 49,50</p>
        <p class="ab pop" style="left:21px;top:{top + 102.8:.2f}px;margin:0;width:391px;height:20px;display:flex;align-items:center;justify-content:center;font-size:19px;letter-spacing:-.76px;line-height:1.2;color:#31023C;mix-blend-mode:hard-light;white-space:nowrap">ou à vista de&nbsp;<b style="font-weight:700">R$ 297</b>&nbsp;sem juros · frete grátis</p>'''

def buy(left, top):
    return f'<div class="ab" style="left:{left}px;top:{top}px">{btn_g("Comprar agora", BUY_F, "", 262, 50.17, "box-shadow:0 2.23px 0 #470E6D", 16.7)}</div>'

def spec(v, l, w=318):
    return f'<div style="width:{w}px;height:75px;box-sizing:border-box;padding:0 12px 0 18px;border-radius:14px;background:#F2EDFA;display:flex;flex-direction:column;justify-content:center;gap:3px"><p class="hub" style="margin:0;font-weight:700;font-size:24px;line-height:26.4px;color:#7D47B8">{v}</p><p class="pop" style="margin:0;font-weight:500;font-size:14px;line-height:15.6px;color:#6E6678">{l}</p></div>'

SPECS = [('70h', 'Bateria'), ('5.4', 'Bluetooth multiponto'), ('20 dB', 'ANC híbrido'), ('12 meses', 'Garantia no Brasil'), ('40 mm', 'Driver Hi-Fi · AAC e SBC'), ('Anatel · SIG Bluetooth', 'Resistência IPX4')]

BENEF = [
    ('#FFFFFF', '#FAE4FF', '#F2EDFA', 'ic-wave.svg', 23.53, 27.53, 'Foco no que importa.', 'Reduza as distrações ao redor com ANC de até 20 dB e dê mais espaço ao trabalho, aos estudos e às suas ideias.', 'ANC HÍBRIDO · ATÉ 20 dB'),
    ('#F2EDFA', 'transparent', '#E9DAFF', 'ic-bolt.svg', 19.53, 28.87, 'Mais ritmo para o treino.', 'Resistência IPX4 contra suor e respingos para acompanhar o movimento. Sua playlist segue com você.', 'RESISTÊNCIA IPX4'),
    ('#FEFBFF', '#FAE4FF', '#F2EDFA', 'ic-headset.svg', 26.2, 27.53, 'Conforto para ficar mais.', 'Almofadas over-ear e ajuste leve para ouvir sua música, participar de reuniões ou relaxar no fim do dia.', 'ALMOFADAS OVER-EAR'),
]

DEPO = [
    ('Uso no home office diariamente. O cancelamento de ruído mudou minha capacidade de concentração.', 'Lucas M.', 'Desenvolvedor Full-Stack'),
    ('O conforto é surreal. Uso 6+ horas por dia e nunca senti desconforto.', 'Ana C.', 'Designer UI/UX'),
    ('No treino, faz toda diferença. Consigo me isolar do barulho da academia.', 'Pedro R.', 'Personal Trainer'),
    ('Peguei três voos no mês passado e não precisei carregar uma vez. A bateria simplesmente não acaba.', 'Marina S.', 'Consultora comercial'),
    ('Estudo em casa com duas crianças. É a primeira vez que consigo ler um capítulo inteiro sem parar.', 'Rafael T.', 'Estudante de medicina'),
    ('Troco do notebook para o celular sem mexer em nada. O multiponto salva minha rotina de reuniões.', 'Camila F.', 'Gerente de projetos'),
    ('Comprei dez para o time. Chegaram com nota fiscal e o suporte respondeu no mesmo dia.', 'Diego A.', 'Head de operações'),
    ('O som surpreende pelo preço. Uso para mixar rascunho e confio no que escuto.', 'Bruna L.', 'Produtora musical'),
]

def depo_track(w, h, gap, fs):
    one = ''.join(f'''<div style="flex:0 0 auto;width:{w}px;height:{h}px;margin-right:{gap}px;box-sizing:border-box;padding:28px 28px 26px;border-radius:22px;background:#fff;border:1px solid #E5DEEB;display:flex;flex-direction:column;justify-content:space-between">
          <p class="pop" style="margin:0;font-size:{fs}px;line-height:{fs * 1.65:.1f}px;letter-spacing:-.34px;color:#09010F">“{q}”</p>
          <div><p class="pop" style="margin:0;font-weight:600;font-size:15px;line-height:23px;color:#09010F">{n}</p><p class="pop" style="margin:2px 0 0;font-size:12px;line-height:20px;color:#6E6678">{r}</p></div>
        </div>''' for q, n, r in DEPO)
    return f'<div class="depo-track">{one}{one}</div>'

EXTRA_HEAD = '''<style>
  .depo-track { display:flex; width:max-content; animation:meeky-marquee 70s linear infinite; }
  .depo-track:hover { animation-play-state:paused; }
  .bnf { display:flex; gap:22px; box-sizing:border-box; padding:24px 26px 22px; border-radius:24px; }
  .bnf .ic { flex:0 0 auto; width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; }
</style>'''

# ---------- COMPUTADOR ----------
D = f'''
  <!-- Hero F5 (Figma 4091:715) -->
  <section style="position:relative;overflow:hidden;background:linear-gradient(214.4deg,#4A3169 8.95%,#B987F8 88.12%)">
    <div class="hv" style="height:838px;zoom:{{{{ k }}}}">
      {pattern(527, [-3, 149, 301.85, 437.93, 590.78, 732], 152.395, -12.1916)}
      <div class="ab flt-p" style="left:541.23px;top:0;width:826.267px;height:791.162px;display:flex;align-items:center;justify-content:center">
        <img src="{P}hero-headphone.webp" alt="Headphone Meeky F5 ANC Pro" width="702" height="656" style="width:702.148px;height:656.132px;flex:none;transform:rotate(12.35deg)">
      </div>
      <h1 class="ab hub grad-txt" style="left:0;top:161px;width:max-content;height:84px;margin:0;display:flex;align-items:center;font-weight:700;font-size:79.102px;letter-spacing:-2.3731px;line-height:.94;background-image:linear-gradient(90deg,#FFFFFF 50%,#F4E2FF 100%);animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .15s both">F5 ANC Pro</h1>
      <p class="ab pop" style="left:0;top:260px;width:465px;height:110px;margin:0;display:flex;align-items:center;font-size:22px;letter-spacing:-.44px;line-height:1.27;color:#fff;animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .3s both"><span>Cancelamento de ruído ativo até 20dB, 70 horas de bateria e Bluetooth 5.4 multiponto, o headphone <b style="font-weight:600">que some do seu pescoço e aparece só quando você precisa dele.</b></span></p>
      {price(396, .85)}
      {buy(0, 578)}
    </div>
  </section>

  {marquee('{{ mqZoom }}')}

  <!-- Detalhes técnicos (Figma 4092:764) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:927px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:125px;width:556px;height:690px;border-radius:40px;background:#F2EDFA;overflow:hidden" data-reveal="">
        <img class="ab" src="{P}detalhes-woman.webp" alt="Mulher usando o Meeky F5 ANC Pro" width="672" height="840" loading="lazy" style="left:0;top:-75px;width:672px;height:840px;object-fit:cover">
      </div>
      <div class="ab" style="left:619px;top:174px;width:690px" data-reveal=".1">
        <p class="pop" style="margin:0;font-weight:600;font-size:13px;line-height:18.2px;color:#7D47B8">ESPECIFICAÇÕES · F5 ANC PRO</p>
        <h2 class="hub" style="margin:18px 0 0;font-weight:700;font-size:55px;line-height:59.4px;color:#09010F">Conheça todos os <span class="roxo">detalhes técnicos</span> do F5 ANC Pro.</h2>
        <p class="pop" style="margin:18px 0 0;width:660px;font-size:19px;line-height:1.34;color:#6E6678">Mais tempo na sua playlist, menos pausas na rotina. Som Hi-Fi, conexão multiponto e <b style="font-weight:700">bateria para acompanhar o seu ritmo.</b></p>
      </div>
      <div class="ab" style="left:619px;top:425px;display:grid;grid-template-columns:318px 318px;gap:14px 14px">{''.join(spec(v, l) for v, l in SPECS)}</div>
      <div class="ab" style="left:619px;top:716px">{btn_g("Comprar agora", BUY_F, "", 262, 50.17, "box-shadow:0 2.23px 0 #470E6D", 16.7)}</div>
    </div>
  </section>

  <!-- Pensado nos detalhes (Figma 4101:3) + fotos correndo atrás -->
  <section style="position:relative;background:#FFFDF9;overflow:hidden">
    <div style="position:absolute;left:0;right:0;top:0;zoom:{{{{ k }}}}">
      <div style="position:absolute;left:0;right:0;top:210px;height:391px;overflow:hidden">{gal_track(295, 391, 27, 30)}</div>
    </div>
    <div class="hv" style="height:879px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:49px;width:1322px;height:760px;border-radius:32px;background:#241333;overflow:hidden" data-reveal="">
        <div class="ab" style="left:60px;top:66px;width:441px;height:628px;border-radius:48.2px;overflow:hidden"><img class="ab" src="{P}constr-hands.webp" alt="Mão segurando o Meeky F5 ANC Pro" width="623" height="779" loading="lazy" style="left:-19.64%;top:-16.3%;width:141.32%;height:124.05%"></div>
        <img class="ab" src="{P}outline-headphone.webp" alt="" width="394" height="344" loading="lazy" style="left:928px;top:416px;width:394px;height:344px">
        <div class="ab" style="left:532px;top:84px;width:746px">
          <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:18px;color:#CCA3F5">DESIGN QUE ACOMPANHA VOCÊ</p>
          <h2 class="hub" style="margin:16px 0 0;font-weight:700;font-size:53px;line-height:58.3px;color:#fff">Pensado nos detalhes.<br>Pronto para sua rotina.</h2>
          <p class="pop" style="margin:18px 0 0;font-size:17px;line-height:28.05px;color:#D1C4E0">Acabamento discreto, conexão com fio e recarga rápida.<br>Tudo para o seu som acompanhar o dia.</p>
          <div style="margin-top:30px;display:flex;gap:16px">
            <div style="width:365px;height:119px;box-sizing:border-box;padding:18px 18px 0 22px;border-radius:18px;background:#342144">
              <div style="display:flex;align-items:center;gap:12px;height:30px"><span style="width:24px;height:24px;display:flex;align-items:center;justify-content:center"><img src="{P}ic-layers.svg" alt="" width="20" height="20" style="width:19.6px;height:19.6px"></span><p class="hub" style="margin:0;font-weight:700;font-size:21px;line-height:26.25px;color:#fff">Acabamento matte</p></div>
              <p class="pop" style="margin:9px 0 0;font-size:15px;line-height:1.29;color:#D1C4E0">Visual discreto para qualquer<br>momento da sua rotina.</p>
            </div>
            <div style="width:365px;height:119px;box-sizing:border-box;padding:18px 18px 0 22px;border-radius:18px;background:#342144">
              <div style="display:flex;align-items:center;gap:12px;height:30px"><span style="width:24px;height:24px;display:flex;align-items:center;justify-content:center"><img src="{P}ic-plug.svg" alt="" width="12" height="20" style="width:11.6px;height:19.6px"></span><p class="hub" style="margin:0;font-weight:700;font-size:21px;line-height:26.25px;color:#fff">Continue pelo P2</p></div>
              <p class="pop" style="margin:9px 0 0;font-size:15px;line-height:1.29;color:#D1C4E0">Mesmo sem bateria, conecte<br>o cabo e siga ouvindo.</p>
            </div>
          </div>
          <div style="position:relative;margin-top:20px;width:365px;height:154px;border-radius:18px;background:#E8D9FA;overflow:hidden">
            <p class="ab pop" style="left:24px;top:16px;margin:0;font-weight:600;font-size:12.571px;line-height:17.6px;color:#241333">RECARGA RÁPIDA USB-C</p>
            <p class="ab hub" style="left:24px;top:43px;margin:0;font-weight:700;font-size:52.571px;line-height:56.777px;color:#241333">10 min</p>
            <p class="ab pop" style="left:24px;top:103px;margin:0;font-weight:500;font-size:16px;line-height:24px;color:#6E6678">de carga</p>
            <img class="ab" src="{P}usbc.webp" alt="Cabo USB-C carregando" width="258" height="150" loading="lazy" style="left:129px;top:4px;width:258px;height:150px;object-fit:contain">
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Seu ritmo muda (Figma 4101:24) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:1012px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:79.5px;width:714px" data-reveal="">
        <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:18px;color:#7D47B8">DO PRIMEIRO PLAY AO ÚLTIMO COMPROMISSO</p>
        <h2 class="hub" style="margin:16px 0 0;font-weight:700;font-size:58px;line-height:62.64px;color:#09010F">Seu ritmo muda.<br><span class="roxo">Seu fone acompanha.</span></h2>
      </div>
      <p class="ab pop" style="left:871px;top:177px;width:457px;margin:0;font-size:18px;line-height:1.2;color:#6E6678">Mais concentração no trabalho, energia no treino e conforto nos seus momentos de pausa.</p>
      <img class="ab" src="{P}boxer.webp" alt="Mulher treinando com o Meeky F5 ANC Pro" width="500" height="620" loading="lazy" style="left:0;top:311px;width:500px;height:620px;border-radius:28px;object-fit:cover" data-reveal="">
      <div class="ab" style="left:558px;top:349.5px;width:764px;display:flex;flex-direction:column;gap:18px" data-reveal=".1">
        {''.join(f"""<div class="bnf" style="height:169px;background:{bg};border:1px solid {bd}">
          <div class="ic" style="background:{ib}"><img src="{P}{ic}" alt="" width="{iw:.0f}" height="{ih:.0f}" style="width:{iw * .85:.2f}px;height:{ih * .85:.2f}px"></div>
          <div style="width:642px;display:flex;flex-direction:column;gap:8px">
            <p class="hub" style="margin:0;font-weight:700;font-size:29px;line-height:34.8px;color:#09010F">{t}</p>
            <p class="pop" style="margin:0;width:600px;font-size:16px;line-height:23px;color:#6E6678">{d}</p>
            <p class="pop" style="margin:0;font-weight:600;font-size:10px;line-height:15px;color:#7D47B8">{tag}</p>
          </div>
        </div>""" for bg, bd, ib, ic, iw, ih, t, d, tag in BENEF)}
      </div>
    </div>
  </section>

  <!-- Depoimentos (Figma 4108:11) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:258px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:266px;top:80px;width:790px;text-align:center" data-reveal="">
        <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:16.8px;color:#7D47B8">EXPERIÊNCIAS DE QUEM USA</p>
        <h2 class="hub" style="margin:14px 0 0;font-weight:700;font-size:54px;line-height:59.4px;color:#09010F">O som muda a rotina.<br>Quem usa, conta.</h2>
      </div>
    </div>
    <div style="zoom:{{{{ k }}}};height:375px;overflow:hidden">{depo_track(420, 250, 24, 17)}</div>
  </section>

  <!-- Chamada final (Figma 4106:1147) -->
  <section style="background:#F9F0FF;overflow:hidden">
    <div class="hv" style="height:581px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:484px;top:-474px;width:1016.088px;height:1131.08px;display:flex;align-items:center;justify-content:center;pointer-events:none">
        <div style="flex:none;width:690px;height:926.678px;overflow:hidden;transform:rotate(24.91deg)"><img src="{H}cta-headphone.webp" alt="" width="690" height="1035" loading="lazy" style="width:100%;height:111.76%"></div>
      </div>
      <img class="ab" src="{P}cta-eq.svg" alt="" width="1634" height="439" style="left:448px;top:-57px;width:1634.41px;height:439px;transform:scaleY(-1)">
      <h2 class="ab hub" style="left:7px;top:84px;width:469px;height:84px;margin:0;display:flex;align-items:center;font-weight:700;font-size:79.102px;letter-spacing:-2.3731px;line-height:.94;color:#441463">F5 ANC Pro</h2>
      <p class="ab pop" style="left:7px;top:182px;width:670px;margin:0;font-size:18px;line-height:1.32;color:#4C3F5C">Menos distrações. Mais espaço para o que importa.<br>Leve o seu próximo play para outro nível.</p>
      {price(261, .78)}
      {buy(0, 448)}
    </div>
  </section>
'''

# ---------- CELULAR ----------
def m_price(hero=False):
    if hero:
        return f'''<div style="margin-top:14px;width:100%;max-width:380px;box-sizing:border-box;padding:9px 12px 11px;border-radius:10px;background:linear-gradient(108.8deg,rgba(255,253,249,.85),rgba(255,251,242,.85));text-align:center">
        <p class="pop" style="margin:0;display:flex;align-items:baseline;justify-content:center;gap:7px;color:#31023C;font-weight:700;white-space:nowrap"><span style="font-size:26px;letter-spacing:-.5px">6x</span><span style="font-size:42px;letter-spacing:-2.6px;line-height:1.1">R$ 49,50</span></p>
        <p class="pop" style="margin:1px 0 0;font-size:12.5px;letter-spacing:-.35px;color:#31023C">ou à vista de <b style="font-weight:700">R$ 297</b> sem juros · frete grátis</p>
      </div>'''
    return f'''<div style="margin-top:20px;width:100%;max-width:380px;box-sizing:border-box;padding:14px 14px 16px;border-radius:10px;background:linear-gradient(108.8deg,rgba(255,253,249,.85),rgba(255,251,242,.85));text-align:center">
        <p class="pop" style="margin:0;display:flex;align-items:baseline;justify-content:center;gap:8px;color:#31023C;font-weight:700;white-space:nowrap"><span style="font-size:32px;letter-spacing:-.6px">6x</span><span style="font-size:52px;letter-spacing:-3.6px;line-height:1.1">R$ 49,50</span></p>
        <p class="pop" style="margin:2px 0 0;font-size:14px;letter-spacing:-.4px;color:#31023C">ou à vista de <b style="font-weight:700">R$ 297</b> sem juros · frete grátis</p>
      </div>'''

def m_buy(extra='', hero=False):
    return f'<a href="{BUY_F}" class="btn-g" style="margin-top:{14 if hero else 22}px;width:100%;max-width:380px;height:{50 if hero else 54}px;font-size:15px;box-shadow:0 2.23px 0 #470E6D">Comprar agora</a>'

M = f'''
  <!-- Hero F5 celular (Figma 4172:1035) -->
  <section style="position:relative;overflow:hidden;background:#553977">
    <div style="position:relative;height:84vw;max-height:430px;overflow:hidden;background:linear-gradient(231.77deg,#4A3169 8.95%,#B987F8 88.12%)">
      {''.join(f'<p class="pop" style="position:absolute;left:50%;top:{t}vw;margin:0;transform:translate(-50%,-50%);font-weight:700;font-size:19.2vw;letter-spacing:-1.5vw;line-height:1;color:#D5B8F7;opacity:.09;mix-blend-mode:overlay;white-space:nowrap">F5 ANC PRO</p>' for t in [-5.8, 11.4, 30.7, 48, 67.2, 86.4, 103.6, 123.4])}
      <div style="position:absolute;left:0;right:0;bottom:0;height:61%;background:linear-gradient(180deg,rgba(85,57,119,0),#553977)"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:61%;background:linear-gradient(180deg,rgba(85,57,119,0),#553977)"></div>
      <div class="flt-p" style="position:absolute;left:50%;top:1vw;width:66vw;max-width:340px;margin-left:-33vw;aspect-ratio:313/300"><img src="{P}hero-headphone.webp" alt="Headphone Meeky F5 ANC Pro" width="266" height="249" style="position:absolute;left:7.5%;top:8.5%;width:85%;height:auto;transform:rotate(12.35deg)"></div>
    </div>
    <div style="position:relative;margin-top:-14vw;padding:0 20px 36px;display:flex;flex-direction:column;align-items:center;text-align:center">
      <h1 class="hub grad-txt" style="margin:0;font-weight:700;font-size:46px;letter-spacing:-1.4px;line-height:.94;background-image:linear-gradient(90deg,#FFFFFF 50%,#F4E2FF 100%)">F5 ANC Pro</h1>
      <p class="pop" style="margin:10px 0 0;max-width:380px;font-size:14.5px;letter-spacing:-.25px;line-height:1.32;color:#fff">Cancelamento de ruído ativo até 20dB, 70 horas de bateria e Bluetooth 5.4 multiponto, o headphone <b style="font-weight:600">que some do seu pescoço e aparece só quando você precisa dele.</b></p>
      {m_price(True)}
      {m_buy(hero=True)}
    </div>
  </section>

  {marquee('.58')}

  <section style="background:#FFFDF9;padding:44px 20px 52px">
    <div style="height:110vw;max-height:520px;border-radius:28px;background:#F2EDFA;overflow:hidden" data-reveal=""><img src="{P}detalhes-woman.webp" alt="Mulher usando o Meeky F5 ANC Pro" width="672" height="840" loading="lazy" class="cover" style="object-position:30% 20%"></div>
    <p class="pop" style="margin:28px 0 0;font-weight:600;font-size:12px;color:#7D47B8">ESPECIFICAÇÕES · F5 ANC PRO</p>
    <h2 class="m-h hub" style="margin-top:12px;font-weight:700">Conheça todos os <span class="roxo">detalhes técnicos</span> do F5 ANC Pro.</h2>
    <p class="m-p" style="color:#6E6678">Mais tempo na sua playlist, menos pausas na rotina. Som Hi-Fi, conexão multiponto e <b style="font-weight:700">bateria para acompanhar o seu ritmo.</b></p>
    <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px">{''.join(spec(v, l, 'auto').replace('width:autopx;', '').replace('font-size:24px', 'font-size:20px').replace('height:75px', 'min-height:70px').replace('padding:0 12px 0 18px', 'padding:10px 10px 10px 14px') for v, l in SPECS)}</div>
    {m_buy().replace('max-width:380px', 'max-width:none')}
  </section>

  <section style="background:#FFFDF9;padding:0 20px 28px">
    <div style="border-radius:28px;background:#241333;overflow:hidden;position:relative" data-reveal="">
      <div style="padding:30px 22px 0">
        <p class="pop" style="margin:0;font-weight:600;font-size:11.5px;color:#CCA3F5">DESIGN QUE ACOMPANHA VOCÊ</p>
        <h2 class="hub" style="margin:12px 0 0;font-weight:700;font-size:38px;line-height:1.05;color:#fff">Pensado nos detalhes.<br>Pronto para sua rotina.</h2>
        <p class="pop" style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#D1C4E0">Acabamento discreto, conexão com fio e recarga rápida. Tudo para o seu som acompanhar o dia.</p>
        <div style="margin-top:18px;display:flex;flex-direction:column;gap:10px">
          <div style="padding:16px 18px;border-radius:18px;background:#342144"><div style="display:flex;align-items:center;gap:10px"><img src="{P}ic-layers.svg" alt="" width="20" height="20"><p class="hub" style="margin:0;font-weight:700;font-size:20px;color:#fff">Acabamento matte</p></div><p class="pop" style="margin:6px 0 0;font-size:14px;line-height:1.35;color:#D1C4E0">Visual discreto para qualquer momento da sua rotina.</p></div>
          <div style="padding:16px 18px;border-radius:18px;background:#342144"><div style="display:flex;align-items:center;gap:10px"><img src="{P}ic-plug.svg" alt="" width="12" height="20"><p class="hub" style="margin:0;font-weight:700;font-size:20px;color:#fff">Continue pelo P2</p></div><p class="pop" style="margin:6px 0 0;font-size:14px;line-height:1.35;color:#D1C4E0">Mesmo sem bateria, conecte o cabo e siga ouvindo.</p></div>
          <div style="position:relative;height:140px;border-radius:18px;background:#E8D9FA;overflow:hidden">
            <p class="pop" style="position:absolute;left:18px;top:14px;margin:0;font-weight:600;font-size:12px;color:#241333">RECARGA RÁPIDA USB-C</p>
            <p class="hub" style="position:absolute;left:18px;top:38px;margin:0;font-weight:700;font-size:48px;line-height:1.08;color:#241333">10 min</p>
            <p class="pop" style="position:absolute;left:18px;top:94px;margin:0;font-weight:500;font-size:15px;color:#6E6678">de carga</p>
            <img src="{P}usbc.webp" alt="Cabo USB-C carregando" width="220" height="128" loading="lazy" style="position:absolute;right:-14px;top:8px;width:56%;height:auto">
          </div>
        </div>
      </div>
      <div style="margin:22px 22px 22px;height:95vw;max-height:480px;border-radius:24px;overflow:hidden"><img src="{P}constr-hands.webp" alt="Mão segurando o Meeky F5 ANC Pro" width="623" height="779" loading="lazy" class="cover" style="object-position:50% 40%"></div>
    </div>
  </section>
  <div style="background:#FFFDF9;overflow:hidden;padding-bottom:44px">{gal_track(160, 212, 12, 18)}</div>

  <section style="background:#FFFDF9;padding:8px 20px 52px">
    <p class="pop" style="margin:0;font-weight:600;font-size:11.5px;color:#7D47B8">DO PRIMEIRO PLAY AO ÚLTIMO COMPROMISSO</p>
    <h2 class="m-h hub" style="margin-top:12px;font-weight:700;font-size:40px">Seu ritmo muda.<br><span class="roxo">Seu fone acompanha.</span></h2>
    <p class="m-p" style="color:#6E6678">Mais concentração no trabalho, energia no treino e conforto nos seus momentos de pausa.</p>
    <img src="{P}boxer.webp" alt="Mulher treinando com o Meeky F5 ANC Pro" width="500" height="620" loading="lazy" style="margin-top:22px;width:100%;height:105vw;max-height:520px;border-radius:24px;object-fit:cover;object-position:50% 30%" data-reveal="">
    <div style="margin-top:14px;display:flex;flex-direction:column;gap:12px">
      {''.join(f"""<div class="bnf" style="padding:18px;gap:14px;background:{bg};border:1px solid {bd}"><div class="ic" style="width:42px;height:42px;background:{ib}"><img src="{P}{ic}" alt="" width="{iw:.0f}" height="{ih:.0f}" style="width:{iw * .75:.2f}px;height:{ih * .75:.2f}px"></div><div><p class="hub" style="margin:0;font-weight:700;font-size:24px;line-height:1.15;color:#09010F">{t}</p><p class="pop" style="margin:6px 0 0;font-size:14.5px;line-height:1.4;color:#6E6678">{d}</p><p class="pop" style="margin:8px 0 0;font-weight:600;font-size:10px;color:#7D47B8">{tag}</p></div></div>""" for bg, bd, ib, ic, iw, ih, t, d, tag in BENEF)}
    </div>
  </section>

  <section style="background:#FFFDF9;padding:8px 0 52px;overflow:hidden">
    <div style="padding:0 20px;text-align:center">
      <p class="pop" style="margin:0;font-weight:600;font-size:11.5px;color:#7D47B8">EXPERIÊNCIAS DE QUEM USA</p>
      <h2 class="m-h hub" style="margin-top:12px;font-weight:700;font-size:40px">O som muda a rotina.<br>Quem usa, conta.</h2>
    </div>
    <div style="margin-top:26px;padding-left:20px">{depo_track(290, 230, 14, 15.5)}</div>
  </section>

  <section style="position:relative;background:#F9F0FF;overflow:hidden;padding:0 20px 48px">
    <img src="{P}cta-eq.svg" alt="" width="1634" height="439" style="position:absolute;left:-40%;top:-6px;width:200%;height:auto;transform:scaleY(-1);pointer-events:none">
    <!-- fone flutuando em cima, igual à página do Motion 1 -->
    <div class="flt-p" style="position:relative;margin:10px auto 0;width:68vw;max-width:320px;aspect-ratio:313/300"><img src="{P}hero-headphone.webp" alt="" width="266" height="249" loading="lazy" style="position:absolute;left:7.5%;top:8.5%;width:85%;height:auto;transform:rotate(12.35deg)"></div>
    <div style="position:relative;margin-top:2vw">
      <h2 class="hub" style="margin:0;font-weight:700;font-size:56px;letter-spacing:-1.7px;line-height:.94;color:#441463">F5 ANC Pro</h2>
      <p class="pop" style="margin:14px 0 0;font-size:16px;line-height:1.35;color:#4C3F5C">Menos distrações. Mais espaço para o que importa. Leve o seu próximo play para outro nível.</p>
      {m_price()}
      {m_buy()}
    </div>
  </section>
'''

page('Produto-antiga.html', ['Produto.html'], 'produto', D, M, EXTRA_HEAD)
print('ok')
