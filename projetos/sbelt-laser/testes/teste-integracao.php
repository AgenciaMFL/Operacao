<?php
// Stubs mínimos de WordPress para exercitar os callbacks reais do snippet.
const MINUTE_IN_SECONDS = 60; const HOUR_IN_SECONDS = 3600; const DAY_IN_SECONDS = 86400;
$T = []; $O = []; $CHAMADAS = []; $FILA = [];
function add_action($h, $f) {} function register_rest_route(...$a) {}
function get_transient($k) { global $T; return $T[$k] ?? false; }
function set_transient($k, $v, $t) { global $T; $T[$k] = $v; }
function get_option($k, $d = false) { global $O; return $O[$k] ?? $d; }
function update_option($k, $v, $a = null) { global $O; $O[$k] = $v; }
function current_time($x) { return '2026-10-20 10:00:00'; }
function sanitize_text_field($s) { return trim((string) $s); }
function sanitize_email($s) { return trim((string) $s); }
function is_wp_error($x) { return false; }
function add_query_arg($q, $u) { return $u . '?' . http_build_query($q); }
function wp_remote_retrieve_body($r) { return $r['body']; }
function wp_remote_retrieve_response_code($r) { return $r['code']; }
function wp_remote_retrieve_header($r, $h) { return $r['headers'][$h] ?? ''; }
function responder($url, $args) { global $CHAMADAS, $FILA; $CHAMADAS[] = [$url, $args]; return array_shift($FILA) ?? ['code'=>200,'body'=>'{}','headers'=>[]]; }
function wp_remote_post($u, $a) { return responder($u, $a); }
function wp_remote_request($u, $a) { return responder($u, $a); }
function wp_remote_get($u, $a) { return responder($u, $a); }
class WP_REST_Response { public $data, $status; function __construct($d, $s = 200) { $this->data = $d; $this->status = $s; } function get_status() { return $this->status; } function get_data() { return $this->data; } }
class WP_REST_Request { private $b; function __construct($b) { $this->b = $b; } function get_json_params() { return json_decode($this->b, true); } function get_body_params() { return []; } function get_body() { return $this->b; } function get_headers() { return []; } function get_param($k) { return null; } }
require $argv[1]; // caminho do PHP de integração

function ok($nome, $cond) { echo ($cond ? 'PASSOU ' : 'FALHOU ') . $nome . "\n"; if (!$cond) $GLOBALS['falhou'] = true; }
$tok = ['code'=>200,'body'=>str_repeat('t', 40),'headers'=>[]];

// payload igual ao que o GHL manda, com Custom Data incompleto (só franquiaId)
$base = ['full_name'=>'Maria Teste','first_name'=>'Maria','phone'=>'+5521999990001','email'=>'m@t.com','contact_id'=>'C1',
         'location'=>['id'=>'E0WCDN9MyksqIgQyNX70'],'calendar'=>['startTime'=>'2026-10-21T15:00:00-03:00','endTime'=>'2026-10-21T15:15:00-03:00'],
         'customData'=>['franquiaId'=>'10']];

// 1. agendamento com Custom Data incompleto + token vencido (401) + lead novo com id só no header Location
$T = []; $O = []; $CHAMADAS = [];
$FILA = [$tok,                                                    // token (cache vazio)
         ['code'=>201,'body'=>'','headers'=>['location'=>'http://spa/api/Lead/777']], // cadastro de emergência
         ['code'=>401,'body'=>'','headers'=>[]],                  // agendar: token vencido
         $tok,                                                    // token novo
         ['code'=>201,'body'=>'{"sessaoAvaliacaoId":1}','headers'=>[]], // agendar de novo: ok
         ['code'=>401,'body'=>'{}','headers'=>[]]];               // escrita no GHL (sem scope)
