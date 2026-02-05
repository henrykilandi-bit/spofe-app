# 🏛️ ARCHITECTURE EXACTE — COST-STRUCTURE (COUTFLEX) v1.0.0

**Version**: v1.0.0  
**Type**: Module décisionnel (non transactionnel)  
**Position**: Amont du module Budget  
**Golden Reference**: Budget v1.0.1  
**Date**: 2026-01-31  
**Statut**: ✅ Référence définitive - Aucune ambiguïté

---

## 1️⃣ Vue d'Ensemble (Responsabilités Claires)

```
┌────────────────────────┐
│   EconomicProject      │  ← Décision métier (GO / NO GO)
│   (Aggregate Root)     │
└──────────┬─────────────┘
           │ owns
┌──────────▼─────────────┐
│   CostStructure        │  ← Modèle chiffré versionné
│   (Aggregate Root)     │
└──────────┬─────────────┘
           │ produces
┌──────────▼─────────────┐
│   DecisionRecord       │  ← Audit append-only
│   (Audit Aggregate)    │
└────────────────────────┘
           │
           ▼
    Read-models SQL
           │
           ▼
        Budget
```

**Principe**: Deux aggregates métier + un aggregate audit. **Zéro mélange de responsabilités.**

---

## 2️⃣ AGGREGATE 1 — EconomicProject (Racine Décisionnelle)

### 🎯 Responsabilité
Porter la décision économique finale d'un produit ou service.

### Identité
- `EconomicProjectId` (UUID)
- `TenantId` (UUID)

### État Interne
```typescript
interface EconomicProject {
  id: string;
  tenantId: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  status: 'DRAFT' | 'SIMULATED' | 'VALIDATED' | 'REJECTED';
  currentVersion: number;
  createdBy: string;
  validatedBy?: string;
  validatedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
}
```

### Commandes Acceptées
| Command | Input | Output |
|---------|-------|--------|
| `CreateEconomicProject` | name, type, actorId | EconomicProjectCreated |
| `AttachCostStructure` | version | CostStructureCreated |
| `ValidateProject` | actorId | ProjectValidated |
| `RejectProject` | reason, actorId | ProjectRejected |

### Événements Émis
- `EconomicProjectCreated`
- `ProjectValidated` ⚠️ **Écouté par Budget**
- `ProjectRejected`

### Règle Clé
> **Aucune décision sans CostStructure FROZEN valide.**

---

## 3️⃣ AGGREGATE 2 — CostStructure (Racine Analytique)

### 🎯 Responsabilité
Définir, simuler et figer une structure de coûts versionnée.

### Identité
- `CostStructureId` (UUID)
- `ProjectId` (UUID) + `Version` (number)

### État Interne
```typescript
interface CostStructure {
  projectId: string;
  tenantId: string;
  version: number;
  status: 'DRAFT' | 'SIMULATED' | 'FROZEN';
  
  costLines: CostLine[];
  assumptions: Assumptions;
  
  simulation?: {
    unitCost: number;
    totalCost: number;
    grossMargin: number;
    netMargin: number;
    marginAt70: number;  // 🚨 Invariant COUT-01
    viableAt70: boolean;
  };
  
  createdBy: string;
  frozenAt?: Date;
  frozenBy?: string;
}

interface CostLine {
  category: 'VARIABLE' | 'FIXED' | 'INDIRECT';
  label: string;
  amount: Money;
  allocationRule?: string;
}

interface Assumptions {
  priceTarget: Money;
  expectedVolume: number;
  capacityMax: number;
  scenarios: {
    pessimistic: number;
    realistic: number;
    optimistic: number;
  };
}
```

### Commandes Acceptées
| Command | Input | Output | Invariant Vérifié |
|---------|-------|--------|-------------------|
| `CreateCostStructure` | projectId, version, actorId | CostStructureCreated | COUT-CS-01 |
| `AddCostLine` | category, label, amount, actorId | CostLineAdded | COUT-CS-02, COUT-CS-03 |
| `UpdateAssumptions` | assumptions, actorId | AssumptionsUpdated | COUT-CS-04 |
| `RunSimulation` | metrics (Guardian), actorId | CostStructureSimulated | COUT-SIM-01, COUT-SIM-02 |
| `FreezeCostStructure` | actorId | CostStructureFrozen | **COUT-01** ⚠️ |

### Événements Émis
- `CostStructureCreated`
- `CostLineAdded`
- `AssumptionsUpdated`
- `CostStructureSimulated`
- `CostStructureFrozen` ⚠️ **Écouté par Budget**

### Règle Clé
> **Une CostStructure FROZEN est strictement immuable.**

---

## 4️⃣ AGGREGATE 3 — DecisionRecord (Audit Pur)

