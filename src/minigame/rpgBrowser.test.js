import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../public");

let testServer = null;
let testServerPort = 0;

function startTestServer() {
  return new Promise((resolve) => {
    if (testServer) return resolve(testServerPort);

    const mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    };

    testServer = http.createServer((req, res) => {
      const urlPath = req.url.split("?")[0];
      const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, "");
      const filePath = path.join(publicDir, safePath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, {
          "Content-Type": mimeTypes[ext] || "application/octet-stream",
          "Access-Control-Allow-Origin": "*",
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    testServer.listen(0, "127.0.0.1", () => {
      testServerPort = testServer.address().port;
      resolve(testServerPort);
    });
  });
}

test.after(() => {
  if (testServer) {
    testServer.close();
  }
});

async function withBrowser(run) {
  const previous = browserQueue;
  let release;
  browserQueue = new Promise((resolve) => {
    release = resolve;
  });
  await previous;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    await run(await browser.newPage());
  } finally {
    await browser?.close();
    release();
  }
}

let browserQueue = Promise.resolve();

async function openScene(page, role = "player") {
  const port = await startTestServer();
  await page.addInitScript(() => {
    window.__RPG_TEST_HOOK__ = true;
  });
  await page.goto(`http://127.0.0.1:${port}/rpg/index.html?role=${role}&id=tester&name=Lan`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector("canvas[data-rendered='true']");
}

test("standalone policy player and host scenes render without a black fallback", async () => {
  await withBrowser(async (page) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const role of ["player", "host"]) {
      await openScene(page, role);
      assert.equal(await page.locator("canvas[data-rendered='true']").count(), 1);
      const centerPixel = await page.locator("#game-canvas").evaluate((canvas) => (
        Array.from(canvas.getContext("2d").getImageData(480, 270, 1, 1).data)
      ));
      assert.notDeepEqual(centerPixel, [0, 0, 0, 255]);
    }
    assert.deepEqual(errors, []);
  });
});

test("host scene does not emit policy station mutations", async () => {
  await withBrowser(async (page) => {
    await openScene(page, "host");
    const messages = await page.evaluate(async () => {
      const sent = [];
      window.parent.postMessage = (message) => sent.push(message);
      window.dispatchEvent(new MessageEvent("message", {
        data: {
          type: "POLICY_GAME_SNAPSHOT",
          phaseId: "phase_1",
          phaseStatus: "active",
          station: { id: "doan_xa_crisis", phaseId: "phase_1", x: 480, y: 270, radius: 40 },
          taskCompletedByPlayer: false,
          players: {},
        },
        source: window.parent,
      }));
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      await new Promise((resolve) => setTimeout(resolve, 40));
      return sent.filter((message) => message.type === "POLICY_STATION_INTERACT");
    });
    assert.deepEqual(messages, []);
  });
});

test("player emits one policy station interaction for one task", async () => {
  await withBrowser(async (page) => {
    await openScene(page, "player");
    await page.evaluate(() => {
      window.__policyMessages = [];
      window.parent.postMessage = (message) => window.__policyMessages.push(message);
      const snapshot = {
        type: "POLICY_GAME_SNAPSHOT",
        phaseId: "phase_1",
        phaseStatus: "active",
        station: {
          id: "doan_xa_crisis",
          phaseId: "phase_1",
          label: "Test station",
          shortLabel: "Test station",
          x: 480,
          y: 270,
          radius: 40,
        },
        taskCompletedByPlayer: false,
        players: {
          tester: { id: "tester", name: "Lan", x: 480, y: 270, direction: "down" },
        },
      };
      window.dispatchEvent(new MessageEvent("message", { data: snapshot, source: window.parent }));
    });
    await page.keyboard.press("Space");
    await page.keyboard.press("Space");
    const messages = await page.evaluate(() => (
      window.__policyMessages.filter((message) => message.type === "POLICY_STATION_INTERACT")
    ));

    assert.deepEqual(messages, [{
      type: "POLICY_STATION_INTERACT",
      phaseId: "phase_1",
      stationId: "doan_xa_crisis",
    }]);
  });
});

test("player ignores a snapshot that does not originate from its parent", async () => {
  await withBrowser(async (page) => {
    await openScene(page, "player");
    const messages = await page.evaluate(async () => {
      const sent = [];
      window.parent.postMessage = (message) => sent.push(message);
      window.dispatchEvent(new MessageEvent("message", {
        data: {
          type: "POLICY_GAME_SNAPSHOT",
          phaseId: "phase_1",
          station: { id: "doan_xa_crisis", phaseId: "phase_1", x: 480, y: 270, radius: 40 },
          taskCompletedByPlayer: false,
          players: { tester: { id: "tester", x: 480, y: 270 } },
        },
        source: null,
      }));
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
      await new Promise((resolve) => setTimeout(resolve, 40));
      return sent.filter((message) => message.type === "POLICY_STATION_INTERACT");
    });
    assert.deepEqual(messages, []);
  });
});

test("player applies position deltas without emitting gameplay mutations", async () => {
  await withBrowser(async (page) => {
    await openScene(page);
    const result = await page.evaluate(async () => {
      const sent = [];
      window.parent.postMessage = (message) => sent.push(message);
      const canvas = document.querySelector("#game-canvas");
      const dispatch = (position) => window.dispatchEvent(new MessageEvent("message", {
        data: { type: "PLAYER_POSITION", playerId: "remote_1", position },
        source: window.parent,
      }));

      dispatch({ x: 420, y: 230, direction: "right" });
      dispatch(null);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      return {
        updates: canvas.dataset.positionUpdates,
        mutations: sent.filter((message) => message.type === "POLICY_STATION_INTERACT"),
      };
    });

    assert.equal(result.updates, "2");
    assert.deepEqual(result.mutations, []);
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
