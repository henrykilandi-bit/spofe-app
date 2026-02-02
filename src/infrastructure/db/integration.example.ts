// ==================================================================================
// SPOFE — Integration Example
// Montre comment connecter TransactionManager + PostgresDbClient + Guardian
// ==================================================================================

import {
  TransactionManager,
  GuardianViolationError,
  ValidationError,
  DatabaseError,
} from '@spofe/transaction';
import {
  pgPool,
  PostgresDbClient,
} from '@spofe/db-postgres';
import { GuardianV4 } from '@spofe/silc-guardian';

// ─────────────────────────────────────────────
// 1. Initialisation
// ─────────────────────────────────────────────

/**
 * Initialise le système SPOFE complet
 */
function initializeSpofe() {
  // Pool PostgreSQL
  const pool = pgPool;

  // DbClient (implémentation concrète)
  const dbClient = new PostgresDbClient(pool);

  // Guardian v4 (validation métier)
  const guardian = new GuardianV4();

  // TransactionManager (orchestrateur)
  const tm = new TransactionManager(guardian, dbClient);

  return { pool, dbClient, guardian, tm };
}

// ─────────────────────────────────────────────
// 2. Utilisation en Express
// ─────────────────────────────────────────────

import express from 'express';

const app = express();
const { tm } = initializeSpofe();

/**
 * POST /api/decisions
 * 
 * Exécute une décision de manière gouvernée
 * 
 * Request body:
 * {
 *   "processName": "USER_CREATION",
 *   "decisionType": "CREATE",
 *   "actorRole": "ADMIN",
 *   "payload": { "email": "..." },
 *   "events": [...],
 *   "facts": [...],
 *   "context": { "requestId": "..." }
 * }
 */
