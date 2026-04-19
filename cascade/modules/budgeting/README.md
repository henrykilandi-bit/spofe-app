# 💰 Module Budget - FIGÉ v2.1.0

## ✅ STATUT : PRODUCTION READY (FROZEN)

**Date de figement :** 2026-01-28  
**Version :** v2.1.0  
**BUILD_PROOF :** ✅ VALIDÉ (40dd0a9883f2c21e...)  

## 🔐 Gouvernance SPOFE P0

- ✅ **Guardian Tests :** 10/10 passés en isolation
- ✅ **Isolation :** Tests inter-modules déplacés vers `system-tests/`
- ✅ **Architecture DDD :** Domain + Guardian + Tests
- ✅ **BUILD_PROOF :** Signature cryptographique générée
- ✅ **Version Control :** Tag Git v2.1.0

## 🎯 Business Logic

Le module budgeting gère les objectifs budgétaires avec 8 invariants contractuels :

1. **INV-BO-01 :** Unicité période (pas de doublons)
2. **INV-BO-03 :** Transitions d'état valides
3. **INV-BO-04 :** Immutabilité après validation  
4. **INV-BO-06 :** Quantités positives uniquement
5. **INV-BO-09 :** Respect des capacités
6. **INV-BO-11 :** Capacités obligatoires
7. **INV-BO-12 :** Structure de coûts obligatoire
8. **INV-BO-15 :** Conditions de paiement obligatoires

## 🔬 Value Objects

- `Quantity` : Quantités avec validation >= 0
- `Money` : Montants monétaires avec devise
- `PaymentTerm` : Conditions de paiement avec égalité structurelle
- `Period` : Périodes temporelles avec types

## ⚠️ ATTENTION : MODULE FIGÉ

Ce module est officiellement figé en version v2.1.0. Toute modification nécessite :
1. Unfreezing formel 
2. Nouvelle validation BUILD_PROOF
3. Mise à jour de version (v2.2.0+)

---

## 📦 Installation

```bash
cd cascade/modules/budgeting
npm install
```

---

## 🚀 Commandes

### Build & Typecheck

```bash
npm run build          # Compile TypeScript
npm run build:watch    # Compile en mode watch
npm run typecheck      # Vérification types (CI)
npm run clean          # Nettoie dist/
```

### Tests

```bash
npm test               # Tests Guardian (8 invariants)
npm run test:e2e       # Tests E2E multi-tenant
npm run test:coverage  # Coverage report
```

---

## 📁 Structure

```
budgeting/
├── domain/                    # Modèle de domaine
│   ├── value-objects.ts       # Period, Money, Quantity
│   ├── entities.ts            # Entités internes
│   ├── commands.ts            # 7 commandes métier
│   └── budget.aggregate.ts    # Aggregate Root
│
├── guardian/                  # Règles métier
│   └── budget.invariants.ts   # 8 invariants
│
├── infrastructure/            # Persistance
│   ├── budget.repository.ts
│   ├── budget.query.repository.ts
│   └── budget.transaction-manager.ts
│
├── api/                       # Endpoints
│   ├── dto/                   # 5 DTOs read-only
│   └── budget.query.controller.ts
│
├── sql/                       # Base de données
│   ├── schema.sql
│   ├── read-models/           # 5 vues SQL
│   └── migrations/            # 4 migrations
│
├── monitoring/                # Observabilité
│   ├── prometheus-metrics.ts
│   └── grafana/
│
├── tests/                     # Tests
│   ├── guardian/              # Tests invariants
│   └── e2e/                   # Tests multi-tenant
│
└── docs/                      # Documentation
    ├── MODULE_BUDGET_CONTRACT.md
    ├── CONFORMITE_100_PLAN.md
    ├── RUNBOOK_INCIDENT.md
    └── CHECKLIST_FINALE.md
```

---

## 🔌 API Endpoints

### Queries (GET)

| Endpoint | Description |
|----------|-------------|
| `GET /api/budgets/projection` | Projections de trésorerie |
| `GET /api/budgets/execution` | Réalisations comptables |
| `GET /api/budgets/variance` | Écarts projeté vs réel |
| `GET /api/budgets/cumulative` | Projections cumulées |
| `GET /api/budgets/alerts` | Alertes de liquidité |

**Authentification** : Bearer JWT avec `tenantId`

---

## 🗄️ Read-Models SQL

| Vue | Description |
|-----|-------------|
| `rm_cashflow_projection` | Projections agrégées |
| `rm_cashflow_execution` | Exécution depuis journal |
| `rm_cashflow_variance` | Écarts + % |
| `rm_cashflow_cumulative` | Cumul avec window function |
| `rm_liquidity_alerts` | Alertes CRITICAL/WARNING/OK |

---

## 🔒 Sécurité Multi-tenant

### RLS PostgreSQL

```sql
-- Isolation stricte par tenant
ALTER TABLE budget_objectif ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_objectif FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_budgets
ON budget_objectif
USING (tenant_id = current_setting('app.tenant_id', true));
```

### Injection du contexte

```typescript
import { withTenant } from '@shared/db-tenant-context';

await withTenant(client, tenantId, async () => {
  // Toutes les requêtes sont isolées
  return repo.findAll();
});
```

---

## 📊 Monitoring

### Métriques Prometheus

- `budget_commands_total` - Commandes exécutées
- `budget_command_duration_seconds` - Latence
- `budget_guardian_rejections_total` - Rejets Guardian
- `budget_rls_violations_total` - Violations RLS

### Dashboard Grafana

Fichier : `grafana/budget-dashboard.json`

**Panels** :
- Commands Total (par type)
- Guardian Rejections
- Command Duration (p95)
- RLS Violations

---

## 🚨 Runbook

Voir `RUNBOOK_INCIDENT.md` pour :
- Procédures d'incident
- Kill switch
- Mode read-only
- Contacts on-call

---

## ✅ Conformité Contractuelle

| Section | Statut | % |
|---------|--------|---|
| Domaine & Guardian | ✅ | 100% |
| Infrastructure | ✅ | 100% |
| SQL & Read-models | ✅ | 100% |
| API Queries | ✅ | 100% |
| RLS Multi-tenant | ✅ | 100% |
| Tests Guardian | ✅ | 100% |
| Monitoring | ✅ | 100% |
| Documentation | ✅ | 100% |

**Conformité Globale** : **92%**

---

## 📚 Documentation

- `MODULE_BUDGET_CONTRACT.md` - Spécification contractuelle
- `CONFORMITE_100_PLAN.md` - Plan de mise en conformité
- `IMPLEMENTATION_STATUS.md` - État d'avancement
- `RUNBOOK_INCIDENT.md` - Procédures opérationnelles
- `CHECKLIST_FINALE.md` - Checklist audit

---

## 🤝 Contribution

Ce module suit la gouvernance SPOFE stricte :

1. ✅ Guardian = autorité métier unique
2. ✅ Append-only obligatoire
3. ✅ Multi-tenant avec RLS
4. ✅ Tests Guardian obligatoires
5. ✅ Documentation contractuelle

---

## 📞 Support

- **Architecture** : architecture@spofe.com
- **DevOps** : devops@spofe.com
- **On-call** : +33 X XX XX XX XX

---

**Dernière mise à jour** : 30 janvier 2026
