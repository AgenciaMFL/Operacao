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

function pastaPropostas(): string {
  $base = rtrim(config()['dados'], '/');
  $pasta = $base . '/propostas';
  if (!is_dir($pasta)) mkdir($pasta, 0755, true);
  // bloqueia o acesso direto pelo navegador, caso a pasta fique dentro do site
  if (!is_file($base . '/.htaccess')) {
    file_put_contents($base . '/.htaccess', "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n");
  }
  if (!is_file($base . '/index.html')) file_put_contents($base . '/index.html', '');
  return $pasta;
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
