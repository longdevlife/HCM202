const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/landing-pages/meng-to-sketchbook.html', { waitUntil: 'networkidle' });

  console.log('=== KẾT QUẢ ĐO LƯỜNG ĐỘ CÂN BẰNG THỊ GIÁC (VISUAL BALANCE) ===');
  
  // Đo khối Hero Tạp chí
  const heroLeftH = await page.$eval('.magazine-left-col', el => el.offsetHeight);
  const heroRightH = await page.$eval('.magazine-right-col', el => el.offsetHeight);
  const heroLeftText = await page.$eval('.magazine-left-col', el => el.innerText.length);
  const heroRightText = await page.$eval('.magazine-right-col', el => el.innerText.length);
  console.log(`Hero Magazine: Left H = ${heroLeftH}px (${heroLeftText} ký tự) | Right H = ${heroRightH}px (${heroRightText} ký tự) | Chênh lệch H: ${heroRightH - heroLeftH}px`);

  // Đo các slide thuyết trình
  const slides = await page.$$('.presentation-slide');
  for (let i = 0; i < slides.length; i++) {
    const cols = await slides[i].$$('.slide-col');
    if (cols.length >= 2) {
      const leftH = await cols[0].evaluate(el => el.offsetHeight);
      const rightH = await cols[1].evaluate(el => el.offsetHeight);
      const leftText = await cols[0].evaluate(el => el.innerText.length);
      const rightText = await cols[1].evaluate(el => el.innerText.length);
      console.log(`Slide ${i + 2}: Cột Trái H = ${leftH}px (${leftText} ký tự) | Cột Phải H = ${rightH}px (${rightText} ký tự) | Lệch: ${rightH - leftH}px (Phải dài hơn ${Math.round((rightH/leftH - 1)*100)}%)`);
    }
  }

  await browser.close();
})();
