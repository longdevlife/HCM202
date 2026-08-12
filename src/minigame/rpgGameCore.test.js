import test from "node:test";
import assert from "node:assert/strict";
import {
  parseGameOptions,
  normalizeSnapshot,
  movePlayer,
  circlesOverlap,
  collisionMessage,
  interpolatePosition,
  isEntityResolvedForPlayer,
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

test("movePlayer is frame-rate independent and stays inside bounds", () => {
  const moved = movePlayer({ x: 20, y: 20 }, { right: true }, 0.5, { width: 100, height: 80 });
  assert.equal(moved.x, 80);
  assert.equal(moved.y, 20);
  assert.equal(movePlayer({ x: 90, y: 20 }, { right: true }, 1, { width: 100, height: 80 }).x, 88);
});

test("interpolatePosition moves toward a target and clamps alpha", () => {
  assert.deepEqual(
    interpolatePosition({ x: 0, y: 0 }, { x: 100, y: 40, direction: "right" }, 0.25),
    { x: 25, y: 10, direction: "right" },
  );
  assert.equal(interpolatePosition({ x: 0, y: 0 }, { x: 100, y: 40 }, 2).x, 100);
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

test("entity claim maps resolve rewards only for the player who claimed them", () => {
  const item = { id: "b1", kind: "item", claimedBy: { p1: 111 } };
  const gate = { id: "g1", kind: "gate", completedBy: { p2: 222 } };

  assert.equal(isEntityResolvedForPlayer(item, "p1"), true);
  assert.equal(isEntityResolvedForPlayer(item, "p2"), false);
  assert.equal(isEntityResolvedForPlayer(gate, "p2"), true);
  assert.equal(isEntityResolvedForPlayer(gate, "p1"), false);
});
