// ==================================================================================
// Application Bootstrap
// Wiring final: où tout s'assemble
// ==================================================================================

import {
  TransactionManager,
  GuardianPort,
} from '../application/transaction/index';
import {
  GuardianV4Adapter,
  guardianV4,
} from '../infrastructure/guardian/index';
import {
  PostgresDbClient,
  pgPool,
} from '../infrastructure/db/index';

/**
 * ✅ SINGLETON INSTANCES (créés une seule fois au démarrage)
 */

// 1. Guardian adapter (wraps SilcGuardian v4)
const guardianAdapter: GuardianPort = new GuardianV4Adapter(guardianV4);

// 2. Database client (wraps PostgreSQL pool)
const dbClient = new PostgresDbClient(pgPool);

// 3. Transaction manager (orchestre tout)
const transactionManager = new TransactionManager(guardianAdapter, dbClient);

/**
 * ✅ EXPORTS (ce que l'application utilise)
 */

export { transactionManager };
export { guardianAdapter };
export { dbClient };
export { pgPool };

/**
 * ✅ GUARANTEES (ce que cette architecture fournit)
 *
 * 1️⃣ Isolation
 *    - Guardian: connaît rien de DB
 *    - DB: connaît rien de Guardian
 *    - TransactionManager: connaît via interfaces abstraites
 *
 * 2️⃣ Aucun couplage
 *    - Impossible d'utiliser Guardian sans TransactionManager
 *    - Impossible d'écrire en DB sans Guardian
 *    - Impossible d'écrire sans audit
 *
 * 3️⃣ Pipeline fermé
 *    Command
 *      ↓
 *    TransactionManager.executeDecision()
 *      ├→ Guardian validates
 *      ├→ DB transaction
 *      ├→ Mandatory audit
 *      └→ Commit or rollback
 *      ↓
 *    Response
 *
 * 4️⃣ Zéro voie alternative
 *    ❌ SQL direct (impossible: DbClient abstrait)
 *    ❌ Guardian skip (impossible: TransactionManager l'appelle toujours)
 *    ❌ Audit skip (impossible: INSERT audit LAST)
 *    ❌ Partial state (impossible: transaction atomique)
 *
 * ➡️  SPOFE est un système FERMÉ
 */
