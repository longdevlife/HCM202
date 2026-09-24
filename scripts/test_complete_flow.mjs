import { spawn } from "child_process";
import playwright from "playwright";
import path from "path";
import fs from "fs";

async function testCompleteGame() {
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

  // Answer all remaining questions:
  // Answers: 1:B, 2:C, 3:B, 4:A, 5:B, 6:C, 7:D, 8:A, 9:A
  const answers = {
    1: "B",
    2: "C",
    3: "B",
    4: "A",
    5: "B",
    6: "C",
    7: "D",
    8: "A",
    9: "A",
  };

  for (let q = 1; q <= 9; q++) {
    console.log(`Answering question ${q}...`);
    // Click outside button if exists, or click from board
    const outsideBtn = page.locator(`button:has-text('Câu ${q}')`).first();
    const isVisible = await outsideBtn.isVisible().catch(() => false);
    if (isVisible) {
      await outsideBtn.click();
    } else {
      const boardCell = page.locator(`button:has-text('Mảnh ${q}')`).first();
      await boardCell.click();
    }
    await page.waitForTimeout(500);

    // Pick answer
    const optLetter = answers[q];
    const optBtn = page.locator(`button:has(span:text-is('${optLetter}'))`).first();
    await optBtn.click();
    await page.waitForTimeout(200);

    // Confirm
    await page.locator("button:has-text('Xác Nhận Đáp Án')").click();
    await page.waitForTimeout(300);

    // Reveal piece
    await page.locator(`button:has-text('Xem Mảnh Ghép Số ${q}')`).click();
    await page.waitForTimeout(600);
  }

  console.log("Taking screenshot of fully unlocked board...");
  await page.screenshot({ path: path.join(outDir, "all_9_unlocked.png") });

  console.log("Clicking mystery reveal button to view complete artwork modal...");
  const revealBtn = page.locator("button:has-text('BẤM VÀO ĐÂY ĐỂ XEM BỨC TRANH HOÀN CHỈNH')");
  await revealBtn.click();
  await page.waitForTimeout(800);

  console.log("Taking screenshot of mystery reveal modal...");
  await page.screenshot({ path: path.join(outDir, "mystery_modal_complete.png") });

  await browser.close();
  server.kill();
  console.log("Test completed successfully!");
  process.exit(0);
}

testCompleteGame().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
