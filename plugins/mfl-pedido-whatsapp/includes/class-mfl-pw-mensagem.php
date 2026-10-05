<?php
/**
 * Monta o recibo do pedido e o link do WhatsApp.
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Mensagem {

	/**
	 * Link wa.me com o recibo. Se o texto passar do limite, manda um resumo com o link do pedido.
	 */
	public static function link( WC_Order $order ) {
		$gateway = mfl_pw_gateway();
		$phone   = $gateway ? $gateway->get_phone() : '';
		$limit   = $gateway ? max( 500, (int) $gateway->get_option( 'max_length', 3000 ) ) : 3000;

		$text = self::recibo( $order );
		if ( mb_strlen( $text ) > $limit ) {
			$text = self::resumo( $order );
		}

		return 'https://wa.me/' . $phone . '?text=' . rawurlencode( $text );
	}

	public static function recibo( WC_Order $order ) {
		$lines   = self::cabecalho( $order );
		$lines[] = '';
		$lines[] = '*Itens:*';

		foreach ( $order->get_items() as $item ) {
			/** @var WC_Order_Item_Product $item */
			$product = $item->get_product();
			$qty     = $item->get_quantity();
			$name    = $item->get_name();
			$sku     = $product ? $product->get_sku() : '';
			$total   = (float) $item->get_total();
			$unit    = $qty ? $total / $qty : $total;

			$line = '• ' . $qty . 'x ' . $name;
			if ( $sku ) {
				$line .= ' (SKU ' . $sku . ')';
			}
			if ( $total > 0 ) {
				$line .= $qty > 1
					? ' – ' . self::money( $unit ) . ' = ' . self::money( $total )
					: ' – ' . self::money( $total );
			} else {
				$line .= ' – sob consulta';
			}
			$lines[] = $line;

			foreach ( $item->get_formatted_meta_data( '_', true ) as $meta ) {
				$lines[] = '   ' . wp_strip_all_tags( $meta->display_key ) . ': ' . wp_strip_all_tags( $meta->display_value );
			}
		}

		$lines = array_merge( $lines, self::rodape( $order ) );
		return implode( "\n", $lines );
	}

	public static function resumo( WC_Order $order ) {
		$lines   = self::cabecalho( $order );
		$lines[] = '';
		$lines[] = '*Itens:* ' . $order->get_item_count() . ' unidades em ' . count( $order->get_items() ) . ' produtos';
		$lines[] = '*Pedido completo:* ' . $order->get_checkout_order_received_url();
		$lines   = array_merge( $lines, self::rodape( $order ) );
		return implode( "\n", $lines );
	}

	private static function cabecalho( WC_Order $order ) {
		$gateway = mfl_pw_gateway();
		$header  = $gateway ? trim( (string) $gateway->get_option( 'header' ) ) : '';

		$lines = array();
		if ( $header ) {
			$lines[] = $header;
			$lines[] = '';
		}
		$lines[] = '🛒 *Pedido #' . $order->get_order_number() . '*';
		$created = $order->get_date_created();
		if ( $created ) {
			$lines[] = '📅 ' . $created->date_i18n( 'd/m/Y H:i' );
		}
		$lines[] = '';
		$lines[] = '*Cliente:* ' . trim( $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() );
		if ( $order->get_billing_phone() ) {
			$lines[] = '*WhatsApp:* ' . $order->get_billing_phone();
		}

		$entrega = $order->get_meta( MFL_PW_Checkout::META_ENTREGA );
		if ( 'entrega' === $entrega ) {
			$endereco = array_filter(
				array(
					$order->get_billing_address_1(),
					$order->get_billing_address_2(),
					$order->get_billing_city(),
				)
			);
			$lines[]  = '*Entrega:* ' . implode( ' – ', $endereco );
		} elseif ( 'retirada' === $entrega ) {
			$lines[] = '*Retirada na loja*';
		}

		return $lines;
	}

	private static function rodape( WC_Order $order ) {
		$gateway = mfl_pw_gateway();
		$footer  = $gateway ? trim( (string) $gateway->get_option( 'footer' ) ) : '';

		$lines   = array( '' );
		$lines[] = '*Total estimado:* ' . self::money( (float) $order->get_total() );

		$note = trim( (string) $order->get_customer_note() );
		if ( $note ) {
			$lines[] = '';
			$lines[] = '*Observações:* ' . $note;
		}
		if ( $footer ) {
			$lines[] = '';
			$lines[] = '_' . $footer . '_';
		}
		return $lines;
	}

	private static function money( $value ) {
		$text = html_entity_decode( wp_strip_all_tags( wc_price( $value ) ), ENT_QUOTES, 'UTF-8' );
		return str_replace( "\xc2\xa0", ' ', $text );
	}
}
