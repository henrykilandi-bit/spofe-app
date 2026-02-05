# 📘 READ-MODELS SQL — MODULE IMMOBILISATION v1.0.0

## SPOFE Platform — Définition Contractuelle

---

## 1. Principes contractuels (non négociables)

### Les read-models :
- ❌ **Ne contiennent aucune logique métier**
- ❌ **Ne recalculent aucune règle Guardian**
- ✅ **Exposent des faits validés uniquement**

### Toutes les données :
- Proviennent **exclusivement des Events**
- Sont **multi-tenant** (`tenant_id` obligatoire)
- Sont **read-only** (aucun UPDATE/DELETE)

### Gouvernance :
- Toute modification métier → **nouvelle version majeure**
- RLS PostgreSQL activé sur toutes les vues

---

## 2. Sources write-side (Events)

Les read-models sont alimentés par :

| Event | Description |
|-------|-------------|
| `AssetCreatedEvent` | Création d'immobilisation |
| `RenewalInfoUpdatedEvent` | Mise à jour renouvellement |
| `AssetAllocatedEvent` | Ventilation sur cibles |
| `DepreciationRecordedEvent` | Dotation d'amortissement |
| `MaintenanceRecordedEvent` | Coût de maintenance |
| `AssetDisposedEvent` | Cession d'immobilisation |
| `AssetDecommissionedEvent` | Mise au rebut |

---

## 3. READ-MODELS — Définition

### 3.1 `rm_assets_current`

**📌 Vue — État courant des immobilisations**

**Usage:**
- Listing des actifs
- Tableau de bord patrimonial
- Vue principale UI

```sql
CREATE OR REPLACE VIEW rm_assets_current AS
SELECT
  asset_id,
  tenant_id,
  
  acquisition_cost,
  currency,
  acquisition_date,
  useful_life_months,
  depreciation_method,
  residual_value,
  
  renewal_date,
  replacement_cost,
  
  status,
  created_at,
  created_by
FROM assets;
```

**Règles:**
- 📌 1 ligne = 1 immobilisation
- 📌 Les actifs cédés sont conservés (`status ≠ IN_SERVICE`)
- 📌 Filtrage par `status` pour actifs actifs uniquement

---

### 3.2 `rm_asset_depreciation_history`

**📌 Vue — Historique des amortissements**

**Usage:**
- Plan d'amortissement détaillé
- Historique comptable
- Base pour Cost-Structure

```sql
CREATE OR REPLACE VIEW rm_asset_depreciation_history AS
SELECT
  schedule_id,
  asset_id,
  tenant_id,
  
  period,
  depreciation_amount,
  accumulated_depreciation,
  net_book_value,
  currency,
  
  calculated_by,
  calculated_at
FROM depreciation_records
ORDER BY asset_id, period;
```

**Règles:**
- 📌 Append-only (aucune suppression)
- 📌 Aucune agrégation ici
- 📌 Tri chronologique par période

---

### 3.3 `rm_asset_depreciation_summary`

**📌 Vue — Amortissements agrégés par période**

**Usage:**
- Exposition à Cost-Structure
- Ventilation des coûts
- Reporting comptable

```sql
CREATE OR REPLACE VIEW rm_asset_depreciation_summary AS
SELECT
  tenant_id,
  period,
  
  SUM(depreciation_amount) AS total_depreciation,
  COUNT(DISTINCT asset_id) AS asset_count,
  MIN(currency) AS currency
FROM depreciation_records
GROUP BY tenant_id, period
ORDER BY tenant_id, period;
```

**Règles:**
- 📌 Vue contractuelle Cost-Structure
- 📌 Read-only, agrégée
- 📌 1 ligne = 1 période par tenant

---

### 3.4 `rm_asset_allocation_effective`

**📌 Vue — Affectations effectives par période**

**Usage:**
- Ventilation des amortissements
- Pont Immobilisation → COUTFLEX
- Analyse par centre de coût

```sql
CREATE OR REPLACE VIEW rm_asset_allocation_effective AS
SELECT
  allocation_id,
  asset_id,
  tenant_id,
  
  target_type,
  target_id,
  percentage,
  
  effective_from,
  effective_to,
  
  created_by,
  created_at
FROM asset_allocations
WHERE effective_to IS NULL OR effective_to > CURRENT_DATE;
```

**Règles:**
- 📌 L'agrégation finale est faite côté Cost-Structure
- 📌 Pas de calcul ici
- 📌 Filtre sur allocations actives

---

### 3.5 `rm_asset_allocation_all`

**📌 Vue — Toutes les affectations (historique complet)**

