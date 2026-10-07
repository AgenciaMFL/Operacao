<?php
// Porta de entrada do editor: sem login mostra a tela de acesso; com login abre o editor.
require __DIR__ . '/api/_base.php';

$erro = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
  if (entrar((string)($_POST['email'] ?? ''), (string)($_POST['senha'] ?? ''))) {
    header('Location: editor.php', true, 303);
    exit;
  }
  $erro = 'E-mail ou senha incorretos.';
}

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
if (usuarioAtual()) {
  header('Content-Type: text/html; charset=utf-8');
  readfile(__DIR__ . '/editor.html');
  exit;
}
$email = htmlspecialchars((string)($_POST['email'] ?? ''), ENT_QUOTES, 'UTF-8');
?><!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Entrar · Gerador de Propostas MFL Sales</title>
  <link rel="icon" href="assets/img/mfl-sales-icone.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; font: 15px/1.5 'Plus Jakarta Sans', system-ui, sans-serif; color: #141A28;
      background: radial-gradient(80% 60% at 80% 0%, #1E3A8A, transparent 60%), #0A1530; }
    .acesso { width: min(400px, 100%); padding: 32px 28px; border-radius: 24px; background: #fff;
      box-shadow: 0 0 0 10px rgba(255, 255, 255, .06), 0 30px 60px -30px rgba(0, 0, 0, .6); }
    .acesso img { width: 120px; height: auto; display: block; margin-bottom: 22px; }
    h1 { margin: 0 0 4px; font-size: 1.35rem; }
    p { margin: 0 0 22px; color: #5F6675; font-size: .92rem; }
    label { display: block; margin: 14px 0 6px; font-size: .85rem; font-weight: 700; }
    input { width: 100%; padding: 11px 12px; border-radius: 10px; border: 1px solid #DADFE6; background: #F6F8FA; font: inherit; }
    input:focus-visible { outline: 2px solid #1F9D3A; outline-offset: 1px; }
    button { width: 100%; margin-top: 22px; padding: 12px; border: 0; border-radius: 10px; background: #39D353; color: #0A1530; font: inherit; font-weight: 800; cursor: pointer; }
    button:hover { filter: brightness(1.05); }
    .erro { margin: 16px 0 0; padding: 10px 12px; border-radius: 10px; background: #FDECEC; color: #9B1C1C; font-size: .88rem; font-weight: 600; }
  </style>
</head>
<body>
  <form class="acesso" method="post" action="editor.php">
    <img src="assets/img/mfl-sales-logo-escura.svg" alt="MFL Sales" onerror="this.remove()">
    <h1>Gerador de Propostas</h1>
    <p>Acesso exclusivo do time comercial.</p>
    <label for="email">E-mail</label>
    <input type="email" id="email" name="email" value="<?= $email ?>" autocomplete="username" required autofocus>
    <label for="senha">Senha</label>
    <input type="password" id="senha" name="senha" autocomplete="current-password" required>
    <?php if ($erro): ?><p class="erro" role="alert"><?= htmlspecialchars($erro, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <button type="submit">Entrar</button>
  </form>
</body>
</html>
