const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 540;
const PLAYER_RADIUS = 12;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const finiteCoordinate = (value) => typeof value === 'number' && Number.isFinite(value);

export const POLICY_STATIONS = {
  phase_1: {
    id: 'doan_xa_crisis',
    phaseId: 'phase_1',
    label: 'HTX Đoàn Xá (Khảo sát lương thực)',
    shortLabel: 'Đoàn Xá',
    icon: '🌾',
    x: 480,
    y: 139,
    radius: 45,
    prompt: 'Nhấn Space / Chạm vào để khảo sát thực địa Đoàn Xá'
  },
  phase_2: {
    id: 'det_thanh_cong_yarn',
    phaseId: 'phase_2',
    label: 'XN Dệt Thành Công (Bảng thiếu sợi)',
    shortLabel: 'Dệt Thành Công',
    icon: '🏭',
    x: 480,
    y: 139,
    radius: 45,
    prompt: 'Nhấn Space / Chạm vào để kiểm tra kho sợi Dệt Thành Công'
  },
  phase_3: {
    id: 'field_survey_report',
    phaseId: 'phase_3',
    label: 'Đoàn Khảo Sát Trung Ương (Báo cáo)',
    shortLabel: 'Khảo Sát TW',
    icon: '📋',
    x: 480,
    y: 139,
    radius: 45,
    prompt: 'Nhấn Space / Chạm vào để trình bày báo cáo với đoàn công tác'
  },
  phase_4: {
    id: 'policy_allocation_1981',
    phaseId: 'phase_4',
    label: 'Hội Nghị Thể Chế 1981 (Phân bổ)',
    shortLabel: 'Hội Nghị 1981',
    icon: '🏛️',
    x: 480,
    y: 139,
    radius: 45,
    prompt: 'Nhấn Space / Chạm vào để tham gia hội nghị phân bổ 1981'
  }
};

export const getStationForPhase = (phaseId) => {
  return POLICY_STATIONS[phaseId] || POLICY_STATIONS.phase_1;
};

export function mergePlayerPositions(players = {}, positions = {}) {
  if (!isObject(players)) return {};
  const positionMap = isObject(positions) ? positions : {};

  return Object.fromEntries(
    Object.entries(players).map(([id, player]) => {
      if (!isObject(player)) return [id, player];
      const position = positionMap[id];
      if (!isObject(position) || !finiteCoordinate(position.x) || !finiteCoordinate(position.y)) {
        return [id, player];
      }

      return [
        id,
        {
          ...player,
          x: position.x,
          y: position.y,
          position: {
            x: position.x,
            y: position.y,
            ...(typeof position.direction === 'string' ? { direction: position.direction } : {})
          },
          ...(typeof position.direction === 'string' ? { direction: position.direction } : {})
        }
      ];
    })
  );
}

export function buildPolicyRpgSnapshot({
  gameState = {},
  players = {},
  positions = {},
  currentPlayerId = null
} = {}) {
  const phaseId = gameState?.status || gameState?.phaseId || 'phase_1';
  const station = getStationForPhase(phaseId);
  const mergedPlayers = mergePlayerPositions(players, positions);

  const currentPlayer = players?.[currentPlayerId];
  const taskCompletedByPlayer = Boolean(
    currentPlayer?.taskProgress?.[phaseId] || currentPlayer?.taskCompleted
  );

  return {
    type: 'POLICY_GAME_SNAPSHOT',
    phaseId,
    phaseStatus: gameState?.phaseStatus || 'active',
    station,
    taskCompletedByPlayer,
    currentPlayerId,
    players: mergedPlayers
  };
}

// Backward-compatible alias for existing imports if any
export function buildRpgSnapshot(gameState = {}, collections = {}, positions = {}) {
  return buildPolicyRpgSnapshot({
    gameState,
    players: collections.players || {},
    positions
  });
}

export function isPolicyStationMessage(msg) {
  if (!isObject(msg)) return false;
  if (msg.type !== 'POLICY_STATION_INTERACT') return false;
  if (typeof msg.phaseId !== 'string' || typeof msg.stationId !== 'string') return false;
  return true;
}

export function isRpgMessage(msg) {
  if (!isObject(msg)) return false;
  if (isPolicyStationMessage(msg)) return true;
  if (msg.type === 'PLAYER_MOVE') {
    return (
      finiteCoordinate(msg.x) &&
      finiteCoordinate(msg.y) &&
      ['up', 'down', 'left', 'right'].includes(msg.direction)
    );
  }
  return false;
}

export function normalizePlayerMove(move = {}) {
  const x = finiteCoordinate(move?.x) ? move.x : 0;
  const y = finiteCoordinate(move?.y) ? move.y : 0;
  const direction = ['up', 'down', 'left', 'right'].includes(move?.direction)
    ? move.direction
    : 'down';

  return {
    x: Math.max(PLAYER_RADIUS, Math.min(WORLD_WIDTH - PLAYER_RADIUS, x)),
    y: Math.max(PLAYER_RADIUS, Math.min(WORLD_HEIGHT - PLAYER_RADIUS, y)),
    direction
  };
}
