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
