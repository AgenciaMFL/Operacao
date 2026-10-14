<?php
// Ao colar no Code Snippets, NÃO incluir esta primeira linha "<?php".
/**
 * REPROCESSAR AGENDAMENTOS QUE FALHARAM (snippet temporário)
 * Tela no painel: Ferramentas > Reprocessar Spa (só administradores).
 * 1. "Buscar pendentes": compara os agendamentos do calendário GHL da
 *    unidade com as avaliações que existem na Spa Solutions e lista quem
 *    está no GHL mas NÃO está na Spa.
 * 2. "Processar": reenvia esses agendamentos pra Spa, pelo mesmo caminho
 *    do webhook "Agendamento Confirmado".
 * Depende do snippet principal (integracao-spa-solutions) ativo.
 * Desativar/apagar este snippet depois de usar.
 */
add_action('admin_menu', function () {
    add_management_page('Reprocessar Spa', 'Reprocessar Spa', 'manage_options', 'sbelt-reprocessar', 'sbelt_reprocessar_pagina');
});

function sbelt_reprocessar_pagina() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $resultados = null;
    $pendentes  = null;
    $idsTexto   = '';
    $franquiaId = 10;

    if (isset($_POST['sbelt_buscar']) || isset($_POST['sbelt_reprocessar'])) {
        check_admin_referer('sbelt_reprocessar');
        $franquiaId = (int) ($_POST['franquia_id'] ?? 0);
    }

    if (isset($_POST['sbelt_buscar'])) {
        $pendentes = sbelt_buscar_pendentes($franquiaId);
        if (!empty($pendentes['lista'])) {
            $idsPendentes = [];
            foreach ($pendentes['lista'] as $linha) {
                if (!$linha['na_spa']) {
                    $idsPendentes[] = $linha['contact_id'];
                }
            }
            $idsTexto = implode("\n", array_unique($idsPendentes));
        }
    }

    if (isset($_POST['sbelt_reprocessar'])) {
        $idsTexto   = sanitize_textarea_field(wp_unslash($_POST['contact_ids'] ?? ''));
        $simular    = !empty($_POST['simular']);
        $ids        = array_values(array_unique(array_filter(array_map('trim', preg_split('/[\s,]+/', $idsTexto)))));
        // no máximo 10 por clique (evita o servidor cortar a página por tempo);
        // os que sobrarem voltam pra caixa - é só clicar de novo
        $lote       = array_slice($ids, 0, 10);
        $restantes  = array_slice($ids, 10);
        $resultados = sbelt_reprocessar_contatos($lote, $franquiaId, $simular);
        $idsTexto   = $simular ? implode("\n", $ids) : implode("\n", $restantes);
    }
    ?>
    <div class="wrap">
        <h1>Reprocessar agendamentos na Spa Solutions</h1>
        <form method="post">
            <?php wp_nonce_field('sbelt_reprocessar'); ?>
            <p>
                <label>Unidade:
                    <select name="franquia_id">
                        <?php foreach (SBELT_UNIDADES as $id => $unidade) : ?>
                            <option value="<?php echo (int) $id; ?>" <?php selected($franquiaId, $id); ?>><?php echo esc_html($id . ' - ' . $unidade['nome']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <button type="submit" name="sbelt_buscar" class="button">1. Buscar pendentes da unidade</button>
            </p>

            <?php if ($pendentes !== null) : ?>
                <?php if (isset($pendentes['erro'])) : ?>
                    <div class="notice notice-error"><pre><?php echo esc_html(wp_json_encode($pendentes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)); ?></pre></div>
                <?php else : ?>
                    <p style="font-size:14px">
                        <strong><?php echo (int) $pendentes['total_ghl']; ?></strong> agendamento(s) no calendário do GHL ·
                        <strong><?php echo (int) $pendentes['total_spa']; ?></strong> avaliação(ões) na Spa no mesmo período ·
                        <strong style="color:#00a32a"><?php echo (int) $pendentes['total_ok']; ?></strong> já na Spa ·
                        <strong style="color:#b32d2e"><?php echo (int) $pendentes['total_pendentes']; ?></strong> pendente(s)
                    </p>
                    <table class="widefat striped" style="max-width:1000px">
                        <thead><tr><th>Nome</th><th>Telefone</th><th>Data/hora</th><th>contact_id</th><th>Na Spa?</th></tr></thead>
                        <tbody>
                        <?php foreach ($pendentes['lista'] as $linha) : ?>
                            <tr>
                                <td><?php echo esc_html($linha['nome']); ?></td>
                                <td><?php echo esc_html($linha['telefone']); ?></td>
                                <td><?php echo esc_html($linha['data']); ?></td>
                                <td><code><?php echo esc_html($linha['contact_id']); ?></code></td>
                                <td><?php echo $linha['na_spa'] ? 'Sim' : '<strong style="color:#b32d2e">NÃO - pendente</strong>'; ?></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>

                    <details style="margin-top:12px">
                        <summary><strong>Ver o que a Spa devolveu (<?php echo (int) $pendentes['total_spa']; ?>)</strong> - pra conferir quem já está lá</summary>
                        <table class="widefat striped" style="max-width:1000px;margin-top:8px">
                            <thead><tr><th>Nome</th><th>Telefone</th><th>Data/hora</th><th>Status na Spa</th></tr></thead>
                            <tbody>
                            <?php foreach ($pendentes['spa'] as $avaliacao) : ?>
                                <tr>
                                    <td><?php echo esc_html($avaliacao['nome'] ?? ''); ?></td>
                                    <td><?php echo esc_html($avaliacao['telefone'] ?? ''); ?></td>
                                    <td><?php echo esc_html($avaliacao['dataHoraInicio'] ?? ''); ?></td>
                                    <td><?php echo esc_html($avaliacao['status'] ?? ''); ?></td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    </details>
                <?php endif; ?>
            <?php endif; ?>

            <p>contact_id a reenviar (preenchido com os pendentes; pode editar). Cada clique em "Processar" envia <strong>no máximo 10</strong>; os que sobrarem continuam na caixa - é só clicar de novo.</p>
            <p><textarea name="contact_ids" rows="6" cols="60"><?php echo esc_textarea($idsTexto); ?></textarea></p>
            <p><label><input type="checkbox" name="simular" value="1" checked> Só simular (não envia nada pra Spa)</label></p>
            <p><button type="submit" name="sbelt_reprocessar" class="button button-primary">2. Processar</button></p>
        </form>
        <?php if ($resultados !== null) : ?>
            <h2>Resultado</h2>
            <pre style="background:#fff;padding:12px;max-width:100%;overflow:auto;"><?php echo esc_html(wp_json_encode($resultados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)); ?></pre>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Chave de telefone pra comparar GHL x Spa.
 */
function sbelt_telefone_comparavel($telefone) {
    // últimos 8 dígitos: ignora 55, DDD, nono dígito e formatação
    $digitos = preg_replace('/\D/', '', (string) $telefone);
    return substr($digitos, -8);
}

function sbelt_ghl_get($url, $unidade) {
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

function sbelt_data_sao_paulo($valor) {
    $fuso = new DateTimeZone('America/Sao_Paulo');
    $data = is_numeric($valor)
        ? new DateTime('@' . intdiv((int) $valor, 1000))
        : new DateTime($valor, $fuso);
    $data->setTimezone($fuso);
    return $data;
}

/**
 * Lista os agendamentos do calendário GHL da unidade e marca quais já
 * existem como avaliação na Spa Solutions (comparando pelo telefone).
 */
function sbelt_buscar_pendentes($franquiaId) {
    $unidade = spa_get_unidade($franquiaId);
    if (!$unidade) {
        return ['erro' => 'unidade inválida'];
    }

    $inicio = time() - 30 * DAY_IN_SECONDS;
    $fim    = time() + 90 * DAY_IN_SECONDS;

    // 1. agendamentos no calendário do GHL
    $ghl = sbelt_ghl_get(add_query_arg([
        'locationId' => $unidade['ghl_location_id'],
        'calendarId' => $unidade['ghl_calendar_id'],
        'startTime'  => $inicio * 1000,
        'endTime'    => $fim * 1000,
    ], 'https://services.leadconnectorhq.com/calendars/events'), $unidade);
    if (isset($ghl['erro']) || $ghl['status'] >= 400) {
        return ['erro' => 'falha ao listar o calendário do GHL', 'detalhe' => $ghl];
    }
    $eventos = $ghl['body']['events'] ?? [];

    // 2. avaliações na Spa no mesmo período
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
            'timeout' => 20,
        ]);
        if (is_wp_error($spa) || !in_array(wp_remote_retrieve_response_code($spa), [401, 403], true)) {
            break;
        }
    }
    if (is_wp_error($spa)) {
        return ['erro' => 'Spa: ' . $spa->get_error_message()];
    }
    $spaCorpo = json_decode(wp_remote_retrieve_body($spa), true);
    if (!is_array($spaCorpo) || !isset($spaCorpo['data']) || !is_array($spaCorpo['data'])) {
        return [
            'erro'        => 'resposta inesperada da Spa ao listar avaliações',
            'status_http' => wp_remote_retrieve_response_code($spa),
            'corpo'       => wp_remote_retrieve_body($spa),
        ];
    }
    $telefonesNaSpa = [];
    foreach ($spaCorpo['data'] as $avaliacao) {
        $telefonesNaSpa[sbelt_telefone_comparavel($avaliacao['telefone'] ?? '')] = true;
    }

    // 3. cruza os dois
    $lista = [];
    foreach ($eventos as $evento) {
        if (empty($evento['contactId']) || ($evento['appointmentStatus'] ?? '') === 'cancelled') {
            continue;
        }
        $contato  = sbelt_ghl_get('https://services.leadconnectorhq.com/contacts/' . rawurlencode($evento['contactId']), $unidade);
        $dados    = $contato['body']['contact'] ?? [];
        $telefone = $dados['phone'] ?? '';
        try {
            $data = sbelt_data_sao_paulo($evento['startTime'] ?? '')->format('d/m/Y H:i');
        } catch (Exception $e) {
            $data = (string) ($evento['startTime'] ?? '');
        }
        $lista[] = [
            'nome'       => trim(($dados['firstName'] ?? '') . ' ' . ($dados['lastName'] ?? '')) ?: ($evento['title'] ?? ''),
            'telefone'   => $telefone,
            'data'       => $data,
            'contact_id' => $evento['contactId'],
            'na_spa'     => isset($telefonesNaSpa[sbelt_telefone_comparavel($telefone)]),
        ];
    }

    // pendentes primeiro
    usort($lista, function ($a, $b) {
        return $a['na_spa'] <=> $b['na_spa'];
    });
    $pendentes = count(array_filter($lista, function ($linha) {
        return !$linha['na_spa'];
    }));

    return [
        'total_ghl'       => count($lista),
        'total_spa'       => count($spaCorpo['data']),
        'total_ok'        => count($lista) - $pendentes,
        'total_pendentes' => $pendentes,
        'lista'           => $lista,
        'spa'             => $spaCorpo['data'],
    ];
}

