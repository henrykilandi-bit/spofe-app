# 📘 COMMANDS & EVENTS — MODULE IMMOBILISATION v1.0.0

## SPOFE Platform

---

## 1. Principes contractuels

- **Chaque Command** représente une **intention utilisateur**
- **Chaque Event** représente un **fait métier validé**
- ❌ **Aucun calcul métier hors Guardian**
- ❌ **Aucun Event sans validation Guardian**
- ✅ **Mapping 1-à-1 Command → Guardian → Event(s)**

---

## 2. Commands (DTO Contractuels)

### 2.1 CreateAssetCommand

**Intention:** Créer une immobilisation patrimoniale.

```typescript
export interface CreateAssetCommand {
  tenantId: string;
  assetId: string;

  acquisitionCost: number;
  currency: string;
  acquisitionDate: string;     // ISO 8601
  usefulLife: number;          // en mois
  depreciationMethod: 'LINEAR';
  residualValue: number;

  renewalDate?: string;        // ISO 8601
  replacementCost?: number;

  actorId: string;
}
```

**Guardian mapping:**
- Valide toutes les règles de création (IMM-ASS-01 à IMM-ASS-07)
- Initialise l'Asset
- Émet `AssetCreatedEvent`

---

### 2.2 UpdateRenewalInfoCommand

**Intention:** Mettre à jour la date et le coût de renouvellement.

```typescript
export interface UpdateRenewalInfoCommand {
  tenantId: string;
  assetId: string;

  renewalDate: string;         // ISO 8601
  replacementCost?: number;
  currency?: string;

  actorId: string;
}
```

**Guardian mapping:**
- Vérifie que l'actif est `IN_SERVICE` (IMM-ASS-05)
- Valide renewalDate > acquisitionDate (IMM-REN-01)
- Aucune incidence sur l'amortissement
- Émet `RenewalInfoUpdatedEvent`

---

### 2.3 AllocateAssetCommand

**Intention:** Ventiler une immobilisation sur produits / projets.

```typescript
export interface AllocateAssetCommand {
  tenantId: string;
  assetId: string;

  allocations: Array<{
    allocationId: string;
    targetType: 'PRODUCT' | 'SERVICE' | 'PROJECT';
    targetId: string;
    percentage: number;
  }>;

  effectiveFrom: string;       // ISO 8601
  actorId: string;
}
```

**Guardian mapping:**
- Vérifie actif `IN_SERVICE` (IMM-ALL-05)
- Vérifie somme = 100% (IMM-ALL-02)
- Vérifie absence de chevauchement (IMM-ALL-04)
- Émet `AssetAllocatedEvent`

---

### 2.4 RecordDepreciationCommand

**Intention:** Enregistrer une dotation d'amortissement.

```typescript
export interface RecordDepreciationCommand {
  tenantId: string;
  assetId: string;
  scheduleId: string;

  period: string;              // YYYY-MM

  actorId: string;
}
```

**Guardian mapping:**
- Vérifie actif `IN_SERVICE` (IMM-ASS-06)
- Vérifie période non déjà amortie (IMM-DEP-05)
- Calcule la dotation linéaire
- Vérifie VNC ≥ valeur résiduelle (IMM-DEP-04)
- Émet `DepreciationRecordedEvent`

---

### 2.5 RecordMaintenanceCommand

**Intention:** Tracer une dépense réelle de maintenance / réparation / entretien.

```typescript
export interface RecordMaintenanceCommand {
  tenantId: string;
  assetId: string;
  maintenanceId: string;

  type: 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
  date: string;                // ISO 8601
  description: string;
  cost: number;
  currency: string;
  performedBy: string;

  actorId: string;
}
```

**Guardian mapping:**
- Vérifie actif `IN_SERVICE` (IMM-MNT-03)
- Vérifie cost ≥ 0 (IMM-MNT-01)
- Vérifie date ≤ now (IMM-MNT-02)
- Aucune modification de l'actif
- Émet `MaintenanceRecordedEvent`

---

### 2.6 DisposeAssetCommand

**Intention:** Céder définitivement une immobilisation.

```typescript
export interface DisposeAssetCommand {
  tenantId: string;
  assetId: string;
  disposalId: string;

  disposalDate: string;        // ISO 8601
  disposalType: 'SALE';
  disposalValue: number;
  currency: string;

  actorId: string;
}
```

**Guardian mapping:**
- Vérifie actif `IN_SERVICE` (IMM-DIS-02)
- Vérifie disposalDate ≥ acquisitionDate (IMM-DIS-01)
- Calcule plus / moins-value (IMM-DIS-03)
- Rend l'actif immutable
- Émet `AssetDisposedEvent`

---

### 2.7 DecommissionAssetCommand

**Intention:** Déclasser définitivement une immobilisation (mise au rebut).

```typescript
export interface DecommissionAssetCommand {
  tenantId: string;
  assetId: string;
  disposalId: string;

  decommissionDate: string;    // ISO 8601
  reason: string;

  actorId: string;
}
```

**Guardian mapping:**
- Vérifie actif `IN_SERVICE` (IMM-DIS-02)
- Vérifie date ≥ acquisitionDate (IMM-DIS-01)
- Calcule la moins-value (VNC perdue)
- Rend l'actif immutable
- Émet `AssetDecommissionedEvent`

---

