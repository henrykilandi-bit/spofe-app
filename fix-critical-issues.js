const fs = require('fs');
const path = require('path');

console.log('🔴 CORRECTION DES PROBLÈMES CRITIQUES SPOFE v2.2');
console.log('==============================================\n');

// Backup directory
const backupDir = 'BACKUP_CRITICAL_FIX_' + new Date().toISOString().replace(/[:.]/g, '-');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('📁 Répertoire de backup créé:', backupDir);
}

let totalFixed = 0;
let totalErrors = 0;
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

// Fonction pour convertir en kebab-case correct
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/-+/g, '-'); // Nettoyer les doubles tirets
}

// Phase 1: Correction des Controllers (URGENT)
console.log('🎮 Phase 1: Correction des Controllers mal nommés...');
const controllersDir = 'cascade/src/controllers';

if (fs.existsSync(controllersDir)) {
  const controllerFiles = fs.readdirSync(controllersDir).filter(file => 
    file.endsWith('.js') && (
      file.includes('Controller-controller.js') || 
      file.includes('.controller-controller.js')
    )
  );
  
  console.log(`   📋 ${controllerFiles.length} controllers problématiques détectés`);
  
  controllerFiles.forEach(file => {
    const oldPath = path.join(controllersDir, file);
    
    try {
      // Backup
      const backupPath = createBackup(oldPath);
      
      // Logique de correction intelligente
      let newName = file;
      
      // 1. Supprimer "Controller" s'il existe
      newName = newName.replace(/Controller/g, '');
      
      // 2. Supprimer ".controller" s'il existe
      newName = newName.replace(/\.controller/g, '');
      
      // 3. Convertir en kebab-case
      newName = toKebabCase(newName);
      
      // 4. Ajouter suffixe -controller.js
      newName = newName.replace(/\.js$/, '-controller.js');
      
      const newPath = path.join(controllersDir, newName);
      
      // Validation
      const issues = [];
      if (fs.existsSync(newPath)) {
        issues.push(`Fichier cible existe déjà: ${newPath}`);
      }
      if (newName.includes('--')) {
        issues.push(`Nom contient des doubles tirets: ${newName}`);
      }
      if (!newName.match(/^[a-z0-9-]+-controller\.js$/)) {
        issues.push(`Format invalide: ${newName}`);
      }
      
      if (issues.length === 0) {
        fs.renameSync(oldPath, newPath);
        totalFixed++;
        console.log(`✅ ${file} → ${newName}`);
        fixLog.push({
          type: 'controller',
          old: file,
          new: newName,
          status: 'FIXED',
          backup: backupPath
        });
      } else {
        console.log(`⚠️  ${file} - Erreurs: ${issues.join(', ')}`);
        fixLog.push({
          type: 'controller',
          old: file,
          new: newName,
          status: 'SKIPPED',
          errors: issues
        });
      }
      
    } catch (error) {
      totalErrors++;
      console.log(`❌ Erreur: ${file} - ${error.message}`);
      fixLog.push({
        type: 'controller',
        old: file,
        new: 'UNKNOWN',
        status: 'ERROR',
        error: error.message
      });
    }
  });
}

// Phase 2: Gestion des Modèles
console.log('\n📊 Phase 2: Gestion des Modèles en double...');
const modelsDir = 'cascade/src/models';

