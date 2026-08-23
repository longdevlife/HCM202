import test from 'node:test';
import assert from 'node:assert/strict';
import { POLICY_CYCLES, PHASE_4_PRESETS, getPolicyCycle } from './policyCycles.js';
import { CHARACTER_OPTIONS, getCharacterOption } from './characterOptions.js';

test('POLICY_CYCLES has exactly 4 phases in order with required schema', () => {
  assert.equal(POLICY_CYCLES.length, 4);
  const phaseIds = POLICY_CYCLES.map(c => c.id);
  assert.deepEqual(phaseIds, ['phase_1', 'phase_2', 'phase_3', 'phase_4']);

  POLICY_CYCLES.forEach(cycle => {
    assert.ok(cycle.id, 'Cycle must have an id');
    assert.ok(cycle.year, 'Cycle must have a year');
    assert.ok(cycle.title, 'Cycle must have a title');
    assert.equal(cycle.durationMs, 240000);
    assert.equal(cycle.decisionWindowMs, 210000);
    assert.ok(cycle.defaultOptionId, 'Cycle must have defaultOptionId');
    assert.ok(Array.isArray(cycle.options), 'Cycle options must be an array');
    assert.ok(cycle.options.some(opt => opt.id === cycle.defaultOptionId), 'defaultOptionId must exist in options');
    
    // Task schema
    assert.ok(cycle.task, 'Cycle must have a task object');
    assert.ok(cycle.task.stationId, 'Task must have stationId');
    assert.ok(cycle.task.objectiveLabel, 'Task must have objectiveLabel');
    assert.ok(cycle.task.successText, 'Task must have successText');
    assert.equal(cycle.task.taskBonus, 5);
  });
});

test('Phase options match historical decisions and presets', () => {
  const p1 = getPolicyCycle('phase_1');
  assert.deepEqual(p1.options.map(o => o.id), ['keep_piecework', 'try_harvest_contract']);
  assert.equal(p1.defaultOptionId, 'keep_piecework');
  assert.equal(p1.task.stationId, 'doan_xa_crisis');

  const p2 = getPolicyCycle('phase_2');
  assert.deepEqual(p2.options.map(o => o.id), ['wait_state_supply', 'borrow_fx_import']);
  assert.equal(p2.defaultOptionId, 'wait_state_supply');
  assert.equal(p2.task.stationId, 'det_thanh_cong_yarn');

  const p3 = getPolicyCycle('phase_3');
  assert.deepEqual(p3.options.map(o => o.id), ['hide_data', 'report_truth']);
  assert.equal(p3.defaultOptionId, 'report_truth');
  assert.equal(p3.task.stationId, 'field_survey_report');

  const p4 = getPolicyCycle('phase_4');
  assert.deepEqual(p4.options.map(o => o.id), ['plan_focus', 'balanced_khoan', 'incentive_risk']);
  assert.equal(p4.defaultOptionId, 'balanced_khoan');
  assert.equal(p4.task.stationId, 'policy_allocation_1981');
});

test('PHASE_4_PRESETS contains exact allocations', () => {
  assert.deepEqual(PHASE_4_PRESETS.plan_focus, { P1: 0.60, P2: 0.25, P3: 0.15, Lc: 80, theta: 0.80 });
  assert.deepEqual(PHASE_4_PRESETS.balanced_khoan, { P1: 0.45, P2: 0.35, P3: 0.20, Lc: 65, theta: 0.60 });
  assert.deepEqual(PHASE_4_PRESETS.incentive_risk, { P1: 0.30, P2: 0.40, P3: 0.30, Lc: 45, theta: 0.35 });
});

test('CHARACTER_OPTIONS contains 4 simulation roles with preferredMetrics', () => {
  assert.equal(CHARACTER_OPTIONS.length, 4);
  const roleIds = CHARACTER_OPTIONS.map(r => r.id);
  assert.deepEqual(roleIds, [
    'doan_xa_agriculture',
    'ba_thi_distribution',
    'det_thanh_cong_industry',
    'long_an_policy'
  ]);

  CHARACTER_OPTIONS.forEach(role => {
    assert.ok(role.id);
    assert.ok(role.label);
    assert.ok(role.shortLabel);
    assert.ok(role.description);
    assert.ok(Array.isArray(role.preferredMetrics));
    assert.ok(role.preferredMetrics.length > 0);
  });

  const agriculturalRole = getCharacterOption('doan_xa_agriculture');
  assert.equal(agriculturalRole.id, 'doan_xa_agriculture');
  const fallback = getCharacterOption('unknown_role');
  assert.equal(fallback.id, 'doan_xa_agriculture');
});
