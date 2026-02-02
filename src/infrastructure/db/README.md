# 🗄️ SPOFE PostgreSQL Infrastructure — Documentation

## 📋 Vue d'ensemble

Module d'infrastructure pour accès PostgreSQL selon la gouvernance SPOFE.

```
TransactionManager (orchestration)
         ↓
PostgresDbClient (implémentation)
         ↓
PostgreSQL (exécution + imposition)
```

## 🏗️ Structure

```
src/infrastructure/db/
├── PgPool.ts                 ← Configuration du pool
├── PostgresDbClient.ts       ← Implémentation du DbClient
├── index.ts                  ← Public API
├── sql/
│   ├── insertDecision.sql
│   ├── insertEvent.sql
│   ├── insertFact.sql
│   └── insertAudit.sql
└── README.md                 ← This file
```

## 🔌 Installation

```bash
npm install pg
npm install --save-dev @types/pg
```

## 🚀 Utilisation

### Initialisation

```typescript
import { pgPool, PostgresDbClient } from '@spofe/db-postgres';
import { TransactionManager } from '@spofe/transaction';

// 1. Créer le pool PostgreSQL
const pool = pgPool;

// 2. Créer le DbClient
const dbClient = new PostgresDbClient(pool);

// 3. Créer TransactionManager
const guardian = new GuardianV4();
const tm = new TransactionManager(guardian, dbClient);
```

### Configuration du pool

```typescript
import { createPgPool } from '@spofe/db-postgres';

const pool = createPgPool({
  host: 'db.example.com',
  port: 5432,
  database: 'spofe_prod',
  user: 'spofe_user',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30_000,
});

const dbClient = new PostgresDbClient(pool);
```

### Via variables d'environnement

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=spofe
export DB_USER=postgres
export DB_PASSWORD=spofe_secure_pwd_2026
export DB_SSL=false
```

```typescript
const pool = createPgPool(); // Utilise les env vars
const dbClient = new PostgresDbClient(pool);
```

## 🔐 Garanties PostgreSQL

### Immutabilité (I-DB-01)

PostgreSQL empêche UPDATE/DELETE par:
- ✅ Triggers bloquant les modifications
- ✅ Permissions REVOKED sur UPDATE/DELETE
- ✅ Append-only strictement enforced

```sql
-- UPDATE attempt
UPDATE decision SET payload = '{}' WHERE decision_id = 'xxx';
-- ERROR: IMMUTABLE TABLE: UPDATE/DELETE forbidden by SILC v2.1

-- DELETE attempt
DELETE FROM event WHERE event_id = 'xxx';
-- ERROR: IMMUTABLE TABLE: UPDATE/DELETE forbidden by SILC v2.1
```

### Contraintes d'intégrité (I-DB-02, I-DB-03)

PostgreSQL applique les FK:

```sql
-- Event sans Decision
INSERT INTO event (event_id, decision_id, event_type, payload)
VALUES ('...', 'invalid-uuid', 'CREATED', '{}');
-- ERROR: insert or update on table "event" violates foreign key constraint

-- Decision sans process
INSERT INTO decision (decision_id, process_name, actor_role, decision_type, payload)
VALUES ('...', 'UNKNOWN_PROCESS', 'SYSTEM', 'CREATE', '{}');
-- ERROR: insert or update on table "decision" violates foreign key constraint
```

### Enums (I-DB-03)

PostgreSQL valide les ENUMs:

```sql
-- actor_role invalide
INSERT INTO decision (..., actor_role = 'INVALID_ROLE', ...)
-- ERROR: invalid input value for enum actor_role

-- decision_type invalide
INSERT INTO decision (..., decision_type = 'INVALID_TYPE', ...)
-- ERROR: invalid input value for enum decision_type
```

## 🔄 Transaction Management

### Atomicité

```typescript
const tm = new TransactionManager(guardian, dbClient);

