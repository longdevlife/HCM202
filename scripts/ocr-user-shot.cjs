const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Load a simple page and inject tesseract
  await page.goto('about:blank');
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js' });

  // Read the screenshot file as base64
  const imgPath = 'C:/Users/admin/OneDrive/Hình ảnh/Ảnh chụp màn hình/Screenshot 2026-09-25 030334.png';
  const imgBuf = fs.readFileSync(imgPath);
  const dataUri = `data:image/png;base64,${imgBuf.toString('base64')}`;

  console.log('Running OCR with Tesseract on Screenshot 2026-09-25 030334.png...');
  const text = await page.evaluate(async (uri) => {
    const worker = await Tesseract.createWorker(['vie', 'eng']);
    const ret = await worker.recognize(uri);
    await worker.terminate();
    return ret.data.text;
  }, dataUri).catch(err => 'OCR Error: ' + err.message);

  console.log('--- OCR TEXT IN USER SCREENSHOT ---');
  console.log(text);
  console.log('-----------------------------------');

  fs.writeFileSync('scripts/screenshot_ocr.txt', text);
  await browser.close();
})();
