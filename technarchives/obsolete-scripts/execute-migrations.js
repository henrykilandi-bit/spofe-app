#!/usr/bin/env node

/**
 * 🔧 Script d'exécution des migrations de base de données
 * Crée les tables manquantes pour le dashboard d'approbation super utilisateur
 * Connexion directe à MySQL (XAMPP) pour exécuter le SQL
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'spofe_v2_1',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  enableKeepAlive: true,
};

const MIGRATION_FILE = path.join(__dirname, 'cascade', 'src', 'migrations', 'create-super-user-tables.sql');

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * 🔍 Lire et parser le fichier SQL
 */
function readSQLFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Enlever les commentaires et les espaces inutiles
    return content
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement && !statement.startsWith('--'));
  } catch (err) {
    console.error(`❌ Erreur lors de la lecture du fichier SQL: ${err.message}`);
    throw err;
  }
}

/**
 * 📊 Afficher les statistiques de migration
 */
async function showTableStats(connection) {
  try {
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN (
          'pending_approvals',
          'groupe_super_users',
          'approval_audit_logs',
          'approval_workflow_rules'
        )
    `);

    console.log('\n✅ Tables créées avec succès:');
    tables.forEach(table => {
      console.log(`   ✓ ${table.TABLE_NAME}`);
    });

    return tables.length;
  } catch (err) {
    console.error(`❌ Erreur lors de la vérification: ${err.message}`);
    return 0;
  }
}

/**
 * 🌱 Insérer les données de test
 */
async function insertTestData(connection) {
  try {
    console.log('\n🌱 Insertion des données de test...');

    // Vérifier que l'utilisateur admin existe
    const [users] = await connection.query(
      'SELECT id FROM users WHERE role = ? LIMIT 1',
      ['admin']
    );

    if (users.length === 0) {
      console.warn('⚠️  Aucun utilisateur admin trouvé pour les données de test');
      return;
    }

    const adminId = users[0].id;

    // Insérer un enregistrement dans groupe_super_users
    await connection.query(
      `INSERT IGNORE INTO groupe_super_users (user_id, groupe_id, role, permissions, created_by)
       VALUES (?, 1, 'approver', ?, ?); `,
      [
        adminId,
        JSON.stringify({ approve: true, reject: true, audit: true, view: true }),
        adminId,
      ]
    );

    console.log(`✓ Admin utilisateur ajouté au groupe super-utilisateurs`);

    // Insérer des données d'approbation en attente de test
    const testApprovals = [
      ['test1@spofe.sn', 'Test', 'User1', 'testuser1', 'pending'],
      ['test2@spofe.sn', 'Test', 'User2', 'testuser2', 'pending'],
      ['test3@spofe.sn', 'Test', 'User3', 'testuser3', 'pending'],
    ];

    for (const approval of testApprovals) {
      await connection.query(
        `INSERT IGNORE INTO pending_approvals 
         (email, prenom, nom, username, status, groupe_id, required_approvals)
         VALUES (?, ?, ?, ?, ?, 1, 1); `,
        approval
      );
    }

    console.log(`✓ ${testApprovals.length} enregistrements d'approbation en attente créés`);

    // Insérer des logs d'audit de test
    const [approvals] = await connection.query(
      'SELECT id FROM pending_approvals LIMIT 1'
    );

    if (approvals.length > 0) {
      const approverId = approvals[0].id;
      const [approvalId] = await connection.query(
        'SELECT id FROM pending_approvals LIMIT 1'
      );

      if (approvalId.length > 0) {
        await connection.query(
          `INSERT INTO approval_audit_logs 
           (pending_approval_id, action, action_by, comment)
           VALUES (?, 'submitted', ?, 'Demande d\'approbation créée');`,
          [approvalId[0].id, adminId]
        );
        console.log(`✓ Logs d'audit créés`);
      }
    }
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  Les données de test existent déjà (doublons ignorés)');
    } else {
      console.error(`⚠️  Erreur lors de l'insertion des données: ${err.message}`);
    }
  }
}

