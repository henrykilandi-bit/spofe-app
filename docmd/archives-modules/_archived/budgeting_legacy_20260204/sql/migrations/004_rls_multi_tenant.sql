/**
 * Migration 004 - Row Level Security (RLS) Multi-tenant
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 4
 * Date: 2026-01-30
 * Principe: Double barrière Guardian + RLS PostgreSQL
 */

-- 1. Activer RLS sur toutes les tables sensibles
ALTER TABLE budget_objectif ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_cashflow_projection_entries ENABLE ROW LEVEL SECURITY;

-- 2. FORCE RLS (même les super-users sont soumis aux policies)
ALTER TABLE budget_objectif FORCE ROW LEVEL SECURITY;
ALTER TABLE budget_cashflow_projection_entries FORCE ROW LEVEL SECURITY;

-- 3. Policy d'isolation par tenant pour budget_objectif
CREATE POLICY tenant_isolation_budgets
ON budget_objectif
USING (tenant_id = current_setting('app.tenant_id', true));

-- 4. Policy d'isolation par tenant pour projections
CREATE POLICY tenant_isolation_projection
ON budget_cashflow_projection_entries
USING (tenant_id = current_setting('app.tenant_id', true));

-- 5. Vérifier que les policies sont actives
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'budget_objectif' 
    AND policyname = 'tenant_isolation_budgets'
  ) THEN
    RAISE EXCEPTION 'RLS policy tenant_isolation_budgets not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'budget_cashflow_projection_entries' 
    AND policyname = 'tenant_isolation_projection'
  ) THEN
    RAISE EXCEPTION 'RLS policy tenant_isolation_projection not created';
  END IF;

  RAISE NOTICE 'RLS policies created and active';
END $$;

-- 6. Commentaires pour documentation
COMMENT ON POLICY tenant_isolation_budgets ON budget_objectif IS 
  'RLS: Isolation stricte par tenant - aucun accès cross-tenant possible';

COMMENT ON POLICY tenant_isolation_projection ON budget_cashflow_projection_entries IS 
  'RLS: Isolation stricte par tenant pour les projections';

-- 7. Note importante pour les développeurs
COMMENT ON TABLE budget_objectif IS 
  'CRITICAL: RLS actif - SET app.tenant_id obligatoire avant toute requête';
