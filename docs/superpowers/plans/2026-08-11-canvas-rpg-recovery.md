# Canvas RPG Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the missing `/rpg/index.html` target with a working native Canvas 2D minigame and connect it to the existing React/Firebase state without changing scoring rules.

**Architecture:** A dependency-free static canvas runtime renders immediately and exchanges a small, validated `postMessage` protocol with the React parent. Pure helpers cover movement, collisions, world generation, and message normalization; React remains the only Firebase owner and forwards world snapshots to player and host iframes.

**Tech Stack:** React 18, Vite 4, Firebase Realtime Database, native Canvas 2D, browser `postMessage`, Node test runner, Playwright.

## Global Constraints

- Preserve all pre-existing uncommitted minigame changes and do not stage them as part of implementation commits.
- Do not add Phaser, another game engine, or any CDN dependency.
- Keep existing scoring and event names: `NHAT_SACH`, `DINH_BAY`, `FOUND_LOYAL_CUSTOMER`, and `ESCAPED_GATE`.
- The canvas must render a useful fallback before Firebase data arrives.
- Host mode is read-only and must never emit gameplay mutations.
- Validate `event.source === iframe.contentWindow` before accepting iframe messages.

---

### Task 1: Deterministic Canvas Game Core

**Files:**
- Create: `public/rpg/game-core.js`
- Create: `src/minigame/rpgGameCore.test.js`

**Interfaces:**
- Produces: `parseGameOptions(search)`, `normalizeSnapshot(value)`, `movePlayer(player, input, deltaSeconds, bounds)`, `circlesOverlap(a, b)`, and `collisionMessage(entity)`.
- Consumes: Plain JSON only; no DOM, Canvas, React, or Firebase dependency.

- [ ] **Step 1: Write failing tests for query parsing and safe defaults**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  parseGameOptions,
  normalizeSnapshot,
  movePlayer,
  circlesOverlap,
  collisionMessage,
} from "../../public/rpg/game-core.js";

test("parseGameOptions accepts only player and host roles", () => {
  assert.deepEqual(parseGameOptions("?role=player&id=p1&name=Lan&color=%2300aaff"), {
    role: "player", playerId: "p1", playerName: "Lan", color: "#00aaff",
  });
  assert.equal(parseGameOptions("?role=admin").role, "player");
});

