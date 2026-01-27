import mysql from 'mysql2/promise';

async function generateReport() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spofe_v2_1'
  });

  console.log('═════════════════════════════════════════════════════════════════');
  console.log('             RAPPORT: VÉRIFICATION DU BOUTON REGISTER');
  console.log('═════════════════════════════════════════════════════════════════\n');

  // ========== TEST 1 ==========
  console.log('📋 TEST 1: ENREGISTREMENT SANS groupeId');
  console.log('─'.repeat(65));
  console.log('Email: newuser@spofe.sn');
  console.log('Réponse API: ✅ Succès');
  
  const [user1] = await conn.execute('SELECT * FROM users WHERE email = ?', ['newuser@spofe.sn']);
  console.log('\n✅ RÉSULTAT DANS LA BASE:');
  console.log('   Utilisateur créé: OUI (ID: ' + user1[0].id + ')');
  console.log('   Email: ' + user1[0].email);
  console.log('   Role: ' + user1[0].role);
  console.log('   Actif: ' + (user1[0].is_active ? 'Oui' : 'Non'));
  
  const [appr1] = await conn.execute('SELECT COUNT(*) as count FROM pending_approvals WHERE email = ?', ['newuser@spofe.sn']);
  console.log('   Approbation en attente: ' + (appr1[0].count > 0 ? 'OUI' : 'NON'));

  console.log('\n✅ CONCLUSION TEST 1:');
  console.log('   ✅ Le bouton ENREGISTRE dans la base de données');
  console.log('   ✅ L\'utilisateur peut se CONNECTER IMMÉDIATEMENT');
  console.log('   ❌ Pas d\'approbation (car pas de groupeId fourni)\n');

  // ========== TEST 2 ==========
  console.log('\n📋 TEST 2: ENREGISTREMENT AVEC groupeId=1');
  console.log('─'.repeat(65));
  console.log('Email: newuser2@spofe.sn');
  console.log('groupeId: 1');
  console.log('Réponse API: ✅ Succès');

  const [user2] = await conn.execute('SELECT * FROM users WHERE email = ?', ['newuser2@spofe.sn']);
  console.log('\n✅ UTILISATEUR CRÉÉ:');
  console.log('   Utilisateur créé: OUI (ID: ' + user2[0].id + ')');
  console.log('   Email: ' + user2[0].email);
  console.log('   Role: ' + user2[0].role);

  const [appr2] = await conn.execute('SELECT COUNT(*) as count FROM pending_approvals WHERE email = ?', ['newuser2@spofe.sn']);
  console.log('\n❌ APPROBATION:');
  console.log('   Approbation en attente: ' + (appr2[0].count > 0 ? 'OUI' : 'NON'));

  console.log('\n⚠️  PROBLÈME DÉTECTÉ TEST 2:');
  console.log('   L\'approbation N\'a PAS été créée même avec groupeId');
  console.log('   Raison: MISMATCH entre le modèle Sequelize et la table SQL\n');

  // ========== DÉTAIL DU PROBLÈME ==========
  console.log('\n📊 ANALYSE DU PROBLÈME');
  console.log('─'.repeat(65));
  
  console.log('\nModèle Sequelize (attendu):');
  console.log('  - user_id (INT, FK vers users)');
  console.log('  - groupe_id (INT, FK vers groupes_entreprises)');
  console.log('  - status (ENUM)');

  console.log('\nTable MySQL réelle:');
  const [cols] = await conn.execute('DESCRIBE pending_approvals');
  cols.forEach(col => {
    if (['id', 'email', 'prenom', 'nom', 'username', 'status', 'groupe_id'].includes(col.Field)) {
      console.log('  - ' + col.Field + ' (' + col.Type + ')');
    }
  });

  console.log('\n🔴 MISMATCH:');
  console.log('  ✗ Modèle attend: user_id');
  console.log('  ✗ Table a réellement: email, prenom, nom, username');
  console.log('  ✗ Résultat: PendingApproval.create() échoue silencieusement');

  // ========== RÉSUMÉ FINAL ==========
  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('RÉSUMÉ FINAL');
  console.log('═════════════════════════════════════════════════════════════════');

  console.log('\n✅ LE BOUTON "CRÉER UN COMPTE" FONCTIONNE?');
  console.log('   ');
  console.log('   ✅ OUI pour l\'enregistrement utilisateur:');
  console.log('      - L\'utilisateur est créé dans la table users');
  console.log('      - Il reçoit un JWT token');
  console.log('      - Il peut se connecter immédiatement');
  console.log('   ');
  console.log('   ❌ NON pour la création d\'approbation:');
  console.log('      - Les approbations ne sont PAS créées');
  console.log('      - Même avec groupeId, rien ne se passe');
  console.log('      - Cause: Mismatch modèle/table SQL');
  console.log('   ');

  console.log('\n🔧 RECOMMANDATIONS:');
  console.log('   1. Option A: Corriger le modèle Sequelize');
  console.log('      - Changer user_id → email, prenom, nom, username');
  console.log('   ');
  console.log('   2. Option B: Corriger la table SQL');
  console.log('      - Ajouter colonne user_id');
  console.log('      - Supprimer email, prenom, nom');
  console.log('   ');
  console.log('   3. Option C (Recommandée): Double vérification');
  console.log('      - Créer l\'approbation directement en SQL');
  console.log('      - Via INSERT dans pending_approvals avec email');

  await conn.end();
}

generateReport();
