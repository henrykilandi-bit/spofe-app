/**
 * GuardianError
 * Version: 1.0.0
 */

import { VIOLATION_CODES, ViolationCode } from '../../application/transaction/GuardianPort';

export class GuardianError extends Error {
  constructor(
    public readonly violationCode: ViolationCode,
    message?: string
  ) {
    super(message || `Guardian violation: ${violationCode}`);
    this.name = 'GuardianError';
  }

  static invalidProcess(message?: string): GuardianError {
    return new GuardianError(VIOLATION_CODES.INVALID_PROCESS, message);
  }

  static invalidActor(message?: string): GuardianError {
    return new GuardianError(VIOLATION_CODES.INVALID_ACTOR, message);
  }

  static invalidDecisionType(message?: string): GuardianError {
    return new GuardianError(VIOLATION_CODES.INVALID_DECISION_TYPE, message);
  }

  static invariantViolation(message?: string): GuardianError {
    return new GuardianError(VIOLATION_CODES.INVARIANT_VIOLATION, message);
  }

  static internalError(message?: string): GuardianError {
    return new GuardianError(VIOLATION_CODES.INTERNAL_ERROR, message);
  }
}