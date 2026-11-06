import sys
sys.path.insert(0, '/tmp/claude-0/-home-user-Operacao/fbca03c4-7417-5cc6-bb7f-c3884c6dd20f/scratchpad/hv2')
from lib import *

P = 'assets/motion-v2/'

def price(top, alpha):
    # cartão do preço do Motion 1: 6x R$ 124,98 / ou à vista de R$ 749,90
    return f'''<div class="ab" style="left:0;top:{top}px;width:434px;height:148px;border-radius:10px;background:linear-gradient(108.8deg,rgba(255,253,249,{alpha}) .8%,rgba(255,251,242,{alpha}) 102.9%)"></div>
        <p class="ab pop" style="left:21px;top:{top + 35.9:.2f}px;margin:0;width:61.262px;height:41.976px;display:flex;align-items:center;font-weight:700;font-size:47.243px;letter-spacing:-.9449px;line-height:1.2;color:#31023C;mix-blend-mode:hard-light">6x</p>
        <p class="ab pop" style="left:80px;top:{top + 22:.2f}px;margin:0;width:332px;height:70px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:78.549px;letter-spacing:-5.4984px;line-height:1.2;color:#31023C;mix-blend-mode:hard-light;white-space:nowrap">R$ 124,98</p>
        <p class="ab pop" style="left:12px;top:{top + 103:.2f}px;margin:0;width:409px;height:20px;display:flex;align-items:center;justify-content:center;font-size:19px;letter-spacing:-.76px;line-height:1.2;color:#31023C;mix-blend-mode:hard-light;white-space:nowrap">ou à vista de&nbsp;<b style="font-weight:700">R$ 749,90</b>&nbsp;sem juros · frete grátis</p>'''

def buy(left, top):
    return f'<div class="ab" style="left:{left}px;top:{top}px">{btn_g("Comprar agora", BUY_M, "", 262, 50.17, "box-shadow:0 2.23px 0 #470E6D", 16.7)}</div>'

FAIXA = ['Condução óssea real', 'Até 14h de bateria', 'Apenas 30g', 'IPX5', 'Bluetooth 6.0', 'Anatel']
def faixa(zoom):
    g = ''.join(f'<span>{t}</span><img src="{P}dot.svg" alt="" width="5" height="5" style="width:5px;height:5px">' for t in FAIXA)
    return (f'<section style="background:#721D87;overflow:hidden"><div style="zoom:{zoom};height:82px;display:flex;align-items:center">'
            f'<div class="fx-track"><div class="fx-g">{g}</div><div class="fx-g">{g}</div><div class="fx-g">{g}</div><div class="fx-g">{g}</div></div></div></section>')

STAT = [('Até 14h', 'Bateria · LED desligado'), ('IPX5', 'Suor e respingos'), ('30g', 'Leveza para o movimento'), ('6.0', 'Bluetooth')]
def stat(left, top, v, l):
    return f'<div class="ab" style="left:{left}px;top:{top}px;width:351px;height:257px;border-radius:15px;background:#F2EDFA;overflow:hidden" data-reveal=""><p class="ab hub" style="left:26px;top:30.17px;margin:0;font-weight:700;font-size:55.273px;line-height:63.564px;color:#7D47B8;white-space:nowrap">{v}</p><p class="ab pop" style="left:26px;top:207px;margin:0;font-weight:500;font-size:18px;line-height:18px;color:#6E6678">{l}</p></div>'

FICHA = [
    ('Design e proteção', [('Tecnologia', 'Condução óssea real'), ('Peso', '30 g'), ('Resistência', 'IPX5'), ('LED', 'Contínuo, piscante,<br>esmaecido ou desligado')]),
    ('Bateria e recarga', [('Capacidade', '220 mAh'), ('LED desligado / ligado', 'Até 14h / até 9h'), ('Modo de espera', '~200 horas'), ('Recarga completa', '~2h · USB-C')]),
    ('Conectividade', [('Bluetooth', '6.0 · até 10m'), ('Microfone', 'Integrado'), ('Controles', 'Música e chamadas'), ('Assistentes', 'Siri e Google Assistente')]),
    ('Garantia e acessórios', [('Homologação', 'Anatel'), ('Garantia MEEKY', '2 anos'), ('Encaixe', 'Ajuste em borracha'), ('Transporte', 'Pouch incluso')]),
]
def ficha_col(i, t, items):
    style = 'padding-right:18px' if i == 0 else 'padding:0 18px 0 22px;border-left:1px solid #DBCFE8'
    its = ''.join(f'<div style="display:flex;flex-direction:column;gap:2px;min-height:47px"><p class="pop" style="margin:0;font-size:11px;line-height:15.95px;color:#6E6678">{l}</p><p class="pop" style="margin:0;font-weight:500;font-size:14px;line-height:21px;color:#09010F">{v}</p></div>' for l, v in items)
    return f'<div style="flex:1 1 0;box-sizing:border-box;{style};display:flex;flex-direction:column;gap:15px"><p class="hub" style="margin:0;font-weight:700;font-size:25px;line-height:30px;color:#09010F">{t}</p>{its}</div>'

