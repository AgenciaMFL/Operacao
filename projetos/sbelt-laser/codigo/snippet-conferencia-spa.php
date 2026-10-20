<?php
/**
 * CONFERÊNCIA GHL x SPA SOLUTIONS (v2)
 * Tela no painel: Ferramentas > Conferência Spa (só administradores).
 *
 * 1. "Buscar": cruza os agendamentos do calendário GHL da unidade com as
 *    avaliações que existem na Spa e classifica cada pessoa:
 *      - JÁ NA SPA            telefone bate com uma avaliação da Spa
 *      - JÁ NA SPA (pelo nome) telefone diferente, mas o nome bate
 *                              (normalmente: cadastrado à mão)
 *      - IGNORADO             marcado aqui como "já resolvido à mão"
 *      - NÃO TEM AINDA        não existe na Spa
 * 2. "Processar": envia pra Spa só quem está como NÃO TEM AINDA, pelo
 *    mesmo caminho do webhook "Agendamento Confirmado".
 * 3. Verificação automática (opcional, de hora em hora): só olha agendamentos
 *    NOVOS (posteriores à ativação), espera 1 hora pro webhook normal agir e,
 *    se a pessoa continuar sem estar na Spa, envia sozinha e manda e-mail.
 *
 * Depende do snippet principal (integracao-spa-solutions v5) ativo.
 * No Code Snippets: "Run snippet everywhere" (a verificação automática roda
 * fora do painel). Substitui o snippet "Reprocessar Spa (temporário)".
 */

add_action('admin_menu', function () {
    add_management_page('Conferência Spa', 'Conferência Spa', 'manage_options', 'sbelt-conferencia', 'sbelt_conf_pagina');
});

// ---------------------------------------------------------------------
// Comparação
// ---------------------------------------------------------------------

/** Últimos 8 dígitos do telefone: ignora 55, DDD, nono dígito e formatação. */
function sbelt_conf_telefone($telefone) {
    $digitos = preg_replace('/\D/', '', (string) $telefone);
    return strlen($digitos) >= 8 ? substr($digitos, -8) : '';
}

/** Nome sem acento, minúsculo, só letras e espaços. */
function sbelt_conf_nome($nome) {
    $nome = function_exists('remove_accents') ? remove_accents((string) $nome) : (string) $nome;
    $nome = strtolower($nome);
    $nome = preg_replace('/[^a-z ]+/', ' ', $nome);
    return trim(preg_replace('/\s+/', ' ', $nome));
}

/**
 * Chaves de nome pra comparar: o nome inteiro e "primeiro + último".
 * "Maria Eduarda da Silva" bate com "Maria Silva" e com "maria eduarda da silva".
 */
function sbelt_conf_chaves_nome($nome) {
    $normal = sbelt_conf_nome($nome);
    if ($normal === '') return [];
    $partes = explode(' ', $normal);
    $chaves = ['inteiro:' . $normal];
    if (count($partes) >= 2) {
        $chaves[] = 'pu:' . $partes[0] . ' ' . end($partes);
    }
    return $chaves;
}

// ---------------------------------------------------------------------
// Acesso ao GHL
// ---------------------------------------------------------------------

function sbelt_conf_ghl_get($url, $unidade) {
    $resposta = wp_remote_get($url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $unidade['ghl_api_token'],
            'Version'       => GHL_API_VERSION,
            'Accept'        => 'application/json',
        ],
        'timeout' => 20,
    ]);
    if (is_wp_error($resposta)) {
        return ['erro' => 'GHL: ' . $resposta->get_error_message()];
    }
    return [
        'status' => wp_remote_retrieve_response_code($resposta),
        'body'   => json_decode(wp_remote_retrieve_body($resposta), true),
    ];
}

/**
 * Limite de tempo por página: a hospedagem derruba páginas longas (erro 503).
 * Depois de 15 s para de consultar contatos novos no GHL; o resto fica para
 * o próximo clique em Buscar (ou a próxima hora, no automático).
 */
function sbelt_conf_tempo_esgotado() {
    static $inicio = null;
    if ($inicio === null) $inicio = microtime(true);
    return (microtime(true) - $inicio) > 15;
}

