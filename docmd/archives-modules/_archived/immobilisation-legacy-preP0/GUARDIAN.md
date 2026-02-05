# 🛡️ GUARDIAN — MODULE IMMOBILISATION v1.0.0

## SPOFE Platform

---

## 1. Principe SPOFE (rappel fondamental)

- ❌ **Aucun invariant complexe dans les aggregates**
- ❌ **Aucun calcul métier dans les services applicatifs**
- ✅ **Tout passe par le Guardian**
- ✅ **Le Guardian est déterministe, pur, testable**

---

## 2. Rôle du Guardian Immobilisation

Le Guardian Immobilisation est responsable de :

| Responsabilité | Description |
|----------------|-------------|
| **Valider les Commands** | Vérifie chaque commande avant exécution |
| **Vérifier les invariants** | Applique les règles métier transverses |
| **Calculer les amortissements** | Seule autorité de calcul des dotations |
| **Produire des verdicts** | Events validés ou violations explicites |
| **Refuser les mutations invalides** | Bloque toute opération illégale |

📌 **Le Guardian ne persiste rien**  
📌 **Il ne connaît pas la base de données**  
📌 **Il ne parle qu'en faits métier**

---

## 3. Commands gérées par le Guardian

### Liste contractuelle v1.0.0

| Command | Intention |
|---------|-----------|
| `CreateAsset` | Créer une immobilisation |
| `UpdateRenewalInfo` | Modifier date/coût de renouvellement |
| `CreateAllocation` | Affecter à un produit/projet |
| `EndAllocation` | Terminer une allocation |
| `ReallocateAsset` | Réallouer complètement un asset |
| `RecordDepreciation` | Enregistrer une dotation |
| `CalculateDepreciations` | Batch de calcul (Guardian only) |
| `RecordMaintenance` | Tracer une maintenance réelle |
| `DisposeAsset` | Céder l'actif |
| `DecommissionAsset` | Déclasser l'actif |

📌 **Aucune autre command n'est acceptée en v1.0.0**

---

## 4. Règles transverses (cœur du Guardian)

### 4.1 Création d'une immobilisation

**Command:** `CreateAsset`

**Règles Guardian:**
- `acquisitionCost > 0` (IMM-ASS-01)
- `usefulLife > 0` (IMM-ASS-02)
- `residualValue >= 0` (IMM-ASS-03)
- `acquisitionDate <= now` (IMM-ASS-04)
- `residualValue <= acquisitionCost` (IMM-ASS-07)
- `depreciationMethod = LINEAR` (v1)

**Output:** `AssetCreated`

---

### 4.2 Mise à jour de la date de renouvellement

**Command:** `UpdateRenewalInfo`

**Règles Guardian:**
- `asset.status = IN_SERVICE` (IMM-ASS-05)
- `renewalDate > acquisitionDate` (IMM-REN-01)
- `replacementCost >= 0` (IMM-REN-02)

📌 **Aucun impact sur l'amortissement**

**Output:** `RenewalInfoUpdated`

---

### 4.3 Affectation aux produits / projets

**Command:** `CreateAllocation`, `ReallocateAsset`

**Règles Guardian:**
- `asset.status = IN_SERVICE` (IMM-ALL-05)
- `0 < percentage <= 100` (IMM-ALL-01)
- `somme des allocations = 100%` (IMM-ALL-02)
- `effectiveFrom <= effectiveTo` (IMM-ALL-03)
- `aucune période de chevauchement` (IMM-ALL-04)

**Output:** `AllocationCreated`, `AllocationEnded`

---

### 4.4 Calcul et enregistrement des amortissements

**Command:** `RecordDepreciation`

**Règles Guardian:**
- `asset.status = IN_SERVICE` (IMM-ASS-06)
- `période non déjà amortie` (IMM-DEP-05)
- `dotation >= 0` (IMM-DEP-01)
- `VNC après dotation >= residualValue` (IMM-DEP-04)

**Calcul (linéaire v1):**

```
monthlyDepreciation = (acquisitionCost - residualValue) / usefulLifeMonths
```

📌 Le Guardian :
- **calcule**
- **valide**
- **émet l'événement**

**Output:** `DepreciationRecorded`

---

### 4.5 Enregistrement d'une maintenance

**Command:** `RecordMaintenance`

**Règles Guardian:**
- `asset.status = IN_SERVICE` (IMM-MNT-03)
- `cost >= 0` (IMM-MNT-01)
- `date <= now` (IMM-MNT-02)

📌 **Aucune modification d'état de l'actif**

**Output:** `MaintenanceRecorded`

---

### 4.6 Cession / déclassement

**Command:** `DisposeAsset`, `DecommissionAsset`

**Règles Guardian:**
- `asset.status = IN_SERVICE` (IMM-DIS-02)
- `disposalDate >= acquisitionDate` (IMM-DIS-01)
- `calcul gain / perte obligatoire` (IMM-DIS-03)

📌 **Après validation :**
- asset devient immutable
- plus aucun amortissement possible
- plus aucune maintenance possible

**Output:** `AssetDisposed`, `AssetDecommissioned`

---

## 5. Events émis par le Guardian

