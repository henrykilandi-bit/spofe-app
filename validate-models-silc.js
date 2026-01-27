const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDATION CONTRACTUELLE SILC DES MODELS SPOFE v2.2');
console.log('====================================================\n');

// Configuration
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const fix = args.includes('--fix');
const deep = args.includes('--deep');

console.log(`📋 Mode: ${deep ? 'ANALYSE CONTRACTUELLE COMPLÈTE' : 'VALIDATION STANDARD'}`);
console.log(`📝 Verbose: ${verbose ? 'OUI' : 'NON'}`);
console.log(`🔧 Auto-fix: ${fix ? 'OUI' : 'NON'}\n`);

// Configuration SILC
const SILC_REQUIREMENTS = {
  naming: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.js$/,
    description: 'PascalCase.js'
  },
  sequelize: {
    requiredOptions: ['tableName', 'underscored', 'timestamps', 'paranoid'],
    recommendedOptions: ['indexes', 'hooks']
  },
  contract: {
    mustHaveTable: true,
    mustHaveDTO: true,
    mustBeUsed: true,
    allowedUnused: ['GroupeSuperUser', 'PendingApproval'] // Models internes autorisés
  }
};

// Répertoires
const modelsDir = 'cascade/src/models';
const dtosDir = 'cascade/src/dto';
const servicesDir = 'cascade/src/services';
const controllersDir = 'cascade/src/controllers';

// Backup directory
const backupDir = 'BACKUP_SILC_VALIDATION_' + new Date().toISOString().replace(/[:.]/g, '-');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('📁 Répertoire de backup créé:', backupDir);
}

