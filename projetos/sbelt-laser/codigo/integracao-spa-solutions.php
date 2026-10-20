<?php
/*
 * CÓPIA DE REFERÊNCIA - SEM CREDENCIAIS.
 * A versão que roda está no WordPress (Code Snippets). Senha da Spa, tokens
 * pit- do GHL e chave do /debug foram trocados por COLE_AQUI_*.
 * Não colar este arquivo em produção sem preencher esses valores.
 */
/**
 * Integração WordPress -> GHL (iframe) + Spa Solutions API
 *
 * Fluxo:
 * 1. Página captura utm_source / utm_campaign da URL
 * 2. Injeta esses parâmetros no src do iframe do GHL (form nativo do GHL recebe o lead)
 * 3. Escuta o postMessage de envio do form do GHL (via JS, ver arquivo .html anexo)
 * 4. Envia os dados pro endpoint REST abaixo, que repassa pra API da Spa Solutions
 *
 * IMPORTANTE - preencher antes de usar:
 * - SPA_URL_EMPRESA: pegar com o TI da Spa Solutions (spasolutionsti@gmail.com)
 * - SPA_LOGIN / SPA_SENHA: credenciais de API fornecidas pelo TI
 * - SPA_FRANQUIA_ID: id da unidade, também fornecido pelo TI
 */

define('SPA_URL_EMPRESA', 'http://sbeltapi.spasolutions.com.br');    // confirmado - atenção: http, não https
define('SPA_LOGIN', 'Sbelt');                                          // confirmado
define('SPA_SENHA', 'COLE_AQUI_A_SENHA');               // confirmado
define('SPA_FRANQUIA_ID_TESTE', 2);                                   // franquiaId fixo usado enquanto SPA_MODO_TESTE = true

// ---------------------------------------------------------------
// MODO DE TESTE
// Enquanto true: TODA chamada usa FranquiaId=2 e ignora o valor vindo da URL,
// pra garantir que nenhum teste vá parar na base de produção por engano.
// Trocar pra false só quando o cliente aprovar o fluxo e formos ligar em produção.
// ---------------------------------------------------------------
define('SPA_MODO_TESTE', false);

/**
 * Resolve o franquiaId real a ser usado, respeitando o modo de teste.
 */
function spa_resolver_franquia_id($franquiaIdRecebido) {
    if (SPA_MODO_TESTE) {
        error_log('[SPA MODO TESTE] franquiaId forçado para ' . SPA_FRANQUIA_ID_TESTE . ' (recebido: ' . $franquiaIdRecebido . ')');
        return SPA_FRANQUIA_ID_TESTE;
    }
    return (int) $franquiaIdRecebido;
}

// URL do webhook "Inbound Webhook" criado num Workflow do GHL
// (Settings > Workflows > novo workflow > Trigger: "Inbound Webhook")
// TODO: hoje é único e compartilhado entre unidades - se cada sub-conta GHL
// precisar de um Inbound Webhook próprio, isso também vira um mapa por franquiaId.
// DEPRECADO - não usado mais em lugar nenhum. Era pra um Workflow "Inbound
// Webhook" que exigia plano pago do GHL; a escrita de volta no contato agora
// é feita direto via API (ver ghl_atualizar_campos_contato). Mantido aqui só
// por histórico, pode ser removido com segurança.
define('GHL_WEBHOOK_URL', 'https://services.leadconnectorhq.com/hooks/SEU_LOCATION_ID/webhook/SEU_WEBHOOK_ID');

define('GHL_API_VERSION', '2021-04-15'); // header "Version" exigido pela API v2 do GHL, igual pra todas as unidades

/**
 * ---------------------------------------------------------------
 * MAPA DE UNIDADES (multi-franquia)
 * ---------------------------------------------------------------
 * Cada sub-conta GHL (uma por unidade/franquia) tem seu próprio Location ID,
 * Private Integration Token e Calendar ID. O franquiaId é o mesmo valor
 * configurado no Custom Data dos Workflows de cada sub-conta (é ele que
 * chega no webhook e diz de qual unidade é o lead/agendamento).
 *
 * Pra adicionar uma nova unidade no futuro: só acrescentar uma entrada aqui,
 * nada mais no resto do código precisa mudar.
 * ---------------------------------------------------------------
 */
const SBELT_UNIDADES = [
    9 => [
        'nome'            => 'Imperatriz',
        'ghl_location_id' => 'qj2BSucIGAVOYtqGSRAL',
        'ghl_api_token'   => 'COLE_AQUI_O_TOKEN_PIT',
        'ghl_calendar_id' => 'QNYwNncYrOsRIpy9GU7B', // "Avaliação Comercial - Sbelt Imperatriz" (Round Robin, 2 salas, atualizado p/ inauguração 30/09-05/10)
        'endereco'        => 'R Coronel Mário Andreazza, 379 — Loja 02 e 03 — Imperatriz, MA',
    ],
    10 => [
        'nome'            => 'Pátio Alcântara',
        'ghl_location_id' => 'E0WCDN9MyksqIgQyNX70',
        'ghl_api_token'   => 'COLE_AQUI_O_TOKEN_PIT',
        'ghl_calendar_id' => 'HQW8VN5uNrB0bqTxzbep', // "Avaliação Comercial - Sbelt Pátio Alcântara"
        'endereco'        => 'Praça Carlos Gianelli, S/N — Loja 317 — Alcântara, São Gonçalo/RJ — CEP 24710-465',
    ],
];

/**
 * Retorna a config da unidade pelo franquiaId, ou null se não estiver cadastrada.
 */
function spa_get_unidade($franquiaId) {
    return SBELT_UNIDADES[(int) $franquiaId] ?? null;
}

// Mapa de midia (vem direto da URL, ex: ?midia=insta) -> slug aceito pela Spa Solutions
const SPA_MIDIA_MAP = [
    'facebook'  => 'facebook',
    'insta'     => 'instagram',
    'instagram' => 'instagram',
    'google'    => 'google',
    'whatsapp'  => 'whatsapp',
    'youtube'   => 'youtube',
    'indicacao' => 'indicacao',
    'organico'  => 'web',
    'direto'    => 'outros',
];

