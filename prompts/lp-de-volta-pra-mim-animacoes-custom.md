Vamos trocar as animações de entrada da página 20 (rascunho "De Volta pra Mim – LP") por um sistema próprio, leve, com IntersectionObserver + CSS. Continua valendo: rascunho, nada publicado, nenhuma outra página alterada. Sem GSAP, sem jQuery, sem plugin novo.

## 1. Remover as animações nativas
Remova TODAS as Animações de Entrada do Elementor (Efeitos de movimento → Animação de entrada → "Nenhuma") de todos os elementos da página. Não pode sobrar nenhuma, senão as duas brigam.

## 2. Widget HTML no TOPO da página
Crie um widget HTML como PRIMEIRO elemento da página (antes da faixa do topo), sem margem nem padding, com o código abaixo. Ele precisa ser o primeiro para esconder os elementos antes de eles aparecerem na tela (sem "piscar").

ATENÇÃO: o WordPress já removeu barras invertidas (\) de um CSS desta página antes. O código abaixo não usa nenhuma. Depois de salvar, leia o conteúdo salvo do widget e confirme que está idêntico, inclusive a tag <script>. Se o <script> for removido ao salvar, me avise (o usuário precisa da permissão unfiltered_html; administrador costuma ter).

```html
<style>
  html.dvpm-js .dvpm-reveal {
    opacity: 0;
    transform: var(--dvpm-from, translate3d(0, 40px, 0));
    filter: blur(6px);
    transition:
      opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0s),
      transform 1s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0s),
      filter 0.9s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0s);
    will-change: opacity, transform;
  }
  html.dvpm-js .dvpm-up    { --dvpm-from: translate3d(0, 40px, 0); }
  html.dvpm-js .dvpm-left  { --dvpm-from: translate3d(-56px, 0, 0); }
  html.dvpm-js .dvpm-right { --dvpm-from: translate3d(56px, 0, 0); }
  html.dvpm-js .dvpm-zoom  { --dvpm-from: scale(0.92); }
  html.dvpm-js .dvpm-fade  { --dvpm-from: none; }

  html.dvpm-js .dvpm-reveal.ativo {
    opacity: 1;
    transform: none;
    filter: none;
  }

  /* Celular: nada de entrada lateral (evita rolagem horizontal) */
  @media (max-width: 767px) {
    html.dvpm-js .dvpm-left,
    html.dvpm-js .dvpm-right { --dvpm-from: translate3d(0, 32px, 0); }
  }

  /* Evita rolagem horizontal durante as entradas laterais */
  body { overflow-x: clip; }

  /* Dentro do editor do Elementor, tudo visível */
  body.elementor-editor-active .dvpm-reveal {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }

  @media (prefers-reduced-motion: reduce) {
    html.dvpm-js .dvpm-reveal {
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
      transition: none !important;
    }
  }
</style>
<script>
  (function () {
    var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduz || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('dvpm-js');

    var PASSO = 0.12;   // segundos entre um item e o próximo
    var MAXIMO = 0.72;  // atraso máximo dentro de um mesmo grupo

    function iniciar() {
      var elementos = document.querySelectorAll('.dvpm-reveal');

      var observer = new IntersectionObserver(function (entries) {
        // Só os que entraram agora, na ordem em que aparecem na tela
        var visiveis = entries
          .filter(function (e) { return e.isIntersecting; })
          .sort(function (a, b) {
            var ra = a.boundingClientRect, rb = b.boundingClientRect;
            return (ra.top - rb.top) || (ra.left - rb.left);
          });

        visiveis.forEach(function (entry, i) {
          var el = entry.target;
          var extra = parseFloat(el.getAttribute('data-delay') || '0') || 0;
          var atraso = Math.min(i * PASSO, MAXIMO) + extra;
          el.style.setProperty('--delay', atraso + 's');
          requestAnimationFrame(function () { el.classList.add('ativo'); });
          observer.unobserve(el);
        });
      }, { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

      elementos.forEach(function (el) { observer.observe(el); });

      // Segurança: se algo falhar, nada fica invisível
      setTimeout(function () {
        elementos.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) el.classList.add('ativo');
        });
      }, 4000);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', iniciar);
    } else {
      iniciar();
    }
  })();
</script>
```

Como funciona: cada grupo de elementos que entra na tela junto anima em cascata (0,12s entre eles, no máximo 0,72s), na ordem visual. O atraso zera a cada grupo, então rolar rápido não acumula espera. Elementos que já estão na tela ao abrir a página (hero) também entram em cascata.

## 3. Classes nos elementos
Em Avançado → Classes CSS, coloque "dvpm-reveal" + UMA direção ("dvpm-up", "dvpm-left", "dvpm-right", "dvpm-zoom" ou "dvpm-fade"). Exemplo: "dvpm-reveal dvpm-left". Aplique nos ELEMENTOS (widgets e cards), não nas seções inteiras. Não aplique em containers que tenham filhos que também animam (só em um nível).

- Hero: selo, logo, título, frase, linha do botão + Zoom → dvpm-up. Foto da Daniela → dvpm-fade. Faixa do topo: sem animação.
- Faixa de frases: sem animação.
- "Tá tudo certo…": título e parágrafos → dvpm-left; bilhete → dvpm-right.
- "Talvez esteja faltando você…": textos → dvpm-up; foto → dvpm-fade.
- Cards de consequência: título → dvpm-up; os 5 cards → dvpm-up; frase final → dvpm-fade.
- Ordem de prioridade: título → dvpm-up; cada uma das 7 pílulas → dvpm-zoom; card esquerdo → dvpm-left; card direito → dvpm-right; título, texto e botão finais → dvpm-up.
- Programação: título → dvpm-up; foto → dvpm-zoom; card sábado → dvpm-left; card domingo → dvpm-right; frase e botão → dvpm-up.
- Para você / não é para você: card esquerdo → dvpm-left; card direito → dvpm-right.
- Ingresso: cartão → dvpm-up. (Não anime o preço separado do cartão, para não animar dois níveis.)
- Daniela: foto → dvpm-fade; card → dvpm-right.
- Depoimentos: título → dvpm-up; os 3 prints → dvpm-up.
- FAQ: título → dvpm-up; o acordeão inteiro → dvpm-up.
- Chamada final: título, texto, frase e botão → dvpm-up. Rodapé: sem animação.

Cuidados:
- O cartão do ingresso usa mask/drop-shadow: confira que a animação não quebra o recorte nem a sombra. Se quebrar, anime um container de fora do cartão em vez do próprio cartão.
- O bilhete da seção "Tá tudo certo" já tem rotação de -2.2°: coloque a classe em um container de FORA do bilhete, para a animação não apagar a rotação.
- Os botões com efeito (classe dvpm-btn) não devem receber dvpm-reveal no próprio botão: coloque no container em volta.

## Ao terminar
1. Link de visualização.
2. Teste em desktop (1920 e 1366) e celular (390 e 360): rolar devagar e rolar rápido até o fim. Tudo precisa aparecer, sem piscar no carregamento, sem rolagem horizontal, sem conflito com rotação, recorte do ingresso e efeito dos botões.
3. Confirme que o widget HTML foi salvo com o <script> intacto e que não sobrou nenhuma animação nativa do Elementor.
