const fs = require('fs');
const path = require('path');

console.log('🔧 STANDARDISATION INTELLIGENTE DES MODELS SPOFE v2.2');
console.log('===================================================\n');

// Configuration
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const force = args.includes('--force');
const smart = args.includes('--smart'); // Mode intelligent par défaut

console.log(`📋 Mode: ${dryRun ? 'DRY RUN' : 'CORRECTION'}`);
console.log(`📝 Verbose: ${verbose ? 'OUI' : 'NON'}`);
console.log(`⚡ Force: ${force ? 'OUI' : 'NON'}`);
console.log(`🧠 Intelligent: ${smart ? 'OUI' : 'NON'}\n`);

// Backup directory
const backupDir = 'BACKUP_MODELS_INTELLIGENT_' + new Date().toISOString().replace(/[:.]/g, '-');
if (!dryRun && !fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('📁 Répertoire de backup créé:', backupDir);
}

const modelsDir = 'cascade/src/models';
let totalFixed = 0;
let totalErrors = 0;
let totalSkipped = 0;
let totalDuplicates = 0;
const fixLog = [];

// Fonction pour créer un backup
function createBackup(filePath) {
  if (fs.existsSync(filePath)) {
    const fileName = path.basename(filePath);
    const backupPath = path.join(backupDir, fileName);
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }
  return null;
}

// Fonction pour convertir en PascalCase
function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^[a-z]/, c => c.toUpperCase());
}

// Fonction pour analyser le contenu d'un fichier
function analyzeFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Détecter les patterns d'export
    const exportPatterns = [
      /module\.exports\s*=\s*/,
      /exports\./,
      /export\s+default\s+/,
      /export\s+{/
    ];
    
    // Détecter les patterns de model Sequelize
    const sequelizePatterns = [
      /sequelize\.define/,
      /DataTypes\./,
      /belongsTo\(/,
      /hasMany\(/,
      /hasOne\(/,
      /belongsTo\(/,
      /Model\.init/
    ];
    
    const hasExports = exportPatterns.some(pattern => pattern.test(content));
    const isSequelizeModel = sequelizePatterns.some(pattern => pattern.test(content));
    
    // Détecter si c'est un index ou un fichier utilitaire
    const isIndex = filePath.includes('index.js') || 
                   content.includes('module.exports = {') ||
                   content.includes('export {') ||
                   content.includes('export default {');
    
    return {
      hasExports,
      isSequelizeModel,
      isIndex,
      size: fs.statSync(filePath).size,
      lines: content.split('\n').length
    };
  } catch (error) {
    return {
      hasExports: false,
      isSequelizeModel: false,
      isIndex: false,
      size: 0,
      lines: 0,
      error: error.message
    };
  }
}

// Fonction pour générer le nom correct
function generateCorrectName(oldName, analysis) {
  // Supprimer les extensions
  let baseName = oldName.replace(/\.js$/, '').replace(/\.model\.js$/, '');
  
  // Si c'est un index, le garder tel quel
  if (analysis.isIndex) {
    return baseName + '.js';
  }
  
  // Convertir en PascalCase
  const pascalCaseName = toPascalCase(baseName);
  
  // Ajouter l'extension .js
  return pascalCaseName + '.js';
}

// Fonction pour comparer deux fichiers
function compareFiles(file1, file2) {
  try {
    const content1 = fs.readFileSync(file1, 'utf8');
    const content2 = fs.readFileSync(file2, 'utf8');
    return content1 === content2;
  } catch (error) {
    return false;
  }
}

// Fonction pour trouver les imports d'un model
function findModelImports(modelName, searchDir) {
  const imports = [];
  const extensions = ['.js', '.jsx'];
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory() && !item.name.startsWith('.') && !item.name.includes('node_modules')) {
        scanDirectory(fullPath);
      } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Patterns d'import à rechercher
          const patterns = [
            new RegExp(`require\\(['"]\\.?/?.*?${modelName}['"]\\)`, 'g'),
            new RegExp(`from ['"]\\.?/?.*?${modelName}['"]`, 'g'),
            new RegExp(`import.*${modelName}.*from`, 'g')
          ];
          
          patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              imports.push({
                file: fullPath,
                matches: matches
              });
            }
          });
        } catch (error) {
          if (verbose) {
            console.log(`   ⚠️  Erreur lecture ${fullPath}: ${error.message}`);
          }
        }
      }
    }
  }
  
  scanDirectory(searchDir);
  return imports;
}

