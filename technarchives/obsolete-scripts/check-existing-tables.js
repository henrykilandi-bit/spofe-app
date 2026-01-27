import mysql from 'mysql2/promise';

async function checkTables() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spofe_v2_1'
  });

  try {
    console.log('🔍 VÉRIFICATION DES TABLES EXISTANTES\n');

    // Lister toutes les tables
    const [tables] = await conn.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'spofe_v2_1' ORDER BY TABLE_NAME`
    );

    console.log(`📋 ${tables.length} tables trouvées:\n`);
    tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));

    // Chercher les tables liées aux compagnies/entreprises
    console.log('\n🏢 RECHERCHE DE TABLES RELATIVES AUX COMPAGNIES:');
    const compagnieRelated = tables.filter(t => 
      t.TABLE_NAME.toLowerCase().includes('compagnie') || 
      t.TABLE_NAME.toLowerCase().includes('entreprise') ||
      t.TABLE_NAME.toLowerCase().includes('company')
    );
    
    if (compagnieRelated.length > 0) {
      console.log('   Trouvées:');
      compagnieRelated.forEach(t => console.log(`     - ${t.TABLE_NAME}`));
    } else {
      console.log('   ❌ AUCUNE TABLE DE COMPAGNIES/ENTREPRISES TROUVÉE');
    }

    // Vérifier la structure des tables principales
    console.log('\n📐 STRUCTURE DES TABLES PRINCIPALES:\n');

    const mainTables = ['users', 'groupes_entreprises', 'consultant_group_assignments'];
    for (const tableName of mainTables) {
      const exists = tables.some(t => t.TABLE_NAME === tableName);
      if (exists) {
        const [columns] = await conn.query(`DESCRIBE ${tableName}`);
        console.log(`${tableName}:`);
        columns.forEach(col => {
          console.log(`   - ${col.Field} (${col.Type})`);
        });
        console.log('');
      }
    }

    await conn.end();

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkTables();
