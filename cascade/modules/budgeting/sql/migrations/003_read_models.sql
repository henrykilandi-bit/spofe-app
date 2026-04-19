/**
 * Migration 003 - Read-models SQL
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 1
 * Date: 2026-01-30
 */

-- 1. Créer les 5 read-models
\i ../read-models/rm_cashflow_projection.sql
\i ../read-models/rm_cashflow_execution.sql
\i ../read-models/rm_cashflow_variance.sql
\i ../read-models/rm_cashflow_cumulative.sql
\i ../read-models/rm_liquidity_alerts.sql

-- 2. Vérifier que les vues sont créées
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'rm_cashflow_projection') THEN
    RAISE EXCEPTION 'View rm_cashflow_projection not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'rm_cashflow_execution') THEN
    RAISE EXCEPTION 'View rm_cashflow_execution not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'rm_cashflow_variance') THEN
    RAISE EXCEPTION 'View rm_cashflow_variance not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'rm_cashflow_cumulative') THEN
    RAISE EXCEPTION 'View rm_cashflow_cumulative not created';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'rm_liquidity_alerts') THEN
    RAISE EXCEPTION 'View rm_liquidity_alerts not created';
  END IF;
  
  RAISE NOTICE 'All 5 read-models created successfully';
END $$;

-- 3. Permissions (lecture seule pour app_user)
-- GRANT SELECT ON rm_cashflow_projection TO app_user;
-- GRANT SELECT ON rm_cashflow_execution TO app_user;
-- GRANT SELECT ON rm_cashflow_variance TO app_user;
-- GRANT SELECT ON rm_cashflow_cumulative TO app_user;
-- GRANT SELECT ON rm_liquidity_alerts TO app_user;
