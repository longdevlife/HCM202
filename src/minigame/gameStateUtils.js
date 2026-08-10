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
  const nextCapital = Math.max(0, (player.capital || 0) + (delta.capital || 0));

  return {
    ...player,
    score: nextScore,
    capital: nextCapital,
    isBankrupt: Boolean(player.isBankrupt) || nextCapital <= 0,
  };
};

export const applyPhaseOneGate = (player) => {
  if (!player) return player;

  const orders = Number(player.progress?.phase_1?.order) || 0;
  const reviews = Number(player.progress?.phase_1?.review) || 0;
  const qualified = orders >= 5 && reviews >= 2;

  if (!qualified) {
    return {
      ...player,
      capital: 0,
      isBankrupt: true,
      eliminatedReason: "Không đạt 5 đơn hàng và 2 review ở Phase 1",
      phaseOneQualified: false,
    };
  }

  return {
    ...player,
    isBankrupt: Boolean(player.isBankrupt),
    phaseOneQualified: true,
  };
};

export const applyPhaseTwoGate = (player) => {
  if (!player) return player;
  const found = Number(player.progress?.phase_2?.loyal_customer_found) || 0;

  if (found < 1) {
    return {
      ...player,
      capital: 0,
      isBankrupt: true,
      eliminatedReason: "Không tìm được khách ruột trong 60 giây",
      phaseTwoQualified: false,
    };
  }

  return {
    ...player,
    isBankrupt: Boolean(player.isBankrupt),
    phaseTwoQualified: true,
  };
};