| Event | Signification |
|-------|---------------|
| `AssetCreated` | Actif enregistré |
| `AssetRenewalUpdated` | Date de renouvellement modifiée |
| `AllocationCreated` | Affectation créée |
| `AllocationEnded` | Affectation terminée |
| `DepreciationRecorded` | Dotation validée |
| `MaintenanceRecorded` | Coût tracé |
| `AssetDisposed` | Cession définitive |
| `AssetDecommissioned` | Déclassement définitif |

📌 Tous les events sont **append-only**  
📌 Tous sont **auditables**

---

## 6. Violations (refus formels)

Le Guardian refuse avec violation explicite si :

| Violation | Code | Description |
|-----------|------|-------------|
| Amortissement après cession | IMM-ASS-06 | Asset pas IN_SERVICE |
| Allocation ≠ 100% | IMM-ALL-02 | Somme incorrecte |
| Maintenance sur actif sorti | IMM-MNT-03 | Asset pas IN_SERVICE |
| VNC < residualValue | IMM-DEP-04 | Violation comptable |
| Double amortissement | IMM-DEP-05 | Période déjà amortie |
| Modification actif cédé | IMM-ASS-05 | Asset immutable |
| Cross-tenant | IMM-SEC-02 | Isolation violée |

📌 Chaque violation est **nommée, stable, testable**

---

## 7. Codes d'invariants

### Sécurité

| Code | Invariant |
|------|-----------|
| IMM-SEC-01 | TenantId requis |
| IMM-SEC-02 | Pas de cross-tenant |

### Asset

| Code | Invariant |
|------|-----------|
| IMM-ASS-01 | acquisitionCost > 0 |
| IMM-ASS-02 | usefulLife > 0 |
| IMM-ASS-03 | residualValue >= 0 |
| IMM-ASS-04 | acquisitionDate <= now |
| IMM-ASS-05 | asset cédé = immutable |
| IMM-ASS-06 | pas d'amortissement si pas IN_SERVICE |
| IMM-ASS-07 | residualValue <= acquisitionCost |

### Renouvellement

| Code | Invariant |
|------|-----------|
| IMM-REN-01 | renewalDate > acquisitionDate |
| IMM-REN-02 | replacementCost >= 0 |

### Amortissement

| Code | Invariant |
|------|-----------|
| IMM-DEP-01 | dotation >= 0 |
| IMM-DEP-02 | cumul <= acquisitionCost |
| IMM-DEP-03 | VNC = cost - cumul |
| IMM-DEP-04 | VNC >= residualValue |
| IMM-DEP-05 | période unique |

### Allocation

| Code | Invariant |
|------|-----------|
| IMM-ALL-01 | 0 < percentage <= 100 |
| IMM-ALL-02 | somme = 100% |
| IMM-ALL-03 | effectiveFrom <= effectiveTo |
| IMM-ALL-04 | pas de chevauchement |
| IMM-ALL-05 | pas d'allocation si cédé |

### Maintenance

| Code | Invariant |
|------|-----------|
| IMM-MNT-01 | cost >= 0 |
| IMM-MNT-02 | date <= now |
| IMM-MNT-03 | asset IN_SERVICE |

### Cession

| Code | Invariant |
|------|-----------|
| IMM-DIS-01 | disposalDate >= acquisitionDate |
| IMM-DIS-02 | asset IN_SERVICE avant disposal |
| IMM-DIS-03 | gainOrLoss = disposal - VNC |
| IMM-DIS-04 | disposal est final |

---

## 8. Tests du Guardian (obligatoires)

### Table-driven tests

| Scenario | Command | Expected |
|----------|---------|----------|
| Create asset OK | CreateAsset | AssetCreated ✅ |
| Amortize after disposal | RecordDepreciation | ❌ IMM-ASS-06 |
| Allocation > 100% | ReallocateAsset | ❌ IMM-ALL-02 |
| Allocation <= 0% | CreateAllocation | ❌ IMM-ALL-01 |
| Maintenance on disposed | RecordMaintenance | ❌ IMM-MNT-03 |
| Double depreciation | RecordDepreciation | ❌ IMM-DEP-05 |
| Disposal before acquisition | DisposeAsset | ❌ IMM-DIS-01 |
| Cross-tenant access | Any | ❌ IMM-SEC-02 |

📌 Les tests sont :
- **déterministes**
- **sans base de données**
- **sans mocks lourds**

---

## 9. Architecture des fichiers

```
cascade/modules/immobilisation/guardian/
├── index.ts                          # Export centralisé
├── immobilisation.guardian.ts        # Guardian principal
├── immobilisation.invariants.ts      # Règles métier
└── immobilisation.guardian.spec.ts   # Tests table-driven
```

---

## 10. Synthèse

Le Guardian Immobilisation :

- ✅ Est le **garant de la vérité patrimoniale**
- ✅ Alimente **Cost-Structure sans calcul dupliqué**
- ✅ Protège **Budget de données incohérentes**
- ✅ Est **simple, strict, suffisant**

---

## ✅ Statut du document

- **Version** : v1.0.0
- **Alignement** : CONTRACT.md v1.0.0, DDD.md v1.0.0
- **Tests** : 30+ cas table-driven
- **Prêt pour** : Application Layer