## 3. Events (Faits Métier Immutables)

### 3.1 AssetCreatedEvent

```typescript
export interface AssetCreatedEvent {
  eventId: string;
  type: 'AssetCreated';

  assetId: string;
  tenantId: string;

  acquisitionCost: number;
  currency: string;
  acquisitionDate: string;     // ISO 8601
  usefulLifeMonths: number;
  depreciationMethod: 'LINEAR';
  residualValue: number;

  renewalDate?: string;
  replacementCost?: number;

  createdBy: string;
  occurredAt: string;          // ISO 8601
}
```

---

### 3.2 RenewalInfoUpdatedEvent

```typescript
export interface RenewalInfoUpdatedEvent {
  eventId: string;
  type: 'RenewalInfoUpdated';

  assetId: string;
  tenantId: string;

  renewalDate: string;         // ISO 8601
  replacementCost?: number;
  currency?: string;

  updatedBy: string;
  occurredAt: string;          // ISO 8601
}
```

---

### 3.3 AssetAllocatedEvent

```typescript
export interface AssetAllocatedEvent {
  eventId: string;
  type: 'AssetAllocated';

  assetId: string;
  tenantId: string;

  allocations: Array<{
    allocationId: string;
    targetType: 'PRODUCT' | 'SERVICE' | 'PROJECT';
    targetId: string;
    percentage: number;
  }>;

  effectiveFrom: string;       // ISO 8601

  allocatedBy: string;
  occurredAt: string;          // ISO 8601
}
```

---

### 3.4 DepreciationRecordedEvent

```typescript
export interface DepreciationRecordedEvent {
  eventId: string;
  type: 'DepreciationRecorded';

  assetId: string;
  tenantId: string;
  scheduleId: string;

  period: string;              // YYYY-MM
  depreciationAmount: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  currency: string;

  calculatedBy: string;
  occurredAt: string;          // ISO 8601
}
```

---

### 3.5 MaintenanceRecordedEvent

```typescript
export interface MaintenanceRecordedEvent {
  eventId: string;
  type: 'MaintenanceRecorded';

  maintenanceId: string;
  assetId: string;
  tenantId: string;

  type: 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
  date: string;                // ISO 8601
  description: string;
  cost: number;
  currency: string;
  performedBy: string;

  recordedBy: string;
  occurredAt: string;          // ISO 8601
}
```

---

### 3.6 AssetDisposedEvent

```typescript
export interface AssetDisposedEvent {
  eventId: string;
  type: 'AssetDisposed';

  assetId: string;
  tenantId: string;

  disposalDate: string;        // ISO 8601
  disposalType: 'SALE';
  disposalValue: number;
  currency: string;

  netBookValue: number;
  gainOrLoss: number;

  disposedBy: string;
  occurredAt: string;          // ISO 8601
}
```

---

### 3.7 AssetDecommissionedEvent

```typescript
export interface AssetDecommissionedEvent {
  eventId: string;
  type: 'AssetDecommissioned';

  assetId: string;
  tenantId: string;

  decommissionDate: string;    // ISO 8601
  reason: string;

  netBookValue: number;
  currency: string;

  decommissionedBy: string;
  occurredAt: string;          // ISO 8601
}
```

---

## 4. Mapping Command → Event (Synthèse)

| Command | Event(s) | Guardian Validation |
|---------|----------|---------------------|
| `CreateAsset` | `AssetCreated` | IMM-ASS-01 à IMM-ASS-07 |
| `UpdateRenewalInfo` | `RenewalInfoUpdated` | IMM-ASS-05, IMM-REN-01/02 |
| `AllocateAsset` | `AssetAllocated` | IMM-ALL-01 à IMM-ALL-05 |
| `RecordDepreciation` | `DepreciationRecorded` | IMM-ASS-06, IMM-DEP-01 à 05 |
| `RecordMaintenance` | `MaintenanceRecorded` | IMM-MNT-01 à 03 |
| `DisposeAsset` | `AssetDisposed` | IMM-DIS-01 à 03 |
| `DecommissionAsset` | `AssetDecommissioned` | IMM-DIS-01 à 03 |

---

## 5. Conventions de nommage

### Commands
- Préfixe: verbe à l'infinitif (`Create`, `Update`, `Record`, `Dispose`)
- Suffixe: `Command`
- Exemple: `CreateAssetCommand`

### Events
- Préfixe: nom de l'entité (`Asset`, `Depreciation`, `Maintenance`)
- Suffixe: participe passé + `Event`
- Exemple: `AssetCreatedEvent`

### Identifiants
- Format: `{entity}-{uuid}` ou `{entity}-{timestamp}-{random}`
- Exemples: `asset-001`, `evt-1706745600000-abc123`

---

## 6. Sérialisation JSON

### Dates
- Format: ISO 8601 (`2026-02-01T00:00:00.000Z`)
- Timezone: UTC

### Montants
- Type: `number` (pas de string)
- Précision: 2 décimales pour affichage
- Stockage: valeur exacte

### Currency
- Format: ISO 4217 (`XAF`, `EUR`, `USD`)
- Par défaut: `XAF`

---

## ✅ Statut du document

- **Version** : v1.0.0
- **Statut** : Contractuel
- **Toute modification** → version majeure
- **Conformité requise** : CONTRACT.md, DDD.md, GUARDIAN.md
