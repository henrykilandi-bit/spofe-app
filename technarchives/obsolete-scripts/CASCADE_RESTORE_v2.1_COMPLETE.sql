-- ============================================================
-- SPOFE v2.1 - SCRIPT DE RESTAURATION COMPLÈTE
-- ============================================================
-- Objectif: Migrer la BD existante vers SPOFE v2.1 conforme
-- 
-- Étapes:
-- 1. Créer tables manquantes
-- 2. Renommer/corriger tables existantes
-- 3. Ajouter colonnes manquantes
-- 4. Créer contraintes FK
-- 5. Migrer les données
-- ============================================================

USE spofe_v2_1;

-- ============================================================
-- PHASE 1: CRÉER LES TABLES MANQUANTES DE SÉCURITÉ & AUTH
-- ============================================================

-- 1.1 Table ROLES (référence pour User.role_id)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.2 Table GROUPES_ENTREPRISES (racine hiérarchique)
CREATE TABLE IF NOT EXISTS groupes_entreprises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  adresse VARCHAR(255),
  pays VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_groupe_nom (nom),
  INDEX idx_groupes_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.3 Table TWO_FACTOR_AUTH
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  secret VARCHAR(100) NOT NULL,
  backup_codes JSON,
  is_enabled BOOLEAN DEFAULT FALSE,
  last_verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_2fa_user (user_id),
  INDEX idx_2fa_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.4 Table PASSWORD_RESET_TOKENS
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_prt_token (token),
  INDEX idx_prt_user_id (user_id),
  INDEX idx_prt_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.5 Table TOKEN_BLACKLIST
CREATE TABLE IF NOT EXISTS token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  reason VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_token_blacklist (token),
  INDEX idx_tb_user_id (user_id),
  INDEX idx_tb_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1.6 Table SECURITY_EVENTS
CREATE TABLE IF NOT EXISTS security_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  status ENUM('success', 'failure', 'warning', 'info') DEFAULT 'info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_se_user_id (user_id),
  INDEX idx_se_event_type (event_type),
  INDEX idx_se_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PHASE 2: CRÉER TABLES ADMINISTRATIVES & CONFIG
-- ============================================================

