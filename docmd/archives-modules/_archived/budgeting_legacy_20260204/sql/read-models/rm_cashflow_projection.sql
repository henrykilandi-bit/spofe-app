/**
 * Read-Model: rm_cashflow_projection
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 1
 * Description: Projections de trésorerie par produit et période
 */

CREATE OR REPLACE VIEW rm_cashflow_projection AS
SELECT
  tenant_id,
  budget_id,
  product_id,
  period_date,
  SUM(projected_amount) AS projected_amount
FROM budget_cashflow_projection_entries
GROUP BY tenant_id, budget_id, product_id, period_date;

-- Index recommandé pour performance
CREATE INDEX IF NOT EXISTS idx_proj_tenant_period
ON budget_cashflow_projection_entries (tenant_id, period_date);

-- Commentaire pour documentation
COMMENT ON VIEW rm_cashflow_projection IS 'Read-model: Projections de trésorerie agrégées par tenant, budget, produit et période';
