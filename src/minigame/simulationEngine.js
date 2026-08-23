import { POLICY_CYCLES, PHASE_4_PRESETS, getPolicyCycle } from './policyCycles.js';
import { getCharacterOption } from './characterOptions.js';

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const calculateAgriculture = ({
  alpha = 0.92,
  beta = 0.45,
  Lc = 65,
  theta = 0.60
} = {}) => {
  const clampedLc = clamp(Lc, 0, 100);
  const clampedTheta = clamp(theta, 0, 1);
  const lcNormalized = clampedLc / 100;
  const Ie = Number((1 - clampedTheta).toFixed(4));

  let Ya = 0;
  if (lcNormalized > 0 && Ie > 0) {
    Ya = alpha * Math.pow(lcNormalized, beta) * Math.pow(Ie, 1 - beta);
  }
  const YaPercent = Math.round(Ya * 100);

  return {
    alpha,
    beta,
    Lc: clampedLc,
    theta: clampedTheta,
    Ie,
    Ya: Number(Ya.toFixed(4)),
    YaPercent
  };
};

export const calculateIndustry = ({
  P1 = 0.45,
  P2 = 0.35,
  P3 = 0.20,
  P1Req = 0.40,
  gamma1 = 0.60,
  gamma2 = 0.90,
  gamma3 = 1.20
} = {}) => {
  const sum = P1 + P2 + P3;
  if (Math.abs(sum - 1) > 0.001) {
    throw new Error(`Sum of P1, P2, P3 must equal 1 (got ${sum})`);
  }

  const Ei = Number((gamma1 * P1 + gamma2 * P2 + gamma3 * P3).toFixed(4));
  const administrativePenalty = P1 < (P1Req - 0.0001);

  return {
    P1,
    P2,
    P3,
    P1Req,
    gamma1,
    gamma2,
    gamma3,
    Ei,
    administrativePenalty
  };
};

export const OPTION_EFFECTS = {
  keep_piecework: {
    foodSecurity: 2,
    socialStability: -6,
    policySupport: 3,
    foreignCurrency: 0,
    industrialOutput: 0
  },
  try_harvest_contract: {
    foodSecurity: 8,
    socialStability: 4,
    policySupport: -5,
    foreignCurrency: 0,
    industrialOutput: 0
  },
  wait_state_supply: {
    industrialOutput: -6,
    foreignCurrency: 3,
    policySupport: 2,
    foodSecurity: 0,
    socialStability: 0
  },
  borrow_fx_import: {
    industrialOutput: 9,
    foreignCurrency: -8,
    policySupport: -3,
    foodSecurity: 0,
    socialStability: 0
  },
  report_truth: {
    policySupport: 8,
    socialStability: 3,
    foodSecurity: 0,
    foreignCurrency: 0,
    industrialOutput: 0
  },
  hide_data: {
    policySupport: -8,
    socialStability: -4,
    industrialOutput: 3,
    foodSecurity: 0,
    foreignCurrency: 0
  }
};

export const validateDecision = ({ phaseId, optionId, taskCompleted }) => {
  const cycle = POLICY_CYCLES.find(c => c.id === phaseId);
  if (!cycle) {
    return { valid: false, error: `Invalid phaseId: ${phaseId}` };
  }
  const optionExists = cycle.options.some(opt => opt.id === optionId);
  if (!optionExists) {
    return { valid: false, error: `Invalid optionId: ${optionId} for ${phaseId}` };
  }
  return { valid: true };
};

export const calculateScore = ({
  roleId,
  optionId,
  taskCompleted = false,
  autoSubmitted = false,
  result = {},
  macroDelta = result?.macroDelta || {}
}) => {
  const taskBonus = taskCompleted ? 5 : 0;
  const timeoutBonus = autoSubmitted ? -3 : 2;
  const decisionBonus = result?.winningOptionId && optionId === result.winningOptionId ? 5 : 0;

  const role = getCharacterOption(roleId);
  let roleBonus = 0;
  if (role && Array.isArray(role.preferredMetrics)) {
    role.preferredMetrics.forEach(metric => {
      const delta = macroDelta[metric] || 0;
      if (delta > 0) {
        roleBonus += delta;
      }
    });
  }

  const scoreDelta = taskBonus + timeoutBonus + decisionBonus + roleBonus;

  const explanation = [
    taskCompleted ? '+5 điểm nhiệm vụ bản đồ' : '0 điểm nhiệm vụ (chưa hoàn thành)',
    autoSubmitted ? '-3 điểm (quá giờ / tự động)' : '+2 điểm quyết định đúng giờ',
    `+5 điểm thực thi quyết định`,
    roleBonus > 0 ? `+${roleBonus} điểm lợi thế vai trò (${role?.shortLabel || 'Vai trò'})` : '0 điểm lợi thế vai trò'
  ].join(' | ');

  return {
    scoreDelta,
    taskBonus,
    timeoutBonus,
    decisionBonus,
    roleBonus,
    explanation
  };
};

