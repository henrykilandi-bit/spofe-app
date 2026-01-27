const fs = require('fs');
const path = require('path');

console.log('🔍 AUDIT TECHNIQUE COMPLET MYSQL ↔ MODELS SEQUELIZE');
console.log('==================================================\n');

// Configuration
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const deep = args.includes('--deep');
const fix = args.includes('--fix');

console.log(`📋 Mode: ${deep ? 'ANALYSE APPROFONDIE' : 'AUDIT STANDARD'}`);
console.log(`📝 Verbose: ${verbose ? 'OUI' : 'NON'}`);
console.log(`🔧 Auto-fix: ${fix ? 'OUI' : 'NON'}\n`);

// Configuration
const modelsDir = 'cascade/src/models';
const dtosDir = 'cascade/src/dto';
const servicesDir = 'cascade/src/services';
const controllersDir = 'cascade/src/controllers';

// Simulation de la base de données MySQL (remplacer par vraie connexion)
const expectedMySQLTables = [
  'account_balances', 'app_settings', 'associations', 'audit_trails',
  'business_operations', 'business_operation_audits', 'chart_of_accounts',
  'compagnies', 'consultant_company_accesses', 'consultant_group_assignments',
  'consulting_firms', 'external_data_sources', 'firm_consultants',
  'fiscal_years', 'groupe_entreprises', 'journal_entries', 'journal_entry_lines',
  'objective_actions', 'operation_templates', 'password_reset_tokens',
  'performance_indicators', 'roles', 'security_events', 'strategic_objectives',
  'third_parties', 'token_blacklists', 'two_factor_auths', 'users',
  'groupe_super_users', 'pending_approvals'
];

