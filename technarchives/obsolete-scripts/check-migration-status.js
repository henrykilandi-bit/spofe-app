import mysql from 'mysql2/promise';

async function checkMigrationStatus() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spofe_v2_1'
  });

  console.log('═════════════════════════════════════════════════════════════════');
  console.log('       STATUS DE LA MIGRATION CONSULTANT');
  console.log('═════════════════════════════════════════════════════════════════\n');

  // 1. Vérifier les colonnes ajoutées à users
  console.log('1️⃣  COLONNES AJOUTÉES À "users":\n');
  const [userCols] = await conn.query('DESCRIBE users');
  const newCols = ['hierarchy_level', 'can_grant_permissions', 'prenom', 'nom', 'telephone', 'siret', 'specialites', 'tarif_horaire', 'experience_years'];
  
  let userColsAdded = 0;
  newCols.forEach(colName => {
    const exists = userCols.some(col => col.Field === colName);
    if (exists) {
      const col = userCols.find(c => c.Field === colName);
      console.log(`   ✅ ${colName} (${col.Type})`);
      userColsAdded++;
    } else {
      console.log(`   ❌ ${colName} - MANQUANT`);
    }
  });

  console.log(`\n   Résumé: ${userColsAdded}/${newCols.length} colonnes ajoutées`);

  // 2. Vérifier les énumérations
  console.log('\n2️⃣  ÉNUMÉRATION "role" MISE À JOUR:\n');
  const [roleEnum] = await conn.query(`
    SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
  `);
  console.log(`   ${roleEnum[0].COLUMN_TYPE}`);

  // 3. Vérifier les tables créées
  console.log('\n3️⃣  TABLES CRÉÉES:\n');
  
  const consultantTables = [
    'consultant_group_assignments',
    'consultant_company_access',
    'consulting_firms',
    'firm_consultants',
    'role_approval_workflow',
    'pending_role_approvals',
    'compagnie_permissions'
  ];

  const [allTables] = await conn.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'spofe_v2_1'
  `);

  const existingTableNames = allTables.map(t => t.TABLE_NAME);
  let tablesCreated = 0;

  for (const tableName of consultantTables) {
    const exists = existingTableNames.includes(tableName);
    console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
    if (exists) tablesCreated++;
  }

  console.log(`\n   Résumé: ${tablesCreated}/${consultantTables.length} tables créées`);

  // 4. Vérifier les vues
  console.log('\n4️⃣  VUES CRÉÉES:\n');
  const [views] = await conn.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'spofe_v2_1' AND TABLE_TYPE = 'VIEW'
  `);

  const consultantViews = ['available_consultants', 'consultant_group_summary'];
  let viewsCreated = 0;

  for (const viewName of consultantViews) {
    const exists = views.some(v => v.TABLE_NAME === viewName);
    console.log(`   ${exists ? '✅' : '❌'} ${viewName}`);
    if (exists) viewsCreated++;
  }

  console.log(`\n   Résumé: ${viewsCreated}/${consultantViews.length} vues créées`);

  // 5. Vérifier les données de configuration
  console.log('\n5️⃣  DONNÉES DE CONFIGURATION:\n');
  
  if (existingTableNames.includes('role_approval_workflow')) {
    const [workflows] = await conn.query(
      'SELECT COUNT(*) as count FROM role_approval_workflow'
    );
    console.log(`   ✅ role_approval_workflow: ${workflows[0].count} workflow(s) configuré(s)`);
  }

  if (existingTableNames.includes('compagnie_permissions')) {
    const [permissions] = await conn.query(
      'SELECT COUNT(*) as count FROM compagnie_permissions'
    );
    console.log(`   ✅ compagnie_permissions: ${permissions[0].count} permission(s)`);
  }

  // Résumé global
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('RÉSUMÉ GLOBAL');
  console.log('═════════════════════════════════════════════════════════════════\n');

  const totalScore = (userColsAdded / 9) + (tablesCreated / 7) + (viewsCreated / 2);
  const percentage = Math.round((totalScore / 3) * 100);

  console.log(`✅ Colonnes users: ${userColsAdded}/9 (${Math.round((userColsAdded/9)*100)}%)`);
  console.log(`✅ Tables créées: ${tablesCreated}/7 (${Math.round((tablesCreated/7)*100)}%)`);
  console.log(`✅ Vues créées: ${viewsCreated}/2 (${Math.round((viewsCreated/2)*100)}%)`);
  console.log(`\n📊 Progression globale: ${percentage}%\n`);

  if (percentage === 100) {
    console.log('🎉 MIGRATION CONSULTANT COMPLÈTEMENT EXÉCUTÉE!');
  } else if (percentage >= 70) {
    console.log('⚠️  MIGRATION PARTIELLEMENT EXÉCUTÉE');
    console.log('   Certains éléments manquent. Tentez de relancer la migration.');
  } else {
    console.log('❌ MIGRATION INCOMPLÈTE');
  }

  await conn.end();
}

checkMigrationStatus();