/**
 * Normaliza o valor de "midia" vindo da URL pro slug aceito pela Spa Solutions.
 */
function spa_normalizar_midia($midia) {
    $midia = strtolower(trim($midia ?: ''));
    return SPA_MIDIA_MAP[$midia] ?? 'outros';
}

/**
 * Recupera o token, usando cache (transient) pra não logar a cada requisição.
 */
function spa_get_token($forcar_novo = false) {
    if (!$forcar_novo) {
        $cached = get_transient('spa_solutions_token');
        if ($cached) {
            return $cached;
        }
    }

    $resposta = wp_remote_post(SPA_URL_EMPRESA . '/api/Login/Validar', [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode([
            'Login' => SPA_LOGIN,
            'Senha' => SPA_SENHA,
        ]),
        'timeout' => 15,
    ]);

    if (is_wp_error($resposta)) {
        error_log('Spa Solutions - erro ao logar: ' . $resposta->get_error_message());
        return null;
    }

    // A API retorna o token como STRING PURA (ex: eyJhbGci...), às vezes entre aspas
    // se vier como JSON string literal. NÃO é um objeto {"token": "..."}.
    $corpo_bruto = trim(wp_remote_retrieve_body($resposta));
    $token = trim($corpo_bruto, "\" \t\n\r\0\x0B"); // remove aspas e espaços/quebras de linha nas pontas

    if (empty($token) || strlen($token) < 20) {
        error_log('Spa Solutions - resposta de login não parece um token válido: ' . $corpo_bruto);
        return null;
    }

    if ($token) {
        set_transient('spa_solutions_token', $token, 25 * MINUTE_IN_SECONDS); // token vale 30 min (manual da Spa) - cache menor por margem de segurança
    }

    return $token;
}

/**
 * Normaliza telefone pra usar como chave de busca (só dígitos).
 */
function spa_normalizar_telefone($telefone) {
    return preg_replace('/\D/', '', (string) $telefone);
}

/**
 * Corpo da resposta da Spa: JSON quando for JSON, senão o texto puro.
 * A Spa devolve várias mensagens de erro como texto simples (ex: "Horário
 * Indisponível para agendamento!") - antes isso virava null e a causa se perdia.
 */
function spa_decodificar_corpo($resposta) {
    $bruto = wp_remote_retrieve_body($resposta);
    $json  = json_decode($bruto, true);
    return $json !== null ? $json : $bruto;
}

/**
 * Id do lead criado: vem no corpo (id/Id) ou só no header Location
 * (".../api/Lead/123"), conforme o manual da Spa.
 */
function spa_extrair_lead_id($resultado) {
    $corpo = $resultado['body'] ?? null;
    if (is_array($corpo)) {
        $id = $corpo['id'] ?? $corpo['Id'] ?? null;
        if ($id) return (int) $id;
    } elseif (is_numeric($corpo)) {
        return (int) $corpo;
    }
    if (!empty($resultado['location']) && preg_match('~/(\d+)/?$~', (string) $resultado['location'], $m)) {
        return (int) $m[1];
    }
    return null;
}

/**
 * Data/hora no formato que a Spa exige ("Y-m-d H:i:s", horário de Brasília),
 * aceitando qualquer formato que o GHL mandar (ISO com fuso, sem fuso, epoch ms).
 */
function spa_normalizar_data_hora($valor) {
    $valor = trim((string) $valor);
    if ($valor === '') return '';
    try {
        $fuso = new DateTimeZone('America/Sao_Paulo');
        $data = is_numeric($valor)
            ? new DateTime('@' . intdiv((int) $valor, strlen($valor) > 10 ? 1000 : 1))
            : new DateTime($valor, $fuso);
        $data->setTimezone($fuso);
        return $data->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        return $valor; // formato desconhecido: manda como veio
    }
}

/**
 * Guarda as últimas 50 falhas (rota, unidade, contato, motivo) pra consultar
 * em /debug - sem precisar esperar o próximo erro pra entender o anterior.
 */
function spa_registrar_falha($rota, $info) {
    $falhas = get_option('spa_ultimas_falhas', []);
    if (!is_array($falhas)) $falhas = [];
    array_unshift($falhas, array_merge(['quando' => current_time('mysql'), 'rota' => $rota], $info));
    update_option('spa_ultimas_falhas', array_slice($falhas, 0, 50), false);
}

/**
 * Descobre a unidade do webhook: pelo franquiaId (Custom Data) e, se faltar
 * ou não existir no mapa, pelo Location ID da sub-conta do GHL que mandou.
 */
function spa_resolver_franquia_da_requisicao($dados) {
    $recebido = $dados['franquiaid'] ?? null;
    if (SPA_MODO_TESTE) {
        return spa_resolver_franquia_id($recebido);
    }
    if ($recebido !== null && spa_get_unidade($recebido)) {
        return (int) $recebido;
    }
    $locationId = $dados['_location_id'] ?? '';
    if ($locationId) {
        foreach (SBELT_UNIDADES as $id => $unidade) {
            if ($unidade['ghl_location_id'] === $locationId) {
                return (int) $id;
            }
        }
    }
    return null;
}

/**
 * Guarda a relação telefone -> leadId da Spa Solutions.
 * Necessário porque o form (página 1) e o calendário (página 2) são páginas
 * diferentes com redirect entre elas - o navegador não guarda mais nada em
 * memória depois do redirect, então usamos o telefone como elo entre as duas.
 */
function spa_salvar_mapeamento_lead($telefone, $leadId) {
    $chave = 'spa_lead_' . spa_normalizar_telefone($telefone);
    set_transient($chave, $leadId, 90 * DAY_IN_SECONDS); // janela de deduplicação: 90 dias
}

/**
 * Recupera o leadId da Spa Solutions a partir do telefone.
 */
function spa_buscar_leadid_por_telefone($telefone) {
    $chave = 'spa_lead_' . spa_normalizar_telefone($telefone);
    $valor = get_transient($chave);
    return $valor ? (int) $valor : null;
}

