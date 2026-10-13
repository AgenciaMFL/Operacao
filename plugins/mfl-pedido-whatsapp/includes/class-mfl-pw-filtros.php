<?php
/**
 * Filtros extras da loja: "Destaques" e "Em promoção".
 *
 * Funcionam por parâmetro na URL (?destaques=1, ?promocao=1) em Loja, Categoria
 * e busca de produtos, e podem ser combinados com os filtros nativos do Woo
 * (categoria, preço, ordenação). O shortcode [mfl_filtro] gera o botão liga/desliga.
 *
 * Preço no Loop Grid do Elementor: o WooCommerce só aplica a faixa de preço
 * (?min_price/?max_price) e a ordenação por preço (?orderby=price|price-desc) na
 * consulta principal. O Loop Grid com "Consulta atual" roda uma consulta própria,
 * então price_clauses() repete essas regras nela, usando a mesma tabela do Woo.
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Filtros {

	const FILTROS = array(
		'destaques' => 'Destaques',
		'promocao'  => 'Em promoção',
	);

	public static function init() {
		add_action( 'pre_get_posts', array( __CLASS__, 'apply' ), 20 );
		add_filter( 'posts_clauses', array( __CLASS__, 'price_clauses' ), 20, 2 );
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

	/**
	 * Aplica faixa de preço e ordenação por preço em consultas SECUNDÁRIAS de produtos
	 * (ex.: Loop Grid do Elementor) numa página de listagem de produtos.
	 */
	public static function price_clauses( $args, $query ) {
		global $wpdb, $wp_the_query;

		if ( is_admin() || $query->is_main_query() || ! $wp_the_query instanceof WP_Query || ! self::is_product_listing( $wp_the_query ) ) {
			return $args;
		}
		if ( ! in_array( 'product', (array) $query->get( 'post_type' ), true ) ) {
			return $args;
		}

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- filtros públicos de listagem.
		$has_min = isset( $_GET['min_price'] ) && '' !== $_GET['min_price'];
		$has_max = isset( $_GET['max_price'] ) && '' !== $_GET['max_price'];
		$orderby = isset( $_GET['orderby'] ) ? sanitize_key( wp_unslash( $_GET['orderby'] ) ) : '';
		$min     = $has_min ? floatval( wp_unslash( $_GET['min_price'] ) ) : 0;
		$max     = $has_max ? floatval( wp_unslash( $_GET['max_price'] ) ) : PHP_INT_MAX;
		// phpcs:enable

		$sort = in_array( $orderby, array( 'price', 'price-desc' ), true );
		if ( ! $has_min && ! $has_max && ! $sort ) {
			return $args;
		}

		$table = $wpdb->wc_product_meta_lookup;
		if ( false === strpos( $args['join'], 'mfl_price_lookup' ) ) {
			$args['join'] .= " LEFT JOIN {$table} mfl_price_lookup ON {$wpdb->posts}.ID = mfl_price_lookup.product_id ";
		}

		if ( $has_min || $has_max ) {
			// Mesma regra do Woo: o produto entra se a faixa dele [min, max] cruza a faixa pedida.
			$args['where'] .= $wpdb->prepare(
				' AND NOT ( %f < mfl_price_lookup.min_price OR %f > mfl_price_lookup.max_price ) ',
				$max,
				$min
			);
		}

		if ( 'price' === $orderby ) {
			$args['orderby'] = ' mfl_price_lookup.min_price ASC, mfl_price_lookup.product_id ASC ';
		} elseif ( 'price-desc' === $orderby ) {
			$args['orderby'] = ' mfl_price_lookup.max_price DESC, mfl_price_lookup.product_id DESC ';
		}

		return $args;
	}
}
