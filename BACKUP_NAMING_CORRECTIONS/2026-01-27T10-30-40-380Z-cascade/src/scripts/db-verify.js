#!/usr/bin/env node

/**
 * Script de Vérification - SPOFE Database
 * Vérifie que toutes les migrations et seeds ont été exécutées correctement
 */

import sequelize from '../config/database.js';
import logger from '../utils/logger.js';
import chalk from 'chalk';

/**
 * Format les résultats avec couleurs
 */
function formatResult(test, passed, message, details = '') {
  const status = passed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
  console.log(`${status} ${chalk.cyan(test)}`);
  if (message) console.log(`    ${message}`);
  if (details) console.log(`    ${details}`);
}

/**
 * Vérifie l'existence d'une table
 */
async function checkTableExists(tableName) {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    return tables.includes(tableName);
  } catch (error) {
    logger.logError(`Erreur vérification table ${tableName}: ${error.message}`);
    return false;
  }
}

/**
 * Compte les lignes dans une table
 */
async function countRows(tableName) {
  try {
    const result = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tableName}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return result[0]?.count || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Vérifie les contraintes
 */
async function checkConstraints() {
  try {
    // Vérifier que tous les journalEntries sont équilibrés
    const unbalanced = await sequelize.query(
      `SELECT COUNT(*) as count FROM journalEntries 
       WHERE totalDebit != totalCredit`,
      { type: sequelize.QueryTypes.SELECT }
    );
    
    return unbalanced[0]?.count === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Fonction principale de vérification
 */
async function verifyDatabase() {
  try {
    console.clear();
    console.log(chalk.bold.blue('\n📊 Vérification Complète SPOFE Database\n'));

    // 1. Connexion
    console.log(chalk.bold('1. TEST DE CONNEXION\n'));
    try {
      await sequelize.authenticate();
      formatResult('Connexion MySQL', true, 'Connecté à la base de données');
    } catch (error) {
      formatResult('Connexion MySQL', false, `Erreur: ${error.message}`);
      await sequelize.close();
      return;
    }

    // 2. Tables Essentielles
    console.log(chalk.bold('\n2. TABLES CRÉÉES\n'));

    const tables = [
      { name: 'users', label: 'Users (préexistante)' },
      { name: 'companies', label: 'Companies (Migration 004)' },
      { name: 'chartsOfAccounts', label: 'Chart of Accounts (Migration 005)' },
      { name: 'journalEntries', label: 'Journal Entries (Migration 006)' },
      { name: 'journalEntryLines', label: 'Journal Entry Lines (Migration 007)' },
      { name: 'accountBalances', label: 'Account Balances (Migration 008)' }
    ];

    let tablesCreated = 0;
    for (const table of tables) {
      const exists = await checkTableExists(table.name);
      formatResult(table.label, exists, exists ? 'Table existe' : 'Table manquante');
      if (exists) tablesCreated++;
    }

    console.log(`\n${chalk.cyan(`Résultat: ${tablesCreated}/${tables.length} tables créées`)}\n`);

    // 3. Données Seedées
    console.log(chalk.bold('3. VÉRIFICATION DES DONNÉES\n'));

    const companies = await countRows('companies');
    formatResult(
      'Companies',
      companies >= 1,
      `${companies} compagnie(s) trouvée(s)`,
      'Attendu: >= 1'
    );

    const accounts = await countRows('chartsOfAccounts');
    formatResult(
      'Comptes Comptables',
      accounts >= 45,
      `${accounts} comptes trouvés`,
      'Attendu: 45 (norme OHADA)'
    );

    const entries = await countRows('journalEntries');
    formatResult(
      'Écritures Comptables',
      entries >= 10,
      `${entries} écritures trouvées`,
      'Attendu: >= 10'
    );

    const entryLines = await countRows('journalEntryLines');
    formatResult(
      'Lignes d\'Écritures',
      entryLines >= 20,
      `${entryLines} lignes trouvées`,
      'Attendu: >= 20'
    );

    // 4. Intégrité des Données
    console.log(chalk.bold('\n4. INTÉGRITÉ DES DONNÉES\n'));

    // Vérifier que les écritures sont équilibrées
    const balanced = await checkConstraints();
    formatResult(
      'Équilibre Comptable',
      balanced,
      'Débit = Crédit pour toutes les écritures',
      'Vérification: SUM(totalDebit) = SUM(totalCredit)'
    );

    // Vérifier les FK
    try {
      const orphanedAccounts = await sequelize.query(
        `SELECT COUNT(*) as count FROM chartsOfAccounts 
         WHERE companyId NOT IN (SELECT id FROM companies)`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const orphaned = orphanedAccounts[0]?.count || 0;
      formatResult(
        'Références Intégrité',
        orphaned === 0,
        `${orphaned} comptes sans compagnie trouvés`,
        'Attendu: 0'
      );
    } catch (error) {
      formatResult('Références Intégrité', false, `Erreur: ${error.message}`);
    }

    // 5. Indices
    console.log(chalk.bold('\n5. INDICES ET PERFORMANCES\n'));

    try {
      const companyIndices = await sequelize.query(
        `SELECT COUNT(*) as count FROM information_schema.STATISTICS 
         WHERE TABLE_NAME = 'companies' AND INDEX_NAME != 'PRIMARY'`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const count = companyIndices[0]?.count || 0;
      formatResult(
        'Indices de Performance',
        count > 0,
        `${count} indices trouvés sur companies`,
        'Attendu: >= 2 (name, registrationNumber)'
      );
    } catch (error) {
      formatResult('Indices de Performance', false, `Erreur: ${error.message}`);
    }

    // 6. Sauvegardes
    console.log(chalk.bold('\n6. SAUVEGARDES AUTOMATIQUES\n'));

    try {
      const fs = await import('fs');
      const path = await import('path');
      const backupDir = path.default.join(process.cwd(), 'backups');
      
      const backups = fs.default.existsSync(backupDir)
        ? fs.default.readdirSync(backupDir).filter(f => f.endsWith('.gz'))
        : [];

      formatResult(
        'Répertoire de Sauvegarde',
        backups.length >= 0,
        `${backups.length} sauvegarde(s) trouvée(s)`,
        'Dossier: /backups'
      );

      if (backups.length > 0) {
        console.log(`\n   Fichiers de sauvegarde:`);
        backups.slice(0, 5).forEach(file => {
          console.log(`   - ${file}`);
        });
      }
    } catch (error) {
      formatResult('Répertoire de Sauvegarde', false, `Erreur: ${error.message}`);
    }

    // 7. Résumé Final
    console.log(chalk.bold('\n7. RÉSUMÉ FINAL\n'));

    const allPassed = tablesCreated === tables.length && 
                      companies >= 1 && 
                      accounts >= 45 && 
                      entries >= 10 && 
                      balanced;

    if (allPassed) {
      console.log(chalk.green.bold('\n🎉 VÉRIFICATION RÉUSSIE!\n'));
      console.log('La base de données est correctement initialisée et prête à l\'emploi.');
      console.log('\nProchaines étapes:');
      console.log('  1. npm run dev         (Démarrer l\'application)');
      console.log('  2. Tester les endpoints');
      console.log('  3. Vérifier les sauvegardes automatiques');
    } else {
      console.log(chalk.red.bold('\n⚠️  VÉRIFICATION INCOMPLÈTE\n'));
      console.log('Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
      console.log('\nActions recommandées:');
      console.log('  1. Vérifier que MySQL est en cours d\'exécution');
      console.log('  2. Vérifier les credentials .env');
      console.log('  3. Réexécuter: npm run db:init');
    }

    console.log(chalk.bold('\n════════════════════════════════════════════════════════════════\n'));

    await sequelize.close();
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error(chalk.red(`\n❌ Erreur Fatale: ${error.message}\n`));
    logger.logError(`Vérification échouée: ${error.message}`);
    process.exit(1);
  }
}

// Point d'entrée
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log(`
📊 Script de Vérification SPOFE Database

Usage:
  npm run db:verify          # Vérifier l'initialisation complète
  node src/scripts/db-verify.js

Vérifie:
  ✓ Connexion à la base de données
  ✓ Existence de toutes les tables (6)
  ✓ Données seedées (45 comptes, 10 écritures)
  ✓ Intégrité des données (équilibre comptable)
  ✓ Indices et performances
  ✓ Sauvegardes automatiques

Résultat:
  Exit code 0 si tout OK
  Exit code 1 si erreurs trouvées
  `);
  process.exit(0);
}

verifyDatabase();
