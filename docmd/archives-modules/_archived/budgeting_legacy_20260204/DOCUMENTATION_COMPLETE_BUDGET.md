# DOCUMENTATION COMPLÈTE — MODULE BUDGET
**Version:** v2.1.0 | **Statut:** FROZEN | **Module SPOFE**

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Contrats fonctionnels](#3-contrats-fonctionnels)
4. [Guardian et règles métier](#4-guardian-et-règles-métier)
5. [Commands](#5-commands)
6. [API](#6-api)
7. [Read Models](#7-read-models)
8. [Structure du code](#8-structure-du-code)
9. [Pour créer une version supérieure](#9-pour-créer-une-version-supérieure)

---

## 1. VUE D'ENSEMBLE

### Objectif
Module de gestion des objectifs budgétaires avec calcul automatique des projections de trésorerie, analyse des écarts et alertes de liquidité.

### Responsabilités
- Gérer les budgets (DRAFT → VALIDATED → CLOSED)
- Projections de trésorerie par produit/période
- Analyse des écarts prévisionnel/réalisé
- Alertes de liquidité (CRITICAL/WARNING/OK)

### Positionnement
**Aval du module Cost-Structure** — Budget consomme la vue `rm_cost_projects_budget_ready` pour alimenter ses objectifs.

### Périmètre (In Scope)
- Budgets avec périodes (startDate, endDate, granularity MONTHLY)
- Objectifs budgétaires (SALES, PRODUCTION, EXPENSE)
- Capacités de vente par produit
- Structures de coûts par produit
- Conditions de paiement (client/fournisseur)
- Projections de trésorerie
- Écarts et alertes

### Hors périmètre (Out of Scope)
- Décisions de rentabilité (dans Cost-Structure)
- Calcul des coûts (dans Cost-Structure)
- Comptabilisation (dans Comptabilité)

---

## 2. ARCHITECTURE

### Principes fondamentaux
- **DDD strict** — Domain pur sans dépendance infrastructure
- **Guardian central** — 8 invariants testés
- **PostgreSQL = moteur de calcul** — 5 read-models SQL
- **Append-only** — Aucun UPDATE/DELETE
- **Multi-tenant strict** — RLS PostgreSQL + Guardian
- **Build isolé** — tsconfig.json dédié, 0 erreurs

### Flux d'exécution
```
Frontend → API → Guardian → Repository → PostgreSQL
                              ↓
                          Prometheus → Grafana
```

### Aggregate Root: BudgetObjectif
```typescript
{
  id: string;
  tenantId: string;
  period: { startDate, endDate, granularity: 'MONTHLY' };
  status: 'DRAFT' | 'VALIDATED' | 'CLOSED';
  objectives: BudgetObjectiveItem[];
  salesCapacities: SalesCapacityObjective[];
  costStructures: CostStructure[];
  paymentTerms: PaymentTermsSet;
}
```

---

## 3. CONTRATS FONCTIONNELS

### Documents contractuels
| Document | Description |
|----------|-------------|
| MODULE_BUDGET_CONTRACT.md | Contrat fonctionnel complet |
| CONFORMITE_100_PLAN.md | Plan de conformité |
| RUNBOOK_INCIDENT.md | Runbook incidents |
| CHECKLIST_FINALE.md | Checklist production |

### Intégration Cost-Structure
Budget consomme **uniquement** `rm_cost_projects_budget_ready`:
```json
{
  "projectId": "uuid",
  "unitCost": 7.8,
  "totalCost": 7800,
  "netMargin": 0.18,
  "marginAt70": 0.06
}
```

---

## 4. GUARDIAN ET RÈGLES MÉTIER

### 8 Invariants contractuels

| Code | Invariant | Description |
|------|-----------|-------------|
| **INV-BO-01** | Unicité période | Un seul budget actif par période et tenant |
| **INV-BO-03** | Transitions état | DRAFT → VALIDATED → CLOSED uniquement |
| **INV-BO-04** | Immutabilité | Budget VALIDATED/CLOSED = immuable |
| **INV-BO-06** | Objectifs quantifiables | Quantité >= 0 et finie |
| **INV-BO-09** | Capacité respectée | Objectif <= capacité disponible |
| **INV-BO-11** | Capacité définie | Chaque objectif a une capacité avant validation |
| **INV-BO-12** | Structure coûts | Chaque objectif a une structure avant validation |
| **INV-BO-15** | Termes paiement | Définis avant validation |

### Value Objects
- **Period**: startDate, endDate, granularity
- **Quantity**: value >= 0
- **Money**: amount, currency (XOF)
- **PaymentTerm**: days >= 0

---

## 5. COMMANDS

### 7 Commands métier
| Command | Description |
|---------|-------------|
| CreateBudgetObjectif | Créer un budget |
| UpdateBudgetObjectives | Modifier les objectifs |
| AttachCostStructure | Attacher structure de coûts |
| DefineSalesCapacity | Définir capacité de vente |
| DefinePaymentTerms | Définir termes de paiement |
| ValidateBudgetObjectif | Valider (DRAFT → VALIDATED) |
| CloseBudgetObjectif | Clôturer (VALIDATED → CLOSED) |

---

## 6. API

### Commands (POST)
```
POST /api/budgets                    # Créer
POST /api/budgets/:id/objectives     # Objectifs
POST /api/budgets/:id/costs          # Coûts
POST /api/budgets/:id/capacity       # Capacité
POST /api/budgets/:id/payment-terms  # Paiement
POST /api/budgets/:id/validate       # Valider
POST /api/budgets/:id/close          # Clôturer
```

### Queries (GET)
| Endpoint | Description |
|----------|-------------|
| GET /api/budgets/projection | Projections trésorerie |
| GET /api/budgets/execution | Réalisations comptables |
| GET /api/budgets/variance | Écarts prévisionnel/réalisé |
| GET /api/budgets/cumulative | Cumul progressif |
| GET /api/budgets/alerts | Alertes liquidité |

### Feature Flags (Admin)
```
GET    /api/admin/feature-flags
PUT    /api/admin/feature-flags/:name
POST   /api/admin/feature-flags/:name/toggle
```

---

## 7. READ MODELS

### 5 Vues SQL

| Vue | Description |
|-----|-------------|
| rm_cashflow_projection | Projections agrégées par produit/période |
| rm_cashflow_execution | Réalisé depuis journal_entries |
| rm_cashflow_variance | Écarts prévisionnel/réalisé avec % |
| rm_cashflow_cumulative | Cumul progressif (window function) |
| rm_liquidity_alerts | Alertes CRITICAL/WARNING/OK |

### Exemple: rm_liquidity_alerts
```sql
CREATE VIEW rm_liquidity_alerts AS
SELECT
  tenant_id,
  budget_id,
  period_date,
  SUM(projected_amount) AS projected_total,
  CASE
    WHEN SUM(projected_amount) < 0 THEN 'CRITICAL'
    WHEN SUM(projected_amount) < 1000 THEN 'WARNING'
    ELSE 'OK'
  END AS alert_level
FROM rm_cashflow_projection
GROUP BY tenant_id, budget_id, period_date;
```

---

## 8. STRUCTURE DU CODE

```
budgeting/
├── domain/
│   ├── value-objects.ts       # Period, Money, Quantity, PaymentTerm
│   ├── entities.ts            # BudgetObjectiveItem, SalesCapacity, CostStructure
│   ├── commands.ts            # 7 Commands
│   └── budget.aggregate.ts    # Aggregate Root
├── guardian/
│   └── budget.invariants.ts   # 8 invariants INV-BO-*
├── infrastructure/
│   ├── budget.repository.ts
│   ├── budget.query.repository.ts
│   └── budget.transaction-manager.ts
├── api/
│   ├── dto/                   # 5 DTOs
│   └── budget.query.controller.ts
├── sql/
│   ├── schema.sql
│   ├── read-models/           # 5 vues SQL
│   └── migrations/            # 4 migrations
├── monitoring/
│   ├── prometheus-metrics.ts
│   └── grafana/
└── tests/
    ├── guardian/              # 8 tests invariants
    └── e2e/                   # Multi-tenant RLS
```

---

## 9. POUR CRÉER UNE VERSION SUPÉRIEURE

### Étape 1: Créer v3
```bash
mkdir -p cascade/modules/budget-v3
cp -r cascade/modules/budgeting/* cascade/modules/budget-v3/
```

### Étape 2: Évolutions possibles v3+
- Nouvelles granularités (QUARTERLY, YEARLY)
- Scénarios multiples (optimistic/pessimistic)
- Workflow validation multi-niveaux
- Intégration forecasting ML

### ⚠️ RÈGLES CRITIQUES
| Aspect | Règle |
|--------|-------|
| Guardian | 100% logique métier reste centralisée |
| Cost-Structure | Budget reste exécutant, pas décideur |
| API | GET uniquement pour read-models |
| RLS | Multi-tenant strict obligatoire |

### 📋 Checklist v3+
- [ ] Dossier budget-v3/
- [ ] 8 invariants maintenus ou versionnés
- [ ] Architecture DDD respectée
- [ ] Guardian 100% couverture
- [ ] 5 read-models SQL
- [ ] Tests E2E multi-tenant
- [ ] BUILD_PROOF.md + .sig valides

---

**Module FROZEN — v2.1.0**  
**SPOFE Certified** 🔒💰
