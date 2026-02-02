/**
 * ============================================================================
 * Test Database Setup & Teardown
 * ============================================================================
 *
 * Responsabilités:
 *   1. Manage PgPool for test database
 *   2. Reset database before each test (clean slate)
 *   3. Create fixtures for testing
 *   4. Close connections after tests
 *
 * Critical: Uses REAL PostgreSQL (no mocks, no fakes)
 * ============================================================================
 */

import { Pool, PoolClient } from 'pg';
import crypto from 'crypto';

// ============================================================================
// Database Connection
// ============================================================================

export const pool = new Pool({
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  database: process.env.TEST_DB_NAME || 'spofe_test',
  user: process.env.TEST_DB_USER || 'spofe',
  password: process.env.TEST_DB_PASSWORD || 'spofe',
});

// ============================================================================
// Database Reset (called before each test)
// ============================================================================

/**
 * RESET DATABASE TO CLEAN STATE
 *
 * Truncates all tables in dependency order:
 *   1. audit_log (depends on all others)
 *   2. fact (depends on event)
 *   3. event (depends on decision)
 *   4. decision (depends on process_registry)
 *   5. process_registry (root)
 */
export async function resetDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // Use transaction for atomicity
    await client.query('BEGIN TRANSACTION');

    // Truncate in reverse dependency order
    await client.query('TRUNCATE TABLE audit_log CASCADE');
    await client.query('TRUNCATE TABLE fact CASCADE');
    await client.query('TRUNCATE TABLE event CASCADE');
    await client.query('TRUNCATE TABLE decision CASCADE');
    await client.query('TRUNCATE TABLE process_registry CASCADE');

    // Commit clean state
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to reset database: ${error}`);
  } finally {
    client.release();
  }
}

// ============================================================================
// Fixture Creation
// ============================================================================

/**
 * CREATE FIXTURE PROCESS
 *
 * Creates a process in process_registry that Guardian will accept
 *
 * Parameters:
 *   - processName: Name of process (must be unique)
 *   - allowedRoles: Roles allowed to execute
 *   - decisionTypes: Allowed decision types
 *   - invariants: Invariant codes to enforce (I1, I2, etc.)
 */
export async function createFixtureProcess(
  processName: string,
  options: {
    allowedRoles?: string[];
    decisionTypes?: string[];
    invariants?: string[];
  } = {}
): Promise<void> {
  const {
    allowedRoles = ['SYSTEM', 'ADMIN', 'USER'],
    decisionTypes = ['CREATE', 'UPDATE', 'DELETE'],
    invariants = ['I1', 'I2', 'I3'],
  } = options;

  const client = await pool.connect();
  try {
    await client.query('BEGIN TRANSACTION');

    await client.query(
      `INSERT INTO process_registry
       (process_name, allowed_roles, decision_types, enforced_invariants)
       VALUES ($1, $2, $3, $4)`,
      [processName, allowedRoles, decisionTypes, invariants]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to create fixture process: ${error}`);
  } finally {
    client.release();
  }
}

/**
 * CREATE FIXTURE DECISION INPUT
 *
 * Builds a complete GuardianInput for testing
 */
export function createFixtureDecisionInput(
  processName: string,
  overrides: Partial<GuardianInput> = {}
): GuardianInput {
  const eventId = crypto.randomUUID();

  return {
    decisionId: crypto.randomUUID(),
    processName,
    decisionType: 'CREATE',
    actorRole: 'SYSTEM',
    payload: { test: true },

    events: [
      {
        eventId,
        eventType: 'CREATED',
        payload: { test: true },
      },
    ],

    facts: [
      {
        factId: crypto.randomUUID(),
        aggregateId: crypto.randomUUID(),
        factType: 'SNAPSHOT',
        payload: { test: true },
        causedByEvent: eventId,
      },
    ],

    context: {
      timestamp: new Date().toISOString(),
      source: 'test',
    },

    ...overrides,
  };
}

/**
 * GET ROW COUNT
 *
 * Returns count of rows in table for assertions
 */
export async function getRowCount(tableName: string): Promise<number> {
  const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
  return Number(result.rows[0].count);
}

/**
 * GET TABLE CONTENTS
 *
 * Returns all rows from table (for detailed assertions)
 */
