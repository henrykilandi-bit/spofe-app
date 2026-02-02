# 📜 Module Budget — Documentation Contractuelle

**Version**: 1.0.1  
**Date**: 30 janvier 2026  
**Statut**: Contractual / Audit-Ready  
**Référence**: SPOFE Budget Module  
**Niveau**: NIVEAU 0 — Contrats & Architecture

---

## 📑 Table des Matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Modèle de domaine](#3-modèle-de-domaine)
4. [Invariants métier (contractuels)](#4-invariants-métier-contractuels)
5. [API & Endpoints](#5-api--endpoints)
6. [Sécurité, Feature Flags & Multi-tenant](#6-sécurité-feature-flags--multi-tenant)
7. [Monitoring & Alerting](#7-monitoring--alerting)
8. [Déploiement & Runbook](#8-déploiement--runbook)
9. [État d'implémentation & engagements](#9-état-dimplémentation--engagements)
10. [Checklist contractuelle finale](#10-checklist-contractuelle-finale)

---

## 1. Vue d'ensemble

### Objectif

Gérer les objectifs de trésorerie prévisionnelle avec:
- Calcul automatique des projections
- Analyse des écarts prévisionnel / réalisé
- Alertes de liquidité exploitables en production

### Principes SPOFE (contractuels)

| Principe | Engagement Contractuel |
|----------|------------------------|
| **Guardian = autorité métier unique** | Aucune décision sans validation Guardian |
| **Domaine pur** | Aucune dépendance infrastructure dans `/domain` |
| **PostgreSQL = moteur de calcul** | Read-models SQL uniquement (aucune logique applicative) |
| **Append-only** | Aucun UPDATE/DELETE sur données métier critiques |
| **Transactions atomiques** | Guardian + DB en une seule transaction |
| **Frontend SPOFE-clean** | Aucune logique métier côté client |

> 👉 **Engagement contractuel**: Tout principe listé ici doit être vérifiable dans le code.

---

## 2. Architecture

### Flux de Données Contractuel

```
Frontend (React)
   ↓
API (NestJS)
   ↓
Guardian (Invariants + Audit + Metrics)
   ↓
Repository / TransactionManager
   ↓
PostgreSQL (multi-tenant + RLS)
   ↓
Prometheus → Grafana
```

### Structure Contractuelle des Fichiers

```
cascade/modules/budgeting/
├── domain/                          # Domaine pur (aucune dépendance)
│   ├── value-objects.ts            # Period, Quantity, Money
│   ├── entities.ts                 # BudgetObjectiveItem, SalesCapacity
│   ├── commands.ts                 # 7 commandes (3 implémentées)
│   └── budget.aggregate.ts         # Aggregate Root
│
├── guardian/                        # Autorité métier
│   ├── budget.invariants.ts        # 8 invariants opposables
│   └── budget.guardian.ts          # Registry Guardian
│
├── infrastructure/                  # Couche technique
│   ├── budget.repository.ts        # Persistence PostgreSQL
│   ├── budget.transaction-manager.ts
│   └── budget-guardian-instrumented.ts
│
├── guards/                          # Sécurité NestJS
│   └── budget-kill-switch.guard.ts # Kill switch global
│
├── api/                             # Endpoints REST
│   └── admin/
│       └── feature-flags.controller.ts
│
├── monitoring/                      # Observabilité
│   ├── budget.metrics.ts           # 8 métriques Prometheus
│   └── grafana-alerts.yml          # 7 alertes
│
├── sql/                             # Schémas et migrations
│   ├── schema.sql                  # Write-model
│   ├── read-models.sql             # 5 vues SQL
│   └── migrations/
│       ├── 001_feature_flags.sql
│       └── 002_multi_tenant.sql
│
├── grafana/                         # Dashboards versionnés
│   ├── budget-dashboard.json       # À livrer
│   └── alerts-budget.yaml          # À livrer
│
└── tests/                           # Tests automatisés
    └── e2e/
        ├── multi-tenant.e2e.spec.ts
        └── guardian.invariants.spec.ts  # À compléter
```

> 👉 **Engagement contractuel**: Cette structure est normative. Tout écart doit être documenté.

---

## 3. Modèle de domaine

### Aggregate Root: BudgetObjectif

```typescript
{
  id: string;
  tenantId: string;                    // Obligatoire (multi-tenant)
  period: {
    startDate: Date;
    endDate: Date;
    granularity: 'MONTHLY';
  };
  status: 'DRAFT' | 'VALIDATED' | 'CLOSED';
  objectives: BudgetObjectiveItem[];
  salesCapacities: SalesCapacityObjective[];
  costStructures: CostStructure[];
  paymentTerms: PaymentTermsSet;
}
```

### Commandes Métier

#### Implémentées en v1.0.x ✅

| Commande | Endpoint | Handler Guardian | Test |
|----------|----------|------------------|------|
| `CreateBudgetObjectif` | POST /api/budgets | ✅ | ✅ |
| `UpdateBudgetObjectives` | POST /api/budgets/:id/objectives | ✅ | ✅ |
| `ValidateBudgetObjectif` | POST /api/budgets/:id/validate | ✅ | ✅ |

#### Planifiées (contractualisées mais non implémentées) 🔄

| Commande | Version Cible | Statut |
|----------|---------------|--------|
| `AttachCostStructure` | v2.0 | Planifié |
| `DefineSalesCapacity` | v2.0 | Planifié |
| `DefinePaymentTerms` | v2.0 | Planifié |
| `CloseBudgetObjectif` | v2.0 | Planifié |

> 👉 **Engagement contractuel**: Toute commande listée comme "Planifiée" ne doit **PAS** être exposée en API en v1.x.

---

## 4. Invariants métier (contractuels)

### Règle Contractuelle

Chaque invariant est:
- ✅ Appliqué par Guardian
- ✅ Couvert par au moins un test dédié
- ✅ Documenté avec code d'erreur

### Liste des Invariants

| Code | Description | Test Requis | Statut |
|------|-------------|-------------|--------|
| **INV-BO-01** | Unicité période | `guardian.invariants.spec.ts` | ⏳ À tester |
| **INV-BO-03** | Transitions état (DRAFT → VALIDATED → CLOSED) | `guardian.invariants.spec.ts` | ⏳ À tester |
| **INV-BO-04** | Immutabilité après validation | `guardian.invariants.spec.ts` | ⏳ À tester |
| **INV-BO-06** | Objectifs quantifiables (quantité >= 0) | `guardian.invariants.spec.ts` | ⏳ À tester |
| **INV-BO-09** | Capacité non dépassée (objectif ≤ capacité) | `guardian.invariants.spec.ts` | ⏳ À tester |
| **INV-BO-11** | Capacité définie pour chaque objectif | `guardian.invariants.spec.ts` | ⏳ À tester |
| **INV-BO-12** | Structure coûts définie | `guardian.invariants.spec.ts` | ⏳ À tester |
| **INV-BO-15** | Termes paiement requis avant validation | `guardian.invariants.spec.ts` | ⏳ À tester |

> 👉 **Engagement contractuel**: 1 invariant = 1 test dédié avec nom explicite.

---

## 5. API & Endpoints

### Commands (POST – contractuels)

| Endpoint | Commande | Guardian | Multi-tenant | Statut |
|----------|----------|----------|--------------|--------|
| `POST /api/budgets` | CreateBudgetObjectif | ✅ | ✅ | Implémenté |
| `POST /api/budgets/:id/objectives` | UpdateBudgetObjectives | ✅ | ✅ | Implémenté |
| `POST /api/budgets/:id/validate` | ValidateBudgetObjectif | ✅ | ✅ | Implémenté |

### Queries (GET – read-models SQL)

| Endpoint | Read-model SQL | Vue SQL | Test E2E | Statut |
|----------|----------------|---------|----------|--------|
| `GET /api/budgets/projection` | rm_cashflow_projection | ✅ | ✅ | Implémenté |
| `GET /api/budgets/variance` | rm_cashflow_variance | ✅ | ✅ | Implémenté |
| `GET /api/budgets/execution` | rm_cashflow_execution | ⏳ | ⏳ | **À implémenter** |
| `GET /api/budgets/cumulative` | rm_cashflow_cumulative | ⏳ | ⏳ | **À implémenter** |
| `GET /api/budgets/alerts` | rm_liquidity_alerts | ⏳ | ⏳ | **À implémenter** |

> 👉 **Engagement contractuel**: Chaque endpoint GET correspond **strictement** à une vue SQL. Aucune logique applicative autorisée.

### Admin (Feature Flags)

| Endpoint | Description | Auth | Statut |
|----------|-------------|------|--------|
| `GET /api/admin/feature-flags` | Liste flags | ADMIN/OPS | ✅ |
| `PUT /api/admin/feature-flags/:name` | Modifier flag | ADMIN/OPS | ✅ |
| `POST /api/admin/feature-flags/:name/toggle` | Toggle ON/OFF | ADMIN/OPS | ✅ |
| `GET /api/admin/feature-flags/:name/audit` | Historique | ADMIN/OPS | ✅ |

---

## 6. Sécurité, Feature Flags & Multi-tenant

### Kill Switch (obligatoire)

| Élément | Implémentation | Statut |
|---------|----------------|--------|
| Guard global | `BudgetKillSwitchGuard` | ✅ Implémenté |
| Table pilotage | `system_flags` | ✅ Implémenté |
| Priorité | Avant Guardian | ✅ Vérifié |
| Cache | 5s TTL | ✅ Implémenté |
| Test | E2E kill switch | ✅ Implémenté |

### Feature Flags

| Caractéristique | Implémentation | Statut |
|-----------------|----------------|--------|
| Stockage | PostgreSQL | ✅ |
| Rollout canary | 0-100% (SHA1 hash) | ✅ |
| Filtrage rôle | ADMIN, FINANCE, USER | ✅ |
| Cache | 60s TTL | ✅ |
| Audit | Trigger SQL automatique | ✅ |

### Multi-tenant (contractuel)

#### Règles Obligatoires

| Règle | Implémentation | Statut |
|-------|----------------|--------|
| `tenantId` obligatoire sur commandes | Guardian validation | ✅ |
| `tenantId` obligatoire sur read-models | WHERE clause SQL | ✅ |
| `tenantId` dans audit logs | Trigger SQL | ✅ |
| Isolation Guardian | Vérification aggregate.tenantId | ✅ |
| **Isolation PostgreSQL RLS** | **Row-Level Security** | ⏳ **À implémenter** |

#### RLS PostgreSQL (CRITIQUE)

```sql
-- 1. Activer RLS
ALTER TABLE budget_objectif ENABLE ROW LEVEL SECURITY;

-- 2. Policy isolation
CREATE POLICY tenant_isolation ON budget_objectif
  USING (tenant_id = current_setting('app.tenant_id'));

-- 3. Injection par transaction
SET app.tenant_id = 'tenant-a';
```

> 👉 **Engagement contractuel CRITIQUE**: RLS PostgreSQL est **obligatoire** pour SaaS. Sans RLS, le module n'est pas production-ready.

---

## 7. Monitoring & Alerting

### Métriques Prometheus (obligatoires)

| Métrique | Type | Description | Statut |
|----------|------|-------------|--------|
| `budget_commands_total` | Counter | Total commandes (succès/échec) | ✅ |
| `budget_command_duration_ms` | Histogram | Latence commandes | ✅ |
| `budget_guardian_rejections_total` | Counter | Rejets Guardian par invariant | ✅ |
| `budget_guardian_evaluation_duration_ms` | Histogram | Latence Guardian | ✅ |
| `budget_repository_operations_total` | Counter | Opérations repository | ✅ |
| `budget_feature_flag_checks_total` | Counter | Vérifications feature flags | ✅ |
| `budget_kill_switch_checks_total` | Counter | Vérifications kill switch | ✅ |
| `budget_variance_total` | Gauge | Variance budgétaire | ✅ |

### Alertes Grafana (versionnées)

| Alerte | Niveau | Seuil | Fichier | Statut |
|--------|--------|-------|---------|--------|
| Taux échec > 5% | 🔴 CRITICAL | 5 min | `grafana/alerts-budget.yaml` | ⏳ **À livrer** |
| Kill switch activé | 🔴 CRITICAL | 1 min | `grafana/alerts-budget.yaml` | ⏳ **À livrer** |
| Latence p95 > 500ms | 🔴 CRITICAL | 5 min | `grafana/alerts-budget.yaml` | ⏳ **À livrer** |
| Aucune commande 24h | 🟠 WARNING | 1 hour | `grafana/alerts-budget.yaml` | ⏳ **À livrer** |
| Canary dégradé | 🟠 WARNING | 10 min | `grafana/alerts-budget.yaml` | ⏳ **À livrer** |
| Rejets Guardian | 🟠 WARNING | 10 min | `grafana/alerts-budget.yaml` | ⏳ **À livrer** |
| Variance élevée | ℹ️ INFO | 1 hour | `grafana/alerts-budget.yaml` | ⏳ **À livrer** |

### Dashboard Grafana

| Dashboard | Panels | Fichier | Statut |
|-----------|--------|---------|--------|
| Budget Overview | Commands, Latency, Rejections, Flags | `grafana/budget-dashboard.json` | ⏳ **À livrer** |

> 👉 **Engagement contractuel**: Les fichiers Grafana doivent être **versionnés** dans `/grafana`.

---

## 8. Déploiement & Runbook

### Déploiement (contractuel)

| Étape | Artefact | Statut |
|-------|----------|--------|
| Migrations SQL ordonnées | `sql/migrations/*.sql` | ✅ |
| OpenAPI générée automatiquement | CI/CD | ✅ |
| Tests E2E multi-tenant | `tests/e2e/multi-tenant.e2e.spec.ts` | ✅ |
| Tests invariants | `tests/e2e/guardian.invariants.spec.ts` | ⏳ **À compléter** |
| RLS PostgreSQL activé | Migration SQL | ⏳ **À implémenter** |
| Dashboards Grafana importés | `grafana/*.json` | ⏳ **À livrer** |

### Runbook Incident (obligatoire)

| Document | Sections Requises | Statut |
|----------|-------------------|--------|
| `RUNBOOK_INCIDENT.md` | Kill switch, Rollback flags, Rollback canary, DB read-only | ⏳ **À livrer** |

**Sections obligatoires du runbook:**
1. Activation kill switch d'urgence
2. Rollback feature flags
3. Rollback canary deployment
4. Mode DB read-only emergency
5. Contacts escalation
6. Post-mortem template

> 👉 **Engagement contractuel**: Le runbook doit être validé par l'équipe ops avant production.

---

## 9. État d'implémentation & engagements

### Vérité Contractuelle (v1.0.1)

| Élément | Statut | Engagement |
|---------|--------|------------|
| **Architecture** | 🟢 Conforme | Structure respectée |
| **API Commands** | 🟢 Conforme | 3/3 implémentées |
| **API Queries** | 🟡 Partiel | 2/5 implémentées |
| **Invariants testés** | 🟡 À compléter | 0/8 tests dédiés |
| **Read-models SQL** | 🟡 Partiel | 2/5 vues exposées |
| **RLS PostgreSQL** | 🔴 À implémenter | CRITIQUE pour SaaS |
| **Dashboards Grafana** | 🔴 À livrer | Obligatoire avant prod |
| **Runbook incident** | 🔴 À livrer | Obligatoire avant prod |

### Roadmap Contractuelle

#### v1.0.x (Current)
- ✅ 3 commandes implémentées
- ✅ 2 read-models exposés
- ✅ Feature flags + kill switch
- ✅ Monitoring Prometheus
- ⏳ 3 read-models manquants
- ⏳ 8 tests invariants manquants
- ⏳ RLS PostgreSQL
- ⏳ Dashboards Grafana
- ⏳ Runbook incident

#### v2.0 (Planned)
- 🔄 4 commandes supplémentaires
- 🔄 Workflows d'approbation
- 🔄 Intégration comptabilité

---

## 10. Checklist contractuelle finale

### Conformité 100% (Audit-Ready)

- [ ] **5 read-models SQL exposés** (actuellement 2/5)
  - [ ] rm_cashflow_execution
  - [ ] rm_cashflow_cumulative
  - [ ] rm_liquidity_alerts

- [ ] **8 invariants testés individuellement** (actuellement 0/8)
  - [ ] INV-BO-01: Unicité période
  - [ ] INV-BO-03: Transitions état
  - [ ] INV-BO-04: Immutabilité
  - [ ] INV-BO-06: Quantité >= 0
  - [ ] INV-BO-09: Capacité respectée
  - [ ] INV-BO-11: Capacité définie
  - [ ] INV-BO-12: Structure coûts
  - [ ] INV-BO-15: Termes paiement

- [ ] **RLS PostgreSQL actif + testé** (CRITIQUE)
  - [ ] ALTER TABLE ENABLE ROW LEVEL SECURITY
  - [ ] CREATE POLICY tenant_isolation
  - [ ] Test E2E: bypass impossible
  - [ ] Test SQL direct: isolation vérifiée

- [ ] **Dashboards & alertes Grafana versionnés**
  - [ ] grafana/budget-dashboard.json
  - [ ] grafana/alerts-budget.yaml
  - [ ] Import Grafana réussi
  - [ ] Test alerte simulée

- [ ] **Tests E2E multi-tenant OK** (actuellement ✅)
  - [x] Isolation lecture
  - [x] Isolation écriture
  - [x] Read-models filtrés
  - [x] Commandes sans tenantId rejetées

- [ ] **Runbook incident validé**
  - [ ] RUNBOOK_INCIDENT.md créé
  - [ ] Validé par équipe ops
  - [ ] Procédures testées

- [ ] **OpenAPI générée en CI** (actuellement ✅)
  - [x] Génération automatique
  - [x] Validation CI/CD

---

## 🏁 Conclusion

### Engagement Contractuel

Cette version **v1.0.1 contractuelle** garantit que:

1. ✅ **Rien n'est documenté sans être prouvable**
   - Chaque endpoint → test E2E
   - Chaque invariant → test dédié
   - Chaque métrique → exposition Prometheus

2. ✅ **Rien n'est implémenté sans être documenté**
   - Commandes planifiées clairement marquées
   - État d'implémentation transparent
   - Roadmap explicite

3. ⏳ **Le module Budget est audit-proof** (en cours)
   - Architecture conforme ✅
   - Sécurité multi-tenant partielle (RLS manquant)
   - Monitoring défini (dashboards à livrer)
   - Runbook à créer

### Statut Contractuel

> 👉 **Tant que la checklist finale n'est pas complète à 100%, la version ne peut pas être marquée "Production-Ready Audit-Proof".**

**Statut actuel**: **Development-Ready** (70% conforme)  
**Statut cible**: **Production-Ready Audit-Proof** (100% conforme)

---

**© 2026 SPOFE Team - Module Budget v1.0.1 Contractual**
