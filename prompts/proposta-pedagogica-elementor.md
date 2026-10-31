# Prompt — Página "Proposta Pedagógica" (Elementor)

Implemente a página "PROPOSTA PEDAGÓGICA" da Hebraica School no Elementor. Siga o CLAUDE.md
(tokens, cores/fontes globais, .hs-btn, header/footer e template "CTA Agende sua visita").

## Figma
https://www.figma.com/design/C23ByCz4hyo8cvyeKY4CPx/Agencia-MFL?node-id=3746-9858
Nós das seções (use get_design_context em cada um, não no frame inteiro):
- 3784:31  Hero
- 3784:54  A criança como sujeito ativo
- 3799:39  Como aprendemos (foto + 4 cards com ícones — cards: 3803:168)
- 3784:94  A importância do brincar
- 3784:104 Desenvolvimento integral (5 cards — 3789:34)
- 3784:128 Aprender a conviver
- 3784:136 Convite à visita (usar o frame 3894:633)
IGNORE todas as camadas com hidden="true" (há várias versões antigas escondidas, inclusive
o menu 3784:15, o frame 3789:11 e o 3784:112). O menu visível é o 3915:600 = header da Home.
Baixe as imagens e os 4 ícones SVG direto do Figma (download_assets), imagens em webp,
suba na Biblioteca de Mídia e use ESSES arquivos. Uma vez cada.

## Seções (em ordem)
1. HERO: foto full-width (menina com lupa e folha) com degradê navy à esquerda.
   Tag "PROPOSTA PEDAGÓGICA", H1 "A importância do brincar na Educação Infantil.",
   texto, botão cyan "Agende uma visita".
2. NOSSA CONCEPÇÃO (branco): tag, título "Cada criança, protagonista do próprio aprender.",
   1º parágrafo em navy (destaque), 2º em muted; imagem arredondada à direita.
3. COMO APRENDEMOS (navy): foto vertical arredondada à esquerda; à direita tag "COMO APRENDEMOS",
   título "Conhecimento que nasce das relações.", texto e grid 2×2 de cards (navy um pouco mais claro,
   cantos arredondados) com título + ícone SVG em quadrado à direita + descrição:
   Cooperação e respeito / Protagonismo e múltiplas linguagens / Escuta e documentação /
   O espaço como educador. Salvar o card como componente reutilizável.
4. A IMPORTÂNCIA DO BRINCAR (branco): composição de 2 fotos sobrepostas à esquerda
   (a menor no canto inferior direito, com borda branca); à direita tag, título
   "Brincar é uma forma de conhecer o mundo.", 2 parágrafos, botão cyan "Venha conhecer a escola".
5. DESENVOLVIMENTO INTEGRAL (fundo ice claro): tag e título centralizados
   "Uma experiência essencial para aprender e crescer.", 2 parágrafos centrais e 5 cards brancos
   em linha: 01 Cognitivas, 02 Motoras, 03 Linguísticas, 04 Sociais, 05 Emocionais
   (número cyan pequeno, título navy, descrição muted). Tablet: 3+2; mobile: 1 por linha ou carrossel.
6. APRENDER A CONVIVER (branco): tag "DESCOBERTAS QUE LEVAMOS PARA A VIDA",
   título "Aprender a conviver, uma descoberta de cada vez.", parágrafo destaque + parágrafo muted,
   imagem arredondada à direita.
7. AGENDE SUA VISITA: inserir o template "CTA Agende sua visita" trocando só a foto pela deste Figma.
   (Se o template ainda não existir, crie-o agora e salve como reutilizável.)
8. FOOTER: o global.

## Regras
- Containers Flexbox, cores/fontes globais, botões .hs-btn com o hover já definido.
- Animações de entrada suaves como na Home; cards com entrada escalonada (100ms entre eles)
  e hover leve (sobe 4px + sombra).
- Responsivo desktop/tablet/mobile. Textos exatamente como no Figma.

## Entrega
- Publicar a página (slug /proposta-pedagogica) via API, ou gerar elementor/proposta-pedagogica.json.
- Atualizar o CLAUDE.md. Commit + push. Responder só com o resumo.
