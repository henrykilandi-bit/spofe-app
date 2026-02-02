/**
 * SPOFE Guardian → HTTP Mapping (Contractual)
 *
 * Purpose: Stable, versionable, auditable mapping of Guardian violations to HTTP responses
 *
 * Design Principle:
 * ✅ One source of truth
 * ✅ Language-independent (could be in config/database)
 * ✅ Version-controlled
 * ✅ Never ambiguous
 * ✅ No business logic here (only mapping)
 *
 * Violation Codes Reference:
 * - G4-01: Process ordering violation (process graph traversal)
 * - G4-02: Shared state inconsistency (SILC invariants)
 * - G4-03: Implicit authority forbidden (only explicit role grants allowed)
 * - G4-04: Global system invariants (I1–I8)
 * - G4-05: Governance bypass attempt (direct DB mutation attempt)
 * - G4-UNKNOWN: Unclassified Guardian rejection
 */

export interface GuardianHttpMapping {
  status: number;
  code: string;
  message: string;
  description?: string;
}

export const guardianHttpMap: Record<string, GuardianHttpMapping> = {
  /**
   * G4-01: Process Ordering Violation
   * When: Process execution violates graph traversal rules
   * Example: Trying to execute FINALIZE before APPROVE
   */
  'G4-01': {
    status: 409,
    code: 'PROCESS_ORDER_VIOLATION',
    message: 'Process cannot be executed in this order',
    description: 'The process graph does not allow this operation at this state',
  },

  /**
   * G4-02: Shared State Inconsistency
   * When: SILC invariants (Consistency) are violated
   * Example: Aggregate locked by another transaction
   */
  'G4-02': {
    status: 409,
    code: 'STATE_INCONSISTENCY',
    message: 'Shared state invariant violated',
    description: 'System cannot guarantee consistency for this operation',
  },

  /**
   * G4-03: Implicit Authority Forbidden
   * When: Role trying to execute without explicit grant
   * Example: USER trying CREATE_AGGREGATE (not in role permissions)
   */
  'G4-03': {
    status: 403,
    code: 'IMPLICIT_AUTHORITY',
    message: 'Implicit authority is forbidden',
    description: 'Only explicit role grants are allowed (implicit authority banned)',
  },

  /**
   * G4-04: Global Invariant Violation
   * When: System invariants I1–I8 are violated
   * Example: Data validation failure, constraint breach
   */
  'G4-04': {
    status: 422,
    code: 'INVARIANT_VIOLATION',
    message: 'System invariant violated',
    description: 'One or more global system invariants failed validation',
  },

  /**
   * G4-05: Governance Bypass Attempt
   * When: Direct database mutation detected (circumventing Guardian)
   * Example: Trying to INSERT directly instead of via Command
   */
  'G4-05': {
    status: 403,
    code: 'GOVERNANCE_BYPASS',
    message: 'Governance bypass attempt detected',
    description: 'All mutations must flow through Guardian (no direct DB access)',
  },

  /**
   * G4-UNKNOWN: Unclassified Rejection
   * When: Guardian rejects but violation code is not recognized
   * Fallback: Safe default
   */
  'G4-UNKNOWN': {
    status: 400,
    code: 'GUARDIAN_REJECTED',
    message: 'Guardian rejected the request',
    description: 'Guardian made a rejection decision (code unclassified)',
  },
};

/**
 * Lookup Guardian mapping with fallback
 *
 * @param violationCode - Guardian violation code
 * @returns Mapping or fallback for unknown codes
 */
export function getGuardianHttpMapping(violationCode: string): GuardianHttpMapping {
  return guardianHttpMap[violationCode] ?? guardianHttpMap['G4-UNKNOWN'];
}

/**
 * All valid violation codes (for validation)
 */
export const validViolationCodes = Object.keys(guardianHttpMap);
