# 🧱 AGRÉGATS & INVARIANTS DDD — MODULE IMMOBILISATION v1.0.0

Aligné contractuellement avec CONTRACT.md v1.0.0

---

## Principe directeur SPOFE

- **Un aggregate = une responsabilité métier claire**
- **Un invariant = une règle non négociable**
- **Aucun aggregate ne "devine" ou ne simule**
- **Tout calcul passe par Guardian**

---

## 1️⃣ AGGREGATE RACINE — Asset (Immobilisation)

### 🎯 Rôle

L'aggregate `Asset` représente un actif immobilisé réel, de son acquisition jusqu'à sa sortie.

C'est :
- la **source unique de vérité patrimoniale**
- le point d'ancrage de :
  - l'amortissement
  - la maintenance
  - l'affectation
  - la cession

### 🧩 Structure conceptuelle

```typescript
Asset {
  assetId: string
  tenantId: string

  acquisitionCost: Money
  acquisitionDate: Date
  usefulLife: number          // en mois
  depreciationMethod: 'LINEAR'
  residualValue: Money

  status: AssetStatus         // IN_SERVICE | DISPOSED | DECOMMISSIONED

  renewalDate?: Date
  replacementCost?: Money

  createdAt: Date
  createdBy: string
}
```

### 🔒 Invariants (Asset)

| Code | Invariant | Validation |
|------|-----------|------------|
| IMM-ASS-01 | `acquisitionCost > 0` | Construction |
| IMM-ASS-02 | `usefulLife > 0` | Construction |
| IMM-ASS-03 | `residualValue >= 0` | Construction |
| IMM-ASS-04 | `acquisitionDate <= now` | Construction |
| IMM-ASS-05 | `status = DISPOSED ⇒ asset immutable` | Commandes |
| IMM-ASS-06 | `status ≠ IN_SERVICE ⇒ no depreciation` | Guardian |
| IMM-ASS-07 | `residualValue <= acquisitionCost` | Construction |

📌 **Aucun amortissement après cession**

### Commandes autorisées

- `CreateAsset`
- `UpdateRenewalInfo`
- `DisposeAsset`
- `DecommissionAsset`

---

## 2️⃣ AGGREGATE — DepreciationSchedule

### 🎯 Rôle

Tracer l'amortissement réel et historisé d'une immobilisation.

Ce n'est **pas un calcul dynamique**, mais une suite d'événements validés.

### 🧩 Structure conceptuelle

```typescript
DepreciationSchedule {
  scheduleId: string
  assetId: string
  tenantId: string

  period: string              // YYYY-MM
  depreciationAmount: Money
  accumulatedDepreciation: Money
  netBookValue: Money

  calculatedAt: Date
  calculatedBy: string        // Guardian
}
```

### 🔒 Invariants (DepreciationSchedule)

| Code | Invariant | Validation |
|------|-----------|------------|
| IMM-DEP-01 | `depreciationAmount >= 0` | Construction |
| IMM-DEP-02 | `accumulatedDepreciation <= acquisitionCost` | Guardian |
| IMM-DEP-03 | `netBookValue = acquisitionCost - accumulatedDepreciation` | Guardian |
| IMM-DEP-04 | `netBookValue >= residualValue` | Guardian |
| IMM-DEP-05 | `period unique par asset` | Repository |

📌 **Append-only**  
📌 **Calculé uniquement par Guardian Immobilisation**

### Commandes autorisées

- `RecordDepreciation` (Guardian only)

---

## 3️⃣ AGGREGATE — AssetAllocation

### 🎯 Rôle

Ventiler une immobilisation sur les produits / services / projets,
afin de répartir les amortissements.

👉 C'est le **pont contractuel avec Cost-Structure**.

### 🧩 Structure conceptuelle

```typescript
AssetAllocation {
  allocationId: string
  assetId: string
  tenantId: string

  targetType: AllocationTargetType  // PRODUCT | SERVICE | PROJECT
  targetId: string
  percentage: Percentage            // 0–100

  effectiveFrom: Date
  effectiveTo?: Date

  createdAt: Date
  createdBy: string
}
```

### 🔒 Invariants (AssetAllocation)

| Code | Invariant | Validation |
|------|-----------|------------|
| IMM-ALL-01 | `0 < percentage <= 100` | Construction |
| IMM-ALL-02 | `Σ percentages = 100% (par période)` | Guardian |
| IMM-ALL-03 | `effectiveFrom <= effectiveTo` | Construction |
| IMM-ALL-04 | `no overlap for same asset + target` | Repository |
| IMM-ALL-05 | `allocation forbidden if asset DISPOSED` | Commandes |

📌 **Toute modification crée une nouvelle allocation**  
📌 **Historique conservé**

### Commandes autorisées

- `CreateAllocation`
- `EndAllocation`
- `ReallocateAsset`

---

## 4️⃣ AGGREGATE — MaintenanceRecord

