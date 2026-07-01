/**
 * Automação: Troca de Encarte - Rio'Atacadão WordPress + Elementor
 *
 * Como usar:
 *   node trocar-encarte.js <imagem-pagina1> <imagem-pagina2>
 *
 * Exemplo:
 *   node trocar-encarte.js encarte-jul-p1.jpg encarte-jul-p2.jpg
 *
 * Requisitos (primeira vez):
 *   npm install
 *   npx playwright install chromium
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const WP_ADMIN     = 'https://rioatacadao.com.br/wp-admin';
const WP_USER      = 'wallace-rox@hotmail.com';
const WP_PASS      = 'Ux2pix9zuni!';
const TEMP_LOGIN   = 'https://rioatacadao.com.br/wp-admin/?wtlwp_token=f9f0b83f99928cc1d802022c0bd8591898b5ed891812885d4c25f085c3463816160e613a6fa17b138ce40438f5db2583d9ebaca73387598cc367f137a8996c02';
const ENCARTE_SLUG = 'encarte';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('');
    console.error('Uso:   node trocar-encarte.js <imagem-pagina1> <imagem-pagina2>');
    console.error('Exemplo: node trocar-encarte.js encarte-jul-p1.jpg encarte-jul-p2.jpg');
    console.error('');
    process.exit(1);
  }

  const imagens = args.map(a => path.resolve(a));
  for (const img of imagens) {
    if (!fs.existsSync(img)) {
      console.error(`❌ Arquivo não encontrado: ${img}`);
      process.exit(1);
    }
    console.log(`✅ Imagem encontrada: ${img}`);
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const context = await browser.newContext({ acceptDownloads: true });
  const page    = await context.newPage();
  page.setDefaultTimeout(60000);

  try {
    // ── 1. Login via Temporary Login ──────────────────────────────────────
    console.log('\n🔐 Fazendo login via link temporário...');
    await page.goto(TEMP_LOGIN, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForURL('**/wp-admin/**', { timeout: 30000 });
    console.log('✅ Login OK');

    // ── 2. Navega para a página do Encarte e abre o Elementor ─────────────
    console.log('\n🔍 Abrindo página do Encarte...');
    await page.goto('https://rioatacadao.com.br/encarte/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.screenshot({ path: 'debug-encarte.png' });
    console.log('📸 Screenshot salvo: debug-encarte.png');

    // Tenta achar o botão Editar com Elementor na admin bar
    const editLink = page.locator('#wp-admin-bar-elementor_edit_page a').first();
    let editUrl = null;
    if (await editLink.count() > 0) {
      editUrl = await editLink.getAttribute('href');
    } else {
      // Tenta via wp-admin pages list
      console.log('   Buscando via admin...');
      await page.goto(`${WP_ADMIN}/edit.php?post_type=page`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: 'debug-pages.png' });
      console.log('📸 Screenshot salvo: debug-pages.png');
      const link = page.locator('a:has-text("Editar com Elementor"), a:has-text("Edit with Elementor")').first();
      await link.waitFor({ timeout: 15000 });
      editUrl = await link.getAttribute('href');
    }
    console.log('✅ Elementor encontrado:', editUrl);

    // ── 3. Abre o Elementor ────────────────────────────────────────────────
    console.log('\n🎨 Abrindo Elementor...');
    await page.goto(editUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#elementor-editor-wrapper, .elementor-panel', { timeout: 60000 });
    console.log('✅ Elementor carregado');
    await page.waitForTimeout(4000);

    // ── 4. Encontra widgets de imagem no canvas ────────────────────────────
    console.log('\n🖼️  Localizando imagens do encarte...');
    const elementorFrame = page.frameLocator('#elementor-preview-iframe');

    await page.screenshot({ path: 'debug-elementor.png' });
    console.log('📸 Screenshot salvo: debug-elementor.png');

    // Conta imagens no iframe
    const imageWidgets = elementorFrame.locator('.elementor-widget-image');
    const count = await imageWidgets.count();
    console.log(`   Encontrados ${count} widget(s) de imagem`);

    if (count === 0) {
      console.error('❌ Nenhum widget de imagem encontrado.');
      await browser.close();
      return;
    }

    // ── 5. Substitui cada imagem ───────────────────────────────────────────
    const total = Math.min(count, imagens.length);

    for (let i = 0; i < total; i++) {
      console.log(`\n🔄 Substituindo imagem ${i + 1} de ${total}...`);

      // Clica na imagem dentro do widget no iframe
      const imgEl = imageWidgets.nth(i).locator('img').first();
      await imgEl.scrollIntoViewIfNeeded();
      await imgEl.click({ force: true });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `debug-widget-${i+1}.png` });
      console.log(`📸 Screenshot salvo: debug-widget-${i+1}.png`);

      // Verifica se o painel mudou para mostrar configurações do widget
      const panelTitle = await page.locator('.elementor-panel-heading-title').textContent().catch(() => '');
      console.log(`   Painel ativo: "${panelTitle}"`);

      // Tenta achar o controle de imagem no painel esquerdo
      const mediaPreview = page.locator('.elementor-control-media__preview, .elementor-control-media-upload-button, .elementor-control-media img').first();

      if (await mediaPreview.count() === 0) {
        // Se não achou, tenta clicar diretamente no widget (sem force)
        await imageWidgets.nth(i).click();
        await page.waitForTimeout(2000);
      }

      await mediaPreview.waitFor({ timeout: 10000 });
      await mediaPreview.click();
      await page.waitForTimeout(1500);

      // Modal da biblioteca de mídia
      await page.waitForSelector('.media-modal', { timeout: 15000 });
      console.log('   📂 Biblioteca de mídia aberta');

      // Clica na aba de upload (primeira opção do menu)
      const uploadTab = page.locator('.media-router .media-menu-item').first();
      if (await uploadTab.count() > 0) await uploadTab.click();
      await page.waitForTimeout(800);

      // Faz upload do arquivo
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.locator('.browser, .upload-files-button').first().click(),
      ]);
      await fileChooser.setFiles(imagens[i]);
      console.log(`   ⬆️  Enviando: ${path.basename(imagens[i])}`);

      // Aguarda o upload concluir
      await page.waitForSelector('.attachment.selected', { timeout: 30000 });
      await page.waitForTimeout(1500);

      // Clica em "Inserir mídia"
      await page.locator('button.media-button-select').click();
      await page.waitForTimeout(2000);
      console.log(`   ✅ Imagem ${i + 1} substituída`);
    }

    // ── 6. Publica as alterações ───────────────────────────────────────────
    console.log('\n💾 Salvando e publicando...');
    const publishBtn = page.locator(
      '#elementor-panel-footer-saver-publish, button:has-text("Publicar"), button:has-text("Publish"), button:has-text("Atualizar"), button:has-text("Update")'
    ).first();
    await publishBtn.waitFor({ timeout: 10000 });
    await publishBtn.click();

    // Aguarda confirmação de salvo
    await page.waitForSelector(
      '.elementor-panel-footer-sub-title:has-text("Publicado"), .elementor-panel-footer-sub-title:has-text("Published")',
      { timeout: 15000 }
    ).catch(() => console.log('   (aguardando confirmação de publicação...)'));

    await page.waitForTimeout(2000);
    console.log('✅ Publicado com sucesso!');
    console.log('\n🎉 Encarte atualizado! Acesse o site para conferir.');

  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    await page.screenshot({ path: 'debug-erro.png' });
    console.log('📸 Screenshot do erro salvo: debug-erro.png');
  } finally {
    await browser.close();
  }
}

main();