-- 2.1 Table AUDIT_TRAIL
CREATE TABLE IF NOT EXISTS audit_trail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(100),
  changes JSON,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_audit_user_id (user_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.2 Table APP_SETTINGS
CREATE TABLE IF NOT EXISTS app_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupe_id INT NOT NULL,
  cle VARCHAR(255) NOT NULL,
  valeur LONGTEXT,
  scope ENUM('global', 'group', 'company', 'user') DEFAULT 'global',
  is_sensitive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_setting (groupe_id, cle),
  INDEX idx_app_settings_groupe (groupe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PHASE 3: CORRIGER & ENRICHIR TABLES EXISTANTES
-- ============================================================

-- 3.1 Migrer données COMPANIES → COMPAGNIES + ajouter colonnes
-- Créer nouvelle table compagnies
CREATE TABLE IF NOT EXISTS compagnies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupe_id INT NOT NULL,
  nom VARCHAR(255) NOT NULL,
  adresse VARCHAR(255),
  ville VARCHAR(100),
  pays VARCHAR(100),
  devise VARCHAR(50),
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_compagnie_nom (groupe_id, nom),
  INDEX idx_compagnie_groupe (groupe_id),
  INDEX idx_compagnie_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.2 Migrer données depuis companies (ancien nom)
INSERT INTO compagnies (groupe_id, nom, adresse, ville, pays, devise, created_at, updated_at)
SELECT 1, c.name, c.address, c.city, c.country, c.currency, c.created_at, c.updated_at
FROM companies c
ON DUPLICATE KEY UPDATE updated_at=VALUES(updated_at);

-- 3.3 Table CHARTS_OF_ACCOUNTS (renommée depuis chartsofaccounts)
CREATE TABLE IF NOT EXISTS charts_of_accounts (
  id CHAR(36) PRIMARY KEY,
  compagnie_id INT NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL,
  account_nature VARCHAR(50) NOT NULL,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  parent_account_id CHAR(36),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (parent_account_id) REFERENCES charts_of_accounts(id) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY uq_account_number (compagnie_id, account_number),
  INDEX idx_coa_compagnie (compagnie_id),
  INDEX idx_coa_type (account_type),
  INDEX idx_coa_nature (account_nature),
  INDEX idx_coa_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.4 Migrer données chartsofaccounts → charts_of_accounts
INSERT INTO charts_of_accounts (id, compagnie_id, account_number, account_name, account_type, account_nature, status, description, created_at, updated_at)
SELECT id, companyId, accountNumber, accountName, accountType, accountNature, 
       COALESCE(accountStatus, 'active'), description, createdAt, updatedAt
FROM chartsofaccounts
ON DUPLICATE KEY UPDATE updated_at=VALUES(updated_at);

-- 3.5 Enrichir table USERS avec colonnes manquantes
ALTER TABLE users ADD COLUMN groupe_id INT AFTER id;
ALTER TABLE users ADD COLUMN role_id INT AFTER groupe_id;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL AFTER is_active;
ALTER TABLE users ADD COLUMN FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE users ADD COLUMN FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE users ADD INDEX idx_users_groupe (groupe_id);
ALTER TABLE users ADD INDEX idx_users_role (role_id);

-- 3.6 Enrichir table JOURNAL_ENTRIES
ALTER TABLE journal_entries 
ADD COLUMN user_id INT AFTER compagnie_id,
ADD COLUMN submitted_by INT,
ADD COLUMN approved_by INT,
ADD COLUMN deleted_at TIMESTAMP NULL;

ALTER TABLE journal_entries
ADD FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE ON UPDATE CASCADE,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
ADD FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
ADD INDEX idx_je_user (user_id),
ADD INDEX idx_je_submitted_by (submitted_by),
ADD INDEX idx_je_approved_by (approved_by);

-- ============================================================
-- PHASE 4: CRÉER TABLE JOURNAL_ENTRY_LINES (CRITIQUE!)
-- ============================================================

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  journal_entry_id INT NOT NULL,
  account_id CHAR(36) NOT NULL,
  debit DECIMAL(15, 2) DEFAULT 0.00,
  credit DECIMAL(15, 2) DEFAULT 0.00,
  description VARCHAR(500),
  third_party_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (account_id) REFERENCES charts_of_accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_jel_entry (journal_entry_id),
  INDEX idx_jel_account (account_id),
  INDEX idx_jel_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PHASE 5: CRÉER TABLE ACCOUNT_BALANCES
-- ============================================================

CREATE TABLE IF NOT EXISTS account_balances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id CHAR(36) NOT NULL,
  compagnie_id INT NOT NULL,
  periode_start DATE NOT NULL,
  periode_end DATE NOT NULL,
  balance_opening DECIMAL(15, 2) DEFAULT 0.00,
  total_debit DECIMAL(15, 2) DEFAULT 0.00,
  total_credit DECIMAL(15, 2) DEFAULT 0.00,
  balance_closing DECIMAL(15, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES charts_of_accounts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_balance (account_id, compagnie_id, periode_start, periode_end),
  INDEX idx_ab_account (account_id),
  INDEX idx_ab_compagnie (compagnie_id),
  INDEX idx_ab_periode (periode_start, periode_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PHASE 6: INITIALISER DONNÉES DE BASE
-- ============================================================

-- 6.1 Insérer groupe d'entreprises par défaut
INSERT IGNORE INTO groupes_entreprises (id, nom, description) 
VALUES (1, 'Groupe Principal', 'Groupe par défaut');

-- 6.2 Insérer rôles standard
INSERT IGNORE INTO roles (id, name, description, permissions) 
VALUES 
  (1, 'admin', 'Administrateur système', JSON_OBJECT('all', true)),
  (2, 'comptable', 'Comptable', JSON_OBJECT('entries', true, 'statements', true)),
  (3, 'user', 'Utilisateur standard', JSON_OBJECT('view', true)),
  (4, 'viewer', 'Visualiseur', JSON_OBJECT('view', true));

-- 6.3 Mettre à jour users existants vers groupe 1 et rôles
UPDATE users SET groupe_id = 1 WHERE groupe_id IS NULL;
UPDATE users SET role_id = 1 WHERE role_id IS NULL;

-- ============================================================
-- PHASE 7: NETTOYER & FINALISER
-- ============================================================

-- 7.1 Créer index de performance supplémentaires
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_je_company_date ON journal_entries(compagnie_id, entry_date);
CREATE INDEX idx_je_status ON journal_entries(status);

-- 7.2 Vérifier intégrité référentielle
-- (À vérifier avec audit script)

-- ============================================================
-- FIN DE RESTAURATION - SUCCÈS
-- ============================================================

-- Afficher résumé
SELECT '✅ RESTAURATION COMPLÈTE DE SPOFE v2.1' AS status;
SELECT COUNT(*) as tables_creees FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'spofe_v2_1' AND TABLE_NAME NOT IN ('SequelizeMeta');
