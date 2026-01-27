const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION FINALE DES CONTROLLERS SPOFE v2.2');
console.log('=============================================\n');

// Backup directory
const backupDir = 'BACKUP_CONTROLLERS_FINAL_' + new Date().toISOString().replace(/[:.]/g, '-');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('📁 Répertoire de backup créé:', backupDir);
}

const controllersDir = 'cascade/src/controllers';
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

// Fonction pour corriger le nom du controller
function fixControllerName(oldName) {
  let newName = oldName;
  
  // 1. Supprimer "Controller-controller" et remplacer par "controller"
  newName = newName.replace(/Controller-controller\.js$/, '-controller.js');
  
  // 2. Supprimer ".controller-controller" et remplacer par "-controller"
  newName = newName.replace(/\.controller-controller\.js$/, '-controller.js');
  
  // 3. Nettoyer les doubles tirets
  newName = newName.replace(/--+/g, '-');
  
  return newName;
}

console.log('🎮 Correction des controllers avec noms problématiques...');

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
    const newName = fixControllerName(file);
    const newPath = path.join(controllersDir, newName);
    
    console.log(`   🔍 Analyse: ${file} → ${newName}`);
    
    try {
      // Backup
      const backupPath = createBackup(oldPath);
      
      // Validation
      if (fs.existsSync(newPath)) {
        console.log(`   ⚠️  Fichier cible existe déjà: ${newName} - SKIPPED`);
        fixLog.push({
          type: 'controller',
          old: file,
          new: newName,
          status: 'SKIPPED_EXISTS',
          backup: backupPath
        });
        return;
      }
      
      if (newName === file) {
        console.log(`   ℹ️  Pas de changement nécessaire: ${file}`);
        return;
      }
      
      // Renommer
      fs.renameSync(oldPath, newPath);
      totalFixed++;
      console.log(`   ✅ Corrigé: ${file} → ${newName}`);
      fixLog.push({
        type: 'controller',
        old: file,
        new: newName,
        status: 'FIXED',
        backup: backupPath
      });
      
    } catch (error) {
      totalErrors++;
      console.log(`   ❌ Erreur: ${file} - ${error.message}`);
      fixLog.push({
        type: 'controller',
        old: file,
        new: newName,
        status: 'ERROR',
        error: error.message
      });
    }
  });
}

// Vérification finale
console.log('\n🔍 Vérification finale...');
if (fs.existsSync(controllersDir)) {
  const allControllers = fs.readdirSync(controllersDir).filter(file => file.endsWith('.js'));
  const compliantControllers = allControllers.filter(file => file.endsWith('-controller.js'));
  const problematicControllers = allControllers.filter(file => 
    file.includes('Controller-controller.js') || 
    file.includes('.controller-controller.js')
  );
  
  console.log(`   📊 Total controllers: ${allControllers.length}`);
  console.log(`   ✅ Conformes: ${compliantControllers.length}`);
  console.log(`   ❌ Problématiques: ${problematicControllers.length}`);
  
  if (problematicControllers.length > 0) {
    console.log('\n   🚨 Controllers restants problématiques:');
    problematicControllers.forEach(file => {
      console.log(`      • ${file}`);
    });
  } else {
    console.log('\n   🎉 Tous les controllers sont correctement nommés!');
  }
}

// Résultats finaux
console.log('\n📊 RÉSULTATS FINAUX:');
console.log(`   ✅ Fichiers corrigés: ${totalFixed}`);
console.log(`   ❌ Erreurs: ${totalErrors}`);
console.log(`   📁 Backup: ${backupDir}`);

// Générer le rapport
const report = {
  date: new Date().toISOString(),
  operation: 'CONTROLLERS_FINAL_FIX',
  results: {
    totalFixed,
    totalErrors,
    backupDirectory: backupDir
  },
  fixLog
};

fs.writeFileSync('controllers-final-fix-report.json', JSON.stringify(report, null, 2));
console.log('\n💾 Rapport détaillé sauvegardé: controllers-final-fix-report.json');

if (totalErrors === 0 && totalFixed > 0) {
  console.log('\n🎉 CORRECTION DES CONTROLLERS TERMINÉE AVEC SUCCÈS!');
} else if (totalFixed === 0) {
  console.log('\nℹ️  Aucune correction nécessaire - controllers déjà conformes');
} else {
  console.log('\n⚠️  Correction terminée avec des erreurs - vérifier le rapport');
}
