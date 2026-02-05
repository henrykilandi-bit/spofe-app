-- ─────────────────────────────────────────────────────────────
-- Cost-Structure Module — Write-Side Schema
-- Conformité: COST_STRUCTURE_CONTRACT v1.0.0
-- ─────────────────────────────────────────────────────────────

-- Create schema
CREATE SCHEMA IF NOT EXISTS coutflex;

-- ─────────────────────────────────────────────────────────────
-- Event Store (Append-Only)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coutflex.domain_events (
    event_id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(200) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Index for aggregate replay
    CONSTRAINT uk_event_order UNIQUE (tenant_id, aggregate_id, occurred_at, event_id)
);

-- Index for event streaming
CREATE INDEX IF NOT EXISTS idx_domain_events_tenant_type 
    ON coutflex.domain_events (tenant_id, event_type, occurred_at);

-- RLS
ALTER TABLE coutflex.domain_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY domain_events_tenant_isolation ON coutflex.domain_events
    USING (tenant_id = current_setting('app.tenant_id', true));

-- ─────────────────────────────────────────────────────────────
-- Economic Projects (Write-Side Projection)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coutflex.economic_projects (
    project_id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    project_type VARCHAR(20) NOT NULL CHECK (project_type IN ('PRODUCT', 'SERVICE')),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'SIMULATED', 'FROZEN', 'VALIDATED', 'REJECTED', 'APPROVED')),
    latest_version INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    validated_at TIMESTAMPTZ,
    validated_by VARCHAR(100),
    rejected_at TIMESTAMPTZ,
    rejected_by VARCHAR(100),
    
    -- COUT-EP-01: Unique name per tenant
    CONSTRAINT uk_project_name_tenant UNIQUE (tenant_id, name)
);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_projects_tenant_status 
    ON coutflex.economic_projects (tenant_id, status);

-- RLS
ALTER TABLE coutflex.economic_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_tenant_isolation ON coutflex.economic_projects
    USING (tenant_id = current_setting('app.tenant_id', true));

-- ─────────────────────────────────────────────────────────────
-- Cost Structures (Write-Side Projection)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coutflex.cost_structures (
    tenant_id VARCHAR(50) NOT NULL,
    project_id UUID NOT NULL REFERENCES coutflex.economic_projects(project_id),
    version INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'SIMULATED', 'FROZEN')),
    
    -- Assumptions
    price_target DECIMAL(15,2),
    expected_volume INTEGER,
    capacity_max INTEGER,
    scenarios JSONB,
    
    -- Simulation results
    total_cost DECIMAL(15,2),
    variable_cost_ratio DECIMAL(5,4),
    break_even_point INTEGER,
    margin_at_target DECIMAL(5,4),
    scenario_results JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL,
    simulated_at TIMESTAMPTZ,
    frozen_at TIMESTAMPTZ,
    frozen_by VARCHAR(100),
    
    PRIMARY KEY (tenant_id, project_id, version)
);

-- Index for version queries
CREATE INDEX IF NOT EXISTS idx_cost_structures_project 
    ON coutflex.cost_structures (tenant_id, project_id, version DESC);

-- RLS
ALTER TABLE coutflex.cost_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY cost_structures_tenant_isolation ON coutflex.cost_structures
    USING (tenant_id = current_setting('app.tenant_id', true));

-- ─────────────────────────────────────────────────────────────
-- Cost Lines
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coutflex.cost_lines (
    line_id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    project_id UUID NOT NULL,
    version INTEGER NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('VARIABLE', 'FIXED', 'INDIRECT')),
    label VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    allocation_rule VARCHAR(200),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (tenant_id, project_id, version) 
        REFERENCES coutflex.cost_structures(tenant_id, project_id, version)
);

-- Index for cost structure queries
CREATE INDEX IF NOT EXISTS idx_cost_lines_structure 
    ON coutflex.cost_lines (tenant_id, project_id, version);

-- Index for category aggregation
CREATE INDEX IF NOT EXISTS idx_cost_lines_category 
    ON coutflex.cost_lines (tenant_id, project_id, version, category);

-- RLS
ALTER TABLE coutflex.cost_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY cost_lines_tenant_isolation ON coutflex.cost_lines
    USING (tenant_id = current_setting('app.tenant_id', true));

-- ─────────────────────────────────────────────────────────────
-- Decision Records (Terminal Decisions)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coutflex.decision_records (
    decision_id UUID PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    project_id UUID NOT NULL REFERENCES coutflex.economic_projects(project_id),
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('VALIDATE', 'REJECT', 'REVISE')),
    decided_by VARCHAR(100) NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    comments TEXT
);

-- Index for project decision lookup
CREATE INDEX IF NOT EXISTS idx_decisions_project 
    ON coutflex.decision_records (tenant_id, project_id, decided_at DESC);

-- RLS
ALTER TABLE coutflex.decision_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY decisions_tenant_isolation ON coutflex.decision_records
    USING (tenant_id = current_setting('app.tenant_id', true));

-- ─────────────────────────────────────────────────────────────
-- Invariant Enforcement Functions
-- ─────────────────────────────────────────────────────────────

-- COUT-CS-03: Prevent modification after freeze
CREATE OR REPLACE FUNCTION coutflex.check_not_frozen()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM coutflex.cost_structures 
        WHERE tenant_id = NEW.tenant_id 
          AND project_id = NEW.project_id 
          AND version = NEW.version 
          AND status = 'FROZEN'
    ) THEN
        RAISE EXCEPTION 'COUT-CS-03: Cannot modify frozen cost structure';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cost_lines_check_frozen
    BEFORE INSERT OR UPDATE ON coutflex.cost_lines
    FOR EACH ROW EXECUTE FUNCTION coutflex.check_not_frozen();

-- COUT-DEC-02: Prevent duplicate decisions
CREATE OR REPLACE FUNCTION coutflex.check_no_existing_decision()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM coutflex.decision_records 
        WHERE tenant_id = NEW.tenant_id 
          AND project_id = NEW.project_id
    ) THEN
        RAISE EXCEPTION 'COUT-DEC-02: Decision already recorded for this project';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decisions_check_duplicate
    BEFORE INSERT ON coutflex.decision_records
    FOR EACH ROW EXECUTE FUNCTION coutflex.check_no_existing_decision();

-- ─────────────────────────────────────────────────────────────
-- Grants
-- ─────────────────────────────────────────────────────────────

-- Application role (write access)
GRANT USAGE ON SCHEMA coutflex TO spofe_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA coutflex TO spofe_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA coutflex TO spofe_app;

-- Read-only role (for read-models)
GRANT USAGE ON SCHEMA coutflex TO spofe_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA coutflex TO spofe_readonly;
