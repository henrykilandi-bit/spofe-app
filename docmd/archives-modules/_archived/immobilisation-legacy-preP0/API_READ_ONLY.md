# 📘 API HTTP (GET) — MODULE IMMOBILISATION v1.0.0

## SPOFE Platform — Spécification Contractuelle

---

## 1. Principes contractuels (non négociables)

### Toutes les routes sont :
- **GET uniquement**
- **Read-only**
- Basées **exclusivement sur les read-models SQL**

### Règles strictes :
- ❌ **Aucun accès direct aux tables write-side**
- ❌ **Aucun calcul métier dans les controllers**
- ✅ **Multi-tenant obligatoire** (`X-Tenant-Id`)
- ✅ **Pagination obligatoire** sur les listes
- ✅ **Filtrage explicite uniquement**

---

## 2. Conventions générales

### Base path
```
/api/immobilisation
```

### Headers obligatoires
```http
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

### Codes de réponse
| Code | Description |
|------|-------------|
| `200 OK` | Succès |
| `400 Bad Request` | Paramètres invalides |
| `401 Unauthorized` | Non authentifié |
| `403 Forbidden` | Accès interdit |
| `404 Not Found` | Ressource non trouvée |

### Format de pagination
```typescript
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
```

---

## 3. Endpoints contractuels

### 3.1 Liste des immobilisations (état courant)

**Endpoint**
```
GET /api/immobilisation/assets
```

**Read-model:** `rm_assets_current`

**Query params**
| Param | Type | Description | Défaut |
|-------|------|-------------|--------|
| `status` | string | `IN_SERVICE` / `DISPOSED` / `SCRAPPED` | - |
| `page` | number | Numéro de page | 1 |
| `limit` | number | Taille page (max 100) | 20 |

**Response 200**
```json
{
  "items": [
    {
      "assetId": "asset-001",
      "acquisitionCost": 12000000,
      "currency": "XAF",
      "acquisitionDate": "2024-01-01",
      "usefulLifeMonths": 60,
      "depreciationMethod": "LINEAR",
      "residualValue": 1000000,
      "renewalDate": "2029-01-01",
      "replacementCost": 15000000,
      "status": "IN_SERVICE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 42,
  "hasMore": true
}
```

---

### 3.2 Détail d'une immobilisation

**Endpoint**
```
GET /api/immobilisation/assets/{assetId}
```

**Read-models:**
- `rm_assets_current`
- `rm_asset_net_book_value`
- `rm_asset_depreciation_history`
- `rm_asset_maintenance_history`
- `rm_asset_allocation_effective`

**Response 200**
```json
{
  "asset": {
    "assetId": "asset-001",
    "acquisitionCost": 12000000,
    "currency": "XAF",
    "acquisitionDate": "2024-01-01",
    "usefulLifeMonths": 60,
    "depreciationMethod": "LINEAR",
    "residualValue": 1000000,
    "renewalDate": "2029-01-01",
    "replacementCost": 15000000,
    "status": "IN_SERVICE"
  },
  "netBookValue": {
    "acquisitionCost": 12000000,
    "accumulatedDepreciation": 2200000,
    "netBookValue": 9800000,
    "lastPeriod": "2025-01"
  },
  "depreciationHistory": [...],
  "maintenanceHistory": [...],
  "allocations": [...]
}
```

---

### 3.3 VNC courante des actifs

**Endpoint**
```
GET /api/immobilisation/assets/net-book-value
```

**Read-model:** `rm_asset_net_book_value`

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filtrer par statut |
| `assetId` | string | Filtrer par actif |

**Response 200**
```json
{
  "items": [
    {
      "assetId": "asset-001",
      "acquisitionCost": 12000000,
      "residualValue": 1000000,
      "accumulatedDepreciation": 2200000,
      "netBookValue": 9800000,
      "currency": "XAF",
      "status": "IN_SERVICE",
      "lastPeriod": "2025-01"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 42
}
```

---

### 3.4 Historique des amortissements d'un actif

**Endpoint**
```
GET /api/immobilisation/assets/{assetId}/depreciation
```

**Read-model:** `rm_asset_depreciation_history`

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `fromPeriod` | string | YYYY-MM (début) |
| `toPeriod` | string | YYYY-MM (fin) |
| `page` | number | Pagination |
| `limit` | number | Taille page |

**Response 200**
```json
{
  "items": [
    {
      "scheduleId": "sched-001",
      "period": "2024-01",
      "depreciationAmount": 183333.33,
      "accumulatedDepreciation": 183333.33,
      "netBookValue": 11816666.67,
      "currency": "XAF",
      "calculatedAt": "2024-01-31T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 12
}
```

---

### 3.5 Amortissements agrégés par période (📌 Cost-Structure)

**Endpoint**
```
GET /api/immobilisation/depreciation/summary
```

**Read-model:** `rm_asset_depreciation_summary`

**Query params**
| Param | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `period` | string | ✅ | YYYY-MM |

**Response 200**
```json
{
  "period": "2025-01",
  "totalDepreciation": 4500000,
  "assetCount": 12,
  "currency": "XAF"
}
```

> 📌 **Endpoint contractuel Cost-Structure**
> 📌 Toute modification = version majeure

---

### 3.6 Dotations ventilées pour Cost-Structure (📌 Cost-Structure)

**Endpoint**
```
GET /api/immobilisation/depreciation/cost-structure-export
```

**Read-model:** `rm_depreciation_cost_structure_export`

**Query params**
| Param | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `period` | string | ✅ | YYYY-MM |

**Response 200**
```json
{
  "period": "2025-01",
  "items": [
    {
      "assetId": "asset-001",
      "depreciationAmount": 183333.33,
      "targetType": "PRODUCT",
      "targetId": "product-001",
      "percentage": 60,
      "allocatedAmount": 110000,
      "currency": "XAF"
    }
  ],
  "total": 5
}
```

> 📌 **Endpoint contractuel Cost-Structure**

---

### 3.7 Affectations effectives des immobilisations (📌 Cost-Structure)

**Endpoint**
```
GET /api/immobilisation/allocations
```

**Read-model:** `rm_asset_allocation_effective`

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `assetId` | string | Filtrer par actif |
| `targetType` | string | `PRODUCT` / `SERVICE` / `PROJECT` |
| `targetId` | string | Filtrer par cible |
| `page` | number | Pagination |
| `limit` | number | Taille page |

**Response 200**
```json
{
  "items": [
    {
      "allocationId": "alloc-001",
      "assetId": "asset-001",
      "targetType": "PRODUCT",
      "targetId": "product-001",
      "percentage": 60,
      "effectiveFrom": "2024-01-01",
      "effectiveTo": null
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 25
}
```

> 📌 **Endpoint contractuel Cost-Structure**

---

### 3.8 Historique des coûts de maintenance

**Endpoint**
```
GET /api/immobilisation/maintenance
```

**Read-model:** `rm_asset_maintenance_history`

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `assetId` | string | Filtrer par actif |
| `type` | string | `MAINTENANCE` / `REPAIR` / `SERVICE` |
| `fromDate` | string | ISO date (début) |
| `toDate` | string | ISO date (fin) |
| `page` | number | Pagination |
| `limit` | number | Taille page |

**Response 200**
```json
{
  "items": [
    {
      "maintenanceId": "mnt-001",
      "assetId": "asset-001",
      "maintenanceType": "MAINTENANCE",
      "maintenanceDate": "2024-06-15",
      "description": "Maintenance préventive semestrielle",
      "cost": 150000,
      "currency": "XAF",
      "performedBy": "Technicien A",
      "recordedAt": "2024-06-15T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 15
}
```

---

### 3.9 Coûts de maintenance agrégés par actif (📌 Cost-Structure, Budget)

**Endpoint**
```
GET /api/immobilisation/maintenance/summary
```

**Read-model:** `rm_asset_maintenance_summary`

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `assetId` | string | Filtrer par actif (optionnel) |

**Response 200**
```json
{
  "items": [
    {
      "assetId": "asset-001",
      "totalMaintenanceCost": 500000,
      "interventionCount": 3,
      "firstIntervention": "2024-06-15",
      "lastIntervention": "2025-01-10",
      "currency": "XAF"
    }
  ],
  "total": 42
}
```

> 📌 **Endpoint contractuel Cost-Structure et Budget**

---

### 3.10 Coûts de maintenance par période (📌 Cost-Structure)

**Endpoint**
```
GET /api/immobilisation/maintenance/by-period
```

**Read-model:** `rm_asset_maintenance_by_period`

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `fromPeriod` | string | YYYY-MM (début) |
| `toPeriod` | string | YYYY-MM (fin) |

**Response 200**
```json
{
  "items": [
    {
      "period": "2025-01",
      "totalMaintenanceCost": 225000,
      "interventionCount": 5,
      "assetsMaintained": 3,
      "currency": "XAF"
    }
  ],
  "total": 12
}
```

> 📌 **Endpoint contractuel Cost-Structure**

---

### 3.11 Projection de renouvellement (📌 Budget)

**Endpoint**
```
GET /api/immobilisation/renewals
```

**Read-model:** `rm_assets_renewal_projection`

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `fromYear` | number | Année début |
| `toYear` | number | Année fin |
| `page` | number | Pagination |
| `limit` | number | Taille page |

**Response 200**
```json
{
  "items": [
    {
      "assetId": "asset-001",
      "acquisitionCost": 12000000,
      "renewalDate": "2029-01-01",
      "replacementCost": 15000000,
      "renewalYear": 2029,
      "renewalMonth": 1,
      "currency": "XAF"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 8
}
```

> 📌 **Endpoint contractuel Budget (CAPEX)**

---

### 3.12 Historique des cessions / déclassements

**Endpoint**
```
GET /api/immobilisation/disposals
```

**Read-model:** `rm_asset_disposal_history`

**Query params**
| Param | Type | Description |
|-------|------|-------------|
| `disposalType` | string | `SALE` / `SCRAP` |
| `fromDate` | string | ISO date (début) |
| `toDate` | string | ISO date (fin) |
| `page` | number | Pagination |
| `limit` | number | Taille page |

**Response 200**
```json
{
  "items": [
    {
      "disposalId": "disp-001",
      "assetId": "asset-003",
      "disposalDate": "2025-01-15",
      "disposalType": "SALE",
      "disposalValue": 300000,
      "netBookValue": 100000,
      "gainOrLoss": 200000,
      "currency": "XAF",
      "reason": null,
      "disposedAt": "2025-01-15T14:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5
}
```

---

### 3.13 KPIs patrimoniales (Dashboard)

**Endpoint**
```
GET /api/immobilisation/kpi
```

**Read-model:** `rm_immobilisation_kpi`

**Response 200**
```json
{
  "assetsInService": 42,
  "assetsDisposed": 5,
  "assetsScrapped": 2,
  "totalAssets": 49,
  "totalAcquisitionCost": 250000000,
  "totalNetBookValue": 180000000,
  "totalAccumulatedDepreciation": 70000000,
  "currency": "XAF"
}
```

---

## 4. Contrats inter-modules (récapitulatif)

### Immobilisation → Cost-Structure

| Endpoint | Read-Model | Usage |
|----------|------------|-------|
| `GET /depreciation/summary` | `rm_asset_depreciation_summary` | Dotations mensuelles |
| `GET /depreciation/cost-structure-export` | `rm_depreciation_cost_structure_export` | Dotations ventilées |
| `GET /allocations` | `rm_asset_allocation_effective` | Ventilation |
| `GET /maintenance/summary` | `rm_asset_maintenance_summary` | Coûts indirects |
| `GET /maintenance/by-period` | `rm_asset_maintenance_by_period` | Coûts périodiques |

### Immobilisation → Budget

| Endpoint | Read-Model | Usage |
|----------|------------|-------|
| `GET /renewals` | `rm_assets_renewal_projection` | CAPEX futurs |
| `GET /maintenance/summary` | `rm_asset_maintenance_summary` | OPEX récurrents |

> 📌 **Aucun endpoint POST/PUT exposé**
> 📌 **Les Commands passent par le write-side uniquement**

---

## 5. Sécurité & Gouvernance

### Authentification
- ✅ Bearer token obligatoire
- ✅ Validation JWT

### Autorisation
- ✅ Autorisation par rôle
- ✅ `IMMOBILISATION_READ` pour lecture
- ✅ `IMMOBILISATION_ADMIN` pour export

### Multi-tenant
- ✅ RLS PostgreSQL activé
- ✅ `X-Tenant-Id` obligatoire
- ✅ Isolation stricte

### Audit
- ✅ Logging accès read-only
- ✅ Pas d'effet de bord
- ✅ Traçabilité complète

---

## ✅ Statut du document

| Attribut | Valeur |
|----------|--------|
| **Version** | v1.0.0 |
| **Statut** | Contractuel |
| **Date** | 2026-02-01 |

**Toute évolution** → version majeure

### Conformité
- ✅ CONTRACT.md v1.0.0
- ✅ READ_MODELS.md v1.0.0
- ✅ COMMANDS_EVENTS.md v1.0.0
