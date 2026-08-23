import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPolicyRpgSnapshot,
  isPolicyStationMessage,
  getStationForPhase,
  mergePlayerPositions,
  normalizePlayerMove
} from './rpgBridge.js';

test('getStationForPhase returns corresponding station for each phase', () => {
  const s1 = getStationForPhase('phase_1');
  assert.equal(s1.id, 'doan_xa_crisis');
  assert.equal(s1.phaseId, 'phase_1');

  const s2 = getStationForPhase('phase_2');
  assert.equal(s2.id, 'det_thanh_cong_yarn');

  const s3 = getStationForPhase('phase_3');
  assert.equal(s3.id, 'field_survey_report');

  const s4 = getStationForPhase('phase_4');
  assert.equal(s4.id, 'policy_allocation_1981');
});

test('buildPolicyRpgSnapshot formats snapshot with station and player state', () => {
  const gameState = {
    status: 'phase_1',
    phaseId: 'phase_1',
    phaseStatus: 'active'
  };
  const players = {
    p1: { name: 'Player 1', roleId: 'doan_xa_agriculture', taskProgress: { phase_1: true } }
  };
  const positions = {
    p1: { x: 100, y: 150, direction: 'down' }
  };

  const snapshot = buildPolicyRpgSnapshot({
    gameState,
    players,
    positions,
    currentPlayerId: 'p1'
  });

  assert.equal(snapshot.type, 'POLICY_GAME_SNAPSHOT');
  assert.equal(snapshot.phaseId, 'phase_1');
  assert.equal(snapshot.station.id, 'doan_xa_crisis');
  assert.equal(snapshot.taskCompletedByPlayer, true);
  assert.equal(snapshot.players.p1.x, 100);
  assert.equal(snapshot.players.p1.y, 150);
});

test('isPolicyStationMessage validates interact message correctly', () => {
  assert.equal(isPolicyStationMessage({
    type: 'POLICY_STATION_INTERACT',
    phaseId: 'phase_1',
    stationId: 'doan_xa_crisis'
  }), true);

  assert.equal(isPolicyStationMessage({
    type: 'POLICY_STATION_INTERACT',
    phaseId: 'phase_1'
  }), false);

  assert.equal(isPolicyStationMessage({
    type: 'UNKNOWN_TYPE'
  }), false);
});

test('player movement normalization bounds coordinates cleanly', () => {
  const move = normalizePlayerMove({ x: -100, y: 9999, direction: 'left' });
  assert.ok(move.x >= 12);
  assert.ok(move.y <= 528);
  assert.equal(move.direction, 'left');
});
