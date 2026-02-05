# 🧪 TESTS E2E READ-MODELS + INTÉGRATION BUDGET
Module Cost-Structure (COUTFLEX) v1.0.0

Aligné avec COST_STRUCTURE_CONTRACT.md, COST_STRUCTURE_DDD.md, COST_STRUCTURE_READMODELS.md

---

## Principes des Tests
- **E2E Read-Models** : Tests end-to-end vérifiant que les vues SQL exposent correctement les données validées, sans recalcul.
- **Intégration Budget** : Tests contractuels vérifiant que Budget consomme uniquement `rm_cost_projects_budget_ready` et respecte les prérequis.
- **Guardian-first** : Tous les tests passent par le Guardian pour valider les invariants.
- **Multi-tenant** : Tests isolés par tenant.
- **Aucun mock** : Tests sur vraie base PostgreSQL avec données réelles.

---

## 1️⃣ Setup Test Environnement
```typescript
// jest.e2e.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup-e2e.ts'],
  testMatch: ['**/*.e2e.test.ts'],
  globalSetup: '<rootDir>/test/global-setup.ts', // Init DB PostgreSQL
  globalTeardown: '<rootDir>/test/global-teardown.ts'
};
```

```typescript
// test/setup-e2e.ts
import { TestDatabase } from './test-database';

beforeAll(async () => {
  await TestDatabase.init();
  await TestDatabase.migrate(); // Appliquer schémas cost-structure
});

afterAll(async () => {
  await TestDatabase.cleanup();
});
```

---

## 2️⃣ E2E Tests Read-Models

### Test 1: rm_cost_projects — Liste projets validés
```typescript
describe('rm_cost_projects E2E', () => {
  it('should list only validated projects', async () => {
    // Given: Créer un projet VALIDATED via Guardian
    const project = await createValidatedProject({
      tenantId: 'tenant-1',
      name: 'Test Project',
      type: 'PRODUCT'
    });

    // When: Query la vue
    const results = await queryView('rm_cost_projects', { tenantId: 'tenant-1' });

    // Then: Projet visible avec statut VALIDATED
    expect(results).toContainEqual({
      tenant_id: 'tenant-1',
      project_id: project.id,
      status: 'VALIDATED'
    });
  });

  it('should not show DRAFT projects', async () => {
    // Given: Projet DRAFT
    await createDraftProject({ tenantId: 'tenant-1' });

    // When: Query
    const results = await queryView('rm_cost_projects', { tenantId: 'tenant-1' });

    // Then: Aucun DRAFT
    expect(results.every(r => r.status !== 'DRAFT')).toBe(true);
  });
});
```

### Test 2: rm_cost_structure_current — Version FROZEN uniquement
```typescript
describe('rm_cost_structure_current E2E', () => {
  it('should show only FROZEN structures', async () => {
    // Given: Structure FROZEN
    const structure = await createFrozenCostStructure({
      projectId: 'proj-1',
      version: 1
    });

    // When: Query
    const results = await queryView('rm_cost_structure_current', { projectId: 'proj-1' });

    // Then: Une seule ligne FROZEN
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('FROZEN');
  });

  it('should not show SIMULATED structures', async () => {
    // Given: Structure SIMULATED (non FROZEN)
    await createSimulatedCostStructure({ projectId: 'proj-1' });

    // When: Query
    const results = await queryView('rm_cost_structure_current', { projectId: 'proj-1' });

    // Then: Vide
    expect(results).toHaveLength(0);
  });
});
```

### Test 3: rm_cost_simulation_results — Résultats calculés
```typescript
describe('rm_cost_simulation_results E2E', () => {
  it('should expose computed metrics without recalculation', async () => {
    // Given: Simulation validée avec marge à 70%
    const simulation = await runAndValidateSimulation({
      projectId: 'proj-1',
      unitCost: 100,
      netMargin: 20,
      marginAt70: 5 // Viable
    });

    // When: Query
    const results = await queryView('rm_cost_simulation_results', { projectId: 'proj-1' });

    // Then: Métriques exactes (pas recalculées)
    expect(results[0]).toMatchObject({
      unit_cost: 100,
      net_margin: 20,
      margin_at_70: 5,
      viable_at_70: true
    });
  });
});
```

### Test 4: rm_cost_decisions — Audit decisions
```typescript
describe('rm_cost_decisions E2E', () => {
  it('should record human decisions', async () => {
    // Given: Décision VALIDATE
    await validateProject({
      projectId: 'proj-1',
      decidedBy: 'user-123',
      justification: 'Viable économiquement'
    });

    // When: Query
    const results = await queryView('rm_cost_decisions', { projectId: 'proj-1' });

    // Then: Décision tracée
    expect(results[0]).toMatchObject({
      decision: 'VALIDATE',
      decided_by: 'user-123',
      justification: 'Viable économiquement'
    });
  });
});
```