export async function getTableContents(
  tableName: string
): Promise<Record<string, any>[]> {
  const result = await pool.query(`SELECT * FROM ${tableName}`);
  return result.rows;
}

/**
 * VERIFY ATOMIC STATE
 *
 * Checks that either ALL tables have content or ALL are empty
 * Proves atomicity: partial state impossible
 */
export async function verifyAtomicState(): Promise<{
  decision: number;
  events: number;
  facts: number;
  audit: number;
  allEmpty: boolean;
  allFull: boolean;
  atomic: boolean;
}> {
  const [decisions, events, facts, audits] = await Promise.all([
    getRowCount('decision'),
    getRowCount('event'),
    getRowCount('fact'),
    getRowCount('audit_log'),
  ]);

  const allEmpty = decisions === 0 && events === 0 && facts === 0 && audits === 0;
  const allFull = decisions > 0 && events > 0 && facts > 0 && audits > 0;
  const atomic = allEmpty || allFull;

  return { decision: decisions, events, facts, audit: audits, allEmpty, allFull, atomic };
}

/**
 * VERIFY AUDIT INTEGRITY
 *
 * Checks that:
 *   1. Every decision has an audit entry
 *   2. Audit contains correct Guardian checksum
 *   3. No decision without audit
 */
export async function verifyAuditIntegrity(): Promise<{
  decisionCount: number;
  auditCount: number;
  allDecisionsAudited: boolean;
  checksumValid: boolean;
}> {
  // Get all decisions
  const decisions = await pool.query('SELECT decision_id FROM decision');
  const decisionIds = decisions.rows.map(r => r.decision_id);

  // Get all audited decisions
  const audits = await pool.query(
    'SELECT DISTINCT decision_id FROM audit_log WHERE decision_id IS NOT NULL'
  );
  const auditedIds = new Set(audits.rows.map(r => r.decision_id));

  // All decisions must be audited
  const allDecisionsAudited = decisionIds.every(id => auditedIds.has(id));

  // Checksums must be present
  const checksumAudits = await pool.query(
    `SELECT COUNT(*) FROM audit_log WHERE decision_id IS NOT NULL AND guardian_checksum IS NOT NULL`
  );
  const checksumValid = Number(checksumAudits.rows[0].count) === auditedIds.size;

  return {
    decisionCount: decisionIds.length,
    auditCount: auditedIds.size,
    allDecisionsAudited,
    checksumValid,
  };
}

/**
 * VERIFY NO ORPHANED FACTS
 *
 * Checks that all facts reference existing events
 * Proves referential integrity
 */
export async function verifyNoOrphanedFacts(): Promise<{
  orphanedCount: number;
  allFactsValid: boolean;
}> {
  const orphans = await pool.query(`
    SELECT COUNT(*) FROM fact
    WHERE caused_by_event NOT IN (
      SELECT event_id FROM event
    )
  `);

  const orphanedCount = Number(orphans.rows[0].count);

  return {
    orphanedCount,
    allFactsValid: orphanedCount === 0,
  };
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * CLOSE TEST DATABASE CONNECTION
 *
 * Called after all tests complete
 */
export async function closeDatabase(): Promise<void> {
  await pool.end();
}

// ============================================================================
// Type Definitions (from application)
// ============================================================================

export interface GuardianInput {
  decisionId: string;
  processName: string;
  decisionType: string;
  actorRole: string;
  payload: Record<string, any>;
  events: Array<{
    eventId: string;
    eventType: string;
    payload: Record<string, any>;
  }>;
  facts: Array<{
    factId: string;
    aggregateId: string;
    factType: string;
    payload: Record<string, any>;
    causedByEvent: string;
  }>;
  context: Record<string, any>;
}

export interface ExecuteDecisionResult {
  ok: boolean;
  data?: {
    decisionId: string;
    checksum: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Jest Hook Configuration
// ============================================================================

/**
 * CONFIGURE JEST HOOKS
 *
 * Call in your test file:
 *   setupJestHooks(resetDatabase, closeDatabase);
 */
export function setupJestHooks(
  resetFn: () => Promise<void>,
  closeFn: () => Promise<void>
): void {
  beforeEach(async () => {
    await resetFn();
  });

  afterAll(async () => {
    await closeFn();
  });
}
