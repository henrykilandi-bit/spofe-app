-- =============================================================================
-- SPOFE v2.1 - Fix ThirdParty Table and Foreign Key Constraints
-- =============================================================================
-- Date: 21/01/2026
-- Database: spofe_v2_1
-- Purpose: Corriger les erreurs FK et créer la table third_parties
-- =============================================================================

USE spofe_v2_1;

-- =============================================================================
-- PHASE 1: Vérification et création de la table third_parties
-- =============================================================================

-- Option 1: Créer la table third_parties si elle n'existe pas
-- Cette table est nécessaire pour gérer les tiers (fournisseurs, clients, etc.)
CREATE TABLE IF NOT EXISTS third_parties (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identifiant unique du tiers',
  
  -- Informations de base
  name VARCHAR(255) NOT NULL COMMENT 'Nom du tiers',
  type ENUM('SUPPLIER', 'CUSTOMER', 'EMPLOYEE', 'OTHER') DEFAULT 'OTHER' COMMENT 'Type de tiers',
  
  -- Lien vers l'entreprise
  company_id INT NOT NULL COMMENT 'Référence à l\'entreprise propriétaire',
  groupe_id INT COMMENT 'Groupe d\'entreprises',
  
  -- Contact
  email VARCHAR(255) COMMENT 'Email du tiers',
  phone VARCHAR(20) COMMENT 'Téléphone du tiers',
  address VARCHAR(500) COMMENT 'Adresse du tiers',
  
  -- Données supplémentaires
  tax_number VARCHAR(50) COMMENT 'Numéro de taxe/TVA',
  account_number VARCHAR(50) COMMENT 'Compte comptable associé',
  
  -- Contrôle
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Actif ou inactif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Clés étrangères
  CONSTRAINT fk_third_parties_compagnie 
    FOREIGN KEY (company_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  
  CONSTRAINT fk_third_parties_groupe 
    FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE SET NULL,
  
  -- Index pour les recherches
  INDEX idx_third_parties_company_id (company_id),
  INDEX idx_third_parties_type (type),
  INDEX idx_third_parties_name (name),
  INDEX idx_third_parties_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Table des tiers (fournisseurs, clients, employés, etc.)';

-- =============================================================================
-- PHASE 2: Ajouter les colonnes de suivi si elles manquent
-- =============================================================================

-- Vérifier et ajouter company_group_id si le modèle Sequelize l'utilise
ALTER TABLE third_parties 
ADD COLUMN IF NOT EXISTS compagnie_groupe_id INT COMMENT 'Alias pour groupe_id' AFTER groupe_id;

-- =============================================================================
-- PHASE 3: Verifier les données existantes si la table avait des données
-- =============================================================================

-- Vérifier l'intégrité référentielle
-- Cette requête retourne les potentiels orphelins de FK
SELECT COUNT(*) as orphaned_records
FROM third_parties tp
LEFT JOIN compagnies c ON tp.company_id = c.id
WHERE c.id IS NULL AND tp.company_id IS NOT NULL;

-- =============================================================================
-- PHASE 4: Verification finale
-- =============================================================================

-- Afficher la structure de la table créée
DESCRIBE third_parties;

-- Afficher les contraintes FK
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'spofe_v2_1' 
  AND TABLE_NAME = 'third_parties'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =============================================================================
-- PHASE 5: Synchronisation avec les modèles Sequelize (optionnel)
-- =============================================================================

-- Si vous avez des données de tiers à importer depuis ailleurs, 
-- vous pouvez ajouter un INSERT ici:

-- INSERT INTO third_parties (name, type, company_id, groupe_id, is_active, created_at, updated_at)
-- SELECT ... FROM (source);

-- =============================================================================
-- RÉSUMÉ DES CHANGEMENTS
-- =============================================================================

/*
MODIFICATIONS APPLIQUÉES:

1. ✅ Création de la table third_parties
   - Colonne: id (PK AUTO_INCREMENT)
   - Colonne: name (VARCHAR 255, NOT NULL)
   - Colonne: type (ENUM: SUPPLIER, CUSTOMER, EMPLOYEE, OTHER)
   - Colonne: company_id (FK → compagnies.id)
   - Colonne: groupe_id (FK → groupes_entreprises.id)
   - Colonnes supplémentaires: email, phone, address, tax_number, account_number
   - Colonnes de contrôle: is_active, created_at, updated_at

2. ✅ Contraintes de clé étrangère
   - FK vers compagnies (ON DELETE CASCADE)
   - FK vers groupes_entreprises (ON DELETE SET NULL)

3. ✅ Index de performance
   - Index sur company_id
   - Index sur type
   - Index sur name
   - Index sur is_active

4. ✅ Collation UTF-8
   - Support complet des caractères accentués

PROCHAINES ÉTAPES:

1. Exécuter ce script sur la BD:
   mysql -u root < fix-thirdparty-fk.sql

2. Vérifier le modèle Sequelize (cascade/src/models/thirdParty.model.js)

3. Exécuter les tests:
   npm run test

4. Si les tests passent, les FK et structures sont correctes!
*/

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================
