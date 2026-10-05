<?php
/**
 * Plugin Name:       MFL Pedido pelo WhatsApp
 * Description:       Transforma o checkout do WooCommerce em envio de pedido pelo WhatsApp: salva o pedido, gera o recibo e abre a conversa com a loja.
 * Version:           0.1.0
 * Author:            Agência MFL
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * WC requires at least: 8.0
 * Text Domain:       mfl-pedido-whatsapp
 */

defined( 'ABSPATH' ) || exit;

define( 'MFL_PW_VERSION', '0.1.0' );
define( 'MFL_PW_FILE', __FILE__ );
define( 'MFL_PW_DIR', plugin_dir_path( __FILE__ ) );
define( 'MFL_PW_URL', plugin_dir_url( __FILE__ ) );

// Status "Aguardando contato" (o slug interno tem limite de 20 caracteres).
define( 'MFL_PW_STATUS', 'aguard-contato' );

// Compatibilidade com HPOS e com o checkout em blocos.
add_action(
	'before_woocommerce_init',
	function () {
		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', MFL_PW_FILE, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', MFL_PW_FILE, true );
		}
	}
);

add_action(
	'plugins_loaded',
	function () {
		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		require_once MFL_PW_DIR . 'includes/class-mfl-pw-gateway.php';
		require_once MFL_PW_DIR . 'includes/class-mfl-pw-mensagem.php';
		require_once MFL_PW_DIR . 'includes/class-mfl-pw-status.php';
		require_once MFL_PW_DIR . 'includes/class-mfl-pw-checkout.php';
		require_once MFL_PW_DIR . 'includes/class-mfl-pw-obrigado.php';

		MFL_PW_Status::init();
		MFL_PW_Checkout::init();
		MFL_PW_Obrigado::init();

		add_filter(
			'woocommerce_payment_gateways',
			function ( $gateways ) {
				$gateways[] = 'MFL_PW_Gateway';
				return $gateways;
			}
		);
	}
);

add_action(
	'woocommerce_blocks_loaded',
	function () {
		if ( ! class_exists( \Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType::class ) ) {
			return;
		}

		require_once MFL_PW_DIR . 'includes/class-mfl-pw-blocks.php';

		add_action(
			'woocommerce_blocks_payment_method_type_registration',
			function ( $registry ) {
				$registry->register( new MFL_PW_Blocks() );
			}
		);
	}
);

/**
 * Retorna a instância do gateway (configurações ficam em WooCommerce → Configurações → Pagamentos).
 *
 * @return MFL_PW_Gateway|null
 */
function mfl_pw_gateway() {
	if ( ! function_exists( 'WC' ) || ! WC()->payment_gateways() ) {
		return null;
	}
	$gateways = WC()->payment_gateways()->payment_gateways();
	return $gateways[ MFL_PW_Gateway::ID ] ?? null;
}
