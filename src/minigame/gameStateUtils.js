export const VALID_GAME_STATUSES = new Set([
  "waiting",
  "phase_1",
  "situation_1",
  "phase_2",
  "situation_2",
  "phase_3",
  "finished",
]);

export const isValidGameStatus = (status) => VALID_GAME_STATUSES.has(status);

export const normalizeGameState = (gameState) => {
  if (!gameState || !isValidGameStatus(gameState.status)) {
    return { status: "waiting" };
  }
  return gameState;
};

export const applyPlayerDelta = (player, delta) => {
  if (!player) return player;

  const nextScore = Math.max(0, (player.score || 0) + (delta.score || 0));
  const currentIntegrity = Number.isFinite(player.integrity) ? player.integrity : 100;
  const nextIntegrity = Math.max(0, Math.min(100, currentIntegrity + (delta.integrity || 0)));
  const wasSuspended = player.status === "suspended";
  const nextRecoveryTasks = delta.recoveryTask
    ? Math.max(0, (player.recoveryTasksRemaining || 0) - 1)
    : (nextIntegrity <= 0 ? Math.max(2, player.recoveryTasksRemaining || 0) : player.recoveryTasksRemaining);
  const nextStatus = nextIntegrity <= 0
    ? "suspended"
    : (wasSuspended && nextRecoveryTasks > 0 ? "suspended" : (player.status === "suspended" ? "active" : player.status || "active"));

  return {
    ...player,
    score: nextScore,
    integrity: nextIntegrity,
    status: nextStatus,
    ...(nextRecoveryTasks !== undefined ? { recoveryTasksRemaining: nextRecoveryTasks } : {}),
  };
};

export const applyDecisionEffects = (player, effects = {}) => applyPlayerDelta(player, effects);

export const applyPhaseOneGate = (player) => {
  if (!player) return player;

  const caseFiles = Number(player.progress?.phase_1?.case_file) || 0;
  const positiveFeedback = Number(player.progress?.phase_1?.positive_feedback) || 0;
  const qualified = caseFiles >= 5 && positiveFeedback >= 2;

  if (!qualified) {
    return {
      ...applyPlayerDelta(player, { integrity: -10 }),
      status: "needs_recovery",
      phaseOneMessage: "Chưa đạt 5 hồ sơ đúng hạn và 2 phản hồi tích cực ở Phase 1",
      phaseOneQualified: false,
    };
  }

  return {
    ...applyPlayerDelta(player, { score: 100 }),
    status: player.status || "active",
    phaseOneQualified: true,
  };
};

export const applyPhaseTwoGate = (player) => {
  if (!player) return player;
  const integrityItems = Number(player.progress?.phase_2?.integrity_item) || 0;
  const transparency = Number(player.progress?.phase_2?.transparency) || 0;
  const qualified = integrityItems >= 3 && transparency >= 2;

  if (!qualified) {
    return {
      ...applyPlayerDelta(player, { integrity: -10 }),
      status: "needs_recovery",
      phaseTwoMessage: "Chưa đạt 3 Liêm chính và 2 Minh bạch ở Phase 2",
      phaseTwoQualified: false,
    };
  }

  return {
    ...applyPlayerDelta(player, { score: 100 }),
    status: player.status || "active",
    phaseTwoQualified: true,
  };
};

export const clampPublicTrust = (value) => Math.max(0, Math.min(100, value));

export const applyVoteOutcome = (gameState, situationId, stats) => {
  const currentTrust = Number.isFinite(gameState?.publicTrust) ? gameState.publicTrust : 70;
  const total = stats?.total || stats?.aCount + stats?.bCount || 0;
  const aRatio = total > 0 ? (stats.aCount || 0) / total : 0;
  const bRatio = total > 0 ? (stats.bCount || 0) / total : 0;
  let trustDelta = 0;

  if (situationId === 1) {
    if (bRatio > 0.7) trustDelta = 5;
    else if (aRatio > 0.5) trustDelta = -5;
  }

  if (situationId === 2) {
    if (bRatio > 0.5) trustDelta = 8;
    else if (aRatio > 0.5) trustDelta = -5;
  }

  return {
    ...gameState,
    publicTrust: clampPublicTrust(currentTrust + trustDelta),
    lastTrustDelta: trustDelta,
  };
};

export const calculateFinalScore = (player) => {
  const score = Number(player?.score) || 0;
  const integrity = Number.isFinite(player?.integrity) ? player.integrity : 100;
  const phaseBonus = Number(player?.phaseBonus) || 0;
  const decisionBonus = Number(player?.decisionBonus) || 0;
  return score + integrity * 5 + phaseBonus + decisionBonus;
};