/** Contato do GHL com cache de 7 dias (evita centenas de chamadas a cada busca). */
function sbelt_conf_contato($contactId, $unidade, $respeitarTempo = false) {
    $chave = 'sbelt_ct_' . md5($unidade['ghl_location_id'] . $contactId);
    $cache = get_transient($chave);
    if (is_array($cache)) return $cache;
    if ($respeitarTempo && sbelt_conf_tempo_esgotado()) return false;

    $r = sbelt_conf_ghl_get('https://services.leadconnectorhq.com/contacts/' . rawurlencode($contactId), $unidade);
    $c = $r['body']['contact'] ?? null;
    if (!$c) return null;
    $contato = [
        'nome'     => trim(($c['firstName'] ?? '') . ' ' . ($c['lastName'] ?? '')) ?: ($c['name'] ?? $c['contactName'] ?? ''),
        'telefone' => $c['phone'] ?? '',
        'email'    => $c['email'] ?? '',
    ];
    set_transient($chave, $contato, 7 * DAY_IN_SECONDS);
    return $contato;
}

function sbelt_conf_data($valor) {
    $fuso = new DateTimeZone('America/Sao_Paulo');
    $data = is_numeric($valor)
        ? new DateTime('@' . intdiv((int) $valor, strlen((string) $valor) > 10 ? 1000 : 1))
        : new DateTime((string) $valor, $fuso);
    $data->setTimezone($fuso);
    return $data;
}

// ---------------------------------------------------------------------
// Avaliações na Spa
// ---------------------------------------------------------------------

