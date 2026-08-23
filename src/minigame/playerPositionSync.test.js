import test from "node:test";
import assert from "node:assert/strict";
import {
  applyPositionEvent,
  createPositionWriter,
  normalizePosition,
} from "./playerPositionSync.js";

test("normalizePosition accepts finite coordinates and rejects malformed values", () => {
  assert.deepEqual(normalizePosition({ x: 12, y: 18, direction: "left" }), {
    x: 12,
    y: 18,
    direction: "left",
  });
  assert.equal(normalizePosition({ x: "12", y: 18 }), null);
});

test("applyPositionEvent adds, changes, and removes one player position", () => {
  const added = applyPositionEvent({}, "added", "p1", { x: 10, y: 20 });
  const changed = applyPositionEvent(added, "changed", "p1", { x: 30, y: 40 });
  const removed = applyPositionEvent(changed, "removed", "p1", null);

  assert.deepEqual(changed.p1, { x: 30, y: 40 });
  assert.deepEqual(removed, {});
});

test("createPositionWriter falls back to legacy player storage after permission denial", async () => {
  const writes = [];
  const writer = createPositionWriter({
    writeModern: async (move) => {
      writes.push(`positions:${move.x}`);
      throw { code: "PERMISSION_DENIED" };
    },
    writeLegacy: async (move) => {
      writes.push(`players:${move.x}`);
    },
  });

  assert.equal(await writer({ x: 10, y: 20, direction: "right" }), "legacy");
  assert.equal(await writer({ x: 30, y: 40, direction: "right" }), "legacy");
  assert.deepEqual(writes, ["positions:10", "players:10", "players:30"]);
});

test("createPositionWriter exposes a write method for iframe message handlers", async () => {
  let receivedMove = null;
  const writer = createPositionWriter({
    writeModern: async (move) => {
      receivedMove = move;
    },
    writeLegacy: async () => {},
  });

  assert.equal(typeof writer.write, "function");
  await writer.write({ x: 12, y: 24, direction: "up" });
  assert.deepEqual(receivedMove, { x: 12, y: 24, direction: "up" });
});