CONF = [
    ('#7D47B8', '#FFFFFF', '#FFFFFF', '#FFFFFF', '2 anos', 'Garantia MEEKY', 'Cobertura direta com a marca, sem intermediários.',
     f'<div class="ab" style="left:111px;top:-34px;width:467.6px;height:365.8px;display:flex;align-items:center;justify-content:center"><img src="{P}shield.webp" alt="" width="414" height="275" loading="lazy" style="flex:none;width:413.948px;height:275.97px;transform:rotate(-13.8deg)"></div>'),
    ('#F2EDFA', '#7D47B8', '#09010F', '#6E6678', 'Anatel', 'Produto homologado', 'Certificado para uso no Brasil.',
     f'<img class="ab" src="{P}medal.webp" alt="" width="356" height="452" loading="lazy" style="left:170px;top:-98px;width:355.5px;height:452px;object-fit:contain">'),
    ('#F2EDFA', '#7D47B8', '#09010F', '#6E6678', 'Suporte', 'Em português', 'Atendimento nacional do pedido ao pós-venda.',
     f'<img class="ab" src="{P}headset3d.webp" alt="" width="291" height="370" loading="lazy" style="left:175px;top:-91px;width:291px;height:370px;object-fit:contain">'),
    ('#F2EDFA', '#7D47B8', '#09010F', '#6E6678', 'Pouch', 'Incluso na caixa', 'Case de transporte para levar seu Motion 1.',
     f'<div class="ab" style="left:204px;top:-44px;width:319.4px;height:364.4px;display:flex;align-items:center;justify-content:center"><img src="{P}pouch.webp" alt="" width="243" height="309" loading="lazy" style="flex:none;width:243px;height:309px;object-fit:contain;transform:rotate(-16.16deg)"></div>'),
]
def conf_card(bg, c1, c2, c3, t, s, d, art, w=408, h=226):
    return f'''<div style="position:relative;width:{w}px;height:{h}px;border-radius:24px;background:{bg};overflow:hidden">{art}
          <div class="ab" style="left:24px;top:24px;width:206px;height:178px;display:flex;flex-direction:column;justify-content:center;gap:10px">
            <p class="hub" style="margin:0;font-weight:700;font-size:37px;line-height:41px;color:{c1}">{t}</p>
            <p class="pop" style="margin:0;font-weight:600;font-size:14px;line-height:21px;color:{c2}">{s}</p>
            <p class="pop" style="margin:0;font-size:13px;line-height:19.5px;color:{c3}">{d}</p>
          </div></div>'''

FEAT = [('ic-bt.svg', 12.97, 21.63, 'Até 10 metros de alcance'), ('ic-mic.svg', 17.3, 22.72, 'Microfone integrado'), ('ic-headset.svg', 23.8, 22.72, 'Compatível com Siri e Google')]

EXTRA_HEAD = '''<style>
  .fx-track { display:flex; width:max-content; animation:meeky-marquee 60s linear infinite; }
  .fx-g { display:flex; align-items:center; gap:42px; padding-left:42px; flex:0 0 auto; }
  .fx-g span { font-family:'Poppins',sans-serif; font-weight:600; font-size:21px; line-height:27.3px; color:#D4C4E5; white-space:nowrap; }
  .mz { display:flex; flex-direction:column; box-sizing:border-box; border-radius:24px; overflow:hidden; }
  .eb { margin:0; font-family:'Poppins',sans-serif; font-weight:600; font-size:11px; line-height:15.4px; color:#7D47B8; }
</style>'''

ICONS3 = ''.join(f'<span style="width:44px;height:44px;border-radius:12px;background:#F2EDFA;display:flex;align-items:center;justify-content:center"><img src="{P}{f}" alt="" width="{w:.0f}" height="{h:.0f}" style="width:{w}px;height:{h}px"></span>' for f, w, h in [('ic-ear.svg', 11.72, 19.52), ('ic-music.svg', 16.7, 19.38), ('ic-wave.svg', 17.47, 19.38)])