/**
 * ---------------------------------------------------------------
 * BLOQUEIO DE AGENDAMENTO DUPLICADO
 * ---------------------------------------------------------------
 * Marca/verifica se um telefone JÁ TEM um agendamento confirmado numa
 * unidade específica. Usado pela página /sucesso/ ANTES de redirecionar
 * pro widget do calendário: se já agendou, a página não redireciona, evita
 * que a mesma pessoa marque 2x.
 *
 * Escopo por franquiaId (não é global) - hoje só a Imperatriz (9) está
 * configurada pra checar isso no front-end, mas a função em si já suporta
 * qualquer unidade, caso decidam ativar pra Pátio Alcântara depois.
 *
 * Janela de 90 dias, igual a deduplicação de lead - depois disso, considera
 * "liberado" de novo (pode ajustar esse prazo se o negócio precisar de mais
 * ou menos tempo).
 */
function spa_telefone_sem_pais($telefone) {
    $digitos = spa_normalizar_telefone($telefone);
    if (strlen($digitos) > 11 && strpos($digitos, '55') === 0) {
        $digitos = substr($digitos, 2);
    }
    return $digitos;
}

function spa_marcar_ja_agendou($telefone, $franquiaId) {
    // sempre sem o 55 - é assim que a página /sucesso/ consulta
    $chave = 'spa_ja_agendou_' . (int) $franquiaId . '_' . spa_telefone_sem_pais($telefone);
    set_transient($chave, true, 90 * DAY_IN_SECONDS);
}

function spa_verificar_ja_agendou($telefone, $franquiaId) {
    $semPais = spa_telefone_sem_pais($telefone);
    // também confere com 55 na frente: marcações antigas foram gravadas assim
    foreach ([$semPais, '55' . $semPais] as $variacao) {
        if (get_transient('spa_ja_agendou_' . (int) $franquiaId . '_' . $variacao)) {
            return true;
        }
    }
    return false;
}

/**
 * Envia o lead pra Spa Solutions, com retry automático se o token estiver expirado.
 */
function spa_cadastrar_lead($dados, $tentativa = 1) {
    $token = spa_get_token($tentativa > 1);

    if (!$token) {
        return ['erro' => 'Não foi possível autenticar na Spa Solutions'];
    }

    $resposta = wp_remote_post(SPA_URL_EMPRESA . '/api/Lead', [
        'headers' => [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ],
        'body'    => json_encode($dados),
        'timeout' => 15,
    ]);

    if (is_wp_error($resposta)) {
        return ['erro' => $resposta->get_error_message()];
    }

    $status = wp_remote_retrieve_response_code($resposta);

    // token expirado/inválido -> tenta renovar uma vez
    if (in_array($status, [401, 403]) && $tentativa === 1) {
        return spa_cadastrar_lead($dados, 2);
    }

    return [
        'status'   => $status,
        'body'     => spa_decodificar_corpo($resposta),
        'location' => wp_remote_retrieve_header($resposta, 'location'),
    ];
}

/**
 * Atualiza um lead já existente na Spa Solutions (evita duplicar quando o mesmo
 * telefone preenche o formulário mais de uma vez).
 */
function spa_atualizar_lead($leadId, $dados, $tentativa = 1) {
    $token = spa_get_token($tentativa > 1);

    if (!$token) {
        return ['erro' => 'Não foi possível autenticar na Spa Solutions'];
    }

    $dados['Id'] = (int) $leadId;

    $resposta = wp_remote_request(SPA_URL_EMPRESA . '/api/Lead/' . (int) $leadId, [
        'method'  => 'PUT',
        'headers' => [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ],
        'body'    => json_encode($dados),
        'timeout' => 15,
    ]);

    if (is_wp_error($resposta)) {
        return ['erro' => $resposta->get_error_message()];
    }

    $status = wp_remote_retrieve_response_code($resposta);

    if (in_array($status, [401, 403]) && $tentativa === 1) {
        return spa_atualizar_lead($leadId, $dados, 2);
    }

    return [
        'status' => $status,
        'body'   => spa_decodificar_corpo($resposta),
    ];
}

/**
 * Busca horários disponíveis na Spa Solutions.
 */
function spa_buscar_horarios($franquiaId, $dataInicial, $dataFinal, $tentativa = 1) {
    $token = spa_get_token($tentativa > 1);
    if (!$token) return ['erro' => 'Não foi possível autenticar na Spa Solutions'];

    $resposta = wp_remote_post(SPA_URL_EMPRESA . '/api/sessaoavaliacao/BuscarHorarioDisponiveis', [
        'headers' => [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ],
        'body'    => json_encode([
            'franquiaId'  => (int) $franquiaId,
            'dataInicial' => $dataInicial,
            'dataFinal'   => $dataFinal,
        ]),
        'timeout' => 15,
    ]);

    if (is_wp_error($resposta)) return ['erro' => $resposta->get_error_message()];

    if (in_array(wp_remote_retrieve_response_code($resposta), [401, 403]) && $tentativa === 1) {
        return spa_buscar_horarios($franquiaId, $dataInicial, $dataFinal, 2);
    }

    return [
        'status' => wp_remote_retrieve_response_code($resposta),
        'body'   => spa_decodificar_corpo($resposta),
    ];
}

/**
 * Agenda a avaliação na Spa Solutions.
 */
function spa_agendar($leadId, $franquiaId, $dataHoraInicio, $dataHoraFim, $observacao = '', $tentativa = 1) {
    $token = spa_get_token($tentativa > 1);
    if (!$token) return ['erro' => 'Não foi possível autenticar na Spa Solutions'];

    $resposta = wp_remote_post(SPA_URL_EMPRESA . '/api/sessaoavaliacao/SalvarSessaoAvaliacao', [
        'headers' => [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Bearer ' . $token,
        ],
        'body'    => json_encode([
            'leadId'         => (int) $leadId,
            'franquiaId'     => (int) $franquiaId,
            'dataHoraInicio' => $dataHoraInicio,
            'dataHoraFim'    => $dataHoraFim,
            'observacao'     => $observacao,
        ]),
        'timeout' => 15,
    ]);

    if (is_wp_error($resposta)) return ['erro' => $resposta->get_error_message()];

    // token expirado/inválido -> tenta renovar uma vez (antes não tinha retry
    // aqui, e o agendamento falhava sempre que o token em cache vencia)
    if (in_array(wp_remote_retrieve_response_code($resposta), [401, 403]) && $tentativa === 1) {
        return spa_agendar($leadId, $franquiaId, $dataHoraInicio, $dataHoraFim, $observacao, 2);
    }

    return [
        'status' => wp_remote_retrieve_response_code($resposta),
        'body'   => spa_decodificar_corpo($resposta),
    ];
}

