const { chromium } = require('playwright');
const { spawn } = require('child_process');

(async () => {
  console.log('--- KIỂM THỬ TÍCH HỢP TRÊN VITE DEV SERVER CHO TOÀN BỘ WEB ---');
  const viteProcess = spawn('npm', ['run', 'dev', '--', '--port', '5179', '--host'], {
    shell: true,
    cwd: process.cwd()
  });

  // Chờ server vite sẵn sàng
  await new Promise(resolve => {
    viteProcess.stdout.on('data', data => {
      const str = data.toString();
      if (str.includes('Local:') || str.includes('5179')) {
        resolve();
      }
    });
    setTimeout(resolve, 6000);
  });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    await page.goto('http://localhost:5179/#overview', { waitUntil: 'networkidle', timeout: 20000 });
    console.log('App URL title:', await page.title());

    // Kiểm tra iframe bên trong OverviewLandingPage
    const frameElement = await page.$('iframe');
    console.log('Iframe OverviewLandingPage exists:', !!frameElement);

    if (frameElement) {
      const frame = await frameElement.contentFrame();
      const heroCard = await frame.$('.magazine-hero-card');
      console.log('Inside iframe: magazine-hero-card exists:', !!heroCard);
      const interactiveCards = await frame.$$('.interactive-card');
      console.log('Inside iframe: total interactive cards:', interactiveCards.length);
    }
  } catch (err) {
    console.error('Error during test:', err.message);
  } finally {
    await browser.close();
    viteProcess.kill();
  }
  console.log('--- HOÀN TẤT KIỂM THỬ TÍCH HỢP VITE DEV SERVER ---');
  process.exit(0);
})();
