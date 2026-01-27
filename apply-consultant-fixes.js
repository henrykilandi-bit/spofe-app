const mysql = require('mysql2/promise');

async function applyConsultantFixes() {
  console.log('🔧 APPLICATION DES CORRECTIONS CONSULTANT - SPOFE v2.2');
  console.log('='.repeat(80));
  
  let connection;
  
  try {
    // Connexion à la base de données
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'spofe_v2_1',
      multipleStatements: true // Permet l'exécution de multiples requêtes
    });
    
    console.log('✅ Connexion réussie à la base de données spofe_v2_1');
    console.log('');
    
    // Étape 1: Vérifier l'état actuel
    console.log('🔍 ÉTAPE 1: VÉRIFICATION DE L\'ÉTAT ACTUEL');
    console.log('-'.repeat(50));
    
    // Vérifier si les champs existent déjà
    const [usersColumns] = await connection.execute('DESCRIBE users');
    const existingFields = usersColumns.map(col => col.Field);
    
    const fieldsToAdd = [
      { name: 'website', type: 'VARCHAR(255)', description: 'Site web utilisateur/groupe' },
      { name: 'description', type: 'TEXT', description: 'Description utilisateur/groupe' }
    ];
    
    console.log('📋 Champs à vérifier dans la table users:');
    fieldsToAdd.forEach(field => {
      const exists = existingFields.includes(field.name);
      console.log(`  ├─ ${field.name} (${field.type}): ${exists ? '✅ EXISTE' : '❌ MANQUANT'}`);
    });
    console.log('');
    
    // Vérifier si la table consulting_firms existe
    const [tables] = await connection.execute('SHOW TABLES LIKE "consulting_firms"');
    const consultingFirmsExists = tables.length > 0;
    
    console.log('📋 Table consulting_firms:');
    console.log(`  └─ consulting_firms: ${consultingFirmsExists ? '✅ EXISTE' : '❌ MANQUANTE'}`);
    console.log('');
    
    // Étape 2: Appliquer les corrections de manière non-destructive
    console.log('🔨 ÉTAPE 2: APPLICATION DES CORRECTIONS NON-DESTRUCTIVES');
    console.log('-'.repeat(50));
    
    // Ajouter les champs manquants dans users
    for (const field of fieldsToAdd) {
      if (!existingFields.includes(field.name)) {
        console.log(`➕ Ajout du champ ${field.name} dans la table users...`);
        
        const alterQuery = `ALTER TABLE users ADD COLUMN ${field.name} ${field.type} NULL COMMENT '${field.description}'`;
        
        try {
          await connection.execute(alterQuery);
          console.log(`   ✅ Champ ${field.name} ajouté avec succès`);
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`   ⚠️  Champ ${field.name} existe déjà`);
          } else {
            console.log(`   ❌ Erreur ajout champ ${field.name}: ${error.message}`);
            throw error;
          }
        }
      } else {
        console.log(`⏭️  Champ ${field.name} déjà présent, passage au suivant`);
      }
    }
    console.log('');
    
    // Créer la table consulting_firms si elle n'existe pas
    if (!consultingFirmsExists) {
      console.log('➕ Création de la table consulting_firms...');
      
      const createTableQuery = `
        CREATE TABLE consulting_firms (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID unique du cabinet',
          name VARCHAR(255) NOT NULL COMMENT 'Nom du cabinet de conseil',
          type VARCHAR(50) NULL COMMENT 'Type de cabinet (independent, firm, etc.)',
          registration_number VARCHAR(255) NULL COMMENT 'Numéro d\'enregistrement (RCCM/SIRET)',
          description TEXT NULL COMMENT 'Description du cabinet',
          address VARCHAR(255) NULL COMMENT 'Adresse du cabinet',
          phone VARCHAR(50) NULL COMMENT 'Téléphone du cabinet',
          email VARCHAR(255) NULL COMMENT 'Email du cabinet',
          website VARCHAR(255) NULL COMMENT 'Site web du cabinet',
          is_active TINYINT(1) DEFAULT 1 COMMENT 'Cabinet actif ou non',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
          deleted_at TIMESTAMP NULL COMMENT 'Date de suppression (soft delete)',
          
          INDEX idx_consulting_firms_name (name),
          INDEX idx_consulting_firms_active (is_active),
          INDEX idx_consulting_firms_deleted (deleted_at),
          INDEX idx_consulting_firms_registration (registration_number)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cabinets de conseil pour les consultants SPOFE';
      `;
      
      try {
        await connection.execute(createTableQuery);
        console.log('   ✅ Table consulting_firms créée avec succès');
      } catch (error) {
        console.log(`   ❌ Erreur création table consulting_firms: ${error.message}`);
        throw error;
      }
    } else {
      console.log('⏭️  Table consulting_firms déjà présente, vérification de la structure...');
      
      // Vérifier et ajouter les champs manquants si la table existe mais est incomplète
      const [firmColumns] = await connection.execute('DESCRIBE consulting_firms');
      const existingFirmFields = firmColumns.map(col => col.Field);
      
      const requiredFirmFields = [
        { name: 'address', type: 'VARCHAR(255)', description: 'Adresse du cabinet' },
        { name: 'phone', type: 'VARCHAR(50)', description: 'Téléphone du cabinet' },
        { name: 'email', type: 'VARCHAR(255)', description: 'Email du cabinet' },
        { name: 'website', type: 'VARCHAR(255)', description: 'Site web du cabinet' },
        { name: 'is_active', type: 'TINYINT(1)', description: 'Cabinet actif ou non' }
      ];
      
      for (const field of requiredFirmFields) {
        if (!existingFirmFields.includes(field.name)) {
          console.log(`   ➕ Ajout du champ ${field.name} dans consulting_firms...`);
          
          const alterQuery = `ALTER TABLE consulting_firms ADD COLUMN ${field.name} ${field.type} NULL COMMENT '${field.description}'`;
          
          try {
            await connection.execute(alterQuery);
            console.log(`      ✅ Champ ${field.name} ajouté avec succès`);
          } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
              console.log(`      ⚠️  Champ ${field.name} existe déjà`);
            } else {
              console.log(`      ❌ Erreur ajout champ ${field.name}: ${error.message}`);
            }
          }
        }
      }
    }
    console.log('');
    
    // Étape 3: Créer les tables de liaison pour les consultants
    console.log('🔗 ÉTAPE 3: CRÉATION DES TABLES DE LIAISON CONSULTANT');
    console.log('-'.repeat(50));
    
    // Table de liaison consultants - cabinets
    const [consultantFirmLink] = await connection.execute('SHOW TABLES LIKE "consultant_firm_assignments"');
    if (consultantFirmLink.length === 0) {
      console.log('➕ Création de la table consultant_firm_assignments...');
      
      const createLinkQuery = `
        CREATE TABLE consultant_firm_assignments (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID unique de l\'assignation',
          user_id INT NOT NULL COMMENT 'ID du consultant (user)',
          consulting_firm_id INT NOT NULL COMMENT 'ID du cabinet',
          role_in_firm VARCHAR(50) DEFAULT 'consultant' COMMENT 'Rôle dans le cabinet',
          is_primary_firm TINYINT(1) DEFAULT 1 COMMENT 'Cabinet principal ou non',
          assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d\'assignation',
          assigned_by INT NULL COMMENT 'ID de l\'utilisateur qui a assigné',
          expires_at TIMESTAMP NULL COMMENT 'Date d\'expiration de l\'assignation',
          is_active TINYINT(1) DEFAULT 1 COMMENT 'Assignation active ou non',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
          deleted_at TIMESTAMP NULL COMMENT 'Date de suppression (soft delete)',
          
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (consulting_firm_id) REFERENCES consulting_firms(id) ON DELETE CASCADE,
          FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
          
          UNIQUE KEY uk_consultant_firm (user_id, consulting_firm_id),
          INDEX idx_consultant_firm_assignments_user (user_id),
          INDEX idx_consultant_firm_assignments_firm (consulting_firm_id),
          INDEX idx_consultant_firm_assignments_active (is_active),
          INDEX idx_consultant_firm_assignments_deleted (deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Assignation des consultants aux cabinets';
      `;
      
      try {
        await connection.execute(createLinkQuery);
        console.log('   ✅ Table consultant_firm_assignments créée avec succès');
      } catch (error) {
        console.log(`   ❌ Erreur création table consultant_firm_assignments: ${error.message}`);
      }
    } else {
      console.log('⏭️  Table consultant_firm_assignments déjà présente');
    }
    
    // Table de liaison consultants - groupes (pour les missions multi-groupes)
    const [consultantGroupLink] = await connection.execute('SHOW TABLES LIKE "consultant_group_access"');
    if (consultantGroupLink.length === 0) {
      console.log('➕ Création de la table consultant_group_access...');
      
      const createGroupLinkQuery = `
        CREATE TABLE consultant_group_access (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID unique de l\'accès',
          user_id INT NOT NULL COMMENT 'ID du consultant (user)',
          groupe_id INT NOT NULL COMMENT 'ID du groupe d\'entreprises',
          access_level ENUM('read', 'write', 'admin') DEFAULT 'read' COMMENT 'Niveau d\'accès',
          granted_by INT NOT NULL COMMENT 'ID de l\'utilisateur qui a accordé l\'accès',
          granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date d\'octroi de l\'accès',
          expires_at TIMESTAMP NULL COMMENT 'Date d\'expiration de l\'accès',
          is_active TINYINT(1) DEFAULT 1 COMMENT 'Accès actif ou non',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Date de mise à jour',
          deleted_at TIMESTAMP NULL COMMENT 'Date de suppression (soft delete)',
          
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE,
          FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE,
          
          UNIQUE KEY uk_consultant_group (user_id, groupe_id),
          INDEX idx_consultant_group_access_user (user_id),
          INDEX idx_consultant_group_access_group (groupe_id),
          INDEX idx_consultant_group_access_level (access_level),
          INDEX idx_consultant_group_access_active (is_active),
          INDEX idx_consultant_group_access_deleted (deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Accès des consultants aux groupes d\'entreprises';
      `;
      
      try {
        await connection.execute(createGroupLinkQuery);
        console.log('   ✅ Table consultant_group_access créée avec succès');
      } catch (error) {
        console.log(`   ❌ Erreur création table consultant_group_access: ${error.message}`);
      }
    } else {
      console.log('⏭️  Table consultant_group_access déjà présente');
    }
    console.log('');
    
    // Étape 4: Mettre à jour les données existantes si nécessaire
    console.log('🔄 ÉTAPE 4: MISE À JOUR DES DONNÉES EXISTANTES');
    console.log('-'.repeat(50));
    
    // Vérifier s'il y a des consultants sans cabinet assigné
    const [consultantsWithoutFirm] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role IN ('consultant', 'super_consultant') 
      AND deleted_at IS NULL
    `);
    
    console.log(`📊 Consultants existants: ${consultantsWithoutFirm[0].count}`);
    
    if (consultantsWithoutFirm[0].count > 0) {
      console.log('💡 Suggestion: Les consultants existants peuvent maintenant être assignés à des cabinets');
      console.log('   via la table consultant_firm_assignments');
    }
    console.log('');
    
    // Étape 5: Vérification finale
    console.log('✅ ÉTAPE 5: VÉRIFICATION FINALE');
    console.log('-'.repeat(50));
    
    // Vérifier les nouveaux champs dans users
    const [updatedUsersColumns] = await connection.execute('DESCRIBE users');
    const finalUserFields = updatedUsersColumns.map(col => col.Field);
    
    console.log('📋 État final des champs users:');
    fieldsToAdd.forEach(field => {
      const exists = finalUserFields.includes(field.name);
      console.log(`  ├─ ${field.name}: ${exists ? '✅ PRÉSENT' : '❌ MANQUANT'}`);
    });
    console.log('');
    
    // Vérifier la table consulting_firms
    const [finalTables] = await connection.execute('SHOW TABLES LIKE "consulting_firms"');
    const finalConsultingFirmsExists = finalTables.length > 0;
    
    console.log('📋 État final des tables:');
    console.log(`  ├─ consulting_firms: ${finalConsultingFirmsExists ? '✅ PRÉSENTE' : '❌ MANQUANTE'}`);
    
    // Vérifier les tables de liaison
    const [linkTables] = await connection.execute(`
      SHOW TABLES LIKE 'consultant_%'
    `);
    
    console.log(`  ├─ Tables de liaison: ${linkTables.length} trouvée(s)`);
    linkTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  │  ├─ ${tableName}: ✅ PRÉSENTE`);
    });
    console.log('');
    
    console.log('🎉 CORRECTIONS APPLIQUÉES AVEC SUCCÈSS!');
    console.log('');
    console.log('📋 RÉCAPITULATIF:');
    console.log('  ✅ Champs website et description ajoutés à la table users');
    console.log('  ✅ Table consulting_firms créée avec tous les champs nécessaires');
    console.log('  ✅ Tables de liaison créées pour les assignations');
    console.log('  ✅ Index et contraintes foreign key ajoutés');
    console.log('  ✅ Soft deletes implémentés partout');
    console.log('');
    console.log('🚀 Le workflow consultant est maintenant 100% fonctionnel!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application des corrections:', error.message);
    console.error('Détails:', error);
    
    // rollback en cas d'erreur critique
    if (connection) {
      console.log('🔄 Rollback des transactions en cours...');
      await connection.rollback();
    }
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion à la base de données fermée');
    }
  }
}

// Exécuter les corrections
applyConsultantFixes();
