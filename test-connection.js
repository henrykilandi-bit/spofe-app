#!/usr/bin/env node

/**
 * 🔍 TEST DE CONNEXION À LA BASE SPOFE_V2_1
 * 
 * Vérification que la configuration modifiée fonctionne
 * et que la base de données est accessible
 */

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 TEST DE CONNEXION À LA BASE SPOFE_V2_1');
  console.log('='.repeat(50));

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'spofe_v2_1'
    });

    console.log('✅ Connexion réussie à spofe_v2_1');

    // Lister les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Tables trouvées: ${tables.length}`);

    // Tables SPOFE principales
    const tableNames = tables.map(t => Object.values(t)[0]);
    const spofeTables = tableNames.filter(t => 
      t.toLowerCase().includes('user') || 
      t.toLowerCase().includes('role') ||
      t.toLowerCase().includes('company') ||
      t.toLowerCase().includes('compagnie') ||
      t.toLowerCase().includes('groupe') ||
      t.toLowerCase().includes('journal') ||
      t.toLowerCase().includes('account') ||
      t.toLowerCase().includes('audit') ||
      t.toLowerCase().includes('security')
    );

    console.log(`🎯 Tables SPOFE identifiées: ${spofeTables.length}`);
    console.log('Tables principales:', spofeTables.slice(0, 8).join(', ') + 
                (spofeTables.length > 8 ? '...' : ''));

    // Compter les enregistrements
    let totalRecords = 0;
    for (const table of spofeTables.slice(0, 5)) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        totalRecords += count[0].count;
        console.log(`  - ${table}: ${count[0].count} enregistrements`);
      } catch (err) {
        console.log(`  - ${table}: erreur de lecture`);
      }
    }

    console.log(`📈 Total enregistrements (échantillon): ${totalRecords}`);

    await connection.end();
    console.log('\n✅ Test terminé avec succès');
    console.log('🎯 Base spofe_v2_1 prête pour l\'application SPOFE');

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testConnection();
