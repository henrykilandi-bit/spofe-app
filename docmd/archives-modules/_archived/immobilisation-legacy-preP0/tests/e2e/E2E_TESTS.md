# Tests E2E API — Module Immobilisation

## 📋 Vue d'Ensemble

Suite de tests E2E (End-to-End) pour valider l'API read-only du module Immobilisation.

### 🎯 Objectifs

1. **Prouver** que l'API correspond au contrat OpenAPI
2. **Détecter** les régressions inter-modules
3. **Sécuriser** les dépendances Cost-Structure et Budget
4. **Valider** l'isolation multi-tenant

---

## 📂 Structure

```
tests/e2e/
├── setup.ts                              # Configuration commune
├── teardown.ts                           # Nettoyage global
├── index.ts                              # Exports
├── sql/
│   └── seed.sql                          # Données de test
├── immobilisation.assets.e2e.spec.ts     # Tests endpoints assets
├── immobilisation.depreciation.e2e.spec.ts # Tests endpoints amortissement
├── immobilisation.maintenance.e2e.spec.ts  # Tests endpoints maintenance
├── immobilisation.renewal.e2e.spec.ts    # Tests endpoints renouvellement
├── immobilisation.kpi.e2e.spec.ts        # Tests endpoints KPI
└── immobilisation.security.e2e.spec.ts   # Tests sécurité & isolation
```

---

## 🚀 Exécution

### Local

```bash
# Prérequis: PostgreSQL running avec schema immobilisation
cd cascade/modules/immobilisation

# Créer le schema
psql -f infrastructure/sql/001_create_schema.sql

# Lancer les migrations
psql -f infrastructure/sql/002_create_tables.sql
psql -f infrastructure/sql/003_create_indexes.sql
psql -f infrastructure/sql/004_enable_rls.sql

# Seeder les données de test
psql -f tests/e2e/sql/seed.sql

# Exécuter les tests E2E
npm run test:e2e

# Avec couverture
npm run test:e2e:coverage
```

### CI (GitHub Actions)

Les tests E2E sont exécutés automatiquement sur:
- Push sur `main` ou `develop`
- Pull requests vers `main` ou `develop`

Voir [.github/workflows/ci-immobilisation.yml](/.github/workflows/ci-immobilisation.yml)

---

## 📊 Fichiers de Test

### 1. Assets (`immobilisation.assets.e2e.spec.ts`)

| Endpoint | Tests |
|----------|-------|
| `GET /assets` | Pagination, filtres status, isolation tenant |
| `GET /assets/net-book-value` | Filtre, calcul VNC |
| `GET /assets/:assetId` | Détail, 404, isolation |
| `GET /assets/:assetId/depreciation` | Historique, période, monotonie |

### 2. Depreciation (`immobilisation.depreciation.e2e.spec.ts`)

| Endpoint | Contract | Tests |
|----------|----------|-------|
| `GET /depreciation/summary` | IMM-CS-DEP-01 | Période, totaux, isolation |
| `GET /depreciation/cost-structure-export` | IMM-CS-DEP-02 | Structure export, allocations |
| `GET /allocations` | IMM-CS-ALL-01 | Pagination, filtres, % validation |
| `GET /cost-structure/*` | Cost-Structure | Endpoints dédiés |

### 3. Maintenance (`immobilisation.maintenance.e2e.spec.ts`)

| Endpoint | Contract | Tests |
|----------|----------|-------|
| `GET /maintenance` | IMM-MNT-01 | Pagination, type filter, date range |
| `GET /cost-structure/maintenance/summary` | IMM-CS-MNT-01 | Totaux, ventilation par type |
| `GET /cost-structure/maintenance/by-period` | IMM-CS-MNT-02 | Multi-période, chronologie |

### 4. Renewal (`immobilisation.renewal.e2e.spec.ts`)

| Endpoint | Contract | Tests |
|----------|----------|-------|
| `GET /renewals` | IMM-REN-01 | Projections, priorité, année |
| `GET /disposals` | IMM-DISP-01 | Historique, gainLoss validation |
| `GET /budget/renewals` | IMM-BUD-REN-01 | Export Budget |
| `GET /budget/renewals/by-year` | IMM-BUD-REN-02 | Agrégation annuelle |

### 5. KPI (`immobilisation.kpi.e2e.spec.ts`)

| Endpoint | Tests |
|----------|-------|
| `GET /kpi` | Structure, cohérence mathématique, isolation |
| Consistency | Cross-validation avec autres endpoints |

### 6. Security (`immobilisation.security.e2e.spec.ts`)

| Catégorie | Tests |
|-----------|-------|
| Header Validation | x-tenant-id obligatoire, format UUID |
| Tenant Isolation | Zero data cross-tenant |
| Read-Only Enforcement | Reject POST/PUT/DELETE/PATCH |
| Input Validation | SQL injection, XSS, path traversal |

---

## 🌱 Données de Test

Le fichier `sql/seed.sql` crée des données déterministes:

### Tenant 1 (`tenant-e2e-001`)
- 3 assets (1 DISPOSED)
- 12 lignes depreciation
- 5 allocations
- 4 événements maintenance
- 2 projections renouvellement
- 1 cession

### Tenant 2 (`tenant-e2e-002`)
- 2 assets
- 6 lignes depreciation
- 1 allocation
- 2 événements maintenance
- 2 projections renouvellement

---

## 📋 Conventions

### Nommage des Tests

```typescript
// Pattern: describe + it
describe('GET /api/immobilisation/endpoint [CONTRACT-CODE]', () => {
  it('should <action> when <condition>', async () => {
    // ...
  });
});
```

### Assertions Standards

```typescript
import {
  assertPaginatedResponse,    // Structure pagination
  assertAssetStructure,       // Structure asset
  assertDepreciationHistoryItem,
  assertMaintenanceHistoryItem,
  assertAllocationItem,
  assertRenewalProjection,
  assertDisposalHistoryItem,
  assertKpiStructure,
} from './setup';
```

### Headers Standards

```typescript
import { getStandardHeaders, TEST_CONFIG } from './setup';

// Requête avec tenant 1
.set(getStandardHeaders())

// Requête avec tenant 2
.set(getStandardHeaders(TEST_CONFIG.TENANT_2))
```

---

## ⚠️ Règles SPOFE

1. **Read-Only**: Aucun test de mutation (POST/PUT/DELETE) dans ces fichiers
2. **Real DB**: PostgreSQL obligatoire, pas de mocks
3. **Tenant Isolation**: Chaque test vérifie l'isolation
4. **Contract First**: Structure payload = OpenAPI spec
5. **CI Blocking**: Échec E2E = blocage merge

---

## 🔗 Contrats Validés

### Cost-Structure
- `IMM-CS-DEP-01`: Depreciation Summary
- `IMM-CS-DEP-02`: Depreciation Export
- `IMM-CS-ALL-01`: Allocations
- `IMM-CS-MNT-01`: Maintenance Summary
- `IMM-CS-MNT-02`: Maintenance by Period

### Budget
- `IMM-BUD-REN-01`: Renewal Projections
- `IMM-BUD-REN-02`: Renewals by Year
- `IMM-BUD-MNT-01`: Maintenance Budget
- `IMM-BUD-DEP-01`: Depreciation Budget

---

## 📈 Métriques

| Métrique | Cible |
|----------|-------|
| Couverture endpoints | 100% |
| Tests par endpoint | ≥5 |
| Tests sécurité | ≥20 |
| Temps exécution CI | <5 min |
