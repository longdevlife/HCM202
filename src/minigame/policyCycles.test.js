import test from 'node:test';
import assert from 'node:assert/strict';
import { POLICY_CYCLES, PHASE_3_PRESETS, PHASE_4_PRESETS, getPolicyCycle } from './policyCycles.js';
import { CHARACTER_OPTIONS, getCharacterOption } from './characterOptions.js';

test('POLICY_CYCLES has exactly 3 phases in order with required schema', () => {
  assert.equal(POLICY_CYCLES.length, 3);
  const phaseIds = POLICY_CYCLES.map(c => c.id);
  assert.deepEqual(phaseIds, ['phase_1', 'phase_2', 'phase_3']);

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

test('Phase options match Chapter 5 topics and presets', () => {
  const p1 = getPolicyCycle('phase_1');
  assert.deepEqual(p1.options.map(o => o.id), ['opt_p1_phiendien', 'opt_p1_toandien']);
  assert.equal(p1.defaultOptionId, 'opt_p1_toandien');
  assert.equal(p1.task.stationId, 'station_p1_concept');

  const p2 = getPolicyCycle('phase_2');
  assert.deepEqual(p2.options.map(o => o.id), ['opt_p2_tuyetdoi', 'opt_p2_haihoa']);
  assert.equal(p2.defaultOptionId, 'opt_p2_haihoa');
  assert.equal(p2.task.stationId, 'station_p2_central');

  const p3 = getPolicyCycle('phase_3');
  assert.deepEqual(p3.options.map(o => o.id), ['uu_tien_nong_thon', 'toan_dien_ben_vung', 'dot_pha_tri_thuc']);
  assert.equal(p3.defaultOptionId, 'toan_dien_ben_vung');
  assert.equal(p3.task.stationId, 'station_p3_alliance');
});

test('PHASE_3_PRESETS contains exact allocations', () => {
  assert.deepEqual(PHASE_3_PRESETS.toan_dien_ben_vung, { P1: 0.45, P2: 0.35, P3: 0.20, Lc: 65, theta: 0.60 });
  assert.deepEqual(PHASE_3_PRESETS.uu_tien_nong_thon, { P1: 0.60, P2: 0.25, P3: 0.15, Lc: 80, theta: 0.80 });
  assert.deepEqual(PHASE_3_PRESETS.dot_pha_tri_thuc, { P1: 0.30, P2: 0.40, P3: 0.30, Lc: 45, theta: 0.35 });
});

test('CHARACTER_OPTIONS contains 4 simulation roles with preferredMetrics', () => {
  assert.equal(CHARACTER_OPTIONS.length, 4);
  const roleIds = CHARACTER_OPTIONS.map(r => r.id);
  assert.deepEqual(roleIds, [
    'worker_leader',
    'farmer_strategic',
    'intellectual_core',
    'entrepreneur_dynamic'
  ]);

  CHARACTER_OPTIONS.forEach(role => {
    assert.ok(role.id);
    assert.ok(role.label);
    assert.ok(role.shortLabel);
    assert.ok(role.description);
    assert.ok(Array.isArray(role.preferredMetrics));
    assert.ok(role.preferredMetrics.length > 0);
  });

  const workerRole = getCharacterOption('worker_leader');
  assert.equal(workerRole.id, 'worker_leader');
  const fallback = getCharacterOption('unknown_role');
  assert.equal(fallback.id, 'worker_leader');
  // Check alias compatibility
  const aliasedFarmer = getCharacterOption('doan_xa_agriculture');
  assert.equal(aliasedFarmer.id, 'farmer_strategic');
});