### 🎯 Rôle

Tracer les coûts réels engagés sur une immobilisation :
- maintenance
- réparation
- entretien

👉 **Aucune logique prédictive**  
👉 **Aucune modification de l'amortissement**

### 🧩 Structure conceptuelle

```typescript
MaintenanceRecord {
  maintenanceId: string
  assetId: string
  tenantId: string

  type: MaintenanceType       // MAINTENANCE | REPAIR | SERVICE
  date: Date
  description: string
  cost: Money
  performedBy: string

  createdAt: Date
  createdBy: string
}
```

### 🔒 Invariants (MaintenanceRecord)

| Code | Invariant | Validation |
|------|-----------|------------|
| IMM-MNT-01 | `cost >= 0` | Construction |
| IMM-MNT-02 | `date <= now` | Construction |
| IMM-MNT-03 | `asset.status = IN_SERVICE` | Guardian |
| IMM-MNT-04 | `maintenance immutable after creation` | Repository |

📌 **Append-only**  
📌 **Sert au TCO, pas à l'amortissement**

### Commandes autorisées

- `RecordMaintenance`

---

## 5️⃣ AGGREGATE — AssetDisposal

### 🎯 Rôle

Formaliser la sortie définitive d'une immobilisation :
- cession
- déclassement

### 🧩 Structure conceptuelle

```typescript
AssetDisposal {
  disposalId: string
  assetId: string
  tenantId: string

  disposalDate: Date
  disposalType: DisposalType  // SALE | SCRAP
  disposalValue: Money

  netBookValue: Money
  gainOrLoss: Money

  createdAt: Date
  createdBy: string
}
```

### 🔒 Invariants (AssetDisposal)

| Code | Invariant | Validation |
|------|-----------|------------|
| IMM-DIS-01 | `disposalDate >= acquisitionDate` | Guardian |
| IMM-DIS-02 | `asset.status must be IN_SERVICE` | Guardian |
| IMM-DIS-03 | `gainOrLoss = disposalValue - netBookValue` | Guardian |
| IMM-DIS-04 | `disposal is final` | Repository |

📌 **Après disposal :**
- aucun amortissement
- aucune maintenance
- aucun changement d'allocation

### Commandes autorisées

- `DisposeAsset`
- `DecommissionAsset`

---

## 🧠 SYNTHÈSE — RESPONSABILITÉS PAR AGGREGATE

| Aggregate | Responsabilité |
|-----------|----------------|
| **Asset** | Existence patrimoniale |
| **DepreciationSchedule** | Amortissement historisé |
| **AssetAllocation** | Ventilation des coûts |
| **MaintenanceRecord** | Coûts réels de possession |
| **AssetDisposal** | Sortie définitive |

---

## 🛡️ INVARIANTS TRANSVERSES

### Sécurité & Isolation

| Code | Invariant | Niveau |
|------|-----------|--------|
| IMM-SEC-01 | Toute commande porte `tenantId` | Guardian |
| IMM-SEC-02 | Aucune lecture/écriture cross-tenant | Repository |
| IMM-SEC-03 | Audit trail complet | Events |

### Intégrité référentielle

| Code | Invariant | Niveau |
|------|-----------|--------|
| IMM-REF-01 | `DepreciationSchedule.assetId` existe | Repository |
| IMM-REF-02 | `AssetAllocation.assetId` existe | Repository |
| IMM-REF-03 | `MaintenanceRecord.assetId` existe | Repository |
| IMM-REF-04 | `AssetDisposal.assetId` existe | Repository |

---

## 🟩 HORS PÉRIMÈTRE v1.0.0

Volontairement absent :

- ❌ Planification maintenance
- ❌ Simulation financière
- ❌ Analytics
- ❌ Inventaire mobile
- ❌ Amortissement dégressif

👉 Tout cela relève de versions futures, sans impacter ces aggregates.

---

## 📋 MAPPING EVENTS

| Aggregate | Event |
|-----------|-------|
| Asset | `AssetCreated`, `AssetRenewalUpdated`, `AssetDisposed`, `AssetDecommissioned` |
| DepreciationSchedule | `DepreciationRecorded` |
| AssetAllocation | `AllocationCreated`, `AllocationEnded` |
| MaintenanceRecord | `MaintenanceRecorded` |
| AssetDisposal | `DisposalRecorded` |

---

## 🔗 CONTRATS INTER-MODULES

### Immobilisation → Cost-Structure

Données exposées via read-models :
- Dotations d'amortissement par période
- Ventilation par produit/service/projet

### Immobilisation → Budget

Données exposées via read-models :
- Dates de renouvellement
- Coûts estimatifs de remplacement
- Coûts de maintenance agrégés

---

## ✅ Statut du document

- **Version** : v1.0.0
- **Alignement** : CONTRACT.md v1.0.0
- **Guardian** : À implémenter
- **Tests** : À définir dans E2E_TESTS.md
