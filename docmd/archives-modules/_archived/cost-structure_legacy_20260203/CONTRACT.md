# 📘 CONTRAT OFFICIEL — COUTFLEX → BUDGET

**Version** : v1.0.0  
**Statut** : Contractuel & Bloquant  
**Sens du flux** : COUTFLEX ⟶ Budget (unidirectionnel)  
**Date** : 2026-02-01  
**Référence** : Golden Module Budget v1.0.1

---

## 1️⃣ Principe Fondamental (à graver dans le marbre)

> ❗ **Budget ne prend aucune décision de rentabilité.**
> ❗ **Budget ne valide aucun prix.**
> ❗ **Budget n'engage aucune ressource sans autorisation explicite de COUTFLEX.**

**COUTFLEX est une autorité préalable.**  
**Budget est un exécutant conditionnel.**

---

## 2️⃣ Nature du Contrat

| Élément | Valeur |
|---------|--------|
| **Type de contrat** | Read-only / décisionnel |
| **Couplage** | Faible (API + SQL view) |
| **Sens** | Unidirectionnel |
| **Temps** | Avant toute création de budget |
| **Rupture tolérée** | ❌ Non |

---

## 3️⃣ Artefact Contractuel UNIQUE

### 🔒 Vue contractuelle canonique : `rm_cost_projects_budget_ready`

C'est la **SEULE source** que Budget a le droit de consommer.

**Budget n'a PAS le droit de :**
- Lire les projets non validés
- Recalculer une marge
- Interpréter une hypothèse

---

## 4️⃣ Conditions d'Éligibilité Budgétaire (Bloquantes)

Un projet est budgétable **si et seulement si** :

```
EconomicProject.status        = VALIDATED
CostStructure.status          = FROZEN
Simulation.viableAt70         = true
Tenant isolation respected    = true
```

**Toutes ces conditions sont évaluées par COUTFLEX, jamais par Budget.**

---

## 5️⃣ Données Fournies à Budget (Contrat Strict)

### 📦 Payload Logique (Lecture)

```json
{
  "tenantId": "uuid",
  "projectId": "uuid",
  "projectName": "Produit / Service",
  "version": 3,
  "unitCost": 7.8,
  "totalCost": 7800,
  "netMargin": 0.18,
  "marginAt70": 0.06
}
```

### Interprétation Autorisée pour Budget

| Champ | Usage Autorisé |
|-------|----------------|
| `unitCost` | Calcul budget unitaire |
| `totalCost` | Projection globale |
| `netMargin` | Indicateur de pilotage |
| `marginAt70` | Indicateur de risque |
| `projectId` | Référence obligatoire |

**🚫 Budget ne peut PAS modifier ces valeurs.**

---

## 6️⃣ Règles d'Utilisation Côté Budget (OBLIGATOIRES)

### 6.1 Création de Budget

Budget **DOIT** vérifier avant toute création :

```typescript
if (!existsInCostStructureBudgetReady(projectId)) {
  throw BudgetError.NOT_AUTHORIZED_BY_COST_STRUCTURE;
}
```

**Cette règle est bloquante.**

### 6.2 Cycle de Vie Budget

| Action Budget | Autorisation |
|---------------|--------------|
| Créer un budget | ✅ si COUTFLEX validé |
| Modifier un budget | ✅ (pilotage) |
| Créer un budget sans COUTFLEX | ❌ |
| Modifier le prix validé | ❌ |
| Ignorer marginAt70 | ❌ |

---

## 7️⃣ Invariant Contractuel Budget (Obligatoire)

### BUD-COUT-01 — Pré-autorisation COUTFLEX

> Aucune Command Budget ne peut être validée sans une validation COUTFLEX préalable.

**Violation → REJECT immédiat par Guardian Budget**

### Implémentation Requise

**Côté COUTFLEX** (`cascade/modules/cost-structure/domain/invariants.ts`):
```typescript
export const CONTRACT_INVARIANTS = {
  BUD_COUT_01: {
    code: 'BUD-COUT-01',
    description: 'Pré-autorisation COUTFLEX obligatoire',
    validate: (budgetReadyProject: BudgetReadyProject | null): boolean => {
      return budgetReadyProject !== null;
    },
    errorMessage: 'Budget creation rejected: Project not validated by COUTFLEX'
  }
};
```

**Côté Budget** (`cascade/modules/budgeting/domain/invariants.ts`):
```typescript
export const BUDGET_INVARIANTS = {
  BUD_COUT_01: {
    code: 'BUD-COUT-01',
    description: 'Pré-autorisation COUTFLEX obligatoire avant création budget',
    validate: async (projectId: string, costStructureApi: CostStructureApiPort): Promise<boolean> => {
      const project = await costStructureApi.getBudgetReadyProject(projectId);
      return project !== null && project.viableAt70 === true;
    },
    errorMessage: 'BUD-COUT-01: Budget creation requires COUTFLEX validation'
  }
};
```