try {
  const result = await tm.executeDecision({
    decisionId: '...',
    // ...
  });
  // Tout a réussi
  console.log('✅ Decision executed');
} catch (err) {
  // Aucune donnée partielle
  // ROLLBACK automatique par PostgresDbClient
  console.error('❌ Transaction failed, rolled back');
}
```

### Ordre des opérations

```
1. Guardian.validateDecision()
2. DB.begin()
3. INSERT decision     ← source de vérité
4. INSERT events      ← conséquences observables
5. INSERT facts       ← état dérivé
6. INSERT audit       ← traçabilité
7. DB.commit()        ← tout ou rien
```

### Gestion d'erreurs

```
À chaque étape:
  ❌ Erreur
    → DB.rollback() automatique
    → throw DatabaseError
    → Aucune donnée partielle
```

## 📊 Architecture d'insertion

### Decision

```typescript
await dbClient.insertDecision({
  decision_id: 'uuid',
  process_name: 'USER_CREATION',
  actor_role: 'ADMIN',
  decision_type: 'CREATE',
  payload: { email: '...' },
});
```

**Table target:** `decision`  
**FK checked:** `process_name` → `process_registry.process_name`  
**Triggers:** `no_update_delete_decision`

### Events

```typescript
await dbClient.insertEvents([
  {
    event_id: 'uuid',
    decision_id: 'uuid',
    event_type: 'CREATED',
    payload: { email: '...' },
  },
]);
```

**Table target:** `event`  
**FK checked:** `decision_id` → `decision.decision_id`  
**Triggers:** `no_update_delete_event`

### Facts

```typescript
await dbClient.insertFacts([
  {
    fact_id: 'uuid',
    aggregate_id: 'user-id',
    fact_type: 'SNAPSHOT',
    payload: { status: 'CREATED' },
    caused_by_event: 'uuid',
  },
]);
```

**Table target:** `fact`  
**FK checked:** `caused_by_event` → `event.event_id`  
**Triggers:** `no_update_delete_fact`

### Audit

```typescript
await dbClient.insertAudit({
  audit_id: 'uuid',
  decision_id: 'uuid',
  invariant_version: '2.1.0',
  checksum: 'hmac-sha256...',
});
```

**Table target:** `audit_log`  
**FK checked:** `decision_id` → `decision.decision_id`  
**Triggers:** `no_update_delete_audit`

## 🧪 Tests

### Test: Isolation de transaction

```typescript
it('should not allow concurrent transactions', async () => {
  const client1 = new PostgresDbClient(pool);
  const client2 = new PostgresDbClient(pool);

  await client1.begin();
  
  // client2 ne peut pas commencer tant que client1 n'a pas commit
  try {
    await client2.begin();
    await client2.insertDecision({...});
  } catch (err) {
    // Attention: Par design, client2 peut acquérir un autre
    // PoolClient (si max > 1). Aucun verrouillage au niveau client.
  }

  await client1.commit();
});
```

### Test: Rollback automatique

```typescript
it('should rollback on error', async () => {
  const dbClient = new PostgresDbClient(pool);
  const tm = new TransactionManager(guardian, dbClient);

  await expect(
    tm.executeDecision({
      // ... données invalides ...
      processName: 'UNKNOWN_PROCESS',
    })
  ).rejects.toThrow();

  // Vérifier qu'aucune donnée n'a été insérée
  const result = await pool.query(
    `SELECT COUNT(*) FROM decision WHERE decision_id = $1`,
    ['...']
  );
  expect(result.rows[0].count).toBe(0);
});
```

### Test: FK enforced

```typescript
it('should reject event with invalid decision_id', async () => {
  const dbClient = new PostgresDbClient(pool);
  
  await dbClient.begin();
  
  await expect(
    dbClient.insertEvents([
      {
        event_id: crypto.randomUUID(),
        decision_id: 'invalid-uuid', // N'existe pas
        event_type: 'CREATED',
        payload: {},
      },
    ])
  ).rejects.toThrow(); // FK violation
  
  await dbClient.rollback();
});
```

## 🔧 Configuration avancée

### SSL

```typescript
import { createPgPool } from '@spofe/db-postgres';

