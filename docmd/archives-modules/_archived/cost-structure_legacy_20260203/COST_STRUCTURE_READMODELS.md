# 📘 COST-STRUCTURE — READ-MODELS SQL
Spécification Contractuelle v1.0.0

---

## 1️⃣ Principes fondamentaux (non négociables)
- Read-models = SQL views uniquement
- Aucun calcul métier côté backend
- Aucune écriture depuis les read-models
- Multi-tenant obligatoire (`tenant_id`)
- Les read-models consomment uniquement les événements / états validés
- Les read-models ne décident rien, ils montrent ce qui a été décidé

---

## 2️⃣ Sources de données (write side)
Tables conceptuelles :
- economic_projects
- cost_structures
- cost_lines
- cost_assumptions
- cost_simulations
- decision_records

> Ces tables sont append-only ou versionnées
> Les vues ne lisent jamais de données DRAFT non simulées

---

## 3️⃣ Vue 1 — Projets économiques (liste principale)
**rm_cost_projects**

Objectif : Lister les projets économiques avec leur statut décisionnel.
```sql
CREATE VIEW rm_cost_projects AS
SELECT
  p.tenant_id,
  p.id            AS project_id,
  p.name,
  p.type,
  p.status,
  p.current_version,
  p.created_at,
  p.validated_at
FROM economic_projects p;
```
Usage : Liste des projets, filtrage GO / NO GO, point d’entrée UI

---

## 4️⃣ Vue 2 — Structure de coûts active (par projet)
**rm_cost_structure_current**

Objectif : Exposer la dernière version FROZEN d’un projet.
```sql
CREATE VIEW rm_cost_structure_current AS
SELECT
  cs.tenant_id,
  cs.project_id,
  cs.version,
  cs.status,
  cs.created_at,
  cs.frozen_at
FROM cost_structures cs
WHERE cs.status = 'FROZEN';
```
Règle : Une seule ligne par projet maximum

---

## 5️⃣ Vue 3 — Détail des coûts (lecture analytique)
**rm_cost_lines**

Objectif : Afficher la composition du coût par catégorie.
```sql
CREATE VIEW rm_cost_lines AS
SELECT
  cl.tenant_id,
  cl.project_id,
  cl.version,
  cl.category,
  cl.label,
  cl.amount,
  cl.allocation_rule
FROM cost_lines cl;
```
Usage : Analyse de structure, comparaison coûts fixes / variables, audit

---

## 6️⃣ Vue 4 — Résultats de simulation (clé du module)
**rm_cost_simulation_results**

Objectif : Exposer les résultats calculés et validés.
```sql
CREATE VIEW rm_cost_simulation_results AS
SELECT
  s.tenant_id,
  s.project_id,
  s.version,
  s.unit_cost,
  s.total_cost,
  s.gross_margin,
  s.net_margin,
  s.margin_at_70,
  s.viable_at_70,
  s.simulated_at
FROM cost_simulations s;
```
> Ces valeurs sont calculées côté Guardian / domaine. SQL ne fait que lire.

---

## 7️⃣ Vue 5 — Décisions finales (audit & Budget)
**rm_cost_decisions**

Objectif : Exposer la décision humaine finale.
```sql
CREATE VIEW rm_cost_decisions AS
SELECT
  d.tenant_id,
  d.project_id,
  d.version,
  d.decision,
  d.decided_by,
  d.decided_at,
  d.justification
FROM decision_records d;
```
Usage : Audit, Budget pre-check, historique des décisions

---

## 8️⃣ Vue 6 — Projets budgétables (contrat Budget)
**rm_cost_projects_budget_ready**

Objectif : Vue consommée par le module Budget.
```sql
CREATE VIEW rm_cost_projects_budget_ready AS
SELECT
  p.tenant_id,
  p.project_id,
  p.name,
  r.version,
  r.unit_cost,
  r.total_cost,
  r.net_margin,
  r.margin_at_70
FROM rm_cost_projects p
JOIN rm_cost_structure_current cs
  ON cs.project_id = p.project_id
JOIN rm_cost_simulation_results r
  ON r.project_id = cs.project_id
 AND r.version = cs.version
WHERE p.status = 'VALIDATED'
  AND r.viable_at_70 = true;
```
Règle contractuelle : Budget ne peut lire QUE cette vue.

---

## 9️⃣ Indexation obligatoire
Chaque table source DOIT avoir au minimum :
```sql
CREATE INDEX idx_cost_project_tenant
  ON economic_projects (tenant_id);

CREATE INDEX idx_cost_structure_project_version
  ON cost_structures (project_id, version);

CREATE INDEX idx_cost_simulation_project
  ON cost_simulations (project_id, version);
```

---

## 🔟 Sécurité multi-tenant (RLS)
Toutes les tables sources DOIVENT appliquer :
```sql
ALTER TABLE <table>
ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation
  ON <table>
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```
> Les vues héritent automatiquement de la sécurité.

---

## 1️⃣1️⃣ Ce que les read-models NE FONT PAS
- ❌ recalculer une marge
- ❌ décider GO / NO GO
- ❌ modifier une structure
- ❌ corriger une hypothèse
> Toute logique = Guardian / write-side

---

## 1️⃣2️⃣ Definition of Done — Read-Models
Les read-models sont conformes si :
- toutes les vues sont créées
- aucune vue ne lit de données DRAFT non simulées
- tenant_id présent partout
- RLS actif
- Budget consomme uniquement rm_cost_projects_budget_ready