**Usage:**
- Audit
- Historique des ventilations
- Traçabilité

```sql
CREATE OR REPLACE VIEW rm_asset_allocation_all AS
SELECT
  allocation_id,
  asset_id,
  tenant_id,
  
  target_type,
  target_id,
  percentage,
  
  effective_from,
  effective_to,
  
  created_by,
  created_at
FROM asset_allocations
ORDER BY asset_id, effective_from;
```

---

### 3.6 `rm_asset_maintenance_history`

**📌 Vue — Historique des coûts de maintenance**

**Usage:**
- Suivi TCO (Total Cost of Ownership)
- Alimentation Budget
- Reporting patrimonial

```sql
CREATE OR REPLACE VIEW rm_asset_maintenance_history AS
SELECT
  maintenance_id,
  asset_id,
  tenant_id,
  
  maintenance_type,
  maintenance_date,
  description,
  cost,
  currency,
  performed_by,
  
  recorded_by,
  recorded_at
FROM maintenance_records
ORDER BY asset_id, maintenance_date;
```

**Règles:**
- 📌 Append-only
- 📌 Aucun lien avec amortissement
- 📌 Tri chronologique

---

### 3.7 `rm_asset_maintenance_summary`

**📌 Vue — Coûts de maintenance agrégés par actif**

**Usage:**
- Cost-Structure (coûts indirects)
- Budget (charges récurrentes)
- Analyse TCO

```sql
CREATE OR REPLACE VIEW rm_asset_maintenance_summary AS
SELECT
  tenant_id,
  asset_id,
  
  SUM(cost) AS total_maintenance_cost,
  COUNT(*) AS intervention_count,
  MIN(maintenance_date) AS first_intervention,
  MAX(maintenance_date) AS last_intervention,
  MIN(currency) AS currency
FROM maintenance_records
GROUP BY tenant_id, asset_id;
```

---

### 3.8 `rm_asset_maintenance_by_period`

**📌 Vue — Coûts de maintenance agrégés par période**

**Usage:**
- Budget (prévision charges)
- Analyse saisonnière
- Cost-Structure périodique

```sql
CREATE OR REPLACE VIEW rm_asset_maintenance_by_period AS
SELECT
  tenant_id,
  TO_CHAR(maintenance_date, 'YYYY-MM') AS period,
  
  SUM(cost) AS total_maintenance_cost,
  COUNT(*) AS intervention_count,
  COUNT(DISTINCT asset_id) AS assets_maintained,
  MIN(currency) AS currency
FROM maintenance_records
GROUP BY tenant_id, TO_CHAR(maintenance_date, 'YYYY-MM')
ORDER BY tenant_id, period;
```

---

### 3.9 `rm_assets_renewal_projection`

**📌 Vue — Projection de renouvellement**

**Usage:**
- Budget (CAPEX futur)
- Décision d'investissement
- Planification stratégique

```sql
CREATE OR REPLACE VIEW rm_assets_renewal_projection AS
SELECT
  asset_id,
  tenant_id,
  
  acquisition_cost,
  acquisition_date,
  useful_life_months,
  
  renewal_date,
  replacement_cost,
  currency,
  
  status,
  
  -- Calcul d'exposition (pas de logique métier)
  EXTRACT(YEAR FROM renewal_date) AS renewal_year,
  EXTRACT(MONTH FROM renewal_date) AS renewal_month
FROM assets
WHERE renewal_date IS NOT NULL
  AND status = 'IN_SERVICE'
ORDER BY renewal_date;
```

**Règles:**
- 📌 Aucune logique de décision
- 📌 Simple exposition
- 📌 Filtre sur actifs en service uniquement

---

### 3.10 `rm_asset_disposal_history`

**📌 Vue — Historique des cessions**

**Usage:**
- Audit
- Comptabilité (plus/moins values)
- Analyse patrimoniale

```sql
CREATE OR REPLACE VIEW rm_asset_disposal_history AS
SELECT
  disposal_id,
  asset_id,
  tenant_id,
  
  disposal_date,
  disposal_type,
  disposal_value,
  net_book_value,
  gain_or_loss,
  currency,
  
  reason,
  
  disposed_by,
  disposed_at
FROM asset_disposals
ORDER BY disposal_date DESC;
```

**Règles:**
- 📌 Inclut SALE et SCRAP (déclassement)
- 📌 `gain_or_loss` calculé par Guardian (jamais recalculé ici)

---

### 3.11 `rm_asset_net_book_value`

**📌 Vue — VNC courante par actif**

**Usage:**
- Tableau de bord
- Bilan patrimonial
- Base pour cession

