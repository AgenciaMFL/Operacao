# Sbelt Laser — Integração GHL + WordPress + Spa Solutions

Documento principal do projeto (versão 5, atualizada em 14/10/2026). Substitui o
`resumo-projeto-sbelt-laser-v4.md` do pacote zip. Onde algo não foi confirmado,
está marcado como **a confirmar**.

> **Credenciais não ficam neste repositório.** Senha da API da Spa Solutions,
> tokens `pit-` do GHL e a chave da rota `/debug` só existem no snippet que roda
> no WordPress. A cópia em `codigo/integracao-spa-solutions.php` está com esses
> valores trocados por `COLE_AQUI_*`.

---

## 1. Como o funil funciona

```
1. Lead preenche o formulário do GHL da unidade
   → Workflow "Lead Cadastrado - Sbelt <unidade>" → Webhook POST /wp-json/leads/v1/ghl-lead
   → PHP cadastra/atualiza o lead na Spa Solutions (POST /api/Lead)
   → PHP grava "Status Integração Spa" no contato do GHL (só onde o token tem contacts.write)
2. Formulário redireciona para /sucesso/?...&franquiaId=X
   → bloqueio de duplicado: consulta /ja-agendou (Imperatriz e Pátio Alcântara)
   → avisa os GTM (evento lead_cadastrado) e redireciona (página inteira) pro widget do calendário
3. Lead escolhe o horário no calendário do GHL
   → Workflow "Agendamento Confirmado - Sbelt <unidade>" → Webhook POST /wp-json/leads/v1/ghl-agendamento
   → PHP agenda a avaliação na Spa (POST /api/SessaoAvaliacao/SalvarSessaoAvaliacao)
   → marca o telefone como "já agendou" (90 dias, por unidade) e atualiza o status no GHL
4. Calendário redireciona para /obrigado/?first_name=...&contact_id=...(&franquiaId=10)
   → a página busca data/hora e endereço em /proxima-consulta e avisa os GTM (agendamento_confirmado)
```

A unidade é decidida **só pelo `franquiaId`** que vem no Custom Data dos webhooks
e na URL do `/sucesso/`. O PHP não fixa unidade nenhuma no envio para a Spa.

---

## 2. Unidades

| franquiaId | Unidade | GHL Location ID | GHL Calendar ID | GTM próprio |
|---|---|---|---|---|
| **9** | Imperatriz | `qj2BSucIGAVOYtqGSRAL` | `QNYwNncYrOsRIpy9GU7B` | — |
| **10** | Pátio Alcântara | `E0WCDN9MyksqIgQyNX70` | `HQW8VN5uNrB0bqTxzbep` | `GTM-56846GTT` |

- Imperatriz: R Coronel Mário Andreazza, 379 — Loja 02 e 03 — Imperatriz, MA (DDD 99)
- Pátio Alcântara: Praça Carlos Gianelli, S/N — Loja 317 — Alcântara, São Gonçalo/RJ — CEP 24710-465 (DDD 21)
- `GTM-WGCH58VW`: GTM que já existia no `/sucesso/` e `/obrigado/`. **A confirmar** se é geral do site ou da Imperatriz.
- `franquiaId 10` = Pátio Alcântara: na prática funciona (leads e agendamentos chegam na unidade
  "SBELT LASER - PATIO ALCANTARA" do painel da Spa), mas nunca foi confirmado por escrito com o TI.

---

## 3. GHL — configuração por unidade

### 3.1 Calendários

| Item | Imperatriz | Pátio Alcântara |
|---|---|---|
| Nome | Avaliação Comercial - Sbelt Imperatriz2 | Avaliação Comercial - Sbelt Pátio Alcântara |
| Tipo / equipe | Round Robin, 4 usuários "Sala 1..4 Avaliação" | 1 usuário (Paulo Lacerda) |
| Vagas por horário | 4 (uma por sala) | 4 via Booking rules → **Maximum bookings per slot = 4** |
| Duração / intervalo | 15 / 15 min | 15 / 15 min |
| Fuso | America/Sao_Paulo | America/Sao_Paulo (**estava Los_Angeles**, corrigido em 05/10) |
| Dias | Weekly hours seg–sex 08:00–17:00 em cada sala | Weekly hours **todos desligados**; só Date-specific hours |
| Datas especiais | **12/10/2026 Unavailable** nas 4 salas (feriado) | **21, 22, 23, 24 e 26/10/2026, 09:00–21:00** (25 fechado) |
| Date range | 8 dias rolantes (hoje = dia 1) | vazio (sem limite; quem limita são as datas específicas) |
| Redirect da confirmação | `/obrigado/?first_name={{contact.first_name}}&contact_id={{contact.id}}` | o mesmo + `&franquiaId=10` (**a confirmar** se foi salvo) |

