const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const fileUrl = 'file:///' + path.resolve('scripts/ocr.html').replace(/\\/g, '/');
  console.log('Loading:', fileUrl);
  await page.goto(fileUrl);

  // Wait for OCR to complete
  await page.waitForFunction(() => {
    const el = document.getElementById('output');
    return el && el.textContent.length > 0;
  }, { timeout: 35000 });

  const text = await page.$eval('#output', el => el.textContent);
  console.log('--- OCR EXTRACTED TEXT ---');
  console.log(text);
  console.log('--------------------------');

  await browser.close();
})();