/**
 * Guarda a data/hora do agendamento (+ nome) associado ao telefone, pra a
 * página de obrigado buscar via JS. O redirect do calendário do GHL não
 * consegue esperar o Workflow terminar de gravar {{contact.data_agendamento}}
 * antes de redirecionar (é uma corrida - o redirect sempre ganha, confirmado
 * em teste real), então a página de obrigado busca esse valor depois, com
 * um pequeno tempo de espera/retry.
 */
function spa_salvar_info_agendamento($telefone, $nome, $dataHoraInicio) {
    $chave = 'spa_agendamento_info_' . spa_normalizar_telefone($telefone);
    set_transient($chave, [
        'nome'           => $nome,
        'dataHoraInicio' => $dataHoraInicio,
    ], 2 * HOUR_IN_SECONDS); // tempo de sobra pra pessoa terminar de carregar a página
}

/**
 * Recupera a info salva acima, pra o endpoint GET consultar.
 */
function spa_buscar_info_agendamento($telefone) {
    $chave = 'spa_agendamento_info_' . spa_normalizar_telefone($telefone);
    return get_transient($chave) ?: null;
}

/**
 * Consulta a API do GHL de UMA unidade específica, pra achar o agendamento
 * mais recente de um contato - fonte de verdade em tempo real, sem depender
 * de Workflow nenhum (o agendamento já existe na hora em que a pessoa
 * confirma o horário, antes mesmo de qualquer Workflow rodar).
 *
 * ATENÇÃO: não tenho como testar essa chamada ao vivo daqui (sem acesso à
 * internet/GHL). O endpoint e os nomes de campo usados abaixo são os
 * documentados pela API v2 do GHL (calendars/events), mas se a resposta
 * vier em formato diferente, ajustar o parsing do campo 'eventos' logo abaixo.
 */
function ghl_buscar_agendamento_por_contato_na_unidade($contactId, $unidade) {
    $agora = time() * 1000; // GHL espera epoch em milissegundos
    $daqui90dias = $agora + (90 * DAY_IN_SECONDS * 1000);

    // a API exige calendarId (ou userId/groupId) - não aceita filtrar só
    // por contactId direto, então buscamos os eventos do calendário e
    // filtramos pelo contato certo aqui embaixo
    $url = add_query_arg([
        'locationId' => $unidade['ghl_location_id'],
        'calendarId' => $unidade['ghl_calendar_id'],
        'startTime'  => $agora - (30 * DAY_IN_SECONDS * 1000), // margem pra trás também
        'endTime'    => $daqui90dias,
    ], 'https://services.leadconnectorhq.com/calendars/events');

    $resposta = wp_remote_get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $unidade['ghl_api_token'],
            'Version'       => GHL_API_VERSION,
            'Accept'        => 'application/json',
        ],
        'timeout' => 15,
    ]);

    if (is_wp_error($resposta)) {
        spa_registrar_debug_consulta($contactId, $unidade, $url, null, null, $resposta->get_error_message());
        return ['erro' => $resposta->get_error_message()];
    }

    $status = wp_remote_retrieve_response_code($resposta);
    $corpo_bruto = wp_remote_retrieve_body($resposta);
    $corpo = json_decode($corpo_bruto, true);
    $eventos = $corpo['events'] ?? $corpo['calendars'] ?? [];

    // filtra só os eventos desse contato específico
    $eventosDoContato = array_values(array_filter($eventos, function ($evento) use ($contactId) {
        return ($evento['contactId'] ?? '') === $contactId;
    }));

    // DEBUG TEMPORÁRIO: grava a resposta bruta da API (status, corpo, quantos
    // eventos vieram no total e quantos bateram com o contactId) - consultar
    // em /wp-json/leads/v1/debug?chave=CHAVE_DEBUG. Ajuda a diagnosticar sem
    // precisar testar a URL manualmente toda vez.
    spa_registrar_debug_consulta($contactId, $unidade, $url, $status, $corpo_bruto, null, count($eventos), count($eventosDoContato));

    if (empty($eventosDoContato)) {
        return ['encontrado' => false];
    }

    // ordena pelo mais recente (maior startTime) e pega o primeiro -
    // assumindo que o agendamento mais recente é o que a pessoa acabou de marcar
    usort($eventosDoContato, function ($a, $b) {
        return ($b['startTime'] ?? 0) <=> ($a['startTime'] ?? 0);
    });

    $primeiro = $eventosDoContato[0];
    $inicio = $primeiro['startTime'] ?? null;

    return [
        'encontrado'     => true,
        'dataHoraInicio' => $inicio,
    ];
}

/**
 * Grava a última tentativa de consulta pra debug (rota /debug), sem afetar
 * o retorno da função principal. Sobrescreve a cada chamada - só guarda a
 * mais recente, é suficiente pra diagnosticar um teste de cada vez.
 */
function spa_registrar_debug_consulta($contactId, $unidade, $url, $status = null, $corpo_bruto = null, $erro = null, $total_eventos = null, $eventos_do_contato = null) {
    update_option('spa_debug_ultima_consulta', [
        'quando'             => current_time('mysql'),
        'contactId'          => $contactId,
        'unidade'            => $unidade['nome'],
        'url_chamada'        => $url,
        'status_http'        => $status,
        'erro'               => $erro,
        'total_eventos_api'  => $total_eventos,
        'eventos_do_contato' => $eventos_do_contato,
        'corpo_bruto'        => $corpo_bruto ? json_decode($corpo_bruto, true) : null,
    ]);
}

/**
 * Multi-unidade: como a página de obrigado só manda o contactId (não sabe
 * de qual unidade é o contato), tentamos cada unidade cadastrada em
 * SBELT_UNIDADES até achar o agendamento. Com poucas unidades isso é rápido
 * e barato, e tem a vantagem de NÃO exigir mudar o redirect URL do calendário
 * de nenhuma unidade já em produção (ex: Imperatriz continua como está).
 */
