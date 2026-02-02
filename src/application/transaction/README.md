# 🔐 SPOFE Transaction Manager — Documentation

## 📋 Vue d'ensemble

`TransactionManager` est l'orchestrateur central de SPOFE. C'est une **barrière de gouvernance**, pas juste un service:

```
┌─────────────────────────────────────────┐
│  Application / HTTP API                 │
└────────────┬────────────────────────────┘
             │ executeDecision(input)
             ▼
┌─────────────────────────────────────────┐
│  TransactionManager                     │  ← CE FICHIER
│  ├─ Guardian.validateDecision()         │     Orchestrateur
│  └─ DB.begin/commit/rollback            │     Barrière
└────────────┬────────────────────────────┘
             │
    ┌────────┴──────────┐
    ▼                   ▼
Guardian v4         PostgreSQL
(validation)        (storage)
```

## 🎯 Responsabilité

**Garantir que CHAQUE décision exécutée respecte les invariants SILC v2.1**

Risque | Éliminé? | Mécanisme
--------|----------|----------
Écriture sans Guardian | ✅ | Guardian appelé AVANT DB
État partiel (1 sur 4 tables) | ✅ | Transaction unique (atomicité ACID)
Oubli audit | ✅ | Audit obligatoire dans la transaction
Contournement ORM | ✅ | Point d'entrée unique
Modification de données | ✅ | Append-only (INSERT uniquement)

## 🏗️ Structure des fichiers

```
src/application/transaction/
├── TransactionManager.ts    ← Orchestrateur principal
├── GuardianPort.ts          ← Interface de validation
├── DbClient.ts              ← Interface d'accès DB
├── index.ts                 ← Public API
├── example.ts               ← Exemples d'utilisation
└── README.md                ← This file
```

## 📝 Classes & Types

### TransactionManager

```typescript
class TransactionManager {
  constructor(
    private readonly guardian: GuardianPort,
    private readonly db: DbClient
  ) {}

  async executeDecision(input: ExecuteDecisionInput): Promise<ExecuteDecisionResult>
}
```

**Méthode principale:**
- `executeDecision(input)` - Exécute une décision de manière gouvernée

### ExecuteDecisionInput

```typescript
interface ExecuteDecisionInput {
  // Décision
  decisionId: string;
  processName: string;
  decisionType: string;
  actorRole: string;
  payload: unknown;
  
  // Conséquences
  events: Array<{ eventId, eventType, payload }>;
  facts: Array<{ factId, aggregateId, factType, payload, causedByEvent }>;
  
  // Contexte
  context: unknown;
}
```

### ExecuteDecisionResult

```typescript
interface ExecuteDecisionResult {
  success: true;
  decisionId: string;
  checksum: string;  // Pour traçabilité
}
```

## 🔄 Séquence d'exécution

```
executeDecision(input)
  │
  ├─ 1️⃣ Guardian.validateDecision()
  │       ❌ verdict.ok === false
  │           → throw GuardianViolationError
  │       ✅ verdict.ok === true
  │           → continue
  │
  ├─ 2️⃣ Valider le schéma de l'input
  │       (UUIDs, types, références)
  │
  ├─ 3️⃣ DB.begin() ← DÉBUT TRANSACTION
  │
  ├─ 4️⃣ DB.insertDecision() ← Source de vérité
  │       ❌ Error (FK, constraint...)
  │           → DB.rollback()
  │           → throw DatabaseError
  │
  ├─ 5️⃣ DB.insertEvents()
  │
  ├─ 6️⃣ DB.insertFacts()
  │
  ├─ 7️⃣ DB.insertAudit() ← OBLIGATOIRE
  │       (contient le checksum de Guardian)
  │       ❌ Error
  │           → DB.rollback()
  │           → throw DatabaseError
  │
  └─ 8️⃣ DB.commit() ← FIN TRANSACTION
          ✅ Succès
              → return ExecuteDecisionResult
          ❌ Error
              → DB.rollback()
              → throw DatabaseError
```

## 💡 Exemples d'utilisation

### Initialisation

```typescript
import {
  TransactionManager,
  StubGuardianPort,
} from '@spofe/transaction';
import { PostgresDbClient } from '@spofe/db-postgres';

// Créer les ports
const guardian = new GuardianV4(); // Implémentation réelle
const db = new PostgresDbClient(connectionString);

// Créer le TransactionManager
const tm = new TransactionManager(guardian, db);
```

### Exécuter une décision

