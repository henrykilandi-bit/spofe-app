/**
 * SPOFE Frontend Contract Enforcer - Error Types
 * 
 * Typed errors for clear frontend reactions
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

export type FceErrorType =
  | 'AUTH_ERROR'        // 401 - Identity problem (technical)
  | 'GUARDIAN_ERROR'    // 403/404/409 - Business decision
  | 'SYSTEM_ERROR';     // 500+ - Infrastructure failure

export class FceError extends Error {
  readonly type: FceErrorType;
  readonly status: number;
  readonly payload?: unknown;

  constructor(
    type: FceErrorType,
    status: number,
    message: string,
    payload?: unknown
  ) {
    super(message);
    this.name = 'FceError';
    this.type = type;
    this.status = status;
    this.payload = payload;
  }
}

/**
 * ⚠️ ERROR MAPPING RULES (STRICT)
 * 
 * 401 → AUTH_ERROR
 *   - Invalid token
 *   - Expired token
 *   - Missing token (when required)
 *   - Frontend action: Redirect to login
 * 
 * 403/404/409 → GUARDIAN_ERROR
 *   - Business rule violation
 *   - Invariant violation
 *   - Resource not found (business)
 *   - Frontend action: Display error message
 * 
 * 500+ → SYSTEM_ERROR
 *   - Infrastructure failure
 *   - Unexpected errors
 *   - Frontend action: Generic error page
 * 
 * NEVER mix auth and business errors.
 * The mapping is contractual and enforced by CI.
 */
