<?php
/**
 * "Não encontrou? Fale com a gente": botão para o WhatsApp quando a busca
 * não acha nada, registro dos termos sem resultado e tela no painel.
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Busca {

	const OPTION    = 'mfl_pw_buscas_sem_resultado';
	const MAX_TERMS = 500;

	public static function init() {
		add_action( 'woocommerce_no_products_found', array( __CLASS__, 'render_box' ), 20 );
		add_action( 'template_redirect', array( __CLASS__, 'log_empty_search' ) );
		add_shortcode( 'mfl_nao_encontrou', array( __CLASS__, 'shortcode' ) );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ) );
		add_action( 'admin_post_mfl_pw_limpar_buscas', array( __CLASS__, 'clear' ) );
	}

	/**
	 * Link do WhatsApp da loja, com o termo buscado (se houver).
	 */
	public static function whatsapp_link( $term = '' ) {
		$gateway = mfl_pw_gateway();
		$phone   = $gateway ? $gateway->get_phone() : '';
		$text    = $term
			? sprintf( 'Olá! Procurei por "%s" no site e não encontrei. Vocês têm?', $term )
			: 'Olá! Não encontrei o que procurava no site. Podem me ajudar?';
		return 'https://wa.me/' . $phone . '?text=' . rawurlencode( $text );
	}

	private static function current_term() {
		return is_search() ? trim( wp_strip_all_tags( get_search_query( false ) ) ) : '';
	}

	public static function render_box() {
		echo self::box( self::current_term() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapado em box().
	}

	/**
	 * [mfl_nao_encontrou] para usar em qualquer página do Elementor.
	 */
	public static function shortcode() {
		return self::box( self::current_term() );
	}

	private static function box( $term ) {
		ob_start();
		?>
		<div class="mfl-pw-nao-encontrou" style="text-align:center;padding:24px;margin:24px 0;border-radius:16px;background:#f7f2fc;border:1px solid #e4d6f5;">
			<p class="mfl-pw-nao-encontrou__titulo"><strong>Não encontrou o que procurava?</strong></p>
			<p class="mfl-pw-nao-encontrou__texto">Temos muito mais produtos na loja. Fale com a gente pelo WhatsApp que verificamos para você.</p>
			<a class="button mfl-pw-botao" href="<?php echo esc_url( self::whatsapp_link( $term ) ); ?>" target="_blank" rel="noopener"
				style="display:inline-block;background:#25d366;color:#fff;padding:12px 24px;border-radius:999px;font-weight:700;text-decoration:none;">
				Falar no WhatsApp
			</a>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Registra buscas de produto sem resultado (termo, quantidade, última vez).
	 */
	public static function log_empty_search() {
		if ( ! is_search() || is_admin() || is_paged() ) {
			return;
		}
		global $wp_query;
		if ( $wp_query->found_posts > 0 ) {
			return;
		}

		$term = mb_strtolower( self::current_term() );
		if ( '' === $term || mb_strlen( $term ) > 80 ) {
			return;
		}

		$data = get_option( self::OPTION, array() );
		if ( ! is_array( $data ) ) {
			$data = array();
		}
		$data[ $term ] = array(
			'count' => ( $data[ $term ]['count'] ?? 0 ) + 1,
			'last'  => time(),
		);

		// Mantém só os termos mais buscados para a opção não crescer sem limite.
		if ( count( $data ) > self::MAX_TERMS ) {
			uasort( $data, fn( $a, $b ) => $b['count'] <=> $a['count'] );
			$data = array_slice( $data, 0, self::MAX_TERMS, true );
		}

		update_option( self::OPTION, $data, false );
	}

	public static function admin_menu() {
		add_submenu_page(
			'woocommerce',
			'Buscas sem resultado',
			'Buscas sem resultado',
			'manage_woocommerce',
			'mfl-pw-buscas',
			array( __CLASS__, 'admin_page' )
		);
	}

	public static function admin_page() {
		$data = get_option( self::OPTION, array() );
		$data = is_array( $data ) ? $data : array();
		uasort( $data, fn( $a, $b ) => $b['count'] <=> $a['count'] );
		?>
		<div class="wrap">
			<h1>Buscas sem resultado</h1>
			<p>O que os clientes procuraram no site e não encontraram. Use esta lista para decidir quais produtos cadastrar.</p>
			<?php if ( ! $data ) : ?>
				<p><em>Nenhuma busca sem resultado registrada ainda.</em></p>
			<?php else : ?>
				<table class="widefat striped" style="max-width:800px">
					<thead><tr><th>Termo buscado</th><th>Vezes</th><th>Última busca</th><th></th></tr></thead>
					<tbody>
					<?php foreach ( $data as $term => $row ) : ?>
						<tr>
							<td><?php echo esc_html( $term ); ?></td>
							<td><?php echo esc_html( (string) $row['count'] ); ?></td>
							<td><?php echo esc_html( wp_date( 'd/m/Y H:i', $row['last'] ) ); ?></td>
							<td><a href="<?php echo esc_url( admin_url( 'post-new.php?post_type=product&post_title=' . rawurlencode( $term ) ) ); ?>">Cadastrar produto</a></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top:16px">
					<input type="hidden" name="action" value="mfl_pw_limpar_buscas">
					<?php wp_nonce_field( 'mfl_pw_limpar_buscas' ); ?>
					<?php submit_button( 'Limpar lista', 'secondary', 'submit', false, array( 'onclick' => "return confirm('Limpar todas as buscas registradas?');" ) ); ?>
				</form>
			<?php endif; ?>
		</div>
		<?php
	}

	public static function clear() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'Sem permissão.' );
		}
		check_admin_referer( 'mfl_pw_limpar_buscas' );
		delete_option( self::OPTION );
		wp_safe_redirect( admin_url( 'admin.php?page=mfl-pw-buscas' ) );
		exit;
	}
}