$r = leads_v1_ghl_agendamento_callback(new WP_REST_Request(json_encode($base)));
ok('agendamento com Custom Data incompleto e token vencido dá 200', $r->get_status() === 200);
ok('lead id lido do header Location (777)', ($r->get_data()['leadId'] ?? null) === 777);
$agendar = array_values(array_filter($CHAMADAS, fn($c) => str_contains($c[0], 'SalvarSessaoAvaliacao')));
$corpo = json_decode($agendar[1][1]['body'], true);
ok('data enviada à Spa no formato Y-m-d H:i:s (15:00)', $corpo['dataHoraInicio'] === '2026-10-21 15:00:00' && $corpo['dataHoraFim'] === '2026-10-21 15:15:00');
ok('franquiaId 10 enviado à Spa', $corpo['franquiaId'] === 10);

// 2. bloqueio de duplicado: marcado pelo webhook (+55...), consultado sem 55
ok('ja-agendou encontra o telefone sem 55', spa_verificar_ja_agendou('21999990001', 10));
$T['spa_ja_agendou_9_5599988887777'] = true; // marcação antiga, gravada com 55
ok('ja-agendou encontra marcação antiga com 55', spa_verificar_ja_agendou('99988887777', 9));

// 3. Spa recusa o horário (400 em texto puro) -> 422 com a mensagem
$T = ['spa_solutions_token' => str_repeat('t', 40), 'spa_lead_5521999990001' => 777]; $O = [];
$FILA = [['code'=>400,'body'=>'Horário Indisponível para agendamento!','headers'=>[]]];
$r = leads_v1_ghl_agendamento_callback(new WP_REST_Request(json_encode($base)));
ok('recusa da Spa vira 422 (GHL não fica repetindo)', $r->get_status() === 422);
ok('mensagem da Spa preservada', ($r->get_data()['detalhe']['body'] ?? '') === 'Horário Indisponível para agendamento!');
ok('falha registrada para o /debug', ($O['spa_ultimas_falhas'][0]['rota'] ?? '') === 'ghl-agendamento');

// 4. lead sem franquiaId no Custom Data: unidade descoberta pelo Location ID
$T = ['spa_solutions_token' => str_repeat('t', 40)]; $O = []; $CHAMADAS = [];
$lead = $base; $lead['customData'] = [];
$FILA = [['code'=>201,'body'=>'{"id":888}','headers'=>[]], ['code'=>401,'body'=>'{}','headers'=>[]]];
$r = leads_v1_ghl_lead_callback(new WP_REST_Request(json_encode($lead)));
ok('lead sem Custom Data nenhum dá 200', $r->get_status() === 200);
ok('unidade 10 descoberta pelo Location ID', ($r->get_data()['franquiaId'] ?? null) === 10);
$cad = json_decode($CHAMADAS[0][1]['body'], true);
ok('nome e telefone vieram dos dados padrão do GHL', $cad['Nome'] === 'Maria Teste' && $cad['Telefone'] === '+5521999990001');

// 5. unidade desconhecida não vai mais como FranquiaId 0
$T = []; $O = []; $CHAMADAS = []; $FILA = [];
$x = $base; $x['customData'] = ['franquiaId' => '99']; $x['location'] = ['id' => 'OUTRA'];
$r = leads_v1_ghl_lead_callback(new WP_REST_Request(json_encode($x)));
ok('unidade desconhecida é recusada sem chamar a Spa', $r->get_status() === 400 && count($CHAMADAS) === 0);

// 6. Custom Data completo (como está na Imperatriz) continua igual
$T = ['spa_solutions_token' => str_repeat('t', 40), 'spa_lead_5599988887777' => 555]; $O = []; $CHAMADAS = [];
$imp = ['customData'=>['nome'=>'Ana','telefone'=>'+5599988887777','franquiaId'=>'9','datahorainicio'=>'2026-10-22 08:30:00']];
$FILA = [['code'=>201,'body'=>'{}','headers'=>[]]];
$r = leads_v1_ghl_agendamento_callback(new WP_REST_Request(json_encode($imp)));
$corpo = json_decode($CHAMADAS[0][1]['body'], true);
ok('Imperatriz (Custom Data completo) segue funcionando', $r->get_status() === 200 && $corpo['franquiaId'] === 9 && $corpo['dataHoraInicio'] === '2026-10-22 08:30:00' && $corpo['dataHoraFim'] === '2026-10-22 08:45:00');

exit(empty($falhou) ? 0 : 1);
