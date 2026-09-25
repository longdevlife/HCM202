const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'public', 'landing-pages', 'meng-to-sketchbook');

// Các cặp trang sách thực tế cho 5 Spreads
const SPREADS = [
  {
    filename: 'chapter5-spread-1.png',
    leftImg: 'public/textures/chapter5/bia.png',
    rightImg: 'public/textures/chapter5/muc_1.png',
    title: 'Bìa & Mục 1: Khái niệm & Vị trí Cơ cấu Xã hội - Giai cấp',
  },
  {
    filename: 'chapter5-spread-2.png',
    leftImg: 'public/textures/chapter5/1.1.png',
    rightImg: 'public/textures/chapter5/1.2.png',
    title: 'Mục 1.1 & 1.2: Khái niệm & Vị trí trong Hệ thống Xã hội',
  },
  {
    filename: 'chapter5-spread-3.png',
    leftImg: 'public/textures/chapter5/muc_2.png',
    rightImg: 'public/textures/chapter5/2.1.png',
    title: 'Mục 2 & 2.1: Biến đổi có tính quy luật & Cơ cấu Kinh tế',
  },
  {
    filename: 'chapter5-spread-4.png',
    leftImg: 'public/textures/chapter5/2.2.png',
    rightImg: 'public/textures/chapter5/2.3.png',
    title: 'Mục 2.2 & 2.3: Tầng lớp mới & Mối quan hệ Liên minh',
  },
  {
    filename: 'chapter5-spread-5.png',
    leftImg: 'public/textures/chapter5/thanks.png',
    rightImg: 'public/textures/chapter5/end.png',
    title: 'Lời Cảm Ơn & Tổng Kết Chương 5',
  }
];

function buildPureBookSpreadHtml(leftDataUri, rightDataUri) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1760px;
    height: 1240px;
    overflow: hidden;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .spread-container {
    width: 1760px;
    height: 1240px;
    display: grid;
    grid-template-columns: 880px 880px;
    position: relative;
    background: #ece7dc linear-gradient(180deg, rgba(246,242,233,0.9) 0%, rgba(234,227,214,0.95) 100%);
    box-shadow: inset 0 0 120px rgba(43,39,33,0.08);
  }

  /* Gáy sách ở giữa */
  .spine-crease {
    position: absolute;
    top: 0; bottom: 0;
    left: 880px;
    width: 3px;
    transform: translateX(-50%);
    background: linear-gradient(180deg, rgba(43,39,33,0.25) 0%, rgba(43,39,33,0.45) 50%, rgba(43,39,33,0.25) 100%);
    z-index: 10;
  }
  .spine-shadow-left {
    position: absolute;
    top: 0; bottom: 0;
    right: 880px;
    width: 80px;
    background: linear-gradient(90deg, transparent, rgba(43,39,33,0.09));
    pointer-events: none;
    z-index: 9;
  }
  .spine-shadow-right {
    position: absolute;
    top: 0; bottom: 0;
    left: 880px;
    width: 80px;
    background: linear-gradient(-90deg, transparent, rgba(43,39,33,0.09));
    pointer-events: none;
    z-index: 9;
  }

  .page-half {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    position: relative;
  }

  .page-half.left {
    padding-right: 45px;
    padding-left: 55px;
  }

  .page-half.right {
    padding-left: 45px;
    padding-right: 55px;
  }

  /* Khung chứa ảnh trang sách thực tế */
  .book-page-wrap {
    width: 100%;
    height: 100%;
    max-height: 1160px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .book-page-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 14px 40px rgba(43,39,33,0.18), 0 2px 10px rgba(43,39,33,0.08);
    display: block;
    background: #ffffff;
  }
</style>
</head>
<body>
  <div class="spread-container">
    <div class="spine-crease"></div>
    <div class="spine-shadow-left"></div>
    <div class="spine-shadow-right"></div>

    <div class="page-half left">
      <div class="book-page-wrap">
        <img class="book-page-img" src="${leftDataUri}" alt="Trang trái">
      </div>
    </div>

    <div class="page-half right">
      <div class="book-page-wrap">
        <img class="book-page-img" src="${rightDataUri}" alt="Trang phải">
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function renderPureSpreads() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1760, height: 1240 }, deviceScaleFactor: 1 });

  for (const s of SPREADS) {
    const leftBuf = fs.readFileSync(path.join(ROOT_DIR, s.leftImg));
    const rightBuf = fs.readFileSync(path.join(ROOT_DIR, s.rightImg));
    const leftUri = `data:image/png;base64,${leftBuf.toString('base64')}`;
    const rightUri = `data:image/png;base64,${rightBuf.toString('base64')}`;

    const html = buildPureBookSpreadHtml(leftUri, rightUri);
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const outPath = path.join(OUT_DIR, s.filename);
    await page.screenshot({ path: outPath });
    console.log(`Rendered pure book spread: ${s.filename}`);
  }

  await browser.close();
  console.log('All 5 pure book spreads rendered successfully!');
}

renderPureSpreads().catch(err => {
  console.error('Error rendering pure book spreads:', err);
  process.exit(1);
});
