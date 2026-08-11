import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

test("standalone player and host scenes render without a black fallback", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const role of ["player", "host"]) {
    await page.goto(`http://127.0.0.1:5173/rpg/index.html?role=${role}&id=tester&name=Lan`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("canvas[data-rendered='true']");
    assert.equal(await page.locator("#game-status").isVisible(), true);
    assert.notEqual(await page.locator("#game-status").innerText(), "");
  }
  assert.deepEqual(errors, []);
  await browser.close();
});

test("host scene does not emit collision mutations", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5173/rpg/index.html?role=host&id=tester&name=Lan", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("canvas[data-rendered='true']");
  const messages = await page.evaluate(async () => {
    const sent = [];
    window.parent.postMessage = (message) => sent.push(message);
    window.dispatchEvent(new MessageEvent("message", {
      data: {
        type: "GAME_SNAPSHOT",
        phase: "playing",
        players: {},
        items: { book_1: { id: "book_1", kind: "item", x: 480, y: 270 } },
        hazards: {},
        npcs: {},
        gates: {},
      },
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return sent;
  });
  assert.deepEqual(messages, []);
  await browser.close();
});
