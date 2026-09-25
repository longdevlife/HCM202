const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:5174/#overview', { waitUntil: 'networkidle' });
  const iframe = await (await page.waitForSelector('iframe')).contentFrame();

  const userImgBase64 = fs.readFileSync('C:\\Users\\admin\\OneDrive\\Hình ảnh\\Ảnh chụp màn hình\\Screenshot 2026-09-24 151614.png').toString('base64');

  const targets = ['manuscripts', 'sec-part-1', 'sec-1-1', 'sec-1-2', 'sec-part-2', 'sec-2-1', 'sec-2-2', 'sec-2-3', 'alliance'];
  const results = [];

  for (const id of targets) {
    const el = await iframe.$('#' + id);
    if (!el) continue;
    const shot = await el.screenshot();
    const shotBase64 = shot.toString('base64');

    const score = await page.evaluate(async ({ userBase64, targetBase64 }) => {
      const loadImg = (b64) => new Promise(res => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = 'data:image/png;base64,' + b64;
      });

      const [imgA, imgB] = await Promise.all([loadImg(userBase64), loadImg(targetBase64)]);
      const c = document.createElement('canvas');
      c.width = 100;
      c.height = 100;
      const ctx = c.getContext('2d');

      ctx.drawImage(imgA, 0, 0, 100, 100);
      const dataA = ctx.getImageData(0, 0, 100, 100).data;

      ctx.clearRect(0, 0, 100, 100);
      ctx.drawImage(imgB, 0, 0, 100, 100);
      const dataB = ctx.getImageData(0, 0, 100, 100).data;

      let diff = 0;
      for (let i = 0; i < dataA.length; i += 4) {
        diff += Math.abs(dataA[i] - dataB[i]) + Math.abs(dataA[i+1] - dataB[i+1]) + Math.abs(dataA[i+2] - dataB[i+2]);
      }
      return diff / (100 * 100 * 3);
    }, { userBase64: userImgBase64, targetBase64: shotBase64 });

    results.push({ id, diffScore: score });
  }

  results.sort((a, b) => a.diffScore - b.diffScore);
  console.log('Similarity ranking (lowest diff is closest):', results);

  await browser.close();
})();
