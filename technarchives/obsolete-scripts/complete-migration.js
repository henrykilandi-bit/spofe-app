import mysql from 'mysql2/promise';

async function completeeMigration() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spofe_v2_1',
    multipleStatements: true
  });

  try {
    console.log('🔧 COMPLÉTEMENT DE LA MIGRATION CONSULTANT\n');

    // 1. Créer la table compagnie_permissions
    console.log('1️⃣  Création de la table "compagnie_permissions"...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS compagnie_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        compagnie_id INT NOT NULL,
        permission VARCHAR(50) NOT NULL,
        granted_by INT NOT NULL,
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT true,
        UNIQUE KEY unique_user_compagnie_permission (user_id, compagnie_id, permission),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
        FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('   ✅ Créée\n');

    // 2. Créer les indexes pour compagnie_permissions
    console.log('2️⃣  Création des indexes...');
    await conn.query(`
      CREATE INDEX IF NOT EXISTS idx_compagnie_permissions_user ON compagnie_permissions(user_id);
      CREATE INDEX IF NOT EXISTS idx_compagnie_permissions_compagnie ON compagnie_permissions(compagnie_id);
      CREATE INDEX IF NOT EXISTS idx_compagnie_permissions_active ON compagnie_permissions(is_active);
    `);
    console.log('   ✅ Indexes créés\n');

    // 3. Créer la vue available_consultants
    console.log('3️⃣  Création de la vue "available_consultants"...');
    await conn.query(`
      CREATE OR REPLACE VIEW available_consultants AS
      SELECT
        u.id,
        u.prenom,
        u.nom,
        u.email,
        u.telephone,
        u.specialites,
        u.tarif_horaire,
        u.experience_years,
        u.role,
        u.created_at,
        cf.nom as firm_name,
        cf.type as firm_type,
        (SELECT COUNT(*)
         FROM consultant_group_assignments cga2
         WHERE cga2.consultant_id = u.id AND cga2.status = 'active') as active_groups_count,
        (SELECT AVG(cga2.billing_rate)
         FROM consultant_group_assignments cga2
         WHERE cga2.consultant_id = u.id AND cga2.status = 'active' AND cga2.billing_rate IS NOT NULL) as avg_billing_rate
      FROM users u
      LEFT JOIN firm_consultants fc ON u.id = fc.consultant_id
      LEFT JOIN consulting_firms cf ON fc.firm_id = cf.id
      WHERE u.role IN ('super_consultant', 'consultant')
        AND u.is_active = true
      GROUP BY u.id, cf.id
    `);
    console.log('   ✅ Créée\n');

    // 4. Créer la vue consultant_group_summary
    console.log('4️⃣  Création de la vue "consultant_group_summary"...');
    await conn.query(`
      CREATE OR REPLACE VIEW consultant_group_summary AS
      SELECT
        cga.groupe_id,
        ge.nom as groupe_nom,
        COUNT(cga.consultant_id) as total_consultants,
        SUM(CASE WHEN cga.status = 'active' THEN 1 ELSE 0 END) as active_consultants,
        SUM(CASE WHEN cga.status = 'pending' THEN 1 ELSE 0 END) as pending_consultants,
        AVG(cga.billing_rate) as avg_billing_rate,
        GROUP_CONCAT(DISTINCT u.prenom, ' ', u.nom) as consultant_names
      FROM consultant_group_assignments cga
      JOIN users u ON cga.consultant_id = u.id
      JOIN groupes_entreprises ge ON cga.groupe_id = ge.id
      GROUP BY cga.groupe_id
    `);
    console.log('   ✅ Créée\n');

    // 5. Insérer les données de configuration du workflow d'approbation
    console.log('5️⃣  Configuration du workflow d\'approbation...');
    
    // D'abord, supprimer les données existantes
    await conn.query('DELETE FROM role_approval_workflow');
    
    // Puis insérer les données
    await conn.query(`
      INSERT INTO role_approval_workflow (requested_role, approver_role, min_hierarchy_level, requires_group_creation, requires_company_creation, auto_approve_if_creator_has_role) VALUES
      ('super_utilisateur', 'admin', 1, true, false, false),
      ('utilisateur', 'super_utilisateur', 2, false, true, false),
      ('super_consultant', 'super_utilisateur', 3, false, false, false),
      ('consultant', 'super_utilisateur', 3, false, false, false)
    `);
    console.log('   ✅ 4 workflows configurés\n');

    // 6. Vérification finale
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ MIGRATION COMPLÉTÉE AVEC SUCCÈS!');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('📊 RÉSUMÉ DES CHANGEMENTS:');
    console.log('   ✅ Table "compagnie_permissions" créée');
    console.log('   ✅ Indexes de performance ajoutés');
    console.log('   ✅ Vue "available_consultants" créée');
    console.log('   ✅ Vue "consultant_group_summary" créée');
    console.log('   ✅ 4 workflows d\'approbation configurés\n');

    await conn.end();

  } catch (error) {
    console.error('❌ Erreur lors du complètement:');
    console.error(error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  }
}

completeeMigration();
