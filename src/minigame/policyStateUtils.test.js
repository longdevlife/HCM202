import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialPolicyState,
  startPhase,
  lockPhase,
  buildTimeoutDecision,
  canSubmitDecision,
  canResolvePhase,
  getNextPhaseId
} from './policyStateUtils.js';

test('createInitialPolicyState returns valid baseline state', () => {
  const state = createInitialPolicyState();
  assert.equal(state.status, 'waiting');
  assert.equal(state.phaseId, null);
  assert.equal(state.phaseStatus, 'idle');
  assert.equal(state.phaseDurationMs, 240000);
  assert.equal(state.decisionWindowMs, 210000);
  assert.deepEqual(state.macro, {
    foodSecurity: 50,
    industrialOutput: 50,
    socialStability: 50,
    foreignCurrency: 50,
    policySupport: 50
  });
  assert.equal(state.agriculture.alpha, 0.92);
  assert.equal(state.industry.P1Req, 0.40);
});

test('startPhase sets active timestamps and durations', () => {
  const state = createInitialPolicyState();
  const now = 1000000;
  const started = startPhase(state, 'phase_1', now);

  assert.equal(started.status, 'phase_1');
  assert.equal(started.phaseId, 'phase_1');
  assert.equal(started.phaseStatus, 'active');
  assert.equal(started.phaseStartedAt, now);
  assert.equal(started.decisionEndsAt, now + 210000);
  assert.equal(started.phaseEndsAt, now + 240000);
  assert.equal(started.currentResult, null);
});

test('startPhase rejects skipped or repeated phases', () => {
  const initial = createInitialPolicyState();
  assert.strictEqual(startPhase(initial, 'phase_2', 1000), initial);

  const active = startPhase(initial, 'phase_1', 1000);
  assert.strictEqual(startPhase(active, 'phase_2', 2000), active);

  const resolved = lockPhase(active, 'phase_1');
  const next = startPhase(resolved, 'phase_2', 2000);
  assert.equal(next.status, 'phase_2');
  assert.equal(next.phaseStatus, 'active');
});

test('getNextPhaseId progresses sequentially', () => {
  assert.equal(getNextPhaseId(null), 'phase_1');
  assert.equal(getNextPhaseId('phase_1'), 'phase_2');
  assert.equal(getNextPhaseId('phase_2'), 'phase_3');
  assert.equal(getNextPhaseId('phase_3'), 'phase_4');
  assert.equal(getNextPhaseId('phase_4'), null);
});

test('buildTimeoutDecision creates valid default payload', () => {
  const dec = buildTimeoutDecision('phase_1', 'player123', 'doan_xa_agriculture', 5000);
  assert.equal(dec.playerId, 'player123');
  assert.equal(dec.phaseId, 'phase_1');
  assert.equal(dec.roleId, 'doan_xa_agriculture');
  assert.equal(dec.optionId, 'keep_piecework');
  assert.equal(dec.taskCompleted, false);
  assert.equal(dec.autoSubmitted, true);
  assert.equal(dec.submittedAt, 5000);
});

test('canSubmitDecision enforces timing and single-submission guard', () => {
  const state = startPhase(createInitialPolicyState(), 'phase_1', 1000);
  
  // Valid submit
  assert.equal(canSubmitDecision({ state, phaseId: 'phase_1', playerId: 'p1', decisions: {} }), true);

  // Already submitted
  assert.equal(canSubmitDecision({
    state,
    phaseId: 'phase_1',
    playerId: 'p1',
    decisions: { p1: { optionId: 'keep_piecework' } }
  }), false);

  // Wrong phase
  assert.equal(canSubmitDecision({ state, phaseId: 'phase_2', playerId: 'p1', decisions: {} }), false);

  // Resolved phase
  const resolvedState = lockPhase(state, 'phase_1');
  assert.equal(canSubmitDecision({ state: resolvedState, phaseId: 'phase_1', playerId: 'p1', decisions: {} }), false);
});

test('canResolvePhase allows Host only when phase is active', () => {
  const state = startPhase(createInitialPolicyState(), 'phase_1', 1000);
  
  assert.equal(canResolvePhase({ state, phaseId: 'phase_1', isHost: true }), true);
  assert.equal(canResolvePhase({ state, phaseId: 'phase_1', isHost: false }), false);
  assert.equal(canResolvePhase({ state, phaseId: 'phase_2', isHost: true }), false);

  const locked = lockPhase(state, 'phase_1');
  assert.equal(canResolvePhase({ state: locked, phaseId: 'phase_1', isHost: true }), false);
});
