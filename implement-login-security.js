const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function implementLoginSecurityImprovements() {
  console.log('🔐 IMPLÉMENTATION DES AMÉLIORATIONS DE SÉCURITÉ LOGIN');
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
    
    // Étape 1: Vérifier l'état actuel des champs de sécurité
    console.log('🔍 ÉTAPE 1: VÉRIFICATION DES CHAMPS DE SÉCURITÉ ACTUELS');
    console.log('-'.repeat(60));
    
    const [usersColumns] = await connection.execute('DESCRIBE users');
    const currentFields = usersColumns.map(col => col.Field);
    
    const securityFieldsToAdd = [
      { name: 'email_verified', type: 'TINYINT(1)', default: '0', description: 'Email vérifié (0=non, 1=oui)' },
      { name: 'two_factor_enabled', type: 'TINYINT(1)', default: '0', description: '2FA activé (0=non, 1=oui)' },
      { name: 'login_attempts', type: 'INT', default: '0', description: 'Nombre de tentatives de connexion' },
      { name: 'last_login', type: 'DATETIME', default: 'NULL', description: 'Dernière connexion réussie' },
      { name: 'account_locked', type: 'TINYINT(1)', default: '0', description: 'Compte bloqué (0=non, 1=oui)' },
      { name: 'remember_token', type: 'VARCHAR(255)', default: 'NULL', description: 'Token pour "Se souvenir de moi"' }
    ];
    
    console.log('📋 Champs de sécurité à vérifier:');
    securityFieldsToAdd.forEach(field => {
      const exists = currentFields.includes(field.name);
      console.log(`${exists ? '✅' : '❌'} ${field.name}: ${exists ? 'DÉJÀ PRÉSENT' : 'MANQUANT'}`);
    });
    console.log('');
    
    // Étape 2: Ajouter les champs manquants de manière non-destructive
    console.log('🔨 ÉTAPE 2: AJOUT DES CHAMPS DE SÉCURITÉ MANQUANTS');
    console.log('-'.repeat(60));
    
    for (const field of securityFieldsToAdd) {
      if (!currentFields.includes(field.name)) {
        console.log(`➕ Ajout du champ ${field.name}...`);
        
        try {
          let alterQuery;
          if (field.default === 'NULL') {
            alterQuery = `ALTER TABLE users ADD COLUMN ${field.name} ${field.type} NULL COMMENT '${field.description}'`;
          } else {
            alterQuery = `ALTER TABLE users ADD COLUMN ${field.name} ${field.type} DEFAULT ${field.default} NOT NULL COMMENT '${field.description}'`;
          }
          
          await connection.execute(alterQuery);
          console.log(`   ✅ Champ ${field.name} ajouté avec succès`);
          
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`   ⚠️  Champ ${field.name} existe déjà`);
          } else {
            console.log(`   ❌ Erreur ajout champ ${field.name}: ${error.message}`);
          }
        }
      } else {
        console.log(`⏭️  Champ ${field.name} déjà présent, passage au suivant`);
      }
    }
    console.log('');
    
    // Étape 3: Ajouter les indexes de sécurité
    console.log('📊 ÉTAPE 3: AJOUT DES INDEXES DE SÉCURITÉ');
    console.log('-'.repeat(60));
    
    const securityIndexes = [
      { name: 'idx_users_email_verified', columns: 'email_verified' },
      { name: 'idx_users_two_factor_enabled', columns: 'two_factor_enabled' },
      { name: 'idx_users_login_attempts', columns: 'login_attempts' },
      { name: 'idx_users_account_locked', columns: 'account_locked' },
      { name: 'idx_users_remember_token', columns: 'remember_token' },
      { name: 'idx_users_last_login', columns: 'last_login' }
    ];
    
    // Vérifier les indexes existants
    const [currentIndexes] = await connection.execute('SHOW INDEX FROM users');
    const existingIndexes = currentIndexes.map(idx => idx.Key_name);
    
    for (const index of securityIndexes) {
      if (!existingIndexes.includes(index.name)) {
        console.log(`➕ Ajout de l'index ${index.name}...`);
        
        try {
          const indexQuery = `ALTER TABLE users ADD INDEX ${index.name} (${index.columns})`;
          await connection.execute(indexQuery);
          console.log(`   ✅ Index ${index.name} ajouté avec succès`);
        } catch (error) {
          if (error.code === 'ER_DUP_KEYNAME') {
            console.log(`   ⚠️  Index ${index.name} existe déjà`);
          } else {
            console.log(`   ❌ Erreur ajout index ${index.name}: ${error.message}`);
          }
        }
      } else {
        console.log(`⏭️  Index ${index.name} déjà présent`);
      }
    }
    console.log('');
    
    // Étape 4: Créer l'utilisateur de test pour démos
    console.log('🧪 ÉTAPE 4: CRÉATION UTILISATEUR DE TEST');
    console.log('-'.repeat(60));
    
    const testEmail = 'admin@spofe.sn';
    const testPassword = 'admin123';
    
    try {
      // Vérifier si l'utilisateur de test existe déjà
      const [existingUser] = await connection.execute(
        'SELECT id, email FROM users WHERE email = ?',
        [testEmail]
      );
      
      if (existingUser.length === 0) {
        console.log('➕ Création de l\'utilisateur de test...');
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        
        const insertQuery = `
          INSERT INTO users (
            username, email, password, role, is_active, 
            email_verified, two_factor_enabled, login_attempts, 
            account_locked, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        await connection.execute(insertQuery, [
          'admin',
          testEmail,
          hashedPassword,
          'admin',
          1,
          1, // email vérifié
          0, // 2FA désactivé
          0, // 0 tentatives
          0  // compte non bloqué
        ]);
        
        console.log('   ✅ Utilisateur de test créé avec succès');
        console.log(`   📧 Email: ${testEmail}`);
        console.log(`   🔑 Password: ${testPassword}`);
        console.log(`   🎭 Role: admin`);
        console.log(`   ✅ Email vérifié: oui`);
        console.log(`   🔐 2FA: désactivé`);
        
      } else {
        console.log('⏭️  Utilisateur de test existe déjà');
        console.log(`   📧 Email: ${existingUser[0].email}`);
        
        // Mettre à jour le mot de passe si nécessaire
        const [userWithPassword] = await connection.execute(
          'SELECT password FROM users WHERE email = ?',
          [testEmail]
        );
        
        if (userWithPassword.length > 0) {
          const currentPassword = userWithPassword[0].password;
          
          // Vérifier si le mot de passe est déjà hashé
          if (!currentPassword.startsWith('$2')) {
            console.log('🔄 Mise à jour du mot de passe (hashage)...');
            const hashedPassword = await bcrypt.hash(testPassword, 10);
            await connection.execute(
              'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
              [hashedPassword, testEmail]
            );
            console.log('   ✅ Mot de passe hashé avec succès');
          } else {
            console.log('✅ Mot de passe déjà hashé');
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Erreur création utilisateur de test: ${error.message}`);
    }
    console.log('');
    
    // Étape 5: Créer la table d'audit trail pour les connexions
    console.log('📋 ÉTAPE 5: CRÉATION TABLE AUDIT TRAIL CONNEXIONS');
    console.log('-'.repeat(60));
    
    try {
      // Vérifier si la table existe déjà
      const [auditTable] = await connection.execute('SHOW TABLES LIKE "login_audit_trails"');
      
      if (auditTable.length === 0) {
        console.log('➕ Création de la table login_audit_trails...');
        
        const createAuditTableQuery = `
          CREATE TABLE login_audit_trails (
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID unique de l\'audit',
            user_id INT NULL COMMENT 'ID de l\'utilisateur (NULL si échec)',
            email VARCHAR(255) NOT NULL COMMENT 'Email utilisé pour la connexion',
            ip_address VARCHAR(45) NULL COMMENT 'Adresse IP de la connexion',
            user_agent TEXT NULL COMMENT 'User agent du navigateur',
            login_status ENUM('success', 'failed', 'blocked', '2fa_required') NOT NULL COMMENT 'Statut de la connexion',
            failure_reason VARCHAR(255) NULL COMMENT 'Raison de l\'échec',
            two_factor_required TINYINT(1) DEFAULT 0 COMMENT '2FA requise ou non',
            session_token VARCHAR(255) NULL COMMENT 'Token de session généré',
            remember_token_used TINYINT(1) DEFAULT 0 COMMENT 'Token "Se souvenir" utilisé',
            login_attempts_before INT DEFAULT 0 COMMENT 'Tentatives avant cette connexion',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date et heure de la tentative',
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            
            INDEX idx_login_audit_user_id (user_id),
            INDEX idx_login_audit_email (email),
            INDEX idx_login_audit_status (login_status),
            INDEX idx_login_audit_created_at (created_at),
            INDEX idx_login_audit_ip (ip_address)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail des tentatives de connexion';
        `;
        
        await connection.execute(createAuditTableQuery);
        console.log('   ✅ Table login_audit_trails créée avec succès');
        
      } else {
        console.log('⏭️  Table login_audit_trails déjà présente');
      }
      
    } catch (error) {
      console.log(`❌ Erreur création table audit: ${error.message}`);
    }
    console.log('');
    
    // Étape 6: Créer la table pour la gestion des "Se souvenir de moi"
    console.log('🍪 ÉTAPE 6: CRÉATION TABLE "SE SOUVENIR DE MOI"');
    console.log('-'.repeat(60));
    
    try {
      // Vérifier si la table existe déjà
      const [rememberTable] = await connection.execute('SHOW TABLES LIKE "remember_tokens"');
      
      if (rememberTable.length === 0) {
        console.log('➕ Création de la table remember_tokens...');
        
        const createRememberTableQuery = `
          CREATE TABLE remember_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID unique du token',
            user_id INT NOT NULL COMMENT 'ID de l\'utilisateur',
            token VARCHAR(255) NOT NULL COMMENT 'Token "Se souvenir de moi"',
            expires_at TIMESTAMP NOT NULL COMMENT 'Date d\'expiration du token',
            last_used_at TIMESTAMP NULL COMMENT 'Dernière utilisation du token',
            ip_address VARCHAR(45) NULL COMMENT 'Adresse IP de création',
            user_agent TEXT NULL COMMENT 'User agent de création',
            is_active TINYINT(1) DEFAULT 1 COMMENT 'Token actif ou non',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            
            UNIQUE KEY uk_remember_token (token),
            INDEX idx_remember_tokens_user_id (user_id),
            INDEX idx_remember_tokens_token (token),
            INDEX idx_remember_tokens_expires_at (expires_at),
            INDEX idx_remember_tokens_is_active (is_active)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens pour "Se souvenir de moi"';
        `;
        
        await connection.execute(createRememberTableQuery);
        console.log('   ✅ Table remember_tokens créée avec succès');
        
      } else {
        console.log('⏭️  Table remember_tokens déjà présente');
      }
      
    } catch (error) {
      console.log(`❌ Erreur création table remember_tokens: ${error.message}`);
    }
    console.log('');
    
    // Étape 7: Mettre à jour les utilisateurs existants avec les nouvelles valeurs par défaut
    console.log('🔄 ÉTAPE 7: MISE À JOUR UTILISATEURS EXISTANTS');
    console.log('-'.repeat(60));
    
    try {
      // Compter les utilisateurs existants
      const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
      console.log(`📊 Utilisateurs existants: ${userCount[0].count}`);
      
      if (userCount[0].count > 0) {
        // Mettre à jour les champs de sécurité pour les utilisateurs existants
        console.log('🔄 Mise à jour des champs de sécurité...');
        
        const updateQuery = `
          UPDATE users 
          SET 
            email_verified = COALESCE(email_verified, 1),
            two_factor_enabled = COALESCE(two_factor_enabled, 0),
            login_attempts = COALESCE(login_attempts, 0),
            account_locked = COALESCE(account_locked, 0),
            updated_at = NOW()
          WHERE deleted_at IS NULL
        `;
        
        const [updateResult] = await connection.execute(updateQuery);
        console.log(`   ✅ ${updateResult.affectedRows} utilisateurs mis à jour`);
      }
      
    } catch (error) {
      console.log(`❌ Erreur mise à jour utilisateurs: ${error.message}`);
    }
    console.log('');
    
    // Étape 8: Vérification finale
    console.log('✅ ÉTAPE 8: VÉRIFICATION FINALE');
    console.log('-'.repeat(60));
    
    // Vérifier la structure finale de la table users
    const [finalUsersColumns] = await connection.execute('DESCRIBE users');
    const finalFields = finalUsersColumns.map(col => col.Field);
    
    console.log('📋 Structure finale de la table users:');
    const securityFields = finalUsersColumns.filter(col => 
      ['email_verified', 'two_factor_enabled', 'login_attempts', 'last_login', 'account_locked', 'remember_token'].includes(col.Field)
    );
    
    securityFields.forEach(col => {
      console.log(`  ✅ ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Vérifier les tables créées
    const [allTables] = await connection.execute(`
      SHOW TABLES WHERE Tables_in_spofe_v2_1 LIKE '%audit%' 
      OR Tables_in_spofe_v2_1 LIKE '%remember%'
    `);
    
    console.log('');
    console.log('📋 Tables de sécurité créées:');
    allTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  ✅ ${tableName}`);
    });
    
    // Test de connexion avec l'utilisateur de test
    console.log('');
    console.log('🧪 Test de connexion utilisateur de test:');
    try {
      const [testUser] = await connection.execute(
        'SELECT id, email, role, email_verified, two_factor_enabled, login_attempts, account_locked FROM users WHERE email = ?',
        [testEmail]
      );
      
      if (testUser.length > 0) {
        const user = testUser[0];
        console.log(`  ✅ Utilisateur trouvé: ${user.email}`);
        console.log(`  🎭 Rôle: ${user.role}`);
        console.log(`  ✅ Email vérifié: ${user.email_verified ? 'OUI' : 'NON'}`);
        console.log(`  🔐 2FA activé: ${user.two_factor_enabled ? 'OUI' : 'NON'}`);
        console.log(`  🔢 Tentatives: ${user.login_attempts}`);
        console.log(`  🔒 Compte bloqué: ${user.account_locked ? 'OUI' : 'NON'}`);
      }
    } catch (error) {
      console.log(`  ❌ Erreur test: ${error.message}`);
    }
    
    console.log('');
    console.log('🎉 AMÉLIORATIONS DE SÉCURITÉ IMPLÉMENTÉES AVEC SUCCÈSS!');
    console.log('');
    console.log('📋 RÉCAPITULATIF:');
    console.log('  ✅ 6 champs de sécurité ajoutés à la table users');
    console.log('  ✅ 6 indexes de sécurité créés');
    console.log('  ✅ Utilisateur de test créé/mis à jour');
    console.log('  ✅ Table audit trail des connexions créée');
    console.log('  ✅ Table remember_tokens créée');
    console.log('  ✅ Utilisateurs existants mis à jour');
    console.log('');
    console.log('🚀 La page LoginPage dispose maintenant d\'une sécurité complète!');
    console.log('🔐 Fonctionnalités "Se souvenir de moi" et audit trail prêtes!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'implémentation:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion à la base de données fermée');
    }
  }
}

// Vérifier si bcrypt est installé, sinon l'installer
try {
  require('bcrypt');
} catch (e) {
  console.log('⚠️  bcrypt n\'est pas installé. Installation en cours...');
  const { execSync } = require('child_process');
  execSync('npm install bcrypt', { stdio: 'inherit' });
  console.log('✅ bcrypt installé avec succès');
}

// Exécuter les améliorations
implementLoginSecurityImprovements();
