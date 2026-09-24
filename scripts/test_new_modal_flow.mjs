import { spawn } from "child_process";
import playwright from "playwright";
import path from "path";
import fs from "fs";

async function testNewFlow() {
  console.log("Starting vite preview server...");
  const server = spawn("npx", ["vite", "preview", "--port", "4173"], {
    shell: true,
    cwd: "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202",
  });

  await new Promise((r) => setTimeout(r, 2000));

  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 950 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:4173/#truytimmanhghep...");
  await page.goto("http://localhost:4173/#truytimmanhghep", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const outDir = "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202/screenshots";

  console.log("Step 1: Taking screenshot of new question list screen (NO puzzle board)...");
  await page.screenshot({ path: path.join(outDir, "new_main_screen.png") });

  console.log("Step 2: Clicking Question 1 card...");
  const q1Card = page.locator("button:has-text('Chủ đề: Khái niệm')").first();
  await q1Card.click();
  await page.waitForTimeout(600);

  console.log("Step 3: Taking screenshot of Question 1 modal before answering...");
  await page.screenshot({ path: path.join(outDir, "modal_question_active.png") });

  console.log("Step 4: Selecting Option B and confirming answer...");
  const optB = page.locator("button:has(span:text-is('B'))").first();
  await optB.click();
  await page.waitForTimeout(300);

  await page.locator("button:has-text('Xác Nhận Đáp Án')").click();
  await page.waitForTimeout(800);

  console.log("Step 5: Taking screenshot of modal after answering (question hidden, piece image shown)...");
  await page.screenshot({ path: path.join(outDir, "modal_piece_revealed.png") });

  console.log("Step 6: Clicking 'Đóng & Trao Mảnh Ghép'...");
  await page.locator("button:has-text('Đóng & Trao Mảnh Ghép')").click();
  await page.waitForTimeout(1000);

  console.log("Step 7: Taking screenshot of main screen after closing (Question 1 card gone)...");
  await page.screenshot({ path: path.join(outDir, "main_screen_after_q1_closed.png") });

  await browser.close();
  server.kill();
  console.log("All steps completed successfully!");
  process.exit(0);
}

testNewFlow().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
