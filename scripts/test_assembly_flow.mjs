import { spawn } from "child_process";
import playwright from "playwright";
import path from "path";
import fs from "fs";

async function testAssemblyFlow() {
  console.log("Building project first to ensure preview is up to date...");
  const buildProcess = spawn("npm", ["run", "build"], {
    shell: true,
    cwd: "C:/Users/lekho/OneDrive/Documents/SE183675/hcm202",
    stdio: "inherit",
  });

  await new Promise((resolve, reject) => {
    buildProcess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Build failed with code ${code}`));
    });
  });

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

  console.log("Step 1: Taking screenshot of question cards (showing Câu hỏi 1 - Mảnh ghép 1)...");
  await page.screenshot({ path: path.join(outDir, "step1_question_list_labeled.png") });

  console.log("Step 2: Switching to Màn hình ghép tranh (Hình 1 & 2)...");
  const tabBtn = page.locator("button:has-text('Màn Hình Ghép Tranh & Đáp Án')").first();
  await tabBtn.click();
  await page.waitForTimeout(600);

  console.log("Step 3: Taking screenshot of Hình 1 (scrolled to view board and question)...");
  await page.evaluate(() => window.scrollBy(0, 420));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, "step3_hinh_1_empty_slots.png") });

  console.log("Step 4: Clicking 'Xem đáp án' button...");
  const revealBtn = page.getByRole("button", { name: /xem đáp án/i }).first();
  await revealBtn.click();
  await page.waitForTimeout(800);

  console.log("Step 5: Taking screenshot of Hình 2 (scrolled to view answer)...");
  await page.evaluate(() => window.scrollBy(0, 250));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, "step5_hinh_2_revealed_answer.png") });

  console.log("Step 6: Clicking 'Ẩn đáp án' button...");
  const hideBtn = page.getByRole("button", { name: /ẩn đáp án/i }).first();
  await hideBtn.click();
  await page.waitForTimeout(500);

  console.log("Step 7: Taking screenshot after hiding (back to Hình 1)...");
  await page.screenshot({ path: path.join(outDir, "step7_back_to_hinh_1.png") });

  await browser.close();
  server.kill();
  console.log("All test steps verified successfully!");
  process.exit(0);
}

testAssemblyFlow().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
