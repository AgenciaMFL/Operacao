<?php
/**
 * Plugin Name: Encarte Automático
 * Description: Troca as imagens do encarte semanal em páginas Elementor via REST API. Marque os widgets com a classe CSS "encarte-1", "encarte-2"... (Avançado > Classes CSS).
 * Version: 1.0.0
 * Author: Agência MFL
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Encarte_Automatico {

	const REST_NAMESPACE = 'encarte/v1';
	const SLOT_PREFIX    = 'encarte';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	public static function register_routes() {
		$page_arg = array(
			'page_id' => array(
				'required'          => true,
				'type'              => 'integer',
				'sanitize_callback' => 'absint',
			),
		);

		// Lista os slots encontrados na página (na ordem em que aparecem).
		register_rest_route(
			self::REST_NAMESPACE,
			'/slots',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'route_slots' ),
				'permission_callback' => array( __CLASS__, 'can_edit_page' ),
				'args'                => $page_arg,
			)
		);

		// Troca as imagens: { "page_id": 123, "slots": { "encarte-1": 456, "encarte-galeria": [457, 458] }, "dry_run": false }
		register_rest_route(
			self::REST_NAMESPACE,
			'/trocar',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'route_trocar' ),
				'permission_callback' => array( __CLASS__, 'can_edit_page' ),
				'args'                => $page_arg + array(
					'slots'   => array(
						'required' => true,
						'type'     => 'object',
					),
					'dry_run' => array(
						'type'    => 'boolean',
						'default' => false,
					),
				),
			)
		);
	}

	public static function can_edit_page( WP_REST_Request $request ) {
		return current_user_can( 'edit_post', (int) $request['page_id'] );
	}

	public static function route_slots( WP_REST_Request $request ) {
		$elements = self::load_elements( (int) $request['page_id'] );
		if ( is_wp_error( $elements ) ) {
			return $elements;
		}

		$found = array();
		self::walk(
			$elements,
			function ( array &$element ) use ( &$found ) {
				foreach ( self::slot_classes( $element ) as $slot ) {
					$found[] = array(
						'slot'     => $slot,
						'type'     => self::element_type( $element ),
						'multiple' => self::accepts_multiple( $element ),
						'atual'    => self::current_urls( $element ),
					);
				}
			}
		);

		return array( 'page_id' => (int) $request['page_id'], 'slots' => $found );
	}

	public static function route_trocar( WP_REST_Request $request ) {
		$page_id  = (int) $request['page_id'];
		$dry_run  = (bool) $request['dry_run'];
		$elements = self::load_elements( $page_id );
		if ( is_wp_error( $elements ) ) {
			return $elements;
		}

		$slots = array();
		foreach ( (array) $request['slots'] as $slot => $ids ) {
			$images = array();
			foreach ( (array) $ids as $id ) {
				$url = wp_get_attachment_url( (int) $id );
				if ( ! $url ) {
					return new WP_Error( 'encarte_midia_invalida', sprintf( 'Mídia %d não encontrada (slot "%s").', $id, $slot ), array( 'status' => 400 ) );
				}
				$images[] = array( 'id' => (int) $id, 'url' => $url );
			}
			$slots[ sanitize_html_class( $slot ) ] = $images;
		}

		$report = array();
		self::walk(
			$elements,
			function ( array &$element ) use ( $slots, &$report ) {
				foreach ( self::slot_classes( $element ) as $slot ) {
					if ( empty( $slots[ $slot ] ) ) {
						continue;
					}
					$before = self::current_urls( $element );
					self::apply_images( $element, $slots[ $slot ] );
					$report[] = array(
						'slot'   => $slot,
						'type'   => self::element_type( $element ),
						'antes'  => $before,
						'depois' => self::current_urls( $element ),
					);
				}
			}
		);

		$missing = array_values( array_diff( array_keys( $slots ), wp_list_pluck( $report, 'slot' ) ) );
		if ( $missing ) {
			return new WP_Error( 'encarte_slot_inexistente', 'Slots não encontrados na página: ' . implode( ', ', $missing ), array( 'status' => 400 ) );
		}

		if ( ! $dry_run ) {
			$document = \Elementor\Plugin::$instance->documents->get( $page_id, false );
			$document->save( array( 'elements' => $elements ) );
			\Elementor\Plugin::$instance->files_manager->clear_cache();
			do_action( 'encarte_automatico/trocado', $page_id, $report );
		}

		return array(
			'page_id' => $page_id,
			'dry_run' => $dry_run,
			'url'     => get_permalink( $page_id ),
			'trocas'  => $report,
		);
	}

	/**
	 * @return array|WP_Error
	 */
	private static function load_elements( $page_id ) {
		if ( ! did_action( 'elementor/loaded' ) ) {
			return new WP_Error( 'encarte_sem_elementor', 'Elementor não está ativo.', array( 'status' => 500 ) );
		}
		$document = \Elementor\Plugin::$instance->documents->get( $page_id, false );
		if ( ! $document || ! $document->is_built_with_elementor() ) {
			return new WP_Error( 'encarte_pagina_invalida', 'Página não encontrada ou não editada com Elementor.', array( 'status' => 404 ) );
		}
		$elements = $document->get_elements_data();
		return is_array( $elements ) ? $elements : array();
	}

	private static function walk( array &$elements, callable $callback ) {
		foreach ( $elements as &$element ) {
			$callback( $element );
			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				self::walk( $element['elements'], $callback );
			}
		}
	}

	private static function slot_classes( array $element ) {
		$settings = isset( $element['settings'] ) ? $element['settings'] : array();
		$raw      = trim( ( isset( $settings['_css_classes'] ) ? $settings['_css_classes'] : '' ) . ' ' . ( isset( $settings['css_classes'] ) ? $settings['css_classes'] : '' ) );
		$classes  = preg_split( '/\s+/', $raw, -1, PREG_SPLIT_NO_EMPTY );
		return array_values(
			array_filter(
				array_unique( $classes ),
				function ( $class ) {
					return 0 === strpos( $class, self::SLOT_PREFIX );
				}
			)
		);
	}

	private static function element_type( array $element ) {
		return isset( $element['widgetType'] ) ? $element['widgetType'] : $element['elType'];
	}

	/** Widgets de galeria/carrossel aceitam várias imagens no mesmo slot. */
	private static function gallery_key( array $element ) {
		$map = array(
			'image-gallery'  => 'gallery',
			'gallery'        => 'gallery',
			'image-carousel' => 'carousel',
		);
		$type = self::element_type( $element );
		return isset( $map[ $type ] ) ? $map[ $type ] : null;
	}

	private static function accepts_multiple( array $element ) {
		return null !== self::gallery_key( $element );
	}

	private static function current_urls( array $element ) {
		$settings = isset( $element['settings'] ) ? $element['settings'] : array();
		$key      = self::gallery_key( $element );
		if ( $key ) {
			return isset( $settings[ $key ] ) ? wp_list_pluck( (array) $settings[ $key ], 'url' ) : array();
		}
		foreach ( array( 'image', 'background_image' ) as $field ) {
			if ( ! empty( $settings[ $field ]['url'] ) ) {
				return array( $settings[ $field ]['url'] );
			}
		}
		return array();
	}

	private static function apply_images( array &$element, array $images ) {
		if ( ! isset( $element['settings'] ) || ! is_array( $element['settings'] ) ) {
			$element['settings'] = array();
		}
		$settings =& $element['settings'];

		$key = self::gallery_key( $element );
		if ( $key ) {
			$settings[ $key ] = $images;
			return;
		}

		$image = $images[0];
		$field = 'widget' === $element['elType'] ? 'image' : 'background_image';
		if ( 'widget' === $element['elType'] && empty( $settings['image'] ) && ! empty( $settings['background_image'] ) ) {
			$field = 'background_image';
		}

		$old_url            = isset( $settings[ $field ]['url'] ) ? $settings[ $field ]['url'] : '';
		$current            = isset( $settings[ $field ] ) && is_array( $settings[ $field ] ) ? $settings[ $field ] : array();
		$settings[ $field ] = array_merge( $current, array( 'id' => $image['id'], 'url' => $image['url'], 'source' => 'library' ) );
		unset( $settings[ $field ]['alt'] );

		// Se o link do widget aponta para a imagem antiga (ex.: abrir encarte em tela cheia), atualiza também.
		if ( $old_url && ! empty( $settings['link']['url'] ) && $settings['link']['url'] === $old_url ) {
			$settings['link']['url'] = $image['url'];
		}
	}
}

Encarte_Automatico::init();
