# 📊 ANALYSE - MODULE OBJECTIFS STRATÉGIQUES

**Date**: 25 Janvier 2026  
**Phase**: Module Objectifs - Intelligence Stratégique  
**Status**: 🔍 Analyse en cours

---

## 1. ANALYSE ARCHITECTURE EXISTANTE SPOFE

### A. Conventions Confirmées ✅

```
DATABASE (MySQL):
├─ Snake_case: companie_id, journal_entry_id, chart_of_account_id
├─ Timestamps: created_at, updated_at (TIMESTAMP)
├─ IDs: INT AUTO_INCREMENT ou UUID
├─ Enums: ENUM('val1', 'val2')
├─ JSON fields: Acceptés (role_approval_workflow.approvers_list)
└─ Foreign Keys: CONSTRAINT FK_parent_child FOREIGN KEY

JAVASCRIPT:
├─ camelCase: compagnieId, journalEntryId, chartOfAccountId
├─ DTO Transformer: snake_case ↔ camelCase automatique
├─ Joi Schemas: Validation en JS avec camelCase
└─ Models: PascalCase (User, Compagnie, JournalEntry)
```

### B. Stack Technologique Exploitable ✅

```
ORM: Sequelize 6.37.7 ✅
├─ Associations: hasMany, belongsTo, hasOne
├─ Hooks: beforeCreate, beforeUpdate, afterCreate, afterDestroy
├─ Validations: Model-level + DB constraints
└─ Transactions: Disponibles pour opérations multi-tables

Logging: Winston ✅
├─ logInfo, logError, logSecurity
├─ Outputs: combined.log, error.log, security.log
└─ Contexte user_id, action, timestamp

Validation: Joi 17.11.0 ✅
├─ 30+ schemas existants
├─ Patterns: Email, SIRET, IBAN, dates ISO
└─ Reusable constraints

Audit: AuditTrail.model.js ✅
├─ Suivi complet des changements
├─ Entity_name, entity_id, action, old_values, new_values
└─ user_id, timestamp
```

### C. Modèles Existants Pertinents ✅

```
User.model.js (313 lines)
├─ Fields: id, username, email, password, role, isActive
├─ Relations: hasMany(Role), hasMany(GroupeEntreprise)
└─ Hooks: bcrypt hashing, audit trail

Compagnie.model.js
├─ Fields: id, siret, nom, devise, dateCreation
├─ Relations: hasMany(JournalEntry), hasMany(ChartOfAccount)
└─ Hooks: SIRET validation, devise auto-set

Role.model.js
├─ 7 system roles: ADMIN, SUPER_UTILISATEUR, UTILISATEUR, etc.
├─ Permissions model in JSON
└─ Hooks: System role protection

AuditTrail.model.js
├─ Suivi complet: entity_name, old_values, new_values
└─ Query-able par user_id, entity_id, timestamp
```

### D. Chemins d'Intégration Requérants ✅

```
Models/ ← Créer ici:
├─ strategicObjective.model.js (400L)
├─ performanceIndicator.model.js (300L)
├─ objectiveAction.model.js (250L)
└─ externalDataSource.model.js (200L)

Controllers/
├─ objectives.controller.js (500L)
├─ indicators.controller.js (400L)
└─ strategicAI.controller.js (600L)

Utils/
├─ strategicAIEngine.js (800L)
├─ objectiveAccountingIntegration.js (400L)
├─ intelligentAlerts.js (500L)
└─ intelligentReporting.js (400L)

Routes/
├─ objectives.routes.js
├─ indicators.routes.js
└─ strategicAI.routes.js

Validators/
└─ objectiveSchemas.js (400L)

Tests/
├─ objectives.e2e.test.js (800L)
├─ strategicAI.e2e.test.js (700L)
└─ objectiveAccounting.e2e.test.js (600L)
```

---

## 2. DESIGN DES TABLES - RESPECT CONVENTIONS SPOFE

### A. Strategic Objectives Table ✅

