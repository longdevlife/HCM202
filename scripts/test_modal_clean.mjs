import { spawn } from "child_process";
import playwright from "playwright";
import path from "path";

async function testModal() {
  const server = spawn("npx", ["vite", "preview", "--port", "4173"], {
    shell: true,
    cwd: "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202",
  });
  await new Promise((r) => setTimeout(r, 2000));

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });

  await page.goto("http://localhost:4173/#truytimmanhghep", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Click 'XEM BỨC TRANH GỐC ĐỐI CHIẾU'
  await page.locator("button:has-text('XEM BỨC TRANH GỐC ĐỐI CHIẾU')").click();
  await page.waitForTimeout(600);

  const outPath = "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202/screenshots/mystery_modal_no_box.png";
  await page.screenshot({ path: outPath });
  console.log("Saved screenshot to:", outPath);

  await browser.close();
  server.kill();
  process.exit(0);
}

testModal().catch((e) => {
  console.error(e);
  process.exit(1);
});
