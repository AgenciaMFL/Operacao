<?php
// Funções compartilhadas pela API de propostas (sessão, respostas JSON e armazenamento).
declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');

const ID_VALIDO = '/^[a-z0-9]{10}$/';
const TAMANHO_MAXIMO = 6 * 1024 * 1024; // 6 MB por proposta (a capa do vídeo pode vir como imagem)

function config(): array {
  static $c = null;
  if ($c === null) {
    $arquivo = __DIR__ . '/config.php';
    if (!is_file($arquivo)) responder(['erro' => 'Servidor sem configuração (api/config.php).'], 500);
    $c = require $arquivo;
  }
  return $c;
}

function responder(array $dados, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  header('X-Robots-Tag: noindex, nofollow');
  echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function iniciarSessao(): void {
  if (session_status() === PHP_SESSION_ACTIVE) return;
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  session_name('MFLSESSAO');
  session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
  session_start();
}

function usuarioAtual(): ?array {
  iniciarSessao();
  $email = $_SESSION['email'] ?? null;
  $usuarios = config()['usuarios'];
  if (!$email || !isset($usuarios[$email])) return null;
  return ['email' => $email, 'nome' => $usuarios[$email]['nome'] ?? $email];
}

// Confere e-mail e senha. Em caso de sucesso, abre a sessão.
function entrar(string $email, string $senha): bool {
  $email = strtolower(trim($email));
  $usuarios = config()['usuarios'];
  // sem cadastro, ainda calcula um hash: a resposta demora o mesmo e não revela quem existe
  $ok = isset($usuarios[$email]) ? password_verify($senha, $usuarios[$email]['hash']) : (password_hash($senha, PASSWORD_DEFAULT) && false);
  if (!$ok) { usleep(800000); return false; }
  iniciarSessao();
  session_regenerate_id(true);
  $_SESSION['email'] = $email;
  return true;
}

function exigirLogin(): array {
  $u = usuarioAtual();
  if (!$u) responder(['erro' => 'Faça login para continuar.'], 401);
  return $u;
}

// Pedidos que alteram dados precisam vir do próprio site (cabeçalho que outro site não consegue enviar)
function exigirPost(): void {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') responder(['erro' => 'Método não permitido.'], 405);
  if (($_SERVER['HTTP_X_MFL'] ?? '') !== '1') responder(['erro' => 'Pedido inválido.'], 400);
}

function lerCorpoJson(): array {
  $bruto = file_get_contents('php://input', false, null, 0, TAMANHO_MAXIMO + 1);
  if ($bruto === false || strlen($bruto) > TAMANHO_MAXIMO) responder(['erro' => 'Proposta grande demais. Use uma imagem de capa menor.'], 413);
  $dados = json_decode($bruto, true);
  if (!is_array($dados)) responder(['erro' => 'Conteúdo inválido.'], 400);
  return $dados;
}

/* ---------- armazenamento: um arquivo por proposta ---------- */

// Pasta de dados (fora do alcance do navegador) e subpastas: propostas, visitas, gravações
function pastaDados(string $sub): string {
  $base = rtrim(config()['dados'], '/');
  $pasta = $base . '/' . $sub;
  if (!is_dir($pasta)) mkdir($pasta, 0755, true);
  // bloqueia o acesso direto pelo navegador, caso a pasta fique dentro do site
  if (!is_file($base . '/.htaccess')) {
    file_put_contents($base . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n");
  }
  if (!is_file($base . '/index.html')) file_put_contents($base . '/index.html', '');
  return $pasta;
}

function pastaPropostas(): string {
  return pastaDados('propostas');
}

// Os arquivos terminam em .php e começam com exit: mesmo que alguém chegue até eles, nada é exibido
const CABECALHO = "<?php exit; ?>\n";

function caminhoProposta(string $id): string {
  return pastaPropostas() . '/' . $id . '.php';
}

function lerProposta(string $id): ?array {
  if (!preg_match(ID_VALIDO, $id)) return null;
  $arquivo = caminhoProposta($id);
  if (!is_file($arquivo)) return null;
  $conteudo = file_get_contents($arquivo);
  if ($conteudo === false) return null;
  $json = json_decode(substr($conteudo, strlen(CABECALHO)), true);
  return is_array($json) ? $json : null;
}

function gravarProposta(string $id, array $registro): void {
  $tmp = caminhoProposta($id) . '.tmp';
  file_put_contents($tmp, CABECALHO . json_encode($registro, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
  rename($tmp, caminhoProposta($id));
}

function novoId(): string {
  $letras = 'abcdefghijkmnpqrstuvwxyz23456789';
  do {
    $id = '';
    for ($i = 0; $i < 10; $i++) $id .= $letras[random_int(0, strlen($letras) - 1)];
  } while (is_file(caminhoProposta($id)));
  return $id;
}

/* ---------- acompanhamento das visitas (mapa de calor) ---------- */

const VISITA_VALIDA = '/^[a-z0-9]{12}$/';

function arquivoVisita(string $id, string $visita): string {
  return pastaDados('visitas/' . $id) . '/' . $visita . '.php';
}

function arquivoGravacao(string $id, string $visita): string {
  return pastaDados('gravacoes/' . $id) . '/' . $visita . '.php';
}

// Cada arquivo de visita é um registro: uma linha JSON por envio (protegido pelo cabeçalho exit)
function anexarLinha(string $arquivo, $dados): void {
  $novo = !is_file($arquivo);
  $f = fopen($arquivo, 'ab');
  if (!$f) return;
  flock($f, LOCK_EX);
  if ($novo) fwrite($f, CABECALHO);
  fwrite($f, json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
  flock($f, LOCK_UN);
  fclose($f);
}

function lerLinhas(string $arquivo): array {
  if (!is_file($arquivo)) return [];
  $conteudo = (string)file_get_contents($arquivo);
  $linhas = [];
  foreach (explode("\n", substr($conteudo, strlen(CABECALHO))) as $l) {
    if ($l === '') continue;
    $j = json_decode($l, true);
    if ($j !== null) $linhas[] = $j;
  }
  return $linhas;
}

function visitasDaProposta(string $id): array {
  if (!preg_match(ID_VALIDO, $id)) return [];
  $pasta = rtrim(config()['dados'], '/') . '/visitas/' . $id;
  $lista = [];
  foreach (glob($pasta . '/*.php') ?: [] as $arquivo) {
    $visita = basename($arquivo, '.php');
    if (preg_match(VISITA_VALIDA, $visita)) $lista[] = $visita;
  }
  return $lista;
}

// Junta os envios de uma visita num resumo (duração, rolagem, tempo por seção, cliques e ações)
function resumoVisita(string $id, string $visita, bool $comCliques = false): array {
  $r = ['visita' => $visita, 'visitante' => '', 'dispositivo' => '', 'origem' => '', 'inicio' => null, 'fim' => null,
    'ativo' => 0, 'rolagem' => 0, 'tempo' => [], 'acoes' => [], 'eventos' => [], 'cliques' => 0, 'gravacao' => false];
  $pontos = [];
  foreach (lerLinhas(arquivoVisita($id, $visita)) as $l) {
    $em = (int)($l['em'] ?? 0);
    $r['inicio'] = $r['inicio'] === null ? $em : min($r['inicio'], $em);
    $r['fim'] = max((int)$r['fim'], $em);
    $r['visitante'] = $l['visitante'] ?? $r['visitante'];
    $r['dispositivo'] = $l['dispositivo'] ?? $r['dispositivo'];
    if (!empty($l['origem'])) $r['origem'] = $l['origem'];
    $r['ativo'] += (int)($l['ativo'] ?? 0);
    $r['rolagem'] = max($r['rolagem'], (float)($l['rolagem'] ?? 0));
    foreach (($l['tempo'] ?? []) as $sec => $ms) $r['tempo'][$sec] = ($r['tempo'][$sec] ?? 0) + (int)$ms;
    foreach (($l['acoes'] ?? []) as $a) {
      $r['acoes'][] = $a['a'];
      // horário da ação (o navegador manda em ms; se faltar, usa a hora do envio)
      $t = (int)($a['t'] ?? 0) > 0 ? intdiv((int)$a['t'], 1000) : $em;
      $r['eventos'][] = ['a' => $a['a'], 't' => abs($t - $em) < 86400 ? $t : $em];
    }
    foreach (($l['cliques'] ?? []) as $c) {
      $r['cliques']++;
      if ($comCliques) $pontos[] = $c + ['d' => $r['dispositivo']];
    }
  }
  $r['gravacao'] = is_file(rtrim(config()['dados'], '/') . '/gravacoes/' . $id . '/' . $visita . '.php');
  if ($comCliques) $r['pontos'] = $pontos;
  return $r;
}

// "não aberta", "aberta" ou "muito engajada"
function statusProposta(array $visitas): string {
  if (!$visitas) return 'nao-aberta';
  foreach ($visitas as $v) {
    if (in_array('aprovar', $v['acoes'], true) || $v['ativo'] >= 180000 || ($v['tempo']['investimento'] ?? 0) >= 30000) return 'engajada';
  }
  return 'aberta';
}

// Endereço do site (para links nos e-mails)
function urlBase(): string {
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
  $pasta = rtrim(str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/api/x.php'))), '/');
  return ($https ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . $pasta . '/';
}

// Aviso por e-mail quando o cliente abre a proposta (no máximo um a cada 20 minutos por proposta)
function avisarAbertura(string $id, array $linha): void {
  $avisos = config()['avisos'] ?? [];
  if (empty($avisos['para'])) return;
  $controle = pastaDados('visitas/' . $id) . '/_ultimo-aviso.txt';
  if (is_file($controle) && time() - (int)file_get_contents($controle) < 1200) return;
  file_put_contents($controle, (string)time());

  $proposta = lerProposta($id);
  $cliente = trim((string)($proposta['meta']['cliente'] ?? '')) ?: 'Um cliente';
  $aberturas = count(visitasDaProposta($id));
  $quando = date('d/m/Y') . ' às ' . date('H:i');
  $base = urlBase();
  $corpo = "{$cliente} abriu a proposta agora ({$quando}).\n\n"
    . "Aparelho: " . ($linha['dispositivo'] ?? '-') . "\n"
    . "Aberturas até agora: {$aberturas}\n\n"
    . "Ver o acompanhamento e o mapa de calor:\n{$base}mapa.php?id={$id}\n\n"
    . "Link da proposta:\n{$base}?p={$id}\n";
  $de = $avisos['de'] ?? ('propostas@' . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost'));
  $cabecalhos = "From: Propostas MFL Sales <{$de}>\r\nReply-To: {$de}\r\nContent-Type: text/plain; charset=UTF-8\r\nMIME-Version: 1.0";
  $assunto = '=?UTF-8?B?' . base64_encode("{$cliente} abriu a proposta") . '?=';
  @mail($avisos['para'], $assunto, $corpo, $cabecalhos);
}
