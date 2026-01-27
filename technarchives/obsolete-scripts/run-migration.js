import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Exécution de la migration: 01_create_consultant_tables.sql\n');

    // Lire le fichier SQL
    const migrationPath = path.join(process.cwd(), 'database_migrations/01_create_consultant_tables.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Créer connexion
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'spofe_v2_1',
      multipleStatements: true
    });

    console.log('✅ Connexion à spofe_v2_1 établie\n');

    // Exécuter le SQL
    console.log('⏳ Exécution du fichier SQL...\n');
    const [results] = await conn.query(sqlContent);

    console.log('✅ Migration exécutée avec succès!\n');

    // Vérifier les nouvelles colonnes et tables
    console.log('📊 VÉRIFICATION DES CHANGEMENTS');
    console.log('─'.repeat(65));

    // 1. Vérifier les colonnes ajoutées à users
    console.log('\n1️⃣  Colonnes ajoutées à la table "users":');
    const [userCols] = await conn.query(`
      DESCRIBE users
    `);

    const newCols = ['hierarchy_level', 'can_grant_permissions', 'prenom', 'nom', 'telephone', 'siret', 'specialites', 'tarif_horaire', 'experience_years'];
    userCols.forEach(col => {
      if (newCols.includes(col.Field)) {
        console.log(`   ✅ ${col.Field} (${col.Type})`);
      }
    });

    // 2. Vérifier les nouvelles tables
    console.log('\n2️⃣  Nouvelles tables créées:');
    const [tables] = await conn.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'spofe_v2_1' 
      AND TABLE_NAME LIKE 'consultant%'
    `);

    if (tables.length > 0) {
      tables.forEach(table => {
        console.log(`   ✅ ${table.TABLE_NAME}`);
      });
    } else {
      console.log('   ⚠️  Aucune table consultant créée');
    }

    // 3. Vérifier les énumérations mises à jour
    console.log('\n3️⃣  Énumération "role" mise à jour:');
    const [roleEnum] = await conn.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
    `);
    console.log(`   ✅ ${roleEnum[0].COLUMN_TYPE}`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ MIGRATION COMPLÉTÉE AVEC SUCCÈS');
    console.log('═══════════════════════════════════════════════════════════════');

    await conn.end();

  } catch (error) {
    console.error('❌ Erreur lors de la migration:');
    console.error(error.message);
    
    if (error.sql) {
      console.error('\nRequête SQL:');
      console.error(error.sql);
    }
    
    process.exit(1);
  }
}

runMigration();
