<?php
/**
 * FALTAS SPA -> GHL (tag "Faltaram")
 * Tela no painel: Ferramentas > Faltas Spa (só administradores).
 *
 * 1. "Buscar": lista as avaliações da Spa da unidade no período escolhido e
 *    mostra quem está com status de falta, e se já tem a tag no GHL.
 * 2. "Colocar a tag": para os marcados, acha o contato no GHL da unidade
 *    pelo telefone (ou cria, se não existir) e adiciona a tag "Faltaram".
 *    Nada é apagado nem sobrescrito no contato - só a tag é acrescentada.
 * 3. Automático (opcional): uma vez por dia, faz o mesmo para todas as
 *    unidades com as faltas dos últimos 7 dias.
 *
 * Exige o scope contacts.write no Private Integration Token da unidade.
 * Depende do snippet principal (integracao-spa-solutions v5) ativo.
 * No Code Snippets: "Run snippet everywhere" (o automático roda fora do painel).
 */

const SBELT_FALTA_TAG = 'Faltaram';

add_action('admin_menu', function () {
    add_management_page('Faltas Spa', 'Faltas Spa', 'manage_options', 'sbelt-faltas', 'sbelt_falta_pagina');
});

// ---------------------------------------------------------------------
// Apoio
// ---------------------------------------------------------------------

/** Status da Spa que contam como falta (sem acento, minúsculo). */
function sbelt_falta_eh_falta($status) {
    $s = function_exists('remove_accents') ? remove_accents((string) $status) : (string) $status;
    $s = strtolower($s);
    return strpos($s, 'falt') !== false || strpos($s, 'nao compareceu') !== false;
}

/** Telefone no formato do GHL (+55DDDNUMERO). */
function sbelt_falta_telefone_ghl($telefone) {
    $digitos = preg_replace('/\D/', '', (string) $telefone);
    if ($digitos === '') return '';
    if (!(strlen($digitos) > 11 && strpos($digitos, '55') === 0)) {
        $digitos = '55' . $digitos;
    }
    return '+' . $digitos;
}

function sbelt_falta_ghl($metodo, $url, $unidade, $corpo = null) {
    $args = [
        'method'  => $metodo,
        'headers' => [
            'Authorization' => 'Bearer ' . $unidade['ghl_api_token'],
            'Version'       => GHL_API_VERSION,
            'Accept'        => 'application/json',
        ],
        'timeout' => 20,
    ];
    if ($corpo !== null) {
        $args['headers']['Content-Type'] = 'application/json';
        $args['body'] = wp_json_encode($corpo);
    }
    $resposta = wp_remote_request($url, $args);
    if (is_wp_error($resposta)) {
        return ['erro' => 'GHL: ' . $resposta->get_error_message()];
    }
    return [
        'status' => wp_remote_retrieve_response_code($resposta),
        'body'   => json_decode(wp_remote_retrieve_body($resposta), true),
    ];
}

/** Avaliações da Spa da unidade entre duas datas (Y-m-d). */
function sbelt_falta_avaliacoes($franquiaId, $de, $ate) {
    $corpo = wp_json_encode(['franquiaId' => (int) $franquiaId, 'dataInicial' => $de, 'dataFinal' => $ate]);
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
        return ['erro' => 'resposta inesperada da Spa', 'status_http' => wp_remote_retrieve_response_code($spa), 'corpo' => wp_remote_retrieve_body($spa)];
    }
    return ['lista' => $json['data']];
}

/** Contato do GHL pelo telefone (ou null). */
function sbelt_falta_achar_contato($telefoneGhl, $unidade) {
    $r = sbelt_falta_ghl('GET', add_query_arg([
        'locationId' => $unidade['ghl_location_id'],
        'number'     => $telefoneGhl,
    ], 'https://services.leadconnectorhq.com/contacts/search/duplicate'), $unidade);
    return $r['body']['contact'] ?? null;
}

// ---------------------------------------------------------------------
// Busca e marcação
// ---------------------------------------------------------------------

/**
 * Faltas da Spa no período, uma linha por pessoa (a falta mais recente),
 * com a situação no GHL: já tem a tag / contato existe sem a tag / não existe.
 */
