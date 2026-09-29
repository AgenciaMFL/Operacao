# Roteiro: implementar a LP Motolize Franquias no Elementor (a partir do Figma)

Este roteiro é para o Claude Code que tem os MCPs **Figma** e **lp-motolize-com-br-elementor** conectados.

## Objetivo
Recriar a LP do Figma no Elementor de `lp.motolize.com.br` com **tudo editável pelo painel do Elementor**:
- Use só widgets nativos: Container, Heading, Text Editor, Button, Icon, Icon List, Icon Box, Image, Counter, Accordion e Form.
- **Não use** o widget HTML, shortcodes com layout, nem imagens de seções inteiras.
- Cores e fontes entram como **Cores Globais** e **Fontes Globais** do Kit (Configurações do site), nunca como hex solto no widget.
- Layout com **Containers Flexbox** (não use Seção/Coluna antigas) e com versões responsivas: desktop, tablet e mobile.

## Fontes da verdade
| O quê | Onde |
|---|---|
| Arquivo Figma | `C23ByCz4hyo8cvyeKY4CPx` (Agencia-MFL), página **LP MOTOLIZE** `3000:2` |
| Layout desktop (estrutura + copy) | frame `3005:3` "LP Motolize Franquias — Desktop" |
| Design system de cores (**usar este**) | frame `3017:285` + variáveis "Motolize DS / Tokens" |
| Componentes (botão, card, FAQ, campo…) | frame `3004:14` |
| Formulário etapa 2 | `3008:222` · Regras de corte `3008:251` |
| Página Obrigado (aprovado) | `3008:274` |
| Página Agradecimento (não aprovado) | `3008:297` |
| Copy e regras em HTML de referência | `lp-motolize-franquias/index.html`, `obrigado.html`, `agradecimento.html` |

> O frame `3005:3` ainda está com as cores escuras antigas. **A estrutura e a copy vêm dele; as cores vêm do design system `3017:285`.**

## Modo de trabalho: UMA SEÇÃO POR VEZ
- Implemente **somente a seção pedida** na mensagem (ex.: "faça a seção 1 Hero"). Não adiante as próximas.
- Antes de começar, leia no Figma **só o frame daquela seção** (IDs na tabela "Seções no Figma" abaixo).
- Monte a seção na página de rascunho, **acrescentando no fim** da página. Nunca apague nem reescreva seções já aprovadas.
- Ao terminar, mostre um print da seção (desktop e mobile), liste os widgets usados e **pare, esperando aprovação**.
- Ajustes pedidos entram só naquela seção. A próxima só começa quando eu disser.
- A primeira mensagem será "Passo 0 e 1". Faça o reconhecimento, crie o Kit global e a página de rascunho vazia, e pare.

### Seções no Figma (frame de cada uma)
| Ordem | Seção | Node ID |
|---|---|---|
| 1 | Topbar (fixa) | `3005:4` |
| 2 | 1 Hero | `3005:12` |
| 3 | 2 Autoridade e escala | `3005:57` |
| 4 | 3 Oportunidade de mercado | `3005:73` |
| 5 | 4 Como funciona o modelo | `3005:94` |
| 6 | 5 Benefícios da franquia | `3006:59` |
| 7 | 8 Segurança e gestão | `3006:121` |
| 8 | 9 Suporte operacional | `3006:156` |
| 9 | 10 Visita à sede no Tatuapé | `3006:183` |
| 10 | 11 Perfil do investidor | `3006:219` |
| 11 | 14 FAQ | `3007:162` |
| 12 | 15 Formulário de qualificação | `3007:224` (+ etapa 2 `3008:222`, regras `3008:251`) |
| 13 | Rodapé | `3007:264` |
| 14 | Página /obrigado/ | `3008:274` |
| 15 | Página /agradecimento/ | `3008:297` |
| 16 | Pixel + teste final | Passos 5 e 6 |

