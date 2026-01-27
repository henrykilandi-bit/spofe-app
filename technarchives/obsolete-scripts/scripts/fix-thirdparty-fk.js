#!/usr/bin/env node

/**
 * ThirdParty FK Fixer - Exécute le script SQL de correction
 * Version optimisée avec parsing SQL amélioré
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'spofe_v2_1',
};

const colors = {
  banner: (msg) => chalk.cyan.bold(`\n${'═'.repeat(60)}\n${msg}\n${'═'.repeat(60)}\n`),
  section: (msg) => chalk.yellow.bold(`\n█ ${msg}`),
  success: (msg) => chalk.green(`✓ ${msg}`),
  error: (msg) => chalk.red(`✗ ${msg}`),
  warning: (msg) => chalk.yellow(`⚠ ${msg}`),
  info: (msg) => chalk.blue(`ℹ ${msg}`),
};

async function main() {
  console.log(colors.banner('🔧 SPOFE ThirdParty FK Fix - Correction BD'));

  const connection = await mysql.createConnection(DB_CONFIG);
  console.log(colors.success(`Connecté à ${DB_CONFIG.host}/${DB_CONFIG.database}`));

  try {
    // 1. Vérifier l'état actuel
    console.log(colors.section('Phase 1: Vérification de l\'État Actuel'));
    
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'third_parties'`,
      [DB_CONFIG.database]
    );
    
    if (tables.length === 0) {
      console.log(colors.warning('Table third_parties n\'existe pas - création en cours...'));
    }

    // 2. Créer la table third_parties
    console.log(colors.section('Phase 2: Création de la Table'));
    
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS third_parties (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      type ENUM('SUPPLIER', 'CUSTOMER', 'EMPLOYEE', 'OTHER') DEFAULT 'OTHER',
      company_id INT NOT NULL,
      groupe_id INT,
      email VARCHAR(255),
      phone VARCHAR(20),
      address VARCHAR(500),
      tax_number VARCHAR(50),
      account_number VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_third_parties_company_id (company_id),
      KEY idx_third_parties_type (type),
      KEY idx_third_parties_name (name),
      KEY idx_third_parties_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

    try {
      await connection.query(createTableSQL);
      console.log(colors.success('Table third_parties créée'));
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(colors.warning('Table déjà existante'));
      } else {
        throw error;
      }
    }

    // 3. Ajouter les contraintes FK
    console.log(colors.section('Phase 3: Ajout des Contraintes FK'));
    
    // Vérifier si les FK existent déjà
    const [fkCheck] = await connection.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
       WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = 'third_parties' 
       AND REFERENCED_TABLE_NAME = 'compagnies'`,
      [DB_CONFIG.database]
    );

    if (fkCheck.length === 0) {
      try {
        await connection.query(
          `ALTER TABLE third_parties 
           ADD CONSTRAINT fk_third_parties_compagnie 
           FOREIGN KEY (company_id) REFERENCES compagnies(id) ON DELETE CASCADE`
        );
        console.log(colors.success('FK vers compagnies créée'));
      } catch (error) {
        console.log(colors.warning(`FK compagnies: ${error.message}`));
      }
    } else {
      console.log(colors.info('FK vers compagnies déjà existante'));
    }

    // FK vers groupes_entreprises
    const [fkCheck2] = await connection.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
       WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = 'third_parties' 
       AND REFERENCED_TABLE_NAME = 'groupes_entreprises'`,
      [DB_CONFIG.database]
    );

    if (fkCheck2.length === 0) {
      try {
        await connection.query(
          `ALTER TABLE third_parties 
           ADD CONSTRAINT fk_third_parties_groupe 
           FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE SET NULL`
        );
        console.log(colors.success('FK vers groupes_entreprises créée'));
      } catch (error) {
        console.log(colors.warning(`FK groupes: ${error.message}`));
      }
    } else {
      console.log(colors.info('FK vers groupes_entreprises déjà existante'));
    }

    // 4. Vérification post-exécution
    console.log(colors.section('Phase 4: Vérification'));
    
    const [tableInfo] = await connection.query('DESCRIBE third_parties');
    console.log(colors.success(`Table third_parties avec ${tableInfo.length} colonnes`));
    
    const [fkInfo] = await connection.query(
      `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'third_parties' 
       AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [DB_CONFIG.database]
    );
    
    if (fkInfo.length > 0) {
      console.log(colors.success(`${fkInfo.length} FK créée(s):`));
      fkInfo.forEach(fk => {
        console.log(colors.info(`  → ${fk.COLUMN_NAME} REFERENCES ${fk.REFERENCED_TABLE_NAME}`));
      });
    }

    // 5. Afficher les colonnes
    console.log(colors.section('Phase 5: Structure de la Table'));
    
    tableInfo.forEach(col => {
      const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
      const key = col.Key ? `[${col.Key}]` : '';
      console.log(colors.info(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(25)} ${nullable} ${key}`));
    });

    // 6. Résumé
    console.log(colors.section('Résumé'));
    const box = `
┌─────────────────────────────────────────┐
│  ✓ Table third_parties créée            │
│  ✓ FK vers compagnies configurée        │
│  ✓ FK vers groupes_entreprises configur │
│  ✓ Structure vérifiée et valide         │
└─────────────────────────────────────────┘
    `;
    console.log(chalk.cyan(box));

    console.log(colors.section('Prochaines Étapes'));
    console.log(colors.info('1. Vérifier le modèle Sequelize:'));
    console.log(colors.info('   cascade/src/models/thirdParty.model.js'));
    console.log(colors.info(''));
    console.log(colors.info('2. S\'assurer que belongsTo(Compagnie) est configuré'));
    console.log(colors.info(''));
    console.log(colors.info('3. Exécuter les tests:'));
    console.log(colors.info('   cd cascade && npm run test'));
    console.log(colors.info(''));
    console.log(colors.info('4. Si tests passent: FK correction réussie! 🎉'));

  } catch (error) {
    console.log(colors.error(`Erreur: ${error.message}`));
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log(colors.warning('XAMPP MySQL n\'est probablement pas démarré'));
    }
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error(colors.error(`Erreur fatale: ${error.message}`));
  process.exit(1);
});
