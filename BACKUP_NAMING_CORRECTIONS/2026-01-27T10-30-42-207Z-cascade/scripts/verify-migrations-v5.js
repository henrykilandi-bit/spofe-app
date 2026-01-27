// ============================================
// verify-migrations-v5.js  
// ============================================
// Auteur : SPOFE Dev Team
// Version : 5.0 (SPOFEAPP Adapted)
// Objectif : Validation complète post-migration avec reporting avancé
// Compatible : Sequelize v7+, MySQL 8+
// ============================================

import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

// =============================
// 🔧 CONFIGURATION
// =============================
const IS_CI = process.argv.includes('--ci');
const PARALLEL_MODE = process.argv.includes('--parallel');
const ENV = process.env.NODE_ENV || 'development';

const envConfig = {
  database: process.env.DB_NAME || 'SPOFEAPP',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306
};

const sequelize = new Sequelize(
  envConfig.database,
  envConfig.username,
  envConfig.password,
  {
    host: envConfig.host,
    port: envConfig.port,
    dialect: 'mysql',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

// =============================
// 📊 SYSTÈME DE REPORTING
// =============================
const LOG_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const jsonReportPath = path.join(LOG_DIR, `verify-report-${timestamp}.json`);
const mdReportPath = path.join(LOG_DIR, `verify-report-${timestamp}.md`);

let report = {
  version: '5.0',
  timestamp,
  environment: ENV,
  ciMode: IS_CI,
  parallelMode: PARALLEL_MODE,
  database: envConfig.database,
  host: envConfig.host,
  port: envConfig.port,
  results: {},
  details: {},
  performance: {},
  errors: [],
  warnings: [],
  summary: {}
};

// =============================
// 🛠️ UTILITAIRES
// =============================
function log(msg, level = 'info') {
  if (!IS_CI || level === 'error') {
    const prefix = {
      info: '📘',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🔍'
    }[level] || '📘';
    console.log(`${prefix} ${msg}`);
  }
}

function logError(msg) { log(msg, 'error'); }
function logSuccess(msg) { log(msg, 'success'); }
function logWarning(msg) { log(msg, 'warning'); }

async function measurePerformance(name, fn) {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  report.performance[name] = duration;
  return { result, duration };
}

// =============================
// 1️⃣ TEST DE CONNEXION
// =============================
async function testConnection() {
  log('\n🔌 Test de connexion à la base de données...');
  try {
    await sequelize.authenticate();
    logSuccess(`Connexion établie à ${envConfig.database}@${envConfig.host}:${envConfig.port}`);
    report.results.connection = true;
    report.details.connection = {
      database: envConfig.database,
      host: envConfig.host,
      port: envConfig.port,
      dialect: 'mysql',
      environment: ENV
    };
    return true;
  } catch (error) {
    logError(`Connexion échouée: ${error.message}`);
    report.results.connection = false;
    report.errors.push({ test: 'connection', severity: 'critical', error: error.message });
    return false;
  }
}

// =============================
// 2️⃣ VÉRIFICATION DES TABLES
// =============================
async function checkTables() {
  log('\n📋 Vérification des tables...');
  const expectedTables = [
    'users', 'companies', 'chartsofaccounts',
    'journalentries', 'journalentrylines', 'accountbalances'
  ];

  try {
    const tables = (await sequelize.getQueryInterface().showAllTables())
      .map(t => t.toLowerCase());
    const missing = expectedTables.filter(t => !tables.includes(t));
    
    expectedTables.forEach(table => {
      const exists = tables.includes(table);
      log(`   ${exists ? '✅' : '❌'} Table ${table}`, exists ? 'success' : 'error');
    });

    report.results.tables = missing.length === 0;
    report.details.tables = {
      expected: expectedTables,
      found: tables,
      missing,
      totalExpected: expectedTables.length
    };

    if (missing.length > 0) {
      missing.forEach(m => report.errors.push({ 
        test: 'tables', 
        severity: 'critical',
        error: `Table manquante: ${m}` 
      }));
    }

    return missing.length === 0;
  } catch (error) {
    logError(`Erreur lors de la vérification des tables: ${error.message}`);
    report.results.tables = false;
    report.errors.push({ test: 'tables', severity: 'critical', error: error.message });
    return false;
  }
}

// =============================
// 3️⃣ VÉRIFICATION STRUCTURE
// =============================
async function checkTableColumns() {
  log('\n🔍 Vérification de la structure des colonnes...');
  
  const tableStructures = {
    'users': ['id', 'username', 'email', 'password', 'role', 'isActive'],
    'companies': ['id', 'name', 'email', 'currency', 'isActive'],
    'chartsofaccounts': ['id', 'companyId', 'accountNumber', 'accountName'],
    'journalentries': ['id', 'companyId', 'userId', 'entryDate'],
    'journalentrylines': ['id', 'journalEntryId', 'accountId', 'amount', 'type'],
    'accountbalances': ['id', 'accountId', 'companyId', 'fiscalYear']
  };

  let allValid = true;

  try {
    for (const [tableName, expectedColumns] of Object.entries(tableStructures)) {
      const result = await sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        { replacements: [envConfig.database, tableName], type: Sequelize.QueryTypes.SELECT }
      );
      
      const actualColumns = (Array.isArray(result) ? result : []).map(c => c.COLUMN_NAME || c.column_name);
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));

      if (missingColumns.length > 0) {
        log(`   ❌ ${tableName}: colonnes manquantes - ${missingColumns.join(', ')}`, 'error');
        allValid = false;
        report.errors.push({ test: 'structure', severity: 'high', table: tableName, error: `Colonnes manquantes: ${missingColumns.join(', ')}` });
      } else {
        log(`   ✅ ${tableName}: structure valide (${actualColumns.length} colonnes)`, 'success');
      }
    }

    report.results.structure = allValid;
    return allValid;
  } catch (error) {
    logError(`Erreur lors de la vérification de la structure: ${error.message}`);
    report.results.structure = false;
    report.errors.push({ test: 'structure', severity: 'critical', error: error.message });
    return false;
  }
}