Observações:
- A disponibilidade da Pátio fica no **schedule do usuário** (Availability → Paulo Lacerda → Edit).
  Se o Paulo entrar em outro calendário, mudar o schedule afeta os dois.
- Sala 3 da Imperatriz tinha uma data especial errada (**1–5/09/2027**, sobra da inauguração
  30/09–05/10/2026). Orientado a apagar — **a confirmar**.
- Pátio usa 1 usuário com 4 vagas por horário: **a confirmar** com 2 agendamentos no mesmo horário
  que o GHL não trava pela agenda do Paulo.
- Para fechar/abrir um dia: Date-specific hours → "+ Add date specific hours" → escolher a data →
  lixeira no intervalo (= Unavailable) ou definir o horário → Submit. No Round Robin, **em cada sala**.

### 3.2 Formulários (Settings → On Submit → Redirect)

- Imperatriz: `https://sbeltlaser.com.br/sucesso/?first_name={{contact.first_name}}&telefone={{contact.phone}}&email={{contact.email}}&contact_id={{contact.id}}&franquiaId=9`
- Pátio Alcântara: `https://sbeltlaser.com.br/sucesso/?first_name={{contact.first_name}}&telefone={{contact.phone}}&email={{contact.email}}&franquiaId=10`

Sem `franquiaId` o `/sucesso/` mostra erro de propósito.

### 3.3 Workflows — Custom Data obrigatório

**Versão 5 do PHP (20/10):** o PHP lê o Custom Data **e** os dados padrão que o GHL sempre manda
(nome, telefone, e-mail, contact_id, horário do agendamento e Location ID). Campo que faltar no Custom
Data é preenchido pelos dados padrão, e a unidade é descoberta pelo Location ID se o `franquiaId` faltar.
**Até a v4** o PHP lia só o Custom Data, e Custom Data incompleto = 400 (foi o que quebrou a Pátio
até 14/10 no agendamento e até 20/10 no lead). Mesmo assim, manter o Custom Data completo abaixo.

**"Lead Cadastrado - Sbelt <unidade>"** → Webhook POST `https://sbeltlaser.com.br/wp-json/leads/v1/ghl-lead`

| Chave | Valor | Obrigatório |
|---|---|---|
| `nome` | Contact.Full Name | sim |
| `telefone` | Contact.Phone | sim |
| `email` | Contact.Email | não |
| `midia` | igual ao workflow da Imperatriz | não (vira "outros") |
| `franquiaId` | 9 ou 10 | sim (sem ele vai FranquiaId 0) |
| `contact_id` | Contact.ID | não (necessário pra escrita de volta no GHL) |

**"Agendamento Confirmado - Sbelt <unidade>"** → trigger Customer Booked Appointment, filtro "In calendar"
= calendário da unidade → Webhook POST `https://sbeltlaser.com.br/wp-json/leads/v1/ghl-agendamento`

| Chave | Valor | Obrigatório |
|---|---|---|
| `franquiaId` | 9 ou 10 | sim |
| `nome` | Contact.Full Name | não |
| `telefone` | Contact.Phone | sim |
| `email` | Contact.Email | não |
| `contact_id` | Contact.ID | não |
| `datahorainicio` | Appointment.Start Date Time | sim |
| `datahorafim` | Appointment.End Date Time | não (PHP calcula +15 min) |

Configuração da Pátio confirmada por print em 14/10 (agendamento). **Em 20/10 o `/debug` mostrou que o
"Lead Cadastrado - Pátio Alcântara" ainda manda só `franquiaId`** → todo lead da Pátio é recusado (400)
antes de ir para a Spa; só chega quem agenda (via cadastro de emergência do webhook de agendamento).

