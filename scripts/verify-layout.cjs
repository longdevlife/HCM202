const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/landing-pages/meng-to-sketchbook.html', { waitUntil: 'networkidle' });

  const reversed = await page.$$('.layout-reversed');
  console.log(`Số slide áp dụng bố cục đảo chiều (layout-reversed): ${reversed.length}`);

  const bars = await page.$$('.visual-bar-item');
  console.log(`Số thanh tiến trình trực quan (Visual Data Progress Bars): ${bars.length}`);

  // Kiểm tra thứ tự và vị trí các slide
  const slides = await page.$$('.presentation-slide');
  for (let i = 0; i < slides.length; i++) {
    const id = await slides[i].getAttribute('id');
    const isReversed = await slides[i].$eval('.slide-body-grid', el => el.classList.contains('layout-reversed')).catch(() => false);
    console.log(`- ${id}: ${isReversed ? 'ĐẢO CHIỀU (Ảnh TRÁI - Chữ PHẢI)' : 'TIÊU CHUẨN (Chữ TRÁI - Ảnh PHẢI)'}`);
  }

  await browser.close();
  console.log('✅ Xác minh layout hoàn tất thành công!');
})();
