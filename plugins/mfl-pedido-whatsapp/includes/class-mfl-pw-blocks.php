<?php
/**
 * Registra "Combinar pelo WhatsApp" no checkout em blocos do WooCommerce.
 */

defined( 'ABSPATH' ) || exit;

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

final class MFL_PW_Blocks extends AbstractPaymentMethodType {

	protected $name = 'mfl_whatsapp';

	public function initialize() {
		$this->settings = get_option( 'woocommerce_mfl_whatsapp_settings', array() );
	}

	public function is_active() {
		return 'no' !== ( $this->settings['enabled'] ?? 'yes' );
	}

	public function get_payment_method_script_handles() {
		wp_register_script(
			'mfl-pw-blocks',
			MFL_PW_URL . 'assets/js/blocks.js',
			array( 'wc-blocks-registry', 'wc-settings', 'wp-element', 'wp-html-entities' ),
			MFL_PW_VERSION,
			true
		);
		return array( 'mfl-pw-blocks' );
	}

	public function get_payment_method_data() {
		return array(
			'title'       => $this->settings['title'] ?? 'Combinar pelo WhatsApp',
			'description' => $this->settings['description'] ?? '',
			'button_text' => $this->settings['button_text'] ?? 'Enviar pedido pelo WhatsApp',
			'supports'    => array( 'products' ),
		);
	}
}
