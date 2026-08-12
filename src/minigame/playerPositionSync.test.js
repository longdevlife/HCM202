import test from "node:test";
import assert from "node:assert/strict";
import { applyPositionEvent, normalizePosition } from "./playerPositionSync.js";

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
