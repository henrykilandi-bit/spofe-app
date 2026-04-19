# 📋 Plan de Mise en Conformité 100% - Module Budget

**Date**: 30 janvier 2026 | **Objectif**: Documentation = Code = Réalité

---

## 🎯 Objectif Final

- ✅ Documentation = spécification contractuelle
- ✅ Tout est vérifiable par le code
- ✅ Module audit-proof (technique + SaaS)

---

## 1️⃣ Architecture — 🟢 Quasi Conforme

### 🔴 Écart: 3 read-models SQL manquants

| Read-model | Statut |
|------------|--------|
| rm_cashflow_execution | ❌ Manquant |
| rm_cashflow_cumulative | ❌ Manquant |
| rm_liquidity_alerts | ❌ Manquant |

### 🛠️ Actions

**1.1 Créer `rm_cashflow_execution`**
- Vue SQL depuis journal_entries
- Endpoint GET /api/budgets/execution
- Test E2E isolation tenant

**1.2 Créer `rm_cashflow_cumulative`**
- Vue SQL avec window functions
- Endpoint GET /api/budgets/cumulative
- Test E2E cumul progressif

**1.3 Créer `rm_liquidity_alerts`**
- Vue SQL avec CASE (CRITICAL/WARNING/OK)
- Endpoint GET /api/budgets/alerts
- Test E2E seuils alertes

### 🧪 Preuve
- [ ] 3 tests E2E GET
- [ ] EXPLAIN ANALYZE documenté
- [ ] Isolation tenant vérifiée

### 🔺 Priorité: **HAUTE**

---

## 2️⃣ Modèle de Domaine — 🟡 Partiel

### 🔴 Écart: 4 commandes manquantes

| Commande | Statut |
|----------|--------|
| AttachCostStructure | ❌ |
| DefineSalesCapacity | ❌ |
| DefinePaymentTerms | ❌ |
| CloseBudgetObjectif | ❌ |

### 🛠️ Actions

**Option A: Implémenter les 4 commandes**
- Handlers Guardian
- Invariants associés
- Tests unitaires

**Option B: Clarifier roadmap**
- Marquer comme "Planned v2.0"
- Retirer de la doc v1.0

### 🧪 Preuve
- [ ] Tests Guardian par commande
- [ ] Tests invariants dédiés

### 🔺 Priorité: **HAUTE**

---

## 3️⃣ Invariants — 🟡 Non Prouvés

### 🔴 Écart: Tests manquants

8 invariants listés, mais pas tous testés individuellement.

### 🛠️ Actions

**Créer `guardian.invariants.spec.ts`**

```typescript
describe('INV-BO-01: Unicité période', () => {
  it('should reject duplicate budget for same period', async () => {
    // Test
  });
});

describe('INV-BO-04: Immutabilité après validation', () => {
  it('should reject update on VALIDATED budget', async () => {
    // Test
  });
});

// ... 6 autres invariants
```

### 🧪 Preuve
- [ ] 8 tests dédiés (1 par invariant)
- [ ] Nom test = code invariant

### 🔺 Priorité: **HAUTE**

---

## 4️⃣ API & OpenAPI — 🟢 Conforme

✅ Rien à corriger

---

## 5️⃣ Multi-tenant — 🟡 RLS Manquant

### 🔴 Écart: RLS PostgreSQL non prouvé

### 🛠️ Actions

**5.1 Activer RLS**
```sql
ALTER TABLE budget_objectif ENABLE ROW LEVEL SECURITY;
```

**5.2 Policy**
```sql
CREATE POLICY tenant_isolation ON budget_objectif
USING (tenant_id = current_setting('app.tenant_id'));
```

**5.3 Injection tenant_id**
```typescript
await db.query("SET app.tenant_id = $1", [tenantId]);
```

### 🧪 Preuve
- [ ] Test E2E: bypass Guardian impossible
- [ ] Test SQL direct → isolation

### 🔺 Priorité: **CRITIQUE** (SaaS)

---

## 6️⃣ Monitoring — 🟡 Non Livré

### 🔴 Écart: Dashboards/alertes non versionnés

### 🛠️ Actions

**6.1 Dashboard Grafana**
- Fichier: `grafana/budget-dashboard.json`
- Panels: commands, latency, rejections

**6.2 Alertes**
- Fichier: `grafana/alerts-budget.yaml`
- Mapping métrique → canal (Slack/Email)

### 🧪 Preuve
- [ ] Import Grafana réussi
- [ ] Test alerte simulée

### 🔺 Priorité: **MOYENNE**

---

## 7️⃣ Ops — 🟡 Runbook Manquant

### 🔴 Écart: Pas de procédure incident

### 🛠️ Actions

**Créer `RUNBOOK_INCIDENT.md`**

Sections:
- Kill switch activé → quoi faire
- Rollback feature flag
- Canary rollback
- DB read-only emergency

### 🧪 Preuve
- [ ] Document validé par ops

### 🔺 Priorité: **MOYENNE**

---

## 📊 Checklist Finale

| Domaine | Action | Statut |
|---------|--------|--------|
| Read-models | 3 vues + endpoints | ⬜ |
| Commandes | Implémenter ou roadmap | ⬜ |
| Invariants | 8 tests unitaires | ⬜ |
| Multi-tenant | RLS PostgreSQL | ⬜ |
| Monitoring | Dashboards Grafana | ⬜ |
| Ops | Runbook incident | ⬜ |

---

## 🏁 Conclusion

**État actuel**: Documentation en avance sur le code

**Avec ces actions**: DOC = CODE = RÉALITÉ

**Résultat**: Module 100% contractuel et audit-proof

---

**© 2026 SPOFE Team - Module Budget Conformité 100%**
