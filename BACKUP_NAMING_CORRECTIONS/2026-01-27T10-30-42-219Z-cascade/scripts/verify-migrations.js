import { Sequelize } from 'sequelize';
import { config } from '../src/config/config.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testConfig = {
  ...config.development,
  logging: false,
  define: {
    timestamps: false
  }
};

const sequelize = new Sequelize(testConfig);

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    return false;
  }
}

async function checkTables() {
  const expectedTables = [
    'Users',
    'Companies',
    'ChartsOfAccounts',
    'JournalEntries',
    'JournalEntryLines',
    'AccountBalances'
  ];

  try {
    const [results] = await sequelize.query('SHOW TABLES');
    const tables = results.map(row => Object.values(row)[0]);
    
    console.log('\n📋 Vérification des tables:');
    let allTablesExist = true;
    
    for (const table of expectedTables) {
      const exists = tables.includes(table);
      console.log(`   ${exists ? '✅' : '❌'} Table ${table}`);
      allTablesExist = allTablesExist && exists;
    }
    
    return allTablesExist;
  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
    return false;
  }
}

async function checkForeignKeys() {
  const fkQueries = {
    'JournalEntries': 'company_id',
    'JournalEntryLines': 'journal_entry_id',
    'AccountBalances': 'account_id'
  };

  console.log('\n🔗 Vérification des clés étrangères:');
  let allFKsValid = true;

  try {
    for (const [table, fkColumn] of Object.entries(fkQueries)) {
      const [results] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = '${table}'
        AND COLUMN_NAME = '${fkColumn}'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      const isValid = results[0].count > 0;
      console.log(`   ${isValid ? '✅' : '❌'} Clé étrangère ${table}.${fkColumn}`);
      allFKsValid = allFKsValid && isValid;
    }
    
    return allFKsValid;
  } catch (error) {
    console.error('Erreur lors de la vérification des clés étrangères:', error);
    return false;
  }
}

async function testDataInsertion() {
  console.log('\n🧪 Test d\'insertion de données:');
  
  try {
    // Test d'insertion d'une entreprise
    const [companyId] = await sequelize.query(`
      INSERT INTO Companies (id, name, address, city, country, phone, email, currency, fiscal_year_start, created_at, updated_at)
      VALUES (UUID(), 'Test Company', '123 Test St', 'Test City', 'Test Country', '123456789', 'test@example.com', 'EUR', '2024-01-01', NOW(), NOW());
    `);
    
    console.log('   ✅ Insertion entreprise réussie');
    
    // Test d'insertion d'un utilisateur
    const [userId] = await sequelize.query(`
      INSERT INTO Users (id, username, email, password, role, is_active, company_id, created_at, updated_at)
      VALUES (UUID(), 'testuser', 'user@test.com', 'hashedpassword', 'admin', 1, (SELECT id FROM Companies LIMIT 1), NOW(), NOW());
    `);
    
    console.log('   ✅ Insertion utilisateur réussie');
    
    // Nettoyage
    await sequelize.query('DELETE FROM Users WHERE email = "user@test.com"');
    await sequelize.query('DELETE FROM Companies WHERE email = "test@example.com"');
    
    return true;
  } catch (error) {
    console.error('   ❌ Erreur lors de l\'insertion de test:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests de vérification...');
  
  // 1. Test de connexion
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log('❌ Arrêt des tests: connexion à la base de données échouée');
    process.exit(1);
  }
  
  // 2. Vérification des tables
  const tablesOk = await checkTables();
  
  // 3. Vérification des clés étrangères
  const fksOk = await checkForeignKeys();
  
  // 4. Test d'insertion
  const insertionOk = await testDataInsertion();
  
  // Résumé
  console.log('\n📊 RÉSUMÉ DES TESTS');
  console.log('-------------------');
  console.log(`✅ Connexion à la base de données: ${connectionOk ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Tables vérifiées: ${tablesOk ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Clés étrangères vérifiées: ${fksOk ? 'OK' : 'ÉCHEC'}`);
  console.log(`✅ Test d'insertion: ${insertionOk ? 'OK' : 'ÉCHEC'}`);
  
  const allTestsPassed = connectionOk && tablesOk && fksOk && insertionOk;
  console.log(`\n${allTestsPassed ? '🎉 TOUS LES TESTS ONT RÉUSSI !' : '❌ CERTAINS TESTS ONT ÉCHOUÉ'}`);
  
  await sequelize.close();
  process.exit(allTestsPassed ? 0 : 1);
}

runTests().catch(error => {
  console.error('Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
});
