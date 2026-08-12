import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRpgSnapshot,
  createMarketEventEntities,
  createPhaseWorld,
  isRpgMessage,
  mergePlayerPositions,
  normalizePlayerMove,
  resolveCanonicalHazard,
} from "./rpgBridge.js";
import { PHASE_CONFIGS } from "./situations.js";

const config = {
  maxBooks: 3,
  trapCount: 2,
  hazards: [{ type: "waste", score: -20, integrity: -10, message: "Lãng phí" }],
  bookReward: { type: "transparency", score: 35, integrity: 5, message: "+ Minh bạch", color: "#26c6da" },
};

const itemTypeCounts = (world) => Object.values(world.books).reduce((counts, item) => ({
  ...counts,
  [item.type]: (counts[item.type] || 0) + 1,
}), {});

test("phase one world makes every configured progress goal reachable", () => {
  const world = createPhaseWorld("phase_1", PHASE_CONFIGS.phase_1, 101);
  const counts = itemTypeCounts(world);

  assert.equal(Object.keys(world.books).length, PHASE_CONFIGS.phase_1.maxBooks);
  assert.ok(counts.case_file >= 2);
  assert.ok(counts.positive_feedback >= 1);
});

test("phase two world makes every configured progress goal reachable", () => {
  const world = createPhaseWorld("phase_2", PHASE_CONFIGS.phase_2, 202);
  const counts = itemTypeCounts(world);

  assert.equal(Object.keys(world.books).length, PHASE_CONFIGS.phase_2.maxBooks);
  assert.ok(counts.integrity_item >= 2);
  assert.ok(counts.transparency >= 1);
});

test("phase three world makes all item prerequisites and its gate reachable", () => {
  const world = createPhaseWorld("phase_3", PHASE_CONFIGS.phase_3, 303);
  const counts = itemTypeCounts(world);

  assert.equal(Object.keys(world.books).length, PHASE_CONFIGS.phase_3.maxBooks);
  assert.ok(counts.transparency >= 1);
  assert.ok(counts.accountability >= 1);
  assert.ok(counts.serve_people >= 1);
  assert.equal(Object.values(world.gates).filter(({ type }) => type === "public_center").length, 1);
});

test("every configured host event creates matching canonical world entities", () => {
  const cases = [
    ["case_peak", "phase_1", "books", { type: "case_file", score: 30, integrity: 0 }],
    ["citizen_support", "phase_1", "npcs", { type: "public_support", score: 50, integrity: 5 }],
    ["feedback_wave", "phase_1", "books", { type: "positive_feedback", score: 50, integrity: 0 }],
    ["surprise_inspection", "phase_2", "books", { type: "transparency", score: 40, integrity: 10 }],
    ["citizen_feedback", "phase_2", "npcs", { type: "citizen_feedback", score: 100, integrity: 10 }],
    ["recovery_chance", "phase_3", "books", { type: "serve_people", score: 35, integrity: 5 }],
  ];

  for (const [eventType, phaseKey, collection, reward] of cases) {
    const entities = createMarketEventEntities(eventType, phaseKey, PHASE_CONFIGS[phaseKey], 404);
    const created = Object.values(entities?.[collection] || {});
    assert.ok(created.length > 0, `${eventType} should create ${collection}`);
    assert.ok(created.every((entity) => (
      entity.type === reward.type
      && entity.score === reward.score
      && entity.integrity === reward.integrity
    )));
  }

  const pressure = createMarketEventEntities("final_pressure", "phase_3", PHASE_CONFIGS.phase_3, 404);
  assert.deepEqual(
    Object.values(pressure?.traps || {}).map(({ type }) => type),
    ["personal_gain", "group_interest"],
  );
});

test("host event entities are deterministic for a phase, event, and seed", () => {
  const first = createMarketEventEntities("feedback_wave", "phase_1", PHASE_CONFIGS.phase_1, 505);
  const second = createMarketEventEntities("feedback_wave", "phase_1", PHASE_CONFIGS.phase_1, 505);

  assert.ok(first);
  assert.deepEqual(first, second);
});