```sql
CREATE TABLE strategic_objectives (
  -- Identifiant principal
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Hiérarchie et contexte
  compagnie_id INT NOT NULL,
  parent_objective_id INT NULL,  -- Self-reference pour hiérarchie
  
  -- Qualification
  niveau ENUM('strategique', 'tactique', 'operationnel') NOT NULL,
  type ENUM('vente', 'production', 'rh', 'finance', 'innovation', 'qualite', 'durabilite') NOT NULL,
  
  -- Description
  titre VARCHAR(255) NOT NULL,
  description TEXT NULL,
  
  -- Métriques cibles
  valeur_cible DECIMAL(15,2) NOT NULL,
  unite VARCHAR(50) NOT NULL,  -- 'EUR', 'KG', '%', 'unites'
  direction ENUM('maximiser', 'minimiser', 'atteindre') NOT NULL,
  
  -- Périodicité
  periode_type ENUM('quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel') NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  
  -- Responsabilités
  responsable_user_id INT NOT NULL,
  co_responsables_ids JSON NULL,  -- ['user_id1', 'user_id2']
  
  -- Suivi de progression
  statut ENUM('nouveau', 'en_cours', 'atteint', 'en_retard', 'abandonne') DEFAULT 'nouveau',
  progression DECIMAL(5,2) DEFAULT 0.00,  -- 0-100%
  
  -- IA & Prédictions
  probabilite_atteinte DECIMAL(5,2) NULL,  -- 0-100% prédit
  facteurs_risques JSON NULL,  -- [{facteur, impact, mitigation}]
  recommandations_ia JSON NULL,  -- Textes recommandations IA
  
  -- Timestamps et tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,  -- Soft-delete pattern
  
  -- Indexes
  INDEX idx_compagnie_id (compagnie_id),
  INDEX idx_responsable_user_id (responsable_user_id),
  INDEX idx_statut (statut),
  INDEX idx_date_fin (date_fin),
  
  -- Foreign Keys
  CONSTRAINT fk_strategic_objectives_compagnie 
    FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  CONSTRAINT fk_strategic_objectives_parent 
    FOREIGN KEY (parent_objective_id) REFERENCES strategic_objectives(id) ON DELETE CASCADE,
  CONSTRAINT fk_strategic_objectives_responsable 
    FOREIGN KEY (responsable_user_id) REFERENCES users(id) ON DELETE RESTRICT
);
```

### B. Performance Indicators Table ✅

```sql
CREATE TABLE performance_indicators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Lien objectif
  strategic_objective_id INT NOT NULL,
  
  -- Définition KPI
  nom VARCHAR(100) NOT NULL,
  formule TEXT NULL,  -- 'ventes_brutes / couts_production'
  source_donnee ENUM('comptable', 'crm', 'production', 'externe') NOT NULL,
  frequence_mesure ENUM('horaire', 'quotidien', 'hebdomadaire', 'mensuel') NOT NULL,
  
  -- Historique des valeurs
  valeurs_historiques JSON DEFAULT '{}',  -- {date: valeur, ...}
  tendance ENUM('hausse', 'baisse', 'stable') NULL,
  variation_percent DECIMAL(8,2) NULL,
  
  -- Seuils d'alerte (Traffic Light)
  seuil_vert DECIMAL(15,2) NULL,
  seuil_jaune DECIMAL(15,2) NULL,
  seuil_rouge DECIMAL(15,2) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_strategic_objective_id (strategic_objective_id),
  
  CONSTRAINT fk_performance_indicators_objective
    FOREIGN KEY (strategic_objective_id) REFERENCES strategic_objectives(id) ON DELETE CASCADE
);
```

### C. Objective Actions Table ✅