function sbelt_falta_buscar($franquiaId, $de, $ate, $consultarGhl = true) {
    $unidade = spa_get_unidade($franquiaId);
    if (!$unidade) {
        return ['erro' => 'unidade inválida'];
    }
    $spa = sbelt_falta_avaliacoes($franquiaId, $de, $ate);
    if (isset($spa['erro'])) {
        return $spa;
    }

    $status = [];
    $porPessoa = [];
    foreach ($spa['lista'] as $avaliacao) {
        $st = (string) ($avaliacao['status'] ?? '');
        $status[$st] = ($status[$st] ?? 0) + 1;
        if (!sbelt_falta_eh_falta($st)) continue;
        $telefone = sbelt_falta_telefone_ghl($avaliacao['telefone'] ?? '');
        if ($telefone === '') continue;
        if (!isset($porPessoa[$telefone]) || ($avaliacao['dataHoraInicio'] ?? '') > ($porPessoa[$telefone]['dataHoraInicio'] ?? '')) {
            $porPessoa[$telefone] = $avaliacao;
        }
    }

    $lista = [];
    foreach ($porPessoa as $telefone => $avaliacao) {
        $linha = [
            'telefone_ghl' => $telefone,
            'nome'         => $avaliacao['nome'] ?? '',
            'telefone'     => $avaliacao['telefone'] ?? '',
            'data'         => $avaliacao['dataHoraInicio'] ?? '',
            'status'       => $avaliacao['status'] ?? '',
            'contact_id'   => null,
            'situacao'     => 'nao_consultado',
        ];
        if ($consultarGhl) {
            $contato = sbelt_falta_achar_contato($telefone, $unidade);
            if (!$contato) {
                $linha['situacao'] = 'sem_contato';
            } else {
                $linha['contact_id'] = $contato['id'] ?? null;
                $tags = array_map('strtolower', (array) ($contato['tags'] ?? []));
                $linha['situacao'] = in_array(strtolower(SBELT_FALTA_TAG), $tags, true) ? 'com_tag' : 'sem_tag';
            }
        }
        $lista[] = $linha;
    }

    $ordem = ['sem_tag' => 0, 'sem_contato' => 1, 'nao_consultado' => 2, 'com_tag' => 3];
    usort($lista, function ($a, $b) use ($ordem) {
        return [$ordem[$a['situacao']], $a['data']] <=> [$ordem[$b['situacao']], $b['data']];
    });

    return ['unidade' => $unidade['nome'], 'status_na_spa' => $status, 'total_avaliacoes' => count($spa['lista']), 'lista' => $lista];
}

/** Adiciona a tag (ou cria o contato com a tag) para os telefones informados. */
function sbelt_falta_marcar($franquiaId, $telefones, $de, $ate) {
    $unidade = spa_get_unidade($franquiaId);
    if (!$unidade) {
        return ['erro' => 'unidade inválida'];
    }
    $busca = sbelt_falta_buscar($franquiaId, $de, $ate, false);
    if (isset($busca['erro'])) {
        return $busca;
    }
    $faltas = [];
    foreach ($busca['lista'] as $linha) {
        $faltas[$linha['telefone_ghl']] = $linha;
    }

    $resultado = [];
    foreach ($telefones as $telefone) {
        if (!isset($faltas[$telefone])) {
            $resultado[] = ['telefone' => $telefone, 'acao' => 'ignorado: não está como falta na Spa no período'];
            continue;
        }
        $linha   = $faltas[$telefone];
        $contato = sbelt_falta_achar_contato($telefone, $unidade);
        if ($contato) {
            $r = sbelt_falta_ghl('POST', 'https://services.leadconnectorhq.com/contacts/' . rawurlencode($contato['id']) . '/tags', $unidade, ['tags' => [SBELT_FALTA_TAG]]);
            $acao = 'tag adicionada';
        } else {
            $partes = explode(' ', trim((string) $linha['nome']), 2);
            $r = sbelt_falta_ghl('POST', 'https://services.leadconnectorhq.com/contacts/', $unidade, [
                'locationId' => $unidade['ghl_location_id'],
                'firstName'  => $partes[0] ?? '',
                'lastName'   => $partes[1] ?? '',
                'phone'      => $telefone,
                'tags'       => [SBELT_FALTA_TAG],
                'source'     => 'Spa Solutions - falta na avaliação',
            ]);
            $acao = 'contato criado com a tag';
        }
        if (isset($r['erro']) || ($r['status'] ?? 0) >= 400) {
            $acao = ($r['status'] ?? 0) === 401
                ? 'ERRO: o token da unidade não tem permissão contacts.write'
                : 'ERRO: ' . wp_json_encode($r, JSON_UNESCAPED_UNICODE);
        }
        $resultado[] = ['nome' => $linha['nome'], 'telefone' => $linha['telefone'], 'data' => $linha['data'], 'acao' => $acao];
    }
    return ['lista' => $resultado];
}

// ---------------------------------------------------------------------
// Automático (uma vez por dia)
// ---------------------------------------------------------------------