## Passo 0: reconhecimento (antes de criar qualquer coisa)
1. Liste as ferramentas do MCP do Elementor e confira o que ele permite: criar página, containers e widgets, e editar o Kit global.
2. Confira se o site tem **Elementor Pro**, porque o widget Form depende dele. Se não tiver, pare e avise.
3. No Figma, rode `get_metadata`/`get_design_context` no frame `3005:3` e `get_variable_defs` no `3017:285`.
4. Crie tudo como **rascunho**. Não publique nem altere páginas existentes sem confirmar comigo.

## Passo 1: Kit global
**Cores Globais** (nome → hex):
| Nome | Hex | Uso |
|---|---|---|
| Fundo branco | `#FFFFFF` | seções claras e cards |
| Fundo alternado | `#F6F8F5` | seções claras alternadas |
| Fundo escuro | `#0E110D` | hero, faixa do formulário, rodapé |
| Card escuro | `#1A1E19` | cards e campos no fundo escuro |
| Texto principal | `#0E110D` | títulos no claro |
| Texto secundário | `#454C43` | parágrafos no claro |
| Texto sobre escuro | `#FFFFFF` | títulos no escuro |
| Texto suave sobre escuro | `#B9C1B5` | parágrafos no escuro |
| Verde CTA | `#22B81A` | fundo do botão (texto do botão sempre `#0E110D`) |
| Verde CTA hover | `#1A9514` | hover do botão |
| Verde destaque (claro) | `#167311` | palavras em destaque e links no fundo branco |
| Verde destaque (escuro) | `#4FCF38` | palavras em destaque no fundo escuro |
| Verde suave | `#EEFBEA` | selos e fundo de ícones |
| Borda | `#D9DED6` | bordas de cards e campos |
| Erro | `#E5484D` | validação do formulário |

Nunca use texto branco sobre `#22B81A`: o contraste fica reprovado.

**Fontes Globais:** família **Outfit** (Google Fonts).
- Primária (títulos): Bold 700, H1 56px, H2 42px (mobile 32), H3 20px, entreletra −2%.
- Texto: Regular 400, 17–18px, altura de linha 1,6.
- Destaque/selo: SemiBold 600, 13px, caixa alta, entreletra 14%.

**Botão padrão:** raio 999px, padding 18×34, Bold 16px, caixa alta, fundo "Verde CTA", texto "Texto principal".

## Passo 2: página, seção por seção
Largura do conteúdo: 1180px. Espaço vertical das seções: 96px (mobile 64). Cada seção é **um Container** com o nome da seção no Navigator.

| # | Seção (nome no Figma) | Fundo | Widgets |
|---|---|---|---|
| — | Topbar (fixa) | Fundo branco + borda inferior | Image (logo) + Button "QUERO SER FRANQUEADO". Sticky: topo. |
| 1 | Hero | **Fundo escuro** | Selo (Heading pequeno) · H1 com "frota própria." em Verde destaque (escuro) · Text · Icon List (5 itens com check) · Button · Image (moto) com selo "A partir de R$ 300 mil" |
| 2 | Autoridade e escala | Fundo branco | Selo · H2 · Text · 2× Counter (30 / 1.000+) em cards · Text · Button |
| 3 | Oportunidade de mercado | Fundo alternado | 2 colunas: Selo + H2 + Text · Icon List (4 bullets em cards) |
| 4 | Como funciona o modelo | Fundo branco | Selo · H2 · 5× Icon Box numerados (1–5) · Button |
| 5 | Benefícios da franquia | Fundo alternado | Selo · H2 · 6× Icon Box (grade 3×2) · Button |
| 8 | Segurança e gestão | Fundo branco | Selo · H2 · Text · 3× Icon Box · Button |
| 9 | Suporte operacional | Fundo alternado | 2 colunas: Selo + H2 + Text · 2 cards (Icon List "O que a Motolize administra" / Text "Qual é o papel do franqueado") · frase de fechamento · Button |
| 10 | Visita à sede no Tatuapé | Fundo branco | 2 colunas: Selo + H2 + Text + Icon List + card de endereço + Button + microcopy · 3× Image (placeholders de foto real) |
| 11 | Perfil do investidor | Fundo alternado | 2 colunas: Selo + H2 + Text · card com Icon List (5 itens) · Button |
| 13 | Prova social | — | **Não criar agora** (aguardando depoimentos reais) |
| 14 | FAQ | Fundo branco | Selo · H2 · **Accordion** com as 9 perguntas (a primeira aberta) · Button |
| 15 | Formulário de qualificação | **Fundo escuro** | 2 colunas: Selo + H2 + Text + Icon List · **Form** (ver passo 3) |
| — | Rodapé | **Fundo escuro** | Image (logo) · Text "© 2026 Motolize Locadora de Motos…" |