Workflows precisam estar **Published** — em Draft nada dispara, nem com "Run test".

### 3.4 Private Integration Tokens (um por sub-conta)

- Imperatriz: `calendars.readonly`, `calendars/events.readonly`, `contacts.readonly`, `contacts.write`
- Pátio Alcântara: só leitura (**sem `contacts.write`** → escrita de volta no contato não funciona,
  e tags via API também não)

### 3.5 Lendo os Execution logs do GHL

- Workflow → **Execution logs** → linha "Webhook" → **View details** mostra a resposta do WordPress.
- "This execution is from an older version of the workflow" = rodou antes da última alteração salva.
- Resposta 5xx do WordPress → o GHL marca **Retry** e tenta de novo sozinho. 4xx → Failed direto.
- O ícone de seta na coluna Actions **não reexecuta**: só abre a configuração da ação naquela versão.
  O GHL não tem botão de reenviar — por isso existe a tela "Reprocessar Spa" (seção 5.3).

---

## 4. Spa Solutions

### 4.1 Painel
- Leads da integração ficam em **Comercial → Leads** (filtro de data, status e unidade no topo).
  A tela **Clientes** só tem quem comprou — é normal estar vazia para leads novos.
- Unidade é escolhida no seletor do topo ("SBELT LASER - PATIO ALCANTARA").
- Lead criado pela integração aparece com Origem "Online", Cadastrado por "Api".

### 4.2 API (manual "Integração Spa Solutions - Leads e Avaliação", 24 págs.)

Base: `http://sbeltapi.spasolutions.com.br` (http, não https). Login `Sbelt`.

| Endpoint | Uso |
|---|---|
| `POST /api/Login/Validar` | token JWT em texto puro, **válido 30 min**, sem refresh |
| `POST /api/Lead` | cadastra lead (Nome, Telefone, Origem e FranquiaId obrigatórios); 201 |
| `PUT /api/Lead/{id}` | atualização parcial; 200 corpo vazio |
| `GET /api/Lead/{id}` | lead completo (inclui Status) |
| `DELETE /api/Lead/{id}/{franquiaId}` | exclui lead |
| `POST /api/SessaoAvaliacao/BuscarHorarioDisponiveis` | horários livres da agenda de avaliação |
| `POST /api/SessaoAvaliacao/SalvarSessaoAvaliacao` | agenda avaliação (15 min) → lead vira "Agendado" |
| `POST /api/SessaoAvaliacao/ConfirmarAgendamento` | status "Confirmado" |
| `POST /api/SessaoAvaliacao/ReagendarAgendamento` | muda data/hora |
| `GET /api/SessaoAvaliacao/GetSessaoAvaliacaoDetalhes/{id}` | detalhes da sessão |
| `POST /api/SessaoAvaliacao/ListarAgendamentosAvaliacao` | **lista avaliações da franquia num período** (nome, telefone, data, status) |
| `POST /api/SessaoAvaliacao/ListarAgendamentosAvaliacaoLead` | avaliações de um lead (telefone + e-mail exatos) |
| `POST /api/SessaoAvaliacao/CancelarSessaoAvaliacao` | cancela avaliação |
| `POST /api/clientes/BuscarClientePorTelefone` | diz se o telefone já é **cliente** (comparação exata) |
| `/api/evento/SalvarSessao`, `AtualizarStatus`, `Reagendar` | sessões de clientes — **"em desenvolvimento"** |

- Status de lead: Novo, EmAndamento, LigarNovamente, NaoAtendeu, Agendado, Confirmado, Compareceu, Convertido.
- **Não existe webhook** e **não existe endpoint para listar sessões de depilação**.
- Erros de agenda vêm como **400 em texto puro**: "Unidade fechada no dia", "fora do horário de
  funcionamento", "agenda sem horário configurado", "Horário Indisponível para agendamento!".
  Erros de "agenda de avaliação não configurada" / "Colaborador da API não configurado" vêm como 404.

---

## 5. WordPress

### 5.1 Snippets (Code Snippets)

