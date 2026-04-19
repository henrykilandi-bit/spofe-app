# 🎫 Tickets Jira - Implémentation Module Budget

**Date**: 30 janvier 2026  
**Référence**: MODULE_BUDGET_CONTRACT.md v1.0.1  
**Epic**: BUDGET-C-01

---

## 🧩 EPIC — BUDGET-C-01

**Titre**: Mise en conformité contractuelle Module Budget v1.0.1  
**Objectif**: DOC = CODE = RÉALITÉ  
**Statut**: 🟡 En cours (40% complété)

### Definition of Done (Epic)

- [ ] Checklist contractuelle v1.0.1 cochée à 100%
- [ ] Tous les tickets enfants fermés
- [ ] Audit interne OK

---

## ✅ Implémentation Réalisée (40%)

### Domaine (100% ✅)

**Fichiers créés:**
- `domain/value-objects.ts` - Period, Quantity, Money, PaymentTerm
- `domain/entities.ts` - BudgetObjectiveItem, SalesCapacity, CostStructure
- `domain/commands.ts` - 7 commandes (3 implémentées + 4 planifiées v2.0)
- `domain/budget.aggregate.ts` - Aggregate Root BudgetObjectif

**Conformité**: 100% aligné avec MODULE_BUDGET_CONTRACT.md Section 3

### Guardian (100% ✅)

**Fichiers créés:**
- `guardian/budget.invariants.ts` - 8 invariants contractuels
  - INV-BO-01: Unicité période
  - INV-BO-03: Transitions état
  - INV-BO-04: Immutabilité après validation
  - INV-BO-06: Objectifs quantifiables
  - INV-BO-09: Capacité non dépassée
  - INV-BO-11: Capacité définie
  - INV-BO-12: Structure coûts
  - INV-BO-15: Termes paiement

**Conformité**: 100% aligné avec MODULE_BUDGET_CONTRACT.md Section 4

### Infrastructure (100% ✅)

**Fichiers créés:**
- `infrastructure/budget.repository.ts` - Repository PostgreSQL append-only
- `infrastructure/budget.transaction-manager.ts` - Orchestration Guardian + DB

**Conformité**: 100% aligné avec MODULE_BUDGET_CONTRACT.md Section 2

---

## 🎫 STORY BUDGET-C-01.1 — SQL & Migrations

**Statut**: ⏳ À faire  
**Priorité**: HAUTE  
**Estimation**: 5 jours

### Description

Créer les schémas SQL, migrations et read-models contractuels.

### Sous-tâches

- [ ] Créer `sql/schema.sql` (write-model)
  - Table `budget_objectif` avec RLS
  - Index par tenant_id
  - Contraintes immutabilité
  - Soft deletes

- [ ] Créer `sql/migrations/001_budget_schema.sql`
  - Migration initiale
  - Triggers audit
  - RLS policies

- [ ] Créer `sql/read-models.sql` (5 vues)
  - `rm_cashflow_projection` ✅ (documenté)
  - `rm_cashflow_variance` ✅ (documenté)
  - `rm_cashflow_execution` ⏳ À créer
  - `rm_cashflow_cumulative` ⏳ À créer
  - `rm_liquidity_alerts` ⏳ À créer

- [ ] Activer RLS PostgreSQL
  ```sql
  ALTER TABLE budget_objectif ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON budget_objectif
    USING (tenant_id = current_setting('app.tenant_id'));
  ```

### Critères d'acceptation

- [ ] Toutes les migrations s'exécutent sans erreur
- [ ] RLS actif et testé
- [ ] 5 read-models SQL exposés
- [ ] EXPLAIN ANALYZE documenté pour chaque vue

---

## 🎫 STORY BUDGET-C-01.2 — Tests Guardian

**Statut**: ⏳ À faire  
**Priorité**: HAUTE  
**Estimation**: 3 jours

### Description

Couvrir tous les invariants par des tests automatisés.

