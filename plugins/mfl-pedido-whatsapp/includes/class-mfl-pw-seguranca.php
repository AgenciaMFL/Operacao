<?php
/**
 * Segurança e leveza do site, sem plugin extra.
 *
 * Segurança: desliga o XML-RPC, esconde a versão do WordPress, impede a
 * descoberta de usuários (?author=N e /wp-json/wp/v2/users sem login),
 * limita tentativas de login, deixa a mensagem de erro do login genérica,
 * bloqueia o editor de arquivos do painel e envia cabeçalhos de segurança.
 *
 * Leveza: remove os scripts de emoji e de incorporação (oEmbed) e limita
 * as revisões guardadas por página/produto.
 */

defined( 'ABSPATH' ) || exit;

class MFL_PW_Seguranca {

	const MAX_TENTATIVAS = 6;
	const BLOQUEIO       = 15 * MINUTE_IN_SECONDS;
	const REVISOES       = 5;

	public static function init() {
		// Editor de temas/plugins do painel desligado (o site é editado pelo Elementor).
		if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
			define( 'DISALLOW_FILE_EDIT', true );
		}

		// XML-RPC (alvo comum de ataque de senha; o site não usa).
		add_filter( 'xmlrpc_enabled', '__return_false' );
		add_filter( 'xmlrpc_methods', '__return_empty_array' );
		add_filter( 'wp_headers', array( __CLASS__, 'remove_pingback_header' ) );

		// Versão do WordPress fora do HTML e dos feeds.
		remove_action( 'wp_head', 'wp_generator' );
		add_filter( 'the_generator', '__return_empty_string' );

		// Descoberta de usuários.
		add_action( 'template_redirect', array( __CLASS__, 'block_author_archive' ) );
		add_filter( 'rest_request_before_callbacks', array( __CLASS__, 'block_rest_users' ), 10, 3 );
		add_filter( 'oembed_response_data', array( __CLASS__, 'oembed_without_author' ) );

		// Login.
		add_filter( 'authenticate', array( __CLASS__, 'check_login' ), 99, 1 );
		add_action( 'wp_login_failed', array( __CLASS__, 'register_failure' ) );
		add_action( 'wp_login', array( __CLASS__, 'clear_failures' ) );

		// Cabeçalhos de segurança no site.
		add_action( 'send_headers', array( __CLASS__, 'security_headers' ) );

		// Leveza.
		add_action( 'init', array( __CLASS__, 'disable_emojis_and_embeds' ) );
		add_filter( 'wp_revisions_to_keep', array( __CLASS__, 'revisions_to_keep' ) );
	}

	public static function remove_pingback_header( $headers ) {
		unset( $headers['X-Pingback'] );
		return $headers;
	}

	public static function block_author_archive() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- só leitura.
		if ( is_author() || ( isset( $_GET['author'] ) && ! is_admin() ) ) {
			wp_safe_redirect( home_url( '/' ), 301 );
			exit;
		}
	}

	/**
	 * /wp/v2/users só para quem pode listar usuários (os MCPs entram logados e continuam funcionando).
	 */
	public static function block_rest_users( $response, $handler, $request ) {
		if ( 0 === strpos( $request->get_route(), '/wp/v2/users' ) && ! current_user_can( 'list_users' ) ) {
			return new WP_Error( 'rest_forbidden', 'Sem permissão.', array( 'status' => rest_authorization_required_code() ) );
		}
		return $response;
	}

	public static function oembed_without_author( $data ) {
		unset( $data['author_name'], $data['author_url'] );
		return $data;
	}

	private static function ip() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : 'desconhecido';
	}

	private static function key() {
		return 'mfl_pw_login_' . md5( self::ip() );
	}

	/**
	 * Depois de MAX_TENTATIVAS erros seguidos do mesmo IP, bloqueia o login por BLOQUEIO
	 * (mesmo com a senha certa). E não revela se o erro foi no usuário ou na senha.
	 */
	public static function check_login( $user ) {
		if ( (int) get_transient( self::key() ) >= self::MAX_TENTATIVAS ) {
			return new WP_Error( 'mfl_pw_bloqueado', 'Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente.' );
		}
		if ( is_wp_error( $user ) && array_intersect( $user->get_error_codes(), array( 'invalid_username', 'invalid_email', 'incorrect_password' ) ) ) {
			return new WP_Error( 'incorrect_password', '<strong>Erro:</strong> usuário ou senha incorretos.' );
		}
		return $user;
	}

	public static function register_failure() {
		$falhas = (int) get_transient( self::key() );
		set_transient( self::key(), $falhas + 1, self::BLOQUEIO );
	}

	public static function clear_failures() {
		delete_transient( self::key() );
	}

	public static function security_headers() {
		if ( is_admin() || headers_sent() ) {
			return;
		}
		header( 'X-Content-Type-Options: nosniff' );
		header( 'X-Frame-Options: SAMEORIGIN' );
		header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		header( 'Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()' );
	}

	public static function disable_emojis_and_embeds() {
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		remove_action( 'admin_print_styles', 'print_emoji_styles' );
		remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
		remove_action( 'admin_enqueue_scripts', 'wp_enqueue_emoji_styles' );
		remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
		remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
		remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
		add_filter( 'emoji_svg_url', '__return_false' );

		remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
		remove_action( 'wp_head', 'wp_oembed_add_host_js' );
		remove_action( 'wp_head', 'rsd_link' );
		remove_action( 'wp_head', 'wlwmanifest_link' );
		remove_action( 'wp_head', 'wp_shortlink_wp_head' );
	}

	public static function revisions_to_keep( $num ) {
		return ( $num < 0 || $num > self::REVISOES ) ? self::REVISOES : $num;
	}
}
