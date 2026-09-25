const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function inspect() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to https://vnr-lich-su-dang.vercel.app/ ...');
  await page.goto('https://vnr-lich-su-dang.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
  
  const title = await page.title();
  console.log('Title:', title);
  
  // Save page screenshot to .playwright-cli/
  const ssDir = path.join(__dirname, '..', '.playwright-cli');
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });
  await page.screenshot({ path: path.join(ssDir, 'vnr-full.png'), fullPage: true });
  console.log('Saved screenshot to .playwright-cli/vnr-full.png');
  
  // Extract all sections, cards, collage, gallery layout and structure
  const structure = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, main, div[class*="section"], div[class*="grid"], div[class*="card"]'));
    const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      parentClass: img.parentElement ? img.parentElement.className : '',
      classes: img.className
    }));
    
    // Find image collages / grids / picture groupings
    const galleries = Array.from(document.querySelectorAll('div, figure, section')).filter(el => {
      const subImgs = el.querySelectorAll('img');
      return subImgs.length >= 2;
    }).map(el => ({
      tag: el.tagName,
      className: el.className,
      imgCount: el.querySelectorAll('img').length,
      outerHTMLSnippet: el.outerHTML.slice(0, 300)
    }));

    return {
      title: document.title,
      imagesCount: imgs.length,
      images: imgs,
      galleries: galleries.slice(0, 10),
      bodyTextSnippet: document.body.innerText.slice(0, 1000)
    };
  });
  
  fs.writeFileSync(path.join(__dirname, 'vnr_structure.json'), JSON.stringify(structure, null, 2));
  console.log('Saved vnr_structure.json with', structure.imagesCount, 'images and', structure.galleries.length, 'gallery candidates.');
  
  await browser.close();
}

inspect().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
