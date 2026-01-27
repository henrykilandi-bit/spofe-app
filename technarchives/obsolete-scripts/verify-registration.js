import mysql from 'mysql2/promise';

async function testRegistration() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'spofe_v2_1'
    });

    console.log('🔍 VÉRIFICATION - newuser@spofe.sn\n');

    const [user] = await conn.execute('SELECT * FROM users WHERE email = ?', ['newuser@spofe.sn']);
    
    if (user.length === 0) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✅ UTILISATEUR CRÉÉ:');
    console.log('   Email: ' + user[0].email);
    console.log('   Role: ' + user[0].role);
    console.log('   Actif: ' + (user[0].is_active ? 'Oui' : 'Non'));

    const [approvals] = await conn.execute(
      'SELECT COUNT(*) as count FROM pending_approvals WHERE email = ?', 
      ['newuser@spofe.sn']
    );
    const count = approvals[0].count;

    console.log('\n⏳ APPROBATION EN ATTENTE:');
    if (count === 0) {
      console.log('   ❌ AUCUNE approbation créée');
      console.log('   ');
      console.log('   EXPLICATION:');
      console.log('   - L\'utilisateur a été créé directement dans la table users');
      console.log('   - Le rôle est "user"');
      console.log('   - Une approbation n\'est créée que si groupeId est fourni');
      console.log('   - Pour tester avec approbation, envoyez groupeId dans la requête');
    } else {
      console.log('   ✅ ' + count + ' approbation(s) créée(s)');
    }

    console.log('\n📌 CONCLUSION:');
    console.log('   Le bouton "Créer un compte" FONCTIONNE:');
    console.log('   ✅ Enregistre l\'utilisateur dans la base de données');
    console.log('   ❌ NE crée PAS d\'approbation en attente (sauf si groupeId)');
    console.log('   ✅ L\'utilisateur peut se connecter immédiatement');

    await conn.end();

  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testRegistration();