---

## 8️⃣ Gestion des Changements (Cas Critique)

### ❗ Cas : Nouvelle version COUTFLEX après Budget

Si :
- Une nouvelle CostStructure version est créée, **OU**
- Un projet est REJECTED ultérieurement

Alors :

| Action | Règle |
|--------|-------|
| Budget existant | ⚠️ Passe en at-risk |
| Nouveau budget | ❌ Interdit |
| Pilotage | ✅ Autorisé |
| Alerte | ✅ Obligatoire |

**Budget ne recalcule pas. Il alerte.**

---

## 9️⃣ Contrat API (Technique)

### Endpoint Autorisé pour Budget

```
GET /api/cost-structure/budget-ready/projects
```

### Règles :

- Budget ne consomme **que cet endpoint**
- Aucun fallback
- Aucune autre API COUTFLEX n'est autorisée

### Interface TypeScript (Côté Budget)

```typescript
// cascade/modules/budgeting/ports/cost-structure-api.port.ts
export interface CostStructureApiPort {
  getBudgetReadyProject(projectId: string): Promise<BudgetReadyProject | null>;
  getAllBudgetReadyProjects(tenantId: string): Promise<BudgetReadyProject[]>;
}

export interface BudgetReadyProject {
  tenantId: string;
  projectId: string;
  projectName: string;
  version: number;
  unitCost: number;
  totalCost: number;
  netMargin: number;
  marginAt70: number;
  validatedAt: Date;
}
```

---

## 🔟 Sécurité & Multi-Tenant

- `tenant_id` obligatoire
- Double barrière :
  1. Guardian logique COUTFLEX
  2. RLS PostgreSQL

**Budget n'a aucun moyen de bypass.**

---

## 1️⃣1️⃣ Tests Contractuels Obligatoires

### Tests Côté Budget

- [ ] Refus création budget sans COUTFLEX
- [ ] Refus si projet non VALIDATED
- [ ] Refus si marginAt70 ≤ 0
- [ ] Acceptation uniquement via budget_ready

### Tests Côté COUTFLEX

- [ ] Aucun projet invalide exposé
- [ ] Vue budget_ready conforme
- [ ] Données immuables

---

## 1️⃣2️⃣ Ce que Budget N'A PAS LE DROIT de Faire

| Interdiction | Raison |
|--------------|--------|
| ❌ Recalculer un coût | Autorité COUTFLEX uniquement |
| ❌ Recalculer une marge | Autorité COUTFLEX uniquement |
| ❌ Modifier un prix validé | Immutabilité FROZEN |
| ❌ Ignorer le test 70% | Invariant COUT-01 |
| ❌ Créer un budget "exceptionnel" | Pas de dérogation en v1 |

**Aucune dérogation n'est prévue en v1.**

---

## 1️⃣3️⃣ Definition of Done — Contrat COUTFLEX → Budget

Le contrat est conforme si :

- [x] Budget lit uniquement `budget_ready`
- [ ] Aucun budget sans COUTFLEX validé
- [ ] Tests contractuels verts
- [ ] Invariant **BUD-COUT-01** implémenté
- [ ] Aucun couplage write-side

---

## 📎 Références Implémentées

| Module | Fichier | Description |
|--------|---------|-------------|
| COUTFLEX | `sql/migrations/002_create_read_models.sql` | Vue `rm_cost_projects_budget_ready` |
| COUTFLEX | `api/cost-structure-read.controller.ts` | Endpoint `/budget-ready/projects` |
| COUTFLEX | `tests/e2e/budget-integration.e2e.spec.ts` | Tests contractuels COUTFLEX |
| Budget | `ports/cost-structure-api.port.ts` | Interface de consommation (à créer) |
| Budget | `domain/invariants.ts` | Invariant **BUD-COUT-01** (à créer) |
| Budget | `tests/e2e/coutflex-contract.e2e.spec.ts` | Tests contractuels Budget (à créer) |

---

## 🏁 Verdict Contractuel

| Critère | Statut |
|---------|--------|
| ✅ Vue canonique définie | `rm_cost_projects_budget_ready` |
| ✅ Conditions d'éligibilité claires | VALIDATED + FROZEN + viableAt70 |
| ✅ Invariant BUD-COUT-01 spécifié | À implémenter côté Budget |
| ✅ API technique définie | `/budget-ready/projects` |
| ⚠️ Tests contractuels Budget | En attente d'implémentation |

---

**🏆 Ce contrat est normatif. Après ce document, Budget ne "devine" plus rien : il obéit.**

*Document contractuel officiel - v1.0.0 - 2026-02-01*
