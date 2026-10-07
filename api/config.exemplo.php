<?php
// Modelo de configuração. Copie para api/config.php e preencha.
// Gere o hash da senha com: php api/criar-usuario.php email@agenciamfl.com.br "senha"
return [
  'usuarios' => [
    'nome@agenciamfl.com.br' => ['nome' => 'Nome da pessoa', 'hash' => 'COLE_AQUI_O_HASH'],
  ],
  'dados' => __DIR__ . '/../dados',
];