```sql
CREATE TABLE objective_actions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Lien objectif
  strategic_objective_id INT NOT NULL,
  
  -- Description action
  description TEXT NOT NULL,
  statut ENUM('a_faire', 'en_cours', 'termine', 'bloque') DEFAULT 'a_faire',
  priorite ENUM('critique', 'haute', 'moyenne', 'basse') DEFAULT 'moyenne',
  
  -- Planification
  date_echeance DATE NOT NULL,
  date_debut_planifiee DATE NULL,
  
  -- Ressources
  cout_estime DECIMAL(15,2) NULL,
  ressources_requises JSON NULL,  -- [{type: 'personnel', quantite: 2, ...}]
  
  -- IA
  difficulte_estimee INT CHECK (difficulte_estimee BETWEEN 1 AND 5),
  impact_estime DECIMAL(5,2) NULL,  -- 0-100%
  dependances_ids JSON NULL,  -- ['action_id1', 'action_id2']
  
  -- Assignation
  assignee_user_id INT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_strategic_objective_id (strategic_objective_id),
  INDEX idx_statut (statut),
  INDEX idx_date_echeance (date_echeance),
  
  CONSTRAINT fk_objective_actions_objective
    FOREIGN KEY (strategic_objective_id) REFERENCES strategic_objectives(id) ON DELETE CASCADE,
  CONSTRAINT fk_objective_actions_assignee
    FOREIGN KEY (assignee_user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### D. External Data Sources Table ✅

```sql
CREATE TABLE external_data_sources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Provenance
  type ENUM('sectoriel', 'economique', 'meteo', 'marche', 'concurrence') NOT NULL,
  source VARCHAR(100) NOT NULL,  -- 'BCEAO', 'ANSD', 'WeatherAPI', 'IMF'
  
  -- Géographie et domaine
  pays_code VARCHAR(2) NULL,  -- 'SN', 'CI', 'BJ', 'ML'
  region VARCHAR(100) NULL,
  indicateur VARCHAR(100) NOT NULL,  -- 'inflation', 'agriculture_croissance'
  
  -- Données
  valeur JSON NOT NULL,  -- {periode: valeur, ...} ou {metrique: {2024: X, 2025: Y}}
  date_maj DATE NOT NULL,
  
  -- Qualité source
  fiabilite INT CHECK (fiabilite BETWEEN 1 AND 5) DEFAULT 3,  -- 1-5 stars
  source_url VARCHAR(500) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type_source (type, source),
  INDEX idx_date_maj (date_maj)
);
```

---

## 3. DESIGN MODÈLES SEQUELIZE - COHÉRENCE SPOFE

### A. StrategicObjective.model.js ✅

**Hooks Implémentés**:
- `beforeCreate`: Validation date_fin > date_debut, responsable existe, statut='nouveau'
- `beforeUpdate`: État machine pour statut, auto-calculation progression si atteint
- `afterCreate`: Audit trail, création KPI par défaut si nécessaire

**Associations**:
- belongsTo(Compagnie)
- belongsTo(User, as: 'responsable')
- hasMany(PerformanceIndicator)
- hasMany(ObjectiveAction)
- hasMany(StrategicObjective, as: 'children', foreignKey: 'parent_objective_id')
- belongsTo(StrategicObjective, as: 'parent', foreignKey: 'parent_objective_id')

### B. PerformanceIndicator.model.js ✅

**Hooks**:
- `beforeCreate`: Validation formule syntaxe, source_donnee compatible
- `beforeUpdate`: Calcul tendance si valeurs_historiques changent

### C. ObjectiveAction.model.js ✅

**Hooks**:
- `beforeCreate`: Validation dependances (actions existent)
- `beforeUpdate`: État machine statut, check date_echeance valide

### D. ExternalDataSource.model.js ✅

**Hooks**:
- `beforeCreate`: Validation format valeur JSON
- beforeUpdate: Log changement source fiabilite

---

## 4. INTÉGRATIONS CLÉS

### A. Avec Comptabilité ✅

```
Quand: ObjectiveAction.statut === 'en_cours'
Créer: ChartOfAccount analytique 'Objectif-XXX'
Suivi: Intégrer dépenses réelles aux écritures JournalEntryLine
Alert: Si écart >20% vs budget estimé
```

### B. Avec Audit Trail ✅

```
- Chaque création/modification objectif → AuditTrail
- Tracking progression pour tendance
- Alert push vers dashboard exécutif
```

### C. Avec Rôles & Permissions ✅

```
- ADMIN: Tous les objectifs
- SUPER_UTILISATEUR: Objectifs de sa compagnie
- UTILISATEUR: Objectifs assignés
- CONSULTANT: Lecture seule
```

---

## 5. MODULES IA À CRÉER

```
strategicAIEngine.js (800L):
├─ GoalAchievementPredictor: Prédiction atteinte
├─ SmartGoalRecommender: Suggestion SMART
├─ CorrelationAnalyzer: Analyse KPI correlations
├─ AnomalyDetector: Détection anomalies performance
└─ ResourceOptimizer: Optimisation ressources

