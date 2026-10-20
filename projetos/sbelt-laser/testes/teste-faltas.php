<?php
// Stubs de WordPress + "mundo" simulado (Spa e GHL da Pátio) para a tela de faltas.
const MINUTE_IN_SECONDS = 60; const HOUR_IN_SECONDS = 3600; const DAY_IN_SECONDS = 86400;
$T = []; $O = []; $CHAMADAS_GHL = [];
function add_action(...$a) {} function register_rest_route(...$a) {}
function get_transient($k) { global $T; return $T[$k] ?? false; }
function set_transient($k, $v, $t) { global $T; $T[$k] = $v; }
function get_option($k, $d = false) { global $O; return $O[$k] ?? $d; }
function update_option($k, $v, $a = null) { global $O; $O[$k] = $v; }
function current_time($x) { return '2026-10-27 08:00:00'; }
function sanitize_text_field($s) { return trim((string) $s); } function sanitize_email($s) { return $s; }
function is_wp_error($x) { return false; }
function add_query_arg($q, $u) { return $u . '?' . http_build_query($q); }
function wp_json_encode($d, $f = 0) { return json_encode($d, $f); }
function wp_date($f, $t = null) { return date($f, $t ?? time()); }
function remove_accents($s) { return iconv('UTF-8', 'ASCII//TRANSLIT', $s); }
function wp_remote_retrieve_body($r) { return $r['body']; }
function wp_remote_retrieve_response_code($r) { return $r['code']; }
function wp_remote_retrieve_header($r, $h) { return ''; }
class WP_REST_Response { public $data, $status; function __construct($d, $s = 200) { $this->data = $d; $this->status = $s; } }

$AVALIACOES = [
  ['nome'=>'Ana Lima','telefone'=>'(21) 97777-6666','dataHoraInicio'=>'2026-10-21T18:30:00','status'=>'Falta'],      // contato existe sem tag
  ['nome'=>'Bia Souza','telefone'=>'(21) 96666-5555','dataHoraInicio'=>'2026-10-22T10:00:00','status'=>'Faltou'],    // já tem a tag
  ['nome'=>'Caio Reis','telefone'=>'(21) 95555-4444','dataHoraInicio'=>'2026-10-23T11:00:00','status'=>'Falta'],      // não existe no GHL
  ['nome'=>'Duda Melo','telefone'=>'(21) 94444-3333','dataHoraInicio'=>'2026-10-21T09:00:00','status'=>'Compareceu'], // não faltou
  ['nome'=>'Ana Lima','telefone'=>'(21) 97777-6666','dataHoraInicio'=>'2026-10-24T09:00:00','status'=>'Falta'],      // mesma pessoa, 2ª falta
];
$CONTATOS = ['+5521977776666'=>['id'=>'CA','tags'=>['lead']], '+5521966665555'=>['id'=>'CB','tags'=>['Faltaram']]];
function wp_remote_post($u, $a) {
  global $AVALIACOES;
  if (str_contains($u, 'Login/Validar')) return ['code'=>200,'body'=>str_repeat('t', 40)];
  if (str_contains($u, 'ListarAgendamentosAvaliacao')) return ['code'=>200,'body'=>json_encode(['success'=>true,'data'=>$AVALIACOES])];
  return ['code'=>200,'body'=>'{}'];
}
function wp_remote_request($u, $a) {
  global $CONTATOS, $CHAMADAS_GHL;
  $CHAMADAS_GHL[] = [$a['method'], $u, $a['body'] ?? null];
  if (str_contains($u, 'search/duplicate')) { parse_str(parse_url($u, PHP_URL_QUERY), $q); return ['code'=>200,'body'=>json_encode(['contact'=>$CONTATOS[$q['number']] ?? null])]; }
  if (!empty($GLOBALS['SEM_SCOPE'])) return ['code'=>401,'body'=>'{"message":"The token is not authorized for this scope."}'];
  return ['code'=>201,'body'=>'{}'];
}
$LEADS = [];
function wp_remote_get($u, $a) {
  global $LEADS;
  if (preg_match('~/api/Lead/(\d+)$~', $u, $m)) { $GLOBALS['LEAD_GETS'][] = (int) $m[1]; return isset($LEADS[$m[1]]) ? ['code'=>200,'body'=>json_encode($LEADS[$m[1]])] : ['code'=>404,'body'=>'']; }
  return wp_remote_request($u, ['method'=>'GET'] + $a);
}

require $argv[1]; require $argv[2];
function ok($n, $c) { echo ($c ? 'PASSOU ' : 'FALHOU ') . $n . "\n"; if (!$c) $GLOBALS['falhou'] = true; }

$b = sbelt_falta_buscar(10, '2026-10-01', '2026-10-27');
$s = []; foreach ($b['lista'] as $l) $s[$l['nome']] = $l['situacao'];
ok('só quem tem status de falta entra (Compareceu fica de fora)', !isset($s['Duda Melo']) && count($b['lista']) === 3);
ok('mesma pessoa com 2 faltas aparece 1 vez só', count(array_filter($b['lista'], fn($l) => $l['nome'] === 'Ana Lima')) === 1);
ok('contato existe sem a tag = sem_tag', $s['Ana Lima'] === 'sem_tag');
ok('contato já com a tag = com_tag', $s['Bia Souza'] === 'com_tag');
ok('não existe no GHL = sem_contato', $s['Caio Reis'] === 'sem_contato');
ok('status encontrados na Spa listados', ($b['status_na_spa']['Falta'] ?? 0) === 3 && isset($b['status_na_spa']['Compareceu']));