add_action('init', function () {
    $ligado   = (bool) get_option('sbelt_falta_auto', false);
    $agendado = wp_next_scheduled('sbelt_falta_diario');
    if ($ligado && !$agendado) {
        wp_schedule_event(time() + 600, 'daily', 'sbelt_falta_diario');
    } elseif (!$ligado && $agendado) {
        wp_clear_scheduled_hook('sbelt_falta_diario');
    }
});

add_action('sbelt_falta_diario', 'sbelt_falta_diario');

function sbelt_falta_diario() {
    if (!get_option('sbelt_falta_auto', false)) return;
    $de  = wp_date('Y-m-d', time() - 7 * DAY_IN_SECONDS);
    $ate = wp_date('Y-m-d');
    $relatorio = [];
    foreach (SBELT_UNIDADES as $franquiaId => $unidade) {
        $busca = sbelt_falta_buscar($franquiaId, $de, $ate);
        if (isset($busca['erro'])) {
            $relatorio[$unidade['nome']] = $busca;
            continue;
        }
        $pendentes = [];
        foreach ($busca['lista'] as $linha) {
            if ($linha['situacao'] !== 'com_tag') $pendentes[] = $linha['telefone_ghl'];
        }
        $relatorio[$unidade['nome']] = $pendentes ? sbelt_falta_marcar($franquiaId, $pendentes, $de, $ate) : ['lista' => []];
    }
    update_option('sbelt_falta_ultimo', ['quando' => current_time('mysql'), 'relatorio' => $relatorio], false);
}

// ---------------------------------------------------------------------
// Tela
// ---------------------------------------------------------------------

