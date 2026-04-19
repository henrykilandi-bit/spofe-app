import { ParametersFrame } from '../types/ParametersFrame';
import { GuardianViolation } from '../../shared/errors';

export function invariantSingleActiveFrame(
  existingFrames: ParametersFrame[],
  candidate: ParametersFrame
): void {
  if (candidate.status !== 'ACTIVE') return;

  const activeExists = existingFrames.some(
    (f) => f.status === 'ACTIVE'
  );

  if (activeExists) {
    throw new GuardianViolation(
      'G-P01 violation: only one ACTIVE ParametersFrame is allowed'
    );
  }
}
