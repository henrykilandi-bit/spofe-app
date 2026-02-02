// ==================================================================================
// SPOFE Transaction — Example d'utilisation
// ==================================================================================
// Démontre comment utiliser TransactionManager dans une application
// ==================================================================================

import {
  TransactionManager,
  type ExecuteDecisionInput,
  StubGuardianPort,
} from './index';
import type { DbClient } from './DbClient';

// ─────────────────────────────────────────────
// Example 1 : Créer un utilisateur (USER_CREATION)
// ─────────────────────────────────────────────

/**
 * Cas d'usage : Un admin crée un nouvel utilisateur
 * 
 * Processus SPOFE :
 *   1. Guardian valide que ADMIN peut créer un utilisateur
 *   2. Decision est créée (source de vérité)
 *   3. Event CREATED est généré
 *   4. Fact USER_SNAPSHOT est créé
 *   5. Audit trail enregistré
 */
async function exampleCreateUser(
  tm: TransactionManager,
  dbClient: DbClient
) {
  const userId = crypto.randomUUID();
  const decisionId = crypto.randomUUID();
  
  // Créer l'événement d'abord
  const createEvent = {
    eventId: crypto.randomUUID(),
    eventType: 'CREATED',
    payload: {
      userId,
      email: 'jean.dupont@example.com',
      timestamp: new Date().toISOString(),
    },
  };

  const input: ExecuteDecisionInput = {
    // Décision
    decisionId,
    processName: 'USER_CREATION',
    decisionType: 'CREATE',
    actorRole: 'ADMIN',
    payload: {
      userId,
      email: 'jean.dupont@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
    },

    // Conséquences observables
    events: [createEvent],

    facts: [
      {
        factId: crypto.randomUUID(),
        aggregateId: userId,
        factType: 'SNAPSHOT',
        payload: {
          userId,
          email: 'jean.dupont@example.com',
          firstName: 'Jean',
          lastName: 'Dupont',
          status: 'CREATED',
          createdAt: new Date().toISOString(),
        },
        causedByEvent: createEvent.eventId,
      },
    ],

    // Contexte
    context: {
      requestId: crypto.randomUUID(),
      adminId: 'admin-001',
      ipAddress: '192.168.1.100',
    },
  };

  try {
    const result = await tm.executeDecision(input);
    console.log('✅ User created:', result);
  } catch (err) {
    console.error('❌ Creation failed:', err);
  }
}

// ─────────────────────────────────────────────
// Example 2 : Assigner un rôle à un utilisateur
// ─────────────────────────────────────────────

/**
 * Cas d'usage : Un admin assigne le rôle USER à un utilisateur
 * 
 * Processus SPOFE :
 *   USER_CREATION → USER_ACTIVATION → USER_ROLE_ASSIGNMENT
 */
async function exampleAssignRole(
  tm: TransactionManager,
  userId: string,
  requestId: string
) {
  const decisionId = crypto.randomUUID();
  
  // Créer l'événement d'abord
  const updateEvent = {
    eventId: crypto.randomUUID(),
    eventType: 'UPDATED',
    payload: {
      userId,
      role: 'USER',
      timestamp: new Date().toISOString(),
    },
  };

  const input: ExecuteDecisionInput = {
    // Décision
    decisionId,
    processName: 'USER_ROLE_ASSIGNMENT',
    decisionType: 'UPDATE',
    actorRole: 'ADMIN',
    payload: {
      userId,
      role: 'USER',
      reason: 'Regular user access',
    },

    // Conséquences observables
    events: [updateEvent],

    facts: [
      {
        factId: crypto.randomUUID(),
        aggregateId: userId,
        factType: 'SNAPSHOT',
        payload: {
          userId,
          roles: ['USER'],
          assignedAt: new Date().toISOString(),
          assignedBy: 'admin-001',
        },
        causedByEvent: updateEvent.eventId,
      },
    ],

    // Contexte
    context: {
      requestId,
      adminId: 'admin-001',
      ipAddress: '192.168.1.100',
    },
  };

  try {
    const result = await tm.executeDecision(input);
    console.log('✅ Role assigned:', result);
  } catch (err) {
    console.error('❌ Role assignment failed:', err);
  }
}

// ─────────────────────────────────────────────
// Example 3 : Utilisation complète
// ─────────────────────────────────────────────

/**
 * Démontre la création et l'utilisation de TransactionManager
 */
async function demonstrateTransactionManager() {
  // 1. Créer les ports (implémentations réelles)
  const guardian = new StubGuardianPort(); // En production: instance réelle
  const dbClient: DbClient = {
    begin: async () => console.log('DB: BEGIN'),
    commit: async () => console.log('DB: COMMIT'),
    rollback: async () => console.log('DB: ROLLBACK'),
    insertDecision: async (data) => console.log('DB: INSERT decision', data),
    insertEvents: async (events) => console.log('DB: INSERT events', events),
    insertFacts: async (facts) => console.log('DB: INSERT facts', facts),
    insertAudit: async (data) => console.log('DB: INSERT audit', data),
  };

  // 2. Créer TransactionManager
  const tm = new TransactionManager(guardian, dbClient);

  // 3. Exécuter une décision
  console.log('═══════════════════════════════════════════════');
  console.log('Example: Create User');
  console.log('═══════════════════════════════════════════════');
  await exampleCreateUser(tm, dbClient);

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('Example: Assign Role');
  console.log('═══════════════════════════════════════════════');
  const userId = crypto.randomUUID();
  const requestId = crypto.randomUUID();
  await exampleAssignRole(tm, userId, requestId);
}

// ─────────────────────────────────────────────
// Exécution
// ─────────────────────────────────────────────

if (require.main === module) {
  demonstrateTransactionManager().catch(console.error);
}

// Export pour utilisation dans tests
export { exampleCreateUser, exampleAssignRole, demonstrateTransactionManager };