if (fs.existsSync(modelsDir)) {
  const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
  const modelPairs = [];
  
  // Identifier les paires de fichiers
  modelFiles.forEach(file => {
    if (!file.includes('.model.js')) {
      const modelVersion = file.replace('.js', '.model.js');
      if (fs.existsSync(path.join(modelsDir, modelVersion))) {
        modelPairs.push({
          original: file,
          model: modelVersion
        });
      }
    }
  });
  
  console.log(`   📋 ${modelPairs.length} paires de modèles détectées`);
  
  // Option A: Supprimer les originaux et garder les .model.js
  console.log('   🔧 Application de la stratégie A: garder les .model.js');
  
  modelPairs.forEach(pair => {
    const originalPath = path.join(modelsDir, pair.original);
    const modelPath = path.join(modelsDir, pair.model);
    
    try {
      // Comparer les tailles pour voir s'ils sont identiques
      const originalStat = fs.statSync(originalPath);
      const modelStat = fs.statSync(modelPath);
      
      if (originalStat.size === modelStat.size) {
        // Fichiers probablement identiques
        const backupPath = createBackup(originalPath);
        fs.unlinkSync(originalPath);
        totalFixed++;
        console.log(`✅ Supprimé: ${pair.original} (identique à ${pair.model})`);
        fixLog.push({
          type: 'model',
          old: pair.original,
          new: 'DELETED',
          status: 'DELETED_DUPLICATE',
          backup: backupPath,
          reason: 'Identique à .model.js'
        });
      } else {
        console.log(`⚠️  ${pair.original} vs ${pair.model} - tailles différentes, investigation manuelle requise`);
        fixLog.push({
          type: 'model',
          old: pair.original,
          new: pair.model,
          status: 'MANUAL_REVIEW',
          reason: 'Tailles différentes'
        });
      }
    } catch (error) {
      totalErrors++;
      console.log(`❌ Erreur traitement ${pair.original}: ${error.message}`);
    }
  });
}

// Phase 3: Pages Finales
console.log('\n📄 Phase 3: Résolution des conflits de pages...');
const pagesDir = 'frontend/src/pages';

if (fs.existsSync(pagesDir)) {
  const conflictPairs = [
    { original: 'FAQPage.jsx', conflict: 'faqpage.jsx' },
    { original: 'Users.jsx', conflict: 'users.jsx' }
  ];
  
  conflictPairs.forEach(pair => {
    const originalPath = path.join(pagesDir, pair.original);
    const conflictPath = path.join(pagesDir, pair.conflict);
    
    if (fs.existsSync(originalPath) && fs.existsSync(conflictPath)) {
      try {
        // Comparer les fichiers
        const originalContent = fs.readFileSync(originalPath, 'utf8');
        const conflictContent = fs.readFileSync(conflictPath, 'utf8');
        
        if (originalContent === conflictContent) {
          // Fichiers identiques
          const backupPath = createBackup(conflictPath);
          fs.unlinkSync(conflictPath);
          totalFixed++;
          console.log(`✅ Supprimé: ${pair.conflict} (identique à ${pair.original})`);
          fixLog.push({
            type: 'page',
            old: pair.conflict,
            new: 'DELETED',
            status: 'DELETED_DUPLICATE',
            backup: backupPath,
            reason: 'Identique à l\'original'
          });
        } else {
          // Fichiers différents - garder les deux pour l'instant
          console.log(`⚠️  ${pair.original} vs ${pair.conflict} - contenus différents, fusion manuelle requise`);
          fixLog.push({
            type: 'page',
            old: pair.conflict,
            new: pair.original,
            status: 'MANUAL_MERGE',
            reason: 'Contenus différents'
          });
        }
      } catch (error) {
        totalErrors++;
        console.log(`❌ Erreur comparaison ${pair.original}: ${error.message}`);
      }
    }
  });
}

// Phase 4: Mise à jour des imports après corrections
console.log('\n📝 Phase 4: Mise à jour des imports post-correction...');
const directoriesToScan = [
  'cascade/src/controllers',
  'cascade/src/services',
  'cascade/src/middleware',
  'cascade/src/routes',
  'cascade/src/models',
  'frontend/src',
  'frontend/src/components',
  'frontend/src/hooks',
  'frontend/src/services'
];

let updatedImports = 0;

directoriesToScan.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && (dirent.name.endsWith('.js') || dirent.name.endsWith('.jsx')))
    .map(dirent => path.join(dir, dirent.name));
  
  files.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Mettre à jour les imports pour chaque correction
      fixLog.forEach(log => {
        if (log.status === 'FIXED' || log.status === 'DELETED_DUPLICATE') {
          const oldBaseName = log.old.replace(/\.(js|jsx)$/, '');
          const newBaseName = log.new === 'DELETED' ? '' : log.new.replace(/\.(js|jsx)$/, '');
          
          if (newBaseName) {
            // Patterns d'import à remplacer
            const importPatterns = [
              new RegExp(`require\\(['"]\\.?/?.*?${oldBaseName}['"]\\)`, 'g'),
              new RegExp(`from ['"]\\.?/?.*?${oldBaseName}['"]`, 'g'),
              new RegExp(`import.*${oldBaseName}.*from`, 'g')
            ];
            
            importPatterns.forEach(pattern => {
              if (pattern.test(content)) {
                content = content.replace(pattern, (match) => {
                  return match.replace(oldBaseName, newBaseName);
                });
                modified = true;
              }
            });
          }
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        updatedImports++;
        console.log(`📝 Imports mis à jour: ${path.relative(process.cwd(), filePath)}`);
      }
    } catch (error) {
      console.log(`⚠️  Erreur mise à jour imports ${filePath}: ${error.message}`);
    }
  });
}

