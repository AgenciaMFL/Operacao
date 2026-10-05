<?php
/**
 * Método "Combinar pelo WhatsApp": não cobra nada, só registra o pedido.
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Gateway extends WC_Payment_Gateway {

	const ID = 'mfl_whatsapp';

	public function __construct() {
		$this->id                 = self::ID;
		$this->has_fields         = false;
		$this->method_title       = 'Combinar pelo WhatsApp';
		$this->method_description = 'Salva o pedido e abre o WhatsApp da loja com o recibo. Pagamento, frete e preço final são combinados na conversa.';
		$this->supports           = array( 'products' );

		$this->init_form_fields();
		$this->init_settings();

		$this->title             = $this->get_option( 'title' );
		$this->description       = $this->get_option( 'description' );
		$this->order_button_text = $this->get_option( 'button_text' );

		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
	}

	public function init_form_fields() {
		$this->form_fields = array(
			'enabled'       => array(
				'title'   => 'Ativar',
				'type'    => 'checkbox',
				'label'   => 'Ativar "Combinar pelo WhatsApp"',
				'default' => 'yes',
			),
			'title'         => array(
				'title'   => 'Título no checkout',
				'type'    => 'text',
				'default' => 'Combinar pelo WhatsApp',
			),
			'description'   => array(
				'title'   => 'Descrição no checkout',
				'type'    => 'textarea',
				'default' => 'Ao finalizar, você será levado ao nosso WhatsApp com o resumo do pedido. Lá combinamos pagamento, entrega e confirmamos os valores.',
			),
			'button_text'   => array(
				'title'   => 'Texto do botão de finalizar',
				'type'    => 'text',
				'default' => 'Enviar pedido pelo WhatsApp',
			),
			'phone'         => array(
				'title'       => 'Número do WhatsApp da loja',
				'type'        => 'text',
				'description' => 'Com DDI e DDD, só números. Ex.: 5521971281678',
				'default'     => '5521971281678',
			),
			'header'        => array(
				'title'   => 'Cabeçalho da mensagem',
				'type'    => 'text',
				'default' => 'Olá! Quero fazer este pedido:',
			),
			'footer'        => array(
				'title'   => 'Rodapé da mensagem',
				'type'    => 'textarea',
				'default' => 'Valores sujeitos a confirmação pelo atendente.',
			),
			'auto_redirect' => array(
				'title'   => 'Abrir WhatsApp automaticamente',
				'type'    => 'checkbox',
				'label'   => 'Redirecionar para o WhatsApp assim que o pedido for criado',
				'default' => 'yes',
			),
			'max_length'    => array(
				'title'       => 'Tamanho máximo da mensagem',
				'type'        => 'number',
				'description' => 'Acima deste número de caracteres, envia um resumo com o link do pedido completo.',
				'default'     => '3000',
			),
		);
	}

	/**
	 * Número da loja só com dígitos.
	 */
	public function get_phone() {
		return preg_replace( '/\D+/', '', (string) $this->get_option( 'phone' ) );
	}

	public function process_payment( $order_id ) {
		$order = wc_get_order( $order_id );

		// Sem cobrança e sem baixa de estoque: o estoque baixa quando o pedido for marcado como "Processando".
		$order->update_status( MFL_PW_STATUS, 'Pedido enviado pelo WhatsApp.' );

		WC()->cart->empty_cart();

		return array(
			'result'   => 'success',
			'redirect' => $this->get_return_url( $order ),
		);
	}
}
