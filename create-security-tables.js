const mysql = require('mysql2/promise');

async function createSecurityTables() {
  console.log('🔧 CRÉATION MANUELLE DES TABLES DE SÉCURITÉ');
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
    
    // Créer la table login_audit_trails
    console.log('📋 Création de la table login_audit_trails...');
    
    const createAuditTableQuery = `
      CREATE TABLE login_audit_trails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        email VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        login_status ENUM('success', 'failed', 'blocked', '2fa_required') NOT NULL,
        failure_reason VARCHAR(255) NULL,
        two_factor_required TINYINT(1) DEFAULT 0,
        session_token VARCHAR(255) NULL,
        remember_token_used TINYINT(1) DEFAULT 0,
        login_attempts_before INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_login_audit_user_id (user_id),
        INDEX idx_login_audit_email (email),
        INDEX idx_login_audit_status (login_status),
        INDEX idx_login_audit_created_at (created_at),
        INDEX idx_login_audit_ip (ip_address)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    try {
      await connection.execute(createAuditTableQuery);
      console.log('   ✅ Table login_audit_trails créée avec succès');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('   ⚠️  Table login_audit_trails existe déjà');
      } else {
        console.log(`   ❌ Erreur création table audit: ${error.message}`);
      }
    }
    
    // Créer la table remember_tokens
    console.log('🍪 Création de la table remember_tokens...');
    
    const createRememberTableQuery = `
      CREATE TABLE remember_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        last_used_at TIMESTAMP NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        UNIQUE KEY uk_remember_token (token),
        INDEX idx_remember_tokens_user_id (user_id),
        INDEX idx_remember_tokens_token (token),
        INDEX idx_remember_tokens_expires_at (expires_at),
        INDEX idx_remember_tokens_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    try {
      await connection.execute(createRememberTableQuery);
      console.log('   ✅ Table remember_tokens créée avec succès');
    } catch (error) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('   ⚠️  Table remember_tokens existe déjà');
      } else {
        console.log(`   ❌ Erreur création table remember_tokens: ${error.message}`);
      }
    }
    
    console.log('');
    console.log('🎉 TABLES DE SÉCURITÉ CRÉÉES AVEC SUCCÈSS!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion à la base de données fermée');
    }
  }
}

createSecurityTables();
