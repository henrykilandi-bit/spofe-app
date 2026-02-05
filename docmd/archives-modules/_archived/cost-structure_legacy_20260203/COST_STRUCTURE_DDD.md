# 🧱 AGRÉGATS & INVARIANTS DDD — MODULE COST-STRUCTURE (COUTFLEX)

Aligné contractuellement avec COST_STRUCTURE_CONTRACT.md v1.0.0

---

## Aggregates

### Aggregate A — EconomicProject
**Rôle :** Racine de décision économique (le “projet” à valider)

#### Identité
- projectId
- tenantId

#### État
- name
- type: PRODUCT | SERVICE
- status: DRAFT | SIMULATED | VALIDATED | REJECTED
- currentVersion (référence vers CostStructure)
- createdBy
- validatedBy?
- validatedAt?

#### Commandes autorisées
- CreateEconomicProject
- AttachCostStructure(version)
- SimulateProject
- ValidateProject
- RejectProject

#### Règles clés
- Un projet VALIDATED ou REJECTED est immuable.
- Toute modification nécessite une nouvelle version de CostStructure.

---

### Aggregate B — CostStructure
**Rôle :** Modèle chiffré versionné des coûts et hypothèses

#### Identité
- costStructureId
- projectId
- version

#### État
- costLines[]
- assumptions
- computedMetrics
  - unitCost
  - totalCost
  - grossMargin
  - netMargin
  - robustness70
  - marginAt70
  - isViable
- status: DRAFT | SIMULATED | FROZEN
- createdBy
- frozenAt?

#### Commandes autorisées
- CreateCostStructure
- AddCostLine
- UpdateAssumptions
- RunSimulation
- FreezeCostStructure

#### Règles clés
- Une CostStructure FROZEN est read-only.
- Une CostStructure ne peut être attachée à Budget que si FROZEN.

---

### Aggregate C — DecisionRecord (support / audit)
**Rôle :** Traçabilité des décisions humaines

#### Identité
- decisionId
- projectId
- costStructureVersion

#### État
- decision: VALIDATE | REJECT
- decidedBy
- decidedAt
- justification

> Cet aggregate est append-only (audit).

---

## 🛡️ INVARIANTS — DÉTAILLÉS & TESTABLES

**Règle Golden :** 1 invariant = 1 test Guardian bloquant

### 🟥 Invariants transverses (Tenant & Sécurité)
- **COUT-SEC-01 — Isolation tenant**
  - Toute commande doit porter le tenantId.
  - Aucune lecture/écriture cross-tenant.
  - Violation → REJECT

### 🟧 Invariants EconomicProject
- **COUT-PROJ-01 — Unicité projet**
  - (tenantId, name) unique.
- **COUT-PROJ-02 — Cycle de vie strict**
  - Transitions autorisées : DRAFT → SIMULATED → VALIDATED | REJECTED
  - Toute autre transition est interdite.
- **COUT-PROJ-03 — Immutabilité post-décision**
  - Si status ∈ {VALIDATED, REJECTED} : aucune commande de modification acceptée.

### 🟨 Invariants CostStructure (structure & données)
- **COUT-CS-01 — Versioning strict**
  - (projectId, version) unique.
  - La version N+1 ne peut exister que si N est FROZEN.
- **COUT-CS-02 — Lignes de coûts valides**
  - amount > 0
  - category ∈ {VARIABLE, FIXED, INDIRECT}
- **COUT-CS-03 — Cohérence des allocations**
  - Toute allocationRule doit référencer une base existante (volume, capacité).
  - Aucune allocation circulaire.
- **COUT-CS-04 — Hypothèses complètes**
  - priceTarget, expectedVolume, capacityMax, scénarios {pessimistic, realistic, optimistic} présents.
  - Manque → simulation interdite.

### 🟦 Invariants de calcul & simulation
- **COUT-SIM-01 — Calcul reproductible**
  - À données identiques → résultats identiques.
  - Les métriques sont dérivées, jamais saisies.
- **COUT-SIM-02 — Simulation obligatoire avant décision**
  - ValidateProject interdit si status !== SIMULATED.

### 🟥 Invariant central (bloquant)
- **COUT-01 — Test de robustesse à 70 %**
  - Définition : Dégrader volumes et/ou prix à 70 %. Recalculer la marge nette.
  - Règle : Si netMargin(70%) <= 0 → REJECT obligatoire.
  - Effet : FreezeCostStructure refusé, ValidateProject refusé

### 🟩 Invariants de décision
- **COUT-DEC-01 — Autorité humaine**
  - Toute validation/rejet requiert un utilisateur identifié.
- **COUT-DEC-02 — Décision finale**
  - Une décision enregistrée est définitive. Toute ré-évaluation ⇒ nouvelle version.

### 🔗 Invariants d’intégration Budget
- **COUT-BUD-01 — Pré-requis Budget**
  - EconomicProject.status === VALIDATED
  - CostStructure.status === FROZEN
  - Sinon → Budget refuse l’engagement.

---

## 🧪 MATRICE TESTS (extrait)
| Invariant        | Type de test         | Bloquant |
|------------------|---------------------|----------|
| COUT-SEC-01      | E2E                 | ✅        |
| COUT-PROJ-02     | Unit Guardian       | ✅        |
| COUT-CS-02       | Unit Guardian       | ✅        |
| COUT-SIM-02      | Integration         | ✅        |
| COUT-01          | Integration / E2E   | ✅        |
| COUT-BUD-01      | Contract test       | ✅        |

---

## 🧩 ÉVÉNEMENTS (faits produits)
- CostStructureSimulated
- CostStructureFrozen
- ProjectValidated
- ProjectRejected

> Ces événements alimentent Budget, reporting, audit.

---

## 🏁 SYNTHÈSE

✔ 2 Aggregates racines clairs (EconomicProject, CostStructure)
✔ 1 Aggregate audit (DecisionRecord)
✔ Invariants bloquants, testables, alignés contrat
✔ Intégration Budget verrouillée
✔ Aucun mélange décision / exécution

---

## Guardian-first & Testabilité
- Tous les invariants sont implémentés dans le Guardian (CostStructureGuardian).
- Chaque invariant est testable unitairement et en intégration.
- Les commandes sont validées par le Guardian avant tout changement d’état.
- Les événements sont produits uniquement si tous les invariants sont respectés.
- L’intégration Budget est contractuelle et vérifiable.

---

## Branchabilité Budget
- Les événements produits sont consommables par le module Budget.
- Les statuts VALIDATED (EconomicProject) et FROZEN (CostStructure) sont prérequis à tout engagement budgétaire.
- Toute violation d’invariant bloque la branche Budget.
