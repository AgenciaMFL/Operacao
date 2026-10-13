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

		ob_start();
		?>
		<section class="mfl-pw-dados">
			<h2 class="mfl-pw-dados__titulo">Seus dados</h2>
			<div class="mfl-pw-dados__card">
				<?php if ( $nome ) : ?>
					<p><strong>Nome:</strong> <?php echo esc_html( $nome ); ?></p>
				<?php endif; ?>
				<?php if ( $order->get_billing_phone() ) : ?>
					<p><strong>WhatsApp:</strong> <?php echo esc_html( $order->get_billing_phone() ); ?></p>
				<?php endif; ?>
				<?php if ( 'entrega' === $entrega ) : ?>
					<p><strong>Recebimento:</strong> Entrega (frete combinado pelo WhatsApp)</p>
					<p>
						<?php
						$linhas = array_filter( array( $order->get_billing_address_1(), $order->get_billing_address_2(), $order->get_billing_city() ) );
						echo esc_html( implode( ' – ', $linhas ) );
						?>
					</p>
				<?php else : ?>
					<p><strong>Recebimento:</strong> Retirada na loja</p>
					<p><?php echo esc_html( self::endereco_loja() ); ?></p>
				<?php endif; ?>
			</div>
		</section>
		<?php
		return ob_get_clean();
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
		return self::box( $order );
	}

	private static function box( WC_Order $order ) {
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
		<div class="mfl-pw-obrigado" style="text-align:center;padding:24px;margin:0 0 24px;border-radius:16px;background:#f3fbf5;border:1px solid #c8ecd2;">
			<p style="margin:0 0 8px;font-size:1.15em;"><strong>Pedido #<?php echo esc_html( $order->get_order_number() ); ?> registrado!</strong></p>
			<p style="margin:0 0 16px;">
				<?php echo $auto ? 'Estamos abrindo o WhatsApp com o resumo do seu pedido…' : 'Envie o resumo do pedido para a loja pelo WhatsApp:'; ?>
			</p>
			<a class="button mfl-pw-botao" href="<?php echo esc_url( $link ); ?>" target="_blank" rel="noopener"
				style="display:inline-block;background:#25d366;color:#fff;padding:14px 28px;border-radius:999px;font-weight:700;text-decoration:none;">
				Enviar pedido pelo WhatsApp
			</a>
			<p style="margin:12px 0 0;font-size:.9em;opacity:.75;">Se o WhatsApp não abrir sozinho, toque no botão acima.</p>
		</div>
		<?php if ( $auto ) : ?>
		<script>
			setTimeout( function () { window.location.href = <?php echo wp_json_encode( esc_url_raw( $link ) ); ?>; }, 1200 );
		</script>
		<?php endif; ?>
		<?php
		return ob_get_clean();
	}
}
