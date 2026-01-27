const fs = require('fs');
const path = require('path');

console.log('🔄 RESTAURATION INTELLIGENTE DES MODELS DEPUIS BACKUP');
console.log('===================================================\n');

// Configuration
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const selective = args.includes('--selective');

console.log(`📋 Mode: ${dryRun ? 'DRY RUN' : 'RESTAURATION'}`);
console.log(`📝 Verbose: ${verbose ? 'OUI' : 'NON'}`);
console.log(`🎯 Sélectif: ${selective ? 'OUI' : 'NON'}\n`);

// Backup directory
const backupDir = 'BACKUP_MODELS_INTELLIGENT_2026-01-27T17-22-06-834Z';
const modelsDir = 'cascade/src/models';

if (!fs.existsSync(backupDir)) {
  console.log('❌ Répertoire de backup introuvable:', backupDir);
  process.exit(1);
}

if (!fs.existsSync(modelsDir)) {
  console.log('❌ Répertoire des models introuvable:', modelsDir);
  process.exit(1);
}

// Lister les fichiers dans le backup
const backupFiles = fs.readdirSync(backupDir).filter(file => file.endsWith('.js'));
console.log(`📁 Fichiers dans backup: ${backupFiles.length}`);

// Lister les fichiers actuels
const currentFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
console.log(`📁 Fichiers actuels: ${currentFiles.length}`);

// Identifier les fichiers à restaurer
const filesToRestore = backupFiles.filter(file => {
  if (selective) {
    // Mode sélectif: restaurer uniquement les fichiers manquants ou critiques
    return !currentFiles.includes(file) || file === 'index.js';
  }
  return true;
});

console.log(`🔄 Fichiers à restaurer: ${filesToRestore.length}`);

if (filesToRestore.length === 0) {
  console.log('\n✅ Aucune restauration nécessaire');
  process.exit(0);
}

// Afficher les fichiers à restaurer
if (verbose) {
  console.log('\n📋 Fichiers à restaurer:');
  filesToRestore.forEach(file => {
    const backupPath = path.join(backupDir, file);
    const currentPath = path.join(modelsDir, file);
    const exists = fs.existsSync(currentPath);
    const status = exists ? 'REMPLACEMENT' : 'CRÉATION';
    
    console.log(`   • ${file} [${status}]`);
  });
}

// Analyse spécifique de index.js
const indexBackupPath = path.join(backupDir, 'index.js');
const indexCurrentPath = path.join(modelsDir, 'index.js');