function ghl_buscar_agendamento_por_contato($contactId) {
    foreach (SBELT_UNIDADES as $franquiaId => $unidade) {
        $resultado = ghl_buscar_agendamento_por_contato_na_unidade($contactId, $unidade);

        if (!empty($resultado['encontrado'])) {
            $resultado['franquiaId'] = $franquiaId;
            return $resultado;
        }
    }

    return ['encontrado' => false];
}

/**
 * Escreve de volta no contato do GHL os campos customizados "Status
 * Integração Spa" e "Lead ID Spa", usando o Private Integration Token da
 * unidade (que agora tem permissão de escrita - scope contacts.write).
 *
 * Chamado tanto no cadastro do lead (status inicial) quanto no agendamento
 * (status atualizado), pra que MESMO quem só preencheu o formulário e não
 * chegou a agendar já apareça com o status certo dentro do contato do GHL -
 * dá pra montar uma Smart List filtrando por esse campo depois.
 *
 * ATENÇÃO: não tenho como testar essa chamada ao vivo daqui (sem acesso à
 * internet/GHL). O formato do corpo (customFields com "key" + "field_value")
 * é o documentado pela API v2 do GHL, mas se a chave de algum dos 2 campos
 * customizados não bater EXATAMENTE com o que foi gerado automaticamente ao
 * criar o campo no GHL (ex: "status_integrao_spa", sem acento - confirmar
 * em Settings > Custom Fields > Contact, coluna "Key"), a atualização falha
 * silenciosamente (a API pode retornar 200 mesmo sem gravar o campo errado).
 * O log de debug abaixo grava a resposta bruta pra conferir isso.
 */
function ghl_atualizar_campos_contato($contactId, $franquiaId, $statusIntegracao, $leadIdSpa = null) {
    if (empty($contactId)) {
        error_log('GHL - não foi possível atualizar contato: contact_id vazio.');
        return ['erro' => 'contact_id vazio'];
    }

    $unidade = spa_get_unidade($franquiaId);
    if (!$unidade) {
        error_log('GHL - não foi possível atualizar contato: unidade não encontrada pro franquiaId ' . $franquiaId);
        return ['erro' => 'unidade não encontrada'];
    }

    $customFields = [
        ['key' => 'status_integrao_spa', 'field_value' => $statusIntegracao],
    ];
    if ($leadIdSpa !== null) {
        $customFields[] = ['key' => 'lead_id_spa', 'field_value' => (string) $leadIdSpa];
    }

    $resposta = wp_remote_request('https://services.leadconnectorhq.com/contacts/' . $contactId, [
        'method'  => 'PUT',
        'headers' => [
            'Authorization' => 'Bearer ' . $unidade['ghl_api_token'],
            'Version'       => GHL_API_VERSION,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        ],
        'body'    => json_encode(['customFields' => $customFields]),
        'timeout' => 15,
    ]);

    if (is_wp_error($resposta)) {
        $erro = $resposta->get_error_message();
        update_option('spa_debug_ultima_atualizacao_contato', [
            'quando' => current_time('mysql'), 'contactId' => $contactId, 'erro' => $erro,
        ]);
        return ['erro' => $erro];
    }

    $status = wp_remote_retrieve_response_code($resposta);
    $corpo_bruto = wp_remote_retrieve_body($resposta);

    // DEBUG TEMPORÁRIO: grava a resposta bruta - consultar em
    // /wp-json/leads/v1/debug?chave=CHAVE_DEBUG, campo 'ultima_atualizacao_contato'
    update_option('spa_debug_ultima_atualizacao_contato', [
        'quando'        => current_time('mysql'),
        'contactId'     => $contactId,
        'unidade'       => $unidade['nome'],
        'campos_enviados' => $customFields,
        'status_http'   => $status,
        'corpo_bruto'   => json_decode($corpo_bruto, true),
    ]);

    return ['status' => $status, 'body' => json_decode($corpo_bruto, true)];
}

/**
 * ---------------------------------------------------------------
 * ENDPOINTS REST - chamados pelos WORKFLOWS do GHL (server-to-server),
 * não pelo navegador. Isso evita depender de JS sobreviver a um redirect
 * de página, já que form e calendário ficam em URLs diferentes.
 * ---------------------------------------------------------------
 */
add_action('rest_api_init', function () {

    // Chamado pelo Workflow "Form Submitted" do GHL (ação: Webhook)
    register_rest_route('leads/v1', '/ghl-lead', [
        'methods'             => 'POST',
        'callback'            => 'leads_v1_ghl_lead_callback',
        'permission_callback' => '__return_true',
    ]);

    // Chamado pelo Workflow "Appointment Booked" do GHL (ação: Webhook)
    register_rest_route('leads/v1', '/ghl-agendamento', [
        'methods'             => 'POST',
        'callback'            => 'leads_v1_ghl_agendamento_callback',
        'permission_callback' => '__return_true',
    ]);

    // Chamado pelo JS da página /sucesso/ ANTES de redirecionar pro widget
    // do calendário - verifica se esse telefone já tem agendamento naquela
    // unidade, pra bloquear duplicado.
    register_rest_route('leads/v1', '/ja-agendou', [
        'methods'             => 'GET',
        'callback'            => 'leads_v1_ja_agendou_callback',
        'permission_callback' => '__return_true',
    ]);

    // Chamado pelo JS da página de obrigado, pra buscar a data/hora real do
    // agendamento (o redirect do calendário do GHL sempre chega antes do
    // Workflow terminar de gravar o campo do contato, então a página busca
    // aqui depois, com retry).
    register_rest_route('leads/v1', '/agendamento-info', [
        'methods'             => 'GET',
        'callback'            => 'leads_v1_agendamento_info_callback',
        'permission_callback' => '__return_true',
    ]);

    // Chamado pelo JS da página de obrigado - consulta a API do GHL DIRETO
    // (não depende de Workflow nenhum ter rodado, busca a fonte de verdade
    // na hora).
    register_rest_route('leads/v1', '/proxima-consulta', [
        'methods'             => 'GET',
        'callback'            => 'leads_v1_proxima_consulta_callback',
        'permission_callback' => '__return_true',
    ]);

    // ROTA DE DEBUG TEMPORÁRIA - remover depois que resolvermos o problema
    // Acesse pelo navegador: https://sbeltlaser.com.br/wp-json/leads/v1/debug?chave=CHAVE_DEBUG
    register_rest_route('leads/v1', '/debug', [
        'methods'             => 'GET',
        'callback'            => function ($request) {
            if ($request->get_param('chave') !== 'COLE_AQUI_A_CHAVE_DEBUG') {
                return new WP_REST_Response(['erro' => 'Acesso negado'], 403);
            }
            return new WP_REST_Response([
                'ultimo_lead'            => get_option('spa_debug_ultimo_lead', 'Nenhum dado recebido ainda'),
                'ultimo_resultado_spa'   => get_option('spa_debug_resultado_lead', 'Nenhuma tentativa registrada ainda'),
                'ultima_consulta_calendario' => get_option('spa_debug_ultima_consulta', 'Nenhuma consulta registrada ainda'),
                'ultima_atualizacao_contato' => get_option('spa_debug_ultima_atualizacao_contato', 'Nenhuma atualização registrada ainda'),
                'ultimas_falhas'         => get_option('spa_ultimas_falhas', []),
            ], 200);
        },
        'permission_callback' => '__return_true',
    ]);
});

