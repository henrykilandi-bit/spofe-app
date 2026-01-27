const mysql = require('mysql2/promise');
const fs = require('fs');

async function analyzeRegisterConnections() {
  console.log('🔍 ANALYSE COMPLÈTE DES CONNEXIONS REGISTER PAGE → BASE DE DONNÉES');
  console.log('='.repeat(80));
  
  try {
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'spofe_v2_1'
    });
    
    console.log('✅ Connexion réussie à la base de données spofe_v2_1');
    console.log('');
    
    // Mapping des champs du formulaire vers les tables
    const fieldMappings = {
      // Étape 1: Informations de base
      'formData.email': { table: 'users', field: 'email', type: 'VARCHAR(255)', required: true },
      'formData.username': { table: 'users', field: 'username', type: 'VARCHAR(255)', required: true },
      'formData.password': { table: 'users', field: 'password', type: 'VARCHAR(255)', required: true },
      'formData.prenom': { table: 'users', field: 'prenom', type: 'VARCHAR(100)', required: false },
      'formData.nom': { table: 'users', field: 'nom', type: 'VARCHAR(100)', required: false },
      'formData.telephone': { table: 'users', field: 'telephone', type: 'VARCHAR(20)', required: false },
      
      // Étape 2: Rôle
      'formData.role': { table: 'users', field: 'role', type: 'ENUM', required: true },
      
      // Super Utilisateur - Étape 3
      'formData.groupeName': { table: 'groupes_entreprises', field: 'nom', type: 'VARCHAR(255)', required: true },
      'formData.groupeDescription': { table: 'groupes_entreprises', field: 'description', type: 'TEXT', required: false },
      'formData.groupeSiret': { table: 'users', field: 'siret', type: 'VARCHAR(14)', required: false },
      'formData.groupeAdresse': { table: 'users', field: 'adresse', type: 'VARCHAR(255)', required: false },
      'formData.groupeEmail': { table: 'users', field: 'email', type: 'VARCHAR(255)', required: true },
      'formData.groupeTelephone': { table: 'users', field: 'telephone', type: 'VARCHAR(20)', required: false },
      'formData.groupeWebsite': { table: 'users', field: 'website', type: 'VARCHAR(255)', required: false },
      
      // Utilisateur - Étape 3
      'formData.groupeId': { table: 'users', field: 'groupe_id', type: 'INT(11)', required: false },
      'formData.compagnieName': { table: 'compagnies', field: 'name', type: 'VARCHAR(255)', required: true },
      'formData.compagnieSiret': { table: 'compagnies', field: 'registration_number', type: 'VARCHAR(255)', required: false },
      'formData.compagnieDescription': { table: 'users', field: 'description', type: 'TEXT', required: false },
      'formData.compagnieEmail': { table: 'compagnies', field: 'email', type: 'VARCHAR(255)', required: false },
      'formData.compagnieTelephone': { table: 'compagnies', field: 'phone', type: 'VARCHAR(255)', required: false },
      'formData.compagnieAdresse': { table: 'compagnies', field: 'address', type: 'VARCHAR(255)', required: false },
      'formData.compagnieWebsite': { table: 'compagnies', field: 'website', type: 'VARCHAR(255)', required: false },
      
      // Consultant - Étape 3
      'formData.specialites': { table: 'users', field: 'specialites', type: 'LONGTEXT', required: false },
      'formData.tarifHoraire': { table: 'users', field: 'tarif_horaire', type: 'DECIMAL(10,2)', required: false },
      'formData.experienceYears': { table: 'users', field: 'experience_years', type: 'INT(11)', required: false },
      'formData.siret': { table: 'users', field: 'siret', type: 'VARCHAR(14)', required: false },
      'formData.registrationType': { table: 'users', field: 'type_consultant', type: 'VARCHAR(50)', required: false },
      'formData.firmType': { table: 'consulting_firms', field: 'type', type: 'VARCHAR(50)', required: false },
      'formData.firmName': { table: 'consulting_firms', field: 'name', type: 'VARCHAR(255)', required: true },
      'formData.firmSiret': { table: 'consulting_firms', field: 'registration_number', type: 'VARCHAR(255)', required: false },
      'formData.firmDescription': { table: 'consulting_firms', field: 'description', type: 'TEXT', required: false },
      
      // Invitation
      'formData.invitationToken': { table: 'users', field: 'invitation_token', type: 'VARCHAR(255)', required: false }
    };
    
    console.log('📋 MAPPING DES CHAMPS DU FORMULAIRE VERS LES TABLES:');
    console.log('');
    
    // Analyser chaque mapping
    for (const [formField, mapping] of Object.entries(fieldMappings)) {
      console.log(`🔗 ${formField}`);
      console.log(`   ├─ Table: ${mapping.table}`);
      console.log(`   ├─ Champ: ${mapping.field}`);
      console.log(`   ├─ Type: ${mapping.type}`);
      console.log(`   └─ Requis: ${mapping.required ? 'OUI' : 'NON'}`);
      
      // Vérifier si le champ existe dans la table
      try {
        const [columns] = await connection.execute(`DESCRIBE ${mapping.table}`);
        const fieldExists = columns.some(col => col.Field === mapping.field);
        
        if (fieldExists) {
          console.log(`   ✅ Champ trouvé dans la table`);
        } else {
          console.log(`   ❌ Champ NON TROUVÉ dans la table`);
        }
      } catch (error) {
        console.log(`   ⚠️  Erreur vérification table: ${error.message}`);
      }
      console.log('');
    }
    
    // Analyser les endpoints API utilisés
    console.log('🌐 ENDPOINTS API UTILISÉS PAR LA PAGE REGISTER:');
    console.log('');
    
    const apiEndpoints = [
      {
        method: 'GET',
        url: '/auth/validate-invitation',
        purpose: 'Validation des invitations',
        params: ['token', 'email']
      },
      {
        method: 'GET',
        url: '/groupes/{id}',
        purpose: 'Récupération infos groupe',
        params: ['id']
      },
      {
        method: 'GET',
        url: '/auth/check-email/{email}',
        purpose: 'Vérification disponibilité email',
        params: ['email']
      },
      {
        method: 'POST',
        url: '/auth/register',
        purpose: 'Inscription utilisateur',
        body: 'formData complet selon rôle'
      }
    ];
    
    apiEndpoints.forEach(endpoint => {
      console.log(`📡 ${endpoint.method} ${endpoint.url}`);
      console.log(`   ├─ Purpose: ${endpoint.purpose}`);
      console.log(`   └─ Params: ${endpoint.params.join(', ')}`);
      console.log('');
    });
    
    // Analyser les workflows par rôle
    console.log('👥 WORKFLOWS D\'INSCRIPTION PAR RÔLE:');
    console.log('');
    
    const workflows = {
      'super_utilisateur': {
        tables: ['users', 'groupes_entreprises'],
        steps: [
          'Création groupe_entreprises avec nom, description',
          'Création user avec groupe_id, rôle, infos personnelles',
          'Lien automatique user ↔ groupe'
        ],
        permissions: ['Création compagnies', 'Gestion utilisateurs', 'Approbations']
      },
      'utilisateur': {
        tables: ['users', 'compagnies', 'compagnie_permissions'],
        steps: [
          'Vérification groupe_id existant',
          'Création compagnie avec infos',
          'Création user avec groupe_id, rôle',
          'Création compagnie_permissions automatiques'
        ],
        permissions: ['Accès compagnie', 'Saisie comptabilité']
      },
      'consultant': {
        tables: ['users', 'consulting_firms', 'consultant_group_assignments'],
        steps: [
          'Création consulting_firms si registrationType=firm',
          'Création user avec infos consultant',
          'Assignation groupes si nécessaire'
        ],
        permissions: ['Consultation multi-compagnies', 'Rapports']
      }
    };
    
    for (const [role, workflow] of Object.entries(workflows)) {
      console.log(`🎭 ${role.toUpperCase()}`);
      console.log(`   ├─ Tables: ${workflow.tables.join(', ')}`);
      console.log(`   ├─ Steps:`);
      workflow.steps.forEach(step => {
        console.log(`   │  ├─ ${step}`);
      });
      console.log(`   └─ Permissions: ${workflow.permissions.join(', ')}`);
      console.log('');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
  }
}

analyzeRegisterConnections();
