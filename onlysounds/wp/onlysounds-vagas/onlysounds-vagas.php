<?php
/**
 * Plugin Name: OnlySounds – Vagas restantes
 * Description: Contador de vagas ligado ao checkout da Kiwify. Cada compra aprovada diminui uma vaga; reembolso ou chargeback devolve a vaga. Shortcodes: [os_vagas] (caixa com barra) e [os_vagas estilo="bonus"] (selo para o card de bônus).
 * Version: 1.1.0
 * Author: Agência MFL
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

const OS_VAGAS_OPT = 'os_vagas_settings';
const OS_VAGAS_STATE = 'os_vagas_state';

function os_vagas_settings() {
    $defaults = array(
        'total'      => 20,
        'secret'     => '',
        'kiwify_token' => '',
        'product_id' => '',
        'refund_returns' => 1,
    );
    $s = get_option(OS_VAGAS_OPT, array());
    $s = wp_parse_args(is_array($s) ? $s : array(), $defaults);
    if ($s['secret'] === '') {
        $s['secret'] = wp_generate_password(32, false, false);
        update_option(OS_VAGAS_OPT, $s);
    }
    return $s;
}

function os_vagas_state() {
    $st = get_option(OS_VAGAS_STATE, array());
    $st = wp_parse_args(is_array($st) ? $st : array(), array('sold' => 0, 'orders' => array(), 'log' => array()));
    return $st;
}

function os_vagas_remaining() {
    $s = os_vagas_settings();
    $st = os_vagas_state();
    return max(0, (int) $s['total'] - (int) $st['sold']);
}

register_activation_hook(__FILE__, function () {
    os_vagas_settings();
    if (get_option(OS_VAGAS_STATE, null) === null) {
        add_option(OS_VAGAS_STATE, array('sold' => 0, 'orders' => array(), 'log' => array()), '', 'no');
    }
});

/* ---------- REST: leitura pública e webhook da Kiwify ---------- */

add_action('rest_api_init', function () {
    register_rest_route('onlysounds/v1', '/vagas', array(
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => function () {
            $s = os_vagas_settings();
            $res = new WP_REST_Response(array(
                'total'     => (int) $s['total'],
                'restantes' => os_vagas_remaining(),
            ));
            $res->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            return $res;
        },
    ));

    register_rest_route('onlysounds/v1', '/kiwify', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'os_vagas_webhook',
    ));
});

function os_vagas_webhook(WP_REST_Request $req) {
    $s = os_vagas_settings();

    // 1) Chave secreta na URL (obrigatória).
    if (!hash_equals((string) $s['secret'], (string) $req->get_param('key'))) {
        return new WP_REST_Response(array('ok' => false, 'error' => 'chave inválida'), 403);
    }

    $raw = $req->get_body();

    // 2) Assinatura da Kiwify (opcional: só confere se o token foi preenchido).
    if ($s['kiwify_token'] !== '') {
        $sig = (string) $req->get_param('signature');
        $calc = hash_hmac('sha1', $raw, $s['kiwify_token']);
        if ($sig === '' || !hash_equals($calc, $sig)) {
            return new WP_REST_Response(array('ok' => false, 'error' => 'assinatura inválida'), 403);
        }
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return new WP_REST_Response(array('ok' => false, 'error' => 'json inválido'), 400);
    }

    $order_id = (string) ($data['order_id'] ?? ($data['id'] ?? ''));
    $status   = strtolower((string) ($data['order_status'] ?? ''));
    $event    = strtolower((string) ($data['webhook_event_type'] ?? ''));
    $product  = (string) ($data['Product']['product_id'] ?? ($data['product_id'] ?? ''));

    if ($order_id === '') {
        return new WP_REST_Response(array('ok' => true, 'ignored' => 'sem order_id'), 200);
    }
    if ($s['product_id'] !== '' && $product !== '' && $product !== $s['product_id']) {
        return new WP_REST_Response(array('ok' => true, 'ignored' => 'outro produto'), 200);
    }

    $approved = in_array($event, array('order_approved'), true) || in_array($status, array('paid', 'approved'), true);
    $returned = in_array($event, array('order_refunded', 'chargeback'), true) || in_array($status, array('refunded', 'chargedback'), true);

    $st = os_vagas_state();
    $orders = $st['orders'];
    $prev = $orders[$order_id] ?? '';
    $action = 'ignorado';

    if ($approved && $prev !== 'sold') {
        $st['sold'] = (int) $st['sold'] + 1;
        $orders[$order_id] = 'sold';
        $action = 'venda';
    } elseif ($returned && $prev === 'sold' && !empty($s['refund_returns'])) {
        $st['sold'] = max(0, (int) $st['sold'] - 1);
        $orders[$order_id] = 'returned';
        $action = 'devolvida';
    }

    $st['orders'] = $orders;
    array_unshift($st['log'], array(
        't' => current_time('mysql'), 'order' => $order_id, 'event' => $event ?: $status, 'acao' => $action,
    ));
    $st['log'] = array_slice($st['log'], 0, 50);
    update_option(OS_VAGAS_STATE, $st, false);

    return new WP_REST_Response(array('ok' => true, 'acao' => $action, 'restantes' => os_vagas_remaining()), 200);
}

