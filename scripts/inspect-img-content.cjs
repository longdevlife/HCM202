const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgBase64 = fs.readFileSync('C:\\Users\\admin\\OneDrive\\Hình ảnh\\Ảnh chụp màn hình\\Screenshot 2026-09-24 151614.png').toString('base64');
  
  await page.setContent('<html><body><img id="img" src="data:image/png;base64,' + imgBase64 + '" /><canvas id="c"></canvas></body></html>');

  const info = await page.evaluate(async () => {
    const img = document.getElementById('img');
    const canvas = document.getElementById('c');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Let's sample along horizontal lines to see what elements are here
    // Find dark text bounding boxes or dominant colors
    const colors = [];
    for (let y = 50; y < img.naturalHeight; y += 100) {
      const p = ctx.getImageData(img.naturalWidth / 2, y, 1, 1).data;
      colors.push({ y, color: p[0] + ',' + p[1] + ',' + p[2] });
    }
    return { w: img.naturalWidth, h: img.naturalHeight, colors };
  });

  console.log('Result:', JSON.stringify(info));
  await browser.close();
})();
