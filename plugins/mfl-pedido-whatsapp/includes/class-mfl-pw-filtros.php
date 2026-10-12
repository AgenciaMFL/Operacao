<?php
/**
 * Filtros extras da loja: "Destaques" e "Em promoção".
 *
 * Funcionam por parâmetro na URL (?destaques=1, ?promocao=1) em Loja, Categoria
 * e busca de produtos, e podem ser combinados com os filtros nativos do Woo
 * (categoria, preço, ordenação). O shortcode [mfl_filtro] gera o botão liga/desliga.
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Filtros {

	const FILTROS = array(
		'destaques' => 'Destaques',
		'promocao'  => 'Em promoção',
	);

	public static function init() {
		add_action( 'pre_get_posts', array( __CLASS__, 'apply' ), 20 );
		add_shortcode( 'mfl_filtro', array( __CLASS__, 'shortcode' ) );
	}

	private static function is_active( $key ) {
		return ! empty( $_GET[ $key ] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- filtro público de listagem.
	}

	private static function is_product_listing( WP_Query $q ) {
		if ( is_admin() || ! $q->is_main_query() ) {
			return false;
		}
		if ( $q->is_post_type_archive( 'product' ) || $q->is_tax( get_object_taxonomies( 'product' ) ) ) {
			return true;
		}
		return $q->is_search() && 'product' === $q->get( 'post_type' );
	}

	public static function apply( WP_Query $q ) {
		if ( ! self::is_product_listing( $q ) ) {
			return;
		}

		if ( self::is_active( 'destaques' ) ) {
			$tax_query   = (array) $q->get( 'tax_query' );
			$tax_query[] = array(
				'taxonomy' => 'product_visibility',
				'field'    => 'name',
				'terms'    => array( 'featured' ),
			);
			$q->set( 'tax_query', $tax_query );
		}

		if ( self::is_active( 'promocao' ) ) {
			$on_sale = array_map( 'absint', wc_get_product_ids_on_sale() );
			$current = (array) $q->get( 'post__in' );
			$ids     = $current ? array_intersect( $current, $on_sale ) : $on_sale;
			$q->set( 'post__in', $ids ? $ids : array( 0 ) ); // array(0) = nenhum resultado.
		}
	}

	/**
	 * [mfl_filtro tipo="destaques"] ou [mfl_filtro tipo="promocao" rotulo="Promoções"]
	 * Botão liga/desliga que mantém os outros filtros da URL.
	 */
	public static function shortcode( $atts ) {
		$atts = shortcode_atts( array( 'tipo' => 'destaques', 'rotulo' => '' ), $atts, 'mfl_filtro' );
		$key  = sanitize_key( $atts['tipo'] );
		if ( ! isset( self::FILTROS[ $key ] ) ) {
			return '';
		}

		$active = self::is_active( $key );
		$label  = $atts['rotulo'] ? $atts['rotulo'] : self::FILTROS[ $key ];
		$url    = $active ? remove_query_arg( array( $key, 'paged' ) ) : add_query_arg( $key, '1', remove_query_arg( 'paged' ) );
		$url    = preg_replace( '#/page/\d+/?#', '/', $url ); // Volta para a 1ª página ao trocar o filtro.

		return sprintf(
			'<a class="mfl-filtro%1$s" href="%2$s" role="switch" aria-checked="%3$s"><span class="mfl-filtro__chave" aria-hidden="true"></span><span class="mfl-filtro__rotulo">%4$s</span></a>',
			$active ? ' is-active' : '',
			esc_url( $url ),
			$active ? 'true' : 'false',
			esc_html( $label )
		);
	}
}
