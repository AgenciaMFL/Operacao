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
  if (preg_match('~/api/Lead/(\d+)$~', $u, $m)) { usleep(500000); $GLOBALS['LEAD_GETS'][] = (int) $m[1]; return isset($LEADS[$m[1]]) ? ['code'=>200,'body'=>json_encode($LEADS[$m[1]])] : ['code'=>404,'body'=>'']; }
  return wp_remote_request($u, ['method'=>'GET'] + $a);
}

require $argv[1]; require $argv[2];
$AVALIACOES = [];
for ($i = 1; $i <= 100; $i++) $AVALIACOES[] = ['leadId'=>20000+$i,'nome'=>"P$i",'telefone'=>sprintf('(99) 9%04d-%04d',$i,$i),'dataHoraInicio'=>'2026-10-10T09:00:00','status'=>'Agendado'];
foreach ($AVALIACOES as $a) $LEADS[(string)$a['leadId']] = ['status'=>'Avaliação faltou'];
$t = microtime(true);
$b = sbelt_falta_buscar(9, '2026-10-01', '2026-10-20');
$seg = microtime(true) - $t;
printf("busca: %.1fs | leads ainda por conferir: %d | faltas achadas nesta busca: %d\n", $seg, $b['leads_pendentes'], count($b['lista']));
echo ($seg < 20 && $b['leads_pendentes'] > 0) ? "PASSOU a busca para perto de 15s e avisa que é parcial\n" : "FALHOU limite de tempo\n";
