import mysql from 'mysql2/promise';

async function checkNewUser2() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spofe_v2_1'
  });

  console.log('🔍 VÉRIFICATION - newuser2@spofe.sn (AVEC groupeId)\n');

  const [user] = await conn.execute('SELECT * FROM users WHERE email = ?', ['newuser2@spofe.sn']);
  console.log('✅ UTILISATEUR CRÉÉ:');
  console.log('   Email: ' + user[0].email);
  console.log('   Role: ' + user[0].role);

  const [approvals] = await conn.execute(
    'SELECT * FROM pending_approvals WHERE email = ? LIMIT 1', 
    ['newuser2@spofe.sn']
  );

  if (approvals.length > 0) {
    console.log('\n✅ APPROBATION EN ATTENTE:');
    console.log('   Email: ' + approvals[0].email);
    console.log('   Statut: ' + approvals[0].status);
    console.log('   Groupe ID: ' + approvals[0].groupe_id);
    console.log('   Approvals requises: ' + approvals[0].required_approvals);
    console.log('   Approvals reçues: ' + approvals[0].current_approvals);
  } else {
    console.log('\n❌ PAS d\'approbation trouvée');
    console.log('   Attendu: Une approbation aurait du être créée avec groupeId=1');
  }

  await conn.end();
}

checkNewUser2();
