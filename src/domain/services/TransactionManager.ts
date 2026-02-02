/**
 * SPOFE TransactionManager — Guardian Integration Layer
 *
 * Purpose: Route mutations through Guardian, enforce SILC invariants
 *
 * Design Principle:
 * ✅ Single entry point for all mutations
 * ✅ Guardian is sovereign (decisions are final)
 * ✅ Throws GuardianError on rejection (no suppression)
 * ✅ Manages transaction lifecycle (commit/rollback)
 * ✅ No business logic here (routing only)
 *
 * Flow:
 * Command.execute()
 *   ↓
 * TransactionManager.execute(mutation)
 *   ↓
 * Guardian.validate(mutation)
 *   ├─ ACCEPT → proceed to DB
 *   └─ REJECT → throw GuardianError (violationCode + message)
 *   ↓
 * Database.commit() OR rollback()
 *   ↓
 * Return result OR throw error
 *
 * CRITICAL: If Guardian rejects, we throw immediately.
 * We never "handle" Guardian's rejection.
 */

import { GuardianV4Adapter } from '../../infrastructure/guardian/GuardianV4Adapter';
import { SilcRepository } from '../../infrastructure/persistence/SilcRepository';
import { GuardianError } from '../transaction/GuardianError';
import { VIOLATION_CODES, ViolationCode } from '../../application/transaction/GuardianPort';

/**
 * Mutation request (generic structure for any command)
 */
export interface MutationRequest {
  processName: string; // e.g., 'CREATE_AGGREGATE'
  actorRole: 'SYSTEM' | 'ADMIN' | 'USER';
  aggregateId: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Guardian verdict (what Guardian decides)
 */
export interface GuardianVerdict {
  ok: boolean;
  violationCode?: string; // If rejected: G4-01, G4-03, etc.
  reason?: string; // Human-readable rejection reason
}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean;
  data?: unknown;
  error?: GuardianError;
}

/**
 * TransactionManager: Single entry point for all mutations
 *
 * SILC Guarantees:
 * - Atomicity: All or nothing (PostgreSQL ACID)
 * - Consistency: Guardian validates invariants
 * - Isolation: Transaction-level isolation
 * - Durability: PostgreSQL ensures persistence
 */
export class TransactionManager {
  constructor(
    private readonly guardian: GuardianV4Adapter,
    private readonly repository: SilcRepository<any, string>
  ) {}

  /**
   * Execute a mutation under Guardian's authority
   *
   * Flow:
   * 1. Ask Guardian: "Can this actor execute this process?"
   * 2. Guardian says YES → proceed to database
   * 3. Guardian says NO → throw GuardianError (decision is final)
   * 4. Commit atomically OR rollback on error
   *
   * @param request - Mutation request (process, actor, data)
   * @returns Transaction result (success/error)
   * @throws GuardianError if Guardian rejects
   */
  async execute(request: MutationRequest): Promise<void> {
    // ============================================
    // STEP 1: Ask Guardian (Sovereign Decision)
    // ============================================
    const verdict = await this.guardian.validateMutation({
      processName: request.processName,
      actorRole: request.actorRole,
    });

    // ============================================
    // STEP 2: Guardian Response
    // ============================================
    if (!verdict.ok) {
      // Guardian said NO.
      // We DO NOT suppress, retry, or "fix" this.
      // We throw GuardianError with Guardian's violation code.
      // The error handler will map this to HTTP.

      const violationCode = verdict.violationCode ?? 'G4-UNKNOWN';
      const reason = 'Guardian validation failed';  // Raison par défaut

      throw new GuardianError(
        (verdict.violationCode || VIOLATION_CODES.UNKNOWN) as ViolationCode, 
        reason
      );
    }

    // Guardian said YES → proceed
    // (No DB mutation yet, Guardian's verdict is advisory)

    // ============================================
    // STEP 3: Execute Mutation (Atomically)
    // ============================================
    // This is where actual database mutation happens
    // Still in a transaction: if anything fails, rollback

    try {
      // Delegate to repository (Guardian has approved)
      // Repository is responsible for actual persistence
      await this.repository.persist(request);

      // Success: transaction committed by repository
    } catch (error) {
      // Database error during mutation
      // Transaction already rolled back by database
      throw error;
    }
  }

  /**
   * Execute a read-only query (no Guardian validation)
   *
   * Reads don't need Guardian approval:
   * - No state mutation
   * - No invariant impact
   * - Safe to execute immediately
   *
   * @param aggregateId - What to read
   * @returns Query result
   */
  async query<T>(aggregateId: string): Promise<T | null> {
    return this.repository.query<T>(aggregateId);
  }
}

/**
 * Factory: Create TransactionManager with Guardian & DB
 *
 * Usage in server.ts:
 * const tm = createTransactionManager(
 *   new GuardianV4Adapter(),
 *   new SilcRepository()
 * );
 */
export function createTransactionManager(
  guardian: GuardianV4Adapter,
  repository: SilcRepository<any, string>
): TransactionManager {
  return new TransactionManager(guardian, repository);
}