| Snippet | Arquivo de referência | Status |
|---|---|---|
| Integração principal (um único snippet para todas as unidades) | `codigo/integracao-spa-solutions.php` (sem credenciais) | produção |
| Conferência Spa (só admin + verificação automática) | `codigo/snippet-conferencia-spa.php` | entregue em 20/10; substitui o "Reprocessar Spa (temporário)" — **a confirmar** instalação. Precisa "Run snippet everywhere" |
| GTM só na landing da Pátio | `codigo/snippet-gtm-landing-patio.php` | entregue; **a confirmar** se instalado |

Regras: ao recolar o snippet principal, **desativar o antigo antes** (duas cópias = erro fatal
"Cannot redeclare function"). Para mudanças pequenas, **editar o snippet existente** em vez de colar outro.

### 5.2 Rotas (`/wp-json/leads/v1/`)

| Rota | Método | Quem chama |
|---|---|---|
| `/ghl-lead` | POST | workflow Lead Cadastrado |
| `/ghl-agendamento` | POST | workflow Agendamento Confirmado |
| `/proxima-consulta?contact_id=` | GET | página `/obrigado/` |
| `/ja-agendou?telefone=&franquia_id=` | GET | página `/sucesso/` |
| `/agendamento-info?telefone=` | GET | sem uso |
| `/debug?chave=...` | GET | temporária — último lead, último resultado da Spa, última consulta de calendário |

### 5.3 Tela "Conferência Spa" (Ferramentas → Conferência Spa)

Cruza o calendário do GHL da unidade (−30/+90 dias, sem cancelados) com as avaliações da Spa e classifica:

| Situação | Critério | O que fazer |
|---|---|---|
| **JÁ NA SPA** | últimos 8 dígitos do telefone batem | nada |
| **JÁ NA SPA (pelo nome)** | telefone diferente, nome bate (inteiro ou primeiro + último, sem acento) | conferir na Spa; normalmente cadastrado à mão → marcar como resolvido |
| **IGNORADO** | marcado na tela como "resolvido à mão" | nada (pode desfazer) |
| **NÃO TEM AINDA** | nenhum dos anteriores | enviar pela tela (simular antes; até 10 por vez) |

**Verificação automática** (liga na própria tela, com e-mail de aviso): de hora em hora, para todas as
unidades, olha só agendamentos **novos** (quem já estava pendente ao ligar fica de fora), espera 1 hora pelo
webhook normal e, se a pessoa continuar "NÃO TEM AINDA" e o horário for futuro, envia pela mesma rota do
webhook. Cada pessoa é tentada uma vez; enviados e recusas (com o motivo da Spa) vão por e-mail.
Testes: `testes/teste-conferencia.php`.

### 5.4 Páginas (Elementor, bloco HTML)

| Página | Arquivo | O que faz |
|---|---|---|
| `/sucesso/` | `codigo/sucesso.html` | mapa franquiaId → calendário; tira o +55; bloqueio de duplicado (9 e 10); 2 GTM; evento `lead_cadastrado`; espera o GTM até 1,5 s e redireciona |
| `/obrigado/` | `codigo/obrigado.html` | comprovante; busca data/endereço em `/proxima-consulta` (4 tentativas); 2 GTM; evento `agendamento_confirmado` |

**A confirmar**: se a versão final do `sucesso.html` (com bloqueio para a unidade 10) foi colada.

---

## 6. Google Tag Manager

- Os dois containers (`GTM-WGCH58VW` e `GTM-56846GTT`) carregam **sempre** no `/sucesso/` e no `/obrigado/`
  (as páginas são compartilhadas pelas unidades).
- As páginas avisam a unidade pelo dataLayer:
  - início da página: `{ franquiaId }` (se vier na URL)
  - `/sucesso/`: `{ event: 'lead_cadastrado', franquiaId, unidade }`
  - `/obrigado/`: `{ event: 'agendamento_confirmado', franquiaId, unidade }`
- **A fazer em cada GTM**: variável Data Layer `franquiaId`; acionadores Custom Event `lead_cadastrado`
  e `agendamento_confirmado` com filtro `franquiaId` = 10 (Pátio) ou 9 (Imperatriz/sem filtro se geral);
  usar esses acionadores nas tags de conversão em vez de Page View.
- O widget do calendário é domínio do GHL — não recebe GTM pelo WordPress.

---

## 7. Problemas no PHP

