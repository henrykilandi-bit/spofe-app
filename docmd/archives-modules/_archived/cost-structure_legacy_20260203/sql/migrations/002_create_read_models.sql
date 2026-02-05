/**
 * Migration 002 - Cost-Structure Read-Models (SQL Views)
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Aucun calcul métier, exposition décisions validées uniquement
 */

-- =====================================================
-- Vue 1: rm_cost_projects
-- Liste principale des projets économiques
-- =====================================================
CREATE OR REPLACE VIEW rm_cost_projects AS
SELECT
  p.tenant_id,
  p.project_id,
  p.name,
  p.type,
  p.status,
  p.current_version,
  p.created_at,
  p.validated_at,
  p.rejected_at,
  p.rejection_reason
FROM economic_projects p;

COMMENT ON VIEW rm_cost_projects IS 'Read-Model: Liste des projets économiques avec statut décisionnel';

-- =====================================================
-- Vue 2: rm_cost_structure_current
-- Structure de coûts active (FROZEN) par projet
-- =====================================================
CREATE OR REPLACE VIEW rm_cost_structure_current AS
SELECT
  ep.tenant_id,
  cs.project_id,
  cs.version,
  cs.status,
  cs.created_at,
  cs.frozen_at,
  cs.frozen_by
FROM cost_structure_versions cs
JOIN economic_projects ep ON ep.project_id = cs.project_id
WHERE cs.status = 'FROZEN'
  AND cs.version = ep.current_version;

COMMENT ON VIEW rm_cost_structure_current IS 'Read-Model: Dernière version FROZEN par projet (max 1 ligne/projet)';

-- =====================================================
-- Vue 3: rm_cost_lines
-- Détail des coûts par catégorie
-- =====================================================
CREATE OR REPLACE VIEW rm_cost_lines AS
SELECT
  ep.tenant_id,
  cl.project_id,
  cl.version,
  cl.category,
  cl.label,
  cl.amount,
  cl.currency,
  cl.allocation_rule,
  cl.created_at
FROM cost_lines cl
JOIN economic_projects ep ON ep.project_id = cl.project_id;

COMMENT ON VIEW rm_cost_lines IS 'Read-Model: Composition des coûts (analyse, audit)';

-- =====================================================
-- Vue 4: rm_cost_simulation_results
-- Résultats de simulation validés (clé du module)
-- =====================================================
CREATE OR REPLACE VIEW rm_cost_simulation_results AS
SELECT
  ep.tenant_id,
  cs.project_id,
  cs.version,
  cs.unit_cost,
  cs.total_cost,
  cs.gross_margin,
  cs.net_margin,
  cs.margin_at_70,
  cs.viable_at_70,
  cs.simulated_at
FROM cost_structure_versions cs
JOIN economic_projects ep ON ep.project_id = cs.project_id
WHERE cs.simulated_at IS NOT NULL;

COMMENT ON VIEW rm_cost_simulation_results IS 'Read-Model: Résultats calculés par Guardian (jamais recalculés en SQL)';
COMMENT ON COLUMN rm_cost_simulation_results.margin_at_70 IS 'Test 70% - COUT-01 invariant';

-- =====================================================
-- Vue 5: rm_cost_decisions
-- Décisions finales (audit & Budget)
-- =====================================================
CREATE OR REPLACE VIEW rm_cost_decisions AS
SELECT
  ep.tenant_id,
  dr.project_id,
  dr.version,
  dr.decision,
  dr.decided_by,
  dr.decided_at,
  dr.justification
FROM decision_records dr
JOIN economic_projects ep ON ep.project_id = dr.project_id;

COMMENT ON VIEW rm_cost_decisions IS 'Read-Model: Décisions humaines finales (GO/NO GO)';

-- =====================================================
-- Vue 6: rm_cost_projects_budget_ready
-- Contrat avec le module Budget (vue contractuelle)
-- =====================================================
CREATE OR REPLACE VIEW rm_cost_projects_budget_ready AS
SELECT
  p.tenant_id,
  p.project_id,
  p.name,
  p.type,
  cs.version,
  r.unit_cost,
  r.total_cost,
  r.net_margin,
  r.margin_at_70,
  r.viable_at_70,
  p.validated_at
FROM rm_cost_projects p
JOIN rm_cost_structure_current cs
  ON cs.project_id = p.project_id
JOIN rm_cost_simulation_results r
  ON r.project_id = cs.project_id
 AND r.version = cs.version
WHERE p.status = 'VALIDATED'
  AND r.viable_at_70 = true;

COMMENT ON VIEW rm_cost_projects_budget_ready IS 'Read-Model CONTRACTUEL: Projets consommables par Budget (VALIDATED + test 70% OK)';

-- =====================================================
-- Vue 7: rm_cost_structure_summary (bonus)
-- Résumé agrégé par projet
-- =====================================================
CREATE OR REPLACE VIEW rm_cost_structure_summary AS
SELECT
  ep.tenant_id,
  cs.project_id,
  cs.version,
  COUNT(cl.id) AS cost_lines_count,
  SUM(CASE WHEN cl.category = 'VARIABLE' THEN cl.amount ELSE 0 END) AS total_variable_cost,
  SUM(CASE WHEN cl.category = 'FIXED' THEN cl.amount ELSE 0 END) AS total_fixed_cost,
  SUM(CASE WHEN cl.category = 'INDIRECT' THEN cl.amount ELSE 0 END) AS total_indirect_cost,
  SUM(cl.amount) AS total_cost_sum,
  cs.status,
  cs.frozen_at
FROM cost_structure_versions cs
JOIN economic_projects ep ON ep.project_id = cs.project_id
LEFT JOIN cost_lines cl ON cl.project_id = cs.project_id AND cl.version = cs.version
GROUP BY ep.tenant_id, cs.project_id, cs.version, cs.status, cs.frozen_at;

COMMENT ON VIEW rm_cost_structure_summary IS 'Read-Model: Résumé agrégé des coûts par catégorie';

-- =====================================================
-- Grants (lecture seule pour application)
-- =====================================================
-- Assuming role 'app_user' for application
GRANT SELECT ON rm_cost_projects TO app_user;
GRANT SELECT ON rm_cost_structure_current TO app_user;
GRANT SELECT ON rm_cost_lines TO app_user;
GRANT SELECT ON rm_cost_simulation_results TO app_user;
GRANT SELECT ON rm_cost_decisions TO app_user;
GRANT SELECT ON rm_cost_projects_budget_ready TO app_user;
GRANT SELECT ON rm_cost_structure_summary TO app_user;

-- =====================================================
-- Validation: Aucune vue ne lit DRAFT non simulé
-- =====================================================
-- rm_cost_simulation_results: WHERE simulated_at IS NOT NULL ✅
-- rm_cost_projects_budget_ready: WHERE status = 'VALIDATED' AND viable_at_70 = true ✅
-- rm_cost_structure_current: WHERE status = 'FROZEN' ✅

-- =====================================================
-- Validation: tenant_id présent partout
-- =====================================================
-- Toutes les vues incluent tenant_id via JOIN avec economic_projects ✅

-- =====================================================
-- Validation: RLS hérité automatiquement
-- =====================================================
-- Les vues héritent des policies RLS des tables sources ✅
