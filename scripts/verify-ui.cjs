const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log('Navigating to http://localhost:5174/#overview...');
  await page.goto('http://localhost:5174/#overview', { waitUntil: 'networkidle' });

  const iframeElement = await page.waitForSelector('iframe[title="Meng To Sketchbook Landing Page"]');
  const frame = await iframeElement.contentFrame();

  await frame.waitForSelector('.hero');
  await frame.waitForSelector('#sbBook');
  await frame.waitForSelector('#sec-1-1');

  // Check typography
  const typographyCheck = await frame.evaluate(() => {
    const h2 = document.querySelector('h2');
    const p = document.querySelector('.body-paragraph');
    const card = document.querySelector('.editorial-card');
    const wash = document.querySelector('.wash');
    return {
      h2Font: h2 ? window.getComputedStyle(h2).fontFamily : null,
      pFont: p ? window.getComputedStyle(p).fontFamily : null,
      cardFont: card ? window.getComputedStyle(card).fontFamily : null,
      cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
      washDisplay: wash ? window.getComputedStyle(wash).display : null,
    };
  });
  console.log('Typography and visual styles:', typographyCheck);

  // Check forbidden names & emojis
  const frameBodyText = await frame.evaluate(() => document.body.innerText);
  const bannedNames = ['anh Chánh', 'anh Khoa', 'Như Quỳnh', 'Anh Long Anh', 'Thị Bé Thi', 'bé Thi', 'anh Long'];
  const foundBanned = bannedNames.filter(name => frameBodyText.toLowerCase().includes(name.toLowerCase()));
  console.log('Banned names found:', foundBanned);

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const foundEmojis = frameBodyText.match(emojiRegex);
  console.log('Emojis found:', foundEmojis);

  console.log('Console errors:', consoleErrors);
  console.log('Page errors:', pageErrors);

  // Chụp ảnh màn hình kiểm tra
  const outDir = path.join(process.cwd(), '.playwright-cli');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await page.screenshot({ path: path.join(outDir, 'editorial-01-hero-book.png') });

  await frame.evaluate(() => document.getElementById('manuscripts').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'editorial-02-manuscripts.png') });

  await frame.evaluate(() => document.getElementById('sec-1-1').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'editorial-03-sec-1-1.png') });

  await frame.evaluate(() => document.getElementById('sec-2-1').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'editorial-04-sec-2-1.png') });

  await frame.evaluate(() => document.getElementById('alliance').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, 'editorial-05-alliance.png') });

  console.log('Saved editorial screenshots successfully!');

  await browser.close();
  console.log('Verification completed successfully!');
})();