**Todos os botões** apontam para a âncora `#formulario`, o ID CSS do container do formulário. **Não crie** botão nem link de WhatsApp em nenhum lugar.

A copy é **exatamente** a do Figma e do `index.html`. Não reescreva nem adicione números. O lucro por moto **não** aparece na página.

## Passo 3: formulário (widget Form do Elementor Pro, sem HTML)
- **Etapas:** use o campo tipo **Step** para as duas etapas. Etapa 1 "Dados de contato": Nome completo, E-mail, WhatsApp (tel), todos obrigatórios. Etapa 2 "Perfil de investimento": Cidade (obrigatório) e **Investimento**, um campo Select obrigatório com ID `investimento`.
- **Opções do Select** no formato `rótulo|valor`:
  ```
  De R$ 50 mil a R$ 249 mil|agradecimento
  De R$ 250 mil a R$ 449 mil|obrigado
  Acima de R$ 500 mil|obrigado
  Ainda estou avaliando|agradecimento
  ```
- **Ação Redirecionar:** `https://lp.motolize.com.br/[field id="investimento"]/`. O próprio valor escolhido leva à página certa.
- **Ação Webhook** (CRM): mande tudo para o webhook e, no CRM/automação, filtre para criar lead **só** quando `investimento = obrigado`. O endereço do webhook eu ainda vou passar.
- **Botões:** etapa 1 "CONTINUAR", etapa 2 "QUERO RECEBER O PLANO". A etapa 2 tem o "Voltar".

## Passo 4: páginas de obrigado (rascunhos com slug fixo)
- **`/obrigado/`:** H1 "Obrigado pelo interesse na Motolize!", o texto do Figma, Button "AGENDAR MINHA APRESENTAÇÃO" (âncora `#agenda`) e, abaixo, o container `#agenda` para o calendário. O embed do calendário é a **única** exceção permitida ao widget HTML, porque não existe widget nativo para isso.
- **`/agradecimento/`:** H1 "Agradecemos seu interesse na Motolize!", o texto do Figma e Button "ACOMPANHAR NO INSTAGRAM" → `https://www.instagram.com/motolizelocacoes/` (nova aba).

## Passo 5: Pixel "LP Franquias" (só nestas 3 páginas)
- ID do conjunto de dados: `1835958741094042`. Carregue o pixel **só** na LP, em `/obrigado/` e em `/agradecimento/`, por meio de Custom Code do Elementor com condição de exibição ou de plugin de pixel com regra por página. Nunca carregue no site inteiro.
- Eventos: `PageView` nas três páginas, `Lead` ao carregar `/obrigado/` e `trackCustom('LeadNaoQualificado')` ao carregar `/agradecimento/`.
- **O token da API de Conversões nunca vai para a página.** Ele só serve do lado do servidor.

## Passo 6: conferência final
1. Tire um print da página no Elementor (desktop e mobile) e compare com o Figma `3005:3`.
2. Confirme que nenhum widget HTML foi usado fora do calendário.
3. Teste o formulário com uma faixa aprovada e uma reprovada, conferindo cada redirecionamento.
4. Me mostre os links de pré-visualização **antes** de publicar.
