const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('file:///' + path.resolve('scripts/test-img.html').replace(/\\/g, '/'));
  await page.waitForTimeout(500);

  // Let's crop 5 sections in the screenshot to see what's in there
  const userImgAnalysis = await page.evaluate(() => {
    const img = document.getElementById('img');
    const c = document.getElementById('c');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's sample colors or text lines
    // Does it have "Bản Thảo 5 Trang Sách"?
    // Let's check text using OCR-like pixel density
    return {
      w: img.naturalWidth,
      h: img.naturalHeight
    };
  });
  console.log('User image size:', userImgAnalysis);

  // Now open the app
  await page.goto('http://localhost:5174/#overview', { waitUntil: 'networkidle' });
  const iframe = await (await page.waitForSelector('iframe')).contentFrame();

  const secMatches = [];
  for (const id of ['manuscripts', 'sec-1-1', 'sec-1-2', 'sec-2-1', 'sec-2-2', 'sec-2-3', 'alliance']) {
    const el = await iframe.$('#' + id);
    if (el) {
      const box = await el.boundingBox();
      secMatches.push({ id, box });
    }
  }
  console.log('Available sections:', secMatches);

  await browser.close();
})();