/* ---------- Shortcode [os_vagas] ---------- */

add_shortcode('os_vagas', function ($atts) {
    $atts = shortcode_atts(array('estilo' => 'caixa'), $atts, 'os_vagas');
    if ($atts['estilo'] === 'bonus') {
        return os_vagas_bonus_html();
    }
    $s = os_vagas_settings();
    $total = (int) $s['total'];
    $rest = os_vagas_remaining();
    $pct = $total > 0 ? round(($rest / $total) * 100) : 0;
    $api = esc_url(rest_url('onlysounds/v1/vagas'));
    ob_start(); ?>
<div class="os-vagas" data-api="<?php echo $api; ?>" data-total="<?php echo $total; ?>" data-rest="<?php echo $rest; ?>">
  <div class="os-vagas__top">
    <span class="os-vagas__dot" aria-hidden="true"></span>
    <p class="os-vagas__txt" aria-live="polite">
      <span data-on>Restam <strong data-n><?php echo $rest; ?></strong> de <?php echo $total; ?> vagas com bônus</span>
      <span data-off hidden><strong>Vagas com bônus esgotadas</strong></span>
    </p>
  </div>
  <div class="os-vagas__bar" role="progressbar" aria-valuemin="0" aria-valuemax="<?php echo $total; ?>" aria-valuenow="<?php echo $rest; ?>" aria-label="Vagas restantes">
    <span style="width:<?php echo $pct; ?>%"></span>
  </div>
</div>
<style>
  .os-vagas{max-width:460px;margin:0 auto;padding:14px 18px;border-radius:16px;background:#fff1f4;border:1px solid #f7b6c5;font-family:"Plus Jakarta Sans",sans-serif;color:#0a0b0f}
  .os-vagas__top{display:flex;align-items:center;justify-content:center;gap:10px}
  .os-vagas__dot{width:10px;height:10px;border-radius:50%;background:#ED3838;flex:none;animation:os-vagas-pulse 1.6s infinite}
  @keyframes os-vagas-pulse{0%{box-shadow:0 0 0 0 rgba(237,56,56,.55)}70%{box-shadow:0 0 0 10px rgba(237,56,56,0)}100%{box-shadow:0 0 0 0 rgba(237,56,56,0)}}
  .os-vagas__txt{margin:0;font-size:16px;font-weight:600;text-align:center}
  .os-vagas__txt strong{font-weight:800;color:#C41E26}
  .os-vagas__bar{margin-top:10px;height:8px;border-radius:99px;background:#f6d3db;overflow:hidden}
  .os-vagas__bar span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#ED3838,#FD4C74);transition:width .6s ease}
  .os-vagas.is-out{background:#f2f4f8;border-color:#e4e7ee}
  .os-vagas.is-out .os-vagas__dot{background:#8a8f9b;animation:none}
  @media (max-width:767px){.os-vagas__txt{font-size:15px}}
  @media (prefers-reduced-motion:reduce){.os-vagas__dot{animation:none}}
</style>
<?php echo os_vagas_poll_js(); ?>
<?php
    return ob_get_clean();
});

/* Selo para o card de bônus: [os_vagas estilo="bonus"] */
function os_vagas_bonus_html() {
    $s = os_vagas_settings();
    $total = (int) $s['total'];
    $rest = os_vagas_remaining();
    $pct = $total > 0 ? round(($rest / $total) * 100) : 0;
    $api = esc_url(rest_url('onlysounds/v1/vagas'));
    ob_start(); ?>
<div class="os-vbonus<?php echo $rest === 0 ? ' is-out' : ''; ?>" data-api="<?php echo $api; ?>" data-total="<?php echo $total; ?>" data-rest="<?php echo $rest; ?>">
  <span class="os-vbonus__pill" aria-live="polite">
    <span data-on<?php echo $rest === 0 ? ' hidden' : ''; ?>>Restam <b data-n><?php echo $rest; ?></b> de <?php echo $total; ?> vagas</span>
    <span data-off<?php echo $rest === 0 ? '' : ' hidden'; ?>>Bônus esgotado</span>
  </span>
  <span class="os-vbonus__bar" role="progressbar" aria-label="Vagas com bônus restantes" aria-valuemin="0" aria-valuemax="<?php echo $total; ?>" aria-valuenow="<?php echo $rest; ?>"><i style="width:<?php echo $pct; ?>%"></i></span>
</div>
<style>
  .os-vbonus{display:grid;justify-items:center;gap:8px;font-family:"Plus Jakarta Sans",sans-serif}
  .os-vbonus__pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:#FD4C74;color:#fff;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap;box-shadow:0 0 0 0 rgba(253,76,116,.6);animation:os-vb-pulse 2s infinite}
  .os-vbonus__pill b{font-weight:800;font-size:14px}
  .os-vbonus__bar{width:160px;max-width:100%;height:5px;border-radius:99px;background:rgba(255,255,255,.25);overflow:hidden}
  .os-vbonus__bar i{display:block;height:100%;border-radius:99px;background:#fff;transition:width .6s ease}
  .os-vbonus.is-out .os-vbonus__pill{background:rgba(255,255,255,.2);animation:none}
  @keyframes os-vb-pulse{0%{box-shadow:0 0 0 0 rgba(253,76,116,.55)}70%{box-shadow:0 0 0 9px rgba(253,76,116,0)}100%{box-shadow:0 0 0 0 rgba(253,76,116,0)}}
  @media (prefers-reduced-motion:reduce){.os-vbonus__pill{animation:none}}
</style>
<?php
    echo os_vagas_poll_js();
    return ob_get_clean();
}

/* JS que busca o número atualizado (serve para os dois estilos; roda uma vez por página) */
function os_vagas_poll_js() {
    static $done = false;
    if ($done) { return ''; }
    $done = true;
    ob_start(); ?>
<script>
(function(){ function osVagasInit(){
  var els = document.querySelectorAll(".os-vagas,.os-vbonus");
  if (!els.length) return;
  function paint(el, rest){
    var total = parseInt(el.getAttribute("data-total"), 10) || 0;
    rest = Math.max(0, rest);
    el.querySelectorAll("[data-n]").forEach(function(n){ n.textContent = rest; });
    var bar = el.querySelector("[role=progressbar]");
    if (bar) { bar.setAttribute("aria-valuenow", rest); bar.firstElementChild.style.width = (total ? Math.round(rest / total * 100) : 0) + "%"; }
    var on = el.querySelector("[data-on]"), off = el.querySelector("[data-off]");
    if (on) on.hidden = rest === 0; if (off) off.hidden = rest !== 0;
    el.classList.toggle("is-out", rest === 0);
  }
  function load(){
    var api = els[0].getAttribute("data-api");
    fetch(api + (api.indexOf("?") > -1 ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" })
      .then(function(r){ return r.json(); })
      .then(function(d){ if (typeof d.restantes === "number") els.forEach(function(el){ paint(el, d.restantes); }); })
      .catch(function(){});
  }
  els.forEach(function(el){ paint(el, parseInt(el.getAttribute("data-rest"), 10) || 0); });
  load();
  setInterval(function(){ if (!document.hidden) load(); }, 30000);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", osVagasInit); else osVagasInit();
})();
</script>
<?php
    return ob_get_clean();
}

/* ---------- Página de configuração (Configurações > Vagas OnlySounds) ---------- */

add_action('admin_menu', function () {
    add_options_page('Vagas OnlySounds', 'Vagas OnlySounds', 'manage_options', 'os-vagas', 'os_vagas_admin');
});

function os_vagas_admin() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $s = os_vagas_settings();
    $st = os_vagas_state();
    $msg = '';

    if (!empty($_POST['os_vagas_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['os_vagas_nonce'])), 'os_vagas_save')) {
        $s['total'] = max(0, (int) ($_POST['total'] ?? 20));
        $s['kiwify_token'] = sanitize_text_field(wp_unslash($_POST['kiwify_token'] ?? ''));
        $s['product_id'] = sanitize_text_field(wp_unslash($_POST['product_id'] ?? ''));
        $s['refund_returns'] = !empty($_POST['refund_returns']) ? 1 : 0;
        update_option(OS_VAGAS_OPT, $s);

        if (isset($_POST['sold']) && $_POST['sold'] !== '') {
            $st['sold'] = max(0, (int) $_POST['sold']);
        }
        if (!empty($_POST['reset'])) {
            $st = array('sold' => 0, 'orders' => array(), 'log' => array());
        }
        update_option(OS_VAGAS_STATE, $st, false);
        $msg = 'Salvo.';
    }

    $webhook = add_query_arg('key', rawurlencode($s['secret']), rest_url('onlysounds/v1/kiwify'));
    ?>
<div class="wrap">
  <h1>Vagas OnlySounds</h1>
  <?php if ($msg) : ?><div class="notice notice-success"><p><?php echo esc_html($msg); ?></p></div><?php endif; ?>
  <p><strong>Restam agora:</strong> <?php echo (int) os_vagas_remaining(); ?> de <?php echo (int) $s['total']; ?> (vendidas: <?php echo (int) $st['sold']; ?>)</p>
  <p><strong>URL do webhook para colar na Kiwify</strong> (eventos: Compra aprovada, Reembolso, Chargeback):</p>
  <p><input type="text" readonly class="large-text code" value="<?php echo esc_attr($webhook); ?>" onclick="this.select()"></p>
  <form method="post">
    <?php wp_nonce_field('os_vagas_save', 'os_vagas_nonce'); ?>
    <table class="form-table" role="presentation">
      <tr><th><label for="total">Total de vagas</label></th><td><input id="total" name="total" type="number" min="0" value="<?php echo (int) $s['total']; ?>"></td></tr>
      <tr><th><label for="sold">Vendidas (ajuste manual)</label></th><td><input id="sold" name="sold" type="number" min="0" placeholder="<?php echo (int) $st['sold']; ?>"> <p class="description">Deixe vazio para não mexer. Use para acertar o número se já houve vendas antes de ligar o webhook.</p></td></tr>
      <tr><th><label for="product_id">ID do produto na Kiwify</label></th><td><input id="product_id" name="product_id" type="text" class="regular-text" value="<?php echo esc_attr($s['product_id']); ?>"> <p class="description">Opcional. Se preenchido, só vendas deste produto contam.</p></td></tr>
      <tr><th><label for="kiwify_token">Token do webhook da Kiwify</label></th><td><input id="kiwify_token" name="kiwify_token" type="text" class="regular-text" value="<?php echo esc_attr($s['kiwify_token']); ?>"> <p class="description">Opcional. Se preenchido, confere a assinatura de cada aviso da Kiwify.</p></td></tr>
      <tr><th>Reembolso devolve a vaga</th><td><label><input name="refund_returns" type="checkbox" value="1" <?php checked(!empty($s['refund_returns'])); ?>> Sim</label></td></tr>
      <tr><th>Zerar contador</th><td><label><input name="reset" type="checkbox" value="1"> Zerar vendidas e o histórico</label></td></tr>
    </table>
    <?php submit_button('Salvar'); ?>
  </form>
  <h2>Últimos avisos recebidos</h2>
  <table class="widefat striped"><thead><tr><th>Quando</th><th>Pedido</th><th>Evento</th><th>Ação</th></tr></thead><tbody>
  <?php if (empty($st['log'])) : ?><tr><td colspan="4">Nenhum aviso recebido ainda.</td></tr><?php endif; ?>
  <?php foreach ($st['log'] as $l) : ?>
    <tr><td><?php echo esc_html($l['t']); ?></td><td><?php echo esc_html($l['order']); ?></td><td><?php echo esc_html($l['event']); ?></td><td><?php echo esc_html($l['acao']); ?></td></tr>
  <?php endforeach; ?>
  </tbody></table>
</div>
    <?php
}
