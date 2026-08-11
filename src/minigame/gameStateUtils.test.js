import test from "node:test";
import assert from "node:assert/strict";

import {
  applyDecisionEffects,
  applyPhaseOneGate,
  applyPhaseTwoGate,
  applyPlayerDelta,
  applyVoteOutcome,
  calculateFinalScore,
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

test("applyPlayerDelta applies score and integrity without going below zero", () => {
  const player = { name: "An", score: 30, integrity: 10, status: "active" };

  assert.deepEqual(applyPlayerDelta(player, { score: -75, integrity: -15 }), {
    name: "An",
    score: 0,
    integrity: 0,
    status: "suspended",
    recoveryTasksRemaining: 2,
  });
});

test("applyPlayerDelta lets suspended players recover through integrity gains", () => {
  const player = { name: "Binh", score: 0, integrity: 0, status: "suspended", recoveryTasksRemaining: 1 };

  assert.deepEqual(applyPlayerDelta(player, { score: 20, integrity: 10, recoveryTask: true }), {
    name: "Binh",
    score: 20,
    integrity: 10,
    status: "active",
    recoveryTasksRemaining: 0,
  });
});

// === Phase 1 hard gate: require 5 case files AND 2 positive feedback ===

test("applyPhaseOneGate flags players missing feedback without permanently eliminating them", () => {
  const player = {
    name: "An",
    score: 100,
    integrity: 100,
    progress: { phase_1: { case_file: 5, positive_feedback: 1 } },
    status: "active",
  };

  const result = applyPhaseOneGate(player);
  assert.equal(result.status, "needs_recovery");
  assert.equal(result.integrity, 90);
  assert.equal(result.eliminatedReason, undefined);
  assert.equal(result.phaseOneQualified, false);
  assert.equal(result.phaseOneMessage, "Chưa đạt 5 hồ sơ đúng hạn và 2 phản hồi tích cực ở Phase 1");
});

test("applyPhaseOneGate flags players missing case files even with enough feedback", () => {
  const player = {
    name: "Binh",
    score: 100,
    integrity: 100,
    progress: { phase_1: { case_file: 4, positive_feedback: 3 } },
    status: "active",
  };

  const result = applyPhaseOneGate(player);
  assert.equal(result.status, "needs_recovery");
  assert.equal(result.phaseOneQualified, false);
});

test("applyPhaseOneGate qualifies players with 5 case files and 2 feedback", () => {
  const player = {
    name: "Chi",
    score: 120,
    integrity: 95,
    progress: { phase_1: { case_file: 5, positive_feedback: 2 } },
    status: "active",
  };

  const result = applyPhaseOneGate(player);
  assert.equal(result.status, "active");
  assert.equal(result.score, 220);
  assert.equal(result.phaseOneQualified, true);
});

test("applyPhaseOneGate handles zero progress without permanent elimination", () => {
  const player = {
    name: "Dung",
    score: 50,
    integrity: 100,
    progress: {},
    status: "active",
  };

  const result = applyPhaseOneGate(player);
  assert.equal(result.status, "needs_recovery");
  assert.equal(result.phaseOneQualified, false);
});

// === Phase 2 gate: integrity and transparency ===

test("applyPhaseTwoGate flags players missing integrity/transparency tasks", () => {
  const player = {
    name: "Em",
    score: 80,
    integrity: 85,
    progress: { phase_2: { integrity_item: 2, transparency: 2 } },
    status: "active",
  };

  const result = applyPhaseTwoGate(player);
  assert.equal(result.status, "needs_recovery");
  assert.equal(result.phaseTwoMessage, "Chưa đạt 3 Liêm chính và 2 Minh bạch ở Phase 2");
  assert.equal(result.phaseTwoQualified, false);
});

test("applyPhaseTwoGate qualifies players with 3 integrity and 2 transparency", () => {
  const player = {
    name: "Phuc",
    score: 90,
    integrity: 88,
    progress: { phase_2: { integrity_item: 3, transparency: 2 } },
    status: "active",
  };

  const result = applyPhaseTwoGate(player);
  assert.equal(result.status, "active");
  assert.equal(result.score, 190);
  assert.equal(result.phaseTwoQualified, true);
});

test("applyPhaseTwoGate handles null progress gracefully", () => {
  const player = {
    name: "Giang",
    score: 50,
    integrity: 90,
    status: "active",
  };

  const result = applyPhaseTwoGate(player);
  assert.equal(result.status, "needs_recovery");
  assert.equal(result.phaseTwoQualified, false);
});

test("applyDecisionEffects updates player score and integrity from a situation choice", () => {
  const player = { name: "Hoa", score: 100, integrity: 80, status: "active" };

  assert.deepEqual(applyDecisionEffects(player, { score: 50, integrity: -20 }), {
    name: "Hoa",
    score: 150,
    integrity: 60,
    status: "active",
  });
});

test("applyVoteOutcome increases public trust when situation 1 majority chooses integrity", () => {
  const gameState = { status: "situation_1", publicTrust: 70 };

  assert.deepEqual(applyVoteOutcome(gameState, 1, { aCount: 2, bCount: 8, total: 10 }), {
    status: "situation_1",
    publicTrust: 75,
    lastTrustDelta: 5,
  });
});

test("applyVoteOutcome decreases public trust when situation 2 majority chooses dishonest reporting", () => {
  const gameState = { status: "situation_2", publicTrust: 42 };

  assert.deepEqual(applyVoteOutcome(gameState, 2, { aCount: 6, bCount: 4, total: 10 }), {
    status: "situation_2",
    publicTrust: 37,
    lastTrustDelta: -5,
  });
});

test("calculateFinalScore rewards integrity enough to outrank raw score only play", () => {
  const highIntegrity = { score: 700, integrity: 95, phaseBonus: 100, decisionBonus: 20 };
  const lowIntegrity = { score: 1100, integrity: 20, phaseBonus: 0, decisionBonus: 0 };

  assert.equal(calculateFinalScore(highIntegrity), 1295);
  assert.equal(calculateFinalScore(lowIntegrity), 1200);
});
