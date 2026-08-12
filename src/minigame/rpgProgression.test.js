import test from "node:test";
import assert from "node:assert/strict";

import { applyEntityRewardClaim, applyFinalGateCompletion } from "./gameStateUtils.js";
import { PHASE_CONFIGS } from "./situations.js";

const activePlayer = (name) => ({ name, score: 0, integrity: 100, status: "active" });

test("one canonical book rewards each player once without consuming it globally", () => {
  const claim = {
    phaseKey: "phase_1",
    collection: "books",
    entityId: "shared_case_file",
    entity: PHASE_CONFIGS.phase_1.bookReward,
    claimedAt: 111,
  };

  const playerA = applyEntityRewardClaim(activePlayer("An"), claim);
  const duplicateA = applyEntityRewardClaim(playerA, { ...claim, claimedAt: 222 });
  const playerB = applyEntityRewardClaim(activePlayer("Binh"), { ...claim, claimedAt: 333 });

  assert.ok(playerA);
  assert.equal(duplicateA, null);
  assert.ok(playerB);
  assert.equal(playerA.score, 30);
  assert.equal(playerB.score, 30);
  assert.equal(playerA.progress.phase_1.case_file, 1);
  assert.equal(playerB.progress.phase_1.case_file, 1);
  assert.equal(playerA.rpgClaims.phase_1.books.shared_case_file, 111);
  assert.equal(playerB.rpgClaims.phase_1.books.shared_case_file, 333);
});

test("one canonical NPC recovery reward applies only on a player's new claim", () => {
  const suspended = {
    name: "Chi",
    score: 0,
    integrity: 0,
    status: "suspended",
    recoveryTasksRemaining: 1,
  };
  const claim = {
    phaseKey: "phase_2",
    collection: "npcs",
    entityId: "citizen_1",
    entity: PHASE_CONFIGS.phase_2.supportReward,
    claimedAt: 444,
    recoveryTask: true,
  };

  const recovered = applyEntityRewardClaim(suspended, claim);
  const duplicate = applyEntityRewardClaim(recovered, claim);

  assert.ok(recovered);
  assert.equal(duplicate, null);
  assert.equal(recovered.score, 100);
  assert.equal(recovered.integrity, 10);
  assert.equal(recovered.status, "active");
  assert.equal(recovered.recoveryTasksRemaining, 0);
  assert.equal(recovered.progress.phase_2.citizen_feedback, 1);
});

test("phase three gate rejects players missing any configured item prerequisite", () => {
  const rewards = [
    PHASE_CONFIGS.phase_3.bookReward,
    PHASE_CONFIGS.phase_3.feedbackReward,
    PHASE_CONFIGS.phase_3.supportReward,
  ];

  rewards.forEach((_, missingIndex) => {
    const partial = rewards.reduce((player, entity, index) => (
      index === missingIndex ? player : applyEntityRewardClaim(player, {
        phaseKey: "phase_3",
        collection: "books",
        entityId: `prerequisite_${index}`,
        entity,
        claimedAt: 500 + index,
      })
    ), activePlayer("Dung"));
    const result = applyFinalGateCompletion(partial, {
      phaseKey: "phase_3",
      gateId: "public_center_1",
      completedAt: 600,
    });

    assert.equal(result, null);
    assert.equal(partial.phaseBonus, undefined);
    assert.equal(partial.completedFinalMission, undefined);
    assert.equal(partial.progress.phase_3.public_center, undefined);
  });
});

test("phase three gate completes and awards its bonus exactly once after all prerequisites", () => {
  const rewards = [
    PHASE_CONFIGS.phase_3.bookReward,
    PHASE_CONFIGS.phase_3.feedbackReward,
    PHASE_CONFIGS.phase_3.supportReward,
  ];
  const qualified = rewards.reduce((player, entity, index) => applyEntityRewardClaim(player, {
    phaseKey: "phase_3",
    collection: "books",
    entityId: `prerequisite_${index}`,
    entity,
    claimedAt: 700 + index,
  }), { ...activePlayer("Em"), phaseBonus: 20 });

  const completed = applyFinalGateCompletion(qualified, {
    phaseKey: "phase_3",
    gateId: "public_center_1",
    completedAt: 800,
  });
  const duplicate = applyFinalGateCompletion(completed, {
    phaseKey: "phase_3",
    gateId: "public_center_1",
    completedAt: 900,
  });

  assert.ok(completed);
  assert.equal(duplicate, null);
  assert.equal(completed.progress.phase_3.public_center, 1);
  assert.equal(completed.phaseBonus, 120);
  assert.equal(completed.completedFinalMission, true);
  assert.equal(completed.completedAt, 800);
  assert.equal(completed.rpgClaims.phase_3.gates.public_center_1, 800);
});
