/**
 * Automação: Troca de Encarte - Rio'Atacadão
 *
 * Como usar:
 *   node trocar-encarte.js <imagem-pagina1> <imagem-pagina2>
 *
 * Exemplo:
 *   node trocar-encarte.js encarte-jul-p1.webp encarte-jul-p2.webp
 *
 * Requisitos (primeira vez):
 *   npm install
 */

const fs   = require('fs');
const path = require('path');

const WP_URL      = 'https://rioatacadao.com.br';
const WP_USER     = 'wallace-rox@hotmail.com';
const WP_PASS     = 'Ux2pix9zuni!';
const PAGE_ID     = 90; // ID da página Encarte

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('\nUso: node trocar-encarte.js <imagem1> <imagem2>\n');
    process.exit(1);
  }

  const imagens = args.map(a => path.resolve(a));
  for (const img of imagens) {
    if (!fs.existsSync(img)) {
      console.error(`❌ Arquivo não encontrado: ${img}`);
      process.exit(1);
    }
    console.log(`✅ ${path.basename(img)}`);
  }

  const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };

  // ── 1. Busca o conteúdo atual da página ────────────────────────────────
  console.log('\n📄 Buscando dados da página Encarte...');
  const pageRes = await fetch(`${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}`, { headers });

  if (!pageRes.ok) {
    // Tenta autenticar via cookie com Playwright como fallback
    console.log('⚠️  API REST com Basic Auth não disponível. Usando método alternativo...');
    await usarPlaywright(imagens);
    return;
  }

  const pageData = await pageRes.json();
  const elementorData = pageData.meta?._elementor_data || '';

  if (!elementorData) {
    console.log('⚠️  Dados do Elementor não encontrados via API. Usando método alternativo...');
    await usarPlaywright(imagens);
    return;
  }

  let elementorJson = JSON.parse(elementorData);

  // ── 2. Faz upload das novas imagens ───────────────────────────────────
  const novosIds = [];
  for (let i = 0; i < imagens.length; i++) {
    console.log(`\n⬆️  Enviando imagem ${i + 1}: ${path.basename(imagens[i])}...`);
    const mediaId = await uploadImagem(imagens[i], auth);
    novosIds.push(mediaId);
    console.log(`   ✅ Upload OK - ID: ${mediaId}`);
  }

  // ── 3. Substitui as imagens no JSON do Elementor ───────────────────────
  console.log('\n🔄 Atualizando dados do Elementor...');
  let substituicoes = 0;
  const imgWidgets = encontrarWidgetsImagem(elementorJson);
  console.log(`   Encontrados ${imgWidgets.length} widget(s) de imagem na página`);

  for (let i = 0; i < Math.min(imgWidgets.length, novosIds.length); i++) {
    const widget = imgWidgets[i];
    const mediaInfo = await buscarMedia(novosIds[i], auth);
    widget.settings.image = {
      id:  novosIds[i],
      url: mediaInfo.source_url,
    };
    substituicoes++;
    console.log(`   ✅ Widget ${i + 1} atualizado`);
  }

  if (substituicoes === 0) {
    console.error('❌ Nenhuma imagem substituída no JSON.');
    process.exit(1);
  }

  // ── 4. Salva a página atualizada ───────────────────────────────────────
  console.log('\n💾 Salvando página...');
  const updateRes = await fetch(`${WP_URL}/wp-json/wp/v2/pages/${PAGE_ID}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ meta: { _elementor_data: JSON.stringify(elementorJson) } }),
  });

  if (!updateRes.ok) {
    const err = await updateRes.text();
    console.error('❌ Erro ao salvar:', err);
    process.exit(1);
  }

  console.log('\n🎉 Encarte atualizado com sucesso!');
  console.log(`   Acesse: ${WP_URL}/encarte/`);
}

// Faz upload de uma imagem e retorna o ID na biblioteca de mídia
async function uploadImagem(filePath, auth) {
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
  const mime = mimeTypes[ext] || 'image/jpeg';

  const fileData = fs.readFileSync(filePath);
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': mime,
    },
    body: fileData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro no upload: ${err}`);
  }

  const data = await res.json();
  return data.id;
}

// Busca informações de uma mídia pelo ID
async function buscarMedia(id, auth) {
  const res = await fetch(`${WP_URL}/wp-json/wp/v2/media/${id}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.json();
}

// Encontra recursivamente todos os widgets de imagem no JSON do Elementor
function encontrarWidgetsImagem(elementos, resultado = []) {
  for (const el of elementos) {
    if (el.widgetType === 'image' && el.settings?.image) {
      resultado.push(el);
    }
    if (el.elements?.length) {
      encontrarWidgetsImagem(el.elements, resultado);
    }
  }
  return resultado;
}

// Fallback: usa Playwright se a API REST não funcionar
async function usarPlaywright(imagens) {
  console.log('\n🌐 Abrindo navegador como alternativa...');
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: false });
  const page    = await browser.newPage();
  page.setDefaultTimeout(60000);

  const TEMP_LOGIN = 'https://rioatacadao.com.br/wp-admin/?wtlwp_token=f9f0b83f99928cc1d802022c0bd8591898b5ed891812885d4c25f085c3463816160e613a6fa17b138ce40438f5db2583d9ebaca73387598cc367f137a8996c02';

  await page.goto(TEMP_LOGIN, { waitUntil: 'networkidle' });
  await page.waitForURL('**/wp-admin/**');
  console.log('✅ Login OK');

  await page.goto(`https://rioatacadao.com.br/wp-admin/post.php?post=${PAGE_ID}&action=elementor`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#elementor-editor-wrapper, .elementor-panel', { timeout: 60000 });
  await page.waitForTimeout(4000);
  console.log('✅ Elementor aberto');
  console.log('\n⚠️  Por favor, troque as imagens manualmente e publique.');
  console.log('   O navegador permanecerá aberto por 5 minutos.');
  await page.waitForTimeout(300000);
  await browser.close();
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
