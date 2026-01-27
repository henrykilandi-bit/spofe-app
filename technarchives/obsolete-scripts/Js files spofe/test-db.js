const { testConnection } = require('./src/config/database');

async function test() {
  console.log('Test de connexion à la base de données...');
  const isConnected = await testConnection();
  console.log('Résultat du test de connexion:', isConnected ? '✅ Connecté' : '❌ Échec');
  process.exit(0);
}

test().catch(console.error);
