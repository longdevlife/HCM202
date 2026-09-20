import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDecisionPayload, getDecisionOptions } from './cycleDecisionUtils.js';

test('getDecisionOptions returns correct options for all phases', () => {
  const p1Opts = getDecisionOptions('phase_1');
  assert.equal(p1Opts.length, 2);
  assert.equal(p1Opts[0].id, 'opt_p1_phiendien');

  const p3Opts = getDecisionOptions('phase_3');
  assert.equal(p3Opts.length, 3);
  assert.equal(p3Opts[0].id, 'uu_tien_nong_thon');
});

test('buildDecisionPayload constructs valid structured object', () => {
  const payload = buildDecisionPayload({
    playerId: 'user_1',
    roleId: 'worker_leader',
    phaseId: 'phase_1',
    optionId: 'opt_p1_toandien',
    taskCompleted: true,
    submittedAt: 123456
  });

  assert.equal(payload.playerId, 'user_1');
  assert.equal(payload.roleId, 'worker_leader');
  assert.equal(payload.phaseId, 'phase_1');
  assert.equal(payload.optionId, 'opt_p1_toandien');
  assert.equal(payload.taskCompleted, true);
  assert.equal(payload.autoSubmitted, false);
  assert.equal(payload.submittedAt, 123456);
});

test('buildDecisionPayload throws error on missing required fields', () => {
  assert.throws(() => {
    buildDecisionPayload({ playerId: 'user_1', phaseId: 'phase_1' });
  }, /optionId is required/);
});
