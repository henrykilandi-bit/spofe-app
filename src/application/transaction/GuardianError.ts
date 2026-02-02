/**
 * SPOFE Guardian Error — Typed Exception for Guardian Rejections
 *
 * Purpose: Standardize all Guardian rejections as typed exceptions
 *
 * Design Principle:
 * - Guardian is sovereign (makes decisions)
 * - This class carries Guardian's decision
 * - HTTP layer will map violation code to HTTP status
 * - No ambiguity, no side effects
 *
 * CRITICAL: Never suppress or retry on GuardianError
 * GuardianError = Guardian said NO
 * Guardian said NO = We obey
 */

export class GuardianError extends Error {
  /**
   * @param violationCode - Guardian violation code (e.g., 'G4-01', 'G4-03')
   * @param message - Human-readable reason why Guardian rejected
   *
   * Example:
   * throw new GuardianError(
   *   'G4-03',
   *   'Role USER cannot execute CREATE_AGGREGATE'
   * );
   */
  constructor(
    public readonly violationCode: string,
    public readonly message: string
  ) {
    super(message);
    this.name = 'GuardianError';

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, GuardianError.prototype);
  }

  /**
   * Returns true if this is a Guardian violation
   * (used in error handlers)
   */
  isGuardianViolation(): boolean {
    return this instanceof GuardianError;
  }

  /**
   * For logging and debugging
   */
  toJSON() {
    return {
      name: this.name,
      violationCode: this.violationCode,
      message: this.message,
    };
  }
}

/**
 * Type guard for Guardian errors
 */
export function isGuardianError(error: unknown): error is GuardianError {
  return error instanceof GuardianError;
}
