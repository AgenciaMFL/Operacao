<?php
// POST {id?, dados} — publica uma proposta nova ou atualiza uma já publicada (exige login)
require __DIR__ . '/_base.php';
exigirPost();
$u = exigirLogin();
$corpo = lerCorpoJson();
$dados = $corpo['dados'] ?? null;
if (!is_array($dados) || (int)($dados['versao'] ?? 0) !== 2) responder(['erro' => 'Proposta inválida.'], 400);

$id = (string)($corpo['id'] ?? '');
$agora = date('c');
$anterior = $id !== '' ? lerProposta($id) : null;
if (!preg_match(ID_VALIDO, $id)) $id = novoId();

unset($dados['idPublicado']);
$meta = [
  'id' => $id,
  'cliente' => trim((string)($dados['cliente'] ?? '')),
  'criadoEm' => $anterior['meta']['criadoEm'] ?? $agora,
  'criadoPor' => $anterior['meta']['criadoPor'] ?? $u['email'],
  'atualizadoEm' => $agora,
  'atualizadoPor' => $u['email'],
];
gravarProposta($id, ['meta' => $meta, 'dados' => $dados]);
responder(['ok' => true, 'id' => $id, 'novo' => !$anterior, 'meta' => $meta]);