**Corrigidos na versão 5** (`codigo/integracao-spa-solutions.php`, testes em `testes/teste-integracao.php`;
**a confirmar** se já foi colada no WordPress):
- Token da Spa em cache por 25 min (vale 30) e retry com token novo também no agendamento e na busca de
  horários (antes: falha entre o min 30 e 38 — caso Nathália, 20/10, que só passou na nova tentativa do GHL).
- Custom Data incompleto não derruba mais o webhook (usa os dados padrão do GHL; unidade pelo Location ID).
- Data/hora normalizada para `Y-m-d H:i:s` (Brasília), aceitando qualquer formato do GHL.
- Mensagem de erro da Spa preservada (antes virava `null`); id do lead lido também do header `Location`.
- Recusa de horário pela Spa (400) responde **422** (o GHL não fica repetindo à toa); erro de rede/servidor
  continua **502** (o GHL tenta de novo sozinho).
- `franquiaId` desconhecido é recusado (antes ia FranquiaId 0).
- Bloqueio de duplicado grava o telefone sem 55 e consulta com e sem 55.
- `/debug` passa a mostrar `ultimas_falhas` (as 50 últimas, com rota, unidade, contact_id e motivo).

**Ainda em aberto:**
1. (corrigido na v5)
2. (corrigido na v5)
3. **Dedup de lead por telefone não separa unidade** (`spa_lead_<telefone>`): mesmo telefone em outra
   unidade atualiza o lead antigo em vez de criar um na unidade nova.
4. **`franquiaId` não é validado** contra `SBELT_UNIDADES` (ausente → FranquiaId 0).
5. **Webhooks sem autenticação** (`/ghl-lead`, `/ghl-agendamento` aceitam POST de qualquer um).
6. **`/debug` expõe dados pessoais** (headers, corpo e calendário inteiro) — remover.
7. **`update_option` de debug a cada `/obrigado/`** com a resposta inteira da API (opções autoload).
8. (corrigido na v5 — telefone do bloqueio de duplicado)
9. Comentários dizem "2 salas"; são 4. `GHL_WEBHOOK_URL` e `/agendamento-info` sem uso.

---

## 8. Pendências

1. Ajustar a **agenda de avaliação da Pátio no painel da Spa** para aceitar o que o GHL oferece
   (21–24 e 26/10, 09–21h, 4 por horário) — agendamentos fora disso são recusados com 400
   (caso Kauane, 14/10). Alternativa: reduzir o GHL ao que a Spa aceita.
2. Instalar a "Conferência Spa", desativar o "Reprocessar Spa (temporário)", tratar os 31 pendentes e **ligar a verificação automática** com o e-mail da equipe.
3. **Completar o Custom Data do workflow "Lead Cadastrado - Pátio Alcântara"** (confirmado incompleto em 20/10) e reprocessar os leads perdidos.
4. Configurar os acionadores nos dois GTM (seção 6) e confirmar de quem é o `GTM-WGCH58VW`.
5. **Colar a versão 5 do PHP no WordPress** (seção 7) e conferir `ultimas_falhas` no `/debug` depois.
6. Pátio: `contacts.write` no token + `contact_id` nos workflows (escrita de volta e tags).
7. Remover a rota `/debug`; rotacionar a senha da API da Spa; limpar leads de teste no GHL **e** na Spa.
8. Confirmar com o TI: `franquiaId 10`; endpoint para listar sessões de depilação (seção 9).
9. Arquivar o calendário antigo (Personal) da Imperatriz; apagar a data 2027 da Sala 3.
10. Testar o bloqueio de duplicado com telefone real (seção 7, item 8).

---

## 9. Ideia em aberto: tag no GHL para quem agendou depilação

A API não lista sessões de depilação nem tem webhook. Sinal possível hoje: **"virou cliente"**
(`BuscarClientePorTelefone`) e status do lead (Compareceu/Convertido via `GET /api/Lead/{id}`).
Proposta: verificação diária no WordPress (WP-Cron) sobre os leads dos últimos 60 dias → tag
`cliente-spa` no GHL (exige `contacts.write`). Alternativas: comercial marca no GHL (tag ou pipeline
com workflow), ou export manual da Spa → import no GHL com tag. Aguardando decisão e resposta do TI.

