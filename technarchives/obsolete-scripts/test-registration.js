import mysql from 'mysql2/promise';

async function checkRegistration() {
  try {
    console.log('🔍 VÉRIFICATION DE L\'ENREGISTREMENT\n');
    
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'spofe_v2_1'
    });

    // Vérifier les utilisateurs récents
    console.log('👥 UTILISATEURS CRÉÉS (5 derniers)');
    console.log('─'.repeat(60));
    const [users] = await conn.execute(
      'SELECT id, email, username, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );
    
    users.forEach((user, idx) => {
      console.log(`\n${idx + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Actif: ${user.is_active ? '✅' : '❌'}`);
      console.log(`   Créé: ${user.created_at}`);
    });

    // Vérifier les approbations en attente
    console.log('\n\n⏳ APPROBATIONS EN ATTENTE');
    console.log('─'.repeat(60));
    const [approvals] = await conn.execute(
      'SELECT id, email, first_name, last_name, company, status, created_at FROM pending_approvals WHERE status = "pending" ORDER BY created_at DESC LIMIT 5'
    );
    
    if (approvals.length === 0) {
      console.log('Aucune approbation en attente');
    } else {
      approvals.forEach((approval, idx) => {
        console.log(`\n${idx + 1}. ${approval.email}`);
        console.log(`   ID: ${approval.id}`);
        console.log(`   Nom: ${approval.first_name} ${approval.last_name}`);
        console.log(`   Entreprise: ${approval.company || 'N/A'}`);
        console.log(`   Statut: ${approval.status}`);
        console.log(`   Créé: ${approval.created_at}`);
      });
    }

    // Vérifier la relation entre utilisateurs et approbations
    console.log('\n\n🔗 VÉRIFICATION DE LA RELATION UTILISATEUR-APPROBATION');
    console.log('─'.repeat(60));
    
    const newUserId = users[0].id; // L'utilisateur le plus récent
    const [relatedApprovals] = await conn.execute(
      'SELECT * FROM pending_approvals WHERE user_id = ? OR email = ?',
      [newUserId, users[0].email]
    );

    if (relatedApprovals.length > 0) {
      console.log(`✅ L'utilisateur newuser@spofe.sn (ID: ${newUserId}) a une approbation en attente`);
      console.log(JSON.stringify(relatedApprovals[0], null, 2));
    } else {
      console.log(`❌ L'utilisateur newuser@spofe.sn (ID: ${newUserId}) N'a PAS d'approbation en attente`);
    }

    // Résumé
    console.log('\n\n📊 RÉSUMÉ');
    console.log('─'.repeat(60));
    console.log(`✅ Utilisateurs total: ${users.length}`);
    console.log(`✅ Approbations en attente: ${approvals.length}`);
    console.log(`ℹ️  Feature flag 'superUserGroupApproval': À vérifier`);

    await conn.end();
    console.log('\n✅ Vérification complétée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

checkRegistration();
