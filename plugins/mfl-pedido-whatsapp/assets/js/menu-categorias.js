/* Menu de categorias: abre/fecha a sanfona; abrir uma fecha as outras do mesmo menu. */
( function () {
	document.addEventListener( 'click', function ( e ) {
		var botao = e.target.closest( '.mfl-cats__toggle' );
		if ( ! botao ) {
			return;
		}
		var abrir = botao.getAttribute( 'aria-expanded' ) !== 'true';
		var menu = botao.closest( '.mfl-cats' );
		if ( abrir && menu ) {
			menu.querySelectorAll( '.mfl-cats__toggle[aria-expanded="true"]' ).forEach( function ( outro ) {
				outro.setAttribute( 'aria-expanded', 'false' );
			} );
		}
		botao.setAttribute( 'aria-expanded', abrir ? 'true' : 'false' );
	} );
} )();
