import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStartPhasePatch,
  buildResolvePhasePatch,
  buildNextPhasePatch
} from './policyGameActions.js';
import { createInitialPolicyState } from './policyStateUtils.js';

test('buildStartPhasePatch generates correct Firebase updates', () => {
  const state = createInitialPolicyState();
  const patch = buildStartPhasePatch(state, 'phase_1', 10000);

  assert.equal(patch['gameState/status'], 'phase_1');
  assert.equal(patch['gameState/phaseId'], 'phase_1');
  assert.equal(patch['gameState/phaseStatus'], 'active');
  assert.equal(patch['gameState/phaseStartedAt'], 10000);
  assert.equal(patch['gameState/decisionEndsAt'], 10000 + 210000);
  assert.equal(patch['gameState/phaseEndsAt'], 10000 + 240000);
  assert.deepEqual(patch['gameState/macro'], {
    foodSecurity: 50,
    industrialOutput: 50,
    socialStability: 50,
    foreignCurrency: 50,
    policySupport: 50,
  });
  assert.deepEqual(patch['gameState/results'], {});
  assert.equal(patch['gameState/currentResult'], null);
});

test('buildResolvePhasePatch updates macro, results, and player scores', () => {
  const state = {
    ...createInitialPolicyState(),
    status: 'phase_1',
    phaseId: 'phase_1',
    phaseStatus: 'active'
  };
  const decisions = {
    p1: { playerId: 'p1', roleId: 'doan_xa_agriculture', phaseId: 'phase_1', optionId: 'try_harvest_contract', taskCompleted: true, autoSubmitted: false }
  };
  const players = {
    p1: { name: 'Player 1', roleId: 'doan_xa_agriculture', score: 10 }
  };

  const patch = buildResolvePhasePatch(state, 'phase_1', decisions, players);
  assert.equal(patch['gameState/phaseStatus'], 'resolved');
  assert.ok(patch['gameState/macro']);
  assert.ok(patch['gameState/currentResult']);
  assert.ok(patch['gameState/results/phase_1']);
  assert.ok(patch['players/p1/score'] > 10);
  assert.equal(patch['players/p1/submitted/phase_1'], true);
  assert.equal(patch['decisions/phase_1/p1'], undefined);
});

test('buildResolvePhasePatch writes deterministic defaults for players who timed out', () => {
  const state = {
    ...createInitialPolicyState(),
    status: 'phase_1',
    phaseId: 'phase_1',
    phaseStatus: 'active',
    decisionEndsAt: 120000,
  };
  const patch = buildResolvePhasePatch(state, 'phase_1', {}, {
    p1: { roleId: 'doan_xa_agriculture', score: 0 },
  });

  assert.deepEqual(patch['decisions/phase_1/p1'], {
    playerId: 'p1',
    roleId: 'doan_xa_agriculture',
    phaseId: 'phase_1',
    optionId: 'keep_piecework',
    taskCompleted: false,
    autoSubmitted: true,
    submittedAt: 120000,
  });
  assert.equal(patch['players/p1/submitted/phase_1'], true);
});

test('buildResolvePhasePatch is a no-op after a phase is already resolved', () => {
  const state = {
    ...createInitialPolicyState(),
    status: 'phase_1',
    phaseId: 'phase_1',
    phaseStatus: 'resolved',
  };
  assert.deepEqual(buildResolvePhasePatch(state, 'phase_1', {}, {}), {});
});

test('buildNextPhasePatch transitions to phase_2 and ends at finished', () => {
  const statePhase1 = {
    ...createInitialPolicyState(),
    status: 'phase_1',
    phaseId: 'phase_1',
    phaseStatus: 'resolved'
  };
  const nextPatch1 = buildNextPhasePatch(statePhase1, 20000);
  assert.equal(nextPatch1['gameState/status'], 'phase_2');
  assert.equal(nextPatch1['gameState/phaseStatus'], 'active');

  const statePhase4 = {
    ...createInitialPolicyState(),
    status: 'phase_4',
    phaseId: 'phase_4',
    phaseStatus: 'resolved'
  };
  const finishPatch = buildNextPhasePatch(statePhase4, 50000);
  assert.equal(finishPatch['gameState/status'], 'finished');
  assert.equal(finishPatch['gameState/phaseStatus'], 'idle');
});
