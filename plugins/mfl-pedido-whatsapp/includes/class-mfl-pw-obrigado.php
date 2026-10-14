<?php
/**
 * Página "Pedido recebido": abre o WhatsApp com o recibo e mantém um botão reserva.
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Obrigado {

	const META_REDIRECTED = '_mfl_pw_redirected';

	public static function init() {
		add_action( 'woocommerce_before_thankyou', array( __CLASS__, 'render' ), 5 );
		add_filter( 'woocommerce_thankyou_order_received_text', array( __CLASS__, 'received_text' ), 10, 2 );
		add_shortcode( 'mfl_whatsapp_pedido', array( __CLASS__, 'shortcode' ) );
		add_filter( 'woocommerce_locate_template', array( __CLASS__, 'locate_template' ), 10, 2 );
		add_filter( 'woocommerce_get_order_item_totals', array( __CLASS__, 'order_totals' ), 10, 2 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * Visual da página (só em "Pedido recebido" ou onde houver o shortcode).
	 */
	public static function enqueue() {
		wp_register_style( 'mfl-pw-obrigado', MFL_PW_URL . 'assets/css/obrigado.css', array(), MFL_PW_VERSION );
		if ( function_exists( 'is_order_received_page' ) && is_order_received_page() ) {
			wp_enqueue_style( 'mfl-pw-obrigado' );
		}
	}

	/**
	 * Usa os modelos do plugin para "Pedido recebido" e dados do cliente
	 * (sem e-mail, data, método de pagamento e "endereço de cobrança").
	 */
	public static function locate_template( $template, $template_name ) {
		$ours = array( 'checkout/thankyou.php', 'order/order-details-customer.php' );
		if ( in_array( $template_name, $ours, true ) ) {
			$file = MFL_PW_DIR . 'templates/' . $template_name;
			if ( file_exists( $file ) ) {
				return $file;
			}
		}
		return $template;
	}

	/**
	 * Tabela do pedido: sem a linha "Método de pagamento" e com "Total estimado".
	 */
	public static function order_totals( $rows, $order ) {
		if ( ! self::is_ours( $order ) ) {
			return $rows;
		}
		unset( $rows['payment_method'] );
		if ( isset( $rows['order_total'] ) ) {
			$rows['order_total']['label'] = 'Total estimado:';
		}
		return $rows;
	}

	/**
	 * Bloco "Seus dados" (nome, WhatsApp e recebimento), sem e-mail.
	 */
	public static function dados_cliente( WC_Order $order ) {
		$entrega = $order->get_meta( MFL_PW_Checkout::META_ENTREGA );
		$nome    = trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() );
		$itens   = array();

		if ( $nome ) {
			$itens[] = array( 'pessoa', 'Nome', $nome, '' );
		}
		if ( $order->get_billing_phone() ) {
			$itens[] = array( 'telefone', 'WhatsApp', $order->get_billing_phone(), '' );
		}
		if ( 'entrega' === $entrega ) {
			$linhas  = array_filter( array( $order->get_billing_address_1(), $order->get_billing_address_2(), $order->get_billing_city() ) );
			$itens[] = array( 'caminhao', 'Recebimento', 'Entrega', implode( ' – ', $linhas ) . ( $linhas ? ' · ' : '' ) . 'frete combinado pelo WhatsApp' );
		} else {
			$itens[] = array( 'loja', 'Recebimento', 'Retirada na loja', self::endereco_loja() );
		}

		ob_start();
		?>
		<section class="mfl-pw-dados">
			<h2 class="mfl-pw-dados__titulo">Seus dados</h2>
			<div class="mfl-pw-dados__lista mfl-pw-dados__card">
				<?php foreach ( $itens as list( $icone, $rotulo, $valor, $extra ) ) : ?>
					<div class="mfl-pw-dados__item">
						<span class="mfl-pw-dados__icone"><?php echo self::icone( $icone ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG fixo. ?></span>
						<div>
							<span class="mfl-pw-dados__rotulo"><?php echo esc_html( $rotulo ); ?></span>
							<span class="mfl-pw-dados__valor"><?php echo esc_html( $valor ); ?></span>
							<?php if ( $extra ) : ?>
								<span class="mfl-pw-dados__extra"><?php echo esc_html( $extra ); ?></span>
							<?php endif; ?>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		</section>
		<?php
		return ob_get_clean();
	}

	/**
	 * Ícones em SVG (traço, herdam a cor do texto).
	 */
	private static function icone( $nome ) {
		$paths = array(
			'pessoa'   => '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
			'telefone' => '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
			'caminhao' => '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
			'loja'     => '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
			'check'    => '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
		);
		$width = 'check' === $nome ? '3' : '1.8';
		return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' . $width . '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $paths[ $nome ] . '</svg>';
	}

	/**
	 * Logo do WhatsApp (preenchido).
	 */
	private static function icone_whatsapp() {
		return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
	}

	private static function endereco_loja() {
		$partes = array_filter(
			array(
				get_option( 'woocommerce_store_address' ),
				get_option( 'woocommerce_store_address_2' ),
				get_option( 'woocommerce_store_city' ),
			)
		);
		return implode( ' – ', $partes );
	}

	public static function is_ours( $order ) {
		return $order instanceof WC_Order && MFL_PW_Gateway::ID === $order->get_payment_method();
	}

	public static function received_text( $text, $order ) {
		if ( ! self::is_ours( $order ) ) {
			return $text;
		}
		return 'Pedido registrado! Agora é só enviar a mensagem no WhatsApp para combinarmos pagamento e entrega.';
	}

	public static function render( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! self::is_ours( $order ) ) {
			return;
		}
		echo self::box( $order ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapado em box().
	}

	/**
	 * [mfl_whatsapp_pedido] para usar numa página "Obrigado" montada no Elementor.
	 */
	public static function shortcode() {
		$order_id = absint( get_query_var( 'order-received' ) );
		$key      = isset( $_GET['key'] ) ? wc_clean( wp_unslash( $_GET['key'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$order    = $order_id ? wc_get_order( $order_id ) : null;

		if ( ! self::is_ours( $order ) || ! hash_equals( $order->get_order_key(), $key ) ) {
			return '';
		}
		wp_enqueue_style( 'mfl-pw-obrigado' );
		return '<div class="mfl-pw-pedido">' . self::box( $order ) . '</div>';
	}

	private static function box( WC_Order $order ) {
		// Sem esc_url(): ele apaga as quebras de linha (%0A) do recibo. O link é montado
		// só com https://wa.me/, dígitos e texto em rawurlencode(), então esc_attr() basta.
		$link    = MFL_PW_Mensagem::link( $order );
		$gateway = mfl_pw_gateway();

		// Redireciona só na primeira visita, para não reabrir o WhatsApp a cada atualização da página.
		$auto = $gateway && 'yes' === $gateway->get_option( 'auto_redirect' ) && ! $order->get_meta( self::META_REDIRECTED );
		if ( $auto ) {
			$order->update_meta_data( self::META_REDIRECTED, time() );
			$order->save_meta_data();
		}

		ob_start();
		?>
		<div class="mfl-pw-obrigado">
			<span class="mfl-pw-obrigado__icone"><?php echo self::icone( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG fixo. ?></span>
			<p class="mfl-pw-obrigado__numero">Pedido #<?php echo esc_html( $order->get_order_number() ); ?></p>
			<h1 class="mfl-pw-obrigado__titulo">Pedido registrado!</h1>
			<p class="mfl-pw-obrigado__texto">
				<?php echo $auto ? 'Estamos abrindo o WhatsApp com o resumo do seu pedido…' : 'Agora é só enviar o resumo pelo WhatsApp para combinarmos pagamento e entrega.'; ?>
			</p>
			<a class="mfl-pw-botao" href="<?php echo esc_attr( $link ); ?>" target="_blank" rel="noopener">
				<?php echo self::icone_whatsapp(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG fixo. ?>
				<span>Enviar pedido pelo WhatsApp</span>
			</a>
			<p class="mfl-pw-obrigado__dica">Se o WhatsApp não abrir sozinho, toque no botão acima.</p>
		</div>
		<?php if ( $auto ) : ?>
		<script>
			setTimeout( function () { window.location.href = <?php echo wp_json_encode( $link ); ?>; }, 1200 );
		</script>
		<?php endif; ?>
		<?php
		return ob_get_clean();
	}
}
