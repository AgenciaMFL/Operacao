# LP Motolize Franquias

Página de vendas estática: `index.html`, e depois dela `obrigado.html` (perfil aprovado, com calendário) e `agradecimento.html` (perfil não aprovado, com botão para o Instagram).

## Antes de publicar
1. **js/config.js**: preencher `CRM_WEBHOOK_URL`, que recebe um POST com JSON e só é chamado para leads qualificados, e `CALENDAR_URL`, o link de agendamento embutido em `obrigado.html`.
2. **Fotos reais**: trocar os 3 placeholders da seção "Visita à sede" por fotos da sede, da frota e da operação.
3. **Prova social**: o bloco foi deixado de fora até existirem depoimentos reais e autorizados.
4. **Token da API de Conversões (Meta)**: NÃO colocar no front-end. Se for usar CAPI, ele fica só no servidor ou no webhook.

## Regras de qualificação
| Faixa | Cria lead no CRM | Destino |
|---|---|---|
| R$ 50 mil a R$ 249 mil | Não | agradecimento.html |
| R$ 250 mil a R$ 449 mil | Sim | obrigado.html |
| Acima de R$ 500 mil | Sim | obrigado.html |
| Ainda estou avaliando | Não | agradecimento.html |

Pixel "LP Franquias" (1835958741094042): dispara `PageView` em todas as páginas, `Lead` para os qualificados e `LeadNaoQualificado` (evento personalizado) para os demais.
