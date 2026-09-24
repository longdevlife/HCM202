import { spawn } from "child_process";
import playwright from "playwright";
import path from "path";
import fs from "fs";

async function testGame() {
  console.log("Starting vite preview server...");
  const server = spawn("npx", ["vite", "preview", "--port", "4173"], {
    shell: true,
    cwd: "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202",
  });

  server.stdout.on("data", (data) => console.log("[SERVER]", data.toString().trim()));
  server.stderr.on("data", (data) => console.log("[SERVER ERR]", data.toString().trim()));

  await new Promise((r) => setTimeout(r, 2500));

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  page.on("console", (msg) => console.log("[BROWSER]", msg.text()));
  page.on("pageerror", (err) => console.log("[BROWSER ERR]", err.message));

  console.log("Navigating to http://localhost:4173/#truytimmanhghep...");
  await page.goto("http://localhost:4173/#truytimmanhghep", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const outDir = "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202/screenshots";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log("Step 1: Taking initial screenshot of game screen...");
  await page.screenshot({ path: path.join(outDir, "game_init.png") });

  console.log("Step 2: Clicking Question 1 from outside question bar...");
  const q1Btn = page.locator("button:has-text('Câu 1')").first();
  await q1Btn.click();
  await page.waitForTimeout(600);

  console.log("Step 3: Taking screenshot of Question 1 modal...");
  await page.screenshot({ path: path.join(outDir, "q1_modal.png") });

  console.log("Step 4: Selecting Option B (correct) and confirming...");
  const optB = page.locator("button:has(span:text-is('B'))").first();
  await optB.click();
  await page.waitForTimeout(300);

  const confirmBtn = page.locator("button:has-text('Xác Nhận Đáp Án')");
  await confirmBtn.click();
  await page.waitForTimeout(600);

  console.log("Step 5: Taking screenshot of answer feedback...");
  await page.screenshot({ path: path.join(outDir, "q1_feedback.png") });

  console.log("Step 6: Clicking 'Xem Mảnh Ghép Số 1' to close modal and reveal piece...");
  const nextBtn = page.locator("button:has-text('Xem Mảnh Ghép Số 1')");
  await nextBtn.click();
  await page.waitForTimeout(1200);

  console.log("Step 7: Taking screenshot after revealing piece 1...");
  await page.screenshot({ path: path.join(outDir, "piece_1_revealed.png") });

  console.log("Step 8: Clicking Question 9 directly from board...");
  const cell9 = page.locator("button:has-text('Mảnh 9')").first();
  await cell9.click();
  await page.waitForTimeout(600);

  console.log("Step 9: Answering Question 9 (Option A) and confirming...");
  const optA = page.locator("button:has(span:text-is('A'))").first();
  await optA.click();
  await page.waitForTimeout(300);
  await page.locator("button:has-text('Xác Nhận Đáp Án')").click();
  await page.waitForTimeout(600);
  await page.locator("button:has-text('Xem Mảnh Ghép Số 9')").click();
  await page.waitForTimeout(1200);

  console.log("Step 10: Taking screenshot after revealing piece 9...");
  await page.screenshot({ path: path.join(outDir, "piece_9_revealed.png") });

  await browser.close();
  server.kill();
  console.log("All test steps finished successfully!");
  process.exit(0);
}

testGame().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