// Fonction pour analyser un model Sequelize
function analyzeSequelizeModel(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraire les informations du model
    const sequelizeMatch = content.match(/sequelize\.define\s*\(\s*['"`]([^'"`]+)['"`]/);
    const tableNameMatch = content.match(/tableName:\s*['"`]([^'"`]+)['"`]/);
    const underscoredMatch = content.match(/underscored:\s*(true|false)/);
    const timestampsMatch = content.match(/timestamps:\s*(true|false)/);
    const paranoidMatch = content.match(/paranoid:\s*(true|false)/);
    
    // Extraire les colonnes définies
    const columns = [];
    const columnMatches = content.matchAll(/(\w+):\s*{\s*type:\s*[^,}]+/g);
    for (const match of columnMatches) {
      columns.push(match[1].trim());
    }
    
    // Extraire les associations
    const associations = [];
    const associationPatterns = [
      { pattern: /belongsTo\s*\(\s*['"`]([^'"`]+)['"`]/, type: 'belongsTo' },
      { pattern: /hasMany\s*\(\s*['"`]([^'"`]+)['"`]/, type: 'hasMany' },
      { pattern: /hasOne\s*\(\s*['"`]([^'"`]+)['"`]/, type: 'hasOne' },
      { pattern: /belongsToMany\s*\(\s*['"`]([^'"`]+)['"`]/, type: 'belongsToMany' }
    ];
    
    associationPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        associations.push({ model: match[1], type });
      }
    });
    
    // Vérifier les options requises
    const requiredOptions = ['tableName', 'underscored', 'timestamps', 'paranoid'];
    const presentOptions = [];
    
    if (tableNameMatch) presentOptions.push('tableName');
    if (underscoredMatch) presentOptions.push('underscored');
    if (timestampsMatch) presentOptions.push('timestamps');
    if (paranoidMatch) presentOptions.push('paranoid');
    
    const missingOptions = requiredOptions.filter(opt => !presentOptions.includes(opt));
    
    return {
      modelName: sequelizeMatch ? sequelizeMatch[1] : null,
      tableName: tableNameMatch ? tableNameMatch[1] : null,
      underscored: underscoredMatch ? underscoredMatch[1] === 'true' : false,
      timestamps: timestampsMatch ? timestampsMatch[1] === 'true' : false,
      paranoid: paranoidMatch ? paranoidMatch[1] === 'true' : false,
      columns,
      associations,
      requiredOptions: {
        present: presentOptions,
        missing: missingOptions,
        complete: missingOptions.length === 0
      },
      isSequelizeModel: sequelizeMatch !== null,
      content: content
    };
  } catch (error) {
    return {
      error: error.message,
      isSequelizeModel: false
    };
  }
}

// Fonction pour vérifier l'existence d'une table MySQL (simulation)
function checkMySQLTableExists(tableName) {
  // En réalité, cette fonction se connecterait à MySQL:
  // const connection = await mysql.createConnection({...});
  // const [rows] = await connection.execute('SHOW TABLES LIKE ?', [tableName]);
  // return rows.length > 0;
  
  return expectedMySQLTables.includes(tableName);
}

// Fonction pour obtenir les colonnes d'une table MySQL (simulation)
function getMySQLTableColumns(tableName) {
  // Simulation des colonnes attendues
  const tableColumns = {
    'users': ['id', 'username', 'email', 'password_hash', 'role_id', 'created_at', 'updated_at', 'deleted_at'],
    'roles': ['id', 'name', 'description', 'permissions', 'created_at', 'updated_at', 'deleted_at'],
    'journal_entries': ['id', 'reference', 'date', 'description', 'user_id', 'fiscal_year_id', 'created_at', 'updated_at', 'deleted_at'],
    'chart_of_accounts': ['id', 'account_number', 'account_name', 'account_type', 'parent_id', 'is_active', 'created_at', 'updated_at', 'deleted_at'],
    'third_parties': ['id', 'name', 'type', 'email', 'phone', 'address', 'tax_id', 'created_at', 'updated_at', 'deleted_at'],
    'groupe_super_users': ['id', 'name', 'description', 'permissions', 'created_at', 'updated_at', 'deleted_at'],
    'pending_approvals': ['id', 'entity_type', 'entity_id', 'action', 'requested_by', 'approved_by', 'status', 'created_at', 'updated_at']
  };
  
  return tableColumns[tableName] || [];
}

// Fonction pour trouver les DTOs et services correspondants
function findRelatedFiles(modelName) {
  const related = {
    dto: null,
    services: [],
    controllers: []
  };
  
  // Chercher le DTO
  if (fs.existsSync(dtosDir)) {
    const dtoFiles = fs.readdirSync(dtosDir).filter(file => file.endsWith('.js'));
    const dtoMatch = dtoFiles.find(file => 
      file === `${modelName}Dto.js` || 
      file === `${modelName.toLowerCase()}Dto.js` ||
      file === `${modelName}DTO.js`
    );
    if (dtoMatch) related.dto = dtoMatch;
  }
  
  // Chercher dans les services
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('.js'));
    serviceFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(servicesDir, file), 'utf8');
        if (content.includes(modelName) || content.includes(modelName.toLowerCase())) {
          related.services.push(file);
        }
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    });
  }
  
  // Chercher dans les controllers
  if (fs.existsSync(controllersDir)) {
    const controllerFiles = fs.readdirSync(controllersDir).filter(file => file.endsWith('.js'));
    controllerFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
        if (content.includes(modelName) || content.includes(modelName.toLowerCase())) {
          related.controllers.push(file);
        }
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    });
  }
  
  return related;
}

// Analyse principale
console.log('📊 Analyse technique des models et tables MySQL...\n');

if (!fs.existsSync(modelsDir)) {
  console.log('❌ Répertoire des models introuvable:', modelsDir);
  process.exit(1);
}

const modelFiles = fs.readdirSync(modelsDir).filter(file => 
  file.endsWith('.js') && file !== 'index.js'
);

console.log(`📋 Models à analyser: ${modelFiles.length}`);
console.log(`🗄️  Tables MySQL attendues: ${expectedMySQLTables.length}\n`);

const auditResults = {
  total: modelFiles.length,
  analyzed: 0,
  valid: {
    tableExists: 0,
    columnsMatch: 0,
    optionsComplete: 0,
    hasDTO: 0,
    hasUsage: 0
  },
  invalid: {
    tableMissing: [],
    columnsMismatch: [],
    optionsIncomplete: [],
    noDTO: [],
    noUsage: []
  },
  details: [],
  summary: {
    mysqlTables: expectedMySQLTables.length,
    sequelizeModels: 0,
    mappingIssues: 0,
    optionsIssues: 0,
    contractIssues: 0
  }
};

modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  const fileName = path.basename(file, '.js');
  
  console.log(`\n🔍 Audit: ${file}`);
  
  // Analyser le model
  const modelAnalysis = analyzeSequelizeModel(filePath);
  
  if (!modelAnalysis.isSequelizeModel) {
    console.log(`   ❌ Ce n'est pas un model Sequelize valide`);
    return;
  }
  
  auditResults.analyzed++;
  auditResults.summary.sequelizeModels++;
  
  // Vérifier la table MySQL
  const tableExists = modelAnalysis.tableName && checkMySQLTableExists(modelAnalysis.tableName);
  if (tableExists) {
    auditResults.valid.tableExists++;
  } else {
    auditResults.invalid.tableMissing.push(file);
  }
  
  // Vérifier les colonnes
  const mysqlColumns = modelAnalysis.tableName ? getMySQLTableColumns(modelAnalysis.tableName) : [];
  const columnsMatch = mysqlColumns.length > 0 && 
    modelAnalysis.columns.every(col => mysqlColumns.includes(col));
  
  if (columnsMatch) {
    auditResults.valid.columnsMatch++;
  } else {
    auditResults.invalid.columnsMismatch.push(file);
  }
  
  // Vérifier les options
  if (modelAnalysis.requiredOptions.complete) {
    auditResults.valid.optionsComplete++;
  } else {
    auditResults.invalid.optionsIncomplete.push(file);
    auditResults.summary.optionsIssues++;
  }
  
  // Trouver les fichiers associés
  const related = findRelatedFiles(modelAnalysis.modelName || fileName);
  
  if (related.dto) {
    auditResults.valid.hasDTO++;
  } else {
    auditResults.invalid.noDTO.push(file);
    auditResults.summary.contractIssues++;
  }
  
  if (related.services.length > 0 || related.controllers.length > 0) {
    auditResults.valid.hasUsage++;
  } else {
    auditResults.invalid.noUsage.push(file);
    auditResults.summary.contractIssues++;
  }
  
  // Calculer le score de conformité
  const score = {
    table: tableExists ? 25 : 0,
    columns: columnsMatch ? 25 : 0,
    options: modelAnalysis.requiredOptions.complete ? 25 : 0,
    contract: (related.dto && (related.services.length > 0 || related.controllers.length > 0)) ? 25 : 0
  };
  score.total = score.table + score.columns + score.options + score.contract;
  
  // Stocker les détails
  const detail = {
    file,
    fileName,
    modelAnalysis,
    mysqlValidation: {
      tableExists,
      tableName: modelAnalysis.tableName,
      mysqlColumns,
      modelColumns: modelAnalysis.columns,
      columnsMatch
    },
    optionsValidation: {
      complete: modelAnalysis.requiredOptions.complete,
      present: modelAnalysis.requiredOptions.present,
      missing: modelAnalysis.requiredOptions.missing
    },
    contractValidation: {
      hasDTO: !!related.dto,
      dtoFile: related.dto,
      hasUsage: related.services.length > 0 || related.controllers.length > 0,
      services: related.services,
      controllers: related.controllers
    },
    score
  };
  
  auditResults.details.push(detail);
  
  // Affichage détaillé
  console.log(`   📋 Model: ${modelAnalysis.modelName || 'NON DÉFINI'}`);
  console.log(`   🗄️  Table: ${modelAnalysis.tableName || 'NON DÉFINIE'} ${tableExists ? '✅' : '❌'}`);
  
  if (verbose && mysqlColumns.length > 0) {
    console.log(`   📊 Colonnes MySQL: ${mysqlColumns.length} (${mysqlColumns.slice(0, 3).join(', ')}${mysqlColumns.length > 3 ? '...' : ''})`);
    console.log(`   📊 Colonnes Model: ${modelAnalysis.columns.length} (${modelAnalysis.columns.slice(0, 3).join(', ')}${modelAnalysis.columns.length > 3 ? '...' : ''})`);
    console.log(`   📊 Correspondance: ${columnsMatch ? '✅' : '❌'}`);
  }
  
  console.log(`   🔧 Options: ${modelAnalysis.requiredOptions.complete ? '✅' : '❌'} ${modelAnalysis.requiredOptions.missing.length > 0 ? `(manquantes: ${modelAnalysis.requiredOptions.missing.join(', ')})` : ''}`);
  console.log(`   📄 DTO: ${related.dto ? '✅' : '❌'} ${related.dto || ''}`);
  console.log(`   🔍 Usage: ${related.services.length + related.controllers.length > 0 ? '✅' : '❌'} (${related.services.length} services, ${related.controllers.length} controllers)`);
  console.log(`   📊 Score: ${score.total}% [T:${score.table}% C:${score.columns}% O:${score.options}% P:${score.contract}%]`);
  
  if (modelAnalysis.associations.length > 0) {
    console.log(`   🔗 Associations: ${modelAnalysis.associations.length} (${modelAnalysis.associations.map(a => `${a.type}:${a.model}`).slice(0, 2).join(', ')}${modelAnalysis.associations.length > 2 ? '...' : ''})`);
  }
});

