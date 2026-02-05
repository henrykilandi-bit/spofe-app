# DOCUMENTATION COMPLÈTE — MODULE COST-STRUCTURE (COUTFLEX)
**Version:** v2.1.0 | **Statut:** FROZEN | **Module Décisionnel SPOFE**

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Contrats fonctionnels](#3-contrats-fonctionnels)
4. [Guardian et règles métier](#4-guardian-et-règles-métier)
5. [Commands et Events](#5-commands-et-events)
6. [API Read-Only](#6-api-read-only)
7. [Read Models](#7-read-models)
8. [Structure du code](#8-structure-du-code)
9. [Pour créer une version supérieure](#9-pour-créer-une-version-supérieure)

---

## 1. VUE D'ENSEMBLE

### Objectif
Module **décisionnel** de gestion des structures de coûts économiques avec simulation, test 70%, et validation Guardian.

### Positionnement
**Amont du module Budget** — COUTFLEX est une autorité préalable, Budget est un exécutant conditionnel.

> ❗ Budget ne prend aucune décision de rentabilité.  
> ❗ Budget ne valide aucun prix.  
> ❗ Budget n'engage aucune ressource sans autorisation explicite de COUTFLEX.

### Responsabilités
- Porter la décision économique finale (GO / NO GO)
- Définir, simuler et figer des structures de coûts versionnées
- Calculer les marges (net margin, margin at 70%)
- Tracer toute décision humaine irréversible
- Alimenter le module Budget via vue contractuelle exclusive

### Périmètre (In Scope)
- Projets économiques (PRODUIT / SERVICE)
- Structures de coûts versionnées (DRAFT → SIMULATED → FROZEN)
- Lignes de coût (VARIABLE, FIXED, INDIRECT)
- Hypothèses économiques (prix cible, volume attendu, capacité max)
- Simulation avec test 70% obligatoire (COUT-01)
- Décision VALIDATED / REJECTED
- Audit append-only des décisions

### Hors périmètre (Out of Scope)
- Exécution budgétaire (dans Budget)
- Comptabilisation des coûts réels (dans Comptabilité)
- Analyse prédictive avancée
- Scénarios multi-versions comparés

---

## 2. ARCHITECTURE

### Principes fondamentaux
- **CQRS strict** — Séparation write/read
- **Guardian central** — 100% logique métier dans le Guardian
- **Architecture contractuelle** — Code = implémentation du contrat
- **Multi-tenant** — Isolation stricte
- **Module décisionnel** — Décision ≠ exécution

### Aggregates (3 racines)

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
```

### Flux d'exécution
```
Command → Guardian → Events → Write DB → Read Models SQL → API GET → Budget
```

### Structure canonique
```
cost-structure/
├── api/                    # Controllers GET uniquement
├── application/            # Commands, Handlers, Events
├── domain/                 # Aggregates, Guardian, Invariants
│   ├── economic-project.aggregate.ts
│   ├── cost-structure.aggregate.ts
│   ├── decision-record.aggregate.ts
│   ├── commands.ts
│   ├── events.ts
│   └── value-objects.ts
├── guardian/               # Validation métier (8 invariants COUT-*)
├── infrastructure/         # Repositories (write/read)
├── sql/                    # Migrations, vues SQL
└── tests/                  # Unit, integration, e2e, contract
```

---

## 3. CONTRATS FONCTIONNELS

### Documents contractuels
| Document | Description |
|----------|-------------|
| SCOPE.md | Périmètre contractuel IN/OUT |
| CONTRACT.md | Contrat COUTFLEX → Budget (unidirectionnel) |
| ARCHITECTURE.md | Architecture des 3 aggregates |
| COST_STRUCTURE_READMODELS.md | Vues SQL contractuelles |

### Contrat avec Budget
**Vue contractuelle unique:** `rm_cost_projects_budget_ready`

**Conditions d'éligibilité budgétaire:**
```
EconomicProject.status     = VALIDATED
CostStructure.status       = FROZEN
Simulation.viableAt70      = true
Tenant isolation respected = true
```

**Payload fourni à Budget:**
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

**Invariant contractuel BUD-COUT-01:**
> Aucune Command Budget ne peut être validée sans une validation COUTFLEX préalable.

---

## 4. GUARDIAN ET RÈGLES MÉTIER

### Commands gérées (8 commands)
| Command | Description |
|---------|-------------|
| CreateEconomicProject | Créer un projet économique |
| CreateCostStructure | Créer une structure de coûts (version N+1) |
| AddCostLine | Ajouter une ligne de coût |
| UpdateAssumptions | Mettre à jour les hypothèses |
| RunSimulation | Lancer la simulation |
| FreezeCostStructure | Geler la structure (test 70% obligatoire) |
| ValidateProject | Valider le projet (GO) |
| RejectProject | Rejeter le projet (NO GO) |

### Invariants métier (8 invariants)

#### Sécurité & Isolation
| Code | Invariant | Description |
|------|-----------|-------------|
| **COUT-SEC-01** | Isolation tenant stricte | Données jamais mélangées entre tenants |

#### Projet
| Code | Invariant | Description |
|------|-----------|-------------|
| **COUT-PROJ-01** | Unicité | (tenant + name) unique |
| **COUT-PROJ-02** | Cycle de vie strict | DRAFT → SIMULATED → VALIDATED/REJECTED |
| **COUT-PROJ-03** | Immutabilité après décision | Aucune modif si VALIDATED/REJECTED |

#### Structure de Coûts
| Code | Invariant | Description |
|------|-----------|-------------|
| **COUT-CS-01** | Versioning strict | Version N+1 si N FROZEN |
| **COUT-CS-02** | Coûts strictement positifs | amount > 0 |
| **COUT-CS-03** | Version FROZEN immuable | Pas de modification si FROZEN |
| **COUT-CS-04** | Hypothèses complètes | Tous les champs requis avant simulation |

#### Simulation
| Code | Invariant | Description |
|------|-----------|-------------|
| **COUT-SIM-01** | Calcul reproductible | Mêmes entrées = mêmes sorties |
| **COUT-SIM-02** | Simulation obligatoire avant gel | RunSimulation avant Freeze |

#### 🚨 Invariant Central (Test 70%)
| Code | Invariant | Description |
|------|-----------|-------------|
| **COUT-01** | **Viabilité à 70%** | marginAt70 > 0 obligatoire pour FREEZE |

**Calcul du test 70%:**
```
marginAt70 = (prix_vente * 0.7 - cout_total_70) / (prix_vente * 0.7) * 100
```

#### Décision
| Code | Invariant | Description |
|------|-----------|-------------|
| **COUT-DEC-01** | Décision humaine obligatoire | decidedBy requis |
| **COUT-DEC-02** | Décision définitive | Append-only, jamais modifiée |

#### Intégration Budget
| Code | Invariant | Description |
|------|-----------|-------------|
| **COUT-BUD-01** | Budget interdit sans VALIDATED + FROZEN | Budget ne voit que rm_cost_projects_budget_ready |

---

## 5. COMMANDS ET EVENTS

### Mapping Command → Guardian → Event
| Command | Guardian | Event |
|---------|----------|-------|
| CreateEconomicProject | COUT-PROJ-01, COUT-SEC-01 | EconomicProjectCreated |
| CreateCostStructure | COUT-CS-01, COUT-PROJ-02 | CostStructureCreated |
| AddCostLine | COUT-CS-02, COUT-CS-03 | CostLineAdded |
| UpdateAssumptions | COUT-CS-03, COUT-CS-04 | AssumptionsUpdated |
| RunSimulation | COUT-CS-04, COUT-SIM-01 | CostStructureSimulated |
| FreezeCostStructure | **COUT-01**, COUT-CS-04 | CostStructureFrozen |
| ValidateProject | COUT-PROJ-02, COUT-CS-01, COUT-01 | ProjectValidated ⚠️ |
| RejectProject | COUT-PROJ-02, COUT-DEC-01 | ProjectRejected |

### Events émis (8 Events)
- EconomicProjectCreated
- CostStructureCreated
- CostLineAdded
- AssumptionsUpdated
- CostStructureSimulated
- CostStructureFrozen
- **ProjectValidated** ⚠️ (écouté par Budget)
- ProjectRejected

---

## 6. API READ-ONLY

### Principes
- GET uniquement
- Read-models SQL exclusivement
- Multi-tenant obligatoire (X-Tenant-Id)
- Pagination obligatoire

### Endpoints principaux
| Endpoint | Read Model | Description |
|----------|------------|-------------|
| GET /api/cost-structure/projects | rm_cost_projects | Liste projets économiques |
| GET /api/cost-structure/projects/{id} | multiple views | Détail complet projet |
| GET /api/cost-structure/structures/current | rm_cost_structure_current | Structure gelée active |
| GET /api/cost-structure/lines | rm_cost_lines | Lignes de coût |
| GET /api/cost-structure/simulations | rm_cost_simulation_results | Résultats simulation |
| GET /api/cost-structure/decisions | rm_cost_decisions | Historique décisions |
| GET /api/cost-structure/budget-ready | rm_cost_projects_budget_ready | Vue contractuelle Budget |

### Headers obligatoires
```http
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

---

## 7. READ MODELS

### Vue SQL — Projets économiques
```sql
CREATE VIEW rm_cost_projects AS
SELECT
  p.tenant_id,
  p.id AS project_id,
  p.name,
  p.type,
  p.status,
  p.current_version,
  p.created_at,
  p.validated_at
FROM economic_projects p;
```

### Vue SQL — Structure de coûts active
```sql
CREATE VIEW rm_cost_structure_current AS
SELECT
  cs.tenant_id,
  cs.project_id,
  cs.version,
  cs.status,
  cs.created_at,
  cs.frozen_at
FROM cost_structures cs
WHERE cs.status = 'FROZEN';
```

### Vue SQL — Résultats de simulation
```sql
CREATE VIEW rm_cost_simulation_results AS
SELECT
  s.tenant_id,
  s.project_id,
  s.version,
  s.unit_cost,
  s.total_cost,
  s.gross_margin,
  s.net_margin,
  s.margin_at_70,
  s.viable_at_70,
  s.simulated_at
FROM cost_simulations s;
```

### 🔒 Vue contractuelle Budget
```sql
CREATE VIEW rm_cost_projects_budget_ready AS
SELECT
  p.tenant_id,
  p.project_id,
  p.name,
  r.version,
  r.unit_cost,
  r.total_cost,
  r.net_margin,
  r.margin_at_70
FROM rm_cost_projects p
JOIN rm_cost_structure_current cs
  ON cs.project_id = p.project_id
JOIN rm_cost_simulation_results r
  ON r.project_id = cs.project_id
 AND r.version = cs.version
WHERE p.status = 'VALIDATED'
  AND r.viable_at_70 = true;
```

### Liste des Read Models (7 vues)
| Vue | Usage |
|-----|-------|
| rm_cost_projects | Liste projets, filtres UI |
| rm_cost_structure_current | Structure gelée par projet |
| rm_cost_lines | Détail lignes de coût |
| rm_cost_simulation_results | Marges et viabilité |
| rm_cost_decisions | Audit décisions |
| rm_cost_projects_budget_ready | **Contrat exclusif Budget** |
| rm_cost_structure_summary | Dashboards & rapports |

---

## 8. STRUCTURE DU CODE

### Couche API (`api/`)
- Controllers GET uniquement
- Mapping DTO → Read Models
- Sécurité (auth, tenant scoping)
- **Interdit:** logique métier, validation, écriture

### Couche Application (`application/`)
- Commands DTOs
- Handlers (orchestration)
- Events
- Appel Guardian obligatoire
- **Interdit:** règles métier, calculs

### Couche Domaine (`domain/`)
- 3 Aggregates (EconomicProject, CostStructure, DecisionRecord)
- Guardian (100% logique métier)
- 8 invariants COUT-*
- Value Objects (Money, CostLine, EconomicAssumptions, SimulationMetrics)
- Domain Events

### Couche Infrastructure (`infrastructure/`)
- Repositories write/read
- Persistance événements
- Accès base de données
- **Interdit:** règles métier

### Couche Guardian (`guardian/`)
- CostStructureGuardian (classe principale)
- Validation des 8 Commands
- Émission des GuardianError avec codes invariants
- Tests table-driven (25 tests)

---

## 9. POUR CRÉER UNE VERSION SUPÉRIEURE

### Étape 1: Créer la nouvelle version
```bash
mkdir -p cascade/modules/cost-structure-v3
cp -r cascade/modules/cost-structure/* cascade/modules/cost-structure-v3/
```

### Étape 2: Mettre à jour les contrats
Modifier dans le dossier:
1. **SCOPE.md** — Nouveau périmètre (ajout de fonctionnalités?)
2. **CONTRACT.md** — Modification du contrat avec Budget?
3. **ARCHITECTURE.md** — Si nouveaux aggregates ou modifications structurales
4. **COST_STRUCTURE_READMODELS.md** — Nouvelles vues SQL

### Étape 3: Implémenter les évolutions v3+

#### Scénario A: Nouvelles métriques de simulation
```typescript
// domain/value-objects.ts
interface SimulationMetrics {
  unitCost: number;
  totalCost: number;
  grossMargin: number;
  netMargin: number;
  marginAt70: number;
  // NEW v3
  marginAt50?: number;
  marginAt90?: number;
  breakEvenVolume?: number;
}
```

#### Scénario B: Nouvelles catégories de coûts
```typescript
// domain/value-objects.ts
type CostCategory = 
  | 'VARIABLE' 
  | 'FIXED' 
  | 'INDIRECT'
  | 'SEMI_VARIABLE'  // NEW v3
  | 'STEP_FIXED';    // NEW v3
```

#### Scénario C: Workflow de validation multi-niveaux
```typescript
// domain/commands.ts
interface SubmitForApprovalCommand {  // NEW v3
  type: 'SubmitForApproval';
  projectId: string;
  approvalLevel: 'MANAGER' | 'DIRECTOR' | 'CFO';
}
```

### Étape 4: Tests obligatoires
- Guardian: **100% couverture**
- Global: **≥ 80% couverture**

### Étape 5: BUILD_PROOF
```bash
node spofe/tools/build-proof/generate-build-proof.ts
node spofe/tools/build-proof/sign-build-proof.ts
node spofe/tools/validate-module/spofe-validate-module.ts
```

### ⚠️ RÈGLES CRITIQUES POUR V3+

| Aspect | Règle |
|--------|-------|
| Décision | COUTFLEX reste autorité préalable pour Budget |
| Test 70% | COUT-01 reste invariant bloquant obligatoire |
| Budget | Budget ne prend toujours aucune décision de rentabilité |
| API | GET uniquement (pas de mutation) |
| Guardian | 100% logique métier centralisée |

### 📋 Checklist création v3+

- [ ] Dossier `cost-structure-v3/`
- [ ] 4+ documents contractuels mis à jour
- [ ] 3 aggregates respectés (EconomicProject, CostStructure, DecisionRecord)
- [ ] 8+ invariants COUT-* codés et testés
- [ ] COUT-01 (test 70%) maintenu ou versionné
- [ ] Architecture DDD/CQRS respectée
- [ ] Guardian implémenté (100% logique métier)
- [ ] API GET uniquement
- [ ] Read Models en vues SQL
- [ ] Tests ≥ 80% (Guardian 100%)
- [ ] BUILD_PROOF.md + .sig valides

---

## 📚 RÉFÉRENCES

| Document | Chemin |
|----------|--------|
| Ce document | `cascade/modules/cost-structure/DOCUMENTATION_COMPLETE.md` |
| Template SPOFE | `spofe/governance/TEMPLATE_MODULE_SPOFE.md` |
| Guide gouvernance | `spofe/governance/GUIDE_GOUVERNANCE_SPOFE.md` |
| Règles conduite | `spofe/governance/REGLES_CONDUITE_SPOFE.md` |

---

**Module Décisionnel FROZEN — v2.1.0**
**SPOFE Certified** 🔒💰
