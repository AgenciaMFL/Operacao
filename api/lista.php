<?php
// GET — lista as propostas publicadas, da mais recente para a mais antiga (exige login)
require __DIR__ . '/_base.php';
exigirLogin();
$itens = [];
foreach (glob(pastaPropostas() . '/*.php') ?: [] as $arquivo) {
  $registro = lerProposta(basename($arquivo, '.php'));
  if ($registro) $itens[] = $registro['meta'];
}
usort($itens, fn($a, $b) => strcmp($b['atualizadoEm'], $a['atualizadoEm']));
responder(['propostas' => $itens]);
