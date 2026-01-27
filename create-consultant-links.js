const mysql = require('mysql2/promise');

async function createConsultantLinkTables() {
  console.log('🔗 CRÉATION MANUELLE DES TABLES DE LIAISON CONSULTANT');
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
    
    // Créer la table consultant_firm_assignments
    console.log('➕ Création de la table consultant_firm_assignments...');
    
    const createFirmAssignmentQuery = `
      CREATE TABLE consultant_firm_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        consulting_firm_id INT NOT NULL,
        role_in_firm VARCHAR(50) DEFAULT 'consultant',
        is_primary_firm TINYINT(1) DEFAULT 1,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_by INT NULL,
        expires_at TIMESTAMP NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (consulting_firm_id) REFERENCES consulting_firms(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        
        UNIQUE KEY uk_consultant_firm (user_id, consulting_firm_id),
        INDEX idx_consultant_firm_assignments_user (user_id),
        INDEX idx_consultant_firm_assignments_firm (consulting_firm_id),
        INDEX idx_consultant_firm_assignments_active (is_active),
        INDEX idx_consultant_firm_assignments_deleted (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    try {
      await connection.execute(createFirmAssignmentQuery);
      console.log('   ✅ Table consultant_firm_assignments créée avec succès');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('   ⚠️  Table consultant_firm_assignments existe déjà');
      } else {
        console.log(`   ❌ Erreur création table consultant_firm_assignments: ${error.message}`);
      }
    }
    
    // Créer la table consultant_group_access
    console.log('➕ Création de la table consultant_group_access...');
    
    const createGroupAccessQuery = `
      CREATE TABLE consultant_group_access (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        groupe_id INT NOT NULL,
        access_level ENUM('read', 'write', 'admin') DEFAULT 'read',
        granted_by INT NOT NULL,
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE,
        FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE,
        
        UNIQUE KEY uk_consultant_group (user_id, groupe_id),
        INDEX idx_consultant_group_access_user (user_id),
        INDEX idx_consultant_group_access_group (groupe_id),
        INDEX idx_consultant_group_access_level (access_level),
        INDEX idx_consultant_group_access_active (is_active),
        INDEX idx_consultant_group_access_deleted (deleted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    try {
      await connection.execute(createGroupAccessQuery);
      console.log('   ✅ Table consultant_group_access créée avec succès');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('   ⚠️  Table consultant_group_access existe déjà');
      } else {
        console.log(`   ❌ Erreur création table consultant_group_access: ${error.message}`);
      }
    }
    
    console.log('');
    console.log('🎉 TABLES DE LIAISON CONSULTANT CRÉÉES AVEC SUCCÈSS!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables de liaison:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion à la base de données fermée');
    }
  }
}

createConsultantLinkTables();
