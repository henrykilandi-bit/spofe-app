const mysql = require('mysql2/promise');

async function analyzeLoginPageConnections() {
  console.log('🔍 ANALYSE DES CONNEXIONS LOGIN PAGE → BASE DE DONNÉES');
  console.log('='.repeat(80));
  
  let connection;
  
  try {
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'spofe_v2_1'
    });
    
    console.log('✅ Connexion réussie à la base de données spofe_v2_1');
    console.log('');
    
    // Étape 1: Analyser les champs du formulaire LoginPage
    console.log('📋 ÉTAPE 1: ANALYSE DES CHAMPS DU FORMULAIRE LOGIN');
    console.log('-'.repeat(60));
    
    const loginFields = [
      {
        fieldName: 'email',
        stateVar: 'email',
        inputType: 'email',
        required: true,
        placeholder: 'votre.email@entreprise.com',
        autoComplete: 'email'
      },
      {
        fieldName: 'password',
        stateVar: 'password',
        inputType: 'password',
        required: true,
        placeholder: '••••••••',
        autoComplete: 'current-password'
      },
      {
        fieldName: 'rememberMe',
        stateVar: 'checkbox',
        inputType: 'checkbox',
        required: false,
        placeholder: 'Se souvenir de moi',
        autoComplete: null
      }
    ];
    
    console.log('🔧 Champs identifiés dans LoginPage.jsx:');
    loginFields.forEach((field, index) => {
      console.log(`${index + 1}. 📝 ${field.fieldName}`);
      console.log(`   ├─ Variable d'état: ${field.stateVar}`);
      console.log(`   ├─ Type input: ${field.inputType}`);
      console.log(`   ├─ Requis: ${field.required ? 'OUI' : 'NON'}`);
      console.log(`   ├─ Placeholder: ${field.placeholder}`);
      console.log(`   └─ AutoComplete: ${field.autoComplete || 'N/A'}`);
      console.log('');
    });
    
    // Étape 2: Vérifier la structure de la table users
    console.log('🗄️ ÉTAPE 2: VÉRIFICATION DE LA TABLE users');
    console.log('-'.repeat(60));
    
    const [usersColumns] = await connection.execute('DESCRIBE users');
    const userFields = usersColumns.map(col => col.Field);
    
    console.log('📊 Structure actuelle de la table users:');
    usersColumns.forEach(col => {
      const keyInfo = col.Key ? `[${col.Key}]` : '';
      const nullInfo = col.Null === 'NO' ? 'NOT NULL' : 'NULL';
      const defaultInfo = col.Default ? `DEFAULT ${col.Default}` : '';
      console.log(`  ├─ ${col.Field} (${col.Type}) ${nullInfo} ${keyInfo} ${defaultInfo}`);
    });
    console.log('');
    
    // Étape 3: Mapper les champs du formulaire vers la base de données
    console.log('🔗 ÉTAPE 3: MAPPING FORMULAIRE → BASE DE DONNÉES');
    console.log('-'.repeat(60));
    
    console.log('📋 Mapping des champs de connexion:');
    
    let connectedFields = 0;
    let totalFields = loginFields.length;
    
    for (const field of loginFields) {
      console.log(`🔗 ${field.fieldName}`);
      
      if (field.fieldName === 'email') {
        const emailField = usersColumns.find(col => col.Field === 'email');
        if (emailField) {
          console.log(`   ├─ Table: users`);
          console.log(`   ├─ Champ: email`);
          console.log(`   ├─ Type: ${emailField.Type}`);
          console.log(`   ├─ Requis: ${emailField.Null === 'NO' ? 'OUI' : 'NON'}`);
          console.log(`   └─ ✅ Champ trouvé dans la table`);
          connectedFields++;
        } else {
          console.log(`   └─ ❌ Champ email NON TROUVÉ dans la table users`);
        }
      }
      else if (field.fieldName === 'password') {
        const passwordField = usersColumns.find(col => col.Field === 'password');
        if (passwordField) {
          console.log(`   ├─ Table: users`);
          console.log(`   ├─ Champ: password`);
          console.log(`   ├─ Type: ${passwordField.Type}`);
          console.log(`   ├─ Requis: ${passwordField.Null === 'NO' ? 'OUI' : 'NON'}`);
          console.log(`   └─ ✅ Champ trouvé dans la table`);
          connectedFields++;
        } else {
          console.log(`   └─ ❌ Champ password NON TROUVÉ dans la table users`);
        }
      }
      else if (field.fieldName === 'rememberMe') {
        console.log(`   ├─ Table: N/A (fonctionnalité frontend)`);
        console.log(`   ├─ Champ: N/A (géré par localStorage/cookies)`);
        console.log(`   ├─ Type: N/A`);
        console.log(`   ├─ Requis: NON`);
        console.log(`   └─ ✅ Géré côté client (pas de stockage DB)`);
        connectedFields++;
      }
      console.log('');
    }
    
    // Étape 4: Analyser les endpoints API utilisés
    console.log('🌐 ÉTAPE 4: ENDPOINTS API UTILISÉS PAR LOGIN');
    console.log('-'.repeat(60));
    
    const apiEndpoints = [
      {
        method: 'POST',
        endpoint: '/auth/login',
        purpose: 'Authentification principale',
        payload: { email: 'string', password: 'string' },
        response: { token: 'string', user: 'object', requiresTwoFA: 'boolean' }
      },
      {
        method: 'POST',
        endpoint: '/auth/verify-2fa',
        purpose: 'Vérification 2FA',
        payload: { token: 'string', code: 'string' },
        response: { token: 'string', user: 'object' }
      }
    ];
    
    console.log('📡 Endpoints API utilisés:');
    apiEndpoints.forEach((endpoint, index) => {
      console.log(`${index + 1}. 🌐 ${endpoint.method} ${endpoint.endpoint}`);
      console.log(`   ├─ Purpose: ${endpoint.purpose}`);
      console.log(`   ├─ Payload: ${JSON.stringify(endpoint.payload)}`);
      console.log(`   └─ Response: ${JSON.stringify(endpoint.response)}`);
      console.log('');
    });
    
    // Étape 5: Vérifier les tables liées à l'authentification
    console.log('🔐 ÉTAPE 5: TABLES LIÉES À L\'AUTHENTIFICATION');
    console.log('-'.repeat(60));
    
    // Vérifier les tables d'authentification
    const [authTables] = await connection.execute(`
      SHOW TABLES WHERE Tables_in_spofe_v2_1 LIKE '%auth%' 
      OR Tables_in_spofe_v2_1 LIKE '%token%' 
      OR Tables_in_spofe_v2_1 LIKE '%session%'
    `);
    
    console.log('📋 Tables d\'authentification trouvées:');
    if (authTables.length > 0) {
      authTables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  ✅ ${tableName}`);
      });
    } else {
      console.log(`  ⚠️  Aucune table d'authentification spécialisée trouvée`);
      console.log(`  ℹ️  L'authentification semble gérée via la table users standard`);
    }
    console.log('');
    
    // Étape 6: Vérifier les champs de sécurité dans users
    console.log('🛡️ ÉTAPE 6: CHAMPS DE SÉCURITÉ DANS users');
    console.log('-'.repeat(60));
    
    const securityFields = [
      'password', 'email_verified', 'two_factor_enabled', 'two_factor_secret',
      'login_attempts', 'last_login', 'account_locked', 'remember_token'
    ];
    
    console.log('🔒 Champs de sécurité présents:');
    securityFields.forEach(field => {
      const exists = userFields.includes(field);
      const fieldInfo = usersColumns.find(col => col.Field === field);
      
      console.log(`${exists ? '✅' : '❌'} ${field}`);
      if (exists && fieldInfo) {
        console.log(`   Type: ${fieldInfo.Type}, Null: ${fieldInfo.Null}`);
      }
    });
    console.log('');
    
    // Étape 7: Test de connexion avec les identifiants de test
    console.log('🧪 ÉTAPE 7: TEST DE CONNEXION');
    console.log('-'.repeat(60));
    
    const testEmail = 'admin@spofe.sn';
    const testPassword = 'admin123';
    
    try {
      console.log(`🔍 Recherche de l'utilisateur de test: ${testEmail}`);
      
      const [testUser] = await connection.execute(
        'SELECT id, email, password, role, is_active FROM users WHERE email = ?',
        [testEmail]
      );
      
      if (testUser.length > 0) {
        const user = testUser[0];
        console.log(`✅ Utilisateur trouvé:`);
        console.log(`   ├─ ID: ${user.id}`);
        console.log(`   ├─ Email: ${user.email}`);
        console.log(`   ├─ Role: ${user.role}`);
        console.log(`   ├─ Actif: ${user.is_active ? 'OUI' : 'NON'}`);
        console.log(`   └─ Password hashé: ${user.password ? 'PRÉSENT' : 'MANQUANT'}`);
        
        // Vérifier si le mot de passe est hashé
        if (user.password && user.password.startsWith('$2')) {
          console.log(`   ✅ Mot de passe hashé avec bcrypt`);
        } else if (user.password && user.password.length < 50) {
          console.log(`   ⚠️  Mot de passe en clair (non sécurisé)`);
        }
      } else {
        console.log(`❌ Utilisateur de test non trouvé dans la base de données`);
        console.log(`   💡 Suggestion: Créer un utilisateur de test pour les démos`);
      }
    } catch (error) {
      console.log(`❌ Erreur lors du test de connexion: ${error.message}`);
    }
    console.log('');
    
    // Étape 8: Statistiques finales
    console.log('📊 ÉTAPE 8: STATISTIQUES FINALES');
    console.log('-'.repeat(60));
    
    const connectionRate = Math.round((connectedFields / totalFields) * 100);
    
    console.log(`📈 Statistiques de connexion:`);
    console.log(`   ├─ Champs du formulaire: ${totalFields}`);
    console.log(`   ├─ Champs connectés: ${connectedFields}`);
    console.log(`   ├─ Taux de connexion: ${connectionRate}%`);
    console.log(`   ├─ Endpoints API: ${apiEndpoints.length}`);
    console.log(`   └─ Tables users: ✅ PRÉSENTE`);
    console.log('');
    
    // Étape 9: Recommandations
    console.log('💡 ÉTAPE 9: RECOMMANDATIONS');
    console.log('-'.repeat(60));
    
    console.log('🔧 Améliorations suggérées:');
    
    if (!userFields.includes('email_verified')) {
      console.log('   ➕ Ajouter email_verified pour la vérification email');
    }
    
    if (!userFields.includes('two_factor_enabled')) {
      console.log('   ➕ Ajouter two_factor_enabled pour la gestion 2FA');
    }
    
    if (!userFields.includes('login_attempts')) {
      console.log('   ➕ Ajouter login_attempts pour la sécurité');
    }
    
    if (!userFields.includes('last_login')) {
      console.log('   ➕ Ajouter last_login pour le suivi');
    }
    
    if (!userFields.includes('remember_token')) {
      console.log('   ➕ Ajouter remember_token pour "Se souvenir de moi"');
    }
    
    console.log('');
    console.log('🎉 ANALYSE TERMINÉE AVEC SUCCÈSS!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion à la base de données fermée');
    }
  }
}

analyzeLoginPageConnections();
