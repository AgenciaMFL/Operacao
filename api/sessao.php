<?php
// GET: diz se há alguém logado (o editor usa para ligar o modo "publicar")
require __DIR__ . '/_base.php';
$u = usuarioAtual();
responder($u ? ['logado' => true] + $u : ['logado' => false]);
