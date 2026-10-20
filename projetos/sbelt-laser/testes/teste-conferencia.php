<?php
// Stubs de WordPress + carrega o PHP v5 real e o snippet de conferência.
const MINUTE_IN_SECONDS = 60; const HOUR_IN_SECONDS = 3600; const DAY_IN_SECONDS = 86400;
$T = []; $O = []; $EMAILS = []; $AGORA = 1792500000; $ENVIOS_SPA = [];
function add_action(...$a) {} function register_rest_route(...$a) {}
function get_transient($k) { global $T; return $T[$k] ?? false; }
function set_transient($k, $v, $t) { global $T; $T[$k] = $v; }
function get_option($k, $d = false) { global $O; return $O[$k] ?? $d; }
function update_option($k, $v, $a = null) { global $O; $O[$k] = $v; }
function current_time($x) { return date('Y-m-d H:i:s', $GLOBALS['AGORA']); }
function sanitize_text_field($s) { return trim((string) $s); }
function sanitize_email($s) { return trim((string) $s); }
function is_wp_error($x) { return false; }
function add_query_arg($q, $u) { return $u . '?' . http_build_query($q); }
function wp_json_encode($d, $f = 0) { return json_encode($d, $f); }
function wp_date($f, $t) { return date($f, $t); }
function remove_accents($s) { return iconv('UTF-8', 'ASCII//TRANSLIT', $s); }
function wp_mail($to, $s, $b) { $GLOBALS['EMAILS'][] = [$to, $s, $b]; return true; }
function wp_remote_retrieve_body($r) { return $r['body']; }
function wp_remote_retrieve_response_code($r) { return $r['code']; }
function wp_remote_retrieve_header($r, $h) { return $r['headers'][$h] ?? ''; }
class WP_REST_Response { public $data, $status; function __construct($d, $s = 200) { $this->data = $d; $this->status = $s; } function get_status() { return $this->status; } function get_data() { return $this->data; } }
class WP_REST_Request { private $b; function __construct(...$a) {} function set_header($k, $v) {} function set_body($b) { $this->b = $b; } function get_json_params() { return json_decode($this->b, true); } function get_body_params() { return []; } function get_body() { return $this->b; } function get_headers() { return []; } function get_param($k) { return null; } }

// "mundo" simulado: calendário do GHL, contatos e avaliações da Spa (unidade 10)
$EVENTOS = [
  ['contactId'=>'A','startTime'=>'2026-10-21T09:00:00-03:00'],               // na Spa pelo telefone
  ['contactId'=>'B','startTime'=>'2026-10-21T10:00:00-03:00'],               // cadastrado à mão, telefone diferente
  ['contactId'=>'C','startTime'=>'2026-10-21T11:00:00-03:00'],               // não tem
  ['contactId'=>'D','startTime'=>'2026-10-21T12:00:00-03:00'],               // não tem, mas ignorado
  ['contactId'=>'E','startTime'=>'2026-10-21T13:00:00-03:00','appointmentStatus'=>'cancelled'],
];
$CONTATOS = ['A'=>['firstName'=>'Cintia','lastName'=>'Santos','phone'=>'+5521987820307'],
             'B'=>['firstName'=>'Maria Eduarda','lastName'=>'da Silva','phone'=>'+5521911112222'],
             'C'=>['firstName'=>'Glauce','lastName'=>'Costa Gonçalves','phone'=>'+5591983366676'],
             'D'=>['firstName'=>'Jéssica','lastName'=>'Lima','phone'=>'+5521933334444'],
             'N'=>['firstName'=>'Nova','lastName'=>'Pessoa','phone'=>'+5521955556666']];
$AVALIACOES = [['nome'=>'Cintia Santos','telefone'=>'(21) 98782-0307','dataHoraInicio'=>'2026-10-21T09:00:00','status'=>'Agendado'],
               ['nome'=>'MARIA SILVA','telefone'=>'(21) 90000-0000','dataHoraInicio'=>'2026-10-21T10:00:00','status'=>'Agendado']];
