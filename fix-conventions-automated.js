const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION AUTOMATISÉE DES CONVENTIONS SPOFE v2.2');
console.log('===================================================\n');

// Configuration
const directories = {
  controllers: 'cascade/src/controllers',
  models: 'cascade/src/models',
  pages: 'frontend/src/pages'
};

// Backup directory
const backupDir = 'BACKUP_CONVENTIONS_FIX_' + new Date().toISOString().replace(/[:.]/g, '-');
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

// Fonction pour convertir en kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '');
}

// Correction des Controllers
console.log('🎮 Correction des Controllers...');
if (fs.existsSync(directories.controllers)) {
  const controllerFiles = fs.readdirSync(directories.controllers).filter(file => 
    file.endsWith('.js') && !file.endsWith('-controller.js')
  );
  
  controllerFiles.forEach(file => {
    const oldPath = path.join(directories.controllers, file);
    const newName = file.replace(/\.js$/, '-controller.js');
    const newPath = path.join(directories.controllers, newName);
    
    try {
      // Backup
      const backupPath = createBackup(oldPath);
      
      // Renommer
      if (!fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        totalFixed++;
        console.log(`✅ ${file} → ${newName}`);
        fixLog.push({
          type: 'controller',
          old: file,
          new: newName,
          status: 'RENAMED',
          backup: backupPath
        });
      } else {
        console.log(`⚠️  Fichier cible existe déjà: ${newName} - SKIPPED`);
        fixLog.push({
          type: 'controller',
          old: file,
          new: newName,
          status: 'SKIPPED_EXISTS'
        });
      }
    } catch (error) {
      totalErrors++;
      console.log(`❌ Erreur: ${file} - ${error.message}`);
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

// Correction des Pages Frontend
console.log('\n📄 Correction des Pages Frontend...');
if (fs.existsSync(directories.pages)) {
  const pageFiles = fs.readdirSync(directories.pages).filter(file => 
    file.endsWith('.jsx') && !/^[a-z]+(?:-[a-z]+)*\.jsx$/.test(file)
  );
  
  pageFiles.forEach(file => {
    const oldPath = path.join(directories.pages, file);
    const newName = toKebabCase(file.replace('.jsx', '')) + '.jsx';
    const newPath = path.join(directories.pages, newName);
    
    try {
      // Backup
      const backupPath = createBackup(oldPath);
      
      // Renommer
      if (!fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        totalFixed++;
        console.log(`✅ ${file} → ${newName}`);
        fixLog.push({
          type: 'page',
          old: file,
          new: newName,
          status: 'RENAMED',
          backup: backupPath
        });
      } else {
        console.log(`⚠️  Fichier cible existe déjà: ${newName} - SKIPPED`);
        fixLog.push({
          type: 'page',
          old: file,
          new: newName,
          status: 'SKIPPED_EXISTS'
        });
      }
    } catch (error) {
      totalErrors++;
      console.log(`❌ Erreur: ${file} - ${error.message}`);
      fixLog.push({
        type: 'page',
        old: file,
        new: newName,
        status: 'ERROR',
        error: error.message
      });
    }
  });
}

// Correction des Models (plus complexe - vérification du contenu)
console.log('\n📊 Correction des Models...');
if (fs.existsSync(directories.models)) {
  const modelFiles = fs.readdirSync(directories.models).filter(file => 
    file.endsWith('.js') && !/^[A-Z][a-zA-Z0-9]*\.js$/.test(file)
  );
  
  modelFiles.forEach(file => {
    const oldPath = path.join(directories.models, file);
    
    try {
      // Lire le contenu pour vérifier si c'est un model Sequelize
      const content = fs.readFileSync(oldPath, 'utf8');
      
      // Vérifier si c'est vraiment un model (contient "sequelize.define" ou "Model.init")
      if (content.includes('sequelize.define') || content.includes('Model.init') || content.includes('extends Model')) {
        // Convertir en PascalCase
        const baseName = file.replace('.js', '');
        const pascalCaseName = baseName
          .split(/[_\s-]+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('');
        
        const newName = pascalCaseName + '.js';
        const newPath = path.join(directories.models, newName);
        
        // Backup
        const backupPath = createBackup(oldPath);
        
        // Renommer
        if (!fs.existsSync(newPath)) {
          fs.renameSync(oldPath, newPath);
          totalFixed++;
          console.log(`✅ ${file} → ${newName}`);
          fixLog.push({
            type: 'model',
            old: file,
            new: newName,
            status: 'RENAMED',
            backup: backupPath
          });
        } else {
          console.log(`⚠️  Fichier cible existe déjà: ${newName} - SKIPPED`);
          fixLog.push({
            type: 'model',
            old: file,
            new: newName,
            status: 'SKIPPED_EXISTS'
          });
        }
      } else {
        console.log(`ℹ️  ${file} - Ne semble pas être un model Sequelize, ignoré`);
        fixLog.push({
          type: 'model',
          old: file,
          new: file,
          status: 'NOT_A_MODEL'
        });
      }
    } catch (error) {
      totalErrors++;
      console.log(`❌ Erreur: ${file} - ${error.message}`);
      fixLog.push({
        type: 'model',
        old: file,
        new: 'UNKNOWN',
        status: 'ERROR',
        error: error.message
      });
    }
  });
}

// Mise à jour des imports
console.log('\n📝 Mise à jour des imports...');
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
      
      // Mettre à jour les imports pour chaque fichier renommé
      fixLog.forEach(log => {
        if (log.status === 'RENAMED') {
          const oldBaseName = log.old.replace(/\.(js|jsx)$/, '');
          const newBaseName = log.new.replace(/\.(js|jsx)$/, '');
          
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
});

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
if (fs.existsSync(directories.controllers)) {
  const controllerFiles = fs.readdirSync(directories.controllers).filter(file => file.endsWith('.js'));
  finalStats.controllers.total = controllerFiles.length;
  finalStats.controllers.compliant = controllerFiles.filter(file => file.endsWith('-controller.js')).length;
}

// Models
if (fs.existsSync(directories.models)) {
  const modelFiles = fs.readdirSync(directories.models).filter(file => file.endsWith('.js'));
  finalStats.models.total = modelFiles.length;
  finalStats.models.compliant = modelFiles.filter(file => /^[A-Z][a-zA-Z0-9]*\.js$/.test(file)).length;
}

// Pages
if (fs.existsSync(directories.pages)) {
  const pageFiles = fs.readdirSync(directories.pages).filter(file => file.endsWith('.jsx'));
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
  operation: 'AUTOMATED_CONVENTIONS_FIX',
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

fs.writeFileSync('automated-conventions-fix-report.json', JSON.stringify(report, null, 2));
console.log('\n💾 Rapport détaillé sauvegardé: automated-conventions-fix-report.json');

if (globalRate >= '90.0') {
  console.log('\n🎉 EXCELLENT! Conformité atteinte!');
} else if (globalRate >= '70.0') {
  console.log('\n✅ BON! Conformité significativement améliorée.');
} else {
  console.log('\n⚠️  Corrections supplémentaires nécessaires.');
}

console.log('\n✅ Opération terminée!');