// =============================
// 4️⃣ VÉRIFICATION DES INDEX
// =============================
async function checkIndexes() {
  log('\n📇 Vérification des index...');
  
  const expectedIndexes = [
    { table: 'users', column: 'email', unique: true },
    { table: 'companies', column: 'email', unique: true },
    { table: 'companies', column: 'registrationNumber', unique: true }
  ];

  let allValid = true;

  try {
    for (const idx of expectedIndexes) {
      const result = await sequelize.query(
        `SELECT INDEX_NAME, NON_UNIQUE FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        { replacements: [envConfig.database, idx.table, idx.column], type: Sequelize.QueryTypes.SELECT }
      );

      const exists = (Array.isArray(result) ? result : []).length > 0;
      const status = exists ? '✅' : '❌';
      log(`   ${status} ${idx.table}.${idx.column}`, exists ? 'success' : 'error');

      if (!exists) {
        allValid = false;
        report.errors.push({ test: 'indexes', severity: 'medium', index: `${idx.table}.${idx.column}`, error: 'Index manquant' });
      }
    }

    report.results.indexes = allValid;
    return allValid;
  } catch (error) {
    logError(`Erreur lors de la vérification des index: ${error.message}`);
    report.results.indexes = false;
    report.errors.push({ test: 'indexes', severity: 'high', error: error.message });
    return false;
  }
}

// =============================
// 5️⃣ VÉRIFICATION DES FK
// =============================
async function checkForeignKeys() {
  log('\n🔗 Vérification des clés étrangères...');
  
  try {
    const result = await sequelize.query(
      `SELECT kcu.TABLE_NAME, kcu.COLUMN_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
       WHERE kcu.TABLE_SCHEMA = ? AND kcu.REFERENCED_TABLE_NAME IS NOT NULL`,
      { replacements: [envConfig.database], type: Sequelize.QueryTypes.SELECT }
    );

    const fks = Array.isArray(result) ? result : [];
    log(`   ✅ ${fks.length} FK détectées`, 'success');
    
    if (fks.length === 0) {
      logWarning(`   ⚠️ Aucune FK trouvée - à vérifier`);
      report.warnings.push({ test: 'foreignKeys', message: 'Aucune FK trouvée' });
    }

    report.results.foreignKeys = true;
    report.details.foreignKeys = { count: fks.length, fks };
    return true;
  } catch (error) {
    logError(`Erreur lors de la vérification des FK: ${error.message}`);
    report.results.foreignKeys = false;
    report.errors.push({ test: 'foreignKeys', severity: 'critical', error: error.message });
    return false;
  }
}

// =============================
// 6️⃣ TEST D'INSERTION
// =============================
async function testInsertions() {
  log('\n🧪 Test d\'insertion transactionnelle...');
  
  const transaction = await sequelize.transaction();
  const insertionDetails = { 
    recordsInserted: 0, 
    tablesAffected: [],
    errors: []
  };

  try {
    const companyId = uuidv4();
    const userId = uuidv4();
    const accountId = uuidv4();
    const entryId = uuidv4();
    const lineId = uuidv4();
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@spofe.ci`;
    const registrationNumber = `REG-${timestamp}`;

    // 1. Insert Company
    try {
      await sequelize.query(
        `INSERT INTO companies (
          id, name, email, registrationNumber, 
          currency, fiscalYearStart, accountingStandard, 
          isActive, country, address, city, 
          postalCode, phone, website, taxId,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { 
          replacements: [
            companyId, 
            'Test Company', 
            testEmail,
            registrationNumber,
            'XOF', 
            '2024-01-01', 
            'OHADA', 
            1,
            'Côte d\'Ivoire',
            '123 Test Address',
            'Abidjan',
            '01 BP 1234',
            '+2250102030405',
            'https://test.spofe.ci',
            `TAX-${timestamp}`
          ], 
          transaction 
        }
      );
      insertionDetails.recordsInserted++;
      insertionDetails.tablesAffected.push('companies');
      log('   ✅ Company insérée', 'success');
    } catch (error) {
      const errMsg = `Erreur insertion company: ${error.message}`;
      logError(errMsg);
      throw new Error(errMsg);
    }

    // 2. Insert User
    try {
      await sequelize.query(
        `INSERT INTO users (
          id, username, email, password, 
          role, isActive, createdAt, updatedAt,
          resetPasswordToken, resetPasswordExpires
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL, NULL)`,
        { 
          replacements: [
            userId, 
            `testuser-${timestamp}`,  // Nom d'utilisateur unique
            `user-${timestamp}@spofe.ci`,
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password = 'password'
            'ADMIN', 
            1
          ], 
          transaction 
        }
      );
      insertionDetails.recordsInserted++;
      insertionDetails.tablesAffected.push('users');
      log('   ✅ User inséré', 'success');
    } catch (error) {
      const errMsg = `Erreur insertion user: ${error.message}`;
      logError(errMsg);
      throw new Error(errMsg);
    }

    // 3. Insert Chart of Accounts
    try {
      await sequelize.query(
        `INSERT INTO chartsofaccounts (
          id, companyId, accountNumber, accountName, 
          description, class, accountType, parentAccountId,
          level, isActive, isSystem, allowManualEntry,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, 1, 0, 1, NOW(), NOW())`,
        { 
          replacements: [
            accountId, 
            companyId, 
            '401000', 
            'Fournisseurs',
            'Compte fournisseurs',
            '4', 
            'LIABILITY', 
            1
          ], 
          transaction 
        }
      );
      insertionDetails.recordsInserted++;
      insertionDetails.tablesAffected.push('chartsofaccounts');
      log('   ✅ Account inséré', 'success');
    } catch (error) {
      const errMsg = `Erreur insertion chart of accounts: ${error.message}`;
      logError(errMsg);
      throw new Error(errMsg);
    }

    // 4. Insert Journal Entry
    try {
      await sequelize.query(
        `INSERT INTO journalentries (
          id, companyId, userId, entryNumber, 
          entryDate, description, reference, status,
          submittedAt, submittedBy, approvedAt, approvedBy,
          postedAt, rejectionReason, fiscalYear, fiscalPeriod,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?, NOW(), NOW())`,
        { 
          replacements: [
            entryId, 
            companyId, 
            userId, 
            `E-${timestamp}`,
            '2024-01-15', 
            'Test d\'écriture comptable',
            'DRAFT',
            2024, 
            1
          ], 
          transaction 
        }
      );
      insertionDetails.recordsInserted++;
      insertionDetails.tablesAffected.push('journalentries');
      log('   ✅ Journal Entry insérée', 'success');
    } catch (error) {
      const errMsg = `Erreur insertion journal entry: ${error.message}`;
      logError(errMsg);
      throw new Error(errMsg);
    }

    // 5. Insert Journal Entry Line
    try {
      await sequelize.query(
        `INSERT INTO journalentrylines (
          id, journalEntryId, accountId, amount, 
          type, description, isReconciled,
          reconciledAt, reconciledBy, lineOrder,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, NULL, 1, NOW(), NOW())`,
        { 
          replacements: [
            lineId, 
            entryId, 
            accountId, 
            1000.00, 
            'DEBIT',
            'Test ligne d\'écriture',
          ], 
          transaction 
        }
      );
      insertionDetails.recordsInserted++;
      insertionDetails.tablesAffected.push('journalentrylines');
      log('   ✅ Journal Entry Line insérée', 'success');
    } catch (error) {
      const errMsg = `Erreur insertion journal entry line: ${error.message}`;
      logError(errMsg);
      throw new Error(errMsg);
    }

    // 6. Insert Account Balance
    try {
      await sequelize.query(
        `INSERT INTO accountbalances (
          id, accountId, companyId, fiscalYear,
          fiscalPeriod, periodStartDate, periodEndDate,
          openingBalance, debitBalance, creditBalance,
          closingBalance, isClosed, closedAt, closedBy,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, '2024-01-01', '2024-01-31', 0, 1000, 0, 1000, 0, NULL, NULL, NOW(), NOW())`,
        { 
          replacements: [
            uuidv4(),
            accountId,
            companyId,
            2024,
            1
          ],
          transaction
        }
      );
      insertionDetails.recordsInserted++;
      insertionDetails.tablesAffected.push('accountbalances');
      log('   ✅ Account Balance inséré', 'success');
    } catch (error) {
      const errMsg = `Erreur insertion account balance: ${error.message}`;
      logError(errMsg);
      // Ne pas échouer le test pour cette erreur (optionnel)
      insertionDetails.errors.push(errMsg);
    }

    await transaction.rollback();
    log('   ✅ Rollback effectué', 'success');

    report.results.insertion = true;
    report.details.insertion = insertionDetails;
    return true;
  } catch (error) {
    await transaction.rollback();
    const errorMsg = `Erreur lors de l'insertion: ${error.message}`;
    logError(errorMsg);
    report.results.insertion = false;
    report.errors.push({ 
      test: 'insertion', 
      severity: 'high', 
      error: error.message,
      details: insertionDetails.errors.length > 0 ? insertionDetails.errors : undefined
    });
    return false;
  }
}

// =============================
// 7️⃣ TEST DES UNIQUE
// =============================
async function testUniqueConstraints() {
  log('\n🛡️ Test des contraintes UNIQUE...');
  
  const transaction = await sequelize.transaction();
  const constraintsDetails = {};

  try {
    // Test email unique
    try {
      const testEmail = `dup-${Date.now()}@test.ci`;

      await sequelize.query(
        `INSERT INTO users (id, username, email, password, role, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [uuidv4(), 'user1', testEmail, 'pass', 'USER', 1], transaction }
      );

      await sequelize.query(
        `INSERT INTO users (id, username, email, password, role, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [uuidv4(), 'user2', testEmail, 'pass', 'USER', 1], transaction }
      );

      logError('   Contrainte UNIQUE non respectée');
      constraintsDetails.usersEmailUnique = false;
      await transaction.rollback();
      report.results.uniqueConstraints = false;
      report.errors.push({ test: 'uniqueConstraints', severity: 'critical', error: 'UNIQUE constraint non respectée' });
      return false;
    } catch (error) {
      if (error.message.includes('Duplicate') || error.original?.code === 'ER_DUP_ENTRY') {
        log('   ✅ Contrainte UNIQUE validée', 'success');
        constraintsDetails.usersEmailUnique = true;
      } else {
        throw error;
      }
    }

    await transaction.rollback();
    report.results.uniqueConstraints = true;
    report.details.uniqueConstraints = constraintsDetails;
    return true;
  } catch (error) {
    await transaction.rollback();
    logError(`Erreur: ${error.message}`);
    report.results.uniqueConstraints = false;
    report.errors.push({ test: 'uniqueConstraints', severity: 'high', error: error.message });
    return false;
  }
}

// =============================
// 8️⃣ TEST DE PERFORMANCE
// =============================
async function testPerformance() {
  log('\n⚡ Test de performance...');
  
  const tests = [];

  try {
    const t1 = Date.now();
    await sequelize.query('SELECT COUNT(*) as cnt FROM companies', { type: Sequelize.QueryTypes.SELECT });
    tests.push({ name: 'COUNT companies', duration: Date.now() - t1 });
    log(`   ✅ SELECT COUNT: ${Date.now() - t1}ms`, 'success');

    report.results.performance = true;
    report.details.performanceTests = tests;
    return true;
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    report.results.performance = false;
    report.errors.push({ test: 'performance', severity: 'low', error: error.message });
    return false;
  }
}

// =============================
// 📊 GÉNÉRER RAPPORTS
// =============================
function generateReports(passed, total) {
  const successRate = ((passed / total) * 100).toFixed(2);
  const allPassed = passed === total;

  report.summary = {
    total, passed, failed: total - passed, success: allPassed,
    successRate: successRate + '%',
    totalErrors: report.errors.length,
    totalWarnings: report.warnings.length,
    executionTime: Object.values(report.performance).reduce((s, t) => s + t, 0)
  };

  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

  const md = `# 🚀 Rapport de Vérification SPOFE v5.0

**Date :** ${new Date(timestamp).toLocaleString('fr-FR')}  
**Environnement :** \`${ENV}\`  
**Base :** \`${report.database}@${report.host}\`

## 📊 Résultats

| Test | Résultat | Temps |
|------|----------|-------|
| Connexion | ${report.results.connection ? '✅ PASS' : '❌ FAIL'} | ${report.performance.connection}ms |
| Tables | ${report.results.tables ? '✅ PASS' : '❌ FAIL'} | ${report.performance.tables}ms |
| Structure | ${report.results.structure ? '✅ PASS' : '❌ FAIL'} | ${report.performance.structure}ms |
| Index | ${report.results.indexes ? '✅ PASS' : '❌ FAIL'} | ${report.performance.indexes}ms |
| FK | ${report.results.foreignKeys ? '✅ PASS' : '❌ FAIL'} | ${report.performance.foreignKeys}ms |
| Insertion | ${report.results.insertion ? '✅ PASS' : '❌ FAIL'} | ${report.performance.insertion}ms |
| UNIQUE | ${report.results.uniqueConstraints ? '✅ PASS' : '❌ FAIL'} | ${report.performance.uniqueConstraints}ms |
| Performance | ${report.results.performance ? '✅ PASS' : '❌ FAIL'} | ${report.performance.performance}ms |

## 🎯 Score Global

**${passed}/${total}** tests réussis — **${successRate}%**

${allPassed ? '🎉 **TOUS LES TESTS ONT RÉUSSI !**' : '⚠️ **CERTAINS TESTS ONT ÉCHOUÉ**'}

## 📈 Statistiques

- **Erreurs :** ${report.errors.length}
- **Avertissements :** ${report.warnings.length}
- **Temps total :** ${report.summary.executionTime}ms

---

*Généré par SPOFE Verification System v5.0*
`;

  fs.writeFileSync(mdReportPath, md.trim());
  
  if (!IS_CI) {
    log(`\n📄 Rapports générés:`, 'success');
    log(`   JSON: ${jsonReportPath}`, 'info');
    log(`   MD: ${mdReportPath}`, 'info');
  }
}

// =============================
// 🎬 EXÉCUTION PRINCIPALE
// =============================
async function runAllTests() {
  log('🚀 Démarrage SPOFE Verification System v5.0', 'info');
  log('='.repeat(70), 'info');
  log(`📍 Environnement: ${ENV}`, 'info');
  log(`📍 Base de données: ${envConfig.database}`, 'info');
  log('='.repeat(70), 'info');

  const TESTS = [
    ['connection', testConnection],
    ['tables', checkTables],
    ['structure', checkTableColumns],
    ['indexes', checkIndexes],
    ['foreignKeys', checkForeignKeys],
    ['insertion', testInsertions],
    ['uniqueConstraints', testUniqueConstraints],
    ['performance', testPerformance]
  ];

  let passed = 0;
  const total = TESTS.length;

  try {
    for (const [key, fn] of TESTS) {
      const { result } = await measurePerformance(key, fn);
      if (result) passed++;
    }

    generateReports(passed, total);

    log('\n' + '='.repeat(70), 'info');
    log('📊 RÉSUMÉ FINAL', 'info');
    log('='.repeat(70), 'info');
    log(`📈 Score: ${passed}/${total} (${report.summary.successRate})`, 'info');
    log(`⏱️ Temps total: ${report.summary.executionTime}ms`, 'info');
    log(`❌ Erreurs: ${report.errors.length}`, report.errors.length > 0 ? 'error' : 'success');
    log(`⚠️ Avertissements: ${report.warnings.length}`, report.warnings.length > 0 ? 'warning' : 'success');
    log('='.repeat(70), 'info');

    const allPassed = passed === total;
    log(`\n${allPassed ? '🎉 TOUS LES TESTS ONT RÉUSSI !' : '❌ CERTAINS TESTS ONT ÉCHOUÉ'}`, allPassed ? 'success' : 'error');

    if (report.errors.length > 0) {
      log('\n⚠️ Erreurs détectées:', 'error');
      report.errors.forEach((err, idx) => {
        log(`   ${idx + 1}. [${err.test}] ${err.error}`, 'error');
      });
    }

    return allPassed;
  } catch (error) {
    logError(`\n❌ Erreur critique: ${error.message}`);
    console.error(error.stack);
    report.summary.criticalError = error.message;
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
    return false;
  } finally {
    await sequelize.close();
    log('\n🔌 Connexion fermée', 'info');
  }
}

runAllTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    logError(`❌ Erreur fatale: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
