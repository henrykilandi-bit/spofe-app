/**
 * Migration: 000-snapshot-current-state
 * Snapshot de l'état réel de la BD au 21/01/2026
 * Crée les tables manquantes et nettoie les FK brisées
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=0;');

  try {
    // 1. CRÉER TABLE COMPANIES (manquante mais référencée par journal_entries)
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        registrationNumber VARCHAR(255) NOT NULL UNIQUE,
        taxId VARCHAR(255),
        address TEXT,
        city VARCHAR(255),
        postalCode VARCHAR(255),
        country VARCHAR(255) NOT NULL DEFAULT 'Côte d\\'Ivoire',
        phone VARCHAR(255),
        email VARCHAR(255),
        website VARCHAR(255),
        currency VARCHAR(255) NOT NULL DEFAULT 'XOF',
        fiscalYearStart VARCHAR(255) NOT NULL DEFAULT '01-01',
        accountingStandard VARCHAR(50) NOT NULL DEFAULT 'OHADA',
        isActive BOOLEAN NOT NULL DEFAULT TRUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_registrationNumber (registrationNumber)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
    `);

    // 2. CORRIGER FK journal_entries -> companies SI ELLE EST BRISÉE
    // Récupérer toutes les FK de journal_entries
    const [fks] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'journal_entries' 
      AND COLUMN_NAME = 'company_id' 
      AND REFERENCED_TABLE_NAME = 'companies'
    `);

    if (fks.length > 0) {
      // FK existe, mais peut être cassée. Récréer si nécessaire
      try {
        await queryInterface.sequelize.query(`
          ALTER TABLE journal_entries DROP FOREIGN KEY ${fks[0].CONSTRAINT_NAME}
        `);
      } catch (err) {
        // Ignorer si FK n'existe pas
      }
    }

    // Ajouter la FK correcte
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE journal_entries 
        ADD CONSTRAINT fk_journal_entries_company_id 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT ON UPDATE CASCADE
      `);
    } catch (err) {
      console.log('Info: FK peut déjà exister ou données invalides');
    }

    // 3. CRÉER TABLE CHARTSOFACCOUNTS (optionnel, pour complétude)
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS chartsOfAccounts (
        id CHAR(36) NOT NULL PRIMARY KEY,
        companyId INT(11) NOT NULL,
        accountNumber VARCHAR(255) NOT NULL,
        accountName VARCHAR(255) NOT NULL,
        accountType VARCHAR(50) NOT NULL,
        accountNature VARCHAR(50) NOT NULL DEFAULT 'DEBIT',
        accountStatus VARCHAR(50) DEFAULT 'ACTIVE',
        description TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_company_account (companyId, accountNumber),
        FOREIGN KEY fk_chartsOfAccounts_companies (companyId) 
          REFERENCES companies(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

  } finally {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=1;');
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=0;');
  try {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS chartsOfAccounts;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS companies;');
  } finally {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=1;');
  }
}
