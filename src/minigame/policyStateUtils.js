import { POLICY_CYCLES, getPolicyCycle } from './policyCycles.js';

export const createInitialPolicyState = () => {
  return {
    status: 'waiting',
    phaseId: null,
    phaseStatus: 'idle',
    phaseStartedAt: null,
    decisionEndsAt: null,
    phaseEndsAt: null,
    phaseDurationMs: 240000,
    decisionWindowMs: 210000,
    macro: {
      foodSecurity: 50,
      industrialOutput: 50,
      socialStability: 50,
      foreignCurrency: 50,
      policySupport: 50
    },
    agriculture: {
      alpha: 0.92,
      beta: 0.45,
      Lc: 65,
      theta: 0.60,
      Ie: 0.40,
      Ya: 0.2831,
      YaPercent: 28
    },
    industry: {
      P1: 0.45,
      P2: 0.35,
      P3: 0.20,
      P1Req: 0.40,
      gamma1: 0.60,
      gamma2: 0.90,
      gamma3: 1.20,
      Ei: 0.825,
      administrativePenalty: false
    },
    currentResult: null,
    results: {},
    learningStage: 'crisis'
  };
};

export const getNextPhaseId = (currentPhaseId) => {
  if (!currentPhaseId) return 'phase_1';
  const phaseOrder = ['phase_1', 'phase_2', 'phase_3', 'phase_4'];
  const currentIndex = phaseOrder.indexOf(currentPhaseId);
  if (currentIndex >= 0 && currentIndex < phaseOrder.length - 1) {
    return phaseOrder[currentIndex + 1];
  }
  return null;
};

export const startPhase = (state, phaseId, now = Date.now()) => {
  const expectedPhaseId = state?.phaseId
    ? (state.phaseStatus === 'resolved' ? getNextPhaseId(state.phaseId) : null)
    : (state?.status === 'waiting' ? 'phase_1' : null);
  if (!state || phaseId !== expectedPhaseId) return state;

  const cycle = getPolicyCycle(phaseId);
  const durationMs = cycle?.durationMs || 240000;
  const decisionWindowMs = cycle?.decisionWindowMs || 210000;

  return {
    ...state,
    status: phaseId,
    phaseId,
    phaseStatus: 'active',
    phaseStartedAt: now,
    decisionEndsAt: now + decisionWindowMs,
    phaseEndsAt: now + durationMs,
    currentResult: null
  };
};

export const lockPhase = (state, phaseId) => {
  if (state.phaseStatus !== 'active' || (phaseId && state.phaseId !== phaseId)) {
    return state;
  }
  return {
    ...state,
    phaseStatus: 'resolved'
  };
};

export const buildTimeoutDecision = (phaseId, playerId, roleId, submittedAt = Date.now()) => {
  const cycle = getPolicyCycle(phaseId);
  return {
    playerId,
    roleId,
    phaseId,
    optionId: cycle?.defaultOptionId || 'default',
    taskCompleted: false,
    autoSubmitted: true,
    submittedAt
  };
};

export const canSubmitDecision = ({ state, phaseId, playerId, decisions = {}, submitted = {} }) => {
  if (!state || state.status !== phaseId || state.phaseStatus !== 'active') {
    return false;
  }
  if (decisions && decisions[playerId]) {
    return false;
  }
  if (submitted && submitted[phaseId]) {
    return false;
  }
  return true;
};

export const canResolvePhase = ({ state, phaseId, isHost }) => {
  if (!isHost) return false;
  if (!state || state.status !== phaseId || state.phaseStatus !== 'active') {
    return false;
  }
  return true;
};