app.post('/api/decisions', express.json(), async (req, res) => {
  try {
    const result = await tm.executeDecision({
      decisionId: crypto.randomUUID(),
      processName: req.body.processName,
      decisionType: req.body.decisionType,
      actorRole: req.body.actorRole,
      payload: req.body.payload,
      events: req.body.events,
      facts: req.body.facts,
      context: {
        requestId: req.headers['x-request-id'] || crypto.randomUUID(),
        userId: req.user?.id,
        ipAddress: req.ip,
      },
    });

    // ✅ Succès
    res.status(201).json({
      success: true,
      decisionId: result.decisionId,
      checksum: result.checksum,
    });
  } catch (err) {
    // ❌ Erreurs de validation métier
    if (err instanceof GuardianViolationError) {
      console.error('Guardian rejection:', err.message);
      return res.status(403).json({
        error: 'Guardian validation failed',
        message: err.message,
      });
    }

    // ❌ Erreurs de schéma
    if (err instanceof ValidationError) {
      console.error('Validation error:', err.message);
      return res.status(400).json({
        error: 'Invalid input',
        message: err.message,
      });
    }

    // ❌ Erreurs de base de données
    if (err instanceof DatabaseError) {
      console.error('Database error:', err.message);
      return res.status(500).json({
        error: 'Database error',
        message: 'An error occurred while executing the decision',
      });
    }

    // ❌ Erreurs inattendues
    console.error('Unexpected error:', err);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// ─────────────────────────────────────────────
// 3. Utilisation en CLI
// ─────────────────────────────────────────────

/**
 * CLI pour exécuter une décision
 */
async function cliExecuteDecision() {
  const { tm } = initializeSpofe();

  const decision = {
    decisionId: crypto.randomUUID(),
    processName: 'USER_CREATION',
    decisionType: 'CREATE',
    actorRole: 'ADMIN',
    payload: {
      email: 'jean.dupont@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
    },
    events: [
      {
        eventId: crypto.randomUUID(),
        eventType: 'CREATED',
        payload: {
          email: 'jean.dupont@example.com',
          timestamp: new Date().toISOString(),
        },
      },
    ],
    facts: [
      {
        factId: crypto.randomUUID(),
        aggregateId: crypto.randomUUID(), // userId
        factType: 'SNAPSHOT',
        payload: {
          email: 'jean.dupont@example.com',
          status: 'CREATED',
        },
        causedByEvent: decision.events[0].eventId,
      },
    ],
    context: {
      requestId: crypto.randomUUID(),
      adminId: 'admin-001',
    },
  };

  try {
    const result = await tm.executeDecision(decision);
    console.log('✅ Decision executed:');
    console.log('   ID:', result.decisionId);
    console.log('   Checksum:', result.checksum);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────
// 4. Utilisation en tests
// ─────────────────────────────────────────────

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('TransactionManager + PostgresDbClient', () => {
  let tm: TransactionManager;
  let pool: any;

  beforeAll(async () => {
    const init = initializeSpofe();
    tm = init.tm;
    pool = init.pool;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should execute a valid decision', async () => {
    const result = await tm.executeDecision({
      decisionId: crypto.randomUUID(),
      processName: 'USER_CREATION',
      decisionType: 'CREATE',
      actorRole: 'ADMIN',
      payload: { email: 'test@example.com' },
      events: [{
        eventId: crypto.randomUUID(),
        eventType: 'CREATED',
        payload: {},
      }],
      facts: [{
        factId: crypto.randomUUID(),
        aggregateId: crypto.randomUUID(),
        factType: 'SNAPSHOT',
        payload: { status: 'CREATED' },
        causedByEvent: result.events[0]?.eventId || '',
      }],
      context: {},
    });

    expect(result.success).toBe(true);
    expect(result.decisionId).toBeDefined();
    expect(result.checksum).toBeDefined();
  });

  it('should reject invalid process', async () => {
    await expect(
      tm.executeDecision({
        decisionId: crypto.randomUUID(),
        processName: 'UNKNOWN_PROCESS',
        decisionType: 'CREATE',
        actorRole: 'ADMIN',
        payload: {},
        events: [],
        facts: [],
        context: {},
      })
    ).rejects.toThrow(GuardianViolationError);
  });
});

// ─────────────────────────────────────────────
// 5. Monitoring & Logging
// ─────────────────────────────────────────────

import pino from 'pino';

const logger = pino();

/**
 * Wrapper avec logging
 */
async function executeDecisionWithLogging(
  tm: TransactionManager,
  input: any
) {
  const requestId = input.context?.requestId || crypto.randomUUID();
  const log = logger.child({ requestId, decisionId: input.decisionId });

  log.info({ processName: input.processName }, 'Executing decision');

  const start = Date.now();

  try {
    const result = await tm.executeDecision(input);
    const duration = Date.now() - start;

    log.info(
      { duration, checksum: result.checksum },
      'Decision executed successfully'
    );

    return result;
  } catch (err) {
    const duration = Date.now() - start;

    if (err instanceof GuardianViolationError) {
      log.warn(
        { duration, error: err.message },
        'Guardian validation failed'
      );
    } else if (err instanceof DatabaseError) {
      log.error(
        { duration, error: err.message },
        'Database error'
      );
    } else {
      log.error(
        { duration, error: err },
        'Unexpected error'
      );
    }

    throw err;
  }
}

// ─────────────────────────────────────────────
// 6. Application shutdown
// ─────────────────────────────────────────────

/**
 * Graceful shutdown
 */
async function gracefulShutdown() {
  console.log('Shutting down...');

  // Fermer le pool
  const { pool } = initializeSpofe();
  await pool.end();

  console.log('Pool closed');
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// ─────────────────────────────────────────────
// Exécution
// ─────────────────────────────────────────────

if (require.main === module) {
  if (process.argv[2] === 'cli') {
    cliExecuteDecision().catch(console.error);
  } else {
    const { tm } = initializeSpofe();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 SPOFE API listening on port ${PORT}`);
    });
  }
}

export { initializeSpofe, executeDecisionWithLogging };
