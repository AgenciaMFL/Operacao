<?php
// POST: encerra a sessão
require __DIR__ . '/_base.php';
exigirPost();
iniciarSessao();
$_SESSION = [];
session_destroy();
responder(['ok' => true]);