function sbelt_conf_avaliacoes_spa($franquiaId, $inicio, $fim) {
    $corpo = wp_json_encode([
        'franquiaId'  => (int) $franquiaId,
        'dataInicial' => wp_date('Y-m-d', $inicio),
        'dataFinal'   => wp_date('Y-m-d', $fim),
    ]);
    $spa = null;
    for ($tentativa = 1; $tentativa <= 2; $tentativa++) {
        $token = spa_get_token($tentativa > 1);
        if (!$token) {
            return ['erro' => 'Não foi possível autenticar na Spa Solutions'];
        }
        $spa = wp_remote_post(SPA_URL_EMPRESA . '/api/SessaoAvaliacao/ListarAgendamentosAvaliacao', [
            'headers' => ['Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . $token],
            'body'    => $corpo,
            'timeout' => 30,
        ]);
        if (is_wp_error($spa) || !in_array(wp_remote_retrieve_response_code($spa), [401, 403], true)) {
            break;
        }
    }
    if (is_wp_error($spa)) {
        return ['erro' => 'Spa: ' . $spa->get_error_message()];
    }
    $json = json_decode(wp_remote_retrieve_body($spa), true);
    if (!is_array($json) || !isset($json['data']) || !is_array($json['data'])) {
        return [
            'erro'        => 'resposta inesperada da Spa ao listar avaliações',
            'status_http' => wp_remote_retrieve_response_code($spa),
            'corpo'       => wp_remote_retrieve_body($spa),
        ];
    }
    return ['lista' => $json['data']];
}

// ---------------------------------------------------------------------
// Cruzamento GHL x Spa
// ---------------------------------------------------------------------

function sbelt_conf_ignorados() {
    $ignorados = get_option('sbelt_conf_ignorados', []);
    return is_array($ignorados) ? $ignorados : [];
}

/**
 * Lista os agendamentos (não cancelados) do calendário GHL da unidade, de 30
 * dias atrás até 90 dias à frente, e diz a situação de cada um na Spa.
 */
function sbelt_conf_cruzar($franquiaId) {
    $unidade = spa_get_unidade($franquiaId);
    if (!$unidade) {
        return ['erro' => 'unidade inválida'];
    }

    $inicio = time() - 30 * DAY_IN_SECONDS;
    $fim    = time() + 90 * DAY_IN_SECONDS;

    $ghl = sbelt_conf_ghl_get(add_query_arg([
        'locationId' => $unidade['ghl_location_id'],
        'calendarId' => $unidade['ghl_calendar_id'],
        'startTime'  => $inicio * 1000,
        'endTime'    => $fim * 1000,
    ], 'https://services.leadconnectorhq.com/calendars/events'), $unidade);
    if (isset($ghl['erro']) || $ghl['status'] >= 400) {
        return ['erro' => 'falha ao listar o calendário do GHL', 'detalhe' => $ghl];
    }

    $spa = sbelt_conf_avaliacoes_spa($franquiaId, $inicio, $fim);
    if (isset($spa['erro'])) {
        return $spa;
    }

    $porTelefone = [];
    $porNome     = [];
    foreach ($spa['lista'] as $avaliacao) {
        $tel = sbelt_conf_telefone($avaliacao['telefone'] ?? '');
        if ($tel !== '') {
            $porTelefone[$tel] = $avaliacao;
        }
        foreach (sbelt_conf_chaves_nome($avaliacao['nome'] ?? '') as $chave) {
            $porNome[$chave] = $avaliacao;
        }
    }

    $ignorados = sbelt_conf_ignorados();
    $vistos    = [];
    $lista     = [];
    $semTempo  = 0;
    sbelt_conf_tempo_esgotado(); // começa a contar o tempo
    foreach ($ghl['body']['events'] ?? [] as $evento) {
        $contactId = $evento['contactId'] ?? '';
        if ($contactId === '' || ($evento['appointmentStatus'] ?? '') === 'cancelled' || isset($vistos[$contactId])) {
            continue;
        }
        $vistos[$contactId] = true;

        $contato = sbelt_conf_contato($contactId, $unidade, true);
        if ($contato === false) {
            $semTempo++; // contato ainda não carregado: fica pro próximo clique
            continue;
        }
        $contato = $contato ?: ['nome' => $evento['title'] ?? '', 'telefone' => '', 'email' => ''];
        try {
            $data = sbelt_conf_data($evento['startTime'] ?? '');
            $dataTexto = $data->format('d/m/Y H:i');
            $inicioTs  = $data->getTimestamp();
        } catch (Exception $e) {
            $dataTexto = (string) ($evento['startTime'] ?? '');
            $inicioTs  = 0;
        }

        $tel = sbelt_conf_telefone($contato['telefone']);
        $achadoNome = null;
        foreach (sbelt_conf_chaves_nome($contato['nome']) as $chave) {
            if (isset($porNome[$chave])) {
                $achadoNome = $porNome[$chave];
                break;
            }
        }

        if ($tel !== '' && isset($porTelefone[$tel])) {
            $situacao = 'spa_telefone';
            $naSpa    = $porTelefone[$tel];
        } elseif ($achadoNome) {
            $situacao = 'spa_nome';
            $naSpa    = $achadoNome;
        } elseif (isset($ignorados[$contactId])) {
            $situacao = 'ignorado';
            $naSpa    = null;
        } else {
            $situacao = 'nao_tem';
            $naSpa    = null;
        }

        $lista[] = [
            'contact_id' => $contactId,
            'nome'       => $contato['nome'],
            'telefone'   => $contato['telefone'],
            'data'       => $dataTexto,
            'inicio_ts'  => $inicioTs,
            'situacao'   => $situacao,
            'na_spa'     => $naSpa ? [
                'nome'     => $naSpa['nome'] ?? '',
                'telefone' => $naSpa['telefone'] ?? '',
                'data'     => $naSpa['dataHoraInicio'] ?? '',
                'status'   => $naSpa['status'] ?? '',
            ] : null,
        ];
    }

    // "não tem ainda" primeiro, depois "pelo nome", ignorados, e por último os ok
    $ordem = ['nao_tem' => 0, 'spa_nome' => 1, 'ignorado' => 2, 'spa_telefone' => 3];
    usort($lista, function ($a, $b) use ($ordem) {
        return [$ordem[$a['situacao']], $a['inicio_ts']] <=> [$ordem[$b['situacao']], $b['inicio_ts']];
    });

    $totais = ['spa_telefone' => 0, 'spa_nome' => 0, 'ignorado' => 0, 'nao_tem' => 0];
    foreach ($lista as $linha) {
        $totais[$linha['situacao']]++;
    }

    return [
        'unidade'   => $unidade['nome'],
        'total_ghl' => count($lista),
        'total_spa' => count($spa['lista']),
        'totais'    => $totais,
        'lista'     => $lista,
        'faltam_carregar' => $semTempo,
    ];
}

// ---------------------------------------------------------------------
// Envio pra Spa (mesmo caminho do webhook de agendamento)
// ---------------------------------------------------------------------

function sbelt_conf_enviar($contactIds, $franquiaId, $simular) {
    $unidade = spa_get_unidade($franquiaId);
    if (!$unidade) {
        return ['erro' => 'unidade inválida'];
    }

    $resultados = [];
    foreach ($contactIds as $contactId) {
        $contactId = sanitize_text_field($contactId);
        if (sbelt_conf_tempo_esgotado()) {
            $resultados[$contactId] = ['erro' => 'AINDA NÃO ENVIADO: tempo da página esgotado - envie de novo'];
            continue;
        }
        $contato = sbelt_conf_contato($contactId, $unidade);
        if (!$contato) {
            $resultados[$contactId] = ['erro' => 'contato não encontrado nessa unidade'];
            continue;
        }

        $agendamento = ghl_buscar_agendamento_por_contato_na_unidade($contactId, $unidade);
        if (empty($agendamento['encontrado'])) {
            $resultados[$contactId] = ['nome' => $contato['nome'], 'erro' => 'agendamento não encontrado no calendário da unidade'];
            continue;
        }
        try {
            $data = sbelt_conf_data($agendamento['dataHoraInicio']);
        } catch (Exception $e) {
            $resultados[$contactId] = ['nome' => $contato['nome'], 'erro' => 'data inválida: ' . $agendamento['dataHoraInicio']];
            continue;
        }

        $dados = [
            'nome'           => $contato['nome'],
            'telefone'       => $contato['telefone'],
            'email'          => $contato['email'],
            'franquiaId'     => (int) $franquiaId,
            'contact_id'     => $contactId,
            'datahorainicio' => $data->format('Y-m-d H:i:s'),
            'datahorafim'    => (clone $data)->modify('+15 minutes')->format('Y-m-d H:i:s'),
        ];

        if ($simular) {
            $resultados[$contactId] = ['simulacao' => true, 'seria_enviado' => $dados];
            continue;
        }

        $req = new WP_REST_Request('POST', '/leads/v1/ghl-agendamento');
        $req->set_header('Content-Type', 'application/json');
        $req->set_body(wp_json_encode($dados));
        $retorno = leads_v1_ghl_agendamento_callback($req);

        $resultados[$contactId] = [
            'nome'     => $contato['nome'],
            'horario'  => $dados['datahorainicio'],
            'status'   => $retorno->get_status(),
            'resposta' => $retorno->get_data(),
        ];
    }

    return $resultados;
}

// ---------------------------------------------------------------------
// Verificação automática (WP-Cron, de hora em hora)
// ---------------------------------------------------------------------

function sbelt_conf_auto() {
    $auto = get_option('sbelt_conf_auto', []);
    return array_merge(['ativo' => false, 'email' => '', 'base' => [], 'visto' => [], 'tentados' => [], 'ultima' => '', 'relatorio' => ''], is_array($auto) ? $auto : []);
}

add_action('init', function () {
    $auto = sbelt_conf_auto();
    $agendado = wp_next_scheduled('sbelt_conf_verificar');
    if ($auto['ativo'] && !$agendado) {
        wp_schedule_event(time() + 300, 'hourly', 'sbelt_conf_verificar');
    } elseif (!$auto['ativo'] && $agendado) {
        wp_clear_scheduled_hook('sbelt_conf_verificar');
    }
});

add_action('sbelt_conf_verificar', 'sbelt_conf_verificar');

/**
 * Para cada unidade: pega quem está "NÃO TEM AINDA", ignora quem já estava
 * pendente quando a verificação foi ligada (base), espera 1 hora desde que
 * viu a pessoa pela primeira vez (dá tempo do webhook normal e das novas
 * tentativas do GHL) e só então envia pra Spa. Cada pessoa é tentada uma vez;
 * recusas vão no e-mail pra equipe resolver.
 */
function sbelt_conf_verificar() {
    $auto = sbelt_conf_auto();
    if (!$auto['ativo']) return;

    $agora     = time();
    $enviados  = [];
    $recusados = [];
    $erros     = [];
    $pendentesAgora = [];
    $envios    = 0;

    foreach (SBELT_UNIDADES as $franquiaId => $unidade) {
        $cruzamento = sbelt_conf_cruzar($franquiaId);
        if (isset($cruzamento['erro'])) {
            $erros[] = $unidade['nome'] . ': ' . wp_json_encode($cruzamento, JSON_UNESCAPED_UNICODE);
            continue;
        }
        foreach ($cruzamento['lista'] as $linha) {
            $id = $linha['contact_id'];
            if ($linha['situacao'] !== 'nao_tem' || isset($auto['base'][$id]) || isset($auto['tentados'][$id])) {
                continue;
            }
            if ($linha['inicio_ts'] && $linha['inicio_ts'] < $agora) {
                continue; // horário já passou: não agenda no passado
            }
            $pendentesAgora[$id] = true;
            if (!isset($auto['visto'][$id])) {
                $auto['visto'][$id] = $agora;
                continue;
            }
            if ($agora - $auto['visto'][$id] < HOUR_IN_SECONDS || $envios >= 5 || sbelt_conf_tempo_esgotado()) {
                continue;
            }

            $envios++;
            $r = sbelt_conf_enviar([$id], $franquiaId, false)[$id] ?? [];
            $auto['tentados'][$id] = ['quando' => current_time('mysql'), 'status' => $r['status'] ?? 0];
            $descricao = $unidade['nome'] . ' - ' . $linha['nome'] . ' (' . $linha['telefone'] . ') ' . $linha['data'];
            if (($r['status'] ?? 0) === 200) {
                $enviados[] = $descricao;
            } else {
                $motivo = $r['resposta']['detalhe']['body'] ?? $r['resposta']['erro'] ?? $r['erro'] ?? 'erro desconhecido';
                $recusados[] = $descricao . ' -> ' . (is_string($motivo) ? $motivo : wp_json_encode($motivo, JSON_UNESCAPED_UNICODE));
            }
        }
    }

    // esquece quem já foi resolvido (entrou na Spa pelo webhook ou à mão)
    $auto['visto'] = array_intersect_key($auto['visto'], $pendentesAgora);
    $auto['ultima'] = current_time('mysql');

    if ($enviados || $recusados || $erros) {
        $texto = "Verificação automática GHL x Spa Solutions - " . $auto['ultima'] . "\n\n";
        if ($enviados) {
            $texto .= "Enviados pra Spa (o webhook não tinha levado):\n- " . implode("\n- ", $enviados) . "\n\n";
        }
        if ($recusados) {
            $texto .= "RECUSADOS pela Spa - resolver à mão (encaixar na agenda e avisar a pessoa):\n- " . implode("\n- ", $recusados) . "\n\n";
        }
        if ($erros) {
            $texto .= "Não foi possível conferir:\n- " . implode("\n- ", $erros) . "\n";
        }
        $auto['relatorio'] = $texto;
        $email = $auto['email'] ?: get_option('admin_email');
        if ($email) {
            wp_mail($email, '[Sbelt] Conferência GHL x Spa: ' . count($enviados) . ' enviado(s), ' . count($recusados) . ' recusado(s)', $texto);
        }
    }

    update_option('sbelt_conf_auto', $auto, false);
}

// ---------------------------------------------------------------------
// Tela
// ---------------------------------------------------------------------

function sbelt_conf_pagina() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $franquiaId = 10;
    $cruzamento = null;
    $resultados = null;
    $aviso      = '';

    if (!empty($_POST)) {
        check_admin_referer('sbelt_conf');
        $franquiaId = (int) ($_POST['franquia_id'] ?? 10);
        $marcados   = array_map('sanitize_text_field', (array) wp_unslash($_POST['marcar'] ?? []));

        if (isset($_POST['ignorar']) || isset($_POST['designorar'])) {
            $ignorados = sbelt_conf_ignorados();
            foreach ($marcados as $id) {
                if (isset($_POST['ignorar'])) {
                    $ignorados[$id] = current_time('mysql');
                } else {
                    unset($ignorados[$id]);
                }
            }
            update_option('sbelt_conf_ignorados', $ignorados, false);
            $aviso = count($marcados) . ' pessoa(s) ' . (isset($_POST['ignorar']) ? 'marcada(s) como resolvida(s) à mão.' : 'voltaram pra lista.');
        }

        if (isset($_POST['processar'])) {
            $simular    = !empty($_POST['simular']);
            $lote       = array_slice($marcados, 0, 5);
            $resultados = sbelt_conf_enviar($lote, $franquiaId, $simular);
            if (count($marcados) > 5) {
                $aviso = 'Enviados os 5 primeiros marcados (limite para não derrubar o site). Clique em Buscar e envie o restante.';
            }
        }

        if (isset($_POST['salvar_auto'])) {
            $auto = sbelt_conf_auto();
            $ligar = !empty($_POST['auto_ativo']);
            if ($ligar && !$auto['ativo']) {
                // tudo que já está pendente hoje fica de fora da automação
                // (já foi ou vai ser tratado aqui na tela, à mão)
                $auto['base'] = [];
                foreach (SBELT_UNIDADES as $id => $u) {
                    $c = sbelt_conf_cruzar($id);
                    foreach ($c['lista'] ?? [] as $linha) {
                        if ($linha['situacao'] === 'nao_tem') {
                            $auto['base'][$linha['contact_id']] = true;
                        }
                    }
                }
                $auto['visto'] = [];
            }
            $auto['ativo'] = $ligar;
            $auto['email'] = sanitize_email(wp_unslash($_POST['auto_email'] ?? ''));
            update_option('sbelt_conf_auto', $auto, false);
            $aviso = $ligar ? 'Verificação automática LIGADA. ' . count($auto['base']) . ' pendente(s) atuais ficam de fora (tratar aqui na tela).' : 'Verificação automática desligada.';
        }

        if (!isset($_POST['salvar_auto'])) {
            $cruzamento = sbelt_conf_cruzar($franquiaId);
        }
    }

    $rotulos = [
        'nao_tem'      => ['NÃO TEM AINDA', '#b32d2e'],
        'spa_nome'     => ['JÁ NA SPA (pelo nome, telefone diferente)', '#996800'],
        'ignorado'     => ['IGNORADO (resolvido à mão)', '#646970'],
        'spa_telefone' => ['JÁ NA SPA', '#00a32a'],
    ];
    $auto = sbelt_conf_auto();
    ?>
    <div class="wrap">
        <h1>Conferência GHL x Spa Solutions</h1>
        <?php if ($aviso) : ?><div class="notice notice-info"><p><?php echo esc_html($aviso); ?></p></div><?php endif; ?>

        <form method="post">
            <?php wp_nonce_field('sbelt_conf'); ?>
            <p>
                <label>Unidade:
                    <select name="franquia_id">
                        <?php foreach (SBELT_UNIDADES as $id => $unidade) : ?>
                            <option value="<?php echo (int) $id; ?>" <?php selected($franquiaId, $id); ?>><?php echo esc_html($id . ' - ' . $unidade['nome']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <button type="submit" name="buscar" class="button button-primary">Buscar</button>
            </p>

            <?php if ($cruzamento !== null && isset($cruzamento['erro'])) : ?>
                <div class="notice notice-error"><pre><?php echo esc_html(wp_json_encode($cruzamento, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)); ?></pre></div>
            <?php elseif ($cruzamento !== null) : ?>
                <p style="font-size:14px">
                    <?php echo esc_html($cruzamento['unidade']); ?>:
                    <strong><?php echo (int) $cruzamento['total_ghl']; ?></strong> agendamento(s) no GHL ·
                    <strong><?php echo (int) $cruzamento['total_spa']; ?></strong> avaliação(ões) na Spa ·
                    <?php foreach ($rotulos as $chave => $r) : ?>
                        <span style="color:<?php echo esc_attr($r[1]); ?>"><strong><?php echo (int) $cruzamento['totais'][$chave]; ?></strong> <?php echo esc_html(strtolower($r[0])); ?></span> ·
                    <?php endforeach; ?>
                </p>
                <?php if (!empty($cruzamento['faltam_carregar'])) : ?>
                    <div class="notice notice-warning"><p><strong>Busca parcial:</strong> ainda faltam <?php echo (int) $cruzamento['faltam_carregar']; ?> contato(s) do GHL para carregar (a busca para em 15 s para não derrubar o site). <strong>Clique em Buscar de novo</strong> até este aviso sumir — os já carregados ficam guardados por 7 dias.</p></div>
                <?php endif; ?>
                <p>
                    <button type="button" class="button" onclick="document.querySelectorAll('.sbelt-nao-tem').forEach(function(c){c.checked=true})">Marcar todos "NÃO TEM AINDA"</button>
                    <button type="button" class="button" onclick="document.querySelectorAll('.sbelt-marcar').forEach(function(c){c.checked=false})">Desmarcar todos</button>
                </p>
                <table class="widefat striped">
                    <thead><tr><th style="width:30px"></th><th>Situação</th><th>Nome (GHL)</th><th>Telefone (GHL)</th><th>Agendado para</th><th>O que existe na Spa</th></tr></thead>
                    <tbody>
                    <?php foreach ($cruzamento['lista'] as $linha) : $r = $rotulos[$linha['situacao']]; ?>
                        <tr>
                            <td>
                                <?php if ($linha['situacao'] !== 'spa_telefone') : ?>
                                    <input type="checkbox" name="marcar[]" value="<?php echo esc_attr($linha['contact_id']); ?>" class="sbelt-marcar<?php echo $linha['situacao'] === 'nao_tem' ? ' sbelt-nao-tem' : ''; ?>">
                                <?php endif; ?>
                            </td>
                            <td><strong style="color:<?php echo esc_attr($r[1]); ?>"><?php echo esc_html($r[0]); ?></strong></td>
                            <td><?php echo esc_html($linha['nome']); ?></td>
                            <td><?php echo esc_html($linha['telefone']); ?></td>
                            <td><?php echo esc_html($linha['data']); ?></td>
                            <td><?php echo $linha['na_spa'] ? esc_html($linha['na_spa']['nome'] . ' · ' . $linha['na_spa']['telefone'] . ' · ' . $linha['na_spa']['data'] . ' · ' . $linha['na_spa']['status']) : '—'; ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>

                <h2>Com os marcados</h2>
                <p>
                    <button type="submit" name="ignorar" class="button">Marcar como resolvido à mão (não mostrar mais como pendente)</button>
                    <button type="submit" name="designorar" class="button">Voltar pra lista (desfazer "resolvido")</button>
                </p>
                <p>
                    <label><input type="checkbox" name="simular" value="1" checked> Só simular (não envia nada pra Spa)</label>
                    <button type="submit" name="processar" class="button button-primary">Enviar pra Spa (até 5 por vez)</button>
                </p>
                <p style="color:#646970">Envie só quem está como <strong>NÃO TEM AINDA</strong>. Quem aparece "pelo nome" provavelmente já foi cadastrado à mão: confira na Spa e marque como resolvido.</p>
            <?php endif; ?>
        </form>

        <?php if ($resultados !== null) : ?>
            <h2>Resultado do envio</h2>
            <pre style="background:#fff;padding:12px;overflow:auto;"><?php echo esc_html(wp_json_encode($resultados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)); ?></pre>
        <?php endif; ?>

        <hr>
        <h2>Verificação automática (de hora em hora)</h2>
        <form method="post">
            <?php wp_nonce_field('sbelt_conf'); ?>
            <input type="hidden" name="franquia_id" value="<?php echo (int) $franquiaId; ?>">
            <p><label><input type="checkbox" name="auto_ativo" value="1" <?php checked($auto['ativo']); ?>> Ligada</label></p>
            <p><label>E-mail para avisos: <input type="email" name="auto_email" value="<?php echo esc_attr($auto['email']); ?>" placeholder="<?php echo esc_attr(get_option('admin_email')); ?>" style="width:320px"></label></p>
            <p><button type="submit" name="salvar_auto" class="button">Salvar</button></p>
            <p style="color:#646970">
                Só cuida de agendamentos <strong>novos</strong> (quem já está pendente ao ligar fica de fora). Espera 1 hora pelo webhook normal;
                se a pessoa continuar fora da Spa, envia sozinha e manda e-mail. Recusas da Spa vêm no e-mail com o motivo.
            </p>
            <?php if ($auto['ultima']) : ?>
                <p>Última verificação: <?php echo esc_html($auto['ultima']); ?></p>
            <?php endif; ?>
            <?php if ($auto['relatorio']) : ?>
                <pre style="background:#fff;padding:12px;overflow:auto;"><?php echo esc_html($auto['relatorio']); ?></pre>
            <?php endif; ?>
        </form>
    </div>
    <?php
}
