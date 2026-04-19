/**
 * Read-Model: rm_cashflow_variance
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 1
 * Description: Écarts entre projections et réalisations
 */

CREATE OR REPLACE VIEW rm_cashflow_variance AS
SELECT
  p.tenant_id,
  p.budget_id,
  p.product_id,
  p.period_date,
  p.projected_amount,
  COALESCE(e.actual_amount, 0) AS actual_amount,
  (COALESCE(e.actual_amount, 0) - p.projected_amount) AS variance,
  CASE
    WHEN COALESCE(e.actual_amount, 0) = 0 THEN 0
    ELSE ROUND(((COALESCE(e.actual_amount, 0) - p.projected_amount) / p.projected_amount * 100), 2)
  END AS variance_percentage
FROM rm_cashflow_projection p
LEFT JOIN rm_cashflow_execution e
  ON e.tenant_id = p.tenant_id
 AND e.product_id = p.product_id
 AND e.period_date = p.period_date;

-- Commentaire pour documentation
COMMENT ON VIEW rm_cashflow_variance IS 'Read-model: Écarts entre projections et réalisations avec pourcentage';