function wp_remote_get($u, $a) {
  global $EVENTOS, $CONTATOS;
  if (str_contains($u, '/calendars/events')) return ['code'=>200,'body'=>json_encode(['events'=>$EVENTOS]),'headers'=>[]];
  $id = basename(parse_url($u, PHP_URL_PATH));
  return isset($CONTATOS[$id]) ? ['code'=>200,'body'=>json_encode(['contact'=>$CONTATOS[$id]]),'headers'=>[]] : ['code'=>404,'body'=>'{}','headers'=>[]];
}
function wp_remote_post($u, $a) {
  global $AVALIACOES, $ENVIOS_SPA;
  if (str_contains($u, 'Login/Validar')) return ['code'=>200,'body'=>str_repeat('t',40),'headers'=>[]];
  if (str_contains($u, 'ListarAgendamentosAvaliacao')) return ['code'=>200,'body'=>json_encode(['success'=>true,'data'=>$AVALIACOES]),'headers'=>[]];
  if (str_contains($u, '/api/Lead')) return ['code'=>201,'body'=>'{"id":900}','headers'=>[]];
  if (str_contains($u, "SalvarSessaoAvaliacao")) { if (!empty($GLOBALS["RECUSAR"])) return ["code"=>400,"body"=>"Horário Indisponível para agendamento!","headers"=>[]]; $ENVIOS_SPA[] = json_decode($a['body'], true); return ['code'=>201,'body'=>'{}','headers'=>[]]; }
  return ['code'=>200,'body'=>'{}','headers'=>[]];
}
function wp_remote_request($u, $a) { return ['code'=>401,'body'=>'{}','headers'=>[]]; }
function time_simulado() { return $GLOBALS['AGORA']; }

require $argv[1];   // PHP de integração v5
require $argv[2];   // snippet de conferência

function ok($n, $c) { echo ($c ? 'PASSOU ' : 'FALHOU ') . $n . "\n"; if (!$c) $GLOBALS['falhou'] = true; }
$sit = function ($r) { $m = []; foreach ($r['lista'] as $l) $m[$l['contact_id']] = $l['situacao']; return $m; };

$O['sbelt_conf_ignorados'] = ['D' => 'x'];
$r = sbelt_conf_cruzar(10); $m = $sit($r);
ok('telefone igual = JÁ NA SPA', $m['A'] === 'spa_telefone');
ok('telefone diferente mas nome bate (primeiro+último) = JÁ NA SPA pelo nome', $m['B'] === 'spa_nome');
ok('sem nada na Spa = NÃO TEM AINDA', $m['C'] === 'nao_tem');
ok('marcado como resolvido = IGNORADO', $m['D'] === 'ignorado');
ok('cancelado no GHL não aparece', !isset($m['E']));
ok('totais conferem', $r['totais'] === ['spa_telefone'=>1,'spa_nome'=>1,'ignorado'=>1,'nao_tem'=>1]);
ok('NÃO TEM AINDA vem primeiro na lista', $r['lista'][0]['situacao'] === 'nao_tem');

// verificação automática: C já estava pendente ao ligar (fica de fora); N é novo
$O['sbelt_conf_auto'] = ['ativo'=>true,'email'=>'equipe@x.com','base'=>['C'=>true],'visto'=>[]];
$EVENTOS[] = ['contactId'=>'N','startTime'=>'2026-10-22T09:00:00-03:00'];
// o "agora" do snippet é time(): os horários de outubro/2026 estão no futuro em relação a hoje
sbelt_conf_verificar();
ok('1ª passada: só anota a pessoa nova, não envia', count($ENVIOS_SPA) === 0 && isset($O['sbelt_conf_auto']['visto']['N']));
$O['sbelt_conf_auto']['visto']['N'] -= 2 * HOUR_IN_SECONDS; // passou mais de 1 hora
sbelt_conf_verificar();
ok('depois de 1 hora: envia só a pessoa nova (N)', count($ENVIOS_SPA) === 1 && $ENVIOS_SPA[0]['dataHoraInicio'] === '2026-10-22 09:00:00');
ok('pendente antigo (C) não é enviado automaticamente', count($ENVIOS_SPA) === 1);
ok('e-mail enviado com o resultado', count($EMAILS) === 1 && str_contains($EMAILS[0][2], 'Nova Pessoa'));
sbelt_conf_verificar();
ok('não reenvia a mesma pessoa de novo', count($ENVIOS_SPA) === 1);

// recusa da Spa vai pro e-mail com o motivo
$O['sbelt_conf_auto'] = ['ativo'=>true,'email'=>'equipe@x.com','base'=>[],'visto'=>['C'=>time() - 2 * HOUR_IN_SECONDS]];
$O['sbelt_conf_ignorados'] = ['D'=>'x']; $EMAILS = [];
function_exists('runkit') ;
$T['spa_lead_5591983366676'] = 901;
$GLOBALS['RECUSAR'] = true;
sbelt_conf_verificar();
ok('recusa da Spa aparece no e-mail com o motivo', count($EMAILS) === 1 && str_contains($EMAILS[0][2], 'RECUSADOS') && str_contains($EMAILS[0][2], 'Horário Indisponível'));
exit(empty($falhou) ? 0 : 1);
