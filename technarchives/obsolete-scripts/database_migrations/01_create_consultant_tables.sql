-- =============================================================
-- MIGRATION 01: Création Tables Consultants Multi-Groupes
-- Architecture Non-Destructive - Extension Fonctionnelle
-- =============================================================

-- 1. Extension Table Users (Non-Destructive)
-- Ajout des champs nécessaires pour les consultants et la hiérarchie
ALTER TABLE users 
ADD COLUMN hierarchy_level INT DEFAULT 99,
ADD COLUMN can_grant_permissions BOOLEAN DEFAULT false,
ADD COLUMN prenom VARCHAR(100) NULL,
ADD COLUMN nom VARCHAR(100) NULL,
ADD COLUMN telephone VARCHAR(20) NULL,
ADD COLUMN siret VARCHAR(14) NULL,
ADD COLUMN specialites JSON NULL,
ADD COLUMN tarif_horaire DECIMAL(10,2) NULL,
ADD COLUMN experience_years INT NULL;

-- 2. Extension Énumération Rôles (Non-Destructive)
-- Ajout des nouveaux rôles hiérarchiques tout en conservant les legacy
ALTER TABLE users 
MODIFY COLUMN role ENUM(
  'admin',           -- Niveau 1: Super Administrateur
  'super_utilisateur', -- Niveau 2: Admin Groupe  
  'utilisateur',     -- Niveau 3: Admin Compagnie
  'super_consultant', -- Niveau 4: Consultant Expert
  'consultant',      -- Niveau 5: Consultant
  'viewer',          -- Legacy: Lecture seule
  'accountant'       -- Legacy: Comptable
) DEFAULT 'utilisateur';

-- 3. Table: consultant_group_assignments
-- Gestion des affectations consultants ↔ groupes
CREATE TABLE consultant_group_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consultant_id INT NOT NULL,
  groupe_id INT NOT NULL,
  status ENUM('active', 'pending', 'suspended', 'terminated') DEFAULT 'pending',
  contract_type VARCHAR(50),         -- 'audit', 'coaching', 'expertise', 'accompagnement'
  contract_reference VARCHAR(100),   -- Référence contrat
  start_date DATE,
  end_date DATE,
  billing_rate DECIMAL(10,2),        -- Taux horaire/journalier
  created_by INT,                    -- Qui a créé l'affectation
  approved_by INT,                   -- Qui a approuvé
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_consultant_group (consultant_id, groupe_id),
  FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Table: consultant_company_access
-- Gestion des accès spécifiques consultants ↔ compagnies
CREATE TABLE consultant_company_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consultant_id INT NOT NULL,
  compagnie_id INT NOT NULL,
  groupe_id INT NOT NULL,            -- Redondant mais utile pour requêtes
  access_level ENUM('read', 'write', 'audit', 'review') DEFAULT 'read',
  specific_permissions JSON,         -- Permissions spécifiques
  reason TEXT,                       -- Raison de l'accès
  approved_by INT,                   -- Admin compagnie ou groupe
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_consultant_company (consultant_id, compagnie_id)
);

-- 5. Table: consulting_firms
-- Pour les cabinets comptables/organismes
CREATE TABLE consulting_firms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  siret VARCHAR(14) UNIQUE,
  type VARCHAR(50),                  -- 'cabinet_comptable', 'coaching', 'audit', 'expertise'
  adresse TEXT,
  contact_email VARCHAR(255),
  contact_telephone VARCHAR(20),
  website VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(500),
  created_by INT,                    -- User qui a créé l'organisme
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 6. Table: firm_consultants
-- Lien consultants ↔ cabinets
CREATE TABLE firm_consultants (
  consultant_id INT PRIMARY KEY,
  firm_id INT NOT NULL,
  position VARCHAR(100),             -- 'associé', 'salarié', 'collaborateur'
  join_date DATE,
  FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (firm_id) REFERENCES consulting_firms(id) ON DELETE CASCADE
);

