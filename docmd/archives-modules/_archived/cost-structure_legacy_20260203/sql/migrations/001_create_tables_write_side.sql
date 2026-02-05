/**
 * Migration 001 - Cost-Structure Write-Side Tables
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Append-only, versionnées, multi-tenant
 */

-- =====================================================
-- Table 1: economic_projects
-- =====================================================
CREATE TABLE IF NOT EXISTS economic_projects (
  project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('PRODUCT', 'SERVICE')),
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SIMULATED', 'VALIDATED', 'REJECTED')),
  current_version INTEGER DEFAULT 0,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  validated_by VARCHAR(255),
  validated_at TIMESTAMP,
  rejected_by VARCHAR(255),
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  
  CONSTRAINT uq_project_name_tenant UNIQUE (tenant_id, name)
);

COMMENT ON TABLE economic_projects IS 'Projets économiques (produits/services) - Aggregate Root';
COMMENT ON COLUMN economic_projects.status IS 'DRAFT → SIMULATED → VALIDATED/REJECTED';
COMMENT ON COLUMN economic_projects.current_version IS 'Dernière version de structure de coûts';

-- =====================================================
-- Table 2: cost_structure_versions
-- =====================================================
CREATE TABLE IF NOT EXISTS cost_structure_versions (
  id SERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES economic_projects(project_id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FROZEN')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  frozen_by VARCHAR(255),
  frozen_at TIMESTAMP,
  
  -- Assumptions (nullable until defined)
  price_target NUMERIC(15,2),
  expected_volume NUMERIC(15,2),
  capacity_max NUMERIC(15,2),
  scenario_pessimistic NUMERIC(15,2),
  scenario_realistic NUMERIC(15,2),
  scenario_optimistic NUMERIC(15,2),
  
  -- Simulation results (nullable until simulated)
  unit_cost NUMERIC(15,2),
  total_cost NUMERIC(15,2),
  gross_margin NUMERIC(8,4),
  net_margin NUMERIC(8,4),
  margin_at_70 NUMERIC(8,4),
  viable_at_70 BOOLEAN,
  simulated_at TIMESTAMP,
  
  CONSTRAINT uq_project_version UNIQUE (project_id, version)
);

COMMENT ON TABLE cost_structure_versions IS 'Versions de structures de coûts - Versionné, FROZEN = immutable';
COMMENT ON COLUMN cost_structure_versions.status IS 'DRAFT (modifiable) → FROZEN (immutable)';
COMMENT ON COLUMN cost_structure_versions.margin_at_70 IS 'Test 70% - COUT-01 invariant';

-- =====================================================
-- Table 3: cost_lines
-- =====================================================
CREATE TABLE IF NOT EXISTS cost_lines (
  id SERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES economic_projects(project_id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('VARIABLE', 'FIXED', 'INDIRECT')),
  label VARCHAR(255) NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  allocation_rule TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  FOREIGN KEY (project_id, version) REFERENCES cost_structure_versions(project_id, version) ON DELETE CASCADE
);

COMMENT ON TABLE cost_lines IS 'Lignes de coût par version - Append-only';
COMMENT ON COLUMN cost_lines.category IS 'VARIABLE (matières), FIXED (salaires), INDIRECT (overhead)';
COMMENT ON COLUMN cost_lines.amount IS 'Montant > 0 (COUT-CS-02)';

-- =====================================================
-- Table 4: decision_records (audit)
-- =====================================================
CREATE TABLE IF NOT EXISTS decision_records (
  id SERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES economic_projects(project_id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  decision VARCHAR(50) NOT NULL CHECK (decision IN ('VALIDATED', 'REJECTED')),
  decided_by VARCHAR(255) NOT NULL,
  decided_at TIMESTAMP NOT NULL DEFAULT NOW(),
  justification TEXT,
  
  FOREIGN KEY (project_id, version) REFERENCES cost_structure_versions(project_id, version) ON DELETE CASCADE
);

COMMENT ON TABLE decision_records IS 'Décisions humaines finales - Audit trail';
COMMENT ON COLUMN decision_records.decision IS 'VALIDATED (GO) ou REJECTED (NO GO)';

-- =====================================================
-- Indexes de performance
-- =====================================================
CREATE INDEX idx_economic_projects_tenant ON economic_projects(tenant_id);
CREATE INDEX idx_economic_projects_status ON economic_projects(status);
CREATE INDEX idx_economic_projects_tenant_status ON economic_projects(tenant_id, status);

CREATE INDEX idx_cost_structure_versions_project ON cost_structure_versions(project_id);
CREATE INDEX idx_cost_structure_versions_project_version ON cost_structure_versions(project_id, version);
CREATE INDEX idx_cost_structure_versions_status ON cost_structure_versions(status);

CREATE INDEX idx_cost_lines_project_version ON cost_lines(project_id, version);
CREATE INDEX idx_cost_lines_category ON cost_lines(category);

CREATE INDEX idx_decision_records_project ON decision_records(project_id);
CREATE INDEX idx_decision_records_decided_at ON decision_records(decided_at);

-- =====================================================
-- Row Level Security (RLS) - Multi-tenant
-- =====================================================

-- Enable RLS
ALTER TABLE economic_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_structure_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_records ENABLE ROW LEVEL SECURITY;

-- Policies: tenant isolation
CREATE POLICY tenant_isolation_economic_projects
ON economic_projects
USING (tenant_id = current_setting('app.tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_cost_structure_versions
ON cost_structure_versions
USING (
  project_id IN (
    SELECT project_id FROM economic_projects 
    WHERE tenant_id = current_setting('app.tenant_id', true)::UUID
  )
);

CREATE POLICY tenant_isolation_cost_lines
ON cost_lines
USING (
  project_id IN (
    SELECT project_id FROM economic_projects 
    WHERE tenant_id = current_setting('app.tenant_id', true)::UUID
  )
);

CREATE POLICY tenant_isolation_decision_records
ON decision_records
USING (
  project_id IN (
    SELECT project_id FROM economic_projects 
    WHERE tenant_id = current_setting('app.tenant_id', true)::UUID
  )
);

-- =====================================================
-- Trigger: Update current_version on freeze
-- =====================================================
CREATE OR REPLACE FUNCTION update_project_current_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'FROZEN' AND OLD.status = 'DRAFT' THEN
    UPDATE economic_projects
    SET current_version = NEW.version
    WHERE project_id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_current_version
AFTER UPDATE ON cost_structure_versions
FOR EACH ROW
WHEN (NEW.status = 'FROZEN' AND OLD.status = 'DRAFT')
EXECUTE FUNCTION update_project_current_version();

COMMENT ON FUNCTION update_project_current_version IS 'Mise à jour automatique de current_version lors du freeze';