test("createPhaseWorld creates deterministic bounded items and hazards", () => {
  const first = createPhaseWorld("phase_3", config, 42);
  const second = createPhaseWorld("phase_3", config, 42);
  assert.deepEqual(first, second);
  assert.equal(Object.keys(first.books).length, 3);
  assert.equal(Object.keys(first.traps).length, 2);
  assert.ok(Object.values(first.books).every(({ x, y }) => x >= 40 && x <= 920 && y >= 40 && y <= 500));
});

test("generated items preserve phase reward metadata", () => {
  const world = createPhaseWorld("phase_2", config, 9);
  assert.ok(Object.values(world.books).every((item) => item.type === "transparency"));
  assert.ok(Object.values(world.traps).every((hazard) => hazard.kind === "hazard" && hazard.integrity === -10));
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

test("buildRpgSnapshot exposes persisted player positions to the canvas", () => {
  const snapshot = buildRpgSnapshot(
    { status: "phase_1" },
    { players: { p1: { position: { x: 10, y: 20 } } } },
  );
  assert.equal(snapshot.players.p1.x, 10);
  assert.equal(snapshot.players.p1.y, 20);
});

test("buildRpgSnapshot overlays valid positions over legacy player coordinates", () => {
  const snapshot = buildRpgSnapshot(
    { status: "phase_1" },
    { players: { p1: { name: "Lan", position: { x: 100, y: 100 } } } },
    { p1: { x: 200, y: 220, direction: "right" } },
  );

  assert.equal(snapshot.players.p1.x, 200);
  assert.equal(snapshot.players.p1.y, 220);
  assert.equal(snapshot.players.p1.direction, "right");
});

test("mergePlayerPositions ignores malformed position overrides", () => {
  const merged = mergePlayerPositions(
    { p1: { position: { x: 100, y: 100 } } },
    { p1: { x: "bad", y: 220 }, p2: { x: 20, y: 30 } },
  );

  assert.deepEqual(merged.p1.position, { x: 100, y: 100 });
  assert.equal(merged.p2, undefined);
});

test("movement messages require finite coordinates and a cardinal direction", () => {
  assert.equal(isRpgMessage({ type: "PLAYER_MOVE", x: 12, y: 18, direction: "up" }), true);
  assert.equal(isRpgMessage({ type: "PLAYER_MOVE", x: 12, y: 18, direction: undefined }), false);
  assert.equal(isRpgMessage({ type: "PLAYER_MOVE", x: "12", y: 18 }), false);
  assert.equal(isRpgMessage({ type: "PLAYER_MOVE", x: 12, y: 18, direction: "diagonal" }), false);
  assert.deepEqual(normalizePlayerMove({ x: -50, y: 900, direction: "left" }), { x: 12, y: 528, direction: "left" });
});

test("isRpgMessage accepts gameplay contracts and rejects unknown types", () => {
  assert.equal(isRpgMessage({ type: "NHAT_SACH", bookId: "b1" }), true);
  assert.equal(isRpgMessage({ type: "DINH_BAY", hazard: { id: "h1", type: "waste" } }), true);
  assert.equal(isRpgMessage({ type: "DINH_BAY", hazard: { type: "waste", score: 9999 } }), false);
  assert.equal(isRpgMessage({ type: "DELETE_ALL_PLAYERS" }), false);
});

test("hazard resolution keeps canonical Firebase penalties instead of iframe scores", () => {
  const reported = { id: "h1", type: "waste", score: 9999, integrity: 9999 };
  const canonical = { id: "h1", type: "waste", score: -30, integrity: -10 };

  const resolved = resolveCanonicalHazard(reported, canonical);
  assert.equal(resolved.score, -30);
  assert.equal(resolved.integrity, -10);
  assert.equal(resolveCanonicalHazard(reported, { ...canonical, id: "h2" }), null);
});
