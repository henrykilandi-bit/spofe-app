/**
 * Read-Model: rm_cashflow_cumulative
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 1
 * Description: Projections cumulées de trésorerie
 */

CREATE OR REPLACE VIEW rm_cashflow_cumulative AS
SELECT
  tenant_id,
  budget_id,
  product_id,
  period_date,
  projected_amount,
  SUM(projected_amount)
    OVER (
      PARTITION BY tenant_id, budget_id, product_id
      ORDER BY period_date
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_projected_amount
FROM rm_cashflow_projection;

-- Commentaire pour documentation
COMMENT ON VIEW rm_cashflow_cumulative IS 'Read-model: Projections cumulées de trésorerie avec window function';