### Sous-tâches

- [ ] Créer `tests/guardian.invariants.spec.ts`
- [ ] Test INV-BO-01 (unicité période)
- [ ] Test INV-BO-03 (transitions état)
- [ ] Test INV-BO-04 (immutabilité)
- [ ] Test INV-BO-06 (quantité >= 0)
- [ ] Test INV-BO-09 (objectif ≤ capacité)
- [ ] Test INV-BO-11 (capacité définie)
- [ ] Test INV-BO-12 (structure coûts)
- [ ] Test INV-BO-15 (termes paiement)

### Critères d'acceptation

- [ ] 8 tests dédiés (1 par invariant)
- [ ] Nom test contient code invariant
- [ ] Échec invariant ⇒ rejet Guardian
- [ ] Coverage >= 90%

---

## 🎫 STORY BUDGET-C-01.3 — API Endpoints

**Statut**: ⏳ À faire  
**Priorité**: HAUTE  
**Estimation**: 5 jours

### Description

Implémenter les endpoints REST conformes au contrat.

### Sous-tâches

- [ ] Créer `api/budget.controller.ts`
  - POST /api/budgets (CreateBudgetObjectif)
  - POST /api/budgets/:id/objectives (UpdateObjectives)
  - POST /api/budgets/:id/validate (ValidateBudget)
  - GET /api/budgets/:id
  - GET /api/budgets

- [ ] Créer `api/budget-query.controller.ts`
  - GET /api/budgets/projection
  - GET /api/budgets/variance
  - GET /api/budgets/execution ⏳
  - GET /api/budgets/cumulative ⏳
  - GET /api/budgets/alerts ⏳

- [ ] Ajouter guards NestJS
  - AuthGuard (JWT)
  - TenantGuard (isolation)
  - KillSwitchGuard (à créer)

- [ ] Générer OpenAPI automatiquement

### Critères d'acceptation

- [ ] Tous les endpoints testés E2E
- [ ] Isolation multi-tenant vérifiée
- [ ] OpenAPI générée en CI
- [ ] Rate limiting configuré

---

## 🎫 STORY BUDGET-C-01.4 — Tests E2E

**Statut**: ⏳ À faire  
**Priorité**: HAUTE  
**Estimation**: 4 jours

### Description

Tests end-to-end complets pour le module Budget.

### Sous-tâches

- [ ] Créer `tests/e2e/budget.e2e.spec.ts`
  - Scénario: Création budget
  - Scénario: Mise à jour objectifs
  - Scénario: Validation budget
  - Scénario: Rejets Guardian

- [ ] Créer `tests/e2e/multi-tenant.e2e.spec.ts`
  - Isolation lecture
  - Isolation écriture
  - Read-models filtrés
  - Bypass impossible

- [ ] Créer `tests/e2e/read-models.e2e.spec.ts`
  - Test chaque vue SQL
  - Performance (< 100ms)
  - Isolation tenant

### Critères d'acceptation

- [ ] 20+ tests E2E passants
- [ ] Coverage >= 80%
- [ ] Temps exécution < 30s

---

## 🎫 STORY BUDGET-C-01.5 — Monitoring

**Statut**: ⏳ À faire  
**Priorité**: MOYENNE  
**Estimation**: 3 jours

### Description

Dashboards et alertes Grafana versionnés.

### Sous-tâches

- [ ] Créer `monitoring/budget.metrics.ts`
  - 8 métriques Prometheus
  - Instrumentation Guardian
  - Instrumentation Repository

- [ ] Créer `grafana/budget-dashboard.json`
  - Panel: Commands
  - Panel: Latency
  - Panel: Rejections
  - Panel: Variance

- [ ] Créer `grafana/alerts-budget.yaml`
  - 7 alertes (CRITICAL/WARNING/INFO)
  - Mapping canaux (Slack/Email)

### Critères d'acceptation