# ---------- COMPUTADOR ----------
D = f'''
  <!-- Hero Motion 1 (Figma 4106:1466) -->
  <section style="position:relative;overflow:hidden;background:linear-gradient(214.4deg,#4A3169 8.95%,#B987F8 88.12%)">
    <div class="hv" style="height:838px;zoom:{{{{ k }}}}">
      {''.join(f'<p class="ab pop" style="left:613px;top:{t}px;margin:0;transform:translateY(-50%);font-weight:700;font-size:157.309px;letter-spacing:-4.7193px;line-height:1;color:rgba(112,79,132,.51);opacity:.5;mix-blend-mode:hard-light;white-space:nowrap">MOTION 1</p>' for t in [23.5, 195.47, 337.67, 488.69, 660.66, 802.86])}
      <img class="ab flt-p" src="{P}motion.webp" alt="Fone de condução óssea Meeky Motion 1" width="802" height="802" style="left:520px;top:-36px;width:802px;height:802px">
      <h1 class="ab hub grad-txt" style="left:0;top:160px;width:max-content;height:84px;margin:0;display:flex;align-items:center;font-weight:700;font-size:79.102px;letter-spacing:-2.3731px;line-height:.94;background-image:linear-gradient(90deg,#FFFFFF 50%,#F4E2FF 100%);animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .15s both">MOTION 1</h1>
      <p class="ab pop" style="left:0;top:262px;width:490px;height:110px;margin:0;display:flex;align-items:center;font-size:22px;letter-spacing:-.44px;line-height:1.27;color:#fff;animation:hero-in 1s cubic-bezier(.16,.84,.44,1) .3s both">Com tecnologia de condução óssea real, o som chega até você por vibração, mantendo seus ouvidos livres e sua atenção onde ela precisa estar.</p>
      {price(394, .85)}
      {buy(0, 576)}
    </div>
  </section>

  {faixa('{{ mqZoom }}')}

  <!-- Ouvidos livres (Figma 4117:88) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:1070px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:292px;top:120px;width:738px;text-align:center" data-reveal="">
        <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:16.8px;color:#7D47B8">CONDUÇÃO ÓSSEA DE VERDADE</p>
        <h2 class="hub" style="margin:13.2px 0 0;font-weight:700;font-size:55px;line-height:60.5px;color:#09010F">Sua playlist no ritmo.<br><span class="roxo">Seus ouvidos livres.</span></h2>
        <p class="pop" style="margin:18px auto 0;width:525px;font-size:18px;line-height:1.2;color:#6E6678">O Motion 1 transmite o som por vibrações, sem entrar no canal auditivo. Você ouve sua música e continua percebendo o que acontece ao redor.</p>
      </div>
      {stat(31, 401, *STAT[0])}{stat(31, 680, *STAT[1])}{stat(940, 401, *STAT[2])}{stat(940, 680, *STAT[3])}
      <div class="ab" style="left:406px;top:401px;width:510px;height:536px;border-radius:26px;overflow:hidden" data-reveal=".1"><img class="ab" src="{P}academia.webp" alt="Homem treinando na academia com o Meeky Motion 1" width="510" height="712" loading="lazy" style="left:0;top:-4.85%;width:100%;height:132.84%"></div>
      <div class="ab" style="left:530px;top:983px">{btn_g("Comprar agora", BUY_M, "", 262, 50.17, "box-shadow:0 2.23px 0 #470E6D", 16.7)}</div>
    </div>
  </section>

  <!-- Mais liberdade em cada treino (Figma 4117:116) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:958px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:18px;width:780px" data-reveal="">
        <p class="eb">MOTION 1 · FEITO PARA SE MOVER</p>
        <h2 class="hub" style="margin:14px 0 0;font-weight:700;font-size:58px;line-height:60.9px;color:#09010F">Mais liberdade em<br>cada treino.</h2>
      </div>
      <p class="ab pop" style="left:986px;top:80px;width:336px;margin:0;font-size:18px;line-height:28.9px;color:#6E6678">Seis motivos para ouvir sua música e continuar presente no mundo.</p>
      <div class="ab" style="left:0;top:234px;width:1322px;height:660px;display:flex;gap:20px" data-reveal=".1">
        <div style="width:270px;display:flex;flex-direction:column;gap:20px">
          <div class="mz" style="height:320px;padding:24px;justify-content:center;gap:18px;background:#fff">
            <div style="display:flex;gap:10px">{ICONS3}</div>
            <p class="eb">CONDUÇÃO ÓSSEA REAL</p>
            <h3 class="hub" style="margin:0;font-weight:700;font-size:32px;line-height:35.2px;color:#09010F">Ouvidos livres.<br>Você presente.</h3>
            <p class="pop" style="margin:0;width:229px;font-size:16px;line-height:22.4px;color:#6E6678">Sua música por vibração, sem fechar o canal auditivo.</p>
          </div>
          <div class="mz" style="height:320px;padding:24px;justify-content:center;gap:14px;background:#F2EDFA">
            <p class="eb">ULTRALEVE</p>
            <p class="hub" style="margin:0;font-weight:700;font-size:91px;line-height:91px;color:#7D47B8">30g</p>
            <h3 class="hub" style="margin:0;font-weight:700;font-size:26px;line-height:29.12px;color:#09010F">Leve no peso.<br>Firme no movimento.</h3>
            <p class="pop" style="margin:0;font-size:15px;line-height:19px;color:#6E6678">Design ergonômico e ajuste em borracha para o encaixe.</p>
          </div>
        </div>
        <div style="position:relative;width:330px;height:660px;border-radius:24px;overflow:hidden">
          <img class="ab cover" src="{P}led-portrait.webp" alt="Homem usando o Meeky Motion 1 com o LED aceso" width="330" height="660" loading="lazy" style="inset:0">
          <div class="ab" style="left:20px;top:20px;width:106px;height:32px;border-radius:10px;background:#7E50A9;display:flex;align-items:center;justify-content:center"><span class="pop" style="font-weight:600;font-size:10px;color:#fff">LED · 4 MODOS</span></div>
          <div class="ab" style="left:0;top:439px;width:330px;height:221px;background:linear-gradient(180deg,rgba(36,19,51,0),rgba(36,19,51,.92))"></div>
          <div class="ab" style="left:0;top:439px;width:330px;height:221px;background:linear-gradient(180deg,rgba(36,19,51,0),rgba(36,19,51,.92))"></div>
          <h3 class="ab hub" style="left:22px;top:479px;margin:0;font-weight:700;font-size:34px;line-height:37.4px;color:#fff">Seu ritmo<br>também tem luz.</h3>
          <p class="ab pop" style="left:22px;top:562px;margin:0;font-weight:500;font-size:16px;line-height:17.6px;color:#D4C4E5">Contínuo · Piscante<br>Esmaecido · Desligado</p>
        </div>
        <div style="width:682px;display:flex;flex-direction:column;gap:20px">
          <div style="display:flex;gap:20px;height:310px">
            <div class="mz" style="width:331px;padding:24px 24px 24px 48px;justify-content:center;gap:13px;background:#F2EDFA">
              <p class="eb">ENERGIA PARA IR ALÉM</p>
              <p class="hub" style="margin:0;font-weight:700;font-size:63px;line-height:66.78px;color:#7D47B8">Até 14h</p>
              <p class="pop" style="margin:0;font-weight:500;font-size:13px;line-height:19.5px;color:#6E6678">com o LED desligado</p>
              <p class="pop" style="margin:0;font-weight:500;font-size:13px;line-height:19.5px;color:#09010F">Até 9h com o LED ligado</p>
              <p class="pop" style="margin:0;font-size:14px;line-height:19.2px;color:#6E6678">220 mAh · USB-C<br>Recarga completa em ~2h</p>
            </div>
            <div class="mz" style="width:331px;padding:24px;justify-content:center;gap:14px;background:#241333">
              <div style="display:flex;align-items:center;gap:16px;height:66px"><span style="width:62px;height:62px;display:flex;align-items:center;justify-content:center"><img src="{P}ic-drop.svg" alt="" width="38" height="54" style="width:38.3px;height:53.8px"></span><p class="pop" style="margin:0;font-weight:600;font-size:11px;line-height:15.4px;color:#CCA3F5">PRONTO PARA<br>O MOVIMENTO</p></div>
              <p class="hub" style="margin:0;font-weight:700;font-size:58px;line-height:60.9px;color:#fff">IPX5</p>
              <p class="pop" style="margin:0;font-weight:500;font-size:16px;line-height:24px;color:#fff">Suor e respingos<br>fazem parte do treino.</p>
            </div>
          </div>
          <div style="position:relative;height:330px;border-radius:24px;background:#F2EDFA;overflow:hidden">
            <img class="ab" src="{P}bike.webp" alt="Ciclista usando o Meeky Motion 1" width="837" height="808" loading="lazy" style="left:0;top:-268px;width:837px;height:808px">
            <div class="ab" style="left:0;top:-25px;width:424px;height:377px;background:linear-gradient(270deg,rgba(39,23,53,0),#271735)"></div>
            <div class="ab" style="left:0;top:-25px;width:424px;height:377px;background:linear-gradient(270deg,rgba(39,23,53,0),#271735)"></div>
            <p class="ab pop" style="left:28px;top:71px;margin:0;font-weight:600;font-size:11px;line-height:15.4px;color:#fff">SEU SOM NO SEU MOVIMENTO</p>
            <h3 class="ab hub" style="left:28px;top:104px;margin:0;font-weight:700;font-size:37px;line-height:40.7px;color:#fff">Da primeira passada<br>ao último exercício.</h3>
            <p class="ab pop" style="left:28px;top:203px;margin:0;font-weight:500;font-size:14px;line-height:23px;color:#D2C8E0">Corrida · Ciclismo<br>Caminhada · Academia</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Conexão (Figma 4117:166) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:750px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:32px;width:1322px;height:664px;border-radius:30px;background:#241333;overflow:hidden" data-reveal="">
        <div class="ab" style="left:155px;top:40px;width:506px;height:584px;display:flex;flex-direction:column;justify-content:center;gap:20px">
          <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:18px;color:#CCA3F5;white-space:nowrap">BLUETOOTH 6.0 · CONEXÃO SEM COMPLICAR</p>
          <h2 class="hub" style="margin:0;font-weight:700;font-size:52px;line-height:57.2px;color:#fff;white-space:nowrap">Seu dia muda de ritmo.<br>A conexão continua.</h2>
          <p class="pop" style="margin:0;width:425px;font-size:18px;line-height:28.05px;color:#D4C4E5">Da música à próxima ligação, controle tudo pelo fone e mantenha o celular no bolso.</p>
          <div style="display:flex;flex-direction:column;gap:16px;width:384px">{''.join(f'<div style="position:relative;height:55px;border-radius:6px;background:#3E2951"><span class="ab" style="left:14px;top:14.5px;width:26px;height:26px;display:flex;align-items:center;justify-content:center"><img src="{P}{f}" alt="" width="{w:.0f}" height="{h:.0f}" style="width:{w}px;height:{h}px"></span><p class="ab pop" style="left:53px;top:16.5px;margin:0;font-weight:600;font-size:17px;line-height:22.1px;color:#fff">{t}</p></div>' for f, w, h, t in FEAT)}</div>
        </div>
        <div class="ab" style="left:715px;top:68.03px;width:452px;height:527.936px;border-radius:21.7px;overflow:hidden">
          <img class="ab cover" src="{P}arlivre.webp" alt="Mulher usando o Meeky Motion 1 ao ar livre" width="452" height="528" loading="lazy" style="inset:0">
          <div class="ab" style="left:18px;top:448.97px;width:239px;height:59px;box-sizing:border-box;padding:14.46px;border-radius:14.46px;background:#fff;display:flex;align-items:center;gap:12.66px">
            <span style="width:25.3px;height:25.3px;display:flex;align-items:center;justify-content:center"><img src="{P}ic-bt2.svg" alt="" width="12" height="21" style="width:12.48px;height:20.91px"></span>
            <div><p class="hub" style="margin:0;font-weight:700;font-size:17.176px;line-height:20.611px;color:#09010F">Bluetooth 6.0</p><p class="pop" style="margin:2px 0 0;font-weight:500;font-size:9.04px;line-height:12.656px;color:#6E6678">Música e chamadas no seu ritmo</p></div>
          </div>
        </div>
        <img class="ab" src="{P}outline-motion.webp" alt="" width="451" height="473" loading="lazy" style="left:871px;top:191px;width:451px;height:473px">
      </div>
    </div>
  </section>

  <!-- Confiança (Figma 4117:193) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:603px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:0;top:161px;width:430px" data-reveal="">
        <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:18px;color:#7D47B8">MEEKY COM VOCÊ</p>
        <h2 class="hub" style="margin:22px 0 0;font-weight:700;font-size:56px;line-height:58.8px;color:#09010F">Confiança que<br>acompanha<br>o seu ritmo.</h2>
        <p class="pop" style="margin:22px 0 0;width:334px;font-size:17px;line-height:28.9px;color:#6E6678">Da escolha ao pós-venda, conte com uma marca presente no Brasil.</p>
      </div>
      <div class="ab" style="left:488px;top:78px;width:834px;display:grid;grid-template-columns:408px 408px;gap:18px" data-reveal=".1">{''.join(conf_card(*c) for c in CONF)}</div>
    </div>
  </section>

  <!-- Ficha técnica (Figma 4117:214) -->
  <section style="background:#FFFDF9;overflow:hidden">
    <div class="hv" style="height:686px;zoom:{{{{ k }}}}">
      <div class="ab" style="left:271px;top:67px;width:780px;text-align:center" data-reveal="">
        <p class="pop" style="margin:0;font-weight:600;font-size:12px;line-height:16.8px;color:#7D47B8">MOTION 1 · TECNOLOGIA EM CADA DETALHE</p>
        <h2 class="hub" style="margin:12px 0 0;font-weight:700;font-size:54px;line-height:58.32px;color:#09010F">Conheça o Motion 1 por completo.</h2>
      </div>
      <div class="ab" style="left:0;top:208px;width:1322px;height:356px;box-sizing:border-box;padding:24px 26px;border-radius:24px;background:#fff;display:flex" data-reveal=".1">{''.join(ficha_col(i, t, it) for i, (t, it) in enumerate(FICHA))}</div>
    </div>
  </section>

  <!-- Chamada final (Figma 4145:195) -->
  <section style="background:#F9F0FF;overflow:hidden">
    <div class="hv" style="height:581px;zoom:{{{{ k }}}}">
      <img class="ab" src="{P}cta-eq.svg" alt="" width="1634" height="439" style="left:448px;top:-57px;width:1634.41px;height:439px;transform:scaleY(-1)">
      <img class="ab flt-p" src="{P}motion.webp" alt="" width="869" height="869" loading="lazy" style="left:528px;top:-283px;width:869px;height:869px">
      <h2 class="ab hub" style="left:0;top:71px;width:469px;height:84px;margin:0;display:flex;align-items:center;font-weight:700;font-size:79.102px;letter-spacing:-2.3731px;line-height:.94;color:#441463">Motion 1</h2>
      <p class="ab pop" style="left:0;top:175px;width:469px;margin:0;font-size:18px;line-height:1.32;color:#4C3F5C">Com tecnologia de condução óssea real, o som chega até você por vibração, mantendo seus ouvidos livres e sua atenção onde ela precisa estar.</p>
      {price(266, .78)}
      {buy(0, 460)}
    </div>
  </section>
'''

