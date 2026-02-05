# 🧱 ARCHITECTURE EXACTE — MODULE COST-STRUCTURE (COUTFLEX)
Version : v1.0.0

Type : Module décisionnel (non transactionnel)  
Position : Amont du module Budget  
Golden Reference : Budget v1.0.1  

---

## 1️⃣ Vue d’ensemble (responsabilités claires)
```
┌────────────────────────┐
│ EconomicProject        │  ← décision métier (GO / NO GO)
│  (Aggregate Root)      │
└──────────┬─────────────┘
           │ owns
┌──────────▼─────────────┐
│ CostStructure          │  ← modèle chiffré versionné
│  (Aggregate Root)      │
└──────────┬─────────────┘
           │ produces
┌──────────▼─────────────┐
│ DecisionRecord         │  ← audit append-only
│  (Audit Aggregate)     │
└────────────────────────┘
           │
           ▼
   Read-models SQL
           │
           ▼
        Budget
```

👉 Deux aggregates métier, un aggregate audit, zéro mélange de responsabilités.

---

## 2️⃣ AGGREGATE 1 — EconomicProject (Racine décisionnelle)
**🎯 Responsabilité**  
Porter la décision économique finale d'un produit ou service.

**Identité**  
- EconomicProjectId  
- TenantId  

**État interne**  
```typescript
EconomicProject {
  id: string
  tenantId: string
  name: string
  type: PRODUCT | SERVICE
  status: DRAFT | SIMULATED | VALIDATED | REJECTED
  currentVersion: number
  createdBy: string
  validatedBy?: string
  validatedAt?: Date
}
```

**Commandes acceptées**  
- CreateEconomicProject  
- AttachCostStructure  
- ValidateProject  
- RejectProject  

**Événements émis**  
- EconomicProjectCreated  
- ProjectValidated  
- ProjectRejected  

**Règle clé**  
Aucune décision sans CostStructure FROZEN valide

---

## 3️⃣ AGGREGATE 2 — CostStructure (Racine analytique)
**🎯 Responsabilité**  
Définir, simuler et figer une structure de coûts versionnée.

**Identité**  
- CostStructureId  
- (projectId + version)  

**État interne**  
```typescript
CostStructure {
  projectId: string
  tenantId: string
  version: number
  status: DRAFT | SIMULATED | FROZEN

  costLines: CostLine[]
  assumptions: Assumptions

  simulation?: {
    unitCost: number
    totalCost: number
    grossMargin: number
    netMargin: number
    marginAt70: number
    viableAt70: boolean
  }

  createdBy: string
  frozenAt?: Date
}
```

**Commandes acceptées**  
- CreateCostStructure  
- AddCostLine  
- UpdateAssumptions  
- RunSimulation  
- FreezeCostStructure  

**Événements émis**  
- CostStructureCreated  
- CostLineAdded  
- AssumptionsUpdated  
- CostStructureSimulated  
- CostStructureFrozen  

**Règle clé**  
Une CostStructure FROZEN est strictement immuable

---

## 4️⃣ AGGREGATE 3 — DecisionRecord (Audit pur)
**🎯 Responsabilité**  
Tracer toute décision humaine irréversible.

**Nature**  
- Append-only  
- Non modifiable  
- Non décisionnel  

**Structure**  
```typescript
DecisionRecord {
  id: string
  tenantId: string
  projectId: string
  version: number
  decision: VALIDATE | REJECT
  decidedBy: string
  decidedAt: Date
  justification?: string
}
```

📌 Aucune logique métier ici. Audit uniquement.

---

## 5️⃣ INVARIANTS — CLASSIFICATION EXACTE

### 🔴 Invariants BLOQUANTS (Guardian)
#### Sécurité & isolation
- **COUT-SEC-01** : isolation tenant stricte  

#### Projet
- **COUT-PROJ-01** : unicité (tenant + name)  
- **COUT-PROJ-02** : cycle de vie strict  
- **COUT-PROJ-03** : immutabilité après décision  

#### Structure de coûts
- **COUT-CS-01** : versioning strict  
- **COUT-CS-02** : coûts strictement positifs  
- **COUT-CS-03** : allocations non circulaires  
- **COUT-CS-04** : hypothèses complètes  

#### Simulation
- **COUT-SIM-01** : calcul reproductible  
- **COUT-SIM-02** : simulation obligatoire avant gel  

#### 🚨 Invariant central
- **COUT-01** : viabilité à 70 % (bloquant absolu)  

#### Décision
- **COUT-DEC-01** : décision humaine obligatoire  
- **COUT-DEC-02** : décision définitive  

#### Intégration Budget
- **COUT-BUD-01** : Budget interdit sans VALIDATED + FROZEN  

---

## 6️⃣ READ-MODELS — ARCHITECTURE DÉFINITIVE
**📘 Principe**  
Les read-models exposent des faits validés, jamais des intentions.

### 6.1 rm_cost_projects
- **Source** : EconomicProject  
- **Usage** : Liste & filtres UI  

### 6.2 rm_cost_structure_current
- **Source** : CostStructure  
- **Règle** : status = FROZEN  

### 6.3 rm_cost_lines
- **Source** : CostLine  
- **Usage** : Analyse des coûts  

### 6.4 rm_cost_simulation_results
- **Source** : CostStructure.simulation  
- **Usage** : Lecture des marges  

### 6.5 rm_cost_decisions
- **Source** : DecisionRecord  
- **Usage** : Audit & gouvernance  

### 🔒 6.6 rm_cost_projects_budget_ready
- **Source** : jointure stricte  
- **Contrat exclusif Budget**  

**Conditions** :  
- project.status = VALIDATED  
- costStructure.status = FROZEN  
- simulation.viableAt70 = true  

---

## 7️⃣ FLUX DE DONNÉES CANONIQUE
```
Command
  → Guardian
    → Event
      → Write DB
        → Read-model SQL
          → API GET
            → Budget
```

📌 Aucune flèche ne peut être inversée.

---

## 8️⃣ FRONTIÈRES STRICTES
| Élément | Autorisé |
|---------|----------|
| Calcul métier | Guardian uniquement |
| SQL | Lecture + agrégation |
| API GET | Mapping 1:1 vues |
| Budget | Lecture uniquement |
| UI | Lecture & déclenchement Command |

---

## 9️⃣ Definition of Architecture DONE
L'architecture est définitive si :  
- 2 aggregates racines implémentés  
- 1 aggregate audit append-only  
- Tous invariants codés et testés  
- Read-models SQL conformes  
- Budget branché uniquement sur budget_ready  
- Aucun calcul hors Guardian  

---

## 🏁 VERDICT ARCHITECTURAL
✔ Architecture claire  
✔ Décision ≠ exécution  
✔ Budget sécurisé  
✔ Audit total  
✔ Golden Module compliant  

👉 Cette architecture est prête à être implémentée sans zone grise.
