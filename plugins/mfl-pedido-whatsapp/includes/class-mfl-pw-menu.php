<?php
/**
 * Menu de categorias automático: [mfl_menu_categorias]
 *
 * Lê as categorias de produto direto do WooCommerce, então categoria ou
 * subcategoria nova aparece sozinha. Categoria com subcategorias abre em
 * sanfona ("Ver tudo em X" + subcategorias); sem subcategorias, é um link.
 *
 * Ordem: a do WooCommerce (Produtos → Categorias, arrastar), depois nome;
 * subcategorias que começam com "Outros" ficam por último.
 * Cor de cada categoria: campo "Cor no menu" na edição da categoria.
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Menu {

	const META_COR = 'mfl_cor';
	const CORES    = array( '#29abe2', '#ec1e79', '#f7931e', '#8e2de2', '#22b573', '#f15a24' );

	private static $instancia = 0;

	public static function init() {
		add_shortcode( 'mfl_menu_categorias', array( __CLASS__, 'shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );

		add_action( 'product_cat_add_form_fields', array( __CLASS__, 'campo_novo' ) );
		add_action( 'product_cat_edit_form_fields', array( __CLASS__, 'campo_editar' ) );
		add_action( 'created_product_cat', array( __CLASS__, 'salvar_cor' ) );
		add_action( 'edited_product_cat', array( __CLASS__, 'salvar_cor' ) );
	}

	public static function enqueue() {
		wp_enqueue_style( 'mfl-pw-menu', MFL_PW_URL . 'assets/css/menu-categorias.css', array(), MFL_PW_VERSION );
		wp_enqueue_script( 'mfl-pw-menu', MFL_PW_URL . 'assets/js/menu-categorias.js', array(), MFL_PW_VERSION, true );
	}

	/**
	 * [mfl_menu_categorias titulo="Categorias"]
	 */
	public static function shortcode( $atts ) {
		$atts = shortcode_atts( array( 'titulo' => 'Categorias' ), $atts, 'mfl_menu_categorias' );

		$categorias = self::termos( 0 );
		if ( ! $categorias ) {
			return '';
		}

		$atual = is_product_category() ? get_queried_object() : null;
		self::$instancia++;

		ob_start();
		?>
		<nav class="mfl-cats" aria-label="<?php echo esc_attr( $atts['titulo'] ? $atts['titulo'] : 'Categorias' ); ?>">
			<?php if ( $atts['titulo'] ) : ?>
				<p class="mfl-cats__titulo"><?php echo esc_html( $atts['titulo'] ); ?></p>
			<?php endif; ?>
			<ul class="mfl-cats__lista">
				<?php
				foreach ( $categorias as $i => $cat ) :
					$filhas = self::termos( $cat->term_id );
					$cor    = self::cor( $cat, $i );
					$link   = get_term_link( $cat );
					$aberta = $atual && ( $atual->term_id === $cat->term_id || $atual->parent === $cat->term_id );
					?>
					<li class="mfl-cats__item" style="--mfl-cat-cor:<?php echo esc_attr( $cor ); ?>">
						<?php if ( $filhas ) : ?>
							<?php $painel = 'mfl-cats-' . self::$instancia . '-' . $cat->term_id; ?>
							<button type="button" class="mfl-cats__linha mfl-cats__toggle" aria-expanded="<?php echo $aberta ? 'true' : 'false'; ?>" aria-controls="<?php echo esc_attr( $painel ); ?>">
								<span class="mfl-cats__nome"><?php echo esc_html( $cat->name ); ?></span>
								<?php echo self::seta(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG fixo. ?>
							</button>
							<div class="mfl-cats__painel" id="<?php echo esc_attr( $painel ); ?>">
								<ul class="mfl-cats__sub">
									<li><a class="mfl-cats__todos" href="<?php echo esc_url( $link ); ?>">Ver tudo em <?php echo esc_html( $cat->name ); ?></a></li>
									<?php foreach ( $filhas as $filha ) : ?>
										<li>
											<a href="<?php echo esc_url( get_term_link( $filha ) ); ?>"<?php echo $atual && $atual->term_id === $filha->term_id ? ' aria-current="page"' : ''; ?>>
												<?php echo esc_html( $filha->name ); ?>
											</a>
										</li>
									<?php endforeach; ?>
								</ul>
							</div>
						<?php else : ?>
							<a class="mfl-cats__linha" href="<?php echo esc_url( $link ); ?>"<?php echo $aberta ? ' aria-current="page"' : ''; ?>>
								<span class="mfl-cats__nome"><?php echo esc_html( $cat->name ); ?></span>
								<?php echo self::seta(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG fixo. ?>
							</a>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>
			</ul>
		</nav>
		<?php
		return ob_get_clean();
	}

	/**
	 * Categorias com produtos, sem "Sem categoria", na ordem do Woo; "Outros…" por último.
	 */
	private static function termos( $parent ) {
		$termos = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'parent'     => $parent,
				'hide_empty' => true,
				'orderby'    => 'menu_order',
				'exclude'    => array( (int) get_option( 'default_product_cat' ) ),
			)
		);
		if ( is_wp_error( $termos ) ) {
			return array();
		}

		$termos = array_values( $termos );
		$pos    = array_flip( wp_list_pluck( $termos, 'term_id' ) );
		usort(
			$termos,
			function ( $a, $b ) use ( $pos ) {
				$outros_a = 0 === stripos( $a->name, 'outros' );
				$outros_b = 0 === stripos( $b->name, 'outros' );
				if ( $outros_a !== $outros_b ) {
					return $outros_a ? 1 : -1;
				}
				return $pos[ $a->term_id ] <=> $pos[ $b->term_id ];
			}
		);
		return $termos;
	}

	private static function cor( WP_Term $cat, $i ) {
		$cor = sanitize_hex_color( (string) get_term_meta( $cat->term_id, self::META_COR, true ) );
		return $cor ? $cor : self::CORES[ $i % count( self::CORES ) ];
	}

	private static function seta() {
		return '<svg class="mfl-cats__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
	}

	/* Campo "Cor no menu" na tela de categorias do painel. */

	public static function campo_novo() {
		?>
		<div class="form-field">
			<label for="mfl_cor">Cor no menu</label>
			<input type="color" name="mfl_cor" id="mfl_cor" value="#8e2de2">
			<p>Cor da borda desta categoria no menu lateral (só vale para categorias principais).</p>
		</div>
		<?php
	}

	public static function campo_editar( $term ) {
		$cor = sanitize_hex_color( (string) get_term_meta( $term->term_id, self::META_COR, true ) );
		?>
		<tr class="form-field">
			<th scope="row"><label for="mfl_cor">Cor no menu</label></th>
			<td>
				<input type="color" name="mfl_cor" id="mfl_cor" value="<?php echo esc_attr( $cor ? $cor : '#8e2de2' ); ?>">
				<p class="description">Cor da borda desta categoria no menu lateral (só vale para categorias principais).</p>
			</td>
		</tr>
		<?php
	}

	public static function salvar_cor( $term_id ) {
		// O nonce da tela de categorias já é conferido pelo WordPress antes destes ganchos.
		if ( ! isset( $_POST['mfl_cor'] ) || ! current_user_can( 'manage_product_terms' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			return;
		}
		$cor = sanitize_hex_color( wp_unslash( $_POST['mfl_cor'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( $cor ) {
			update_term_meta( $term_id, self::META_COR, $cor );
		}
	}
}
