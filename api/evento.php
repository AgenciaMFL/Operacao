<?php
// POST (público) — recebe os envios do acompanhamento de uma proposta aberta pelo cliente.
// Não conta as visitas de quem está logado no editor (o próprio comercial).
require __DIR__ . '/_base.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') responder(['erro' => 'Método não permitido.'], 405);
if (isset($_COOKIE['MFLSESSAO']) && usuarioAtual()) responder(['ok' => true, 'ignorado' => 'comercial']);

$bruto = file_get_contents('php://input', false, null, 0, 3 * 1024 * 1024 + 1);
if ($bruto === false || strlen($bruto) > 3 * 1024 * 1024) responder(['erro' => 'Envio grande demais.'], 413);
$d = json_decode($bruto, true);
if (!is_array($d)) responder(['erro' => 'Conteúdo inválido.'], 400);

$id = (string)($d['id'] ?? '');
$visita = (string)($d['visita'] ?? '');
if (!preg_match(ID_VALIDO, $id) || !preg_match(VISITA_VALIDA, $visita) || !lerProposta($id)) responder(['erro' => 'Proposta inválida.'], 404);
if (count(visitasDaProposta($id)) > 3000) responder(['ok' => true, 'ignorado' => 'limite']);

$texto = static fn($v, int $max) => mb_substr(trim((string)$v), 0, $max);
$linha = [
  'em' => time(),
  'visitante' => preg_match(VISITA_VALIDA, (string)($d['visitante'] ?? '')) ? $d['visitante'] : '',
  'dispositivo' => ($d['dispositivo'] ?? '') === 'celular' ? 'celular' : 'computador',
  'largura' => min(10000, max(0, (int)($d['largura'] ?? 0))),
];
if (!empty($d['inicio'])) { $linha['inicio'] = true; $linha['origem'] = $texto($d['origem'] ?? '', 100); }
if (isset($d['rolagem'])) $linha['rolagem'] = min(1, max(0, (float)$d['rolagem']));
if (isset($d['ativo'])) $linha['ativo'] = min(600000, max(0, (int)$d['ativo']));
if (is_array($d['tempo'] ?? null)) {
  foreach (array_slice($d['tempo'], 0, 30, true) as $sec => $ms) {
    if (preg_match('/^[a-z0-9-]{1,40}$/', (string)$sec)) $linha['tempo'][$sec] = min(600000, max(0, (int)$ms));
  }
}
if (is_array($d['cliques'] ?? null)) {
  foreach (array_slice($d['cliques'], 0, 500) as $c) {
    if (!is_array($c) || !preg_match('/^[a-z0-9-]{1,40}$/', (string)($c['s'] ?? ''))) continue;
    $linha['cliques'][] = ['s' => $c['s'], 'x' => round(min(1, max(0, (float)($c['x'] ?? 0))), 4), 'y' => round(min(1, max(0, (float)($c['y'] ?? 0))), 4)];
  }
}
if (is_array($d['acoes'] ?? null)) {
  foreach (array_slice($d['acoes'], 0, 100) as $a) {
    if (is_array($a) && ($a['a'] ?? '') !== '') $linha['acoes'][] = ['a' => $texto($a['a'], 100), 't' => (int)($a['t'] ?? 0)];
  }
}

$arquivo = arquivoVisita($id, $visita);
$nova = !is_file($arquivo);
anexarLinha($arquivo, $linha);

// gravação da visita (rrweb): até 25 MB por visita
if (is_array($d['gravacao'] ?? null) && $d['gravacao']) {
  $grav = arquivoGravacao($id, $visita);
  if (!is_file($grav) || filesize($grav) < 25 * 1024 * 1024) anexarLinha($grav, $d['gravacao']);
}

if ($nova && !empty($linha['inicio'])) avisarAbertura($id, $linha);
responder(['ok' => true]);
