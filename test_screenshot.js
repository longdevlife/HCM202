import playwright from 'playwright';

async function run() {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Lắng nghe console log từ trình duyệt
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error('[BROWSER ERROR]', err.message);
  });

  console.log("Navigating to http://localhost:5173/#museum ...");
  await page.goto('http://localhost:5173/#museum', { waitUntil: 'networkidle' });
  
  // Đợi 3 giây để 3D scene load và render xong
  await page.waitForTimeout(3000);
  
  console.log("Taking screenshot...");
  await page.screenshot({ path: 'C:\\Users\\admin\\.gemini\\antigravity\\brain\\bd438cd0-a08d-4b38-9000-8935960998c8\\museum_screenshot.png' });
  console.log("Screenshot saved to C:\\Users\\admin\\.gemini\\antigravity\\brain\\bd438cd0-a08d-4b38-9000-8935960998c8\\museum_screenshot.png");
  
  await browser.close();
}

run().catch(err => {
  console.error("Script failed:", err);
});