objectiveAccountingIntegration.js (400L):
├─ linkSalesGoalToAccounting()
├─ analyzeFinancialImpact()
└─ reconciliateWithActuals()

intelligentAlerts.js (500L):
├─ monitorObjectives()
├─ sendSmartAlert()
└─ detectDeviation()

intelligentReporting.js (400L):
├─ generateStrategicReport()
├─ generateSectorBenchmarkReport()
└─ createVisualizations()
```

---

## 6. CONTROLLERS & ENDPOINTS

```
POST /api/objectives - Créer objectif
GET /api/objectives - Lister objectifs (avec filtres)
GET /api/objectives/:id - Détail objectif
PATCH /api/objectives/:id - Modifier objectif
DELETE /api/objectives/:id - Archiver objectif (soft-delete)

POST /api/objectives/:id/actions - Créer action
PATCH /api/objectives/:id/actions/:actionId - Modifier action
PUT /api/objectives/:id/actions/:actionId/status - Changer statut action

GET /api/objectives/:id/indicators - KPIs de l'objectif
POST /api/objectives/:id/indicators - Ajouter KPI

-- INTELLIGENCE ARTIFICIELLE
POST /api/objectives/:id/ai/predict - Prédiction atteinte
POST /api/objectives/:id/ai/recommend-actions - Recommandations IA
GET /api/objectives/ai/dashboard-insights - Vue synthétique IA
GET /api/objectives/:id/ai/risk-analysis - Analyse risques

-- REPORTING
GET /api/objectives/:id/reports - Générer rapport
GET /api/objectives/reports/sector-benchmark - Benchmark secteur
```

---

## 7. STRATÉGIE NON-DESTRUCTRICE

```
✅ Soft-delete: deleted_at NULL
✅ Audit trail: Toutes modifications tracées
✅ No cascade delete: Statut 'abandonne' plutôt que suppression
✅ Backward compatible: Nouvelles colonnes nullable
✅ Transactions: Multi-table ops sécurisées
✅ Rollback ready: Test data cleanup automatique
```

---

## 📊 RÉSUMÉ IMPLÉMENTATION

```
Fichiers à créer: 15
├─ Migrations: 1 (4 tables)
├─ Models: 4
├─ Controllers: 3
├─ Services: 4 (IA modules)
├─ Routes: 3
├─ Validators: 1 (Joi schemas)
├─ Tests: 3 (E2E suites)
└─ Documentation: 1

Lignes de code: ~8,500
├─ Models: 1,200L
├─ Controllers: 1,500L
├─ Services/AI: 2,100L
├─ Routes: 400L
├─ Validators: 400L
└─ Tests: 2,900L

Temps estimé: 6 heures
├─ Migrations & Models: 1h
├─ Controllers & Routes: 1h
├─ IA Services: 2h
├─ Tests: 1.5h
└─ Documentation & Validation: 0.5h
```

---

**PRÊT POUR IMPLÉMENTATION** ✅

Procédure:
1. ✅ Analyse complète (DONE)
2. → Créer migrations SQL
3. → Implémenter models Sequelize
4. → Créer controllers & routes
5. → Implémenter IA services
6. → Tests E2E
7. → Documentation finale
