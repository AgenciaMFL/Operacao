<?php
/**
 * Dados do cliente abaixo dos detalhes do pedido (substitui
 * order/order-details-customer.php do WooCommerce).
 *
 * Nos pedidos "Combinar pelo WhatsApp" não mostra nada aqui: o bloco
 * "Seus dados" (sem e-mail) já aparece na página "Pedido recebido".
 *
 * @var WC_Order $order
 */

defined( 'ABSPATH' ) || exit;

if ( MFL_PW_Obrigado::is_ours( $order ) ) {
	return;
}

include WC()->plugin_path() . '/templates/order/order-details-customer.php';
