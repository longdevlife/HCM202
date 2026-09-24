import { spawn } from "child_process";
import playwright from "playwright";

async function testRulesModal() {
  const server = spawn("npx", ["vite", "preview", "--port", "4173"], {
    shell: true,
    cwd: "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202",
  });
  await new Promise((r) => setTimeout(r, 2000));

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });

  // Access game tab directly - modal should open automatically
  await page.goto("http://localhost:4173/#truytimmanhghep", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const outPath1 = "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202/screenshots/rules_modal_auto_opened.png";
  await page.screenshot({ path: outPath1 });
  console.log("Saved screenshot of auto-opened modal to:", outPath1);

  // Close modal by clicking the button
  await page.locator("button:has-text('ĐÃ HIỂU THỂ LỆ')").click();
  await page.waitForTimeout(400);

  // Re-open by clicking navbar tab
  await page.locator("a:has-text('Truy Tìm Mảnh Ghép')").click();
  await page.waitForTimeout(400);

  const outPath2 = "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202/screenshots/rules_modal_reopened_via_tab.png";
  await page.screenshot({ path: outPath2 });
  console.log("Saved screenshot of modal re-opened via tab to:", outPath2);

  await browser.close();
  server.kill();
  process.exit(0);
}

testRulesModal().catch((e) => {
  console.error(e);
  process.exit(1);
});