```sql
CREATE OR REPLACE VIEW rm_asset_net_book_value AS
SELECT
  a.asset_id,
  a.tenant_id,
  
  a.acquisition_cost,
  a.residual_value,
  a.currency,
  a.status,
  
  COALESCE(d.accumulated_depreciation, 0) AS accumulated_depreciation,
  a.acquisition_cost - COALESCE(d.accumulated_depreciation, 0) AS net_book_value,
  d.last_period
FROM assets a
LEFT JOIN (
  SELECT
    asset_id,
    MAX(accumulated_depreciation) AS accumulated_depreciation,
    MAX(period) AS last_period
  FROM depreciation_records
  GROUP BY asset_id
) d ON d.asset_id = a.asset_id;
```

**Règles:**
- 📌 Jointure agrégée, pas de recalcul
- 📌 VNC = Acquisition - Cumul (fait validé)

---

## 4. READ-MODELS CONTRACTUELS INTER-MODULES

### Immobilisation → Cost-Structure (OBLIGATOIRE)

| Vue | Rôle | Fréquence |
|-----|------|-----------|
| `rm_asset_depreciation_summary` | Dotations par période | Mensuelle |
| `rm_asset_allocation_effective` | Ventilation par cible | À la demande |
| `rm_asset_maintenance_by_period` | Coûts indirects | Mensuelle |

**📌 Cost-Structure ne joint JAMAIS aux tables write-side**

---

### Immobilisation → Budget

| Vue | Rôle | Fréquence |
|-----|------|-----------|
| `rm_assets_renewal_projection` | Investissements futurs (CAPEX) | Annuelle |
| `rm_asset_maintenance_summary` | Charges récurrentes (OPEX) | Mensuelle |
| `rm_asset_depreciation_summary` | Dotations budgétées | Mensuelle |

---

## 5. Sécurité & Multi-tenant

### Règles de sécurité
- ✅ Toutes les vues incluent `tenant_id`
- ✅ RLS PostgreSQL activé
- ✅ Accès read-only uniquement
- ❌ Aucun UPDATE / DELETE possible

### Row-Level Security (RLS)

```sql
-- Activer RLS sur toutes les tables source
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_disposals ENABLE ROW LEVEL SECURITY;

-- Policy par tenant
CREATE POLICY tenant_isolation_assets ON assets
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_depreciation ON depreciation_records
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_allocations ON asset_allocations
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_maintenance ON maintenance_records
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY tenant_isolation_disposals ON asset_disposals
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## 6. Index recommandés

```sql
-- Performance des vues
CREATE INDEX idx_assets_tenant_status ON assets(tenant_id, status);
CREATE INDEX idx_depreciation_tenant_period ON depreciation_records(tenant_id, period);
CREATE INDEX idx_depreciation_asset ON depreciation_records(asset_id);
CREATE INDEX idx_allocations_tenant_effective ON asset_allocations(tenant_id, effective_from, effective_to);
CREATE INDEX idx_maintenance_tenant_date ON maintenance_records(tenant_id, maintenance_date);
CREATE INDEX idx_disposals_tenant_date ON asset_disposals(tenant_id, disposal_date);
```

---

## 7. Mapping Event → Read-Model

| Event | Tables impactées | Read-Models rafraîchis |
|-------|------------------|------------------------|
| `AssetCreatedEvent` | `assets` | `rm_assets_current`, `rm_asset_net_book_value` |
| `RenewalInfoUpdatedEvent` | `assets` | `rm_assets_current`, `rm_assets_renewal_projection` |
| `AssetAllocatedEvent` | `asset_allocations` | `rm_asset_allocation_*` |
| `DepreciationRecordedEvent` | `depreciation_records` | `rm_asset_depreciation_*`, `rm_asset_net_book_value` |
| `MaintenanceRecordedEvent` | `maintenance_records` | `rm_asset_maintenance_*` |
| `AssetDisposedEvent` | `assets`, `asset_disposals` | `rm_assets_current`, `rm_asset_disposal_history` |
| `AssetDecommissionedEvent` | `assets`, `asset_disposals` | `rm_assets_current`, `rm_asset_disposal_history` |

---

## ✅ Statut du document

| Attribut | Valeur |
|----------|--------|
| **Version** | v1.0.0 |
| **Statut** | Contractuel |
| **Date** | 2026-02-01 |
| **Auteur** | SPOFE Architecture |

**Toute modification** → version majeure

### Dépendances contractuelles
- ✅ Guardian Immobilisation v1.0.0
- ✅ Cost-Structure v1.0.0
- ✅ Budget v1.0.0
- ✅ COMMANDS_EVENTS.md v1.0.0
