import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  calculateAgriculture,
  calculateIndustry,
  validateDecision,
  resolvePhase,
  calculateScore
} from './simulationEngine.js';
import { PHASE_3_PRESETS, PHASE_4_PRESETS } from './policyCycles.js';

test('clamp restricts values to boundaries', () => {
  assert.equal(clamp(50, 0, 100), 50);
  assert.equal(clamp(-10, 0, 100), 0);
  assert.equal(clamp(150, 0, 100), 100);
});

test('calculateAgriculture computes Ya correctly and handles edge cases', () => {
  // Standard test
  const res = calculateAgriculture({ alpha: 0.92, beta: 0.45, Lc: 65, theta: 0.60 });
  assert.equal(res.Ie, 0.4);
  assert.ok(res.Ya > 0 && res.Ya < 1);
  assert.equal(res.YaPercent, Math.round(res.Ya * 100));

  // Edge case: theta = 1 -> Ie = 0 -> Ya = 0
  const zeroIncentive = calculateAgriculture({ alpha: 0.92, beta: 0.45, Lc: 65, theta: 1.0 });
  assert.equal(zeroIncentive.Ie, 0);
  assert.equal(zeroIncentive.Ya, 0);
  assert.equal(zeroIncentive.YaPercent, 0);

  // Edge case: Lc = 0 -> Ya = 0
  const zeroLabor = calculateAgriculture({ alpha: 0.92, beta: 0.45, Lc: 0, theta: 0.5 });
  assert.equal(zeroLabor.Ya, 0);
});

test('calculateIndustry computes Ei and checks P1Req penalty', () => {
  // Preset balanced_khoan (P1=0.45 >= 0.40)
  const balanced = calculateIndustry({
    P1: 0.45,
    P2: 0.35,
    P3: 0.20,
    P1Req: 0.40,
    gamma1: 0.60,
    gamma2: 0.90,
    gamma3: 1.20
  });
  assert.equal(balanced.administrativePenalty, false);
  const expectedEi = 0.45 * 0.60 + 0.35 * 0.90 + 0.20 * 1.20; // 0.27 + 0.315 + 0.24 = 0.825
  assert.ok(Math.abs(balanced.Ei - expectedEi) < 0.0001);

  // Preset incentive_risk (P1=0.30 < 0.40)
  const risky = calculateIndustry({
    P1: 0.30,
    P2: 0.40,
    P3: 0.30,
    P1Req: 0.40,
    gamma1: 0.60,
    gamma2: 0.90,
    gamma3: 1.20
  });
  assert.equal(risky.administrativePenalty, true);

  // Invalid sum throws error
  assert.throws(() => {
    calculateIndustry({ P1: 0.5, P2: 0.5, P3: 0.5 });
  }, /Sum of P1, P2, P3 must equal 1/);
});

test('validateDecision checks phase options and validity', () => {
  assert.equal(validateDecision({ phaseId: 'phase_1', optionId: 'opt_p1_toandien' }).valid, true);
  assert.equal(validateDecision({ phaseId: 'phase_1', optionId: 'invalid_opt' }).valid, false);
  assert.equal(validateDecision({ phaseId: 'phase_3', optionId: 'toan_dien_ben_vung' }).valid, true);
});

test('calculateScore produces deterministic score delta with bonuses and penalties', () => {
  const scoreData = calculateScore({
    roleId: 'worker_leader',
    optionId: 'opt_p1_toandien',
    taskCompleted: true,
    autoSubmitted: false,
    result: { winningOptionId: 'opt_p1_toandien' },
    macroDelta: { foodSecurity: 8, socialStability: 6, policySupport: 8 }
  });

  assert.ok(scoreData.scoreDelta > 0);
  assert.equal(scoreData.taskBonus, 5);
  assert.equal(scoreData.timeoutBonus, 2);
  assert.equal(scoreData.decisionBonus, 5);
  assert.ok(scoreData.roleBonus >= 0);
  assert.ok(scoreData.explanation.length > 0);

  // Timeout case
  const timeoutScore = calculateScore({
    roleId: 'worker_leader',
    optionId: 'opt_p1_phiendien',
    taskCompleted: false,
    autoSubmitted: true,
    result: { winningOptionId: 'opt_p1_toandien' },
    macroDelta: { foodSecurity: 2, socialStability: -6, policySupport: 3 }
  });
  assert.equal(timeoutScore.taskBonus, 0);
  assert.equal(timeoutScore.timeoutBonus, -3);
});

test('resolvePhase handles Phase 1 resolution idempotently and deterministically', () => {
  const state = {
    status: 'phase_1',
    phaseId: 'phase_1',
    macro: {
      foodSecurity: 50,
      industrialOutput: 50,
      socialStability: 50,
      foreignCurrency: 50,
      policySupport: 50
    },
    agriculture: { alpha: 0.92, beta: 0.45, Lc: 65, theta: 0.60, Ie: 0.40, Ya: 0 },
    industry: { P1: 0.45, P2: 0.35, P3: 0.20, P1Req: 0.40, gamma1: 0.60, gamma2: 0.90, gamma3: 1.20, Ei: 0 },
    results: {}
  };

  const decisions = {
    p1: { playerId: 'p1', roleId: 'worker_leader', phaseId: 'phase_1', optionId: 'opt_p1_toandien', taskCompleted: true, autoSubmitted: false },
    p2: { playerId: 'p2', roleId: 'intellectual_core', phaseId: 'phase_1', optionId: 'opt_p1_toandien', taskCompleted: false, autoSubmitted: false }
  };

  const players = {
    p1: { name: 'Player 1', roleId: 'worker_leader', score: 0 },
    p2: { name: 'Player 2', roleId: 'intellectual_core', score: 0 }
  };

  const result = resolvePhase({ phaseId: 'phase_1', state, decisions, players });
  assert.ok(result.nextState);
  assert.equal(result.nextState.phaseStatus, 'resolved');
  assert.equal(result.phaseResult.winningOptionId, 'opt_p1_toandien');
  assert.equal(result.nextState.macro.socialStability, 58);
  assert.equal(result.nextState.macro.policySupport, 58);
  assert.ok(result.playerScores.p1.scoreDelta > result.playerScores.p2.scoreDelta);
});

test('resolvePhase handles Phase 3 preset and penalty', () => {
  const state = {
    status: 'phase_3',
    phaseId: 'phase_3',
    macro: {
      foodSecurity: 50,
      industrialOutput: 50,
      socialStability: 50,
      foreignCurrency: 50,
      policySupport: 50
    },
    agriculture: { alpha: 0.92, beta: 0.45, Lc: 65, theta: 0.60, Ie: 0.40, Ya: 0 },
    industry: { P1: 0.45, P2: 0.35, P3: 0.20, P1Req: 0.40, gamma1: 0.60, gamma2: 0.90, gamma3: 1.20, Ei: 0 },
    results: {}
  };

  const decisions = {
    p1: { playerId: 'p1', roleId: 'entrepreneur_dynamic', phaseId: 'phase_3', optionId: 'dot_pha_tri_thuc', taskCompleted: true, autoSubmitted: false }
  };

  const players = {
    p1: { name: 'Player 1', roleId: 'entrepreneur_dynamic', score: 20 }
  };

  const result = resolvePhase({ phaseId: 'phase_3', state, decisions, players });
  assert.equal(result.phaseResult.winningOptionId, 'dot_pha_tri_thuc');
  assert.equal(result.phaseResult.industry.administrativePenalty, true);
  // Penalty applied: policySupport -10, industrialOutput -5
  assert.ok(result.nextState.macro.policySupport <= 40);
});
