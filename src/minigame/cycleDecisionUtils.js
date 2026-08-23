import { getPolicyCycle, POLICY_CYCLES } from './policyCycles.js';

export const getDecisionOptions = (phaseId) => {
  const cycle = getPolicyCycle(phaseId);
  return cycle?.options || [];
};

export const buildDecisionPayload = ({
  playerId,
  roleId,
  phaseId,
  optionId,
  taskCompleted = false,
  autoSubmitted = false,
  submittedAt = Date.now()
}) => {
  if (!playerId) throw new Error('playerId is required');
  if (!phaseId) throw new Error('phaseId is required');
  if (!optionId) throw new Error('optionId is required');

  return {
    playerId,
    roleId: roleId || 'doan_xa_agriculture',
    phaseId,
    optionId,
    taskCompleted: Boolean(taskCompleted),
    autoSubmitted: Boolean(autoSubmitted),
    submittedAt
  };
};
