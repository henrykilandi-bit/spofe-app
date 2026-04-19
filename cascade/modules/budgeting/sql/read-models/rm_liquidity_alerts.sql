/**
 * Read-Model: rm_liquidity_alerts
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 1
 * Description: Alertes de liquidité basées sur les projections
 */

CREATE OR REPLACE VIEW rm_liquidity_alerts AS
SELECT
  tenant_id,
  budget_id,
  period_date,
  SUM(projected_amount) AS projected_total,
  CASE
    WHEN SUM(projected_amount) < 0 THEN 'CRITICAL'
    WHEN SUM(projected_amount) < 1000 THEN 'WARNING'
    ELSE 'OK'
  END AS alert_level,
  CASE
    WHEN SUM(projected_amount) < 0 THEN 'Trésorerie négative prévue'
    WHEN SUM(projected_amount) < 1000 THEN 'Trésorerie faible prévue'
    ELSE 'Trésorerie saine'
  END AS alert_message
FROM rm_cashflow_projection
GROUP BY tenant_id, budget_id, period_date;

-- Commentaire pour documentation
COMMENT ON VIEW rm_liquidity_alerts IS 'Read-model: Alertes de liquidité avec niveaux CRITICAL/WARNING/OK';
