const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:5174/#overview', { waitUntil: 'networkidle' });
  const iframe = await (await page.waitForSelector('iframe')).contentFrame();

  // Capture manuscripts
  const manuscripts = await iframe.$('#manuscripts');
  if (manuscripts) {
    await manuscripts.screenshot({ path: '.playwright-cli/crop-manuscripts.png' });
  }

  // Capture alliance
  const alliance = await iframe.$('#alliance');
  if (alliance) {
    await alliance.screenshot({ path: '.playwright-cli/crop-alliance.png' });
  }

  // Capture hero/book
  const hero = await iframe.$('#sketchbook');
  if (hero) {
    await hero.screenshot({ path: '.playwright-cli/crop-hero.png' });
  }

  // Let's check size of files
  console.log('Manuscripts size:', fs.statSync('.playwright-cli/crop-manuscripts.png').size);
  console.log('Alliance size:', fs.statSync('.playwright-cli/crop-alliance.png').size);
  console.log('Hero size:', fs.statSync('.playwright-cli/crop-hero.png').size);
  console.log('User screenshot size:', fs.statSync('C:\\Users\\admin\\OneDrive\\Hình ảnh\\Ảnh chụp màn hình\\Screenshot 2026-09-24 151614.png').size);

  await browser.close();
})();
