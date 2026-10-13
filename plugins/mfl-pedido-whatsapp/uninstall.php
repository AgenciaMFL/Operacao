<?php
/**
 * Remove os dados do plugin ao excluí-lo pelo painel.
 * Pedidos e o status deles continuam no WooCommerce.
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'mfl_pw_buscas_sem_resultado' );
delete_option( 'woocommerce_mfl_whatsapp_settings' );
