import test from "node:test";
import assert from "node:assert/strict";

import {
  applyPhaseOneGate,
  applyPhaseTwoGate,
  applyPlayerDelta,
  isValidGameStatus,
  normalizeGameState,
} from "./gameStateUtils.js";

test("normalizeGameState resets legacy playing status to waiting", () => {
  assert.deepEqual(normalizeGameState({ status: "playing", currentQuestion: 0 }), {
    status: "waiting",
  });
});

test("isValidGameStatus accepts the current minigame flow only", () => {
  assert.equal(isValidGameStatus("phase_2"), true);
  assert.equal(isValidGameStatus("situation_1"), true);
  assert.equal(isValidGameStatus("playing"), false);
});

test("applyPlayerDelta applies score and capital atomically without going below zero", () => {
  const player = { name: "An", score: 30, capital: 400_000, isBankrupt: false };

  assert.deepEqual(applyPlayerDelta(player, { score: -75, capital: -500_000 }), {
    name: "An",
    score: 0,
    capital: 0,
    isBankrupt: true,
  });
});

test("applyPlayerDelta keeps bankruptcy sticky after later gains", () => {
  const player = { name: "Binh", score: 0, capital: 0, isBankrupt: true };

  assert.deepEqual(applyPlayerDelta(player, { score: 20, capital: 300_000 }), {
    name: "Binh",
    score: 20,
    capital: 300_000,
    isBankrupt: true,
  });
});

// === Phase 1 hard gate: require 5 orders AND 2 reviews ===

test("applyPhaseOneGate eliminates players missing reviews even with enough orders", () => {
  const player = {
    name: "An",
    score: 100,
    capital: 10_000_000,
    progress: { phase_1: { order: 5, review: 1 } },
    isBankrupt: false,
  };

  const result = applyPhaseOneGate(player);
  assert.equal(result.isBankrupt, true);
  assert.equal(result.eliminatedReason, "Không đạt 5 đơn hàng và 2 review ở Phase 1");
});

test("applyPhaseOneGate eliminates players missing orders even with enough reviews", () => {
  const player = {
    name: "Binh",
    score: 100,
    capital: 10_000_000,
    progress: { phase_1: { order: 4, review: 3 } },
    isBankrupt: false,
  };

  const result = applyPhaseOneGate(player);
  assert.equal(result.isBankrupt, true);
  assert.equal(result.eliminatedReason, "Không đạt 5 đơn hàng và 2 review ở Phase 1");
});

test("applyPhaseOneGate qualifies players with 5 orders and 2 reviews", () => {
  const player = {
    name: "Chi",
    score: 120,
    capital: 12_000_000,
    progress: { phase_1: { order: 5, review: 2 } },
    isBankrupt: false,
  };

  const result = applyPhaseOneGate(player);
  assert.equal(result.isBankrupt, false);
  assert.equal(result.phaseOneQualified, true);
});

test("applyPhaseOneGate eliminates players with zero progress", () => {
  const player = {
    name: "Dung",
    score: 50,
    capital: 5_000_000,
    progress: {},
    isBankrupt: false,
  };

  const result = applyPhaseOneGate(player);
  assert.equal(result.isBankrupt, true);
  assert.equal(result.eliminatedReason, "Không đạt 5 đơn hàng và 2 review ở Phase 1");
});

// === Phase 2 gate: loyal customer ===

test("applyPhaseTwoGate eliminates players who do not find the loyal customer", () => {
  const player = {
    name: "Em",
    score: 80,
    capital: 8_000_000,
    progress: { phase_2: {} },
    isBankrupt: false,
  };

  const result = applyPhaseTwoGate(player);
  assert.equal(result.isBankrupt, true);
  assert.equal(result.eliminatedReason, "Không tìm được khách ruột trong 60 giây");
  assert.equal(result.phaseTwoQualified, false);
});

test("applyPhaseTwoGate qualifies players who find the loyal customer", () => {
  const player = {
    name: "Phuc",
    score: 90,
    capital: 9_000_000,
    progress: { phase_2: { loyal_customer_found: 1 } },
    isBankrupt: false,
  };

  const result = applyPhaseTwoGate(player);
  assert.equal(result.isBankrupt, false);
  assert.equal(result.phaseTwoQualified, true);
});

test("applyPhaseTwoGate handles null progress gracefully", () => {
  const player = {
    name: "Giang",
    score: 50,
    capital: 5_000_000,
    isBankrupt: false,
  };

  const result = applyPhaseTwoGate(player);
  assert.equal(result.isBankrupt, true);
  assert.equal(result.phaseTwoQualified, false);
});
