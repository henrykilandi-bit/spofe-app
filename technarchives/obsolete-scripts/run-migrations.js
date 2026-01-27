#!/usr/bin/env node

/**
 * 🔧 Script simplifié d'exécution des migrations
 * Connexion directe à MySQL sans Sequelize
 */

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'spofe_v2_1',
};

const MIGRATION_FILE = path.join(
  __dirname,
  'cascade/src/migrations/create-super-user-tables.sql'
);

console.log('🔧 Exécution des migrations de base de données');
console.log('━'.repeat(60));

// Vérifier que le fichier existe
if (!fs.existsSync(MIGRATION_FILE)) {
  console.error(`❌ Fichier SQL non trouvé: ${MIGRATION_FILE}`);
  process.exit(1);
}
console.log(`✅ Fichier de migration trouvé`);

// Connexion à MySQL
const connection = mysql.createConnection(DB_CONFIG);

connection.connect(err => {
  if (err) {
    console.error(`❌ Erreur de connexion: ${err.message}`);
    process.exit(1);
  }
  console.log(`✅ Connexion à MySQL établie`);

  // Lire et exécuter le fichier SQL
  const sql = fs.readFileSync(MIGRATION_FILE, 'utf-8');

  // Exécuter le SQL complet
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(`❌ Erreur SQL: ${err.message}`);
      console.error(`Code: ${err.code}`);
      connection.end();
      process.exit(1);
    }

    console.log('\n✅ Migrations exécutées avec succès');

    // Vérifier les tables créées
    connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME IN (
         'pending_approvals',
         'groupe_super_users',
         'approval_audit_logs',
         'approval_workflow_rules'
       )`,
      (err, results) => {
        if (err) {
          console.error(`❌ Erreur de vérification: ${err.message}`);
        } else {
          console.log('\n📊 Tables créées:');
          results.forEach(row => {
            console.log(`   ✓ ${row.TABLE_NAME}`);
          });
        }

        connection.end();
        console.log('\n✅ Migration complétée');
        process.exit(0);
      }
    );
  });
});
