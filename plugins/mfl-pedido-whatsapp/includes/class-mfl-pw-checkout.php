<?php
/**
 * Checkout simplificado (nome, WhatsApp, entrega/retirada, endereço, observação)
 * e textos dos botões de compra.
 *
 * Os campos valem para o checkout clássico (widget Checkout do Elementor Pro ou shortcode [woocommerce_checkout]).
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Checkout {

	const FIELD_ENTREGA = 'billing_mfl_entrega';
	const META_ENTREGA  = '_billing_mfl_entrega';

	public static function init() {
		add_filter( 'woocommerce_checkout_fields', array( __CLASS__, 'fields' ), 20 );
		add_action( 'woocommerce_after_checkout_validation', array( __CLASS__, 'validate' ), 10, 2 );
		add_action( 'woocommerce_checkout_create_order', array( __CLASS__, 'save' ), 10, 2 );
		add_action( 'woocommerce_admin_order_data_after_billing_address', array( __CLASS__, 'admin_display' ) );
		add_action( 'wp_footer', array( __CLASS__, 'toggle_script' ) );

		add_filter( 'gettext_woocommerce', array( __CLASS__, 'headings' ), 10, 2 );

		add_filter( 'woocommerce_product_add_to_cart_text', array( __CLASS__, 'add_to_cart_text' ), 10, 2 );
		add_filter( 'woocommerce_product_single_add_to_cart_text', array( __CLASS__, 'add_to_cart_text' ), 10, 2 );
	}

	public static function fields( $fields ) {
		$billing = $fields['billing'];

		foreach ( array( 'billing_last_name', 'billing_company', 'billing_country', 'billing_state', 'billing_postcode', 'billing_email' ) as $key ) {
			unset( $billing[ $key ] );
		}

		$billing['billing_first_name'] = array_merge(
			$billing['billing_first_name'] ?? array(),
			array(
				'label'    => 'Nome',
				'required' => true,
				'class'    => array( 'form-row-wide' ),
				'priority' => 10,
			)
		);

		$billing['billing_phone'] = array_merge(
			$billing['billing_phone'] ?? array(),
			array(
				'label'       => 'WhatsApp',
				'placeholder' => '(21) 99999-9999',
				'required'    => true,
				'class'       => array( 'form-row-wide' ),
				'priority'    => 20,
			)
		);

		$billing[ self::FIELD_ENTREGA ] = array(
			'type'     => 'select',
			'label'    => 'Como prefere receber?',
			'required' => true,
			'class'    => array( 'form-row-wide' ),
			'priority' => 30,
			'options'  => array(
				'retirada' => 'Retirar na loja',
				'entrega'  => 'Entrega (frete combinado no WhatsApp)',
			),
			'default'  => 'retirada',
		);

		$address = array(
			'billing_address_1' => array( 'Endereço', 'Rua e número', 40 ),
			'billing_address_2' => array( 'Complemento / Bairro', 'Apto, bloco, bairro', 50 ),
			'billing_city'      => array( 'Cidade', '', 60 ),
		);
		foreach ( $address as $key => $conf ) {
			$billing[ $key ] = array_merge(
				$billing[ $key ] ?? array(),
				array(
					'label'       => $conf[0],
					'placeholder' => $conf[1],
					'required'    => false, // Obrigatório só para entrega (ver validate()).
					'class'       => array( 'form-row-wide', 'mfl-pw-endereco' ),
					'priority'    => $conf[2],
				)
			);
		}

		$fields['billing'] = $billing;

		if ( isset( $fields['order']['order_comments'] ) ) {
			$fields['order']['order_comments']['label']       = false; // O título da seção já diz "Observações".
			$fields['order']['order_comments']['placeholder'] = 'Alguma informação sobre o pedido? (opcional)';
		}

		return $fields;
	}

	/**
	 * Títulos do checkout: não há cobrança no site, então "Detalhes de cobrança" vira "Seus dados".
	 */
	public static function headings( $translation, $text ) {
		// Só no checkout: "Additional information" também é o nome de uma aba na página do produto.
		if ( ! did_action( 'wp' ) || ! is_checkout() || is_admin() ) {
			return $translation;
		}
		switch ( $text ) {
			case 'Billing details':
			case 'Billing &amp; Shipping':
				return 'Seus dados';
			case 'Additional information':
				return 'Observações';
			case 'Your order':
				return 'Resumo do pedido';
		}
		return $translation;
	}

	public static function validate( $data, $errors ) {
		if ( 'entrega' !== ( $data[ self::FIELD_ENTREGA ] ?? '' ) ) {
			return;
		}
		if ( empty( $data['billing_address_1'] ) ) {
			$errors->add( 'mfl_pw_endereco', 'Informe o <strong>endereço</strong> para entrega.' );
		}
		if ( empty( $data['billing_city'] ) ) {
			$errors->add( 'mfl_pw_cidade', 'Informe a <strong>cidade</strong> para entrega.' );
		}
	}

	public static function save( $order, $data ) {
		if ( ! $order->get_billing_country() ) {
			$order->set_billing_country( 'BR' );
		}
		if ( isset( $data[ self::FIELD_ENTREGA ] ) ) {
			$value = 'entrega' === $data[ self::FIELD_ENTREGA ] ? 'entrega' : 'retirada';
			$order->update_meta_data( self::META_ENTREGA, $value );
		}
	}

	public static function admin_display( $order ) {
		$value = $order->get_meta( self::META_ENTREGA );
		if ( ! $value ) {
			return;
		}
		echo '<p><strong>Recebimento:</strong> ' . esc_html( 'entrega' === $value ? 'Entrega' : 'Retirada na loja' ) . '</p>';
	}

	/**
	 * Mostra os campos de endereço só quando o cliente escolhe "Entrega".
	 */
	public static function toggle_script() {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() || is_order_received_page() ) {
			return;
		}
		?>
		<script>
		jQuery( function ( $ ) {
			function mflPwToggle() {
				var entrega = $( '#<?php echo esc_js( self::FIELD_ENTREGA ); ?>' ).val() === 'entrega';
				$( '.mfl-pw-endereco' ).toggle( entrega );
			}
			$( document.body ).on( 'change', '#<?php echo esc_js( self::FIELD_ENTREGA ); ?>', mflPwToggle );
			$( document.body ).on( 'updated_checkout', mflPwToggle );
			mflPwToggle();
		} );
		</script>
		<?php
	}

	public static function add_to_cart_text( $text, $product = null ) {
		// Produto sem estoque/sem preço ou com variações (na listagem) mantém o texto padrão do Woo.
		if ( ! $product || ! $product->is_purchasable() || ! $product->is_in_stock() ) {
			return $text;
		}
		if ( ! $product->is_type( 'simple' ) && 'woocommerce_product_add_to_cart_text' === current_filter() ) {
			return $text;
		}
		return 'Adicionar ao pedido';
	}
}
