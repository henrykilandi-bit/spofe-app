#!/usr/bin/env node

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'spofe_v2_1',
};

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connecté à MySQL\n');

    // Vérifier la structure de journal_entry_lines
    console.log('📊 Structure de journal_entry_lines:');
    const [columns] = await connection.query('DESCRIBE journal_entry_lines');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // Créer les tables d'approbation
    console.log('\n🔧 Création des tables d\'approbation...');

    const tables = [
      {
        name: 'pending_approvals',
        sql: `CREATE TABLE IF NOT EXISTS pending_approvals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          prenom VARCHAR(100),
          nom VARCHAR(100),
          username VARCHAR(100) UNIQUE,
          status ENUM('pending', 'approved', 'rejected', 'changes_requested') DEFAULT 'pending',
          validation_date DATETIME,
          validation_notes TEXT,
          groupe_id INT,
          required_approvals INT DEFAULT 1,
          current_approvals INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          approved_by INT,
          rejected_by INT,
          rejected_reason VARCHAR(500),
          INDEX idx_status (status),
          INDEX idx_email (email),
          INDEX idx_groupe_id (groupe_id),
          INDEX idx_created_at (created_at),
          INDEX idx_approved_by (approved_by),
          FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
        );`,
      },
      {
        name: 'groupe_super_users',
        sql: `CREATE TABLE IF NOT EXISTS groupe_super_users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          groupe_id INT NOT NULL,
          role ENUM('approver', 'reviewer', 'auditor') DEFAULT 'approver',
          permissions JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_by INT,
          UNIQUE KEY unique_user_groupe (user_id, groupe_id),
          INDEX idx_user_id (user_id),
          INDEX idx_groupe_id (groupe_id),
          INDEX idx_role (role),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        );`,
      },
      {
        name: 'approval_audit_logs',
        sql: `CREATE TABLE IF NOT EXISTS approval_audit_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          pending_approval_id INT NOT NULL,
          action ENUM('submitted', 'approved', 'rejected', 'changes_requested', 'reassigned') DEFAULT 'submitted',
          action_by INT NOT NULL,
          action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          comment TEXT,
          metadata JSON,
          INDEX idx_pending_approval_id (pending_approval_id),
          INDEX idx_action (action),
          INDEX idx_action_by (action_by),
          INDEX idx_action_date (action_date),
          FOREIGN KEY (pending_approval_id) REFERENCES pending_approvals(id) ON DELETE CASCADE,
          FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE RESTRICT
        );`,
      },
    ];

    for (const table of tables) {
      try {
        await connection.query(table.sql);
        console.log(`✅ Table ${table.name} créée`);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`ℹ️  Table ${table.name} existe déjà`);
        } else {
          console.warn(`⚠️  Erreur pour ${table.name}: ${err.message}`);
        }
      }
    }

    // Vérifier que les tables existent
    console.log('\n📋 Tables d\'approbation créées:');
    const [tables_list] = await connection.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('pending_approvals', 'groupe_super_users', 'approval_audit_logs')
    `);

    tables_list.forEach(row => {
      console.log(`✓ ${row.TABLE_NAME}`);
    });

    // Insérer les données de test
    console.log('\n🌱 Insertion de données de test...');

    try {
      // Récupérer l'admin
      const [admins] = await connection.query('SELECT id FROM users WHERE role = ? LIMIT 1', [
        'admin',
      ]);

      if (admins.length > 0) {
        const adminId = admins[0].id;

        // Ajouter l'admin au groupe super-utilisateurs
        await connection.query(
          `INSERT IGNORE INTO groupe_super_users 
           (user_id, groupe_id, role, permissions, created_by)
           VALUES (?, 1, 'approver', ?, ?)`,
          [
            adminId,
            JSON.stringify({
              approve: true,
              reject: true,
              audit: true,
              view: true,
            }),
            adminId,
          ]
        );

        console.log('✓ Admin ajouté au groupe super-utilisateurs');

        // Insérer des approbations en attente
        const testApprovals = [
          ['test1@spofe.sn', 'Jean', 'Dupont', 'testuser1', 'pending'],
          ['test2@spofe.sn', 'Marie', 'Martin', 'testuser2', 'pending'],
          ['test3@spofe.sn', 'Pierre', 'Bernard', 'testuser3', 'pending'],
        ];

        for (const approval of testApprovals) {
          try {
            await connection.query(
              `INSERT IGNORE INTO pending_approvals
               (email, prenom, nom, username, status, groupe_id, required_approvals)
               VALUES (?, ?, ?, ?, ?, 1, 1)`,
              approval
            );
          } catch (err) {
            // Ignorer les doublons
          }
        }

        console.log(`✓ ${testApprovals.length} enregistrements d'approbation créés`);
      }
    } catch (err) {
      console.warn(`⚠️  Erreur lors de l'insertion: ${err.message}`);
    }

    await connection.end();
    console.log('\n✅ Migration complétée avec succès');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Erreur: ${err.message}`);
    process.exit(1);
  }
}

checkDatabase();
