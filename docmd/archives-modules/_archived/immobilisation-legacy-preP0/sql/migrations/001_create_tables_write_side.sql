/**
 * Migration 001 - Immobilisation Write-Side Tables
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Append-only, multi-tenant, événementiel
 */

-- =====================================================
-- Table 1: assets (Aggregate Root)
-- =====================================================
CREATE TABLE IF NOT EXISTS assets (
  asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Données d'acquisition
  acquisition_cost NUMERIC(15,2) NOT NULL CHECK (acquisition_cost > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  acquisition_date DATE NOT NULL,
  useful_life_months INTEGER NOT NULL CHECK (useful_life_months > 0),
  depreciation_method VARCHAR(20) NOT NULL DEFAULT 'LINEAR' CHECK (depreciation_method = 'LINEAR'),
  residual_value NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (residual_value >= 0),
  
  -- Données de renouvellement (optionnel)
  renewal_date DATE,
  replacement_cost NUMERIC(15,2) CHECK (replacement_cost IS NULL OR replacement_cost >= 0),
  
  -- Statut
  status VARCHAR(20) NOT NULL DEFAULT 'IN_SERVICE' CHECK (status IN ('IN_SERVICE', 'DISPOSED', 'SCRAPPED')),
  
  -- Audit
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT chk_residual_value CHECK (residual_value <= acquisition_cost),
  CONSTRAINT chk_renewal_date CHECK (renewal_date IS NULL OR renewal_date > acquisition_date)
);

COMMENT ON TABLE assets IS 'Immobilisations - Aggregate Root';
COMMENT ON COLUMN assets.status IS 'IN_SERVICE → DISPOSED/SCRAPPED (terminal)';
COMMENT ON COLUMN assets.useful_life_months IS 'Durée de vie en mois (IMM-ASS-02)';
COMMENT ON COLUMN assets.depreciation_method IS 'LINEAR uniquement v1.0.0';

-- Index
CREATE INDEX idx_assets_tenant ON assets(tenant_id);
CREATE INDEX idx_assets_tenant_status ON assets(tenant_id, status);
CREATE INDEX idx_assets_renewal ON assets(tenant_id, renewal_date) WHERE renewal_date IS NOT NULL;

-- =====================================================
-- Table 2: depreciation_records (Append-only)
-- =====================================================
CREATE TABLE IF NOT EXISTS depreciation_records (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Période
  period VARCHAR(7) NOT NULL, -- YYYY-MM
  
  -- Montants calculés par Guardian
  depreciation_amount NUMERIC(15,2) NOT NULL CHECK (depreciation_amount >= 0),
  accumulated_depreciation NUMERIC(15,2) NOT NULL CHECK (accumulated_depreciation >= 0),
  net_book_value NUMERIC(15,2) NOT NULL CHECK (net_book_value >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  
  -- Audit
  calculated_by VARCHAR(255) NOT NULL,
  calculated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Contrainte unicité période/asset
  CONSTRAINT uq_depreciation_period UNIQUE (asset_id, period)
);

COMMENT ON TABLE depreciation_records IS 'Historique des amortissements - Append-only';
COMMENT ON COLUMN depreciation_records.period IS 'Format YYYY-MM';
COMMENT ON COLUMN depreciation_records.depreciation_amount IS 'Dotation mensuelle (calculée par Guardian)';
COMMENT ON COLUMN depreciation_records.net_book_value IS 'VNC après dotation (IMM-DEP-04: >= residual_value)';

-- Index
CREATE INDEX idx_depreciation_tenant ON depreciation_records(tenant_id);
CREATE INDEX idx_depreciation_tenant_period ON depreciation_records(tenant_id, period);
CREATE INDEX idx_depreciation_asset ON depreciation_records(asset_id);

-- =====================================================
-- Table 3: asset_allocations (Ventilations)
-- =====================================================
CREATE TABLE IF NOT EXISTS asset_allocations (
  allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Cible
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('PRODUCT', 'SERVICE', 'PROJECT')),
  target_id UUID NOT NULL,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  
  -- Période d'effet
  effective_from DATE NOT NULL,
  effective_to DATE, -- NULL = toujours actif
  
  -- Audit
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_by VARCHAR(255),
  ended_at TIMESTAMP,
  end_reason TEXT,
  
  -- Contrainte dates
  CONSTRAINT chk_allocation_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

COMMENT ON TABLE asset_allocations IS 'Ventilations des immobilisations sur cibles';
COMMENT ON COLUMN asset_allocations.target_type IS 'PRODUCT, SERVICE ou PROJECT';
COMMENT ON COLUMN asset_allocations.percentage IS 'Part allouée (IMM-ALL-02: total = 100%)';

-- Index
CREATE INDEX idx_allocations_tenant ON asset_allocations(tenant_id);
CREATE INDEX idx_allocations_asset ON asset_allocations(asset_id);
CREATE INDEX idx_allocations_effective ON asset_allocations(tenant_id, effective_from, effective_to);
CREATE INDEX idx_allocations_target ON asset_allocations(target_type, target_id);

-- =====================================================
-- Table 4: maintenance_records (Historique maintenance)
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_records (
  maintenance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Détails
  maintenance_type VARCHAR(20) NOT NULL CHECK (maintenance_type IN ('MAINTENANCE', 'REPAIR', 'SERVICE')),
  maintenance_date DATE NOT NULL,
  description TEXT NOT NULL,
  cost NUMERIC(15,2) NOT NULL CHECK (cost >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  performed_by VARCHAR(255) NOT NULL,
  
  -- Audit
  recorded_by VARCHAR(255) NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Contrainte date
  CONSTRAINT chk_maintenance_date CHECK (maintenance_date <= CURRENT_DATE)
);

COMMENT ON TABLE maintenance_records IS 'Historique des interventions de maintenance - Append-only';
COMMENT ON COLUMN maintenance_records.maintenance_type IS 'MAINTENANCE, REPAIR ou SERVICE';
COMMENT ON COLUMN maintenance_records.cost IS 'Coût >= 0 (IMM-MNT-01)';

-- Index
CREATE INDEX idx_maintenance_tenant ON maintenance_records(tenant_id);
CREATE INDEX idx_maintenance_asset ON maintenance_records(asset_id);
CREATE INDEX idx_maintenance_tenant_date ON maintenance_records(tenant_id, maintenance_date);

-- =====================================================
-- Table 5: asset_disposals (Cessions)
-- =====================================================
CREATE TABLE IF NOT EXISTS asset_disposals (
  disposal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(asset_id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  
  -- Détails cession
  disposal_date DATE NOT NULL,
  disposal_type VARCHAR(20) NOT NULL CHECK (disposal_type IN ('SALE', 'SCRAP')),
  disposal_value NUMERIC(15,2) NOT NULL CHECK (disposal_value >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  
  -- Valeurs calculées par Guardian
  net_book_value NUMERIC(15,2) NOT NULL,
  gain_or_loss NUMERIC(15,2) NOT NULL, -- + = plus-value, - = moins-value
  
  -- Raison (obligatoire pour SCRAP)
  reason TEXT,
  
  -- Audit
  disposed_by VARCHAR(255) NOT NULL,
  disposed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Contrainte unicité
  CONSTRAINT uq_asset_disposal UNIQUE (asset_id)
);

COMMENT ON TABLE asset_disposals IS 'Cessions et mises au rebut - Terminal';
COMMENT ON COLUMN asset_disposals.disposal_type IS 'SALE (cession) ou SCRAP (rebut)';
COMMENT ON COLUMN asset_disposals.gain_or_loss IS 'Plus-value (+) ou moins-value (-) calculée par Guardian';
COMMENT ON COLUMN asset_disposals.reason IS 'Obligatoire si SCRAP';

-- Index
CREATE INDEX idx_disposals_tenant ON asset_disposals(tenant_id);
CREATE INDEX idx_disposals_tenant_date ON asset_disposals(tenant_id, disposal_date);

-- =====================================================
-- Table 6: immobilisation_events (Event Store)
-- =====================================================
CREATE TABLE IF NOT EXISTS immobilisation_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Agrégat source
  aggregate_type VARCHAR(50) NOT NULL,
  aggregate_id UUID NOT NULL,
  
  -- Event
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  
  -- Métadonnées
  actor_id VARCHAR(255) NOT NULL,
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Contrainte unicité version par agrégat
  CONSTRAINT uq_event_version UNIQUE (aggregate_id, version)
);

COMMENT ON TABLE immobilisation_events IS 'Event Store - Source de vérité';
COMMENT ON COLUMN immobilisation_events.event_type IS 'AssetCreated, DepreciationRecorded, etc.';
COMMENT ON COLUMN immobilisation_events.event_data IS 'Payload JSON de l\'event';

-- Index
CREATE INDEX idx_events_tenant ON immobilisation_events(tenant_id);
CREATE INDEX idx_events_aggregate ON immobilisation_events(aggregate_id);
CREATE INDEX idx_events_type ON immobilisation_events(event_type);
CREATE INDEX idx_events_occurred ON immobilisation_events(occurred_at);