/**
 * Recebido quando o form do GHL é enviado.
 * Configurar no GHL: Workflow > Trigger "Form Submitted" > Action "Webhook"
 * URL do webhook: https://seusite.com.br/wp-json/leads/v1/ghl-lead
 * Body (JSON) sugerido, usando os merge fields do GHL:
 * {
 *   "nome": "{{contact.full_name}}",
 *   "telefone": "{{contact.phone}}",
 *   "email": "{{contact.email}}",
 *   "midia": "{{contact.midia}}",       <- campo customizado que já vem do hidden field
 *   "franquiaId": "{{contact.franquia_id}}"  <- idem
 * }
 */
/**
 * Lê os dados da requisição aceitando tanto JSON quanto form-data/x-www-form-urlencoded.
 * O GHL pode enviar o corpo do webhook em formatos diferentes dependendo da configuração,
 * então tentamos todas as formas antes de desistir.
 */
function spa_ler_dados_requisicao($request) {
    // 1. Tenta JSON (Content-Type: application/json)
    $dados = $request->get_json_params();
    if (!empty($dados)) {
        return $dados;
    }

    // 2. Tenta body params (form-urlencoded / multipart)
    $dados = $request->get_body_params();
    if (!empty($dados)) {
        return $dados;
    }

    // 3. Última tentativa: lê o corpo bruto e decodifica manualmente
    $corpo_bruto = $request->get_body();
    $decodificado = json_decode($corpo_bruto, true);
    if (is_array($decodificado)) {
        return $decodificado;
    }

    // 4. Se nem isso funcionar, tenta parse_str (formato a=1&b=2)
    $parseado = [];
    parse_str($corpo_bruto, $parseado);
    if (!empty($parseado)) {
        return $parseado;
    }

    error_log('Spa Solutions - não consegui ler o corpo da requisição. Raw: ' . $corpo_bruto);
    return [];
}

/**
 * O GHL manda os campos que configuramos no "Custom Data" do webhook DENTRO
 * de um objeto aninhado chamado "customData" (não direto na raiz do JSON).
 * Além disso, a capitalização da chave pode variar (ex: "Telefone" vs "telefone").
 * Essa função extrai o customData (se existir) e normaliza tudo pra minúsculo.
 */
function spa_normalizar_campos_lead($dados) {
    // 1. dados padrão que o GHL sempre manda (raiz do JSON) - servem de
    //    reserva quando algum campo não foi configurado no Custom Data
    $normalizado = [];
    foreach ($dados as $chave => $valor) {
        if (!is_array($valor)) {
            $normalizado[strtolower($chave)] = $valor;
        }
    }
    $reservas = [
        'nome'     => $dados['full_name'] ?? $dados['first_name'] ?? '',
        'telefone' => $dados['phone'] ?? '',
        'email'    => $dados['email'] ?? '',
        'contact_id' => $dados['contact_id'] ?? '',
        'datahorainicio' => $dados['calendar']['startTime'] ?? '',
        'datahorafim'    => $dados['calendar']['endTime'] ?? '',
    ];
    foreach ($reservas as $chave => $valor) {
        if ($valor !== '' && empty($normalizado[$chave])) {
            $normalizado[$chave] = $valor;
        }
    }
    $normalizado['_location_id'] = $dados['location']['id'] ?? '';

    // 2. Custom Data configurado no webhook tem prioridade (quando preenchido)
    if (isset($dados['customData']) && is_array($dados['customData'])) {
        foreach ($dados['customData'] as $chave => $valor) {
            if ($valor !== '' && $valor !== null) {
                $normalizado[strtolower($chave)] = $valor;
            }
        }
    }

    return $normalizado;
}

