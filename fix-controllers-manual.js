const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION MANUELLE DES CONTROLLERS SPOFE v2.2');
console.log('===============================================\n');

// Backup directory
const backupDir = 'BACKUP_CONTROLLERS_MANUAL_' + new Date().toISOString().replace(/[:.]/g, '-');
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

// Mapping manuel des corrections nécessaires
const corrections = [
  { old: 'approvals-controller-controller.js', new: 'approvals-controller.js' },
  { old: 'auth-advanced-controller-controller.js', new: 'auth-advanced-controller.js' },
  { old: 'auth-controller-controller.js', new: 'auth-controller.js' },
  { old: 'auth.controller.minimal-controller.js', new: 'auth-controller-minimal.js' },
  { old: 'business-operations-controller-controller.js', new: 'business-operations-controller.js' },
  { old: 'chart-of-accounts-controller-controller.js', new: 'chart-of-accounts-controller.js' },
  { old: 'dashboard-controller-controller.js', new: 'dashboard-controller.js' },
  { old: 'indicators-controller-controller.js', new: 'indicators-controller.js' },
  { old: 'init-controller-controller.js', new: 'init-controller.js' },
  { old: 'journal-entries-controller-controller.js', new: 'journal-entries-controller.js' },
  { old: 'objectives-controller-controller.js', new: 'objectives-controller.js' },
  { old: 'operation-templates-controller-controller.js', new: 'operation-templates-controller.js' },
  { old: 'optimized-journal-controller-controller.js', new: 'optimized-journal-controller.js' },
  { old: 'reports-controller-controller.js', new: 'reports-controller.js' },
  { old: 'scheduler-controller-controller.js', new: 'scheduler-controller.js' },
  { old: 'secure-journal-controller-controller.js', new: 'secure-journal-controller.js' },
  { old: 'strategic-ai-controller-controller.js', new: 'strategic-ai-controller.js' },
  { old: 'third-parties-controller-controller.js', new: 'third-parties-controller.js' },
  { old: 'user-controller-controller.js', new: 'user-controller.js' }
];

console.log('🎮 Application des corrections manuelles...');

corrections.forEach(correction => {
  const oldPath = path.join(controllersDir, correction.old);
  const newPath = path.join(controllersDir, correction.new);
  
  console.log(`\n🔍 Traitement: ${correction.old}`);
  
  try {
    // Vérifier si le fichier source existe
    if (!fs.existsSync(oldPath)) {
      console.log(`   ℹ️  Fichier source inexistant: ${correction.old}`);
      return;
    }
    
    // Backup
    const backupPath = createBackup(oldPath);
    
    // Vérifier si le fichier cible existe déjà
    if (fs.existsSync(newPath)) {
      console.log(`   ⚠️  Fichier cible existe déjà: ${correction.new} - SKIPPED`);
      fixLog.push({
        type: 'controller',
        old: correction.old,
        new: correction.new,
        status: 'SKIPPED_EXISTS',
        backup: backupPath
      });
      return;
    }
    
    // Renommer
    fs.renameSync(oldPath, newPath);
    totalFixed++;
    console.log(`   ✅ Corrigé: ${correction.old} → ${correction.new}`);
    fixLog.push({
      type: 'controller',
      old: correction.old,
      new: correction.new,
      status: 'FIXED',
      backup: backupPath
    });
    
  } catch (error) {
    totalErrors++;
    console.log(`   ❌ Erreur: ${correction.old} - ${error.message}`);
    fixLog.push({
      type: 'controller',
      old: correction.old,
      new: correction.new,
      status: 'ERROR',
      error: error.message
    });
  }
});

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
    console.log('\n   📋 Liste des controllers conformes:');
    compliantControllers.forEach(file => {
      console.log(`      • ${file}`);
    });
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
  operation: 'CONTROLLERS_MANUAL_FIX',
  results: {
    totalFixed,
    totalErrors,
    backupDirectory: backupDir
  },
  fixLog
};

fs.writeFileSync('controllers-manual-fix-report.json', JSON.stringify(report, null, 2));
console.log('\n💾 Rapport détaillé sauvegardé: controllers-manual-fix-report.json');

if (totalErrors === 0 && totalFixed > 0) {
  console.log('\n🎉 CORRECTION MANUELLE DES CONTROLLERS TERMINÉE AVEC SUCCÈS!');
} else if (totalFixed === 0) {
  console.log('\nℹ️  Aucune correction nécessaire');
} else {
  console.log('\n⚠️  Correction terminée avec des erreurs - vérifier le rapport');
}
