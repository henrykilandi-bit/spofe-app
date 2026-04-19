/**
 * Read-Model: rm_cashflow_execution
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 1
 * Description: Exécution réelle de trésorerie depuis journal_entries
 */

CREATE OR REPLACE VIEW rm_cashflow_execution AS
SELECT
  tenant_id,
  product_id,
  date_trunc('month', occurred_at)::date AS period_date,
  SUM(amount) AS actual_amount
FROM journal_entries
WHERE deleted_at IS NULL
GROUP BY tenant_id, product_id, date_trunc('month', occurred_at);

-- Index recommandé pour performance
CREATE INDEX IF NOT EXISTS idx_journal_tenant_date
ON journal_entries (tenant_id, occurred_at) WHERE deleted_at IS NULL;

-- Commentaire pour documentation
COMMENT ON VIEW rm_cashflow_execution IS 'Read-model: Exécution réelle de trésorerie depuis les écritures comptables';