function leads_v1_ghl_lead_callback($request) {
    $dados_brutos = spa_ler_dados_requisicao($request);
    error_log('Spa Solutions DEBUG - dados recebidos no /ghl-lead: ' . json_encode($dados_brutos));

    // DEBUG TEMPORÁRIO: guarda o que chegou pra visualizar pelo navegador (sem precisar de cPanel)
    update_option('spa_debug_ultimo_lead', [
        'quando'      => current_time('mysql'),
        'dados'       => $dados_brutos,
        'headers'     => $request->get_headers(),
        'corpo_bruto' => $request->get_body(),
    ]);

    $dados = spa_normalizar_campos_lead($dados_brutos);

    $nome       = sanitize_text_field($dados['nome'] ?? '');
    $telefone   = sanitize_text_field($dados['telefone'] ?? '');
    $email      = sanitize_email($dados['email'] ?? '');
    $midia      = sanitize_text_field($dados['midia'] ?? '');
    $franquiaId = spa_resolver_franquia_da_requisicao($dados);

    if (empty($nome) || empty($telefone)) {
        spa_registrar_falha('ghl-lead', ['franquiaId' => $franquiaId, 'contact_id' => $dados['contact_id'] ?? '', 'erro' => 'nome ou telefone vazio']);
        return new WP_REST_Response(['erro' => 'Nome e telefone são obrigatórios'], 400);
    }
    if (!$franquiaId) {
        spa_registrar_falha('ghl-lead', ['contact_id' => $dados['contact_id'] ?? '', 'erro' => 'unidade não identificada', 'recebido' => $dados['franquiaid'] ?? null]);
        return new WP_REST_Response(['erro' => 'Unidade não identificada (franquiaId ausente ou desconhecido)'], 400);
    }

    $origem = spa_normalizar_midia($midia);

    $payload = [
        'Nome'       => $nome,
        'Telefone'   => $telefone,
        'Email'      => $email,
        'Origem'     => $origem,
        'Status'     => 'Novo',
        'Observacao' => 'Lead cadastrado via site (WordPress + GHL)',
        'FranquiaId' => $franquiaId,
    ];

    // Verifica se já existe um lead pra esse telefone (evita duplicar cadastro
    // caso a mesma pessoa preencha o formulário mais de uma vez)
    $leadIdExistente = spa_buscar_leadid_por_telefone($telefone);

    if ($leadIdExistente) {
        $resultado = spa_atualizar_lead($leadIdExistente, $payload);
        $leadId    = $leadIdExistente;
    } else {
        $resultado = spa_cadastrar_lead($payload);
        $leadId    = spa_extrair_lead_id($resultado);
    }

    if (isset($resultado['erro']) || ($resultado['status'] ?? 0) >= 400) {
        error_log('Spa Solutions - falha ao cadastrar/atualizar lead: ' . json_encode($resultado));
        spa_registrar_falha('ghl-lead', ['franquiaId' => $franquiaId, 'contact_id' => $dados['contact_id'] ?? '', 'erro' => $resultado]);

        // guarda também o resultado da tentativa (sucesso ou erro) pra dar
        // pra ver pelo navegador, sem precisar de acesso ao servidor
        update_option('spa_debug_resultado_lead', [
            'quando'     => current_time('mysql'),
            'payload_enviado' => $payload,
            'resultado'  => $resultado,
        ]);

        return new WP_REST_Response(['erro' => 'Falha ao cadastrar/atualizar lead na Spa Solutions', 'detalhe' => $resultado], 502);
    }

    update_option('spa_debug_resultado_lead', [
        'quando'           => current_time('mysql'),
        'payload_enviado'  => $payload,
        'resultado'        => $resultado,
        'leadId'           => $leadId,
    ]);

    // guarda a relação telefone -> leadId pra usar depois, no agendamento
    if ($leadId) {
        spa_salvar_mapeamento_lead($telefone, $leadId);

        // escreve de volta no contato do GHL, pra aparecer mesmo se a pessoa
        // não chegar a agendar (é aqui que resolve o caso "só preencheu o form")
        $contactId = sanitize_text_field($dados['contact_id'] ?? '');
        ghl_atualizar_campos_contato($contactId, $franquiaId, 'Cadastrado na Spa Solutions', $leadId);
    }

    return new WP_REST_Response([
        'status'     => 'ok',
        'leadId'     => $leadId,
        'franquiaId' => $franquiaId,
        'origem'     => $origem,
    ], 200);
}

/**
 * Retorna a data/hora do agendamento mais recente de um contato, consultando
 * a API do GHL direto (não depende de Workflow). Chamado via fetch() pelo
 * JS da página de obrigado.
 */
/**
 * Verifica se um telefone já tem agendamento confirmado numa unidade.
 * Chamado pela página /sucesso/ antes de redirecionar pro widget do
 * calendário, pra bloquear agendamento duplicado.
 */
function leads_v1_ja_agendou_callback($request) {
    $telefone   = sanitize_text_field($request->get_param('telefone') ?? '');
    $franquiaId = (int) ($request->get_param('franquia_id') ?? 0);

    if (empty($telefone) || empty($franquiaId)) {
        return new WP_REST_Response(['erro' => 'telefone e franquia_id são obrigatórios', 'jaAgendou' => false], 400);
    }

    return new WP_REST_Response([
        'jaAgendou' => spa_verificar_ja_agendou($telefone, $franquiaId),
    ], 200);
}

function leads_v1_proxima_consulta_callback($request) {
    $contactId = sanitize_text_field($request->get_param('contact_id') ?? '');

    if (empty($contactId)) {
        return new WP_REST_Response(['encontrado' => false, 'erro' => 'contact_id é obrigatório'], 400);
    }

    $resultado = ghl_buscar_agendamento_por_contato($contactId);

    // enriquece a resposta com nome/endereço da unidade, pra página de
    // obrigado não precisar de nenhum arquivo separado por franquia -
    // ela só troca o texto exibido conforme o que vier aqui
    if (!empty($resultado['encontrado']) && isset($resultado['franquiaId'])) {
        $unidade = spa_get_unidade($resultado['franquiaId']);

        if ($unidade) {
            $resultado['unidadeNome']     = $unidade['nome'];
            $resultado['unidadeEndereco'] = $unidade['endereco'];
        }
    }

    return new WP_REST_Response($resultado, 200);
}

/**
 * Retorna a data/hora (e nome) do agendamento pra um telefone, salvos
 * pelo webhook "Appointment Booked" assim que ele chega. Chamado via
 * fetch() pelo JS da página de obrigado, com retry, porque o redirect do
 * calendário sempre chega antes do Workflow terminar de processar.
 */
function leads_v1_agendamento_info_callback($request) {
    $telefone = sanitize_text_field($request->get_param('telefone') ?? '');

    if (empty($telefone)) {
        return new WP_REST_Response(['encontrado' => false, 'erro' => 'telefone é obrigatório'], 400);
    }

    $info = spa_buscar_info_agendamento($telefone);

    if (!$info) {
        // ainda não chegou - o front-end tenta de novo em seguida
        return new WP_REST_Response(['encontrado' => false], 200);
    }

    return new WP_REST_Response([
        'encontrado'     => true,
        'nome'           => $info['nome'],
        'dataHoraInicio' => $info['dataHoraInicio'],
    ], 200);
}

