# Plano — automatizar a abertura de unidades Sbelt Laser

Objetivo: abrir a unidade nº 100 com o mesmo esforço da nº 3 — preencher um formulário
e esperar o relatório. Proposto em 14/10/2026; status de cada fase no fim.

## Divisão de papéis

| Peça | Papel | Por quê |
|---|---|---|
| **WordPress** | continua rodando o funil (lead → Spa, agendamento → Spa, páginas) e guarda o **cadastro de unidades** | já funciona; não mexer no que está em produção além do necessário |
| **n8n** | **orquestra a abertura** de unidade e **vigia** se tudo chega na Spa | bom para formulários, e-mail, chamadas de API em sequência e alertas |
| **GHL** | Snapshot com o modelo da unidade + Custom Values por conta | API do GHL **não cria workflows nem formulários**; só Snapshot copia isso |
| **Spa Solutions** | franquiaId e agenda de avaliação | **sem API para isso** — continua sendo pedido ao TI (o n8n manda o e-mail) |

## O que sobra de manual por unidade (mínimo possível)

1. No GHL da unidade: importar o Snapshot e gerar o Private Integration Token (sem API para gerar token).
2. Resposta do TI da Spa com o franquiaId e a agenda configurada.
3. Preencher o formulário "Nova unidade" do n8n.

Todo o resto é automático.

---

## Fase 0 — Deixar o PHP à prova de erro (pré-requisito)

- Ler **Custom Data + dados padrão** do GHL juntos (hoje, Custom Data incompleto = 400; foi o bug da Pátio).
- Validar `franquiaId` contra o cadastro de unidades.
- Token da Spa em cache por 25 min (hoje 38; o token vale 30).
- Guardar a mensagem de erro da Spa (hoje vira `null`).
- Dedup de lead por telefone **por unidade**.

## Fase 1 — Cadastro de unidades no WordPress

- Tela **"Unidades Sbelt"** no painel (franquiaId, nome, Location ID, Calendar ID, token, endereço, ativa).
  Substitui `SBELT_UNIDADES` no código e o mapa `CALENDARIOS_POR_UNIDADE` do `/sucesso/`.
- Rota autenticada (Application Password do WordPress) para o n8n **criar/atualizar** unidade.
- `/sucesso/` pergunta ao WordPress o calendário da unidade; bloqueio de duplicado vale para todas.
- `/obrigado/` recebe `franquiaId` e consulta **só** a unidade certa (hoje percorre todas — com 100 unidades seriam 100 chamadas por visita).

## Fase 2 — Modelo no GHL (Snapshot)

- Partir da sub-conta da Pátio Alcântara.
- Trocar valores fixos por **Custom Values**: `franquia_id`, `endereco_unidade`.
  - Workflows: Custom Data `franquiaId = {{custom_values.franquia_id}}` + os demais campos (README §3.3).
  - Redirect do formulário e do calendário: `&franquiaId={{custom_values.franquia_id}}`
    (**testar** se o GHL resolve Custom Value nesse campo; plano B: `{{location.id}}` e o WordPress acha a unidade pelo Location ID).
- Gerar o Snapshot e o **link de compartilhamento** (funciona para GHLs de outras agências).

## Fase 3 — n8n: fluxo "Nova unidade"

Gatilho: **formulário do n8n** com nome, cidade, endereço, franquiaId (se já tiver), Location ID e token.

1. Valida o token no GHL (`GET /locations/{id}`).
2. Acha o calendário criado pelo Snapshot (`GET /calendars?locationId=`) e pega o Calendar ID.
3. Grava os Custom Values (`franquia_id`, `endereco_unidade`) na conta da unidade.
4. Ajusta o calendário (fuso São Paulo, 15/15 min, vagas por horário) via API.
5. Cadastra/atualiza a unidade no WordPress (rota da Fase 1).
6. Sem franquiaId? Envia o e-mail-modelo ao TI da Spa e fica aguardando; quando chegar, retoma do passo 3.
7. Teste ponta a ponta: cria contato e agendamento de teste via API do GHL → confere na Spa
   (`ListarAgendamentosAvaliacao`) → apaga o teste no GHL e na Spa.
8. Manda o relatório (e-mail/WhatsApp/Slack): "Unidade X pronta" ou o que falhou.

## Fase 4 — n8n: vigia diário (substitui a tela "Reprocessar Spa")

- Todo dia (ou a cada hora), para cada unidade ativa: compara agendamentos do calendário GHL com as
  avaliações da Spa (mesma lógica da tela de reprocessar).
- Pendentes → reenvia automaticamente; se a Spa recusar (400 de agenda), avisa com nome, horário e motivo.
- Também detecta workflow parado (nenhum lead em X horas numa unidade que costuma receber).

## Decisões em aberto

1. n8n: já existe (cloud ou servidor próprio)? Senão, n8n Cloud ou instalar num servidor.
2. Acesso ao GHL das unidades: agência própria (sub-contas) ou GHLs de terceiros (link de Snapshot)?
3. Onde chega o relatório/alerta: e-mail, WhatsApp ou Slack?

## Status

| Fase | Status |
|---|---|
| 0 — PHP à prova de erro | a fazer |
| 1 — Cadastro de unidades no WordPress | a fazer |
| 2 — Snapshot no GHL | a fazer |
| 3 — n8n "Nova unidade" | a fazer (depende de 1 e 2) |
| 4 — n8n vigia diário | a fazer (depende de 1) |