// Fonction pour mettre à jour les imports
function updateImports(oldName, newName, imports) {
  let updatedFiles = 0;
  
  imports.forEach(importInfo => {
    try {
      let content = fs.readFileSync(importInfo.file, 'utf8');
      let modified = false;
      
      importInfo.matches.forEach(match => {
        const newMatch = match.replace(oldName, newName);
        if (match !== newMatch) {
          content = content.replace(match, newMatch);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(importInfo.file, content);
        updatedFiles++;
        if (verbose) {
          console.log(`   📝 Imports mis à jour: ${path.relative(process.cwd(), importInfo.file)}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Erreur mise à jour imports ${importInfo.file}: ${error.message}`);
    }
  });
  
  return updatedFiles;
}

// Analyse des models
console.log('📊 Analyse intelligente des models...');
if (!fs.existsSync(modelsDir)) {
  console.log('❌ Répertoire des models introuvable:', modelsDir);
  process.exit(1);
}

const allModels = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
console.log(`   📋 Total models détectés: ${allModels.length}`);

// Analyse détaillée de chaque fichier
const modelAnalysis = [];
allModels.forEach(model => {
  const filePath = path.join(modelsDir, model);
  const analysis = analyzeFileContent(filePath);
  const isPascalCase = /^[A-Z][a-zA-Z0-9]*\.js$/.test(model);
  
  modelAnalysis.push({
    file: model,
    path: filePath,
    isPascalCase,
    analysis,
    suggestedName: generateCorrectName(model, analysis)
  });
});

// Classification des models
const compliantModels = modelAnalysis.filter(m => m.isPascalCase);
const nonCompliantModels = modelAnalysis.filter(m => !m.isPascalCase);
const indexFiles = modelAnalysis.filter(m => m.analysis.isIndex);
const sequelizeModels = modelAnalysis.filter(m => m.analysis.isSequelizeModel);

console.log(`   ✅ Models conformes: ${compliantModels.length}`);
console.log(`   ❌ Models non conformes: ${nonCompliantModels.length}`);
console.log(`   📋 Fichiers index: ${indexFiles.length}`);
console.log(`   🗄️  Models Sequelize: ${sequelizeModels.length}`);

if (nonCompliantModels.length === 0) {
  console.log('\n🎉 Tous les models sont déjà conformes!');
  process.exit(0);
}

// Affichage des models à corriger
console.log('\n🔧 Analyse détaillée des models à standardiser:');
nonCompliantModels.forEach(model => {
  const status = [];
  if (model.analysis.isIndex) status.push('INDEX');
  if (model.analysis.isSequelizeModel) status.push('SEQUELIZE');
  if (model.analysis.hasExports) status.push('EXPORTS');
  
  console.log(`   • ${model.file} → ${model.suggestedName} [${status.join(', ')}] (${model.analysis.lines} lignes)`);
});

if (dryRun) {
  console.log('\n🔍 MODE DRY RUN - Aucune modification ne sera effectuée');
}

// Correction intelligente des models
console.log('\n🔧 Correction intelligente des models...');

nonCompliantModels.forEach(model => {
  const oldPath = model.path;
  const newModel = model.suggestedName;
  const newPath = path.join(modelsDir, newModel);
  
  console.log(`\n📋 Traitement: ${model.file}`);
  console.log(`   📊 Type: ${model.analysis.isSequelizeModel ? 'Sequelize Model' : 'Other'}`);
  console.log(`   📏 Taille: ${model.analysis.lines} lignes, ${model.analysis.size} octets`);
  
  try {
    // Vérifier si le fichier cible existe déjà
    if (fs.existsSync(newPath) && !force) {
      if (smart) {
        // Mode intelligent: comparer les contenus
        if (compareFiles(oldPath, newPath)) {
          console.log(`   ✅ Identique au fichier cible - suppression du doublon`);
          if (!dryRun) {
            const backupPath = createBackup(oldPath);
            fs.unlinkSync(oldPath);
            totalDuplicates++;
            fixLog.push({
              type: 'model',
              old: model.file,
              new: 'DELETED_DUPLICATE',
              status: 'DELETED_DUPLICATE',
              backup: backupPath,
              reason: 'Identique au fichier cible'
            });
          }
          return;
        } else {
          console.log(`   ⚠️  Fichier cible existe déjà avec contenu différent - SKIPPED`);
          totalSkipped++;
          fixLog.push({
            type: 'model',
            old: model.file,
            new: newModel,
            status: 'SKIPPED_DIFFERENT',
            reason: 'Fichier cible existe avec contenu différent'
          });
          return;
        }
      } else {
        console.log(`   ⚠️  Fichier cible existe déjà: ${newModel} - SKIPPED`);
        totalSkipped++;
        fixLog.push({
          type: 'model',
          old: model.file,
          new: newModel,
          status: 'SKIPPED_EXISTS',
          reason: 'Fichier cible existe déjà'
        });
        return;
      }
    }
    
    // Backup
    const backupPath = dryRun ? null : createBackup(oldPath);
    
    // Trouver les imports
    const oldBaseName = model.file.replace(/\.js$/, '').replace(/\.model\.js$/, '');
    const newBaseName = newModel.replace(/\.js$/, '');
    const imports = findModelImports(oldBaseName, '.');
    
    if (verbose && imports.length > 0) {
      console.log(`   🔍 Imports trouvés: ${imports.length} fichiers`);
    }
    
    if (!dryRun) {
      // Renommer le fichier
      fs.renameSync(oldPath, newPath);
      console.log(`   ✅ Renommé: ${model.file} → ${newModel}`);
      
      // Mettre à jour les imports
      if (imports.length > 0) {
        const updatedFiles = updateImports(oldBaseName, newBaseName, imports);
        console.log(`   📝 Imports mis à jour: ${updatedFiles} fichiers`);
      }
      
      totalFixed++;
      fixLog.push({
        type: 'model',
        old: model.file,
        new: newModel,
        status: 'FIXED',
        backup: backupPath,
        importsUpdated: imports.length,
        analysis: model.analysis
      });
    } else {
      console.log(`   🔍 DRY RUN: ${model.file} → ${newModel}`);
      console.log(`   🔍 Imports à mettre à jour: ${imports.length} fichiers`);
      totalFixed++;
      fixLog.push({
        type: 'model',
        old: model.file,
        new: newModel,
        status: 'DRY_RUN',
        importsFound: imports.length,
        analysis: model.analysis
      });
    }
    
  } catch (error) {
    totalErrors++;
    console.log(`   ❌ Erreur: ${model.file} - ${error.message}`);
    fixLog.push({
      type: 'model',
      old: model.file,
      new: newModel,
      status: 'ERROR',
      error: error.message
    });
  }
});

// Résultats finaux
console.log('\n📊 RÉSULTATS FINAUX:');
console.log(`   ✅ Models traités: ${totalFixed}`);
console.log(`   ❌ Erreurs: ${totalErrors}`);
console.log(`   ⏭️  Ignorés: ${totalSkipped}`);
console.log(`   🗑️  Doublons supprimés: ${totalDuplicates}`);
if (!dryRun) {
  console.log(`   📁 Backup: ${backupDir}`);
}

// Vérification finale
if (!dryRun) {
  console.log('\n🔍 Vérification finale...');
  const finalModels = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
  const finalCompliant = finalModels.filter(model => /^[A-Z][a-zA-Z0-9]*\.js$/.test(model));
  
  console.log(`   📊 Total models: ${finalModels.length}`);
  console.log(`   ✅ Conformes: ${finalCompliant.length}`);
  console.log(`   📈 Taux de conformité: ${((finalCompliant.length / finalModels.length) * 100).toFixed(1)}%`);
  
  if (finalCompliant.length === finalModels.length) {
    console.log('\n🎉 TOUS LES MODELS SONT CONFORMES!');
  } else {
    console.log('\n⚠️  Certains models nécessitent encore une correction');
  }
}

// Générer le rapport
const report = {
  date: new Date().toISOString(),
  mode: dryRun ? 'dry-run' : 'correction',
  intelligent: smart,
  results: {
    totalFixed,
    totalErrors,
    totalSkipped,
    totalDuplicates,
    backupDirectory: dryRun ? null : backupDir
  },
  fixLog,
  summary: {
    initial: {
      total: allModels.length,
      compliant: compliantModels.length,
      nonCompliant: nonCompliantModels.length,
      indexFiles: indexFiles.length,
      sequelizeModels: sequelizeModels.length
    },
    final: dryRun ? null : {
      total: fs.existsSync(modelsDir) ? fs.readdirSync(modelsDir).filter(file => file.endsWith('.js')).length : 0,
      compliant: fs.existsSync(modelsDir) ? fs.readdirSync(modelsDir).filter(file => file.endsWith('.js')).filter(model => /^[A-Z][a-zA-Z0-9]*\.js$/.test(model)).length : 0
    }
  }
};

const reportFileName = `models-intelligent-fix-report-${dryRun ? 'dry-run' : 'correction'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFileName}`);

if (dryRun) {
  console.log('\n🔍 DRY RUN TERMINÉ - Utilisez la commande sans --dry-run pour appliquer les corrections');
} else if (totalErrors === 0 && totalFixed > 0) {
  console.log('\n🎉 STANDARDISATION INTELLIGENTE DES MODELS TERMINÉE AVEC SUCCÈS!');
} else if (totalFixed === 0) {
  console.log('\nℹ️  Aucune correction nécessaire');
} else {
  console.log('\n⚠️  Correction terminée avec des erreurs - vérifier le rapport');
}

// Recommandations
if (!dryRun && totalFixed > 0) {
  console.log('\n💡 RECOMMANDATIONS:');
  console.log('   1. Exécuter "node test-conventions-enhanced.js --flexible" pour valider les corrections');
  console.log('   2. Tester l\'application pour s\'assurer que tout fonctionne correctement');
  console.log('   3. Vérifier la connectivité avec la base de données XAMPP');
  console.log('   4. Commiter les changements avec un message descriptif');
  console.log('   5. Configurer les linters pour prévenir les régressions');
}
