import { buildTimeoutDecision, getNextPhaseId, startPhase } from './policyStateUtils.js';
import { resolvePhase, validateDecision } from './simulationEngine.js';

export const buildStartPhasePatch = (state, phaseId, now = Date.now()) => {
  const nextState = startPhase(state, phaseId, now);
  return {
    'gameState/status': nextState.status,
    'gameState/phaseId': nextState.phaseId,
    'gameState/phaseStatus': nextState.phaseStatus,
    'gameState/phaseStartedAt': nextState.phaseStartedAt,
    'gameState/decisionEndsAt': nextState.decisionEndsAt,
    'gameState/phaseEndsAt': nextState.phaseEndsAt,
    'gameState/macro': nextState.macro,
    'gameState/agriculture': nextState.agriculture,
    'gameState/industry': nextState.industry,
    'gameState/results': nextState.results,
    'gameState/learningStage': nextState.learningStage,
    'gameState/currentResult': null
  };
};

export const buildResolvePhasePatch = (state, phaseId, decisions = {}, players = {}) => {
  if (!state || state.status !== phaseId || state.phaseId !== phaseId || state.phaseStatus !== 'active') {
    return {};
  }

  const { nextState, phaseResult, playerScores } = resolvePhase({
    phaseId,
    state,
    decisions,
    players
  });

  const patch = {
    'gameState/phaseStatus': 'resolved',
    'gameState/macro': nextState.macro,
    'gameState/agriculture': nextState.agriculture,
    'gameState/industry': nextState.industry,
    'gameState/currentResult': phaseResult,
    [`gameState/results/${phaseId}`]: phaseResult
  };

  Object.entries(playerScores || {}).forEach(([playerId, pScore]) => {
    const existingDecision = decisions?.[playerId];
    const isValidDecision = existingDecision
      && existingDecision.phaseId === phaseId
      && validateDecision({
        phaseId,
        optionId: existingDecision.optionId,
        taskCompleted: existingDecision.taskCompleted,
      }).valid;

    if (!isValidDecision) {
      patch[`decisions/${phaseId}/${playerId}`] = buildTimeoutDecision(
        phaseId,
        playerId,
        players?.[playerId]?.roleId || pScore.roleId,
        state.decisionEndsAt || state.phaseEndsAt || 0
      );
    }
    patch[`players/${playerId}/score`] = pScore.currentScore;
    patch[`players/${playerId}/lastScoreDelta`] = pScore.scoreDelta;
    patch[`players/${playerId}/lastExplanation`] = pScore.explanation;
    patch[`players/${playerId}/submitted/${phaseId}`] = true;
    patch[`players/${playerId}/taskProgress/${phaseId}`] = Boolean(pScore.taskCompleted);
  });

  return patch;
};

export const buildNextPhasePatch = (state, now = Date.now()) => {
  const nextPhaseId = getNextPhaseId(state?.phaseId);
  if (nextPhaseId) {
    return buildStartPhasePatch(state, nextPhaseId, now);
  }

  return {
    'gameState/status': 'finished',
    'gameState/phaseId': null,
    'gameState/phaseStatus': 'idle',
    'gameState/finishedAt': now
  };
};
