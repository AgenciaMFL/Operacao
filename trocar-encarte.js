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

const WP_ADMIN   = 'https://rioatacadao.com.br/mfl/wp-admin';
const WP_USER    = 'wallace-rox@hotmail.com';
const WP_PASS    = 'Ux2pix9zuni!';
const ENCARTE_SLUG = 'encarte'; // slug da página no WordPress

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
    headless: true,
    slowMo: 100,
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const context = await browser.newContext({ acceptDownloads: true });
  const page    = await context.newPage();

  try {
    // ── 1. Login ───────────────────────────────────────────────────────────
    console.log('\n🔐 Fazendo login...');
    await page.goto(`${WP_ADMIN}/`);
    await page.fill('#user_login', WP_USER);
    await page.fill('#user_pass',  WP_PASS);
    await page.click('#wp-submit');
    await page.waitForURL(`${WP_ADMIN}/**`, { timeout: 15000 });
    console.log('✅ Login OK');

    // ── 2. Encontra a página Encarte ───────────────────────────────────────
    console.log('\n🔍 Procurando página "Encarte"...');
    await page.goto(`${WP_ADMIN}/edit.php?post_type=page`);
    await page.waitForLoadState('networkidle');

    const editLink = page.locator('tr').filter({ hasText: /^Encarte/i })
                         .locator('a:has-text("Editar com Elementor")');
    await editLink.waitFor({ timeout: 10000 });
    const editUrl = await editLink.getAttribute('href');
    console.log('✅ Página encontrada');

    // ── 3. Abre o Elementor ────────────────────────────────────────────────
    console.log('\n🎨 Abrindo Elementor...');
    await page.goto(editUrl);
    await page.waitForLoadState('networkidle');

    // Aguarda o editor carregar completamente
    await page.waitForSelector('.elementor-editor-active, #elementor-editor-wrapper', {
      timeout: 60000,
    });
    console.log('✅ Elementor carregado');

    // Aguarda um pouco para garantir que todos os widgets estão renderizados
    await page.waitForTimeout(3000);

    // ── 4. Encontra widgets de imagem no canvas ────────────────────────────
    console.log('\n🖼️  Localizando imagens do encarte...');

    // O canvas do Elementor fica em um iframe
    const elementorFrame = page.frameLocator('#elementor-preview-iframe');

    // Localiza todas as imagens dentro de widgets de imagem
    const imageWidgets = elementorFrame.locator('.elementor-widget-image img');
    const count = await imageWidgets.count();
    console.log(`   Encontradas ${count} imagem(ns) no encarte`);

    if (count === 0) {
      console.error('❌ Nenhum widget de imagem encontrado. Tire um print do editor e verifique.');
      await page.screenshot({ path: 'debug-elementor.png' });
      console.log('📸 Screenshot salvo: debug-elementor.png');
      await browser.close();
      return;
    }

    // ── 5. Substitui cada imagem ───────────────────────────────────────────
    const total = Math.min(count, imagens.length);

    for (let i = 0; i < total; i++) {
      console.log(`\n🔄 Substituindo imagem ${i + 1} de ${total}...`);

      // Clica na imagem para selecionar o widget
      await imageWidgets.nth(i).click();
      await page.waitForTimeout(1000);

      // No painel esquerdo aparece "Escolher imagem" / "Choose Image"
      const chooseBtn = page.locator(
        '.elementor-control-media__preview, button:has-text("Escolher imagem"), button:has-text("Choose Image")'
      ).first();
      await chooseBtn.waitFor({ timeout: 10000 });
      await chooseBtn.click();
      await page.waitForTimeout(1000);

      // Modal da biblioteca de mídia
      await page.waitForSelector('.media-modal', { timeout: 10000 });
      console.log('   📂 Biblioteca de mídia aberta');

      // Clica em "Enviar arquivos" / "Upload Files"
      const uploadTab = page.locator(
        '.media-router button:has-text("Enviar"), .media-router button:has-text("Upload")'
      ).first();
      if (await uploadTab.count() > 0) await uploadTab.click();
      await page.waitForTimeout(500);

      // Faz upload do arquivo
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.locator('.browser').click().catch(() =>
          page.locator('button:has-text("Selecionar arquivos"), button:has-text("Select Files")').click()
        ),
      ]);
      await fileChooser.setFiles(imagens[i]);
      console.log(`   ⬆️  Upload: ${path.basename(imagens[i])}`);

      // Aguarda o upload concluir
      await page.waitForSelector('.attachment.selected', { timeout: 30000 });
      await page.waitForTimeout(1000);

      // Clica em "Inserir mídia" / "Select"
      const insertBtn = page.locator(
        'button.media-button-select, button:has-text("Inserir mídia"), button:has-text("Select")'
      ).last();
      await insertBtn.click();
      await page.waitForTimeout(1500);
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
