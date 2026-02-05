/**
 * Migration 002 - Immobilisation Read-Models (SQL Views)
 * Conformité: READ_MODELS.md v1.0.0
 * Principe: Aucun calcul métier, exposition faits validés uniquement
 */

-- =====================================================
-- Vue 1: rm_assets_current
-- État courant des immobilisations
-- =====================================================
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

COMMENT ON VIEW rm_assets_current IS 'Read-Model: État courant des immobilisations (1 ligne = 1 actif)';

-- =====================================================
-- Vue 2: rm_asset_depreciation_history
-- Historique des amortissements
-- =====================================================
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

COMMENT ON VIEW rm_asset_depreciation_history IS 'Read-Model: Historique complet des amortissements (append-only)';

-- =====================================================
-- Vue 3: rm_asset_depreciation_summary
-- Amortissements agrégés par période (CONTRACTUEL Cost-Structure)
-- =====================================================
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

COMMENT ON VIEW rm_asset_depreciation_summary IS 'Read-Model CONTRACTUEL: Amortissements agrégés par période (Cost-Structure)';

-- =====================================================
-- Vue 4: rm_asset_allocation_effective
-- Affectations effectives (actives)
-- =====================================================
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

COMMENT ON VIEW rm_asset_allocation_effective IS 'Read-Model CONTRACTUEL: Affectations actives (Cost-Structure)';

-- =====================================================
-- Vue 5: rm_asset_allocation_all
-- Toutes les affectations (historique complet)
-- =====================================================
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
  created_at,
  ended_by,
  ended_at,
  end_reason
FROM asset_allocations
ORDER BY asset_id, effective_from;

COMMENT ON VIEW rm_asset_allocation_all IS 'Read-Model: Historique complet des affectations (audit)';

-- =====================================================
-- Vue 6: rm_asset_maintenance_history
-- Historique des coûts de maintenance
-- =====================================================
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

COMMENT ON VIEW rm_asset_maintenance_history IS 'Read-Model: Historique des interventions de maintenance';

-- =====================================================
-- Vue 7: rm_asset_maintenance_summary
-- Coûts de maintenance agrégés par actif
-- =====================================================
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

COMMENT ON VIEW rm_asset_maintenance_summary IS 'Read-Model CONTRACTUEL: Coûts maintenance agrégés (Cost-Structure, Budget)';

-- =====================================================
-- Vue 8: rm_asset_maintenance_by_period
-- Coûts de maintenance agrégés par période
-- =====================================================
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

COMMENT ON VIEW rm_asset_maintenance_by_period IS 'Read-Model CONTRACTUEL: Maintenance par période (Cost-Structure)';

-- =====================================================
-- Vue 9: rm_assets_renewal_projection
-- Projection de renouvellement (CONTRACTUEL Budget)
-- =====================================================
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
  
  EXTRACT(YEAR FROM renewal_date)::INTEGER AS renewal_year,
  EXTRACT(MONTH FROM renewal_date)::INTEGER AS renewal_month
FROM assets
WHERE renewal_date IS NOT NULL
  AND status = 'IN_SERVICE'
ORDER BY renewal_date;

COMMENT ON VIEW rm_assets_renewal_projection IS 'Read-Model CONTRACTUEL: Projection renouvellement (Budget CAPEX)';

-- =====================================================
-- Vue 10: rm_asset_disposal_history
-- Historique des cessions
-- =====================================================
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

COMMENT ON VIEW rm_asset_disposal_history IS 'Read-Model: Historique des cessions et mises au rebut';

-- =====================================================
-- Vue 11: rm_asset_net_book_value
-- VNC courante par actif
-- =====================================================
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

COMMENT ON VIEW rm_asset_net_book_value IS 'Read-Model: VNC courante par actif (tableau de bord)';

-- =====================================================
-- Vue 12: rm_assets_in_service
-- Actifs en service uniquement (vue filtrée)
-- =====================================================
CREATE OR REPLACE VIEW rm_assets_in_service AS
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
  
  created_at,
  created_by
FROM assets
WHERE status = 'IN_SERVICE';

COMMENT ON VIEW rm_assets_in_service IS 'Read-Model: Actifs en service uniquement (UI principale)';

-- =====================================================
-- Vue 13: rm_depreciation_cost_structure_export
-- Vue contractuelle pour Cost-Structure (dotations ventilées)
-- =====================================================
CREATE OR REPLACE VIEW rm_depreciation_cost_structure_export AS
SELECT
  dr.tenant_id,
  dr.period,
  dr.asset_id,
  dr.depreciation_amount,
  dr.currency,
  
  aa.target_type,
  aa.target_id,
  aa.percentage,
  
  -- Montant ventilé (pas de calcul métier, simple multiplication)
  ROUND(dr.depreciation_amount * aa.percentage / 100, 2) AS allocated_amount
FROM depreciation_records dr
JOIN asset_allocations aa ON aa.asset_id = dr.asset_id
  AND aa.tenant_id = dr.tenant_id
  AND (
    (aa.effective_from <= (dr.period || '-01')::DATE)
    AND (aa.effective_to IS NULL OR aa.effective_to >= (dr.period || '-01')::DATE)
  );

COMMENT ON VIEW rm_depreciation_cost_structure_export IS 'Read-Model CONTRACTUEL: Dotations ventilées pour Cost-Structure';

-- =====================================================
-- Vue 14: rm_immobilisation_kpi
-- KPIs patrimoniales (tableau de bord)
-- =====================================================
CREATE OR REPLACE VIEW rm_immobilisation_kpi AS
SELECT
  a.tenant_id,
  
  COUNT(*) FILTER (WHERE a.status = 'IN_SERVICE') AS assets_in_service,
  COUNT(*) FILTER (WHERE a.status = 'DISPOSED') AS assets_disposed,
  COUNT(*) FILTER (WHERE a.status = 'SCRAPPED') AS assets_scrapped,
  COUNT(*) AS total_assets,
  
  SUM(a.acquisition_cost) FILTER (WHERE a.status = 'IN_SERVICE') AS total_acquisition_cost,
  SUM(nbv.net_book_value) FILTER (WHERE a.status = 'IN_SERVICE') AS total_net_book_value,
  SUM(nbv.accumulated_depreciation) FILTER (WHERE a.status = 'IN_SERVICE') AS total_accumulated_depreciation,
  
  MIN(a.currency) AS currency
FROM assets a
LEFT JOIN rm_asset_net_book_value nbv ON nbv.asset_id = a.asset_id
GROUP BY a.tenant_id;

COMMENT ON VIEW rm_immobilisation_kpi IS 'Read-Model: KPIs patrimoniales agrégées (dashboard)';
