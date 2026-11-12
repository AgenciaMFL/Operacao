<?php
// GET ?id=&visita= (exige login) — eventos da gravação de uma visita, para o player
require __DIR__ . '/_base.php';
exigirLogin();
$id = (string)($_GET['id'] ?? '');
$visita = (string)($_GET['visita'] ?? '');
if (!preg_match(ID_VALIDO, $id) || !preg_match(VISITA_VALIDA, $visita)) responder(['erro' => 'Visita inválida.'], 400);
$eventos = [];
foreach (lerLinhas(arquivoGravacao($id, $visita)) as $lote) {
  if (is_array($lote)) array_push($eventos, ...$lote);
}
if (!$eventos) responder(['erro' => 'Esta visita não tem gravação.'], 404);
responder(['eventos' => $eventos]);