test("normalizeSnapshot rejects malformed collections and coordinates", () => {
  const result = normalizeSnapshot({ players: { p1: { x: "bad", y: 40 } }, items: null });
  assert.deepEqual(result.players, {});
  assert.deepEqual(result.items, {});
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test src/minigame/rpgGameCore.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `public/rpg/game-core.js`.

- [ ] **Step 3: Add failing movement, bounds, collision, and event-mapping tests**

```js
test("movePlayer is frame-rate independent and stays inside bounds", () => {
  const moved = movePlayer({ x: 20, y: 20 }, { right: true }, 0.5, { width: 100, height: 80 });
  assert.equal(moved.x, 80);
  assert.equal(moved.y, 20);
  assert.equal(movePlayer({ x: 90, y: 20 }, { right: true }, 1, { width: 100, height: 80 }).x, 88);
});

test("circlesOverlap detects contact", () => {
  assert.equal(circlesOverlap({ x: 10, y: 10, radius: 8 }, { x: 25, y: 10, radius: 8 }), true);
  assert.equal(circlesOverlap({ x: 10, y: 10, radius: 8 }, { x: 40, y: 10, radius: 8 }), false);
});

test("collisionMessage preserves the parent event contract", () => {
  assert.deepEqual(collisionMessage({ id: "b1", kind: "item" }), { type: "NHAT_SACH", bookId: "b1" });
  assert.equal(collisionMessage({ id: "h1", kind: "hazard", type: "waste" }).type, "DINH_BAY");
  assert.equal(collisionMessage({ id: "n1", kind: "npc" }).type, "FOUND_LOYAL_CUSTOMER");
  assert.equal(collisionMessage({ id: "g1", kind: "gate" }).type, "ESCAPED_GATE");
});
```

- [ ] **Step 4: Implement the minimal pure core**

Implement URL decoding with safe fallbacks, collection filtering, 120-world-units-per-second movement, a 12-unit player radius, Euclidean circle overlap, and the exact event mapping asserted above. Export all five functions as ES modules.

- [ ] **Step 5: Run the focused and existing tests**

Run: `node --test src/minigame/rpgGameCore.test.js src/minigame/gameStateUtils.test.js`

Expected: all tests PASS.

- [ ] **Step 6: Commit only the new core files**

```powershell
git add -- public/rpg/game-core.js src/minigame/rpgGameCore.test.js
git commit -m "feat: add deterministic canvas RPG core"
```

---

### Task 2: Parent Bridge and Phase World Generation

**Files:**
- Create: `src/minigame/rpgBridge.js`
- Create: `src/minigame/rpgBridge.test.js`

**Interfaces:**
- Produces: `createPhaseWorld(phaseKey, config, seed)`, `buildRpgSnapshot(gameState, collections)`, `isRpgMessage(value)`, and `normalizePlayerMove(value)`.
- Consumes: `PHASE_CONFIGS`-shaped config objects and Firebase collection snapshots.

- [ ] **Step 1: Write failing world-generation tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { createPhaseWorld, buildRpgSnapshot, isRpgMessage, normalizePlayerMove } from "./rpgBridge.js";

const config = {
  maxBooks: 3,
  trapCount: 2,
  hazards: [{ type: "waste", score: -20, integrity: -10, message: "Lãng phí" }],
  bookReward: { type: "transparency", score: 35, integrity: 5, message: "+ Minh bạch", color: "#26c6da" },
};

test("createPhaseWorld creates deterministic bounded items and hazards", () => {
  const first = createPhaseWorld("phase_3", config, 42);
  const second = createPhaseWorld("phase_3", config, 42);
  assert.deepEqual(first, second);
  assert.equal(Object.keys(first.books).length, 3);
  assert.equal(Object.keys(first.traps).length, 2);
  assert.ok(Object.values(first.books).every(({ x, y }) => x >= 40 && x <= 920 && y >= 40 && y <= 500));
});

test("phase three world includes the public accountability gate", () => {
  const world = createPhaseWorld("phase_3", config, 7);
  assert.equal(Object.keys(world.gates).length, 1);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test src/minigame/rpgBridge.test.js`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `rpgBridge.js`.

- [ ] **Step 3: Add failing protocol validation tests**

```js
test("buildRpgSnapshot maps Firebase names to canvas entity groups", () => {
  const snapshot = buildRpgSnapshot(
    { status: "phase_2" },
    { players: { p1: { x: 10, y: 20 } }, books: { b1: { x: 30, y: 40 } }, traps: {}, npcs: {}, gates: {} },
  );
  assert.equal(snapshot.type, "GAME_SNAPSHOT");
  assert.equal(snapshot.phase, "phase_2");
  assert.equal(snapshot.items.b1.kind, "item");
});

test("movement messages require finite coordinates", () => {
  assert.equal(isRpgMessage({ type: "PLAYER_MOVE", x: 12, y: 18 }), true);
  assert.equal(isRpgMessage({ type: "PLAYER_MOVE", x: "12", y: 18 }), false);
  assert.deepEqual(normalizePlayerMove({ x: -50, y: 900, direction: "left" }), { x: 12, y: 528, direction: "left" });
});
```

- [ ] **Step 4: Implement deterministic generation and protocol helpers**

Use a seeded linear-congruential generator, a 960×540 world, a 40-unit spawn margin, stable Firebase keys (`phase_seed_index`), and collection defaults of `{}`. Copy reward/hazard payloads into generated entities so the existing parent handlers receive current scoring values.

- [ ] **Step 5: Run focused tests**

Run: `node --test src/minigame/rpgBridge.test.js`

Expected: all tests PASS.

- [ ] **Step 6: Commit only the new bridge files**

```powershell
git add -- src/minigame/rpgBridge.js src/minigame/rpgBridge.test.js
git commit -m "feat: define RPG world and bridge protocol"
```

---

### Task 3: Standalone Canvas Scene

**Files:**
- Create: `public/rpg/index.html`
- Create: `public/rpg/game.css`
- Create: `public/rpg/game.js`
- Create: `src/minigame/rpgBrowser.test.js`

**Interfaces:**
- Consumes: exports from `public/rpg/game-core.js` and parent messages defined in Task 2.
- Produces: an immediate canvas scene, `RPG_READY`, throttled `PLAYER_MOVE`, and existing collision events.

- [ ] **Step 1: Write a failing browser smoke test**

```js
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
```

- [ ] **Step 2: Run the browser test against the dev server and verify RED**

Run: `node --test src/minigame/rpgBrowser.test.js`

Expected: FAIL because `/rpg/index.html` still resolves to the Vite application fallback and has no canvas.

- [ ] **Step 3: Implement the HTML shell and accessible status UI**

The HTML must contain `canvas#game-canvas`, `div#game-status[role=status]`, a short controls legend, and `<script type="module" src="./game.js"></script>`. CSS must give the canvas a non-black navy office background and preserve a 16:9 aspect ratio.

- [ ] **Step 4: Implement runtime input, drawing, snapshots, and collision cooldowns**

Implement an animation loop that draws tiled floors, desks, a service counter, labels, entities, and player sprites. Set `canvas.dataset.rendered = "true"` after the first successful frame. Keyboard and D-pad state feed `movePlayer`; player mode posts movement at no more than 10 writes per second, while host mode never posts mutations. Track collected entity IDs and a 1500 ms hazard cooldown.

- [ ] **Step 5: Run core and browser tests**

Run: `node --test src/minigame/rpgGameCore.test.js src/minigame/rpgBrowser.test.js`

Expected: all tests PASS with no browser console/page errors.

- [ ] **Step 6: Commit only the new static scene and smoke test**

```powershell
git add -- public/rpg/index.html public/rpg/game.css public/rpg/game.js src/minigame/rpgBrowser.test.js
git commit -m "feat: render native canvas RPG scene"
```

---

### Task 4: Connect Player Iframe to Firebase State

**Files:**
- Modify: `src/minigame/RpgGamePlay.jsx`
- Test: `src/minigame/rpgBridge.test.js`

**Interfaces:**
- Consumes: `buildRpgSnapshot`, `isRpgMessage`, and `normalizePlayerMove` from `rpgBridge.js`.
- Produces: Firebase-backed snapshots to the iframe and throttled `players/{playerId}/position` updates.

- [ ] **Step 1: Add a failing source/contract test for gameplay messages**

```js
test("isRpgMessage accepts gameplay contracts and rejects unknown types", () => {
  assert.equal(isRpgMessage({ type: "NHAT_SACH", bookId: "b1" }), true);
  assert.equal(isRpgMessage({ type: "DINH_BAY", hazard: { type: "waste" } }), true);
  assert.equal(isRpgMessage({ type: "DELETE_ALL_PLAYERS" }), false);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test src/minigame/rpgBridge.test.js`

Expected: FAIL because the gameplay event allowlist is not yet implemented.

- [ ] **Step 3: Extend the validator minimally and verify GREEN**

Run: `node --test src/minigame/rpgBridge.test.js`

Expected: all tests PASS.

- [ ] **Step 4: Add Firebase subscriptions and iframe readiness handling**

In `RpgGamePlay`, subscribe with `onValue` to `players`, `books`, `traps`, `npcs`, and `gates`; store each collection in one `world` state object. Post `buildRpgSnapshot(gameState, world)` after iframe load, `RPG_READY`, or any world/phase change. Reject messages whose `event.source` is not `iframeRef.current.contentWindow`.

- [ ] **Step 5: Persist normalized movement without flooding Firebase**

On valid `PLAYER_MOVE`, throttle writes to 100 ms and call `update(ref(db, \`players/${playerId}\`), { position, direction })`. Keep the existing gameplay handlers intact and route only validated messages into them.

- [ ] **Step 6: Run unit tests and build**

Run: `node --test src/minigame/rpgBridge.test.js src/minigame/gameStateUtils.test.js`

Run: `npm run build`

Expected: all tests PASS and Vite build exits 0.

- [ ] **Step 7: Preserve the dirty worktree**

Do not commit `RpgGamePlay.jsx`, because it contained user changes before this task. Record its final diff and leave it unstaged for user review.

---

### Task 5: Initialize Worlds and Connect Host Spectator

**Files:**
- Modify: `src/minigame/HostView.jsx`
- Test: `src/minigame/rpgBridge.test.js`

**Interfaces:**
- Consumes: `createPhaseWorld` and `buildRpgSnapshot` from `rpgBridge.js`.
- Produces: Firebase world initialization on phase start and read-only snapshots to the host iframe.

- [ ] **Step 1: Add a failing generation test for phase-specific reward types**

```js
test("generated items preserve phase reward metadata", () => {
  const world = createPhaseWorld("phase_2", config, 9);
  assert.ok(Object.values(world.books).every((item) => item.type === "transparency"));
  assert.ok(Object.values(world.traps).every((hazard) => hazard.kind === "hazard" && hazard.integrity === -10));
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test src/minigame/rpgBridge.test.js`

Expected: FAIL until metadata copying is complete.

- [ ] **Step 3: Complete metadata generation and verify GREEN**

Run: `node --test src/minigame/rpgBridge.test.js`

Expected: all tests PASS.

- [ ] **Step 4: Initialize Firebase world data when Host starts a phase**

Inside `handleStartPhase`, call `createPhaseWorld(phaseKey, config, Date.now())`, then atomically `set` or `update` `books`, `traps`, `npcs`, and `gates` before publishing the active `gameState`. Preserve the existing reset cleanup paths.

- [ ] **Step 5: Subscribe and post spectator snapshots**

Add an iframe ref and subscriptions for `books`, `traps`, `npcs`, and `gates`. Post snapshots after iframe load and every collection/phase change. Do not add a host-side handler for `PLAYER_MOVE` or gameplay events.

- [ ] **Step 6: Run all unit tests and build**

Run: `node --test src/minigame/*.test.js`

Run: `npm run build`

Expected: all tests PASS and Vite build exits 0.

- [ ] **Step 7: Preserve the dirty worktree**

Do not commit `HostView.jsx`, because it contained user changes before this task. Leave the integration diff unstaged and identify it clearly in the final handoff.

---

### Task 6: End-to-End Browser Verification

**Files:**
- Modify if required by evidence only: files from Tasks 1–5

**Interfaces:**
- Verifies the complete static scene and parent integration; produces no new public API.

- [ ] **Step 1: Run the full automated suite**

Run: `node --test src/minigame/*.test.js`

Run: `npm run build`

Expected: all tests PASS; build exits 0.

- [ ] **Step 2: Verify standalone player scene in a browser**

Open `http://127.0.0.1:5173/rpg/index.html?role=player&id=tester&name=Lan&color=%2300aaff`. Confirm meaningful canvas pixels, a visible status badge, keyboard movement, no Vite overlay, and no console error.

- [ ] **Step 3: Verify standalone host scene in a browser**

Open `http://127.0.0.1:5173/rpg/index.html?role=host`. Confirm spectator labeling, rendered office map, no mutation controls, no Vite overlay, and no console error.

- [ ] **Step 4: Verify the integrated minigame iframe target**

Open `http://127.0.0.1:5173/#minigame`; confirm role-selection still renders. Check that requesting `/rpg/index.html` returns the dedicated scene rather than the main Vite fallback. Do not reset shared Firebase game data during verification.

- [ ] **Step 5: Review final scope and worktree**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors; pre-existing user changes remain, new implementation files are accounted for, and only intentional integration edits appear in `HostView.jsx` and `RpgGamePlay.jsx`.