export const resolvePhase = ({
  phaseId,
  state,
  decisions = {},
  players = {}
}) => {
  const cycle = getPolicyCycle(phaseId);
  const isValidPhaseDecision = (decision) => (
    decision
    && decision.phaseId === phaseId
    && cycle.options.some((option) => option.id === decision.optionId)
  );
  const decisionList = Object.values(decisions || {}).filter(isValidPhaseDecision);

  // Determine winning option by tallying votes
  let winningOptionId = cycle.defaultOptionId;
  if (decisionList.length > 0) {
    const voteCounts = {};
    decisionList.forEach(d => {
      voteCounts[d.optionId] = (voteCounts[d.optionId] || 0) + 1;
    });

    let maxVotes = -1;
    for (const [optId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        winningOptionId = optId;
      }
    }
  }

  const currentMacro = state.macro || {
    foodSecurity: 50,
    industrialOutput: 50,
    socialStability: 50,
    foreignCurrency: 50,
    policySupport: 50
  };

  let macroDelta = {
    foodSecurity: 0,
    industrialOutput: 0,
    socialStability: 0,
    foreignCurrency: 0,
    policySupport: 0
  };

  let updatedAgriculture = { ...(state.agriculture || {}) };
  let updatedIndustry = { ...(state.industry || {}) };

  if (phaseId === 'phase_4') {
    const preset = PHASE_4_PRESETS[winningOptionId] || PHASE_4_PRESETS.balanced_khoan;
    const agri = calculateAgriculture({
      alpha: 0.92,
      beta: 0.45,
      Lc: preset.Lc,
      theta: preset.theta
    });
    const ind = calculateIndustry({
      P1: preset.P1,
      P2: preset.P2,
      P3: preset.P3,
      P1Req: 0.40,
      gamma1: 0.60,
      gamma2: 0.90,
      gamma3: 1.20
    });

    updatedAgriculture = agri;
    updatedIndustry = ind;

    macroDelta.foodSecurity = Math.round(agri.YaPercent * 0.12);
    macroDelta.industrialOutput = Math.round(ind.Ei * 10);
    macroDelta.socialStability = Math.round((agri.Ie * 10) + (preset.P3 * 10));
    macroDelta.foreignCurrency = Math.round(preset.P3 * 15 - 3);
    macroDelta.policySupport = Math.round((preset.P1 - 0.30) * 33.3);

    if (ind.administrativePenalty) {
      macroDelta.policySupport -= 10;
      macroDelta.industrialOutput -= 5;
    }
  } else {
    const baseEffects = OPTION_EFFECTS[winningOptionId] || {};
    macroDelta = {
      foodSecurity: baseEffects.foodSecurity || 0,
      industrialOutput: baseEffects.industrialOutput || 0,
      socialStability: baseEffects.socialStability || 0,
      foreignCurrency: baseEffects.foreignCurrency || 0,
      policySupport: baseEffects.policySupport || 0
    };
  }

  const nextMacro = {
    foodSecurity: clamp(currentMacro.foodSecurity + macroDelta.foodSecurity, 0, 100),
    industrialOutput: clamp(currentMacro.industrialOutput + macroDelta.industrialOutput, 0, 100),
    socialStability: clamp(currentMacro.socialStability + macroDelta.socialStability, 0, 100),
    foreignCurrency: clamp(currentMacro.foreignCurrency + macroDelta.foreignCurrency, 0, 100),
    policySupport: clamp(currentMacro.policySupport + macroDelta.policySupport, 0, 100)
  };

  // Calculate scores for all players
  const playerScores = {};
  const playerList = Object.entries(players || {});
  playerList.forEach(([playerId, player]) => {
    const submittedDecision = decisions?.[playerId];
    const playerDecision = isValidPhaseDecision(submittedDecision) ? submittedDecision : {
      playerId,
      roleId: player.roleId,
      phaseId,
      optionId: cycle.defaultOptionId,
      taskCompleted: false,
      autoSubmitted: true
    };

    const scoreData = calculateScore({
      roleId: player.roleId || playerDecision.roleId,
      optionId: playerDecision.optionId,
      taskCompleted: Boolean(playerDecision.taskCompleted),
      autoSubmitted: Boolean(playerDecision.autoSubmitted),
      result: { winningOptionId, macroDelta },
      macroDelta
    });

    playerScores[playerId] = {
      playerId,
      roleId: player.roleId || playerDecision.roleId,
      scoreDelta: scoreData.scoreDelta,
      currentScore: (player.score || 0) + scoreData.scoreDelta,
      ...scoreData
    };
  });

  const winningOption = cycle.options.find(o => o.id === winningOptionId);

  const phaseResult = {
    phaseId,
    year: cycle.year,
    winningOptionId,
    winningOptionTitle: winningOption?.title || winningOptionId,
    macroDelta,
    macro: nextMacro,
    agriculture: updatedAgriculture,
    industry: updatedIndustry,
    totalVotes: decisionList.length
  };

  const nextState = {
    ...state,
    phaseStatus: 'resolved',
    macro: nextMacro,
    agriculture: updatedAgriculture,
    industry: updatedIndustry,
    currentResult: phaseResult,
    results: {
      ...(state.results || {}),
      [phaseId]: phaseResult
    }
  };

  return {
    nextState,
    phaseResult,
    playerScores
  };
};
