import { GuardianViolation } from '../../shared/errors';

export function invariantAppendOnly(
  isMutation: boolean
): void {
  if (isMutation) {
    throw new GuardianViolation(
      'G-P02 violation: ParametersFrame is append-only'
    );
  }
}