/**
 * Recebido quando o lead confirma um horário no calendário do GHL.
 * Configurar no GHL: Workflow > Trigger "Appointment Booked" > Action "Webhook"
 * URL do webhook: https://seusite.com.br/wp-json/leads/v1/ghl-agendamento
 * Body (JSON) sugerido:
 * {
 *   "nome": "{{contact.full_name}}",
 *   "telefone": "{{contact.phone}}",
 *   "email": "{{contact.email}}",
 *   "franquiaId": "{{contact.franquia_id}}",
 *   "dataHoraInicio": "{{appointment.start_time}}",
 *   "dataHoraFim": "{{appointment.end_time}}"
 * }
 * ATENÇÃO: os nomes exatos dos merge fields de appointment (start_time/end_time)
 * podem variar - conferir na lista de "Custom Values"/merge fields do GHL na hora
 * de montar o Workflow, e ajustar o formato de data se necessário (a Spa Solutions
 * espera "YYYY-MM-DD HH:MM:SS").
 */
function leads_v1_ghl_agendamento_callback($request) {
    $dados_brutos = spa_ler_dados_requisicao($request);
    $dados = spa_normalizar_campos_lead($dados_brutos);

    $nome           = sanitize_text_field($dados['nome'] ?? '');
    $telefone       = sanitize_text_field($dados['telefone'] ?? '');
    $email          = sanitize_email($dados['email'] ?? '');
    $franquiaId     = spa_resolver_franquia_da_requisicao($dados);
    $dataHoraInicio = spa_normalizar_data_hora(sanitize_text_field($dados['datahorainicio'] ?? ''));
    $dataHoraFim    = spa_normalizar_data_hora(sanitize_text_field($dados['datahorafim'] ?? ''));
    $contactIdFalha = $dados['contact_id'] ?? '';

    if (empty($telefone) || empty($dataHoraInicio)) {
        spa_registrar_falha('ghl-agendamento', ['franquiaId' => $franquiaId, 'contact_id' => $contactIdFalha, 'erro' => 'telefone ou data vazio']);
        return new WP_REST_Response(['erro' => 'telefone e dataHoraInicio são obrigatórios'], 400);
    }
    if (!$franquiaId) {
        spa_registrar_falha('ghl-agendamento', ['contact_id' => $contactIdFalha, 'erro' => 'unidade não identificada', 'recebido' => $dados['franquiaid'] ?? null]);
        return new WP_REST_Response(['erro' => 'Unidade não identificada (franquiaId ausente ou desconhecido)'], 400);
    }

    // salva já, antes de qualquer chamada externa - é o que a página de
    // obrigado vai buscar, e queremos que fique disponível o quanto antes
    spa_salvar_info_agendamento($telefone, $nome, $dataHoraInicio);

    // marca esse telefone como "já agendou" nessa unidade - é o que a
    // página /sucesso/ vai checar ANTES de deixar a pessoa ver o calendário
    // de novo, pra bloquear agendamento duplicado
    spa_marcar_ja_agendou($telefone, $franquiaId);

    // calcula fim (+15min) se não vier, já que a doc diz que o slot é de 15 min
    if (empty($dataHoraFim)) {
        $inicio = strtotime($dataHoraInicio);
        $dataHoraFim = date('Y-m-d H:i:s', $inicio + 15 * 60);
    }

    $leadId = spa_buscar_leadid_por_telefone($telefone);

    // fallback: se por algum motivo não achamos o leadId (ex: cache expirou,
    // ou o webhook do form falhou), cadastra o lead agora mesmo antes de agendar
    if (!$leadId) {
        error_log('Spa Solutions - leadId não encontrado pro telefone ' . $telefone . ', cadastrando na hora como fallback.');
        $resultadoCadastro = spa_cadastrar_lead([
            'Nome'       => $nome ?: 'Lead sem nome (fallback agendamento)',
            'Telefone'   => $telefone,
            'Email'      => $email,
            'Origem'     => 'outros',
            'Status'     => 'Novo',
            'Observacao' => 'Lead cadastrado no fallback do agendamento (telefone não encontrado no cache)',
            'FranquiaId' => $franquiaId,
        ]);
        $leadId = spa_extrair_lead_id($resultadoCadastro);

        if (!$leadId) {
            spa_registrar_falha('ghl-agendamento', ['franquiaId' => $franquiaId, 'contact_id' => $contactIdFalha, 'erro' => 'cadastro de emergência do lead falhou', 'detalhe' => $resultadoCadastro]);
            return new WP_REST_Response(['erro' => 'Não foi possível localizar nem cadastrar o lead pra agendar', 'detalhe' => $resultadoCadastro], 502);
        }
        spa_salvar_mapeamento_lead($telefone, $leadId);
    }

    $resultado = spa_agendar($leadId, $franquiaId, $dataHoraInicio, $dataHoraFim);

    if (isset($resultado['erro']) || ($resultado['status'] ?? 0) >= 400) {
        error_log('Spa Solutions - falha ao agendar: ' . json_encode($resultado));
        spa_registrar_falha('ghl-agendamento', ['franquiaId' => $franquiaId, 'contact_id' => $contactIdFalha, 'dataHoraInicio' => $dataHoraInicio, 'erro' => $resultado]);
        // 400 da Spa = regra da agenda (dia fechado, fora do horário, horário
        // ocupado): tentar de novo não resolve, então devolve 422 e o GHL não
        // fica repetindo. Erro de rede/servidor (5xx etc.) = 502, o GHL tenta de novo.
        $codigo = (($resultado['status'] ?? 0) === 400) ? 422 : 502;
        return new WP_REST_Response(['erro' => 'Falha ao agendar na Spa Solutions', 'detalhe' => $resultado], $codigo);
    }

    // escreve de volta no contato do GHL, agora com o status atualizado
    $contactId = sanitize_text_field($dados['contact_id'] ?? '');
    ghl_atualizar_campos_contato($contactId, $franquiaId, 'Agendamento sincronizado com a Spa Solutions', $leadId);

    return new WP_REST_Response([
        'status' => 'ok',
        'leadId' => $leadId,
        'spa'    => $resultado,
    ], 200);
}
