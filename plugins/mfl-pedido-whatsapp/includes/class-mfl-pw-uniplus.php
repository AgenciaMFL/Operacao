<?php
/**
 * "Porteiro" da integração Uniplus → WooCommerce.
 *
 * O Uniplus (ERP da loja) escreve no site pela API REST do Woo com a chave
 * "Uniplus". Ele ainda guarda os IDs do site antigo e tem milhares de produtos
 * marcados para o e-commerce, então aqui filtramos tudo o que chega com essa chave:
 *
 * - Produto que existe no site (casado pelo SKU = "Código" do Uniplus): aplica SÓ
 *   estoque e preço, mesmo que o Uniplus mande um ID antigo. Nome, descrição, fotos,
 *   categorias e status nunca são alterados por ele.
 * - Produto que não existe no site: recusa (não cria rascunho).
 * - Pedidos: o Uniplus não vê nenhum (nada entra na base da loja) e não altera nenhum.
 * - Qualquer outra escrita (categorias, atributos, variações, exclusões): recusa.
 * - Leituras de produtos (GET) passam normalmente.
 *
 * Estoque ≤ 0 deixa o produto "fora de estoque"; com "Ocultar itens fora de estoque"
 * ligado no Woo, ele some do site e volta sozinho quando o estoque voltar.
 *
 * Tudo fica registrado em WooCommerce → Uniplus (últimas 300 chamadas).
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Uniplus {

	const KEY_DESCRIPTION = 'Uniplus';
	const OPTION_LOG      = 'mfl_pw_uniplus_log';
	const MAX_LOG         = 300;

	/** Aplicar o preço normal que o Uniplus manda (estoque é sempre aplicado). */
	const APLICAR_PRECO = true;

	const OPTION_STATS    = 'mfl_pw_uniplus_stats';

	private static $is_uniplus = null;
	private static $buffer     = array();
	private static $ignored    = 0;
	private static $unchanged  = 0;
	private static $flush_hooked = false;

	public static function init() {
		add_filter( 'rest_pre_dispatch', array( __CLASS__, 'filter' ), 5, 3 );
		add_action( 'admin_menu', array( __CLASS__, 'admin_menu' ) );
		add_action( 'admin_post_mfl_pw_uniplus_limpar', array( __CLASS__, 'clear_log' ) );
	}

	/* ------------------------------------------------------------------ */
	/* Identificação da chave                                              */
	/* ------------------------------------------------------------------ */

	/**
	 * A requisição foi autenticada com a chave REST cuja descrição é "Uniplus"?
	 */
	private static function is_uniplus_request() {
		if ( null !== self::$is_uniplus ) {
			return self::$is_uniplus;
		}
		self::$is_uniplus = false;

		// O Woo só define o usuário se chave E segredo forem válidos.
		if ( ! get_current_user_id() ) {
			return false;
		}

		$key = self::consumer_key_from_request();
		if ( '' === $key || 0 !== strpos( $key, 'ck_' ) || ! function_exists( 'wc_api_hash' ) ) {
			return false;
		}

		global $wpdb;
		$description = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT description FROM {$wpdb->prefix}woocommerce_api_keys WHERE consumer_key = %s",
				wc_api_hash( $key )
			)
		);

		self::$is_uniplus = ( null !== $description && 0 === strcasecmp( trim( $description ), self::KEY_DESCRIPTION ) );
		return self::$is_uniplus;
	}

	private static function consumer_key_from_request() {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput
		if ( ! empty( $_SERVER['PHP_AUTH_USER'] ) ) {
			return sanitize_text_field( wp_unslash( $_SERVER['PHP_AUTH_USER'] ) );
		}
		foreach ( array( 'HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION' ) as $header ) {
			if ( ! empty( $_SERVER[ $header ] ) && 0 === stripos( $_SERVER[ $header ], 'basic ' ) ) {
				$decoded = base64_decode( substr( $_SERVER[ $header ], 6 ), true );
				if ( $decoded && false !== strpos( $decoded, ':' ) ) {
					return sanitize_text_field( strstr( $decoded, ':', true ) );
				}
			}
		}
		foreach ( array( 'consumer_key', 'oauth_consumer_key' ) as $param ) {
			if ( ! empty( $_GET[ $param ] ) ) {
				return sanitize_text_field( wp_unslash( $_GET[ $param ] ) );
			}
		}
		// phpcs:enable
		return '';
	}

	/* ------------------------------------------------------------------ */
	/* Filtro principal                                                    */
	/* ------------------------------------------------------------------ */

	public static function filter( $result, $server, $request ) {
		if ( null !== $result || ! $request instanceof WP_REST_Request ) {
			return $result;
		}

		$route = $request->get_route();
		if ( ! preg_match( '#^/wc/v\d+/#', $route ) || ! self::is_uniplus_request() ) {
			return $result;
		}

		$method = strtoupper( $request->get_method() );
		$path   = preg_replace( '#^/wc/v\d+#', '', untrailingslashit( $route ) );

		// Pedidos: o Uniplus não vê nem altera nenhum.
		if ( 0 === strpos( $path, '/orders' ) ) {
			if ( 'GET' === $method && '/orders' === $path ) {
				self::log( $method, $route, '', 0, 'pedidos ocultados', 'lista vazia' );
				$response = new WP_REST_Response( array(), 200 );
				$response->header( 'X-WP-Total', 0 );
				$response->header( 'X-WP-TotalPages', 0 );
				return $response;
			}
			self::log( $method, $route, '', 0, 'pedidos bloqueados', '403' );
			return self::error( 'mfl_pw_uniplus_pedidos', 'Pedidos do site não são enviados ao Uniplus.', 403 );
		}

		// Leituras passam (o Uniplus pode consultar produtos e categorias).
		if ( 'GET' === $method ) {
			return $result;
		}

		// Produto único: POST /products (criar) ou PUT/PATCH/POST /products/{id} (atualizar).
		if ( '/products' === $path && 'POST' === $method ) {
			return self::single( $request->get_json_params() ? $request->get_json_params() : $request->get_body_params(), 0, true, $route, $method );
		}
		if ( preg_match( '#^/products/(\d+)$#', $path, $m ) && in_array( $method, array( 'PUT', 'PATCH', 'POST' ), true ) ) {
			$data = $request->get_json_params() ? $request->get_json_params() : $request->get_body_params();
			return self::single( $data, (int) $m[1], false, $route, $method );
		}

		// Lote: POST /products/batch { create: [], update: [], delete: [] }.
		if ( '/products/batch' === $path && in_array( $method, array( 'POST', 'PUT', 'PATCH' ), true ) ) {
			return self::batch( $request, $route, $method );
		}

		// Qualquer outra escrita (categorias, atributos, variações, exclusões...).
		self::log( $method, $route, '', 0, 'escrita bloqueada', '403' );
		return self::error( 'mfl_pw_uniplus_bloqueado', 'Escrita não permitida para a integração Uniplus.', 403 );
	}

	/* ------------------------------------------------------------------ */
	/* Produto único e lote                                                */
	/* ------------------------------------------------------------------ */

	private static function single( $data, $url_id, $is_create, $route, $method ) {
		$outcome = self::process_item( is_array( $data ) ? $data : array(), $url_id );
		self::log( $method, $route, $outcome['sku'], $outcome['id'], $outcome['action'], $outcome['detail'] );

		if ( is_wp_error( $outcome['response'] ) ) {
			return $outcome['response'];
		}
		return new WP_REST_Response( $outcome['response'], $is_create ? 201 : 200 );
	}

	private static function batch( WP_REST_Request $request, $route, $method ) {
		$out = array();
		foreach ( array( 'create', 'update' ) as $group ) {
			$items = (array) $request->get_param( $group );
			if ( ! $items ) {
				continue;
			}
			$out[ $group ] = array();
			foreach ( $items as $item ) {
				$item    = is_array( $item ) ? $item : array();
				$outcome = self::process_item( $item, isset( $item['id'] ) ? (int) $item['id'] : 0 );
				self::log( $method, $route . ' [' . $group . ']', $outcome['sku'], $outcome['id'], $outcome['action'], $outcome['detail'] );
				$out[ $group ][] = is_wp_error( $outcome['response'] )
					? self::batch_error( $outcome['response'], isset( $item['id'] ) ? (int) $item['id'] : 0 )
					: $outcome['response'];
			}
		}

		$delete = (array) $request->get_param( 'delete' );
		if ( $delete ) {
			$out['delete'] = array();
			foreach ( $delete as $id ) {
				self::log( $method, $route . ' [delete]', '', (int) $id, 'exclusão bloqueada', '403' );
				$out['delete'][] = self::batch_error( self::error( 'mfl_pw_uniplus_bloqueado', 'Exclusão não permitida.', 403 ), (int) $id );
			}
		}

		return new WP_REST_Response( $out, 200 );
	}

	/**
	 * Decide o produto do site e aplica só estoque/preço.
	 *
	 * @return array{response: array|WP_Error, sku: string, id: int, action: string, detail: string}
	 */
	private static function process_item( array $data, $url_id ) {
		$sku     = isset( $data['sku'] ) ? trim( (string) $data['sku'] ) : '';
		$product = null;
		$how     = '';

		// 1) Pelo SKU (o "Código" do Uniplus) — sempre preferido, porque os IDs guardados
		//    no Uniplus podem ser do site antigo e coincidir com outro produto do site novo.
		if ( '' !== $sku ) {
			$found = wc_get_product_id_by_sku( $sku );
			if ( $found ) {
				$product = wc_get_product( $found );
				$how     = 'pelo SKU';
			}
		} elseif ( $url_id ) {
			// 2) Sem SKU no envio: aceita o ID só se o produto existir e tiver SKU
			//    (ou seja, foi vinculado a mão no Uniplus com o ID atual).
			$candidate = wc_get_product( $url_id );
			if ( $candidate && '' !== (string) $candidate->get_sku() ) {
				$product = $candidate;
				$how     = 'pelo ID';
			}
		}

		if ( ! $product || 'trash' === $product->get_status() ) {
			return array(
				'response' => self::error( 'mfl_pw_uniplus_nao_existe', 'Produto não está no site; nada foi criado.', 404 ),
				'sku'      => $sku,
				'id'       => (int) $url_id,
				'action'   => 'ignorado (não está no site)',
				'detail'   => $url_id ? 'ID enviado: ' . $url_id : 'criação recusada',
			);
		}

		$changes = array();

		// Estoque: liga o controle e grava a quantidade (≤ 0 → fora de estoque → some do site).
		if ( isset( $data['stock_quantity'] ) && '' !== $data['stock_quantity'] && null !== $data['stock_quantity'] ) {
			$qty = (int) round( (float) $data['stock_quantity'] );
			if ( ! $product->get_manage_stock() ) {
				$product->set_manage_stock( true );
				$changes[] = 'controle de estoque ligado';
			}
			if ( (int) $product->get_stock_quantity() !== $qty ) {
				$changes[] = 'estoque ' . ( null === $product->get_stock_quantity() ? '—' : (int) $product->get_stock_quantity() ) . ' → ' . $qty;
			}
			$product->set_stock_quantity( $qty );
		} elseif ( isset( $data['stock_status'] ) && in_array( $data['stock_status'], array( 'instock', 'outofstock' ), true ) && ! $product->get_manage_stock() ) {
			if ( $product->get_stock_status() !== $data['stock_status'] ) {
				$changes[] = 'situação ' . $product->get_stock_status() . ' → ' . $data['stock_status'];
			}
			$product->set_stock_status( $data['stock_status'] );
		}

		// Preço normal (o promocional do site é mantido).
		if ( self::APLICAR_PRECO && isset( $data['regular_price'] ) && '' !== (string) $data['regular_price'] ) {
			$price = wc_format_decimal( $data['regular_price'] );
			if ( (float) $price > 0 && abs( (float) $product->get_regular_price() - (float) $price ) >= 0.005 ) {
				$changes[] = 'preço ' . $product->get_regular_price() . ' → ' . $price;
				$product->set_regular_price( $price );
			}
		}

		if ( $changes ) {
			$product->save();
		}

		$ignored = array_diff( array_keys( $data ), array( 'id', 'sku', 'stock_quantity', 'stock_status', 'manage_stock', 'regular_price' ) );

		return array(
			'response' => self::product_data( $product->get_id() ),
			'sku'      => $sku ? $sku : (string) $product->get_sku(),
			'id'       => $product->get_id(),
			'action'   => 'atualizado ' . $how,
			'detail'   => ( $changes ? implode( '; ', $changes ) : 'sem mudança' )
				. ( $ignored ? ' | ignorado: ' . implode( ', ', array_slice( $ignored, 0, 8 ) ) : '' ),
		);
	}

	/**
	 * Resposta no formato da API do Woo (para o Uniplus guardar o ID certo).
	 */
	private static function product_data( $id ) {
		$response = rest_do_request( new WP_REST_Request( 'GET', '/wc/v3/products/' . (int) $id ) );
		if ( ! $response->is_error() ) {
			return rest_get_server()->response_to_data( $response, false );
		}
		$product = wc_get_product( $id );
		return array(
			'id'             => $product->get_id(),
			'sku'            => $product->get_sku(),
			'stock_quantity' => $product->get_stock_quantity(),
			'stock_status'   => $product->get_stock_status(),
			'regular_price'  => $product->get_regular_price(),
		);
	}

	private static function error( $code, $message, $status ) {
		return new WP_Error( $code, $message, array( 'status' => $status ) );
	}

	private static function batch_error( WP_Error $error, $id ) {
		return array(
			'id'    => $id,
			'error' => array(
				'code'    => $error->get_error_code(),
				'message' => $error->get_error_message(),
				'data'    => $error->get_error_data(),
			),
		);
	}

	/* ------------------------------------------------------------------ */
	/* Registro (log)                                                      */
	/* ------------------------------------------------------------------ */

	/**
	 * Guarda em memória e grava uma vez só no fim da requisição (o Uniplus manda
	 * milhares de itens por passada). Produtos que não estão no site só contam.
	 */
	private static function log( $method, $route, $sku, $id, $action, $detail ) {
		if ( 0 === strpos( $action, 'ignorado' ) ) {
			self::$ignored++;
		} elseif ( 0 === strpos( $detail, 'sem mudança' ) ) {
			self::$unchanged++;
		} else {
			self::$buffer[] = array(
				't'      => time(),
				'method' => $method,
				'route'  => substr( (string) $route, 0, 80 ),
				'sku'    => substr( (string) $sku, 0, 40 ),
				'id'     => (int) $id,
				'action' => substr( (string) $action, 0, 60 ),
				'detail' => substr( (string) $detail, 0, 300 ),
			);
		}
		if ( ! self::$flush_hooked ) {
			self::$flush_hooked = true;
			add_action( 'shutdown', array( __CLASS__, 'flush_log' ) );
		}
	}

	public static function flush_log() {
		if ( self::$buffer ) {
			$log = get_option( self::OPTION_LOG, array() );
			$log = array_merge( is_array( $log ) ? $log : array(), self::$buffer );
			if ( count( $log ) > self::MAX_LOG ) {
				$log = array_slice( $log, -self::MAX_LOG );
			}
			update_option( self::OPTION_LOG, $log, false );
		}

		$stats = get_option( self::OPTION_STATS, array() );
		$stats = is_array( $stats ) ? $stats : array();
		$stats['ultima_chamada'] = time();
		$stats['ignorados']      = (int) ( $stats['ignorados'] ?? 0 ) + self::$ignored;
		$stats['sem_mudanca']    = (int) ( $stats['sem_mudanca'] ?? 0 ) + self::$unchanged;
		if ( self::$ignored ) {
			$stats['ultimo_ignorado'] = time();
		}
		update_option( self::OPTION_STATS, $stats, false );
	}

	public static function admin_menu() {
		add_submenu_page( 'woocommerce', 'Uniplus', 'Uniplus', 'manage_woocommerce', 'mfl-pw-uniplus', array( __CLASS__, 'admin_page' ) );
	}

	public static function admin_page() {
		$log = get_option( self::OPTION_LOG, array() );
		$log = is_array( $log ) ? array_reverse( $log ) : array();
		?>
		<div class="wrap">
			<h1>Integração Uniplus</h1>
			<p>O que o Uniplus enviou ao site (últimas <?php echo (int) self::MAX_LOG; ?> chamadas, mais recentes primeiro).
				Só estoque e preço de produtos que já existem no site (casados pelo SKU) são aplicados; o resto é ignorado.</p>
			<?php $stats = get_option( self::OPTION_STATS, array() ); ?>
			<?php if ( ! empty( $stats['ultima_chamada'] ) ) : ?>
				<p><strong>Última escrita do Uniplus:</strong> <?php echo esc_html( wp_date( 'd/m/Y H:i:s', $stats['ultima_chamada'] ) ); ?>
					&nbsp;·&nbsp; <strong>Conferidos sem mudança:</strong> <?php echo (int) ( $stats['sem_mudanca'] ?? 0 ); ?>
					&nbsp;·&nbsp; <strong>Ignorados (não estão no site):</strong> <?php echo (int) ( $stats['ignorados'] ?? 0 ); ?></p>
			<?php endif; ?>
			<?php if ( ! $log ) : ?>
				<p><em>Nenhuma atualização do Uniplus registrada ainda.</em></p>
			<?php else : ?>
				<table class="widefat striped">
					<thead><tr><th>Quando</th><th>Chamada</th><th>SKU</th><th>Produto</th><th>Resultado</th><th>Detalhe</th></tr></thead>
					<tbody>
					<?php foreach ( $log as $row ) : ?>
						<tr>
							<td><?php echo esc_html( wp_date( 'd/m/Y H:i:s', $row['t'] ) ); ?></td>
							<td><code><?php echo esc_html( $row['method'] . ' ' . $row['route'] ); ?></code></td>
							<td><?php echo esc_html( $row['sku'] ); ?></td>
							<td>
								<?php if ( $row['id'] && wc_get_product( $row['id'] ) ) : ?>
									<a href="<?php echo esc_url( get_edit_post_link( $row['id'] ) ); ?>">#<?php echo (int) $row['id']; ?></a>
								<?php elseif ( $row['id'] ) : ?>
									#<?php echo (int) $row['id']; ?>
								<?php endif; ?>
							</td>
							<td><?php echo esc_html( $row['action'] ); ?></td>
							<td><?php echo esc_html( $row['detail'] ); ?></td>
						</tr>
					<?php endforeach; ?>
					</tbody>
				</table>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="margin-top:16px">
					<input type="hidden" name="action" value="mfl_pw_uniplus_limpar">
					<?php wp_nonce_field( 'mfl_pw_uniplus_limpar' ); ?>
					<?php submit_button( 'Limpar registro', 'secondary', 'submit', false ); ?>
				</form>
			<?php endif; ?>
		</div>
		<?php
	}

	public static function clear_log() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( 'Sem permissão.' );
		}
		check_admin_referer( 'mfl_pw_uniplus_limpar' );
		delete_option( self::OPTION_LOG );
		delete_option( self::OPTION_STATS );
		wp_safe_redirect( admin_url( 'admin.php?page=mfl-pw-uniplus' ) );
		exit;
	}
}
