import mysql from 'mysql2/promise';

async function checkTables() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spofe_v2_1'
  });

  console.log('🔍 VÉRIFICATION DES TABLES EXISTANTES\n');

  const [tables] = await conn.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'spofe_v2_1'
    ORDER BY TABLE_NAME
  `);

  console.log(`Total tables: ${tables.length}\n`);

  // Vérifier les tables importantes
  const importantTables = ['users', 'groupes_entreprises', 'compagnies', 'compagnie_permissions'];
  
  const existingTables = tables.map(t => t.TABLE_NAME);

  console.log('Tables importantes:');
  importantTables.forEach(tableName => {
    const exists = existingTables.includes(tableName);
    console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
  });

  // Si compagnies existe, vérifier sa structure
  if (existingTables.includes('compagnies')) {
    console.log('\nStructure de la table "compagnies":');
    const [cols] = await conn.query('DESCRIBE compagnies');
    cols.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
  }

  console.log('\nToutes les tables:');
  tables.forEach(t => {
    console.log(`  - ${t.TABLE_NAME}`);
  });

  await conn.end();
}

checkTables();
