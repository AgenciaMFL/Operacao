( function () {
	var settings = window.wc.wcSettings.getSetting( 'mfl_whatsapp_data', {} );
	var el = window.wp.element.createElement;
	var decode = window.wp.htmlEntities.decodeEntities;

	var title = decode( settings.title || 'Combinar pelo WhatsApp' );

	var Content = function () {
		return el( 'div', null, decode( settings.description || '' ) );
	};

	window.wc.wcBlocksRegistry.registerPaymentMethod( {
		name: 'mfl_whatsapp',
		label: el( 'span', null, title ),
		ariaLabel: title,
		placeOrderButtonLabel: decode( settings.button_text || 'Enviar pedido pelo WhatsApp' ),
		content: el( Content ),
		edit: el( Content ),
		canMakePayment: function () {
			return true;
		},
		supports: { features: settings.supports || [ 'products' ] },
	} );
} )();
