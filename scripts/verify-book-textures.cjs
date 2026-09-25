const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verify() {
  console.log('--- Starting Book Texture Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Test Overview page sketchbook hero
  console.log('Navigating to Overview page...');
  await page.goto('http://localhost:5173/#overview', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Check iframe or sketchbook
  const iframeEl = await page.$('iframe');
  if (iframeEl) {
    const frame = await iframeEl.contentFrame();
    if (frame) {
      const initialCaption = await frame.$eval('#sbCaptions', el => el.textContent.trim());
      console.log('Initial Sketchbook Caption:', initialCaption);

      // Click next page on sketchbook
      const nextBtn = await frame.$('#sbRight');
      if (nextBtn) {
        await nextBtn.click();
        await page.waitForTimeout(800);
        const secondCaption = await frame.$eval('#sbCaptions', el => el.textContent.trim());
        console.log('Second Sketchbook Caption:', secondCaption);
      }
    }
  }

  // 2. Test Book page (#book)
  console.log('Navigating to 3D Book page...');
  await page.goto('http://localhost:5173/#book', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // If intro screen is shown, click enter
  const enterBtn = await page.$('button');
  if (enterBtn) {
    const text = await enterBtn.textContent();
    console.log('Found button on #book:', text);
    await enterBtn.click();
    await page.waitForTimeout(1500);
  }

  // In library view, open the first book via postMessage
  console.log('Sending OPEN_BOOK postMessage...');
  await page.evaluate(() => {
    window.postMessage({ type: 'OPEN_BOOK', index: 0 }, '*');
  });
  await page.waitForTimeout(2000);

  // Check if book nav buttons exist on page
  const navBtns = await page.$$('.book-nav-btn');
  console.log('Book nav buttons found on page:', navBtns.length);
  for (let i = 0; i < navBtns.length; i++) {
    const label = await navBtns[i].textContent();
    console.log(`Clicking nav btn ${i}:`, label.trim());
    await navBtns[i].click();
    await page.waitForTimeout(400);
  }

  // Check screenshot directory exists
  const ssDir = path.join(process.cwd(), '.playwright-cli');
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });

  await page.screenshot({ path: path.join(ssDir, 'book-verification.png') });
  console.log('Screenshot saved to .playwright-cli/book-verification.png');

  console.log('Console errors found:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }

  await browser.close();
  console.log('--- Verification Finished Successfully ---');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
