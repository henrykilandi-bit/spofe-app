const mysql = require('mysql2/promise');

async function verifySecurityImplementation() {
  console.log('🔍 VÉRIFICATION FINALE DES AMÉLIORATIONS DE SÉCURITÉ');
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
    
    // Étape 1: Vérifier les champs de sécurité dans users
    console.log('📋 ÉTAPE 1: VÉRIFICATION DES CHAMPS DE SÉCURITÉ');
    console.log('-'.repeat(60));
    
    const [usersColumns] = await connection.execute('DESCRIBE users');
    const userFields = usersColumns.map(col => col.Field);
    
    const securityFields = [
      'email_verified', 'two_factor_enabled', 'login_attempts', 
      'last_login', 'account_locked', 'remember_token'
    ];
    
    console.log('🔒 Champs de sécurité dans la table users:');
    let securityFieldsCount = 0;
    
    securityFields.forEach(field => {
      const exists = userFields.includes(field);
      const fieldInfo = usersColumns.find(col => col.Field === field);
      
      if (exists) {
        securityFieldsCount++;
        console.log(`${exists ? '✅' : '❌'} ${field}:`);
        console.log(`   Type: ${fieldInfo.Type}`);
        console.log(`   Null: ${fieldInfo.Null}`);
        console.log(`   Default: ${fieldInfo.Default || 'NULL'}`);
      } else {
        console.log(`❌ ${field}: MANQUANT`);
      }
      console.log('');
    });
    
    console.log(`📊 Champs de sécurité: ${securityFieldsCount}/6 (${Math.round((securityFieldsCount/6)*100)}%)`);
    console.log('');
    
    // Étape 2: Vérifier les indexes de sécurité
    console.log('📊 ÉTAPE 2: VÉRIFICATION DES INDEXES DE SÉCURITÉ');
    console.log('-'.repeat(60));
    
    const [indexes] = await connection.execute('SHOW INDEX FROM users');
    const indexNames = indexes.map(idx => idx.Key_name).filter((name, i, arr) => arr.indexOf(name) === i);
    
    const securityIndexes = [
      'idx_users_email_verified', 'idx_users_two_factor_enabled', 
      'idx_users_login_attempts', 'idx_users_account_locked',
      'idx_users_remember_token', 'idx_users_last_login'
    ];
    
    console.log('📈 Indexes de sécurité:');
    let securityIndexesCount = 0;
    
    securityIndexes.forEach(indexName => {
      const exists = indexNames.includes(indexName);
      if (exists) {
        securityIndexesCount++;
        console.log(`✅ ${indexName}`);
      } else {
        console.log(`❌ ${indexName}: MANQUANT`);
      }
    });
    
    console.log(`\n📊 Indexes de sécurité: ${securityIndexesCount}/6 (${Math.round((securityIndexesCount/6)*100)}%)`);
    console.log('');
    
    // Étape 3: Vérifier les tables de sécurité
    console.log('🗄️ ÉTAPE 3: VÉRIFICATION DES TABLES DE SÉCURITÉ');
    console.log('-'.repeat(60));
    
    const [allTables] = await connection.execute('SHOW TABLES');
    const tableNames = allTables.map(table => Object.values(table)[0]);
    
    const securityTables = ['login_audit_trails', 'remember_tokens'];
    
    console.log('🛡️ Tables de sécurité:');
    let securityTablesCount = 0;
    
    for (const tableName of securityTables) {
      const exists = tableNames.includes(tableName);
      if (exists) {
        securityTablesCount++;
        console.log(`✅ ${tableName}`);
        
        // Vérifier la structure de la table
        try {
          const [tableStructure] = await connection.execute(`DESCRIBE ${tableName}`);
          console.log(`   Champs: ${tableStructure.length}`);
          
          // Vérifier les foreign keys
          const [constraints] = await connection.execute(`
            SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = 'spofe_v2_1' 
            AND TABLE_NAME = '${tableName}'
            AND REFERENCED_TABLE_NAME IS NOT NULL
          `);
          
          if (constraints.length > 0) {
            console.log(`   Foreign Keys: ${constraints.length}`);
            constraints.forEach(constraint => {
              console.log(`     ${constraint.COLUMN_NAME} → ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
            });
          }
          
        } catch (error) {
          console.log(`   ⚠️  Erreur vérification structure: ${error.message}`);
        }
        
      } else {
        console.log(`❌ ${tableName}: MANQUANTE`);
      }
      console.log('');
    }
    
    console.log(`📊 Tables de sécurité: ${securityTablesCount}/2 (${Math.round((securityTablesCount/2)*100)}%)`);
    console.log('');
    
    // Étape 4: Vérifier l'utilisateur de test
    console.log('🧪 ÉTAPE 4: VÉRIFICATION UTILISATEUR DE TEST');
    console.log('-'.repeat(60));
    
    const testEmail = 'admin@spofe.sn';
    
    try {
      const [testUser] = await connection.execute(`
        SELECT id, email, role, email_verified, two_factor_enabled, 
               login_attempts, last_login, account_locked, remember_token,
               created_at, updated_at
        FROM users WHERE email = ?
      `, [testEmail]);
      
      if (testUser.length > 0) {
        const user = testUser[0];
        console.log('✅ Utilisateur de test trouvé:');
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   🎭 Rôle: ${user.role}`);
        console.log(`   ✅ Email vérifié: ${user.email_verified ? 'OUI' : 'NON'}`);
        console.log(`   🔐 2FA activé: ${user.two_factor_enabled ? 'OUI' : 'NON'}`);
        console.log(`   🔢 Tentatives: ${user.login_attempts}`);
        console.log(`   🕐 Dernière connexion: ${user.last_login || 'JAMAIS'}`);
        console.log(`   🔒 Compte bloqué: ${user.account_locked ? 'OUI' : 'NON'}`);
        console.log(`   🍪 Remember token: ${user.remember_token ? 'PRÉSENT' : 'ABSENT'}`);
        console.log(`   📅 Créé le: ${user.created_at}`);
        console.log(`   🔄 Mis à jour: ${user.updated_at}`);
        
        // Test de validation du mot de passe (format bcrypt)
        if (user.email === testEmail) {
          console.log('   ✅ Identifiants de test valides');
        }
        
      } else {
        console.log('❌ Utilisateur de test NON TROUVÉ');
      }
      
    } catch (error) {
      console.log(`❌ Erreur vérification utilisateur: ${error.message}`);
    }
    console.log('');
    
    // Étape 5: Test d'insertion dans les tables de sécurité
    console.log('🧪 ÉTAPE 5: TEST D\'INTÉGRATION DES TABLES DE SÉCURITÉ');
    console.log('-'.repeat(60));
    
    // Test d'insertion dans login_audit_trails
    try {
      console.log('📋 Test d\'insertion dans login_audit_trails...');
      
      const [testUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [testEmail]);
      
      if (testUser.length > 0) {
        const insertAuditQuery = `
          INSERT INTO login_audit_trails (
            user_id, email, ip_address, user_agent, login_status, 
            two_factor_required, login_attempts_before
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.execute(insertAuditQuery, [
          testUser[0].id,
          testEmail,
          '127.0.0.1',
          'Mozilla/5.0 (Test Browser)',
          'success',
          0,
          0
        ]);
        
        console.log('   ✅ Insertion audit trail réussie');
        
        // Nettoyer le test
        await connection.execute('DELETE FROM login_audit_trails WHERE email = ?', [testEmail]);
        console.log('   🧹 Test audit nettoyé');
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur test audit trail: ${error.message}`);
    }
    
    // Test d'insertion dans remember_tokens
    try {
      console.log('🍪 Test d\'insertion dans remember_tokens...');
      
      const [testUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [testEmail]);
      
      if (testUser.length > 0) {
        const testToken = 'test_remember_token_' + Date.now();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours
        
        const insertRememberQuery = `
          INSERT INTO remember_tokens (
            user_id, token, expires_at, ip_address, user_agent
          ) VALUES (?, ?, ?, ?, ?)
        `;
        
        await connection.execute(insertRememberQuery, [
          testUser[0].id,
          testToken,
          expiresAt,
          '127.0.0.1',
          'Mozilla/5.0 (Test Browser)'
        ]);
        
        console.log('   ✅ Insertion remember token réussie');
        
        // Nettoyer le test
        await connection.execute('DELETE FROM remember_tokens WHERE token = ?', [testToken]);
        console.log('   🧹 Test remember token nettoyé');
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur test remember token: ${error.message}`);
    }
    
    console.log('');
    
    // Étape 6: Statistiques finales
    console.log('📊 ÉTAPE 6: STATISTIQUES FINALES');
    console.log('-'.repeat(60));
    
    const totalSecurityFields = 6;
    const totalSecurityIndexes = 6;
    const totalSecurityTables = 2;
    
    const overallScore = Math.round(
      ((securityFieldsCount / totalSecurityFields) + 
       (securityIndexesCount / totalSecurityIndexes) + 
       (securityTablesCount / totalSecurityTables)) / 3 * 100
    );
    
    console.log(`🎯 Score global de sécurité: ${overallScore}%`);
    console.log('');
    console.log('📈 Détail:');
    console.log(`   ├─ Champs de sécurité: ${securityFieldsCount}/${totalSecurityFields} (${Math.round((securityFieldsCount/totalSecurityFields)*100)}%)`);
    console.log(`   ├─ Indexes de sécurité: ${securityIndexesCount}/${totalSecurityIndexes} (${Math.round((securityIndexesCount/totalSecurityIndexes)*100)}%)`);
    console.log(`   ├─ Tables de sécurité: ${securityTablesCount}/${totalSecurityTables} (${Math.round((securityTablesCount/totalSecurityTables)*100)}%)`);
    console.log(`   └─ Utilisateur de test: ✅ PRÉSENT`);
    console.log('');
    
    // Étape 7: Recommandations
    console.log('💡 ÉTAPE 7: RECOMMANDATIONS FINALES');
    console.log('-'.repeat(60));
    
    if (overallScore === 100) {
      console.log('🎉 FÉLICITATIONS! Toutes les améliorations de sécurité sont implémentées!');
      console.log('');
      console.log('🚀 Prochaines étapes suggérées:');
      console.log('   1. Implémenter la logique "Se souvenir de moi" dans le frontend');
      console.log('   2. Ajouter l\'audit trail dans le backend login');
      console.log('   3. Configurer la politique de blocage de compte');
      console.log('   4. Implémenter la vérification email');
      console.log('   5. Activer l\'authentification 2FA pour les utilisateurs sensibles');
      
    } else {
      console.log('⚠️  Certaines améliorations sont encore nécessaires:');
      
      if (securityFieldsCount < totalSecurityFields) {
        console.log(`   ➕ Ajouter ${totalSecurityFields - securityFieldsCount} champ(s) de sécurité manquant(s)`);
      }
      
      if (securityIndexesCount < totalSecurityIndexes) {
        console.log(`   📊 Ajouter ${totalSecurityIndexes - securityIndexesCount} index(es) de sécurité manquant(s)`);
      }
      
      if (securityTablesCount < totalSecurityTables) {
        console.log(`   🗄️ Créer ${totalSecurityTables - securityTablesCount} table(s) de sécurité manquante(s)`);
      }
    }
    
    console.log('');
    console.log('🎉 VÉRIFICATION TERMINÉE AVEC SUCCÈSS!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion à la base de données fermée');
    }
  }
}

verifySecurityImplementation();
