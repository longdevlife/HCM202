import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDecisionPayload, getDecisionOptions } from './cycleDecisionUtils.js';

test('getDecisionOptions returns correct options for all phases', () => {
  const p1Opts = getDecisionOptions('phase_1');
  assert.equal(p1Opts.length, 2);
  assert.equal(p1Opts[0].id, 'keep_piecework');

  const p4Opts = getDecisionOptions('phase_4');
  assert.equal(p4Opts.length, 3);
  assert.equal(p4Opts[0].id, 'plan_focus');
});

test('buildDecisionPayload constructs valid structured object', () => {
  const payload = buildDecisionPayload({
    playerId: 'user_1',
    roleId: 'doan_xa_agriculture',
    phaseId: 'phase_1',
    optionId: 'try_harvest_contract',
    taskCompleted: true,
    submittedAt: 123456
  });

  assert.equal(payload.playerId, 'user_1');
  assert.equal(payload.roleId, 'doan_xa_agriculture');
  assert.equal(payload.phaseId, 'phase_1');
  assert.equal(payload.optionId, 'try_harvest_contract');
  assert.equal(payload.taskCompleted, true);
  assert.equal(payload.autoSubmitted, false);
  assert.equal(payload.submittedAt, 123456);
});

test('buildDecisionPayload throws error on missing required fields', () => {
  assert.throws(() => {
    buildDecisionPayload({ playerId: 'user_1', phaseId: 'phase_1' });
  }, /optionId is required/);
});