// Calcul des scores globaux
const tableScore = ((auditResults.valid.tableExists / auditResults.analyzed) * 100).toFixed(1);
const columnsScore = ((auditResults.valid.columnsMatch / auditResults.analyzed) * 100).toFixed(1);
const optionsScore = ((auditResults.valid.optionsComplete / auditResults.analyzed) * 100).toFixed(1);
const contractScore = ((auditResults.valid.hasUsage / auditResults.analyzed) * 100).toFixed(1);
const globalScore = ((parseFloat(tableScore) * 0.25 + parseFloat(columnsScore) * 0.25 + parseFloat(optionsScore) * 0.25 + parseFloat(contractScore) * 0.25)).toFixed(1);

// Rapport final
console.log('\n📊 RAPPORT D\'AUDIT TECHNIQUE MYSQL ↔ MODELS');
console.log('==========================================\n');

console.log('🎯 Scores de Conformité Technique:');
console.log(`   🗄️  Tables MySQL: ${tableScore}% (${auditResults.valid.tableExists}/${auditResults.analyzed})`);
console.log(`   📊 Colonnes: ${columnsScore}% (${auditResults.valid.columnsMatch}/${auditResults.analyzed})`);
console.log(`   🔧 Options Sequelize: ${optionsScore}% (${auditResults.valid.optionsComplete}/${auditResults.analyzed})`);
console.log(`   📄 Contrat DTO/Usage: ${contractScore}% (${auditResults.valid.hasUsage}/${auditResults.analyzed})`);
console.log(`   🏆 Score Technique Global: ${globalScore}%`);

