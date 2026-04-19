/**
 * Schema SQL - Module Budget
 * Conformité: MODULE_BUDGET_CONTRACT.md
 * Principe: Append-only, Multi-tenant, RLS-ready
 */

-- Table principale: budget_objectif (write-model)
CREATE TABLE IF NOT EXISTS budget_objectif (
  id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_granularity VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  objectives JSONB NOT NULL DEFAULT '[]',
  sales_capacities JSONB NOT NULL DEFAULT '[]',
  cost_structures JSONB NOT NULL DEFAULT '[]',
  payment_terms JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMP,
  PRIMARY KEY (id, tenant_id)
);

-- Table pour les projections de trésorerie
CREATE TABLE IF NOT EXISTS budget_cashflow_projection_entries (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  budget_id VARCHAR(255) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  period_date DATE NOT NULL,
  projected_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (budget_id, tenant_id) REFERENCES budget_objectif(id, tenant_id)
);

-- Index pour performance multi-tenant
CREATE INDEX IF NOT EXISTS idx_budget_tenant_period 
  ON budget_objectif(tenant_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_budget_tenant_status 
  ON budget_objectif(tenant_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_projection_tenant_period 
  ON budget_cashflow_projection_entries(tenant_id, period_date);

CREATE INDEX IF NOT EXISTS idx_projection_budget 
  ON budget_cashflow_projection_entries(budget_id, tenant_id);

-- Contraintes métier
ALTER TABLE budget_objectif 
  ADD CONSTRAINT chk_status 
  CHECK (status IN ('DRAFT', 'VALIDATED', 'CLOSED'));

ALTER TABLE budget_objectif 
  ADD CONSTRAINT chk_period 
  CHECK (period_start < period_end);

-- Soft delete uniquement (append-only)
COMMENT ON COLUMN budget_objectif.deleted_at IS 'Soft delete timestamp - no physical DELETE allowed';
COMMENT ON COLUMN budget_objectif.version IS 'Optimistic locking version';

-- Permissions (à adapter selon vos rôles)
-- GRANT SELECT, INSERT, UPDATE ON budget_objectif TO app_user;
-- REVOKE DELETE ON budget_objectif FROM app_user;
