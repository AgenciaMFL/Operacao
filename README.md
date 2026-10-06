# Proposta comercial MFL Sales

Proposta em formato de site. A capa mostra o nome do cliente e o botão **Abrir proposta**, que revela a proposta completa. O visual fica fixo; **todo o conteúdo** (cliente, seções, textos, valores, condições, responsável) vem de um arquivo `.json` por proposta, editado por um formulário.

## Estrutura

```
index.html                 → a proposta (o que o cliente vê)
editor.html                → gerador de propostas (painel do comercial)
propostas/
  padrao.json              → proposta padrão do gerador (ponto de partida)
depoimentos/catalogo.json  → biblioteca de vídeos de depoimento (todas as propostas usam)
assets/img                 → logo, ícone, avatares da capa e fundo da abertura (hero-fundo.webp)
assets/video               → vídeo de fundo da capa (MP4 + WebM) e imagem de espera
assets/css, assets/js      → visual e lógica (não precisa mexer)
```

## O padrão de proposta MFL Sales

A proposta segue a especificação do **Gerador de Propostas MFL Sales**: o conteúdo é montado a partir de poucas escolhas, e os textos mudam conforme elas.

| Escolha | Opções |
| --- | --- |
| Modelo | 1 · Inbound · 2 · Outbound com BDR + SDR · 3 · Outbound com Treinamento · 4 · Inbound + Outbound |
| Outbound do modelo 4 | BDR + SDR ou Treinamento |
| Público do Inbound | B2B (funil termina em reunião agendada) ou B2C (termina em proposta, pedido ou negociação) |
| Escopo do Inbound | Meta Ads, Google Ads, Landing Page, WhatsApp, Remarketing, criativos, roteiro de atendimento, relatório mensal |
| CRM | CRM MFL Sales (serviço separado) ou CRM do cliente |
| Valores | Inbound, Outbound, Plano 2, CRM (R$/mês), contrato mínimo, anúncios sugerido (R$/dia), condições adicionais |

Estrutura de site: **Capa** (layout do Figma) → **Abertura** (layout do Figma com o microfone MFL ao fundo: selo, nome do cliente, título, frentes do modelo, site e Instagram) → **Números da MFL** → **Por que a MFL Sales** → **Como funciona** (4 etapas) → **Solução em abas** (Inbound · Outbound · Tecnologia, só as frentes do modelo) → **Resultados** (vídeo + depoimentos) → **Investimento** → **Próximos passos** → **Dúvidas frequentes** → **Fechamento** com o botão de aprovação → rodapé (com Salvar em PDF). Não há menu: só uma linha fina de progresso de leitura no topo. Campos ainda vazios aparecem em laranja (`[Nome do cliente]`, `R$ [valor]/mês`).

## Como o comercial cria uma proposta

1. Abra `editor.html` (o gerador). O painel à esquerda tem os grupos 1 a 9: cliente, modelo, público, escopo, CRM, investimento, condições, vídeo e responsável. A caixa amarela **Falta preencher** mostra o que ainda falta.
2. Confira com **Ver capa** e **Celular**.
3. **Exportar PDF** abre a impressão da proposta (Salvar como PDF, A4, margens Nenhuma, gráficos de plano de fundo ligados).
4. **Baixar .json** e coloque o arquivo em `propostas/`. Envie o link: `https://SEU-DOMINIO/index.html?p=nome-do-arquivo`

## Vídeos de depoimento

A biblioteca fica em `depoimentos/catalogo.json`. Cada depoimento tem cliente, pessoa, cargo, **segmento**, resultado em destaque, uma frase e o **vídeo**: link do YouTube, do Vimeo ou um arquivo `.mp4` colocado na pasta `depoimentos/`. No YouTube a imagem de capa é gerada sozinha; para os outros, preencha `capa` com uma imagem.

No gerador, em **8 · Vídeo de prova social**, o comercial informa o vídeo principal (link + imagem de capa) e marca outros depoimentos da biblioteca, filtrando por segmento ou clicando em **Sugerir pelo segmento** (usa o campo Segmento do cliente). Sem nenhum vídeo marcado, a seção não aparece. Para o cliente, cada cartão abre o vídeo num player na própria página.

Os itens marcados como **EXEMPLO** no catálogo são espaços reservados: troque pelos depoimentos reais.

## Publicação

Site estático, sem build: GitHub Pages, Netlify ou Vercel servem. Precisa ser aberto por um servidor (não funciona com `file://`).

```bash
python3 -m http.server 8000
# http://localhost:8000/index.html?p=padrao
# http://localhost:8000/editor.html
```

> Quem tiver o link consegue abrir a proposta. Use nomes de arquivo difíceis de adivinhar se não quiser que propostas sejam encontradas por tentativa.
