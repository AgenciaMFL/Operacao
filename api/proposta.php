<?php
// GET ?id=xxxxxxxxxx — devolve uma proposta publicada (é o que a página do cliente lê)
require __DIR__ . '/_base.php';
$id = (string)($_GET['id'] ?? '');
$registro = lerProposta($id);
if (!$registro) responder(['erro' => 'Proposta não encontrada.'], 404);
responder($registro['dados']);
