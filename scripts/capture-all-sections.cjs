const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5174/#overview...');
  await page.goto('http://localhost:5174/#overview', { waitUntil: 'networkidle' });

  const iframeElement = await page.waitForSelector('iframe[title="Meng To Sketchbook Landing Page"]');
  const frame = await iframeElement.contentFrame();

  const outDir = path.join(process.cwd(), '.playwright-cli');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Screenshot Hero & Sách 3D
  await page.screenshot({ path: path.join(outDir, '01-hero-book-3d.png') });
  console.log('Saved 01-hero-book-3d.png');

  // 2. Screenshot Bản thảo 5 trang
  await frame.evaluate(() => {
    document.getElementById('manuscripts').scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '02-manuscripts-gallery.png') });
  console.log('Saved 02-manuscripts-gallery.png');

  // 3. Screenshot Mục 1.1
  await frame.evaluate(() => {
    document.getElementById('sec-1-1').scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '03-section-1-1.png') });
  console.log('Saved 03-section-1-1.png');

  // 4. Screenshot Mục 1.2
  await frame.evaluate(() => {
    document.getElementById('sec-1-2').scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '04-section-1-2.png') });
  console.log('Saved 04-section-1-2.png');

  // 5. Screenshot Mục 2.1
  await frame.evaluate(() => {
    document.getElementById('sec-2-1').scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '05-section-2-1.png') });
  console.log('Saved 05-section-2-1.png');

  // 6. Screenshot Mục 2.2 & 2.3
  await frame.evaluate(() => {
    document.getElementById('sec-2-2').scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '06-section-2-2.png') });
  console.log('Saved 06-section-2-2.png');

  // 7. Screenshot Khối Liên Minh Giai Cấp & Footer
  await frame.evaluate(() => {
    document.getElementById('alliance').scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, '07-alliance-and-footer.png') });
  console.log('Saved 07-alliance-and-footer.png');

  await browser.close();
  console.log('All gallery screenshots saved successfully!');
})();
