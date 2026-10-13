<?php
/**
 * Página "Pedido recebido" (substitui checkout/thankyou.php do WooCommerce).
 *
 * Mostra: quadro do WhatsApp, detalhes do pedido, "Seus dados" e "Continuar comprando".
 * Visual em assets/css/obrigado.css.
 * Não mostra: e-mail, data, método de pagamento nem "endereço de cobrança".
 *
 * @var WC_Order|false $order
 */

defined( 'ABSPATH' ) || exit;

// Pedido de outro método de pagamento: usa o modelo original do WooCommerce.
if ( $order && ! MFL_PW_Obrigado::is_ours( $order ) ) {
	include WC()->plugin_path() . '/templates/checkout/thankyou.php';
	return;
}
?>
<div class="woocommerce-order mfl-pw-pedido">
	<?php if ( $order ) : ?>

		<?php do_action( 'woocommerce_before_thankyou', $order->get_id() ); ?>

		<?php if ( $order->has_status( 'failed' ) ) : ?>

			<p class="woocommerce-notice woocommerce-notice--error woocommerce-thankyou-order-failed">
				Não foi possível registrar o seu pedido. Tente novamente.
			</p>
			<p><a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="button">Voltar ao carrinho</a></p>

		<?php else : ?>

			<?php do_action( 'woocommerce_thankyou_' . $order->get_payment_method(), $order->get_id() ); ?>
			<?php do_action( 'woocommerce_thankyou', $order->get_id() ); ?>
			<?php echo MFL_PW_Obrigado::dados_cliente( $order ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapado em dados_cliente(). ?>

			<p class="mfl-pw-continuar">
				<a class="mfl-pw-continuar__botao" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Continuar comprando</a>
			</p>

		<?php endif; ?>

	<?php else : ?>

		<p class="woocommerce-notice woocommerce-notice--success woocommerce-thankyou-order-received">Pedido registrado!</p>

	<?php endif; ?>
</div>
