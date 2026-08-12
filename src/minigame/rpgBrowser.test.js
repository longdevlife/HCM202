import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

async function withBrowser(run) {
  const browser = await chromium.launch({ headless: true });
  try {
    await run(await browser.newPage());
  } finally {
    await browser.close();
  }
}

async function openScene(page, role = "player") {
  await page.goto(`http://127.0.0.1:5173/rpg/index.html?role=${role}&id=tester&name=Lan`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("canvas[data-rendered='true']");
}

async function collisionMessages(page, snapshot, source) {
  return page.evaluate(async ({ snapshot: incoming, useParentSource }) => {
    const sent = [];
    window.parent.postMessage = (message) => sent.push(message);
    window.dispatchEvent(new MessageEvent("message", {
      data: incoming,
      ...(useParentSource ? { source: window.parent } : {}),
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return sent;
  }, { snapshot, useParentSource: source === "parent" });
}

const collisionSnapshot = (kind, id) => ({
  type: "GAME_SNAPSHOT",
  phase: "playing",
  players: {},
  items: {},
  hazards: {},
  npcs: kind === "npc" ? { [id]: { id, kind, x: 480, y: 270 } } : {},
  gates: kind === "gate" ? { [id]: { id, kind, x: 480, y: 270 } } : {},
});

test("standalone player and host scenes render without a black fallback", async () => {
  await withBrowser(async (page) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const role of ["player", "host"]) {
      await openScene(page, role);
      assert.equal(await page.locator("#game-status").isVisible(), true);
      assert.notEqual(await page.locator("#game-status").innerText(), "");
    }
    assert.deepEqual(errors, []);
  });
});

test("host scene does not emit collision mutations", async () => {
  await withBrowser(async (page) => {
    await openScene(page, "host");
    const messages = await collisionMessages(page, {
      ...collisionSnapshot("npc", "npc_1"),
      items: { book_1: { id: "book_1", kind: "item", x: 480, y: 270 } },
    }, "parent");
    assert.deepEqual(messages, []);
  });
});

test("empty host scene does not draw a phantom local player", async () => {
  await withBrowser(async (page) => {
    await openScene(page, "host");
    const centerPixel = await page.locator("#game-canvas").evaluate((canvas) => (
      Array.from(canvas.getContext("2d").getImageData(480, 270, 1, 1).data)
    ));
    assert.notDeepEqual(centerPixel, [0, 170, 255, 255]);
  });
});

test("player emits an overlapping NPC collision only once", async () => {
  await withBrowser(async (page) => {
    await openScene(page);
    const messages = await collisionMessages(page, collisionSnapshot("npc", "npc_1"), "parent");
    assert.deepEqual(messages, [{ type: "FOUND_LOYAL_CUSTOMER", npcId: "npc_1" }]);
  });
});

test("player emits an overlapping gate collision only once", async () => {
  await withBrowser(async (page) => {
    await openScene(page);
    const messages = await collisionMessages(page, collisionSnapshot("gate", "gate_1"), "parent");
    assert.deepEqual(messages, [{ type: "ESCAPED_GATE", gateId: "gate_1" }]);
  });
});

test("scene ignores a snapshot that does not originate from its parent", async () => {
  await withBrowser(async (page) => {
    await openScene(page);
    const messages = await collisionMessages(page, {
      ...collisionSnapshot("npc", "npc_1"),
      items: { book_1: { id: "book_1", kind: "item", x: 480, y: 270 } },
    }, "other");
    assert.deepEqual(messages, []);
  });
});

test("player movement reports its active direction to the parent", async () => {
  await withBrowser(async (page) => {
    await openScene(page);
    const movement = await page.evaluate(async () => {
      const sent = [];
      window.parent.postMessage = (message) => sent.push(message);
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
      await new Promise((resolve) => setTimeout(resolve, 150));
      window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" }));
      return sent.find((message) => message.type === "PLAYER_MOVE");
    });
    assert.equal(movement.direction, "up");
  });
});
