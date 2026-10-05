<?php
/**
 * Status de pedido "Aguardando contato".
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Status {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ) );
		add_filter( 'wc_order_statuses', array( __CLASS__, 'add_to_list' ) );
		add_filter( 'wc_order_is_editable', array( __CLASS__, 'editable' ), 10, 2 );
	}

	public static function register() {
		register_post_status(
			'wc-' . MFL_PW_STATUS,
			array(
				'label'                     => 'Aguardando contato',
				'public'                    => false,
				'exclude_from_search'       => false,
				'show_in_admin_all_list'    => true,
				'show_in_admin_status_list' => true,
				/* translators: %s: quantidade de pedidos */
				'label_count'               => _n_noop( 'Aguardando contato <span class="count">(%s)</span>', 'Aguardando contato <span class="count">(%s)</span>' ),
			)
		);
	}

	public static function add_to_list( $statuses ) {
		$new = array();
		foreach ( $statuses as $key => $label ) {
			$new[ $key ] = $label;
			if ( 'wc-pending' === $key ) {
				$new[ 'wc-' . MFL_PW_STATUS ] = 'Aguardando contato';
			}
		}
		if ( ! isset( $new[ 'wc-' . MFL_PW_STATUS ] ) ) {
			$new[ 'wc-' . MFL_PW_STATUS ] = 'Aguardando contato';
		}
		return $new;
	}

	/**
	 * Permite ao dono incluir/alterar itens no pedido enquanto negocia pelo WhatsApp.
	 */
	public static function editable( $editable, $order ) {
		return $editable || $order->has_status( MFL_PW_STATUS );
	}
}
