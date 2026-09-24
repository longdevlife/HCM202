const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('http://localhost:5174/#overview', { waitUntil: 'networkidle' });
  const iframeElement = await page.waitForSelector('iframe[title="Meng To Sketchbook Landing Page"]');
  const frame = await iframeElement.contentFrame();

  // Let's get bounding box and innerText of key sections
  const sections = await frame.evaluate(() => {
    const ids = ['manuscripts', 'sec-part-1', 'sec-1-1', 'sec-1-2', 'sec-part-2', 'sec-2-1', 'sec-2-2', 'sec-2-3', 'alliance'];
    return ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { id, text: el.innerText.slice(0, 100), rect: { w: rect.width, h: rect.height } };
    }).filter(Boolean);
  });

  console.log('Sections on 1920 viewport:', JSON.stringify(sections, null, 2));

  // Also check text inside Screenshot using browser Tesseract or simple OCR if available,
  // or let's inspect the screenshot's cropped area
  await browser.close();
})();