// ============================================================================
// PROGRAMME PRINCIPAL
// ============================================================================

async function main() {
  console.log('🔧 Exécution des migrations de base de données');
  console.log('━'.repeat(60));

  let connection;

  try {
    // 1️⃣ Vérifier que le fichier SQL existe
    if (!fs.existsSync(MIGRATION_FILE)) {
      throw new Error(`❌ Fichier SQL non trouvé: ${MIGRATION_FILE}`);
    }
    console.log(`✅ Fichier de migration trouvé: ${path.basename(MIGRATION_FILE)}`);

    // 2️⃣ Connexion à la base de données
    console.log(`\n📡 Connexion à ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}...`);
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connexion établie avec succès');

    // 3️⃣ Lire les instructions SQL
    console.log('\n📖 Lecture du fichier de migration...');
    const statements = readSQLFile(MIGRATION_FILE);
    console.log(`✅ ${statements.length} instructions SQL trouvées`);

    // 4️⃣ Exécuter les instructions SQL
    console.log('\n⚙️  Exécution des instructions SQL...');
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Ignorer les instructions vides ou les commentaires
      if (!statement.trim() || statement.trim().startsWith('--')) {
        skipCount++;
        continue;
      }

      try {
        await connection.query(statement);
        successCount++;

        // Afficher le type d'instruction
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE.*?(\w+)\s*\(/i)?.[1] || 'Unknown';
          console.log(`   ✓ Instruction ${i + 1}: CREATE TABLE ${tableName}`);
        } else if (statement.includes('SELECT')) {
          console.log(`   ✓ Instruction ${i + 1}: SELECT (Vérification)`);
        } else if (statement.includes('DESCRIBE')) {
          console.log(`   ✓ Instruction ${i + 1}: DESCRIBE`);
        } else {
          console.log(`   ✓ Instruction ${i + 1}: ${statement.substring(0, 50)}...`);
        }
      } catch (err) {
        // Ignorer les erreurs de "table exists already" (IF NOT EXISTS)
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`   ℹ️  Instruction ${i + 1}: Table existe déjà (IF NOT EXISTS)`);
          skipCount++;
        } else if (err.code === 'ER_DUP_KEYNAME') {
          console.log(`   ℹ️  Instruction ${i + 1}: Clé unique existe déjà`);
          skipCount++;
        } else {
          console.warn(`   ⚠️  Instruction ${i + 1}: ${err.message}`);
        }
      }
    }

    console.log(`\n📊 Résultats d'exécution:`);
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ⏭️  Ignorées: ${skipCount}`);
    console.log(`   📝 Total: ${statements.length}`);

    // 5️⃣ Afficher les statistiques des tables
    const tablesCreated = await showTableStats(connection);
    console.log(`\n✅ ${tablesCreated}/4 tables d'approbation créées`);

    // 6️⃣ Insérer les données de test (optionnel)
    console.log('\n🌱 Insertion des données de test...');
    await insertTestData(connection);

    // 7️⃣ Afficher le résumé final
    console.log('\n' + '━'.repeat(60));
    console.log('✅ MIGRATION COMPLÉTÉE AVEC SUCCÈS');
    console.log('━'.repeat(60));
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Créer les routes API d\'approbation');
    console.log('   2. Créer les contrôleurs pour le dashboard');
    console.log('   3. Ajouter la route frontend /admin/approvals');
    console.log('   4. Tester les fonctionnalités d\'approbation');

    process.exit(0);
  } catch (err) {
    console.error(`\n❌ ERREUR: ${err.message}`);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Vérifiez les identifiants MySQL');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('   → La base de données "spofe_v2_1" n\'existe pas');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('   → Impossible de se connecter à MySQL');
      console.error('   → Assurez-vous que XAMPP (MySQL) est en cours d\'exécution');
    }
    process.exit(1);
  } finally {
    // Fermer la connexion
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Lancer le programme
main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