if (fs.existsSync(indexBackupPath)) {
  console.log('\n🔍 Analyse spécifique de index.js...');
  
  try {
    const backupContent = fs.readFileSync(indexBackupPath, 'utf8');
    const hasAssociations = backupContent.includes('hasMany') || backupContent.includes('belongsTo');
    const hasExports = backupContent.includes('export');
    const hasImports = backupContent.includes('import');
    const lines = backupContent.split('\n').length;
    
    console.log(`   📊 Taille backup: ${lines} lignes`);
    console.log(`   🔗 Associations: ${hasAssociations ? 'OUI' : 'NON'}`);
    console.log(`   📤 Exports: ${hasExports ? 'OUI' : 'NON'}`);
    console.log(`   📥 Imports: ${hasImports ? 'OUI' : 'NON'}`);
    
    if (hasAssociations) {
      console.log('   ⚠️  CRITIQUE: index.js contient des associations Sequelize');
      console.log('   💡 RECOMMANDATION: RESTAURATION OBLIGATOIRE');
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur lecture backup index.js: ${error.message}`);
  }
}

// Restauration
let restored = 0;
let errors = 0;
const restoreLog = [];

console.log('\n🔄 Restauration des fichiers...');

filesToRestore.forEach(file => {
  const backupPath = path.join(backupDir, file);
  const currentPath = path.join(modelsDir, file);
  
  try {
    // Backup du fichier actuel si existe
    if (fs.existsSync(currentPath)) {
      const currentBackupPath = path.join(modelsDir, `${file}.current-backup`);
      fs.copyFileSync(currentPath, currentBackupPath);
      
      if (verbose) {
        console.log(`   📁 Backup actuel: ${file}.current-backup`);
      }
    }
    
    if (!dryRun) {
      // Copier depuis backup
      fs.copyFileSync(backupPath, currentPath);
      console.log(`   ✅ Restauré: ${file}`);
      restored++;
      
      restoreLog.push({
        file,
        status: 'RESTORED',
        backupPath,
        currentPath,
        hadCurrent: fs.existsSync(`${currentPath}.current-backup`)
      });
    } else {
      console.log(`   🔍 DRY RUN: ${file} serait restauré`);
      restored++;
      
      restoreLog.push({
        file,
        status: 'DRY_RUN',
        backupPath,
        currentPath
      });
    }
    
  } catch (error) {
    console.log(`   ❌ Erreur restauration ${file}: ${error.message}`);
    errors++;
    
    restoreLog.push({
      file,
      status: 'ERROR',
      error: error.message
    });
  }
});

// Vérification post-restauration
if (!dryRun && restored > 0) {
  console.log('\n🔍 Vérification post-restauration...');
  
  const finalFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
  console.log(`   📊 Total final: ${finalFiles.length} fichiers`);
  
  // Vérifier index.js spécifiquement
  if (fs.existsSync(indexCurrentPath)) {
    try {
      const content = fs.readFileSync(indexCurrentPath, 'utf8');
      const hasAssociations = content.includes('hasMany') || content.includes('belongsTo');
      
      console.log(`   ✅ index.js restauré avec ${hasAssociations ? 'associations' : 'sans associations'}`);
    } catch (error) {
      console.log(`   ⚠️  Erreur vérification index.js: ${error.message}`);
    }
  }
}

// Résultats
console.log('\n📊 RÉSULTATS DE LA RESTAURATION:');
console.log(`   ✅ Fichiers restaurés: ${restored}`);
console.log(`   ❌ Erreurs: ${errors}`);
console.log(`   📁 Mode: ${dryRun ? 'DRY RUN' : 'RESTAURATION RÉELLE'}`);

// Rapport
const report = {
  date: new Date().toISOString(),
  mode: dryRun ? 'dry-run' : 'restoration',
  backup: {
    directory: backupDir,
    files: backupFiles.length
  },
  current: {
    directory: modelsDir,
    filesBefore: currentFiles.length,
    filesAfter: dryRun ? currentFiles.length : fs.existsSync(modelsDir) ? fs.readdirSync(modelsDir).filter(file => file.endsWith('.js')).length : 0
  },
  results: {
    restored,
    errors,
    filesToRestore: filesToRestore.length
  },
  restoreLog,
  indexAnalysis: {
    wasRestored: filesToRestore.includes('index.js'),
    hasAssociations: fs.existsSync(indexCurrentPath) ? fs.readFileSync(indexCurrentPath, 'utf8').includes('hasMany') : false
  }
};

const reportFileName = `models-restoration-report-${dryRun ? 'dry-run' : 'restoration'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFileName}`);

// Recommandations
if (!dryRun) {
  console.log('\n💡 RECOMMANDATIONS POST-RESTAURATION:');
  
  if (report.indexAnalysis.wasRestored && report.indexAnalysis.hasAssociations) {
    console.log('   1. ✅ index.js avec associations restauré - Architecture préservée');
    console.log('   2. Exécuter "node validate-models-silc.js --deep" pour valider');
  }
  
  console.log('   3. Tester l\'application pour s\'assurer que tout fonctionne');
  console.log('   4. Valider les connexions à la base de données');
  console.log('   5. Commiter les changements si tout est fonctionnel');
  
  if (errors > 0) {
    console.log('   ⚠️  Des erreurs sont survenues - vérifier le rapport');
  }
} else {
  console.log('\n🔍 DRY RUN TERMINÉ - Utilisez la commande sans --dry-run pour appliquer la restauration');
}

// Code de sortie
if (errors > 0) {
  process.exit(1);
} else if (restored > 0) {
  process.exit(0);
} else {
  process.exit(0);
}
