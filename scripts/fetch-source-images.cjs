const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URLS = [
  {
    id: 'nhandan-nongnghiep',
    url: 'https://nhandan.vn/can-buoc-nhay-vot-cho-nong-nghiep-cong-nghe-cao-post861923.html'
  },
  {
    id: 'nhandan-tonvinh',
    url: 'https://nhandan.vn/chu-tich-nuoc-luong-cuong-du-le-ton-vinh-nong-dan-viet-nam-xuat-sac-nha-khoa-hoc-cua-nha-nong-nam-2025-post915378.html'
  },
  {
    id: 'gso-doanhnghiep',
    url: 'https://www.nso.gov.vn/du-lieu-va-so-lieu-thong-ke/2026/01/buc-tranh-phat-trien-doanh-nghiep-viet-nam-nam-2025/'
  }
];

async function fetchImages() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const item of URLS) {
    try {
      console.log('Fetching', item.url, '...');
      const page = await browser.newPage();
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);

      const imgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('article img, .content img, .detail img, img')).map(img => ({
          src: img.src,
          alt: img.alt || '',
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height
        })).filter(i => i.src && i.src.startsWith('http') && !i.src.includes('logo') && !i.src.includes('icon') && i.width > 200);
      });

      console.log(`Found ${imgs.length} images for ${item.id}`);
      results.push({ item, imgs: imgs.slice(0, 5) });
      await page.close();
    } catch (err) {
      console.error(`Error fetching ${item.id}:`, err.message);
    }
  }

  await browser.close();
  fs.writeFileSync('scripts/source_images.json', JSON.stringify(results, null, 2));
  console.log('Saved source_images.json');
}

fetchImages().catch(e => console.error(e));
