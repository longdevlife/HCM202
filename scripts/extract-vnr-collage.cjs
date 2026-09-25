const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://vnr-lich-su-dang.vercel.app/', { waitUntil: 'networkidle' });

  // Get the first section HTML
  const heroHtml = await page.evaluate(() => {
    const sec = document.querySelector('section');
    return sec ? sec.outerHTML : '';
  });

  fs.writeFileSync(path.join(__dirname, 'vnr_hero_section.html'), heroHtml);
  console.log('Saved vnr_hero_section.html (length:', heroHtml.length, ')');

  // Also get the styles and classes of the cards and collage
  const collageDetails = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.interactive-card, [class*="card"]')).map(c => ({
      className: c.className,
      style: c.getAttribute('style'),
      computedStyle: {
        background: window.getComputedStyle(c).background,
        boxShadow: window.getComputedStyle(c).boxShadow,
        borderRadius: window.getComputedStyle(c).borderRadius,
        transform: window.getComputedStyle(c).transform,
      },
      html: c.innerHTML.slice(0, 300)
    }));

    return { cards };
  });

  fs.writeFileSync(path.join(__dirname, 'vnr_collage_details.json'), JSON.stringify(collageDetails, null, 2));
  console.log('Saved vnr_collage_details.json with', collageDetails.cards.length, 'cards');

  await browser.close();
})();