-- 7. Table: role_approval_workflow
-- Workflow d'approbation hiérarchique
CREATE TABLE role_approval_workflow (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requested_role VARCHAR(50) NOT NULL,
  approver_role VARCHAR(50) NOT NULL,
  min_hierarchy_level INT,
  requires_group_creation BOOLEAN DEFAULT false,
  requires_company_creation BOOLEAN DEFAULT false,
  auto_approve_if_creator_has_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table: pending_role_approvals
-- Demandes d'approbation en attente
CREATE TABLE pending_role_approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_data JSON NOT NULL,           -- Données utilisateur soumises
  requested_role VARCHAR(50) NOT NULL,
  approver_role VARCHAR(50) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  requires_group BOOLEAN DEFAULT false,
  requires_company BOOLEAN DEFAULT false,
  requested_by INT,                  -- Qui a fait la demande
  approved_by INT,                   -- Qui a approuvé/rejeté
  approval_date TIMESTAMP NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Table: compagnie_permissions
-- Permissions granulaires par compagnie
CREATE TABLE compagnie_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  compagnie_id INT NOT NULL,
  permission VARCHAR(50) NOT NULL,   -- 'saisie.ecritures', 'validation.ecritures', etc.
  granted_by INT NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE KEY unique_user_compagnie_permission (user_id, compagnie_id, permission),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================
-- DONNÉES INITIALES
-- =============================================================

-- Configuration du workflow d'approbation hiérarchique
INSERT INTO role_approval_workflow (requested_role, approver_role, min_hierarchy_level, requires_group_creation, requires_company_creation, auto_approve_if_creator_has_role) VALUES
('super_utilisateur', 'admin', 1, true, false, false),
('utilisateur', 'super_utilisateur', 2, false, true, false),
('super_consultant', 'super_utilisateur', 3, false, false, false),
('consultant', 'super_utilisateur', 3, false, false, false);

-- Permissions par défaut pour Admin Compagnie
INSERT INTO compagnie_permissions (user_id, compagnie_id, permission, granted_by) 
SELECT u.id, c.id, 'manage_permissions', u.id
FROM users u 
JOIN compagnies c ON 1=1 
WHERE u.role = 'utilisateur'
LIMIT 10; -- Exemple: pour les 10 premiers utilisateurs

-- =============================================================
-- INDEXES OPTIMISÉS
-- =============================================================

-- Index pour performances consultant_group_assignments
CREATE INDEX idx_consultant_group_consultant ON consultant_group_assignments(consultant_id);
CREATE INDEX idx_consultant_group_groupe ON consultant_group_assignments(groupe_id);
CREATE INDEX idx_consultant_group_status ON consultant_group_assignments(status);

-- Index pour performances consultant_company_access
CREATE INDEX idx_consultant_company_consultant ON consultant_company_access(consultant_id);
CREATE INDEX idx_consultant_company_compagnie ON consultant_company_access(compagnie_id);
CREATE INDEX idx_consultant_company_groupe ON consultant_company_access(groupe_id);
CREATE INDEX idx_consultant_company_expires ON consultant_company_access(expires_at);

-- Index pour performances consulting_firms
CREATE INDEX idx_consulting_firms_type ON consulting_firms(type);
CREATE INDEX idx_consulting_firms_created_by ON consulting_firms(created_by);

-- Index pour performances pending_role_approvals
CREATE INDEX idx_pending_approvals_status ON pending_role_approvals(status);
CREATE INDEX idx_pending_approvals_approver ON pending_role_approvals(approver_role);

-- Index pour performances compagnie_permissions
CREATE INDEX idx_compagnie_permissions_user ON compagnie_permissions(user_id);
CREATE INDEX idx_compagnie_permissions_compagnie ON compagnie_permissions(compagnie_id);
CREATE INDEX idx_compagnie_permissions_active ON compagnie_permissions(is_active);

-- =============================================================
-- VUES UTILITAIRES
-- =============================================================

-- Vue: available_consultants
-- Pour la recherche et découverte de consultants
CREATE VIEW available_consultants AS
SELECT 
  u.id,
  u.prenom,
  u.nom,
  u.email,
  u.telephone,
  u.specialites,
  u.tarif_horaire,
  u.experience_years,
  u.role,
  u.created_at,
  cf.nom as firm_name,
  cf.type as firm_type,
  -- Nombre de groupes actifs
  (SELECT COUNT(*) 
   FROM consultant_group_assignments cga2 
   WHERE cga2.consultant_id = u.id AND cga2.status = 'active') as active_groups_count,
  -- Taux moyen par groupe
  (SELECT AVG(cga2.billing_rate) 
   FROM consultant_group_assignments cga2 
   WHERE cga2.consultant_id = u.id AND cga2.status = 'active' AND cga2.billing_rate IS NOT NULL) as avg_billing_rate
FROM users u
LEFT JOIN firm_consultants fc ON u.id = fc.consultant_id
LEFT JOIN consulting_firms cf ON fc.firm_id = cf.id
WHERE u.role IN ('super_consultant', 'consultant')
  AND u.is_active = true
GROUP BY u.id, cf.id;

-- Vue: consultant_group_summary
-- Résumé des affectations par groupe
CREATE VIEW consultant_group_summary AS
SELECT 
  cga.groupe_id,
  ge.nom as groupe_nom,
  COUNT(cga.consultant_id) as total_consultants,
  SUM(CASE WHEN cga.status = 'active' THEN 1 ELSE 0 END) as active_consultants,
  SUM(CASE WHEN cga.status = 'pending' THEN 1 ELSE 0 END) as pending_consultants,
  AVG(cga.billing_rate) as avg_billing_rate,
  GROUP_CONCAT(DISTINCT u.prenom, ' ', u.nom) as consultant_names
FROM consultant_group_assignments cga
JOIN users u ON cga.consultant_id = u.id
JOIN groupes_entreprises ge ON cga.groupe_id = ge.id
GROUP BY cga.groupe_id;

-- =============================================================
-- VALIDATION
-- =============================================================

-- Vérification que toutes les tables ont été créées
SELECT 
  TABLE_NAME as table_created,
  TABLE_COMMENT as description
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME IN (
    'consultant_group_assignments',
    'consultant_company_access', 
    'consulting_firms',
    'firm_consultants',
    'role_approval_workflow',
    'pending_role_approvals',
    'compagnie_permissions'
  )
ORDER BY TABLE_NAME;

-- Vérification que les colonnes ont été ajoutées à users
SELECT 
  COLUMN_NAME as column_added,
  DATA_TYPE as data_type,
  IS_NULLABLE as nullable,
  COLUMN_DEFAULT as default_value
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN (
    'hierarchy_level',
    'can_grant_permissions',
    'prenom',
    'nom',
    'telephone',
    'siret',
    'specialites',
    'tarif_horaire',
    'experience_years'
  )
ORDER BY COLUMN_NAME;

-- =============================================================
-- FIN DE MIGRATION
-- =============================================================

-- Notes importantes:
-- 1. Cette migration est NON-DESTRUCTIVE: elle ne supprime aucune donnée existante
-- 2. Les nouvelles colonnes sont NULLables pour compatibilité avec les données existantes
-- 3. Les rôles legacy ('viewer', 'accountant') sont conservés
-- 4. Les foreign keys assurent l'intégrité référentielle
-- 5. Les indexes optimisent les performances des requêtes consultants
-- 6. Les vues facilitent les rapports et la recherche