const pool = createPgPool({
  ssl: {
    rejectUnauthorized: false, // Dev only!
  },
});
```

### Retry (custom)

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 100 * attempt));
    }
  }
  throw new Error('Retry failed');
}

// Utilisation
const result = await withRetry(() => tm.executeDecision(input));
```

### Connection pooling monitoring

```typescript
setInterval(() => {
  console.log('Pool idle:', pool.idleCount);
  console.log('Pool total:', pool.totalCount);
  console.log('Pool waiting:', pool.waitingCount);
}, 10_000);
```

## 🚨 Erreurs communes

### ❌ Oublier begin()

```typescript
const dbClient = new PostgresDbClient(pool);

// MAUVAIS
await dbClient.insertDecision({...});
// → Error: NO_ACTIVE_TRANSACTION

// BON
await dbClient.begin();
await dbClient.insertDecision({...});
await dbClient.commit();
```

### ❌ Réutiliser le DbClient après rollback

```typescript
const dbClient = new PostgresDbClient(pool);

await dbClient.begin();
await dbClient.insertDecision({...});
await dbClient.rollback();

// MAUVAIS
await dbClient.insertEvent({...});
// → Error: NO_ACTIVE_TRANSACTION

// BON
await dbClient.begin();
await dbClient.insertEvent({...});
await dbClient.commit();
```

### ❌ Ignorer les FK violations

```typescript
// MAUVAIS
try {
  await dbClient.insertEvents([{
    event_id: 'uuid',
    decision_id: 'unknown-uuid',
    event_type: 'CREATED',
    payload: {},
  }]);
} catch (err) {
  // Ignorer silencieusement
}

// BON
try {
  await dbClient.insertEvents([{...}]);
} catch (err) {
  await dbClient.rollback();
  throw err; // Propager l'erreur
}
```

## 📈 Performance

### Batch insert

```typescript
// Par défaut : insert séquentiel (plus sûr)
await dbClient.insertEvents([
  { event_id: '1', ... },
  { event_id: '2', ... },
  { event_id: '3', ... },
]);
```

### Pool configuration

```typescript
createPgPool({
  max: 20,           // Max connections
  idleTimeoutMillis: 30_000,  // 30s
  connectionTimeoutMillis: 5_000, // 5s
});
```

## 📚 SQL Queries

Les fichiers SQL sont fournis à titre documentaire. Le code TypeScript utilise des parameterized queries pour éviter les injections.

### insertDecision.sql

```sql
INSERT INTO decision (...) VALUES ($1, $2, $3, $4, $5);
```

### insertEvent.sql

```sql
INSERT INTO event (...) VALUES ($1, $2, $3, $4);
```

### insertFact.sql

```sql
INSERT INTO fact (...) VALUES ($1, $2, $3, $4, $5);
```

### insertAudit.sql

```sql
INSERT INTO audit_log (...) VALUES ($1, $2, $3, $4);
```

## ✅ Checklist déploiement

- [ ] PostgreSQL 15+ installé et accessible
- [ ] DDL `spofe-silc-complete.sql` exécuté
- [ ] Rôles `spofe_writer`, `spofe_reader` créés
- [ ] Tables write-model ont leurs triggers
- [ ] Vues read-model existent
- [ ] Paramètres DB_HOST, DB_NAME, etc. configurés
- [ ] Pool max adapté à la charge
- [ ] Tests d'intégrité DB passent
- [ ] Monitoring du pool configuré

## 📞 Support

**Erreur:** `connect ECONNREFUSED 127.0.0.1:5432`  
→ PostgreSQL n'est pas en cours d'exécution ou l'hôte est incorrect

**Erreur:** `ROLE spofe_writer does not exist`  
→ DDL n'a pas été exécuté. Lancer `psql < ddl/spofe-silc-complete.sql`

**Erreur:** `connection timeout after 5000ms`  
→ PostgreSQL trop lent ou réseau problématique. Augmenter `connectionTimeoutMillis`

---

**Version:** 1.0  
**Date:** 2026-01-29  
**Status:** ✅ Production-Ready
