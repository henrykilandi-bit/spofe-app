# SPOFE Module Creation Guide — Process & Best Practices

> **Version**: 1.0.0  
> **Governance**: SPOFE P0  
> **Last Updated**: 2026-02-03  
> **Author**: SPOFE System Architecture

---

## Table of Contents

1. [Overview](#overview)
2. [Module Lifecycle](#module-lifecycle)
3. [Phase 1: Preparation & Contracts](#phase-1-preparation--contracts)
4. [Phase 2: Guardian Implementation](#phase-2-guardian-implementation)
5. [Phase 3: Read-Models & API](#phase-3-read-models--api)
6. [Phase 4: Testing Strategy](#phase-4-testing-strategy)
7. [Phase 5: BUILD_PROOF Certification](#phase-5-build_proof-certification)
8. [Best Practices](#best-practices)
9. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
10. [Complete Example: Immobilisation Module](#complete-example-immobilisation-module)

---

## Overview

### What is a SPOFE Module?

A SPOFE module is a **self-contained, certifiable unit of business logic** built according to SPOFE P0 governance. It encapsulates:

- **Guardian**: Domain invariants protection
- **Read-Models**: Event-driven projections (read-only)
- **API**: GET-only interface
- **Contracts**: Machine-readable specifications
- **Tests**: Guardian + System (E2E) validation

### Key Principles

```
SPOFE P0 Governance
├─ Guardian-First (invariants before code)
├─ Document-First (facts only, no interpretation)
├─ Append-Only (no deletion, immutable history)
├─ Multi-Tenant (strict isolation)
├─ Framework-Agnostic (no framework coupling)
├─ OHADA-Compliant (accounting reference)
└─ Zero Computation (no business logic hidden in domain)
```

### Module Types

| Type | Purpose | Example |
|------|---------|---------|
| **Primary Source (write)** | Captures facts from documents | tresorerie-caisse, immobilisation |
| **Transverse (read-only)** | Aggregates facts from multiple sources | tresoconsolidation |
| **Support** | Cross-cutting concerns | authorization, audit |

---

## Module Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MODULE LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────────┘

1. PREPARATION (Contracts)
   └─ Define scope, invariants, commands, events, read-models, API

2. IMPLEMENTATION (Code)
   └─ Guardian → Read-Models → API (layers, bottom-up)

3. VALIDATION (Tests)
   └─ Guardian specs → System E2E → Coverage 100%

4. CERTIFICATION (BUILD_PROOF)
   └─ SHA256 hashes → Freeze → Sign → Mark as CERTIFIED

5. FROZEN STATE (Immutable)
   └─ Any modification requires new version
```

---

## Phase 1: Preparation & Contracts

### Step 1.1: Define Module Scope (SCOPE.md)

**File**: `cascade/modules/{module-name}/contract/SCOPE.md`

**Content**:
```markdown
# MODULE {NAME} — SCOPE (v1.0.0)

## 1. RÔLE DU MODULE
[Brief description of the module's responsibility]

## 2. IN SCOPE
- Feature 1
- Feature 2

## 3. OUT OF SCOPE (VOLONTAIRE)
- ❌ Excluded responsibility 1
- ❌ Excluded responsibility 2

## 4. REFERENTIAL
- OHADA or other accounting standard
- Legal references

## 5. GOVERNANCE
- Version: v1.0.0
- SCOPE gelé (frozen)
```

**Key Points**:
- Be explicit about what is OUT OF SCOPE
- Reference OHADA/accounting framework
- Declare all dependencies
- Scope is **immutable** once frozen

---

### Step 1.2: Define Guardian Invariants (GUARDIAN.md)

**File**: `cascade/modules/{module-name}/contract/GUARDIAN.md`

**Content**:
```markdown
# {MODULE} — GUARDIAN (P0)

## Invariants

| Code | Invariant |
|------|-----------|
| **G01** | [Invariant description] |
| **G02** | [Invariant description] |
| **Gnn** | [Final invariant] |

## Sanction

Toute violation ⇒ rejet immédiat par le Guardian.

## Statut

```
Module        : {module-name}
Version       : v1.0.0
Invariants    : G01 → Gnn
Niveau        : SPOFE P0
Statut        : ACTIF
Mutable       : NON
```
```

**Invariant Categories**:

1. **Tenant Isolation**: `G01 - TenantUnique`
2. **Data Validation**: `G02 - ValidCategory`, `G03 - DocumentRequired`
3. **Business Rules**: `G04 - ServiceAfterAcquisition`
4. **Immutability**: `G05 - AppendOnly`, `G06 - NoModificationAfterDispose`
5. **No Computation**: `G07 - NoComputations`, `G08 - NoAccountingLogic`

---

### Step 1.3: Define Commands & Events (COMMANDS_EVENTS.md)

**File**: `cascade/modules/{module-name}/contract/COMMANDS_EVENTS.md`

**Content**:
```markdown
# {MODULE} — COMMANDS & EVENTS

## Commands (Write)

| Command | Description |
|---------|-------------|
| `RegisterItem` | Register new item |
| `UpdateItem` | Update item state |
| `DisposeItem` | Remove from active |

## Events (Fact-only)

| Event | Description |
|-------|-------------|
| `ItemRegistered` | Item was registered |
| `ItemUpdated` | Item was updated |
| `ItemDisposed` | Item was removed |

## Rules

- One event = one fact
- All events document-backed
- No computed/derived events
```

**Key Points**:
- Commands are the **intent** (user action)
- Events are the **fact** (what actually happened)
- Commands validate via Guardian → approve → emit Event
- Events are **immutable** once emitted

---

### Step 1.4: Define Read-Models (READ_MODELS.md)

**File**: `cascade/modules/{module-name}/contract/READ_MODELS.md`

**Content**:
```markdown
# {MODULE} — READ MODELS

## Projections

| RM Name | Description |
|---------|-------------|
| `ItemSummaryRM` | List of all items |
| `ItemsByStatusRM` | Grouped by status |
| `ItemCountRM` | Count snapshot |

## Rules

- Read-only strict
- Event-driven projection
- Zero computation
- Zero accounting logic
- Multi-tenant filter applied
```

---

### Step 1.5: Define Read-Only API (API_READ_ONLY.md)

**File**: `cascade/modules/{module-name}/contract/API_READ_ONLY.md`

**Content**:
```markdown
# {MODULE} — API READ-ONLY

## Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/items` | List all items |
| `GET` | `/items/{id}` | Get item by ID |
| `GET` | `/items?status=active` | Filter by status |

## Headers obligatoires

| Header | Obligatoire | Description |
|--------|-------------|-------------|
| `X-Tenant-Id` | ✅ | Tenant isolation |
| `Authorization` | ✅ | Authentication |

## Rules

- GET only (no POST/PUT/DELETE)
- Multi-tenant mandatory
- No parameters affecting computation
```

---

## Phase 2: Guardian Implementation

### Step 2.1: Define Types

**File**: `cascade/modules/{module-name}/src/guardian/types.ts`

```typescript
export type ItemCategory = 'TYPE_A' | 'TYPE_B';

export interface GuardianContext {
  tenantId: string;
  actorId: string;
}

export interface ItemFact {
  itemId: string;
  tenantId: string;
  category: ItemCategory;
  amount: number;
  documentId: string;
  createdDate: string;
  status: 'ACTIVE' | 'DISPOSED';
}
```

**Key Points**:
- Types are contracts between layers
- Keep types **minimal** (only essential fields)
- Use discriminated unions for variants

---

### Step 2.2: Guardian Error

**File**: `cascade/modules/{module-name}/src/guardian/GuardianError.ts`

```typescript
export class GuardianError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianError';
  }
}
```

---

### Step 2.3: Guardian Implementation

**File**: `cascade/modules/{module-name}/src/guardian/{Module}Guardian.ts`

```typescript
import { GuardianError } from './GuardianError';
import { GuardianContext, ItemFact } from './types';

export class ItemGuardian {
  // Validate command execution context
  validateRegister(ctx: GuardianContext, fact: ItemFact): void {
    this.assertTenant(ctx, fact);              // G01
    this.assertActor(ctx);                     // G02
    this.assertCategory(fact);                 // G03
    this.assertDocument(fact);                 // G04
    this.assertPositiveAmount(fact);           // G05
    // ... more assertions
  }

  validateDispose(ctx: GuardianContext, fact: ItemFact): void {
    this.assertTenant(ctx, fact);
    this.assertHasStatus(fact, 'ACTIVE');
    this.assertNoFutureDate(fact);
  }

  // Private invariant checks (one method per invariant)
  private assertTenant(ctx: GuardianContext, fact: ItemFact) {
    if (ctx.tenantId !== fact.tenantId) {
      throw new GuardianError('Cross-tenant operation rejected');
    }
  }

  private assertActor(ctx: GuardianContext) {
    if (!ctx.actorId) {
      throw new GuardianError('ActorId is mandatory');
    }
  }

  // ... more assertions
}
```

**Key Patterns**:
- One method per invariant
- Method name = `assert{InvariantName}`
- Throw `GuardianError` immediately on violation
- No side effects (pure validation)

---

### Step 2.4: Guardian Index Export

**File**: `cascade/modules/{module-name}/src/guardian/index.ts`

```typescript
export { ItemGuardian } from './ItemGuardian';
export { GuardianError } from './GuardianError';
export type { GuardianContext, ItemFact, ItemCategory } from './types';
```

---

## Phase 3: Read-Models & API

### Step 3.1: Read-Model Types

**File**: `cascade/modules/{module-name}/src/read-models/types.ts`

```typescript
export interface ItemRM {
  itemId: string;
  tenantId: string;
  category: ItemCategory;
  amount: number;
  documentId: string;
  createdDate: string;
  status: 'ACTIVE' | 'DISPOSED';
}
```

---

### Step 3.2: Read Repository Port

**File**: `cascade/modules/{module-name}/src/read-models/ports/ItemReadRepository.ts`

```typescript
import { ItemRM } from '../types';

export interface ItemReadRepository {
  getAll(tenantId: string): Promise<ItemRM[]>;
  getById(tenantId: string, itemId: string): Promise<ItemRM | null>;
  getActive(tenantId: string): Promise<ItemRM[]>;
  getByCategory(tenantId: string, category: ItemCategory): Promise<ItemRM[]>;
}
```

**Key Points**:
- Port is a contract (interface)
- All queries take `tenantId` as first parameter
- Return `Promise` (async-ready)
- Return `null` on 404 (not throw)

---

### Step 3.3: Event-Driven Projection

**File**: `cascade/modules/{module-name}/src/read-models/ItemProjection.ts`

```typescript
import { ItemRM } from './types';

type Event =
  | { type: 'ItemRegistered'; payload: ItemRM }
  | { type: 'ItemDisposed'; payload: ItemRM };

export class ItemProjection {
  private readonly state = new Map<string, ItemRM>();

  apply(event: Event): void {
    const id = event.payload.itemId;

    switch (event.type) {
      case 'ItemRegistered':
        this.state.set(id, { ...event.payload, status: 'ACTIVE' });
        break;

      case 'ItemDisposed':
        this.state.set(id, { ...this.state.get(id)!, status: 'DISPOSED' });
        break;
    }
  }

  snapshot(): ItemRM[] {
    return Array.from(this.state.values());
  }
}
```

**Key Points**:
- Projection is **stateless** (no IO)
- Each event updates state deterministically
- `snapshot()` returns current read-model state
- Pure function (no side effects)

---

### Step 3.4: In-Memory Repository Implementation

**File**: `cascade/modules/{module-name}/src/read-models/InMemoryItemReadRepository.ts`

```typescript
import { ItemReadRepository } from './ports/ItemReadRepository';
import { ItemRM } from './types';

export class InMemoryItemReadRepository implements ItemReadRepository {
  constructor(private readonly data: ItemRM[]) {}

  async getAll(tenantId: string): Promise<ItemRM[]> {
    return this.data.filter((i) => i.tenantId === tenantId);
  }

  async getById(tenantId: string, itemId: string): Promise<ItemRM | null> {
    return (
      this.data.find(
        (i) => i.tenantId === tenantId && i.itemId === itemId
      ) ?? null
    );
  }

  async getActive(tenantId: string): Promise<ItemRM[]> {
    return this.data.filter(
      (i) => i.tenantId === tenantId && i.status === 'ACTIVE'
    );
  }

  async getByCategory(tenantId: string, category: ItemCategory): Promise<ItemRM[]> {
    return this.data.filter(
      (i) => i.tenantId === tenantId && i.category === category
    );
  }
}
```

**Key Points**:
- Implements the `ItemReadRepository` port
- Filters by `tenantId` on every query (multi-tenant safety)
- No caching, no mutation of input data
- Async-ready (returns `Promise`)

---

### Step 3.5: API Types & Controller

**File**: `cascade/modules/{module-name}/src/api/types.ts`

```typescript
export interface ApiRequest {
  tenantId: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface ApiResponse<T> {
  status: number;
  body: T;
}
```

**File**: `cascade/modules/{module-name}/src/api/ItemReadController.ts`

```typescript
import { ApiRequest, ApiResponse } from './types';
import { ItemReadRepository } from '../read-models/ports/ItemReadRepository';
import { ItemRM } from '../read-models/types';

export class ItemReadController {
  constructor(private readonly repo: ItemReadRepository) {}

  async getAll(req: ApiRequest): Promise<ApiResponse<ItemRM[]>> {
    const data = await this.repo.getAll(req.tenantId);
    return { status: 200, body: data };
  }

  async getById(req: ApiRequest): Promise<ApiResponse<ItemRM | null>> {
    const id = req.params?.id;
    if (!id) {
      return { status: 400, body: null };
    }

    const item = await this.repo.getById(req.tenantId, id);
    if (!item) {
      return { status: 404, body: null };
    }

    return { status: 200, body: item };
  }

  async getByCategory(req: ApiRequest): Promise<ApiResponse<ItemRM[]>> {
    const category = req.query?.category as ItemCategory | undefined;
    if (!category) {
      return { status: 400, body: [] };
    }

    const data = await this.repo.getByCategory(req.tenantId, category);
    return { status: 200, body: data };
  }
}
```

**Key Points**:
- Controller is **framework-agnostic** (no Express/Fastify/etc.)
- Uses abstract `ApiRequest/Response` types
- Returns HTTP status codes explicitly
- Validates parameters before calling repository
- No business logic (reads only)

---

## Phase 4: Testing Strategy

### Step 4.1: Guardian Unit Tests

**File**: `cascade/modules/{module-name}/tests/guardian/{Module}Guardian.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ItemGuardian } from '../../src/guardian/ItemGuardian';
import { GuardianError } from '../../src/guardian/GuardianError';

const guardian = new ItemGuardian();

const ctx = {
  tenantId: 'T1',
  actorId: 'A1',
};

const baseFact = {
  itemId: 'ITEM_1',
  tenantId: 'T1',
  category: 'TYPE_A' as const,
  amount: 1000,
  documentId: 'DOC_1',
  createdDate: '2026-02-01',
  status: 'ACTIVE' as const,
};

describe('GUARDIAN — Item', () => {
  it('G01 — register valid item', () => {
    expect(() => guardian.validateRegister(ctx, baseFact)).not.toThrow();
  });

  it('G02 — reject cross-tenant', () => {
    expect(() =>
      guardian.validateRegister(
        { ...ctx, tenantId: 'T2' },
        baseFact
      )
    ).toThrow(GuardianError);
  });

  it('G03 — reject missing actor', () => {
    expect(() =>
      guardian.validateRegister(
        { ...ctx, actorId: '' },
        baseFact
      )
    ).toThrow(GuardianError);
  });

  // ... more tests (one per invariant)
});
```

**Test Naming Pattern**:
- `G{number} — {test description}`
- One test per invariant
- Test both happy path and error paths

**Coverage Target**: 100% of Guardian code

---

### Step 4.2: System E2E Tests

**File**: `cascade/modules/{module-name}/tests/system/{module}.e2e.spec.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

import { ItemGuardian } from '../../src/guardian/ItemGuardian';
import { ItemProjection } from '../../src/read-models/ItemProjection';
import { InMemoryItemReadRepository } from '../../src/read-models/InMemoryItemReadRepository';
import { ItemReadController } from '../../src/api/ItemReadController';

describe('SYSTEM E2E — Item (read-only inter-layers)', () => {
  let projection: ItemProjection;
  let controller: ItemReadController;

  beforeEach(() => {
    // 1. Create projection
    projection = new ItemProjection();

    // 2. Apply events
    projection.apply({
      type: 'ItemRegistered',
      payload: {
        itemId: 'ITEM_1',
        tenantId: 'T1',
        category: 'TYPE_A',
        amount: 1000,
        documentId: 'DOC_1',
        createdDate: '2026-02-01',
        status: 'ACTIVE',
      },
    });

    // 3. Create repository from snapshot
    const repo = new InMemoryItemReadRepository(projection.snapshot());

    // 4. Create controller
    controller = new ItemReadController(repo);
  });

  it('GET /items — tenant isolation', async () => {
    const res = await controller.getAll({ tenantId: 'T1' });
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('GET /items/{id} — 200 or 404', async () => {
    const ok = await controller.getById({
      tenantId: 'T1',
      params: { id: 'ITEM_1' },
    });
    expect(ok.status).toBe(200);

    const notFound = await controller.getById({
      tenantId: 'T1',
      params: { id: 'UNKNOWN' },
    });
    expect(notFound.status).toBe(404);
  });
});
```

**E2E Pattern**:
1. Create in-memory projection
2. Apply test events
3. Extract snapshot to repository
4. Test API through controller
5. Assert multi-tenant isolation

**Coverage Target**: All critical paths (happy + error)

---

## Phase 5: BUILD_PROOF Certification

### Step 5.1: Guardian BUILD_PROOF

**File**: `cascade/modules/{module-name}/BUILD_PROOF_GUARDIAN.json`

```json
{
  "module": "item",
  "version": "1.0.0",
  "timestamp": "2026-02-03T12:00:00Z",
  "governance": "SPOFE P0",
  "status": "CERTIFIED",

  "contracts": {
    "SCOPE.md": { "sha256": "abc123...", "path": "contract/SCOPE.md" },
    "GUARDIAN.md": { "sha256": "def456...", "path": "contract/GUARDIAN.md" }
  },

  "guardian": {
    "ItemGuardian.ts": { "sha256": "ghi789...", "path": "src/guardian/ItemGuardian.ts" },
    "invariants": ["G01 - TenantUnique", "G02 - DocumentRequired", "..."]
  },

  "tests": {
    "total": 15,
    "passed": 15,
    "failed": 0,
    "coverage": "100%",
    "suites": {
      "guardian": {
        "total": 15,
        "passed": 15,
        "file": "tests/guardian/ItemGuardian.spec.ts"
      }
    }
  },

  "certification": {
    "certified": true,
    "certifiedAt": "2026-02-03T12:00:00Z",
    "certifiedBy": "SPOFE BUILD_PROOF System",
    "validUntil": "PERPETUAL"
  }
}
```

### Step 5.2: Complete Module BUILD_PROOF

**File**: `cascade/modules/{module-name}/BUILD_PROOF_GLOBAL.json`

```json
{
  "module": "item",
  "version": "1.0.0",
  "timestamp": "2026-02-03T12:00:00Z",
  "governance": "SPOFE P0",
  "status": "CERTIFIED",

  "contracts": { "...": "all 5 contract files" },
  "guardian": { "...": "Guardian implementation" },
  "readModels": { "...": "RM types, ports, projections, repo" },
  "api": { "...": "API controller, wiring" },

  "tests": {
    "framework": "vitest",
    "total": 22,
    "passed": 22,
    "failed": 0,
    "duration": "1000ms",
    "suites": {
      "guardian": { "total": 15, "passed": 15 },
      "system": { "total": 7, "passed": 7 }
    }
  },

  "certification": {
    "certified": true,
    "certifiedAt": "2026-02-03T12:00:00Z",
    "certifiedBy": "SPOFE BUILD_PROOF Certification",
    "validUntil": "PERPETUAL",
    "frozenAt": "2026-02-03T12:00:00Z"
  }
}
```

### Step 5.3: Generate Hashes

```bash
# Calculate SHA256 of all files
Get-FileHash -Algorithm SHA256 "cascade/modules/{module}/contract/SCOPE.md" | Select-Object Hash

# Generate BUILD_PROOF hash
$hash = (Get-FileHash -Algorithm SHA256 "cascade/modules/{module}/BUILD_PROOF_GLOBAL.json").Hash
$hash | Out-File -Encoding UTF8 -NoNewline "cascade/modules/{module}/BUILD_PROOF_GLOBAL.sha256"
```

### Step 5.4: Create Signature File

**File**: `cascade/modules/{module-name}/BUILD_PROOF_GLOBAL.sig`

```
-----BEGIN SPOFE SIGNATURE-----
Module: item
Version: 1.0.0
Type: Primary source (write)
Governance: SPOFE P0
Status: FROZEN

BUILD_PROOF_GLOBAL.json SHA256:
A51657ABED6AEC7DC6DC107134D4F7C1BAC5865E8CFC0B333B2FEB39B490191E

Signature:
SPOFE-SIG-v1.0.0-item-A51657ABED6AEC7DC6DC107134D4F7C1BAC5865E8CFC0B333B2FEB39B490191E-2026-02-03T12:00:00Z

Tests: 22/22 PASS
- Guardian P0: 15/15
- System E2E: 7/7

Invariants P0 (8):
- G01 - TenantUnique
- G02 - DocumentRequired
- ...

This module is now FROZEN and IMMUTABLE.
Any modification requires a new version.
-----END SPOFE SIGNATURE-----
```

---

## Best Practices

### ✅ DO

1. **Start with Contracts**
   ```
   SCOPE → GUARDIAN → COMMANDS_EVENTS → READ_MODELS → API
   ```
   Don't write code before freezing contracts.

2. **Guardian-First Thinking**
   - Write invariant checks before business logic
   - One method per invariant
   - Throw immediately on violation

3. **Multi-Tenant Everywhere**
   - Add `tenantId` to every query
   - Filter on `tenantId` before returning data
   - Validate `tenantId` in Guardian

4. **Event-Driven Projections**
   - Project from events, not from commands
   - Projection is deterministic (same events → same state)
   - Snapshot for read-model state

5. **Framework Agnostic**
   - Use interfaces, not concrete framework classes
   - Controllers take `ApiRequest`, return `ApiResponse`
   - Can swap implementations without changing code

6. **100% Test Coverage**
   - Every invariant gets a test
   - Every API endpoint gets tests
   - Use Vitest with clear naming

7. **Immutable After Freeze**
   - Once contracts are frozen, create new version for changes
   - Use SHA256 hashing to detect mutations
   - BUILD_PROOF prevents accidental changes

---

### ❌ DON'T

1. **Don't Put Business Logic in Guardian**
   ```typescript
   // ❌ BAD
   private assertComplexCalculation(fact: ItemFact) {
     const margin = (fact.amount - fact.cost) / fact.cost;
     if (margin < 0.1) throw new Error('...');
   }

   // ✅ GOOD
   private assertPositiveAmount(fact: ItemFact) {
     if (fact.amount <= 0) throw new Error('Amount must be positive');
   }
   ```

2. **Don't Mix Read & Write in Same Module**
   ```typescript
   // ❌ BAD - Module does both write (command) and read (query)
   // ✅ GOOD - Separate primary source from transverse read-only
   ```

3. **Don't Skip Tenant Isolation**
   ```typescript
   // ❌ BAD
   const item = await repo.getById(itemId);

   // ✅ GOOD
   const item = await repo.getById(req.tenantId, itemId);
   ```

4. **Don't Use Computed/Derived Events**
   ```typescript
   // ❌ BAD - This is computation, not a fact
   { type: 'MonthlyTotalComputed', payload: { month: '2026-02', total: 50000 } }

   // ✅ GOOD - Only capture what was observed
   { type: 'TransactionRecorded', payload: { date: '2026-02-03', amount: 5000 } }
   ```

5. **Don't Create Infrastructure Interfaces**
   ```typescript
   // ❌ BAD - Couples to specific tech
   export interface Database { query(...): Promise<any> }

   // ✅ GOOD - Domain-specific contract
   export interface ItemReadRepository { getAll(...): Promise<ItemRM[]> }
   ```

6. **Don't Test Implementation Details**
   ```typescript
   // ❌ BAD
   it('should set status to ACTIVE in state map', () => {
     const map = new Map();
     projection.apply(...);
     expect(map.get('ITEM_1').status).toBe('ACTIVE');
   });

   // ✅ GOOD
   it('GET /items/ITEM_1 returns ACTIVE status', async () => {
     const res = await controller.getById({ tenantId: 'T1', params: { id: 'ITEM_1' } });
     expect(res.body.status).toBe('ACTIVE');
   });
   ```

---

## Complete Example: Immobilisation Module

### Directory Structure

```
cascade/modules/immobilisation/
├── contract/
│   ├── SCOPE.md
│   ├── GUARDIAN.md
│   ├── COMMANDS_EVENTS.md
│   ├── READ_MODELS.md
│   └── API_READ_ONLY.md
├── src/
│   ├── guardian/
│   │   ├── types.ts
│   │   ├── GuardianError.ts
│   │   ├── ImmobilisationGuardian.ts
│   │   └── index.ts
│   ├── read-models/
│   │   ├── types.ts
│   │   ├── ports/
│   │   │   ├── ImmobilisationReadRepository.ts
│   │   │   └── index.ts
│   │   ├── ImmobilisationProjection.ts
│   │   ├── InMemoryImmobilisationReadRepository.ts
│   │   └── index.ts
│   └── api/
│       ├── types.ts
│       ├── ImmobilisationReadController.ts
│       ├── ImmobilisationApiWiring.ts
│       └── index.ts
├── tests/
│   ├── guardian/
│   │   └── ImmobilisationGuardian.spec.ts
│   └── system/
│       └── immobilisation.e2e.spec.ts
├── BUILD_PROOF_GUARDIAN.json
├── BUILD_PROOF_GUARDIAN.sha256
├── BUILD_PROOF_GLOBAL.json
├── BUILD_PROOF_GLOBAL.sha256
└── BUILD_PROOF_GLOBAL.sig
```

### Step-by-Step Creation

**1. Create contracts** (5 files)
```bash
cd cascade/modules/immobilisation/contract
# Create SCOPE.md, GUARDIAN.md, COMMANDS_EVENTS.md, READ_MODELS.md, API_READ_ONLY.md
```

**2. Implement Guardian** (4 files)
```bash
cd ../src/guardian
# Create types.ts, GuardianError.ts, ImmobilisationGuardian.ts, index.ts
```

**3. Implement Read-Models** (6 files)
```bash
cd ../read-models
# Create types.ts, ImmobilisationProjection.ts, InMemoryImmobilisationReadRepository.ts, index.ts
# Create ports/ImmobilisationReadRepository.ts, ports/index.ts
```

**4. Implement API** (4 files)
```bash
cd ../api
# Create types.ts, ImmobilisationReadController.ts, ImmobilisationApiWiring.ts, index.ts
```

**5. Write tests** (2 files)
```bash
cd ../../tests/guardian
# Create ImmobilisationGuardian.spec.ts
cd ../system
# Create immobilisation.e2e.spec.ts
```

**6. Run tests**
```bash
npx vitest run cascade/modules/immobilisation/tests --reporter=verbose
# Expected: 17 tests passed (10 Guardian + 7 System)
```

**7. Generate BUILD_PROOF**
```bash
# Calculate SHA256 hashes of all files
# Create BUILD_PROOF_GUARDIAN.json with Guardian-only data (10 tests)
# Create BUILD_PROOF_GLOBAL.json with complete data (17 tests)
# Generate .sha256 and .sig files
```

**8. Update system BUILD_PROOF**
```bash
# Add immobilisation to BUILD_PROOF_SYSTEM_INTER_MODULES.json
# Update: certifiedModules (5/10), systemMetrics (50%, 147 tests, 56 invariants)
# Regenerate system hash and signature
```

---

## Checklists

### Pre-Implementation Checklist

- [ ] Module scope is approved and documented
- [ ] All 5 contracts are written and frozen
- [ ] 12+ Guardian invariants are defined
- [ ] 3+ Commands and 3+ Events are specified
- [ ] 4+ Read-Models are documented
- [ ] 4+ API endpoints are documented
- [ ] Module dependencies are clear
- [ ] OHADA referential is specified (if applicable)

### Pre-Certification Checklist

- [ ] Guardian tests: 100% pass rate
- [ ] System E2E tests: 100% pass rate
- [ ] All test suites run in < 2 seconds
- [ ] Code coverage > 95%
- [ ] No framework coupling (no Express/etc in src/)
- [ ] Multi-tenant isolation verified
- [ ] All file hashes calculated (SHA256)
- [ ] BUILD_PROOF JSON generated
- [ ] Signature file created
- [ ] Module frozen (immutable)

### After-Certification Checklist

- [ ] BUILD_PROOF files committed to git
- [ ] System BUILD_PROOF updated
- [ ] Documentation updated
- [ ] Team notified of certification
- [ ] Dependencies recorded in inter-module graph
- [ ] Module tagged in git

---

## Troubleshooting

### Issue: Guardian test fails with "Document is mandatory"

**Solution**: Ensure all `fact` objects have a `documentId` property in test setup.

```typescript
const baseFact = {
  // ...
  documentId: 'DOC_1', // ← Add this
};
```

### Issue: Cross-tenant data leaks in API response

**Solution**: Verify `tenantId` filter is applied in repository.

```typescript
// ❌ BAD
return this.data.filter(i => i.id === itemId);

// ✅ GOOD
return this.data.filter(i => i.tenantId === tenantId && i.id === itemId);
```

### Issue: E2E test fails with "null reference"

**Solution**: Ensure projection receives events before repository is created.

```typescript
// ✅ CORRECT ORDER
projection.apply(event1);
projection.apply(event2);
const repo = new InMemoryRepository(projection.snapshot()); // ← After events
const controller = new Controller(repo);
```

---

## References

- **SPOFE P0 Governance**: [SPOFE Constitution](./REGLES_CONDUITE_SPOFE.md)
- **OHADA Compliance**: [OHADA Reference](./SCHEMA_BASE_DE_DONNEES_ACTUEL.md)
- **Module Examples**: 
  - tresorerie-caisse (primary source)
  - tresoconsolidation (transverse read-only)
  - immobilisation (OHADA classe 2)
- **Test Framework**: Vitest
- **Architecture**: CQRS/Event-Sourcing

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-03  
**Status**: FROZEN (Immutable)
