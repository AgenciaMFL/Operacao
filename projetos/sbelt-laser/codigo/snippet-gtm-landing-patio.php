<?php
/*
 * GTM da Pátio Alcântara (GTM-56846GTT) só na landing page da unidade.
 * Vai como um snippet PHP separado no Code Snippets ("Only run on site front-end"),
 * sem o "<?php" da primeira linha.
 * Trocar 'patio-alcantara' pelo slug (ou pelo ID numérico) real da página.
 * As páginas /sucesso/ e /obrigado/ NÃO usam este snippet: os dois GTM já estão
 * dentro dos blocos HTML delas (ver sucesso.html e obrigado.html).
 * Status: entregue em 09/10/2026 - confirmar se foi instalado.
 */
add_action('wp_head', function () {
    if (!is_page('patio-alcantara')) return;
    ?>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-56846GTT');</script>
<!-- End Google Tag Manager -->
    <?php
}, 1);

add_action('wp_body_open', function () {
    if (!is_page('patio-alcantara')) return;
    ?>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-56846GTT"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
    <?php
}, 1);
