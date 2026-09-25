const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('--- BẮT ĐẦU KIỂM THỬ TRANG GHÉP ẢNH TẠP CHÍ & SLIDE DECK ---');
  
  // Khởi tạo static server đơn giản để phục vụ thư mục public nếu vite chưa chạy
  const rootDir = path.resolve(__dirname, '..', 'public');
  const server = http.createServer((req, res) => {
    let filePath = path.join(rootDir, decodeURIComponent(req.url.split('?')[0]));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      return res.end('Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.svg': 'image/svg+xml',
      '.woff2': 'font/woff2'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  const port = 41739;
  await new Promise(resolve => server.listen(port, resolve));
  console.log(`Test static server running at http://localhost:${port}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const targetUrl = `http://localhost:${port}/landing-pages/meng-to-sketchbook.html`;
  console.log(`Navigating to: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

  console.log('Page Title:', await page.title());

  // 1. Kiểm tra khối Hero Magazine
  const magazineHero = await page.$('.magazine-hero-card');
  console.log('1. Khối Magazine Hero Card tồn tại:', !!magazineHero);

  const mainHeroRibbon = await page.$eval('.magazine-hero-card .interactive-ribbon', el => el.innerText.trim());
  console.log('   Banner Ribbon Hero:', mainHeroRibbon);

  const tocItems = await page.$$eval('.magazine-toc-item', items => items.map(el => el.innerText.replace(/\s+/g, ' ').trim()));
  console.log('   Mục lục chuyên đề TOC count:', tocItems.length);
  console.log('   Mục lục mẫu:', tocItems.slice(0, 3));

  // 2. Kiểm tra tất cả các cụm collage trên các Slide
  const slideCollages = await page.$$('.slide-collage-wrapper');
  console.log('2. Số lượng cụm collage trên các slide thuyết trình:', slideCollages.length);

  // 3. Kiểm tra tính toàn vẹn của tất cả ảnh trong các thẻ interactive-card
  const cardImages = await page.$$eval('.interactive-card img', imgs => {
    return imgs.map(img => ({
      src: img.getAttribute('src'),
      alt: img.getAttribute('alt'),
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    }));
  });

  console.log('3. Tổng số ảnh trong các thẻ interactive-card (Collage):', cardImages.length);
  let brokenCount = 0;
  cardImages.forEach((img, idx) => {
    const isOk = img.naturalWidth > 0;
    if (!isOk) brokenCount++;
    console.log(`   [${isOk ? 'OK' : 'BROKEN'}] #${idx + 1} (${img.naturalWidth}x${img.naturalHeight}) - ${img.src}`);
  });

  // 4. Kiểm tra các link nguồn (Source links)
  const sourceLinks = await page.$$eval('.collage-source-btn', links => {
    return links.map(l => ({
      text: l.innerText.trim(),
      href: l.getAttribute('href'),
      target: l.getAttribute('target')
    }));
  });

  console.log('4. Các nút liên kết nguồn ngoài (Source Links):', sourceLinks.length);
  sourceLinks.forEach(l => {
    console.log(`   - Link: "${l.text}" -> ${l.href} (target: ${l.target})`);
  });

  console.log('5. Console errors count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('   Errors:', consoleErrors);
  }

  await browser.close();
  server.close();

  if (brokenCount === 0 && cardImages.length >= 10 && consoleErrors.length === 0) {
    console.log('=== KIỂM THỬ THÀNH CÔNG RỰC RỠ 100%! TẤT CẢ ẢNH VÀ COLLAGE HOÀN HẢO ===');
  } else {
    console.log('=== CẦN KIỂM TRA LẠI: Có ảnh chưa load hoặc console error ===');
  }
})();
