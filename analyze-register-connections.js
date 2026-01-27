const mysql = require('mysql2/promise');
const fs = require('fs');

async function analyzeDatabase() {
  console.log('🔍 ANALYSE DES CONNEXIONS REGISTER PAGE → BASE DE DONNÉES');
  console.log('='.repeat(80));
  
  try {
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'spofe_v2_1'
    });
    
    console.log('✅ Connexion réussie à la base de données spofe_v2_1');
    console.log('');
    
    // Récupérer la structure des tables
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('📋 TABLES DISPONIBLES:');
    tableNames.forEach(table => console.log(`  - ${table}`));
    console.log('');
    
    // Analyser les tables pertinentes pour l'inscription
    const relevantTables = ['users', 'groupes_entreprises', 'compagnies', 'compagnie_permissions', 'user_approvals'];
    
    for (const tableName of relevantTables) {
      if (tableNames.includes(tableName)) {
        console.log(`🏗️  STRUCTURE DE LA TABLE: ${tableName}`);
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        
        columns.forEach(col => {
          console.log(`  ├─ ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        console.log('');
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
  }
}

analyzeDatabase();