function sbelt_reprocessar_contatos($ids, $franquiaId, $simular) {
    $unidade = spa_get_unidade($franquiaId);
    if (!$unidade) {
        return ['erro' => 'unidade inválida'];
    }
    if (empty($ids)) {
        return ['erro' => 'nenhum contact_id informado'];
    }

    $resultados = [];
    foreach ($ids as $contactId) {
        $contactId = sanitize_text_field($contactId);

        // 1. dados do contato no GHL da unidade
        $resposta = sbelt_ghl_get('https://services.leadconnectorhq.com/contacts/' . rawurlencode($contactId), $unidade);
        if (isset($resposta['erro'])) {
            $resultados[$contactId] = $resposta;
            continue;
        }
        $contato = $resposta['body']['contact'] ?? null;
        if (!$contato) {
            $resultados[$contactId] = ['erro' => 'contato não encontrado nessa unidade', 'status_http' => $resposta['status']];
            continue;
        }
        $nome = trim(($contato['firstName'] ?? '') . ' ' . ($contato['lastName'] ?? ''))
            ?: ($contato['name'] ?? $contato['contactName'] ?? '');

        // 2. agendamento do contato no calendário da unidade
        $agendamento = ghl_buscar_agendamento_por_contato_na_unidade($contactId, $unidade);
        if (empty($agendamento['encontrado'])) {
            $resultados[$contactId] = ['nome' => $nome, 'erro' => 'agendamento não encontrado no calendário da unidade'];
            continue;
        }
        try {
            $data = sbelt_data_sao_paulo($agendamento['dataHoraInicio']);
        } catch (Exception $e) {
            $resultados[$contactId] = ['nome' => $nome, 'erro' => 'data inválida: ' . $agendamento['dataHoraInicio']];
            continue;
        }

        $dados = [
            'nome'           => $nome,
            'telefone'       => $contato['phone'] ?? '',
            'email'          => $contato['email'] ?? '',
            'franquiaId'     => $franquiaId,
            'contact_id'     => $contactId,
            'datahorainicio' => $data->format('Y-m-d H:i:s'),
            'datahorafim'    => (clone $data)->modify('+15 minutes')->format('Y-m-d H:i:s'),
        ];

        if ($simular) {
            $resultados[$contactId] = ['simulacao' => true, 'seria_enviado' => $dados];
            continue;
        }

        // 3. mesmo caminho do webhook "Agendamento Confirmado"
        $req = new WP_REST_Request('POST', '/leads/v1/ghl-agendamento');
        $req->set_header('Content-Type', 'application/json');
        $req->set_body(wp_json_encode($dados));
        $retorno = leads_v1_ghl_agendamento_callback($req);

        $resultados[$contactId] = [
            'enviado'  => $dados,
            'status'   => $retorno->get_status(),
            'resposta' => $retorno->get_data(),
        ];
    }

    return $resultados;
}
