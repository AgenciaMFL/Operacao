<?php
// GET (exige login) — dados da tela de Mapa de calor.
//   sem id: todas as propostas publicadas com o resumo das visitas
//   ?id=xxxxxxxxxx: visitas, tempo por seção, ações e cliques de uma proposta
require __DIR__ . '/_base.php';
exigirLogin();
$id = (string)($_GET['id'] ?? '');

if ($id === '') {
  $itens = [];
  foreach (glob(pastaPropostas() . '/*.php') ?: [] as $arquivo) {
    $registro = lerProposta(basename($arquivo, '.php'));
    if (!$registro) continue;
    $meta = $registro['meta'];
    $visitas = array_map(fn($v) => resumoVisita($meta['id'], $v), visitasDaProposta($meta['id']));
    $itens[] = $meta + [
      'aberturas' => count($visitas),
      'visitantes' => count(array_unique(array_filter(array_column($visitas, 'visitante')))) ?: count($visitas),
      'ultimaAbertura' => $visitas ? max(array_column($visitas, 'fim')) : null,
      'tempoTotal' => array_sum(array_column($visitas, 'ativo')),
      'rolagem' => $visitas ? max(array_column($visitas, 'rolagem')) : 0,
      'aprovou' => (bool)array_filter($visitas, fn($v) => in_array('aprovar', $v['acoes'], true)),
      'status' => statusProposta($visitas),
    ];
  }
  usort($itens, fn($a, $b) => ($b['ultimaAbertura'] ?? 0) <=> ($a['ultimaAbertura'] ?? 0) ?: strcmp($b['atualizadoEm'], $a['atualizadoEm']));
  responder(['propostas' => $itens]);
}

$registro = lerProposta($id);
if (!$registro) responder(['erro' => 'Proposta não encontrada.'], 404);
$visitas = array_map(fn($v) => resumoVisita($id, $v, true), visitasDaProposta($id));
usort($visitas, fn($a, $b) => ($b['inicio'] ?? 0) <=> ($a['inicio'] ?? 0));
$pontos = [];
foreach ($visitas as &$v) { array_push($pontos, ...$v['pontos']); unset($v['pontos']); }
unset($v);
responder([
  'meta' => $registro['meta'],
  'status' => statusProposta($visitas),
  'visitas' => $visitas,
  'cliques' => $pontos,
]);
