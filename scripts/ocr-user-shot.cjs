const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Load tesseract.js from cdnjs inside headless page to read the exact text of the user's screenshot!
  await page.setContent(\`
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
      </head>
      <body>
        <img id="img" src="file:///C:/Users/admin/OneDrive/Hình ảnh/Ảnh chụp màn hình/Screenshot 2026-09-24 151614.png" />
      </body>
    </html>
  \`);

  const text = await page.evaluate(async () => {
    const worker = await Tesseract.createWorker('vie');
    const ret = await worker.recognize(document.getElementById('img'));
    await worker.terminate();
    return ret.data.text;
  }).catch(async (e) => {
    // Fallback english/latin worker
    const worker = await Tesseract.createWorker('eng');
    const ret = await worker.recognize(document.getElementById('img'));
    await worker.terminate();
    return ret.data.text;
  }).catch(err => 'OCR Error: ' + err.message);

  console.log('--- OCR TEXT IN USER SCREENSHOT ---');
  console.log(text);
  console.log('-----------------------------------');

  await browser.close();
})();
