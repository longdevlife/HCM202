import test from "node:test";
import assert from "node:assert/strict";
import {
  parseGameOptions,
  normalizeSnapshot,
  movePlayer,
  interpolatePosition,
} from "../../public/rpg/game-core.js";

test("parseGameOptions accepts only player and host roles", () => {
  assert.deepEqual(parseGameOptions("?role=player&id=p1&name=Lan&color=%2300aaff"), {
    role: "player", playerId: "p1", playerName: "Lan", color: "#00aaff",
  });
  assert.equal(parseGameOptions("?role=admin").role, "player");
});

test("normalizeSnapshot keeps valid player records and ignores legacy collections", () => {
  const result = normalizeSnapshot({
    players: { p1: { x: "bad", y: 40 }, p2: { x: 40, y: 30, name: "Lan" } },
    items: { old: { x: 20, y: 20 } },
  });
  assert.deepEqual(result.players, { p1: { x: "bad", y: 40 }, p2: { x: 40, y: 30, name: "Lan" } });
  assert.equal(Object.hasOwn(result, "items"), false);
});

test("movePlayer is frame-rate independent and stays inside bounds", () => {
  const moved = movePlayer({ x: 20, y: 20 }, { right: true }, 0.5, { width: 100, height: 80 });
  assert.equal(moved.x, 88);
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