### 🎯 Responsabilité
Tracer toute décision humaine irréversible.

### Nature
- **Append-only**
- **Non modifiable**
- **Non décisionnel** (pas de logique métier)

### Structure
```typescript
interface DecisionRecord {
  id: string;
  tenantId: string;
  projectId: string;
  version: number;
  decision: 'VALIDATED' | 'REJECTED';
  decidedBy: string;
  decidedAt: Date;
  justification: string;
}
```

### Factories
```typescript
static createValidation(decisionId, projectId, tenantId, version, decidedBy, justification)
static createRejection(decisionId, projectId, tenantId, version, decidedBy, reason)
```

### 📌 Aucune logique métier ici. Audit uniquement.

---

## 5️⃣ INVARIANTS — Classification Exacte

### 🔴 Invariants BLOQUANTS (Guardian)

#### Sécurité & Isolation
| Code | Invariant | Description | Test |
|------|-----------|-------------|------|
| **COUT-SEC-01** | Isolation tenant stricte | Données jamais mélangées entre tenants | ✅ E2E |

#### Projet
| Code | Invariant | Description | Test |
|------|-----------|-------------|------|
| **COUT-PROJ-01** | Unicité | (tenant + name) unique | ✅ Unit |
| **COUT-PROJ-02** | Cycle de vie strict | DRAFT → SIMULATED → VALIDATED/REJECTED | ✅ Unit |
| **COUT-PROJ-03** | Immutabilité après décision | Aucune modif si VALIDATED/REJECTED | ✅ Unit |

#### Structure de Coûts
| Code | Invariant | Description | Test |
|------|-----------|-------------|------|
| **COUT-CS-01** | Versioning strict | Version N+1 si N FROZEN | ✅ Unit |
| **COUT-CS-02** | Coûts strictement positifs | amount > 0 | ✅ Unit |
| **COUT-CS-03** | Allocations non circulaires | Pas de référence circulaire | ✅ Unit |
| **COUT-CS-04** | Hypothèses complètes | Tous les champs requis avant simulation | ✅ Unit |

#### Simulation
| Code | Invariant | Description | Test |
|------|-----------|-------------|------|
| **COUT-SIM-01** | Calcul reproductible | Mêmes entrées = mêmes sorties | ✅ Integration |
| **COUT-SIM-02** | Simulation obligatoire avant gel | RunSimulation avant Freeze | ✅ Unit |

#### 🚨 Invariant Central
| Code | Invariant | Description | Test |
|------|-----------|-------------|------|
| **COUT-01** | **Viabilité à 70%** | marginAt70 > 0 obligatoire pour FREEZE | ✅ Integration/E2E |

#### Décision
| Code | Invariant | Description | Test |
|------|-----------|-------------|------|
| **COUT-DEC-01** | Décision humaine obligatoire | decidedBy requis | ✅ Unit |
| **COUT-DEC-02** | Décision définitive | Append-only, jamais modifiée | ✅ Unit |

#### Intégration Budget
| Code | Invariant | Description | Test |
|------|-----------|-------------|------|
| **COUT-BUD-01** | Budget interdit sans VALIDATED + FROZEN | Budget ne voit que rm_cost_projects_budget_ready | ✅ Contract |

---

## 6️⃣ READ-MODELS — Architecture Définitive

### 📘 Principe
Les read-models exposent des faits validés, **jamais des intentions**.

### 6.1 rm_cost_projects
```sql
CREATE VIEW rm_cost_projects AS
SELECT 
  project_id,
  tenant_id,
  name,
  type,
  status,
  current_version,
  created_at,
  validated_at
FROM economic_projects;
```
**Source**: EconomicProject  
**Usage**: Liste & filtres UI

### 6.2 rm_cost_structure_current
```sql
CREATE VIEW rm_cost_structure_current AS
SELECT 
  csv.project_id,
  csv.version,
  csv.status,
  csv.created_at,
  csv.frozen_at,
  csv.frozen_by
FROM cost_structure_versions csv
WHERE csv.status = 'FROZEN';
```
**Source**: CostStructure  
**Règle**: `status = 'FROZEN'` uniquement

### 6.3 rm_cost_lines
```sql
CREATE VIEW rm_cost_lines AS
SELECT 
  project_id,
  version,
  category,
  label,
  amount,
  currency,
  allocation_rule
FROM cost_lines;
```
**Source**: CostLine  
**Usage**: Analyse des coûts

### 6.4 rm_cost_simulation_results
```sql
CREATE VIEW rm_cost_simulation_results AS
SELECT 
  project_id,
  version,
  unit_cost,
  total_cost,
  gross_margin,
  net_margin,
  margin_at_70,
  viable_at_70,
  simulated_at
FROM cost_structure_versions
WHERE simulated_at IS NOT NULL;
```
**Source**: CostStructure.simulation  
**Usage**: Lecture des marges

