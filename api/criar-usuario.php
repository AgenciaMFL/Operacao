<?php
// Uso (terminal): php api/criar-usuario.php email@agenciamfl.com.br "senha"
// Mostra a linha pronta para colar em api/config.php. Não roda pelo navegador.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
[$_, $email, $senha] = array_pad($argv, 3, null);
if (!$email || !$senha) { fwrite(STDERR, "Uso: php api/criar-usuario.php email \"senha\"\n"); exit(1); }
$hash = password_hash($senha, PASSWORD_DEFAULT);
echo "    '" . strtolower(trim($email)) . "' => ['nome' => 'Nome', 'hash' => '" . $hash . "'],\n";