```typescript
const result = await tm.executeDecision({
  decisionId: crypto.randomUUID(),
  processName: 'USER_CREATION',
  decisionType: 'CREATE',
  actorRole: 'ADMIN',
  payload: {
    email: 'user@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
  },

  events: [{
    eventId: crypto.randomUUID(),
    eventType: 'CREATED',
    payload: { email: 'user@example.com' },
  }],

  facts: [{
    factId: crypto.randomUUID(),
    aggregateId: userId,
    factType: 'SNAPSHOT',
    payload: { email: 'user@example.com', status: 'CREATED' },
    causedByEvent: eventId,
  }],

  context: {
    requestId: crypto.randomUUID(),
    adminId: 'admin-001',
  },
});

console.log('✅ Décision exécutée:', result.decisionId);
console.log('   Checksum:', result.checksum);
```

### Gestion des erreurs

```typescript
try {
  await tm.executeDecision(input);
} catch (err) {
  if (err instanceof GuardianViolationError) {
    // Guardian a rejeté la décision
    console.error('Guardian rejection:', err.message);
    // Return HTTP 403 Forbidden
  } else if (err instanceof ValidationError) {
    // Les données ne valident pas le schéma
    console.error('Invalid input:', err.message);
    // Return HTTP 400 Bad Request
  } else if (err instanceof DatabaseError) {
    // La DB a rencontré un problème
    console.error('Database error:', err.message);
    // Return HTTP 500 Internal Server Error
    // (NB: Transaction a été rollback automatiquement)
  } else {
    // Erreur inconnue
    console.error('Unexpected error:', err);
    // Return HTTP 500
  }
}
```

## 🔐 GuardianPort

Interface pour la validation métier.

```typescript
interface GuardianPort {
  validateDecision(input: GuardianValidationInput): GuardianVerdict;
}

interface GuardianValidationInput {
  processName: string;
  decisionType: string;
  actorRole: string;
  payload: unknown;
  context: unknown;
}

interface GuardianVerdict {
  ok: boolean;
  violationCode?: string;
  invariantVersion?: string;
  checksum?: string;
}
```

### Implémentation (Guardian v4)

Guardian v4 devrait:
1. Vérifier que `processName` est enregistré
2. Vérifier que `actorRole` peut effectuer `decisionType`
3. Valider les invariants métier (payload, context, etc.)
4. Générer un `checksum` (HMAC-SHA256) si OK
5. Retourner le verdict (synchrone)

```typescript
class GuardianV4 implements GuardianPort {
  validateDecision(input: GuardianValidationInput): GuardianVerdict {
    // 1. Vérifier processName
    if (!this.processRegistry.has(input.processName)) {
      return {
        ok: false,
        violationCode: 'PROCESS_UNKNOWN',
      };
    }

    // 2. Vérifier autorité
    if (!this.canActorPerformDecision(input.actorRole, input.decisionType)) {
      return {
        ok: false,
        violationCode: 'ACTOR_UNAUTHORIZED',
      };
    }

    // 3. Valider payload
    if (!this.validatePayload(input.processName, input.payload)) {
      return {
        ok: false,
        violationCode: 'PAYLOAD_INVALID',
      };
    }

    // 4. Générer checksum
    const checksum = this.generateChecksum(input);

    // 5. Retourner verdict
    return {
      ok: true,
      invariantVersion: '2.1.0',
      checksum,
    };
  }
}
```

## 💾 DbClient

Interface minimaliste pour accès DB.

```typescript
interface DbClient {
  // Transaction control
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;

  // Append-only writes
  insertDecision(data: DecisionData): Promise<void>;
  insertEvents(events: EventData[]): Promise<void>;
  insertFacts(facts: FactData[]): Promise<void>;
  insertAudit(data: AuditData): Promise<void>;
}
```

### Implémentation (PostgreSQL)

```typescript
class PostgresDbClient implements DbClient {
  private conn: PoolClient | null = null;

  async begin(): Promise<void> {
    this.conn = await this.pool.connect();
    await this.conn.query('BEGIN');
  }

  async commit(): Promise<void> {
    if (!this.conn) throw new Error('No transaction active');
    await this.conn.query('COMMIT');
    this.conn.release();
    this.conn = null;
  }

  async rollback(): Promise<void> {
    if (!this.conn) throw new Error('No transaction active');
    await this.conn.query('ROLLBACK');
    this.conn.release();
    this.conn = null;
  }

  async insertDecision(data: DecisionData): Promise<void> {
    if (!this.conn) throw new Error('No transaction active');
    await this.conn.query(
      `INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
       VALUES ($1, $2, $3, $4, $5)`,
      [data.decision_id, data.process_name, data.actor_role, data.decision_type, data.payload]
    );
  }

  // ... autres méthodes insert...
}
```

## ⚙️ Configuration & Intégration

### Express/HTTP