### 6.5 rm_cost_decisions
```sql
CREATE VIEW rm_cost_decisions AS
SELECT 
  project_id,
  version,
  decision,
  decided_by,
  decided_at,
  justification
FROM decision_records;
```
**Source**: DecisionRecord  
**Usage**: Audit & gouvernance

### 🔒 6.6 rm_cost_projects_budget_ready
```sql
CREATE VIEW rm_cost_projects_budget_ready AS
SELECT 
  ep.project_id,
  ep.tenant_id,
  ep.name,
  ep.type,
  csv.version,
  csv.unit_cost,
  csv.total_cost,
  csv.net_margin,
  csv.margin_at_70,
  csv.viable_at_70,
  ep.validated_at
FROM economic_projects ep
JOIN cost_structure_versions csv 
  ON ep.project_id = csv.project_id
WHERE ep.status = 'VALIDATED'
  AND csv.status = 'FROZEN'
  AND csv.viable_at_70 = true;
```
**Source**: Jointure stricte  
**Contrat exclusif Budget**  
**Conditions**:
- `project.status = 'VALIDATED'`
- `costStructure.status = 'FROZEN'`
- `simulation.viableAt70 = true`

### 6.7 rm_cost_structure_summary
```sql
CREATE VIEW rm_cost_structure_summary AS
SELECT 
  project_id,
  version,
  status,
  (SELECT COUNT(*) FROM cost_lines cl 
   WHERE cl.project_id = csv.project_id AND cl.version = csv.version) as line_count,
  (SELECT COALESCE(SUM(amount), 0) FROM cost_lines cl 
   WHERE cl.project_id = csv.project_id AND cl.version = csv.version) as total_cost_lines,
  unit_cost,
  net_margin,
  margin_at_70,
  viable_at_70
FROM cost_structure_versions csv;
```
**Source**: CostStructure + CostLine  
**Usage**: Dashboards & rapports

---

## 7️⃣ Flux de Données Canonique

```
┌─────────┐    ┌──────────┐    ┌───────┐    ┌──────────┐    ┌─────────────┐    ┌────────┐    ┌───────┐
│ Command │───▶│ Guardian │───▶│ Event │───▶│ Write DB │───▶│ Read-model  │───▶│ API GET│───▶│ Budget│
└─────────┘    └──────────┘    └───────┘    └──────────┘    │   SQL       │    └────────┘    └───────┘
                                                            └─────────────┘
```

**📌 Aucune flèche ne peut être inversée.**

---

## 8️⃣ Frontières Strictes

| Élément | Autorisé | Interdit |
|---------|----------|----------|
| **Calcul métier** | Guardian uniquement | SQL, Controller, Aggregate |
| **SQL** | Lecture + agrégation simple | JOIN complexe, calcul métier |
| **API GET** | Mapping 1:1 vues | Calcul, validation métier |
| **Budget** | Lecture uniquement (read-models) | Écriture directe |
| **UI** | Lecture & déclenchement Command | Calcul métier, validation |

---

## 9️⃣ Definition of Architecture DONE

L'architecture est **définitive** si :

- [x] **2 aggregates racines** implémentés
- [x] **1 aggregate audit** append-only
- [x] **Tous les invariants** codés et testés
- [x] **Read-models SQL** conformes
- [x] **Budget branché uniquement** sur `budget_ready`
- [x] **Aucun calcul hors Guardian**

---

## 🏁 Verdict Architectural

| Critère | Statut |
|---------|--------|
| ✅ Architecture claire | 3 aggregates bien définis |
| ✅ Décision ≠ exécution | EconomicProject vs CostStructure |
| ✅ Budget sécurisé | Uniquement via rm_cost_projects_budget_ready |
| ✅ Audit total | DecisionRecord append-only |
| ✅ Golden Module compliant | Suit toutes les règles Budget v1.0.1 |

---

## 🔐 Référence Implémentée

| Fichier | Description |
|---------|-------------|
| `domain/economic-project.aggregate.ts` | Aggregate racine décisionnelle |
| `domain/cost-structure.aggregate.ts` | Aggregate racine analytique |
| `domain/decision-record.aggregate.ts` | Aggregate audit |
| `domain/invariants.ts` | Codes invariants & helpers |
| `sql/migrations/001_create_tables_write_side.sql` | Tables write-side |
| `sql/migrations/002_create_read_models.sql` | 7 read-models |
| `api/cost-structure-read.controller.ts` | 7 endpoints GET |
| `tests/e2e/budget-integration.e2e.spec.ts` | Contract tests Budget |

---

**🏆 Cette architecture est prête à être implémentée sans zone grise.**

*Document officiel - v1.0.0 - 2026-01-31*