# ---------- CELULAR ----------
def m_price(hero=False):
    if hero:
        return f'''<div style="margin-top:14px;width:100%;max-width:380px;box-sizing:border-box;padding:9px 12px 11px;border-radius:10px;background:linear-gradient(108.8deg,rgba(255,253,249,.85),rgba(255,251,242,.85));text-align:center">
        <p class="pop" style="margin:0;display:flex;align-items:baseline;justify-content:center;gap:7px;color:#31023C;font-weight:700;white-space:nowrap"><span style="font-size:24px;letter-spacing:-.5px">6x</span><span style="font-size:38px;letter-spacing:-2.6px;line-height:1.1">R$ 124,98</span></p>
        <p class="pop" style="margin:1px 0 0;font-size:12.5px;letter-spacing:-.35px;color:#31023C">ou à vista de <b style="font-weight:700">R$ 749,90</b> sem juros · frete grátis</p>
      </div>'''
    return '''<div style="margin-top:20px;width:100%;max-width:380px;box-sizing:border-box;padding:14px 12px 16px;border-radius:10px;background:linear-gradient(108.8deg,rgba(255,253,249,.85),rgba(255,251,242,.85));text-align:center">
        <p class="pop" style="margin:0;display:flex;align-items:baseline;justify-content:center;gap:8px;color:#31023C;font-weight:700;white-space:nowrap"><span style="font-size:30px;letter-spacing:-.6px">6x</span><span style="font-size:48px;letter-spacing:-3.2px;line-height:1.1">R$ 124,98</span></p>
        <p class="pop" style="margin:2px 0 0;font-size:13.5px;letter-spacing:-.4px;color:#31023C">ou à vista de <b style="font-weight:700">R$ 749,90</b> sem juros · frete grátis</p>
      </div>'''