- [ ] Import Grafana sans modification
- [ ] Alertes visibles et actives
- [ ] Test alerte simulée OK

---

## 🎫 STORY BUDGET-C-01.6 — Runbook Ops

**Statut**: ⏳ À faire  
**Priorité**: MOYENNE  
**Estimation**: 2 jours

### Description

Runbook incident pour opérations.

### Sous-tâches

- [ ] Créer `RUNBOOK_INCIDENT.md`
  - Procédure kill switch
  - Procédure rollback feature flags
  - Procédure rollback canary
  - Procédure DB read-only
  - Contacts escalation

- [ ] Validation équipe Ops

### Critères d'acceptation

- [ ] Document accessible aux ops
- [ ] Scénarios critiques couverts
- [ ] Validé hors équipe dev

---

## 🎫 STORY BUDGET-C-01.7 — Frontend

**Statut**: ⏳ À faire  
**Priorité**: MOYENNE  
**Estimation**: 8 jours

### Description

Interface utilisateur selon contrat SPOFE.

### Sous-tâches

- [ ] Créer `frontend/pages/BudgetList.tsx`
- [ ] Créer `frontend/pages/BudgetCreate.tsx`
- [ ] Créer `frontend/pages/BudgetDetail.tsx`
- [ ] Créer `frontend/components/BudgetForm.tsx`
- [ ] Créer `frontend/components/BudgetChart.tsx`
- [ ] Intégrer FCE (Frontend Contract Enforcer)
- [ ] Tests Vitest + Cypress

### Critères d'acceptation

- [ ] Aucune logique métier côté client
- [ ] FCE utilisé pour tous les appels API
- [ ] Responsive design
- [ ] Accessibilité (WCAG 2.1)

---

## 📊 Progression Globale

| Composante | Statut | % |
|------------|--------|---|
| Domaine | ✅ Complété | 100% |
| Guardian | ✅ Complété | 100% |
| Infrastructure | ✅ Complété | 100% |
| SQL & Migrations | ⏳ À faire | 0% |
| Tests Guardian | ⏳ À faire | 0% |
| API Endpoints | ⏳ À faire | 0% |
| Tests E2E | ⏳ À faire | 0% |
| Monitoring | ⏳ À faire | 0% |
| Runbook | ⏳ À faire | 0% |
| Frontend | ⏳ À faire | 0% |

**Total**: 40% complété

---

## 🚀 Prochaines Étapes Immédiates

### Sprint 1 (2 semaines)
1. BUDGET-C-01.1 - SQL & Migrations (HAUTE)
2. BUDGET-C-01.2 - Tests Guardian (HAUTE)
3. BUDGET-C-01.3 - API Endpoints (HAUTE)

### Sprint 2 (2 semaines)
4. BUDGET-C-01.4 - Tests E2E (HAUTE)
5. BUDGET-C-01.5 - Monitoring (MOYENNE)
6. BUDGET-C-01.6 - Runbook Ops (MOYENNE)

### Sprint 3 (2 semaines)
7. BUDGET-C-01.7 - Frontend (MOYENNE)
8. Tests finaux et audit
9. Déploiement production

---

## 📝 Notes d'Implémentation

### Dépendances Requises

```json
{
  "dependencies": {
    "pg": "^8.11.0",
    "prom-client": "^15.1.0"
  },
  "devDependencies": {
    "@types/pg": "^8.10.0",
    "vitest": "^1.0.0"
  }
}
```

### Variables d'Environnement

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spofe
DB_USER=spofe_user
DB_PASSWORD=secure_password
DB_SSL=false

PROMETHEUS_PORT=9090
GRAFANA_URL=http://localhost:3000
```

### Commandes Utiles

```bash
# Exécuter migrations
npm run migrate:up

# Tests Guardian
npm run test:guardian

# Tests E2E
npm run test:e2e

# Générer OpenAPI
npm run openapi:generate
```

---

**© 2026 SPOFE Team - Module Budget Implementation**