function sbelt_falta_pagina() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $franquiaId = 10;
    $de         = wp_date('Y-m-d', time() - 30 * DAY_IN_SECONDS);
    $ate        = wp_date('Y-m-d');
    $busca      = null;
    $marcacao   = null;
    $aviso      = '';

    if (!empty($_POST)) {
        check_admin_referer('sbelt_falta');
        $franquiaId = (int) ($_POST['franquia_id'] ?? 10);
        $de  = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_POST['de'] ?? '') ? $_POST['de'] : $de;
        $ate = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_POST['ate'] ?? '') ? $_POST['ate'] : $ate;

        if (isset($_POST['marcar'])) {
            $telefones = array_map('sanitize_text_field', (array) wp_unslash($_POST['tel'] ?? []));
            $marcacao  = $telefones ? sbelt_falta_marcar($franquiaId, $telefones, $de, $ate) : ['erro' => 'nenhuma pessoa marcada'];
        }
        if (isset($_POST['salvar_auto'])) {
            update_option('sbelt_falta_auto', !empty($_POST['auto']), false);
            $aviso = !empty($_POST['auto']) ? 'Marcação automática diária LIGADA.' : 'Marcação automática desligada.';
        }
        if (isset($_POST['buscar']) || isset($_POST['marcar'])) {
            $busca = sbelt_falta_buscar($franquiaId, $de, $ate);
        }
    }

    $rotulos = [
        'sem_tag'        => ['FALTOU - sem a tag no GHL', '#b32d2e'],
        'sem_contato'    => ['FALTOU - não existe no GHL (será criado)', '#996800'],
        'com_tag'        => ['JÁ TEM A TAG', '#00a32a'],
        'nao_consultado' => ['—', '#646970'],
    ];
    $ultimo = get_option('sbelt_falta_ultimo');
    ?>
    <div class="wrap">
        <h1>Faltas da Spa → tag "<?php echo esc_html(SBELT_FALTA_TAG); ?>" no GHL</h1>
        <?php if ($aviso) : ?><div class="notice notice-info"><p><?php echo esc_html($aviso); ?></p></div><?php endif; ?>

        <form method="post">
            <?php wp_nonce_field('sbelt_falta'); ?>
            <p>
                <label>Unidade:
                    <select name="franquia_id">
                        <?php foreach (SBELT_UNIDADES as $id => $unidade) : ?>
                            <option value="<?php echo (int) $id; ?>" <?php selected($franquiaId, $id); ?>><?php echo esc_html($id . ' - ' . $unidade['nome']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label>De: <input type="date" name="de" value="<?php echo esc_attr($de); ?>"></label>
                <label>Até: <input type="date" name="ate" value="<?php echo esc_attr($ate); ?>"></label>
                <button type="submit" name="buscar" class="button button-primary">Buscar</button>
            </p>

            <?php if ($marcacao !== null) : ?>
                <h2>Resultado</h2>
                <?php if (isset($marcacao['erro'])) : ?>
                    <div class="notice notice-error"><p><?php echo esc_html(is_string($marcacao['erro']) ? $marcacao['erro'] : wp_json_encode($marcacao)); ?></p></div>
                <?php else : ?>
                    <table class="widefat striped" style="margin-bottom:16px">
                        <thead><tr><th>Nome</th><th>Telefone</th><th>Avaliação</th><th>Ação</th></tr></thead>
                        <tbody>
                        <?php foreach ($marcacao['lista'] as $linha) : ?>
                            <tr>
                                <td><?php echo esc_html($linha['nome'] ?? ''); ?></td>
                                <td><?php echo esc_html($linha['telefone'] ?? ''); ?></td>
                                <td><?php echo esc_html($linha['data'] ?? ''); ?></td>
                                <td><strong><?php echo esc_html($linha['acao']); ?></strong></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            <?php endif; ?>

            <?php if ($busca !== null && isset($busca['erro'])) : ?>
                <div class="notice notice-error"><pre><?php echo esc_html(wp_json_encode($busca, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)); ?></pre></div>
            <?php elseif ($busca !== null) : ?>
                <?php
                $totais = ['sem_tag' => 0, 'sem_contato' => 0, 'com_tag' => 0];
                foreach ($busca['lista'] as $linha) {
                    if (isset($totais[$linha['situacao']])) $totais[$linha['situacao']]++;
                }
                ?>
                <p style="font-size:14px">
                    <?php echo esc_html($busca['unidade']); ?>: <strong><?php echo (int) $busca['total_avaliacoes']; ?></strong> avaliação(ões) na Spa no período ·
                    <strong><?php echo count($busca['lista']); ?></strong> pessoa(s) com falta ·
                    <span style="color:#b32d2e"><strong><?php echo (int) $totais['sem_tag']; ?></strong> sem a tag</span> ·
                    <span style="color:#996800"><strong><?php echo (int) $totais['sem_contato']; ?></strong> não existem no GHL</span> ·
                    <span style="color:#00a32a"><strong><?php echo (int) $totais['com_tag']; ?></strong> já com a tag</span>
                </p>
                <p style="color:#646970">Status que a Spa usou no período:
                    <?php foreach ($busca['status_na_spa'] as $status => $qtd) : ?>
                        <code><?php echo esc_html($status ?: '(vazio)'); ?></code> (<?php echo (int) $qtd; ?>)
                    <?php endforeach; ?>
                    — contam como falta os que têm "falt" ou "não compareceu" no nome.
                </p>
                <p>
                    <button type="button" class="button" onclick="document.querySelectorAll('.sbelt-falta-pendente').forEach(function(c){c.checked=true})">Marcar todos sem a tag</button>
                    <button type="button" class="button" onclick="document.querySelectorAll('.sbelt-falta').forEach(function(c){c.checked=false})">Desmarcar todos</button>
                </p>
                <table class="widefat striped">
                    <thead><tr><th style="width:30px"></th><th>Situação</th><th>Nome (Spa)</th><th>Telefone</th><th>Avaliação</th><th>Status na Spa</th></tr></thead>
                    <tbody>
                    <?php foreach ($busca['lista'] as $linha) : $r = $rotulos[$linha['situacao']]; ?>
                        <tr>
                            <td>
                                <?php if ($linha['situacao'] !== 'com_tag') : ?>
                                    <input type="checkbox" name="tel[]" value="<?php echo esc_attr($linha['telefone_ghl']); ?>" class="sbelt-falta sbelt-falta-pendente">
                                <?php endif; ?>
                            </td>
                            <td><strong style="color:<?php echo esc_attr($r[1]); ?>"><?php echo esc_html($r[0]); ?></strong></td>
                            <td><?php echo esc_html($linha['nome']); ?></td>
                            <td><?php echo esc_html($linha['telefone']); ?></td>
                            <td><?php echo esc_html($linha['data']); ?></td>
                            <td><?php echo esc_html($linha['status']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
                <p><button type="submit" name="marcar" class="button button-primary">Colocar a tag "<?php echo esc_html(SBELT_FALTA_TAG); ?>" nos marcados</button></p>
            <?php endif; ?>
        </form>

        <hr>
        <h2>Automático (uma vez por dia)</h2>
        <form method="post">
            <?php wp_nonce_field('sbelt_falta'); ?>
            <p>
                <label><input type="checkbox" name="auto" value="1" <?php checked((bool) get_option('sbelt_falta_auto', false)); ?>> Ligado — todo dia, para todas as unidades, coloca a tag em quem faltou nos últimos 7 dias</label>
                <button type="submit" name="salvar_auto" class="button">Salvar</button>
            </p>
            <?php if (is_array($ultimo)) : ?>
                <p>Última execução: <?php echo esc_html($ultimo['quando']); ?></p>
                <pre style="background:#fff;padding:12px;overflow:auto;max-height:300px"><?php echo esc_html(wp_json_encode($ultimo['relatorio'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)); ?></pre>
            <?php endif; ?>
        </form>
    </div>
    <?php
}