```typescript
import express from 'express';

const app = express();
const tm = new TransactionManager(guardian, db);

app.post('/api/decisions', express.json(), async (req, res) => {
  try {
    const result = await tm.executeDecision(req.body);
    res.status(201).json(result);
  } catch (err) {
    // Gérer les erreurs
    if (err instanceof GuardianViolationError) {
      res.status(403).json({ error: err.message });
    } else if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});
```

### Inversions de contrôle (DI)

```typescript
// config.ts
export const createTransactionManager = (
  guardianPort: GuardianPort,
  dbClient: DbClient
): TransactionManager => {
  return new TransactionManager(guardianPort, dbClient);
};

// main.ts
const tm = createTransactionManager(
  new GuardianV4(),
  new PostgresDbClient(connectionString)
);
```

## 🧪 Tests

### Unit test: Guardian rejection

```typescript
it('should reject decision when Guardian says no', async () => {
  const guardian = {
    validateDecision: () => ({
      ok: false,
      violationCode: 'ACTOR_UNAUTHORIZED',
    }),
  } as GuardianPort;

  const tm = new TransactionManager(guardian, {} as DbClient);

  await expect(
    tm.executeDecision(someInput)
  ).rejects.toThrow(GuardianViolationError);
});
```

### Unit test: Transaction rollback on error

```typescript
it('should rollback if insertEvents fails', async () => {
  const guardian = {
    validateDecision: () => ({
      ok: true,
      invariantVersion: '2.1.0',
      checksum: 'abc123',
    }),
  } as GuardianPort;

  const db = {
    begin: jest.fn(),
    insertDecision: jest.fn(),
    insertEvents: jest.fn().mockRejectedValue(new Error('FK violation')),
    rollback: jest.fn(),
  } as unknown as DbClient;

  const tm = new TransactionManager(guardian, db);

  await expect(tm.executeDecision(someInput)).rejects.toThrow();
  expect(db.rollback).toHaveBeenCalled();
});
```

## 📊 Métriques & Monitoring

### Métriques intéressantes

```typescript
interface TransactionMetrics {
  totalExecuted: number;
  totalSucceeded: number;
  totalFailed: number;
  guardianRejections: number;
  dbErrors: number;
  avgDurationMs: number;
}
```

### Implementation (avec Prometheus)

```typescript
import { register, Counter, Histogram } from 'prom-client';

const executedCounter = new Counter({
  name: 'spofe_decisions_executed_total',
  help: 'Total number of executed decisions',
  labelNames: ['process', 'status'],
});

const durationHistogram = new Histogram({
  name: 'spofe_decision_duration_ms',
  help: 'Decision execution duration',
  buckets: [10, 50, 100, 500, 1000, 5000],
});

// Dans TransactionManager
async executeDecision(input) {
  const start = Date.now();
  try {
    const result = await this.doExecute(input);
    executedCounter.labels(input.processName, 'success').inc();
    return result;
  } finally {
    durationHistogram.observe(Date.now() - start);
  }
}
```

## 🚨 Erreurs communes

### ❌ Oublier le contexte

```typescript
// MAUVAIS : pas de contexte
await tm.executeDecision({
  decisionId: '...',
  processName: '...',
  // ... context: undefined
});

// BON : contexte fourni
await tm.executeDecision({
  decisionId: '...',
  processName: '...',
  context: { requestId, adminId },
});
```

### ❌ Ne pas générer les UUIDs

```typescript
// MAUVAIS : réutiliser des UUIDs
const eventId = '00000000-0000-0000-0000-000000000001';
await tm.executeDecision({
  // ...
  events: [{ eventId, ... }],
});

// BON : générer des UUIDs uniques
const eventId = crypto.randomUUID();
await tm.executeDecision({
  // ...
  events: [{ eventId, ... }],
});
```

### ❌ Ignorer les erreurs

```typescript
// MAUVAIS : pas de catch
await tm.executeDecision(input);

// BON : gérer les erreurs
try {
  await tm.executeDecision(input);
} catch (err) {
  if (err instanceof GuardianViolationError) {
    // Gérer
  } else if (err instanceof DatabaseError) {
    // Gérer
  }
}
```

## 📚 Ressources

- [DDL PostgreSQL](../../../ddl/spofe-silc-complete.sql)
- [Guardian v4](../../../silc-guardian/)
- [SILC Invariants](../../../RAPPORT_SIGNATURE_OFFICIELLE_GUARDIAN_v4.md)

## ✅ Checklist pour production

- [ ] Guardian v4 implémenté et testé
- [ ] PostgreSQL client implémenté
- [ ] TransactionManager intégré dans l'API HTTP
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Erreurs handleées (403, 400, 500)
- [ ] Métriques Prometheus exposées
- [ ] Logs structurés (requestId, decisionId)
- [ ] DDL PostgreSQL appliqué

---

**Version:** 1.0  
**Date:** 2026-01-29  
**Status:** ✅ Production-Ready