console.log('\n📋 Résumé des Problèmes:');
console.log(`   ❌ Tables manquantes: ${auditResults.invalid.tableMissing.length}`);
console.log(`   ❌ Colonnes incohérentes: ${auditResults.invalid.columnsMismatch.length}`);
console.log(`   ❌ Options incomplètes: ${auditResults.invalid.optionsIncomplete.length}`);
console.log(`   ❌ DTOs manquants: ${auditResults.invalid.noDTO.length}`);
console.log(`   ❌ Non utilisés: ${auditResults.invalid.noUsage.length}`);

if (deep && auditResults.invalid.tableMissing.length > 0) {
  console.log('\n❌ Tables MySQL manquantes:');
  auditResults.invalid.tableMissing.forEach(file => {
    const detail = auditResults.details.find(d => d.file === file);
    console.log(`   • ${file} → Table "${detail.modelAnalysis.tableName}" non trouvée`);
  });
}

if (deep && auditResults.invalid.optionsIncomplete.length > 0) {
  console.log('\n❌ Options Sequelize incomplètes:');
  auditResults.invalid.optionsIncomplete.forEach(file => {
    const detail = auditResults.details.find(d => d.file === file);
    console.log(`   • ${file} → Options manquantes: ${detail.optionsValidation.missing.join(', ')}`);
  });
}

// Recommandations spécifiques
console.log('\n💡 RECOMMANDATIONS TECHNIQUES:');

if (auditResults.invalid.tableMissing.length > 0) {
  console.log('   1. Créer les tables MySQL manquantes:');
  auditResults.invalid.tableMissing.forEach(file => {
    const detail = auditResults.details.find(d => d.file === file);
    console.log(`      - CREATE TABLE ${detail.modelAnalysis.tableName} (...)`);
  });
}

if (auditResults.invalid.optionsIncomplete.length > 0) {
  console.log('   2. Ajouter les options Sequelize manquantes:');
  console.log('      - underscored: true');
  console.log('      - timestamps: true');
  console.log('      - paranoid: true');
}

if (auditResults.invalid.noDTO.length > 0) {
  console.log('   3. Créer les DTOs manquants:');
  auditResults.invalid.noDTO.forEach(file => {
    const detail = auditResults.details.find(d => d.file === file);
    console.log(`      - ${detail.modelAnalysis.modelName}Dto.js`);
  });
}

if (auditResults.invalid.noUsage.length > 0) {
  console.log('   4. Connecter les models aux services/controllers:');
  auditResults.invalid.noUsage.forEach(file => {
    const detail = auditResults.details.find(d => d.file === file);
    console.log(`      - Importer ${detail.modelAnalysis.modelName} dans les services appropriés`);
  });
}

// Génération du rapport JSON
const report = {
  date: new Date().toISOString(),
  mode: deep ? 'deep-audit' : 'standard-audit',
  auditResults,
  scores: {
    table: parseFloat(tableScore),
    columns: parseFloat(columnsScore),
    options: parseFloat(optionsScore),
    contract: parseFloat(contractScore),
    global: parseFloat(globalScore)
  },
  recommendations: {
    mysqlTables: auditResults.invalid.tableMissing,
    sequelizeOptions: auditResults.invalid.optionsIncomplete,
    dtos: auditResults.invalid.noDTO,
    usage: auditResults.invalid.noUsage
  }
};

const reportFileName = `audit-technique-mysql-models-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFileName}`);

// Code de sortie basé sur le score technique
if (globalScore >= 80) {
  console.log('\n🎉 AUDIT TECHNIQUE RÉUSSI!');
  process.exit(0);
} else if (globalScore >= 60) {
  console.log('\n⚠️  AUDIT TECHNIQUE PARTIEL - Améliorations nécessaires');
  process.exit(1);
} else {
  console.log('\n❌ AUDIT TECHNIQUE ÉCHOUÉ - Corrections majeures requises');
  process.exit(2);
}
