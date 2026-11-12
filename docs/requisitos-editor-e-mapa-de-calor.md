# Requisitos: novo editor (estilo Elementor) e mapa de calor das propostas

Anotado em 12/11/2026, a partir do pedido do Felipe.

## 1. Editor reorganizado no estilo do painel do Elementor

**Problema hoje:** o painel é uma coluna longa com os grupos 1 a 9 um embaixo do outro. Fica difícil achar o que editar e ver o que falta.

**Referência:** painel lateral do Elementor: fundo escuro, abas no topo, busca, blocos em grade com ícone e nome, e cada bloco abre as próprias opções.

### Estrutura do painel
- Painel escuro à esquerda (cerca de 340 px) e a pré-visualização da proposta à direita, como hoje.
- Topo do painel: logo, nome do cliente e status (rascunho, publicada, alterações não publicadas).
- Três abas no topo:
  - **Blocos:** grade de blocos editáveis (ver abaixo).
  - **Proposta:** dados gerais (cliente, data, validade, responsável).
  - **Mapa de calor:** acompanhamento das propostas enviadas (seção 2).
- Campo **Buscar** que filtra blocos e campos (ex.: digitar "verba" leva ao campo de anúncios).

### Blocos (grade de cartões com ícone, como os widgets do Elementor)
Agrupados em categorias que abrem e fecham:
- **Essenciais:** Cliente, Modelo, Investimento.
- **Conteúdo:** Público, Escopo do Inbound, CRM, Condições, Vídeo e depoimentos.
- **Avançado:** Capa, Responsável (botão de aprovar).

Cada cartão mostra um selo de status: completo (verde) ou falta preencher (laranja). Isso substitui a caixa amarela "Falta preencher".

### Comportamento
- Clicar num bloco abre a tela de opções dele no próprio painel, com **← Voltar** pra grade, como no Elementor.
- Ao abrir um bloco, a pré-visualização rola até a seção correspondente e destaca ela.
- Clicar numa seção da pré-visualização abre o bloco dela no painel.
- Blocos que não se aplicam ao modelo escolhido ficam ocultos ou desativados (ex.: Escopo do Inbound no modelo 2).
- Rodapé fixo do painel: **Publicar** (principal), Computador / Celular e PDF.
- Ações secundárias (Nova, Duplicar, Importar, Baixar .json) num menu "⋯".
- Funcionar também em tela menor (notebook de 13").

## 2. Mapa de calor e acompanhamento de cada proposta

**Objetivo:** dentro do editor, ver todas as propostas enviadas e, pra cada uma, se o cliente abriu, como navegou, um relatório e o mapa de calor.

### Sobre a API do Microsoft Clarity
A API do Clarity (Data Export API) não atende:
- só devolve números agregados (sessões, rolagem, tempo, cliques de raiva etc.);
- só cobre os últimos 1 a 3 dias;
- tem limite de 10 consultas por dia por projeto;
- **não dá acesso a mapas de calor nem a gravações**;
- não filtra por página (no máximo agrupa por URL, até 1.000 linhas).

O Clarity continua útil em paralelo, pela tela dele, pra visão geral do site.

**Decisão:** construir o nosso, gratuito, rodando na própria Hostinger (PHP + arquivos, sem banco).

### Aba "Mapa de calor" no editor
**Lista de propostas enviadas**, com:
- cliente;
- data de publicação;
- nº de aberturas e última abertura;
- tempo total de leitura;
- até onde rolou (%);
- se clicou em **Aprovar**;
- status: não aberta / aberta / muito engajada.

Ordenação por mais recentes, busca por cliente e filtro por status.

**Ao abrir uma proposta:**
- **Relatório:**
  - aberturas por dia e por aparelho (computador/celular);
  - tempo em cada seção;
  - seções vistas e não vistas;
  - abas da Solução abertas;
  - vídeo assistido;
  - cliques em Aprovar, WhatsApp e PDF.
- **Mapa de calor de cliques e de rolagem**, desenhado por cima da própria proposta, separado por computador e celular.
- **Gravações das visitas (replay):** assistir a navegação do cliente, com lista de visitas por data e aparelho.

### Como será feito (técnico)
- Um script leve na página da proposta registra os eventos e envia em lotes pra `api/evento.php`:
  - aberturas;
  - rolagem;
  - tempo por seção;
  - cliques, com posição relativa à seção, pra funcionar em qualquer tamanho de tela.
- Os dados ficam em `dados/` por proposta, protegidos como as propostas.
- Gravação das visitas com **rrweb** (biblioteca aberta e gratuita), salva compactada por visita.
- O mapa de calor é desenhado em canvas por cima da pré-visualização da proposta.
- Não contam:
  - visitas do comercial logado;
  - a pré-visualização do editor (`?preview=1`).
- Campos digitáveis mascarados na gravação.
- Guardar por 90 dias, configurável.
- **LGPD:** aviso curto de privacidade na proposta, informando a coleta de dados de navegação pra melhorar o atendimento.

### Opcional (depois)
- Avisar o comercial quando o cliente abrir a proposta (e-mail ou WhatsApp).
- Pontuação de interesse por proposta (aberturas + tempo + seções-chave como Investimento).

## Ordem sugerida
1. Rastreamento + lista de propostas com o relatório básico (aberturas, tempo, rolagem, Aprovar).
2. Mapa de calor de cliques e rolagem.
3. Gravações das visitas (replay).
4. Novo editor estilo Elementor.

(A ordem pode inverter: o editor novo não depende do mapa de calor.)

## Decisões (12/11/2026)
- Começar pelo **editor novo** (estilo Elementor).
- Mapa de calor: fazer **tudo**, inclusive relatório, mapa de cliques e rolagem e **gravações das visitas**.
- **Aviso por e-mail quando o cliente abrir a proposta:** sim, para felipepessoa@agenciamfl.com.br. Via `mail()` do PHP da Hostinger, ou SMTP da conta de e-mail, se o `mail()` cair no spam.