// Fonction pour analyser le contenu d'un model
function analyzeModelContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraire les informations Sequelize
    const sequelizeMatch = content.match(/sequelize\.define\s*\(\s*['"`]([^'"`]+)['"`]/);
    const tableNameMatch = content.match(/tableName:\s*['"`]([^'"`]+)['"`]/);
    const underscoredMatch = content.match(/underscored:\s*(true|false)/);
    const timestampsMatch = content.match(/timestamps:\s*(true|false)/);
    const paranoidMatch = content.match(/paranoid:\s*(true|false)/);
    
    // Extraire les associations
    const associations = [];
    const associationPatterns = [
      /belongsTo\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /hasMany\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /hasOne\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /belongsToMany\s*\(\s*['"`]([^'"`]+)['"`]/g
    ];
    
    associationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        associations.push(match[1]);
      }
    });
    
    // Vérifier les options requises
    const hasRequiredOptions = SILC_REQUIREMENTS.sequelize.requiredOptions.every(option => {
      return content.includes(`${option}:`);
    });
    
    return {
      modelName: sequelizeMatch ? sequelizeMatch[1] : null,
      tableName: tableNameMatch ? tableNameMatch[1] : null,
      underscored: underscoredMatch ? underscoredMatch[1] === 'true' : false,
      timestamps: timestampsMatch ? timestampsMatch[1] === 'true' : false,
      paranoid: paranoidMatch ? paranoidMatch[1] === 'true' : false,
      associations,
      hasRequiredOptions,
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
function checkMySQLTable(tableName) {
  // En réalité, cette fonction se connecterait à la base de données
  // Pour l'instant, nous simulons based on les noms de tables attendus
  const expectedTables = [
    'account_balances', 'app_settings', 'associations', 'audit_trails',
    'business_operations', 'business_operation_audits', 'chart_of_accounts',
    'compagnies', 'consultant_company_accesses', 'consultant_group_assignments',
    'consulting_firms', 'external_data_sources', 'firm_consultants',
    'fiscal_years', 'groupe_entreprises', 'journal_entries', 'journal_entry_lines',
    'objective_actions', 'operation_templates', 'password_reset_tokens',
    'performance_indicators', 'roles', 'security_events', 'strategic_objectives',
    'third_parties', 'token_blacklists', 'two_factor_auths', 'users'
  ];
  
  return expectedTables.includes(tableName);
}

// Fonction pour trouver le DTO correspondant
function findCorrespondingDTO(modelName) {
  if (!fs.existsSync(dtosDir)) return null;
  
  const dtoFiles = fs.readdirSync(dtosDir).filter(file => file.endsWith('.js'));
  
  // Chercher exactement le même nom
  const exactMatch = dtoFiles.find(file => file === `${modelName}Dto.js`);
  if (exactMatch) return exactMatch;
  
  // Chercher une variation
  const variations = [
    `${modelName.toLowerCase()}Dto.js`,
    `${modelName}DTO.js`,
    `${modelName.toLowerCase()}dto.js`
  ];
  
  return variations.find(variation => dtoFiles.includes(variation)) || null;
}

// Fonction pour vérifier l'usage dans les services
function checkServiceUsage(modelName) {
  const usage = {
    services: [],
    controllers: [],
    total: 0
  };
  
  // Rechercher dans les services
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('.js'));
    
    serviceFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(servicesDir, file), 'utf8');
        const patterns = [
          new RegExp(`require.*${modelName}`, 'i'),
          new RegExp(`import.*${modelName}`, 'i'),
          new RegExp(`from.*${modelName}`, 'i')
        ];
        
        if (patterns.some(pattern => pattern.test(content))) {
          usage.services.push(file);
          usage.total++;
        }
      } catch (error) {
        if (verbose) {
          console.log(`   ⚠️  Erreur lecture service ${file}: ${error.message}`);
        }
      }
    });
  }
  
  // Rechercher dans les controllers
  if (fs.existsSync(controllersDir)) {
    const controllerFiles = fs.readdirSync(controllersDir).filter(file => file.endsWith('.js'));
    
    controllerFiles.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
        const patterns = [
          new RegExp(`require.*${modelName}`, 'i'),
          new RegExp(`import.*${modelName}`, 'i'),
          new RegExp(`from.*${modelName}`, 'i')
        ];
        
        if (patterns.some(pattern => pattern.test(content))) {
          usage.controllers.push(file);
          usage.total++;
        }
      } catch (error) {
        if (verbose) {
          console.log(`   ⚠️  Erreur lecture controller ${file}: ${error.message}`);
        }
      }
    });
  }
  
  return usage;
}

// Fonction pour analyser index.js spécifiquement
function analyzeIndexFile() {
  const indexPath = path.join(modelsDir, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    return {
      exists: false,
      analysis: 'Fichier index.js non trouvé'
    };
  }
  
  try {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const analysis = {
      exists: true,
      hasExports: content.includes('module.exports') || content.includes('export'),
      hasAssociations: content.includes('associate') || content.includes('belongsTo') || content.includes('hasMany'),
      hasModelLoading: content.includes('require') || content.includes('import'),
      hasSequelizeInstance: content.includes('sequelize') || content.includes('Sequelize'),
      lines: content.split('\n').length,
      size: fs.statSync(indexPath).size
    };
    
    // Déterminer le rôle architectural
    if (analysis.hasAssociations && analysis.hasModelLoading) {
      analysis.role = 'CENTRAL_LOADER_WITH_ASSOCIATIONS';
      analysis.risk = 'HIGH';
      analysis.recommendation = 'CONSERVER - Essentiel pour les associations';
    } else if (analysis.hasModelLoading) {
      analysis.role = 'CENTRAL_LOADER';
      analysis.risk = 'MEDIUM';
      analysis.recommendation = 'CONSERVER - Utile pour le chargement';
    } else if (analysis.hasExports) {
      analysis.role = 'EXPORTS_ONLY';
      analysis.risk = 'LOW';
      analysis.recommendation = 'ÉVALUER - Peut être remplacé';
    } else {
      analysis.role = 'UNKNOWN';
      analysis.risk = 'UNKNOWN';
      analysis.recommendation = 'ANALYSER MANUELLEMENT';
    }
    
    return analysis;
    
  } catch (error) {
    return {
      exists: true,
      error: error.message,
      analysis: 'Erreur lors de l\'analyse'
    };
  }
}

// Analyse principale
console.log('📊 Analyse contractuelle SILC des models...\n');

// 1. Analyser index.js en premier
console.log('🔍 Analyse spécifique de index.js...');
const indexAnalysis = analyzeIndexFile();

console.log(`   📁 Existence: ${indexAnalysis.exists ? 'OUI' : 'NON'}`);
if (indexAnalysis.exists) {
  console.log(`   📏 Taille: ${indexAnalysis.lines} lignes, ${indexAnalysis.size} octets`);
  console.log(`   🎭 Rôle: ${indexAnalysis.role}`);
  console.log(`   ⚠️  Risque: ${indexAnalysis.risk}`);
  console.log(`   💡 Recommandation: ${indexAnalysis.recommendation}`);
  
  if (indexAnalysis.hasAssociations) {
    console.log(`   🔗 Associations détectées: OUI`);
  }
  if (indexAnalysis.hasModelLoading) {
    console.log(`   📦 Chargement de models: OUI`);
  }
}

// 2. Analyser tous les models
if (!fs.existsSync(modelsDir)) {
  console.log('❌ Répertoire des models introuvable:', modelsDir);
  process.exit(1);
}

const modelFiles = fs.readdirSync(modelsDir).filter(file => 
  file.endsWith('.js') && file !== 'index.js'
);

console.log(`\n📋 Models à analyser: ${modelFiles.length}\n`);

const results = {
  total: modelFiles.length,
  compliant: {
    naming: 0,
    sequelize: 0,
    contract: 0
  },
  nonCompliant: {
    naming: [],
    sequelize: [],
    contract: []
  },
  details: []
};

modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  const fileName = path.basename(file, '.js');
  
  console.log(`\n🔍 Analyse: ${file}`);
  
  // Validation du nommage
  const namingCompliant = SILC_REQUIREMENTS.naming.pattern.test(file);
  
  // Analyse du contenu
  const modelAnalysis = analyzeModelContent(filePath);
  
  // Validation contractuelle
  const hasTable = modelAnalysis.tableName && checkMySQLTable(modelAnalysis.tableName);
  const hasDTO = findCorrespondingDTO(fileName) !== null;
  const usage = checkServiceUsage(fileName);
  const isUsed = usage.total > 0 || SILC_REQUIREMENTS.contract.allowedUnused.includes(fileName);
  
  const contractCompliant = hasTable && hasDTO && isUsed;
  
  // Validation Sequelize
  const sequelizeCompliant = modelAnalysis.isSequelizeModel && modelAnalysis.hasRequiredOptions;
  
  // Résultats
  const result = {
    file,
    fileName,
    naming: {
      compliant: namingCompliant,
      pattern: SILC_REQUIREMENTS.naming.description
    },
    sequelize: {
      compliant: sequelizeCompliant,
      analysis: modelAnalysis
    },
    contract: {
      compliant: contractCompliant,
      hasTable,
      hasDTO,
      isUsed,
      usage,
      dtoFile: findCorrespondingDTO(fileName)
    }
  };
  
  results.details.push(result);
  
  // Compteurs
  if (namingCompliant) results.compliant.naming++;
  else results.nonCompliant.naming.push(file);
  
  if (sequelizeCompliant) results.compliant.sequelize++;
  else results.nonCompliant.sequelize.push(file);
  
  if (contractCompliant) results.compliant.contract++;
  else results.nonCompliant.contract.push(file);
  
  // Affichage détaillé
  console.log(`   📝 Nommage: ${namingCompliant ? '✅' : '❌'} ${SILC_REQUIREMENTS.naming.description}`);
  
  if (modelAnalysis.isSequelizeModel) {
    console.log(`   🗄️  Sequelize Model: ✅`);
    console.log(`   📋 Table: ${modelAnalysis.tableName || 'NON DÉFINIE'} ${hasTable ? '✅' : '❌'}`);
    console.log(`   🔧 Options: ${modelAnalysis.hasRequiredOptions ? '✅' : '❌'} ${modelAnalysis.requiredOptions ? '' : '(manquantes)'}`);
    if (modelAnalysis.associations.length > 0) {
      console.log(`   🔗 Associations: ${modelAnalysis.associations.length} (${modelAnalysis.associations.join(', ')})`);
    }
  } else {
    console.log(`   🗄️  Sequelize Model: ❌`);
  }
  
  console.log(`   📄 DTO: ${hasDTO ? '✅' : '❌'} ${result.contract.dtoFile || 'AUCUN'}`);
  console.log(`   🔍 Usage: ${isUsed ? '✅' : '❌'} ${usage.total} références`);
  if (verbose && usage.total > 0) {
    console.log(`      Services: ${usage.services.join(', ')}`);
    console.log(`      Controllers: ${usage.controllers.join(', ')}`);
  }
  
  console.log(`   📊 Contractuel: ${contractCompliant ? '✅' : '❌'}`);
});

// Calcul des scores
const namingScore = ((results.compliant.naming / results.total) * 100).toFixed(1);
const sequelizeScore = ((results.compliant.sequelize / results.total) * 100).toFixed(1);
const contractScore = ((results.compliant.contract / results.total) * 100).toFixed(1);
const globalScore = ((namingScore * 0.2 + sequelizeScore * 0.3 + contractScore * 0.5)).toFixed(1);

// Rapport final
console.log('\n📊 RAPPORT DE VALIDATION SILC CONTRACTUELLE');
console.log('==========================================\n');

console.log('🎯 Scores de Conformité:');
console.log(`   📝 Nommage: ${namingScore}% (${results.compliant.naming}/${results.total})`);
console.log(`   🗄️  Sequelize: ${sequelizeScore}% (${results.compliant.sequelize}/${results.total})`);
console.log(`   📄 Contractuel: ${contractScore}% (${results.compliant.contract}/${results.total})`);
console.log(`   🏆 Score SILC Global: ${globalScore}%`);

console.log('\n📋 Résumé par Catégorie:');
console.log(`   ✅ Conformes naming: ${results.compliant.naming}`);
console.log(`   ❌ Non conformes naming: ${results.nonCompliant.naming.length}`);
console.log(`   ✅ Conformes Sequelize: ${results.compliant.sequelize}`);
console.log(`   ❌ Non conformes Sequelize: ${results.nonCompliant.sequelize.length}`);
console.log(`   ✅ Conformes Contractuels: ${results.compliant.contract}`);
console.log(`   ❌ Non conformes Contractuels: ${results.nonCompliant.contract.length}`);

// Alertes spécifiques
if (indexAnalysis.exists && indexAnalysis.risk === 'HIGH') {
  console.log('\n⚠️  ALERTE CRITIQUE:');
  console.log('   index.js contient des associations et est essentiel à l\'architecture');
  console.log('   Sa suppression pourrait casser les relations Sequelize');
}

if (results.nonCompliant.contract.length > 0) {
  console.log('\n❌ Models non contractuels:');
  results.nonCompliant.contract.forEach(file => {
    const detail = results.details.find(d => d.file === file);
    console.log(`   • ${file}`);
    if (!detail.contract.hasTable) console.log(`     - Table manquante`);
    if (!detail.contract.hasDTO) console.log(`     - DTO manquant`);
    if (!detail.contract.isUsed) console.log(`     - Non utilisé`);
  });
}

// Recommandations
console.log('\n💡 RECOMMANDATIONS:');
if (indexAnalysis.risk === 'HIGH') {
  console.log('   1. RESTAURER index.js depuis backup immédiatement');
  console.log('   2. Analyser son rôle architectural avant toute modification');
}

if (results.nonCompliant.contract.length > 0) {
  console.log('   3. Corriger les models non contractuels');
  console.log('   4. Créer les DTOs manquants');
  console.log('   5. Implémenter les tables MySQL manquantes');
}

console.log('   6. Intégrer cette validation dans le pipeline CI/CD');

// Génération du rapport JSON
const report = {
  date: new Date().toISOString(),
  mode: deep ? 'contractual-deep' : 'standard',
  indexAnalysis,
  results,
  scores: {
    naming: parseFloat(namingScore),
    sequelize: parseFloat(sequelizeScore),
    contract: parseFloat(contractScore),
    global: parseFloat(globalScore)
  },
  recommendations: {
    critical: indexAnalysis.risk === 'HIGH' ? ['RESTORE_INDEX_JS'] : [],
    contract: results.nonCompliant.contract,
    improvements: []
  }
};

const reportFileName = `silc-models-validation-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFileName}`);

// Code de sortie basé sur le score SILC
if (globalScore >= 90) {
  console.log('\n🎉 VALIDATION SILC RÉUSSIE!');
  process.exit(0);
} else if (globalScore >= 70) {
  console.log('\n⚠️  VALIDATION SILC PARTIELLE - Améliorations nécessaires');
  process.exit(1);
} else {
  console.log('\n❌ VALIDATION SILC ÉCHOUÉE - Corrections majeures requises');
  process.exit(2);
}
