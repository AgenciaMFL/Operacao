<?php
// Modelo de configuração. Copie para api/config.php e preencha.
// Gere o hash da senha com: php api/criar-usuario.php email@agenciamfl.com.br "senha"
return [
  'usuarios' => [
    'nome@agenciamfl.com.br' => ['nome' => 'Nome da pessoa', 'hash' => 'COLE_AQUI_O_HASH'],
  ],
  'dados' => __DIR__ . '/../dados',
  // Aviso por e-mail quando o cliente abre a proposta (no máximo 1 a cada 20 min por proposta).
  // "de" precisa ser um e-mail do próprio domínio (crie a caixa no painel da Hostinger).
  'avisos' => [
    'para' => 'felipepessoa@agenciamfl.com.br',
    'de' => 'propostas@mflsales.com.br',
  ],
];
