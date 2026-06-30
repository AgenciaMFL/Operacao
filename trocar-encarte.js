/**
 * Automação: Troca de Encarte - Rio'Atacadão WordPress
 *
 * Como usar:
 *   node trocar-encarte.js imagem1.jpg imagem2.jpg
 *
 * Requisitos:
 *   npm install playwright
 *   npx playwright install chromium
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const WP_URL = 'https://rioatacadao.com.br/mfl/wp-admin';
const WP_USER = 'wallace-rox@hotmail.com';
const WP_PASS = 'Ux2pix9zuni!';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Uso: node trocar-encarte.js <imagem-pagina1> <imagem-pagina2>');
    console.error('Exemplo: node trocar-encarte.js encarte-jul-p1.jpg encarte-jul-p2.jpg');
    process.exit(1);
  }

  const [img1, img2] = args.map(a => path.resolve(a));

  for (const img of [img1, img2]) {
    if (!fs.existsSync(img)) {
      console.error(`Arquivo não encontrado: ${img}`);
      process.exit(1);
    }
  }

  console.log('Iniciando automação...');
  const browser = await chromium.launch({ headless: false }); // headless: true para rodar sem janela
  const page = await browser.newPage();

  try {
    // Login
    console.log('Fazendo login...');
    await page.goto(WP_URL);
    await page.fill('#user_login', WP_USER);
    await page.fill('#user_pass', WP_PASS);
    await page.click('#wp-submit');
    await page.waitForURL('**/wp-admin/**');
    console.log('Login OK.');

    // Procura a página/post do encarte
    console.log('Procurando seção de encarte...');
    await page.goto(`${WP_URL.replace('/wp-admin', '')}/wp-admin/edit.php`);
    await page.waitForLoadState('networkidle');

    // Tira screenshot para debug
    await page.screenshot({ path: 'debug-posts.png' });
    console.log('Screenshot salvo: debug-posts.png');

    // Tenta encontrar post/página com "encarte" no título
    const encarteLink = page.locator('a:has-text("encarte"), a:has-text("Encarte")').first();
    const found = await encarteLink.count();

    if (found > 0) {
      await encarteLink.click();
      await page.waitForLoadState('networkidle');
      console.log('Encarte encontrado! URL:', page.url());
      await page.screenshot({ path: 'debug-encarte.png' });
      console.log('Screenshot salvo: debug-encarte.png');
    } else {
      // Tenta em páginas
      await page.goto(`${WP_URL.replace('/wp-admin', '')}/wp-admin/edit.php?post_type=page`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'debug-pages.png' });
      console.log('Nenhum post com "encarte" encontrado. Veja debug-pages.png para encontrar a página correta.');
      console.log('\nPara continuar, edite o script e informe a URL exata da página do encarte.');
    }

  } catch (err) {
    console.error('Erro:', err.message);
    await page.screenshot({ path: 'debug-erro.png' });
  } finally {
    await browser.close();
  }
}

main();
