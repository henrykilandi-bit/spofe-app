/**
 * Migration 003 - Immobilisation RLS & Security
 * Conformité: READ_MODELS.md v1.0.0
 * Principe: Multi-tenant, read-only, RLS PostgreSQL
 */

-- =====================================================
-- Enable Row-Level Security on all tables
-- =====================================================

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_disposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE immobilisation_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Tenant Isolation Policies
-- =====================================================

-- Assets
CREATE POLICY tenant_isolation_assets ON assets
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Depreciation Records
CREATE POLICY tenant_isolation_depreciation ON depreciation_records
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Asset Allocations
CREATE POLICY tenant_isolation_allocations ON asset_allocations
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Maintenance Records
CREATE POLICY tenant_isolation_maintenance ON maintenance_records
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Asset Disposals
CREATE POLICY tenant_isolation_disposals ON asset_disposals
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- Events
CREATE POLICY tenant_isolation_events ON immobilisation_events
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

-- =====================================================
-- Read-Only Role for Read-Models
-- =====================================================

-- Create read-only role if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'immobilisation_readonly') THEN
    CREATE ROLE immobilisation_readonly;
  END IF;
END
$$;

-- Grant SELECT on all views
GRANT SELECT ON rm_assets_current TO immobilisation_readonly;
GRANT SELECT ON rm_asset_depreciation_history TO immobilisation_readonly;
GRANT SELECT ON rm_asset_depreciation_summary TO immobilisation_readonly;
GRANT SELECT ON rm_asset_allocation_effective TO immobilisation_readonly;
GRANT SELECT ON rm_asset_allocation_all TO immobilisation_readonly;
GRANT SELECT ON rm_asset_maintenance_history TO immobilisation_readonly;
GRANT SELECT ON rm_asset_maintenance_summary TO immobilisation_readonly;
GRANT SELECT ON rm_asset_maintenance_by_period TO immobilisation_readonly;
GRANT SELECT ON rm_assets_renewal_projection TO immobilisation_readonly;
GRANT SELECT ON rm_asset_disposal_history TO immobilisation_readonly;
GRANT SELECT ON rm_asset_net_book_value TO immobilisation_readonly;
GRANT SELECT ON rm_assets_in_service TO immobilisation_readonly;
GRANT SELECT ON rm_depreciation_cost_structure_export TO immobilisation_readonly;
GRANT SELECT ON rm_immobilisation_kpi TO immobilisation_readonly;

-- =====================================================
-- Service Role for Write Operations
-- =====================================================

-- Create service role if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'immobilisation_service') THEN
    CREATE ROLE immobilisation_service;
  END IF;
END
$$;

-- Grant full access on tables
GRANT ALL ON assets TO immobilisation_service;
GRANT ALL ON depreciation_records TO immobilisation_service;
GRANT ALL ON asset_allocations TO immobilisation_service;
GRANT ALL ON maintenance_records TO immobilisation_service;
GRANT ALL ON asset_disposals TO immobilisation_service;
GRANT ALL ON immobilisation_events TO immobilisation_service;

-- Grant SELECT on views
GRANT SELECT ON rm_assets_current TO immobilisation_service;
GRANT SELECT ON rm_asset_depreciation_history TO immobilisation_service;
GRANT SELECT ON rm_asset_depreciation_summary TO immobilisation_service;
GRANT SELECT ON rm_asset_allocation_effective TO immobilisation_service;
GRANT SELECT ON rm_asset_allocation_all TO immobilisation_service;
GRANT SELECT ON rm_asset_maintenance_history TO immobilisation_service;
GRANT SELECT ON rm_asset_maintenance_summary TO immobilisation_service;
GRANT SELECT ON rm_asset_maintenance_by_period TO immobilisation_service;
GRANT SELECT ON rm_assets_renewal_projection TO immobilisation_service;
GRANT SELECT ON rm_asset_disposal_history TO immobilisation_service;
GRANT SELECT ON rm_asset_net_book_value TO immobilisation_service;
GRANT SELECT ON rm_assets_in_service TO immobilisation_service;
GRANT SELECT ON rm_depreciation_cost_structure_export TO immobilisation_service;
GRANT SELECT ON rm_immobilisation_kpi TO immobilisation_service;

-- =====================================================
-- Function to set current tenant
-- =====================================================

CREATE OR REPLACE FUNCTION set_current_tenant(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant', p_tenant_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_current_tenant IS 'Set current tenant for RLS policies';

-- =====================================================
-- Audit Trigger for Events
-- =====================================================

CREATE OR REPLACE FUNCTION immobilisation_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set tenant_id from app setting if not provided
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := current_setting('app.current_tenant', true)::uuid;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER audit_assets
  BEFORE INSERT ON assets
  FOR EACH ROW
  EXECUTE FUNCTION immobilisation_audit_trigger();

CREATE TRIGGER audit_depreciation
  BEFORE INSERT ON depreciation_records
  FOR EACH ROW
  EXECUTE FUNCTION immobilisation_audit_trigger();

CREATE TRIGGER audit_allocations
  BEFORE INSERT ON asset_allocations
  FOR EACH ROW
  EXECUTE FUNCTION immobilisation_audit_trigger();

CREATE TRIGGER audit_maintenance
  BEFORE INSERT ON maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION immobilisation_audit_trigger();

CREATE TRIGGER audit_disposals
  BEFORE INSERT ON asset_disposals
  FOR EACH ROW
  EXECUTE FUNCTION immobilisation_audit_trigger();