def m_buy(extra='', hero=False):
    return f'<a href="{BUY_M}" class="btn-g" style="margin-top:{14 if hero else 22}px;width:100%;max-width:380px;height:{50 if hero else 54}px;font-size:15px;box-shadow:0 2.23px 0 #470E6D;{extra}">Comprar agora</a>'

M = f'''
  <!-- Hero Motion 1 celular (Figma 4172:1151) -->
  <section style="position:relative;overflow:hidden;background:#553977">
    <div style="position:relative;height:84vw;max-height:430px;overflow:hidden;background:linear-gradient(234.5deg,#4A3169 8.95%,#B987F8 88.12%)">
      {''.join(f'<p class="pop" style="position:absolute;left:50%;top:{t}vw;margin:0;transform:translate(-50%,-50%);font-weight:700;font-size:22.9vw;letter-spacing:-.69vw;line-height:1;color:rgba(112,79,132,.51);opacity:.5;mix-blend-mode:hard-light;white-space:nowrap">MOTION 1</p>' for t in [-2, 23.1, 43.8, 65.8, 90.9, 111.7])}
      <div style="position:absolute;left:0;right:0;bottom:0;height:61%;background:linear-gradient(180deg,rgba(85,57,119,0),#553977)"></div>
      <div style="position:absolute;left:0;right:0;bottom:0;height:61%;background:linear-gradient(180deg,rgba(85,57,119,0),#553977)"></div>
      <img class="flt-p" src="{P}motion.webp" alt="Fone de condução óssea Meeky Motion 1" width="313" height="313" style="position:absolute;left:15vw;top:-3vw;width:70vw;max-width:360px;height:auto">
    </div>
    <div style="position:relative;margin-top:-14vw;padding:0 20px 36px;display:flex;flex-direction:column;align-items:center;text-align:center">
      <h1 class="hub grad-txt" style="margin:0;font-weight:700;font-size:46px;letter-spacing:-1.4px;line-height:.94;background-image:linear-gradient(90deg,#FFFFFF 50%,#F4E2FF 100%)">MOTION 1</h1>
      <p class="pop" style="margin:10px 0 0;max-width:380px;font-size:14.5px;letter-spacing:-.25px;line-height:1.32;color:#fff">Com tecnologia de condução óssea real, o som chega até você por vibração, mantendo seus ouvidos livres e sua atenção onde ela precisa estar.</p>
      {m_price(True)}
      {m_buy(hero=True)}
    </div>
  </section>

  {faixa('.62')}

  <section style="background:#FFFDF9;padding:44px 20px 48px">
    <div style="text-align:center" data-reveal="">
      <p class="pop" style="margin:0;font-weight:600;font-size:11.5px;color:#7D47B8">CONDUÇÃO ÓSSEA DE VERDADE</p>
      <h2 class="m-h hub" style="margin-top:12px;font-weight:700;font-size:40px">Sua playlist no ritmo.<br><span class="roxo">Seus ouvidos livres.</span></h2>
      <p class="m-p" style="color:#6E6678">O Motion 1 transmite o som por vibrações, sem entrar no canal auditivo. Você ouve sua música e continua percebendo o que acontece ao redor.</p>
    </div>
    <div style="margin-top:22px;height:105vw;max-height:520px;border-radius:24px;overflow:hidden" data-reveal=""><img src="{P}academia.webp" alt="Homem treinando na academia com o Meeky Motion 1" width="510" height="712" loading="lazy" class="cover" style="object-position:50% 20%"></div>
    <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px">{''.join(f'<div style="height:150px;box-sizing:border-box;padding:18px;border-radius:15px;background:#F2EDFA;display:flex;flex-direction:column;justify-content:space-between"><p class="hub" style="margin:0;font-weight:700;font-size:40px;line-height:1.1;color:#7D47B8">{v}</p><p class="pop" style="margin:0;font-weight:500;font-size:14px;line-height:1.25;color:#6E6678">{l}</p></div>' for v, l in STAT)}</div>
    {m_buy('max-width:none')}
  </section>

  <section style="background:#FFFDF9;padding:8px 20px 48px">
    <p class="eb">MOTION 1 · FEITO PARA SE MOVER</p>
    <h2 class="m-h hub" style="margin-top:12px;font-weight:700;font-size:40px">Mais liberdade em cada treino.</h2>
    <p class="m-p" style="color:#6E6678">Seis motivos para ouvir sua música e continuar presente no mundo.</p>
    <div style="margin-top:22px;display:flex;flex-direction:column;gap:14px">
      <div class="mz" style="padding:22px;gap:14px;background:#fff;border:1px solid #F0E6F7"><div style="display:flex;gap:10px">{ICONS3}</div><p class="eb">CONDUÇÃO ÓSSEA REAL</p><h3 class="hub" style="margin:0;font-weight:700;font-size:30px;line-height:1.1;color:#09010F">Ouvidos livres. Você presente.</h3><p class="pop" style="margin:0;font-size:15px;line-height:1.4;color:#6E6678">Sua música por vibração, sem fechar o canal auditivo.</p></div>
      <div style="position:relative;height:120vw;max-height:560px;border-radius:24px;overflow:hidden">
        <img class="cover" src="{P}led-portrait.webp" alt="Homem usando o Meeky Motion 1 com o LED aceso" width="330" height="660" loading="lazy" style="position:absolute;inset:0">
        <div style="position:absolute;left:18px;top:18px;padding:8px 14px;border-radius:10px;background:#7E50A9"><span class="pop" style="font-weight:600;font-size:10px;color:#fff">LED · 4 MODOS</span></div>
        <div style="position:absolute;left:0;right:0;bottom:0;padding:70px 22px 22px;background:linear-gradient(180deg,rgba(36,19,51,0),rgba(36,19,51,.95) 55%)"><h3 class="hub" style="margin:0;font-weight:700;font-size:32px;line-height:1.1;color:#fff">Seu ritmo também tem luz.</h3><p class="pop" style="margin:8px 0 0;font-weight:500;font-size:14px;line-height:1.4;color:#D4C4E5">Contínuo · Piscante · Esmaecido · Desligado</p></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="mz" style="padding:18px;gap:8px;background:#F2EDFA"><p class="eb">ULTRALEVE</p><p class="hub" style="margin:0;font-weight:700;font-size:62px;line-height:1;color:#7D47B8">30g</p><p class="hub" style="margin:0;font-weight:700;font-size:19px;line-height:1.15;color:#09010F">Leve no peso. Firme no movimento.</p></div>
        <div class="mz" style="padding:18px;gap:8px;background:#241333"><img src="{P}ic-drop.svg" alt="" width="28" height="40" style="width:28px;height:40px"><p class="hub" style="margin:0;font-weight:700;font-size:46px;line-height:1;color:#fff">IPX5</p><p class="pop" style="margin:0;font-weight:500;font-size:13.5px;line-height:1.35;color:#fff">Suor e respingos fazem parte do treino.</p></div>
      </div>
      <div class="mz" style="padding:22px;gap:6px;background:#F2EDFA"><p class="eb">ENERGIA PARA IR ALÉM</p><p class="hub" style="margin:0;font-weight:700;font-size:56px;line-height:1.05;color:#7D47B8">Até 14h</p><p class="pop" style="margin:0;font-weight:500;font-size:13.5px;color:#6E6678">com o LED desligado · <span style="color:#09010F">até 9h com o LED ligado</span></p><p class="pop" style="margin:4px 0 0;font-size:13.5px;line-height:1.4;color:#6E6678">220 mAh · USB-C · Recarga completa em ~2h</p></div>
      <div style="position:relative;height:300px;border-radius:24px;overflow:hidden">
        <img class="cover" src="{P}bike.webp" alt="Ciclista usando o Meeky Motion 1" width="837" height="808" loading="lazy" style="position:absolute;inset:0;object-position:70% 40%">
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,#271735 10%,rgba(39,23,53,0) 85%)"></div>
        <div style="position:absolute;left:22px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;width:70%"><p class="pop" style="margin:0;font-weight:600;font-size:10.5px;color:#fff">SEU SOM NO SEU MOVIMENTO</p><h3 class="hub" style="margin:10px 0 0;font-weight:700;font-size:30px;line-height:1.1;color:#fff">Da primeira passada ao último exercício.</h3><p class="pop" style="margin:10px 0 0;font-weight:500;font-size:13px;line-height:1.6;color:#D2C8E0">Corrida · Ciclismo<br>Caminhada · Academia</p></div>
      </div>
    </div>
  </section>

  <section style="background:#FFFDF9;padding:0 20px 44px">
    <div style="border-radius:28px;background:#241333;overflow:hidden;padding:30px 22px 22px" data-reveal="">
      <p class="pop" style="margin:0;font-weight:600;font-size:11px;color:#CCA3F5">BLUETOOTH 6.0 · CONEXÃO SEM COMPLICAR</p>
      <h2 class="hub" style="margin:12px 0 0;font-weight:700;font-size:38px;line-height:1.05;color:#fff">Seu dia muda de ritmo.<br>A conexão continua.</h2>
      <p class="pop" style="margin:12px 0 0;font-size:15px;line-height:1.55;color:#D4C4E5">Da música à próxima ligação, controle tudo pelo fone e mantenha o celular no bolso.</p>
      <div style="margin-top:18px;display:flex;flex-direction:column;gap:10px">{''.join(f'<div style="display:flex;align-items:center;gap:14px;padding:14px;border-radius:6px;background:#3E2951"><img src="{P}{f}" alt="" width="{w:.0f}" height="{h:.0f}" style="width:{w}px;height:{h}px"><p class="pop" style="margin:0;font-weight:600;font-size:15px;color:#fff">{t}</p></div>' for f, w, h, t in FEAT)}</div>
      <div style="position:relative;margin-top:20px;height:110vw;max-height:520px;border-radius:20px;overflow:hidden">
        <img class="cover" src="{P}arlivre.webp" alt="Mulher usando o Meeky Motion 1 ao ar livre" width="452" height="528" loading="lazy" style="position:absolute;inset:0">
        <div style="position:absolute;left:14px;bottom:14px;padding:12px 14px;border-radius:14px;background:#fff;display:flex;align-items:center;gap:12px"><img src="{P}ic-bt2.svg" alt="" width="12" height="21"><div><p class="hub" style="margin:0;font-weight:700;font-size:17px;color:#09010F">Bluetooth 6.0</p><p class="pop" style="margin:2px 0 0;font-weight:500;font-size:10px;color:#6E6678">Música e chamadas no seu ritmo</p></div></div>
      </div>
    </div>
  </section>

  <section style="background:#FFFDF9;padding:8px 20px 44px">
    <p class="pop" style="margin:0;font-weight:600;font-size:11.5px;color:#7D47B8">MEEKY COM VOCÊ</p>
    <h2 class="m-h hub" style="margin-top:12px;font-weight:700;font-size:40px">Confiança que acompanha o seu ritmo.</h2>
    <p class="m-p" style="color:#6E6678">Da escolha ao pós-venda, conte com uma marca presente no Brasil.</p>
    <div style="margin-top:22px;width:408px;display:flex;flex-direction:column;gap:14px;zoom:{{{{ kmConf }}}}">{''.join(conf_card(*c) for c in CONF)}</div>
  </section>

  <section style="background:#FFFDF9;padding:8px 20px 52px">
    <p class="pop" style="margin:0;font-weight:600;font-size:11.5px;color:#7D47B8;text-align:center">MOTION 1 · TECNOLOGIA EM CADA DETALHE</p>
    <h2 class="m-h hub" style="margin-top:12px;font-weight:700;font-size:38px;text-align:center">Conheça o Motion 1 por completo.</h2>
    <div style="margin-top:22px;padding:6px 22px;border-radius:24px;background:#fff;border:1px solid #F0E6F7">{''.join(f'<div style="padding:18px 0;{"border-top:1px solid #DBCFE8" if i else ""}"><p class="hub" style="margin:0 0 10px;font-weight:700;font-size:23px;color:#09010F">{t}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 14px">{"".join(f"<div><p class=\'pop\' style=\'margin:0;font-size:11px;color:#6E6678\'>{l}</p><p class=\'pop\' style=\'margin:2px 0 0;font-weight:500;font-size:13.5px;line-height:1.35;color:#09010F\'>{v}</p></div>" for l, v in it)}</div></div>' for i, (t, it) in enumerate(FICHA))}</div>
  </section>

  <section style="position:relative;background:#F9F0FF;overflow:hidden;padding:0 20px 48px">
    <img src="{P}cta-eq.svg" alt="" width="1634" height="439" style="position:absolute;left:-40%;top:-6px;width:200%;height:auto;transform:scaleY(-1);pointer-events:none">
    <img class="flt-p" src="{P}motion.webp" alt="" width="320" height="320" loading="lazy" style="position:relative;display:block;margin:0 auto;width:78vw;max-width:360px;height:auto">
    <div style="position:relative;margin-top:-6vw">
      <h2 class="hub" style="margin:0;font-weight:700;font-size:56px;letter-spacing:-1.7px;line-height:.94;color:#441463">Motion 1</h2>
      <p class="pop" style="margin:14px 0 0;font-size:16px;line-height:1.35;color:#4C3F5C">Com tecnologia de condução óssea real, o som chega até você por vibração, mantendo seus ouvidos livres e sua atenção onde ela precisa estar.</p>
      {m_price()}
      {m_buy()}
    </div>
  </section>
'''

PAGE_VALS = "(k, m, w) => ({ kmConf: (Math.max(280, w - 40) / 408).toFixed(4) })"
page('Motion1-antiga.html', ['Motion1.html'], 'produto', D, M, EXTRA_HEAD, PAGE_VALS)
print('ok')