---

## 10. Abrir uma unidade nova (resumo)

> Processo atual, manual. O plano para automatizar (WordPress + Snapshot do GHL + n8n) está em
> [`PLANO-AUTOMACAO.md`](PLANO-AUTOMACAO.md).

1. GHL: sub-conta própria (conferir antes de criar qualquer coisa), calendário (fuso São Paulo,
   15/15 min, vagas por horário), formulário com redirect `.../sucesso/?...&franquiaId=X`,
   2 workflows com o Custom Data completo da seção 3.3, publicados; token com scopes de leitura + `contacts.write`.
2. PHP: nova entrada em `SBELT_UNIDADES` (location, token, calendar, endereço).
3. `/sucesso/`: nova linha em `CALENDARIOS_POR_UNIDADE` e `NOMES_POR_UNIDADE`; incluir no bloqueio de duplicado.
4. Spa: confirmar o franquiaId com o TI e que a agenda de avaliação da unidade está configurada
   com os mesmos dias/horários/vagas do GHL.
5. Teste ponta a ponta com telefone novo; conferir Execution logs (Finished) e o lead em Comercial → Leads.

---

## 11. Descobertas (não repetir os erros)

- Custom Data presente no webhook = PHP ignora os dados padrão do GHL. Todos os campos obrigatórios
  precisam estar no Custom Data.
- Fuso do schedule do usuário no GHL pode vir como Los_Angeles: conferir sempre (desloca 4 h).
- Date-specific hours **somam** às Weekly hours: para abrir só datas específicas, desligar as semanais.
- `{{appointment.only_start_time}}` não resolve no redirect da confirmação; só `{{contact.*}}`.
- Widget do GHL não preenche telefone em iframe de outro domínio → redirect de página inteira.
- Workflow em Draft não dispara nada.
- Tipo de calendário não muda depois de criado (Personal → Round Robin exige calendário novo e ID novo).
- Apagar contato no GHL não apaga o lead na Spa; não há sincronização Spa → GHL.
- Painel da Spa: leads em Comercial → Leads, não em Clientes; filtros de data escondem registros.
- Duas cópias do snippet principal ativas = erro fatal.

---

## 12. Histórico

- **05/10/2026** — Projeto analisado (pacote zip v4). Pátio Alcântara: fuso corrigido para São Paulo;
  aberta só para 21–24 e 26/10, 09–21h.
- **09/10/2026** — Imperatriz: 12/10 (feriado) fechado nas 4 salas. GTM da Pátio (`GTM-56846GTT`) no
  `/obrigado/` e `/sucesso/` junto com o `GTM-WGCH58VW`, com eventos `lead_cadastrado` e `agendamento_confirmado`.
- **12/10/2026** — Pátio: 4 vagas por horário; bloqueio de duplicado estendido à unidade 10 no `/sucesso/`.
- **14/10/2026** — Leads/agendamentos da Pátio não chegavam na Spa: Custom Data dos workflows só tinha
  `franquiaId` (PHP respondia 400). Corrigido o "Agendamento Confirmado - Pátio" (primeiro sucesso: Cintia Santos).
  Recusas 400 da Spa por regra de agenda (Kauane). Criada a tela "Reprocessar Spa" para reenviar os pendentes.
  Proposto o plano de automação da abertura de unidades (`PLANO-AUTOMACAO.md`).
- **20/10/2026** — Leads do formulário da Pátio não chegam na Spa: `/debug` confirma Custom Data do
  "Lead Cadastrado - Pátio" só com `franquiaId` (último lead às 13:45). Escrita de volta no GHL da Pátio
  responde 401 (token sem `contacts.write`), como esperado. Agendamento da Nathália falhou às 10:17 e passou
  na nova tentativa do GHL às 10:27 (token da Spa vencido no cache). Criada a **versão 5 do PHP** (seção 7).
  v5 colada ~14:50; às 15:02 primeiro lead da Pátio aceito pela Spa pelo workflow de lead (lead 14955), 0 falhas.
  Conferência: 71 pendentes → 31 depois do cadastro manual (telefones digitados diferentes / só lead) →
  criada a tela "Conferência Spa" (match por nome, "resolvido à mão" e verificação automática por hora).