### Test 5: rm_cost_projects_budget_ready — Contrat Budget
```typescript
describe('rm_cost_projects_budget_ready E2E', () => {
  it('should only show VALIDATED projects with viable 70%', async () => {
    // Given: Projet VALIDATED + viable
    await createBudgetReadyProject({
      tenantId: 'tenant-1',
      projectId: 'proj-1',
      viableAt70: true
    });

    // When: Query
    const results = await queryView('rm_cost_projects_budget_ready', { tenantId: 'tenant-1' });

    // Then: Visible pour Budget
    expect(results).toContainEqual({
      project_id: 'proj-1',
      net_margin: expect.any(Number),
      margin_at_70: expect.any(Number)
    });
  });

  it('should exclude non-viable projects', async () => {
    // Given: Projet avec marge négative à 70%
    await createNonViableProject({ tenantId: 'tenant-1' });

    // When: Query
    const results = await queryView('rm_cost_projects_budget_ready', { tenantId: 'tenant-1' });

    // Then: Non visible
    expect(results).toHaveLength(0);
  });
});
```

---

## 3️⃣ Tests d’Intégration Budget

### Test 1: Budget consomme uniquement rm_cost_projects_budget_ready
```typescript
describe('Budget Integration', () => {
  it('should only read from rm_cost_projects_budget_ready', async () => {
    // Given: Module Budget mocké
    const budgetModule = mockBudgetModule();

    // When: Budget tente de lire les projets budgétables
    await budgetModule.loadBudgetableProjects();

    // Then: Vérifier que seule cette vue est queryée
    expect(budgetModule.queries).toContain('SELECT * FROM rm_cost_projects_budget_ready');
    expect(budgetModule.queries).not.toContain('rm_cost_projects');
    expect(budgetModule.queries).not.toContain('rm_cost_simulation_results');
  });
});
```

### Test 2: Budget refuse engagement sans VALIDATED
```typescript
describe('Budget Pre-requisites', () => {
  it('should reject budget creation for non-VALIDATED project', async () => {
    // Given: Projet SIMULATED (pas VALIDATED)
    const project = await createSimulatedProject({ tenantId: 'tenant-1' });

    // When: Budget tente d’engager
    const result = await budgetModule.createBudget({ projectId: project.id });

    // Then: Rejeté
    expect(result.success).toBe(false);
    expect(result.error).toContain('Project not VALIDATED');
  });

  it('should accept budget for VALIDATED + viable project', async () => {
    // Given: Projet budget-ready
    const project = await createBudgetReadyProject({ tenantId: 'tenant-1' });

    // When: Budget engage
    const result = await budgetModule.createBudget({ projectId: project.id });

    // Then: Accepté
    expect(result.success).toBe(true);
    expect(result.budgetId).toBeDefined();
  });
});
```

### Test 3: Événements Cost-Structure → Budget
```typescript
describe('Event-Driven Integration', () => {
  it('should publish ProjectValidated event to Budget', async () => {
    // Given: Validation projet
    const eventBus = mockEventBus();

    // When: ValidateProject command
    await validateProject({ projectId: 'proj-1' });

    // Then: Événement publié
    expect(eventBus.publishedEvents).toContainEqual({
      type: 'ProjectValidated',
      payload: { projectId: 'proj-1', version: 1 }
    });
  });

  it('should trigger Budget workflow on event', async () => {
    // Given: Budget écoute les événements
    const budgetWorkflow = mockBudgetWorkflow();

    // When: ProjectValidated event
    await eventBus.publish({
      type: 'ProjectValidated',
      payload: { projectId: 'proj-1' }
    });

    // Then: Budget workflow déclenché
    expect(budgetWorkflow.triggered).toBe(true);
  });
});
```

---

## 4️⃣ Tests Invariants E2E
### Test 1: COUT-01 — Test 70% bloquant
```typescript
describe('Invariant COUT-01 E2E', () => {
  it('should reject validation if margin at 70% <= 0', async () => {
    // Given: Structure avec marge négative à 70%
    await createCostStructureWithNegativeMarginAt70({
      projectId: 'proj-1',
      marginAt70: -5
    });

    // When: Tente ValidateProject
    const result = await validateProject({ projectId: 'proj-1' });

    // Then: Rejeté par Guardian
    expect(result.success).toBe(false);
    expect(result.error).toContain('COUT-01 violated');
  });
});
```

### Test 2: COUT-BUD-01 — Prérequis Budget
```typescript
describe('Invariant COUT-BUD-01 E2E', () => {
  it('should prevent budget engagement without frozen structure', async () => {
    // Given: Projet VALIDATED mais structure non FROZEN
    await createValidatedProjectWithoutFrozenStructure({ projectId: 'proj-1' });

    // When: Budget tente engagement
    const result = await budgetModule.createBudget({ projectId: 'proj-1' });

    // Then: Rejeté
    expect(result.success).toBe(false);
    expect(result.error).toContain('CostStructure not FROZEN');
  });
});
```

---

## 5️⃣ Métriques & Monitoring Tests
```typescript
describe('Monitoring Tests', () => {
  it('should track decision metrics', async () => {
    // Given: Plusieurs décisions
    await createMultipleDecisions({ validated: 5, rejected: 2 });

    // When: Query métriques
    const metrics = await queryMetrics();

    // Then: Taux rejet calculé
    expect(metrics.rejectionRate).toBe(2/7); // 28.57%
  });
});
```

---

## 🏁 Definition of Done — Tests E2E
Les tests sont conformes si :
- ✅ Tous les read-models testés E2E
- ✅ Intégration Budget vérifiée contractuellement
- ✅ Invariants testés end-to-end
- ✅ Multi-tenant isolé
- ✅ CI verte avec PostgreSQL réelle
- ✅ Métriques monitorées
