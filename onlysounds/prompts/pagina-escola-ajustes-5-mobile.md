Faça **só estes 3 ajustes** na página **Escola** (`/escola`, em rascunho) do site onlysounds.com.br usando o MCP `only-sounds-elementor`. Não mexa em mais nada. Os itens 1 e 2 são **só no mobile (≤ 767px)**; o desktop não muda.

---

## 1. (Mobile) Seção "Quanto custa…": menos altura, textos maiores, padding de 60px
Hoje, no mobile, a área das frases ocupa a tela inteira. Ela deve virar um bloco **compacto**: altura do conteúdo, com **60px de padding em cima e embaixo**, frases **maiores**, e continuar com o efeito (as frases trocando ao rolar e a próxima seção subindo por cima no final).

Adicione este CSS **no final do `<style>` do widget HTML da seção** (o que tem `id="os-scrolly"`), sem apagar nada do que já existe:

```css
@media (max-width:767px){
  /* distância de rolagem do efeito no mobile */
  .os-scrolly.is-on{height:300vh;height:300svh}
  /* bloco compacto: altura do conteúdo + 60px em cima e embaixo, centralizado na tela */
  .os-scrolly.is-on .os-scrolly__pin{height:auto;padding:60px 20px;top:calc(50svh - 190px);gap:28px}
  /* frases maiores */
  .os-scrolly__lines p{font-size:clamp(34px,10vw,42px);max-width:11ch;line-height:1.06}
  .os-scrolly__inner{gap:20px}
  /* aviso "Deslize o dedo para cima" logo abaixo das frases, dentro do bloco */
  .os-scrolly.is-on .os-scrolly__hint{position:static;transform:none;gap:8px}
  .os-scrolly__hint p{font-size:14px}
}
```

- Se já existir uma regra antiga de mobile para `.os-scrolly` (ex.: `height:340vh` ou `font-size:clamp(24px,7.4vw,32px)`), **apague a antiga** para não conflitar.
- Confira em 375px e 414px: o bloco fica com cerca de metade da altura da tela, as frases bem maiores, as 3 frases trocam ao rolar e no fim a seção da oferta sobe por cima. Sem rolagem horizontal.

---

## 2. (Mobile) Ícones centralizados e alinhados (sem ficarem "tortos")
Nos **cards** (benefícios e Triplo I) e no **checklist** "Para quem é", os ícones estão desalinhados em relação ao texto. Adicione no Custom CSS da página:

```css
@media (max-width:767px){
  /* cards: ícone centralizado verticalmente com o bloco de texto, e o desenho centralizado dentro do quadrado */
  .os-mcard, .os-mcard .elementor-icon-box-wrapper{align-items:center !important}
  .os-mcard .elementor-icon-box-icon, .os-mcard .elementor-icon{display:grid !important;place-items:center !important;width:44px;height:44px;margin:0 !important;line-height:0}
  .os-mcard svg{display:block;margin:auto}

  /* checklist: check centralizado verticalmente com o texto do item */
  .os-check li{display:flex;align-items:center;gap:14px;padding:14px 0 !important}
  .os-check li::before{position:static !important;flex:none;top:auto}
}
```

- Se o ícone do card estiver dentro de outro elemento (span, div, imagem), aplique o mesmo `display:grid; place-items:center` nele.
- Confira: em todos os cards o ícone fica no meio do quadrado azul-claro e alinhado no centro do texto ao lado; no checklist, cada check fica centralizado em relação ao seu texto (de 1 ou 2 linhas).

---

## 3. Barra do temporizador: texto "Oferta termina em"
A barra está mostrando "Oferta começa em". Ela deve mostrar **sempre "Oferta termina em"**, contando até o **fim da oferta: 28/10/2026 às 23:59:59 (horário de Brasília)**. Depois disso, "Oferta encerrada".

No widget HTML da barra (`class="os-bar"`), substitua **só a função `tick`** do script por esta:

```js
function tick(){
  var now = Date.now();
  var d = Math.max(0, Math.floor((CLOSE - now) / 1000));
  if (d > 0) { lab.textContent = "Oferta termina em"; }
  else { lab.textContent = "Oferta encerrada"; bar.classList.add("is-ended"); }
  H.textContent = p(Math.floor(d / 3600));
  M.textContent = p(Math.floor((d % 3600) / 60));
  S.textContent = p(d % 60);
}
```

- Mantenha `var CLOSE = Date.parse("2026-10-28T23:59:59-03:00");` (a variável `OPEN` pode ficar, não atrapalha).
- No HTML da barra, troque também o texto inicial `Oferta começa em` por `Oferta termina em` (para não piscar o texto antigo ao carregar).
- Confira que a contagem continua mudando a cada segundo e que agora conta até o fim de 28/10.

---

## Entrega
Me mande prints do mobile (375px): a seção "Quanto custa…" (frase 1 e frase 3), os cards com os ícones, o checklist e a barra do temporizador.