// Résultats finaux
console.log('\n📊 RÉSULTATS FINAUX:');
console.log(`   ✅ Fichiers corrigés: ${totalFixed}`);
console.log(`   ❌ Erreurs: ${totalErrors}`);
console.log(`   📝 Imports mis à jour: ${updatedImports}`);
console.log(`   📁 Backup: ${backupDir}`);

// Vérification finale
console.log('\n🔍 VÉRIFICATION FINALE...');
const finalStats = {
  controllers: { total: 0, compliant: 0 },
  models: { total: 0, compliant: 0 },
  pages: { total: 0, compliant: 0 }
};

// Controllers
if (fs.existsSync(controllersDir)) {
  const controllerFiles = fs.readdirSync(controllersDir).filter(file => file.endsWith('.js'));
  finalStats.controllers.total = controllerFiles.length;
  finalStats.controllers.compliant = controllerFiles.filter(file => file.endsWith('-controller.js')).length;
}

// Models
if (fs.existsSync(modelsDir)) {
  const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
  finalStats.models.total = modelFiles.length;
  finalStats.models.compliant = modelFiles.filter(file => /^[A-Z][a-zA-Z0-9]*\.js$/.test(file)).length;
}

// Pages
if (fs.existsSync(pagesDir)) {
  const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.jsx'));
  finalStats.pages.total = pageFiles.length;
  finalStats.pages.compliant = pageFiles.filter(file => /^[a-z]+(?:-[a-z]+)*\.jsx$/.test(file)).length;
}

console.log('\n📈 NOUVEAUX TAUX DE CONFORMITÉ:');
Object.entries(finalStats).forEach(([type, stats]) => {
  const rate = stats.total > 0 ? ((stats.compliant / stats.total) * 100).toFixed(1) : '0.0';
  console.log(`   ${type}: ${stats.compliant}/${stats.total} (${rate}%)`);
});

const totalFiles = Object.values(finalStats).reduce((sum, stats) => sum + stats.total, 0);
const totalCompliant = Object.values(finalStats).reduce((sum, stats) => sum + stats.compliant, 0);
const globalRate = totalFiles > 0 ? ((totalCompliant / totalFiles) * 100).toFixed(1) : '0.0';

console.log(`\n🎯 TAUX GLOBAL: ${totalCompliant}/${totalFiles} (${globalRate}%)`);

// Générer le rapport
const report = {
  date: new Date().toISOString(),
  operation: 'CRITICAL_ISSUES_FIX',
  results: {
    totalFixed,
    totalErrors,
    updatedImports,
    backupDirectory: backupDir
  },
  fixLog,
  finalStats,
  globalComplianceRate: globalRate
};

fs.writeFileSync('critical-issues-fix-report.json', JSON.stringify(report, null, 2));
console.log('\n💾 Rapport détaillé sauvegardé: critical-issues-fix-report.json');

// Actions manuelles requises
const manualActions = fixLog.filter(log => 
  log.status === 'MANUAL_REVIEW' || 
  log.status === 'MANUAL_MERGE' || 
  log.status === 'SKIPPED'
);

if (manualActions.length > 0) {
  console.log('\n🔧 ACTIONS MANUELLES REQUISES:');
  manualActions.forEach(action => {
    console.log(`   • ${action.old}: ${action.reason || action.status}`);
  });
}

if (globalRate >= '90.0') {
  console.log('\n🎉 EXCELLENT! Conformité critique atteinte!');
} else if (globalRate >= '75.0') {
  console.log('\n✅ BON! Problèmes critiques résolus.');
} else {
  console.log('\n⚠️  Corrections supplémentaires nécessaires.');
}

console.log('\n✅ Correction des problèmes critiques terminée!');
