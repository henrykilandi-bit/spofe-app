# 🧪 Contract Tests — Frontend ↔ Backend

## Vue d'ensemble

Tests contractuels pour valider la conformité **Frontend ↔ Backend** des modules SPOFE.

Ces tests prouvent que :
- ✅ Le backend respecte l'OpenAPI généré
- ✅ Le client frontend généré fonctionne réellement
- ✅ Les shapes, types et statuts HTTP sont conformes
- ✅ Les contrats inter-modules sont respectés

## 📌 Modules Couverts

| Module | Fichier Test | Statut |
|--------|--------------|--------|
| Cost-Structure | `cost-structure.contract.spec.js` | ✅ |
| Immobilisation | `immobilisation.contract.spec.ts` | ✅ |

## 🎯 Les 3 Niveaux SPOFE

- **NIVEAU 1**: Compilation TypeScript (contrat statique)
- **NIVEAU 2**: Validation OpenAPI ↔ Backend (runtime)
- **NIVEAU 3**: Tests E2E FE ↔ BE réels

## Prérequis

1. **Backend lancé** sur `http://localhost:3000` (ou autre via env var)
2. **PostgreSQL** avec données de test
3. **Tenant de test** configuré (`tenant-contract-test`)

## Exécution

### Mode standard (avec backend)

```bash
cd frontend
npm run test:contract
```

### Avec URL backend personnalisée

```bash
API_BASE_URL=http://localhost:4000/api npm run test:contract
```

### Mode watch (développement)

```bash
npm run test:contract:watch
```

### Via CI

```bash
npm run ci:contract        # NIVEAU 1 + 2
npm run ci:contract:full   # NIVEAU 1 + 2 + 3
```

## Tests Couverts

### Cost-Structure
| CT-FE-02 | Contract Shape | Shape exacte, pas de champs supplémentaires |
| CT-FE-03 | Cost Projects | Listing avec filtres status/type |
| CT-FE-04 | Multi-Tenant Security | Isolation tenant, rejet sans header |
| CT-FE-05 | Cost Structure | Versions, lignes, simulations |
| CT-FE-06 | HTTP Status Codes | 404 pour ressources inexistantes |
| CT-FE-07 | Data Consistency | Cohérence Budget-Ready ↔ Structure |

## Structure des Fichiers

```
frontend/
├── src/
│   ├── api/
│   │   └── cost-structure/
│   │       ├── index.js          # Client API généré
│   │       ├── types.d.ts        # Types TypeScript
│   │       └── hooks.js          # React Query hooks
│   └── contract-tests/
│       ├── cost-structure.contract.spec.js  # Tests
│       └── helpers.js            # Utilitaires
├── scripts/
│   └── run-contract-tests.js     # Script runner
└── vitest.contract.config.js     # Config Vitest séparée
```

## Intégration CI

```yaml
# Exemple GitHub Actions
contract-tests:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_DB: spofe_test
        POSTGRES_USER: test
        POSTGRES_PASSWORD: test
  steps:
    - uses: actions/checkout@v4
    - name: Install dependencies
      run: npm ci
    - name: Start backend
      run: cd cascade && npm run start:dev &
      env:
        DATABASE_URL: postgres://test:test@localhost:5432/spofe_test
    - name: Wait for backend
      run: npx wait-on http://localhost:3000/health
    - name: Run contract tests
      run: cd frontend && npm run test:contract
```

## Shapes Contractuels

### BudgetReadyProjectDTO

```typescript
{
  tenantId: string;
  projectId: string;
  projectName: string;
  version: number;
  unitCost: number;
  totalCost: number;
  netMargin: number;
  marginAt70: number;  // MUST be > 0 per COUT-01
}
```

### CostProjectDTO

```typescript
{
  tenantId: string;
  projectId: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE' | 'PROJECT';
  status: 'DRAFT' | 'SIMULATED' | 'VALIDATED' | 'REJECTED';
  currentVersion: number;
  createdAt: string;        // ISO 8601
  createdBy: string;
  validatedAt: string|null;
  currentUnitCost: number|null;
  currentTotalCost: number|null;
}
```

### CostStructureDTO

```typescript
{
  tenantId: string;
  projectId: string;
  version: number;
  status: 'DRAFT' | 'SIMULATED' | 'FROZEN';
  unitCost: number;
  totalCost: number;
  netMargin: number;
  marginAt70: number;
  viableAt70: boolean;      // true if marginAt70 > 0
  createdBy: string;
  createdAt: string;        // ISO 8601
  frozenAt: string|null;
}
```

## Règles Métier Testées

| Code | Règle | Test |
|---|---|---|
| COUT-01 | marginAt70 > 0 requis | CT-FE-01: vérifie que tous les projets ont marginAt70 > 0 |
| COUT-BUD-01 | Budget peut lire les projets validés | CT-FE-01, CT-FE-07: endpoint dédié |
| MULTI-TENANT | Isolation par tenant | CT-FE-04: vérifie X-Tenant-Id |

## Dépannage

### Backend non accessible

```
❌ Backend not reachable at http://localhost:3000
```

**Solution** : Démarrer le backend

```bash
cd cascade && npm run start:dev
```

### Tests échouent sur shape

```
Expected: ["marginAt70", "netMargin", ...]
Received: ["marginAt70", "netMargin", "newField", ...]
```

**Cause** : L'API a été modifiée sans régénérer le client
**Solution** : 

```bash
# Régénérer l'OpenAPI
cd cascade/modules/cost-structure && npx ts-node scripts/generate-openapi.ts

# Régénérer le client
cd frontend && npm run api:generate:cost-structure
```

### Tenant non trouvé

```
All returned projects should belong to test tenant
Expected: tenant-contract-test
Received: different-tenant
```

**Cause** : Données de test configurées pour un autre tenant
**Solution** : Configurer TEST_TENANT_ID

```bash
TEST_TENANT_ID=my-tenant npm run test:contract
```

---

*Dernière mise à jour: 2026-02-01*