$CHAMADAS_GHL = [];
$m = sbelt_falta_marcar(10, ['+5521977776666', '+5521955554444', '+5521944443333'], '2026-10-01', '2026-10-27');
$acoes = array_column($m['lista'], 'acao');
$posts = array_values(array_filter($CHAMADAS_GHL, fn($c) => $c[0] === 'POST'));
ok('contato existente: só acrescenta a tag (POST /contacts/{id}/tags)', $acoes[0] === 'tag adicionada' && str_contains($posts[0][1], '/contacts/CA/tags') && json_decode($posts[0][2], true) === ['tags' => ['Faltaram']]);
ok('não existe: cria contato com nome, telefone e a tag', $acoes[1] === 'contato criado com a tag' && json_decode($posts[1][2], true)['phone'] === '+5521955554444' && json_decode($posts[1][2], true)['firstName'] === 'Caio' && json_decode($posts[1][2], true)['tags'] === ['Faltaram']);
ok('telefone que não faltou é ignorado, nada é enviado', str_starts_with($acoes[2], 'ignorado') && count($posts) === 2);
ok('cria o contato na sub-conta da Pátio', json_decode($posts[1][2], true)['locationId'] === 'E0WCDN9MyksqIgQyNX70');

$GLOBALS['SEM_SCOPE'] = true;
$m = sbelt_falta_marcar(10, ['+5521977776666'], '2026-10-01', '2026-10-27');
ok('sem contacts.write mostra o erro claro', str_contains($m['lista'][0]['acao'], 'contacts.write'));
unset($GLOBALS['SEM_SCOPE']);

$O['sbelt_falta_auto'] = true; $CHAMADAS_GHL = [];
sbelt_falta_diario();
$posts = array_values(array_filter($CHAMADAS_GHL, fn($c) => $c[0] === 'POST'));
ok('automático marca os que faltam e pula quem já tem a tag', count($posts) >= 2 && !array_filter($posts, fn($p) => str_contains($p[1], '/contacts/CB/')));
ok('automático guarda o relatório', isset($O['sbelt_falta_ultimo']['quando']));

// Imperatriz: a falta está no LEAD ("Avaliação faltou"), a avaliação continua "Agendado"
$AVALIACOES = [
  ['leadId'=>14660,'nome'=>'Eliene Freire Da Silva Santos','telefone'=>'(99) 99173-7864','dataHoraInicio'=>'2026-10-17T09:00:00','status'=>'Agendado'],
  ['leadId'=>14632,'nome'=>'Analicy De Sousa Brito','telefone'=>'(99) 98464-6893','dataHoraInicio'=>'2026-10-17T10:00:00','status'=>'Agendado'],
  ['leadId'=>14700,'nome'=>'Compareceu Certinho','telefone'=>'(99) 91111-2222','dataHoraInicio'=>'2026-10-17T11:00:00','status'=>'Agendado'],
  ['leadId'=>14800,'nome'=>'Ainda Vai Vir','telefone'=>'(99) 93333-4444','dataHoraInicio'=>'2099-01-01T09:00:00','status'=>'Agendado'],
];
$LEADS = ['14660'=>['id'=>14660,'status'=>'Avaliação faltou'], '14632'=>['Id'=>14632,'Status'=>'Avaliação faltou'], '14700'=>['id'=>14700,'status'=>'Compareceu'], '14800'=>['id'=>14800,'status'=>'Agendado']];
$CONTATOS = ['+5599991737864'=>['id'=>'IE','tags'=>[]]];
$GLOBALS['LEAD_GETS'] = []; $T = [];
$b = sbelt_falta_buscar(9, '2026-10-01', '2026-10-20');
$nomes = array_column($b['lista'], 'nome');
ok('Imperatriz: falta lida do status do LEAD ("Avaliação faltou")', in_array('Eliene Freire Da Silva Santos', $nomes) && in_array('Analicy De Sousa Brito', $nomes));
ok('quem compareceu não entra', !in_array('Compareceu Certinho', $nomes));
ok('avaliação futura não consulta o lead', !in_array(14800, $GLOBALS['LEAD_GETS']));
ok('status dos leads aparecem na tela', ($b['status_leads']['Avaliação faltou'] ?? 0) === 2);

$O['sbelt_falta_tag'] = 'Falta'; $CHAMADAS_GHL = [];
$m = sbelt_falta_marcar(9, ['+5599991737864', '+5599984646893'], '2026-10-01', '2026-10-20');
$posts = array_values(array_filter($CHAMADAS_GHL, fn($c) => $c[0] === 'POST'));
ok('tag configurável: usa "Falta" no contato existente', json_decode($posts[0][2], true) === ['tags' => ['Falta']] && str_contains($posts[0][1], '/contacts/IE/tags'));
ok('cria contato na sub-conta da Imperatriz com a tag "Falta"', json_decode($posts[1][2], true)['locationId'] === 'qj2BSucIGAVOYtqGSRAL' && json_decode($posts[1][2], true)['tags'] === ['Falta']);
exit(empty($falhou) ? 0 : 1);
