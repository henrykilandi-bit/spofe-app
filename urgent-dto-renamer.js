const fs = require('fs');
const path = require('path');

console.log('🚨 RENOMMAGE URGENT DES DTOS - CONTRAT SILC v1.0');
console.log('================================================\n');

// Configuration
const dtoDir = 'cascade/src/dto';
const backupDir = 'BACKUP_DTO_RENAMING_' + new Date().toISOString().replace(/[:.]/g, '-');

// Vérifier que le répertoire existe
if (!fs.existsSync(dtoDir)) {
  console.error('❌ Répertoire DTO introuvable:', dtoDir);
  process.exit(1);
}

// Créer le répertoire de backup
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('📁 Répertoire de backup créé:', backupDir);
}

// Lister tous les DTOs
const dtoFiles = fs.readdirSync(dtoDir).filter(file => 
  file.endsWith('.dto.js') && fs.statSync(path.join(dtoDir, file)).isFile()
);

console.log(`🔍 ${dtoFiles.length} DTOs trouvés à renommer\n`);

// Fonction pour convertir snake_case en PascalCaseDto
function convertToPascalCaseDto(filename) {
  // Extraire le nom sans extension
  const baseName = filename.replace('.dto.js', '');
  
  // Convertir snake_case en PascalCase
  const pascalCase = baseName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  // Ajouter le suffixe Dto
  return pascalCase + 'Dto.js';
}

// Fonction pour créer le backup
function createBackup(filePath, backupPath) {
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(backupPath, content);
}

// Variables de suivi
let renamedCount = 0;
let errorCount = 0;
const renameLog = [];

console.log('🔄 DÉBUT DU RENOMMAGE...\n');

// Traiter chaque DTO
dtoFiles.forEach(originalFile => {
  const originalPath = path.join(dtoDir, originalFile);
  const newFile = convertToPascalCaseDto(originalFile);
  const newPath = path.join(dtoDir, newFile);
  const backupPath = path.join(backupDir, originalFile);
  
  try {
    // Créer le backup
    createBackup(originalPath, backupPath);
    
    // Vérifier si le nouveau nom est différent
    if (originalFile !== newFile) {
      // Vérifier que le nouveau fichier n'existe pas déjà
      if (fs.existsSync(newPath)) {
        console.log(`⚠️  Fichier cible existe déjà: ${newFile} - SKIPPED`);
        renameLog.push({
          original: originalFile,
          new: newFile,
          status: 'SKIPPED - EXISTS',
          reason: 'Target file already exists'
        });
        return;
      }
      
      // Renommer le fichier
      fs.renameSync(originalPath, newPath);
      renamedCount++;
      
      console.log(`✅ ${originalFile} → ${newFile}`);
      renameLog.push({
        original: originalFile,
        new: newFile,
        status: 'RENAMED',
        backup: backupPath
      });
    } else {
      console.log(`ℹ️  ${originalFile} - déjà conforme`);
      renameLog.push({
        original: originalFile,
        new: newFile,
        status: 'ALREADY_COMPLIANT'
      });
    }
  } catch (error) {
    errorCount++;
    console.log(`❌ ERREUR: ${originalFile} - ${error.message}`);
    renameLog.push({
      original: originalFile,
      new: newFile,
      status: 'ERROR',
      error: error.message
    });
  }
});

console.log(`\n📊 RÉSULTATS:`);
console.log(`   ✅ Renommés: ${renamedCount}`);
console.log(`   ❌ Erreurs: ${errorCount}`);
console.log(`   📁 Backup: ${backupDir}`);

// Mettre à jour les imports dans les autres fichiers
console.log('\n🔍 MISE À JOUR DES IMPORTS...');

const directoriesToUpdate = [
  'cascade/src/controllers',
  'cascade/src/services',
  'cascade/src/middleware',
  'cascade/src/routes',
  'cascade/src/models',
  'cascade/src/scripts',
  'cascade/src/utils',
  'cascade/tests',
  'frontend/src'
];

let updatedImports = 0;

directoriesToUpdate.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && (dirent.name.endsWith('.js') || dirent.name.endsWith('.jsx')))
    .map(dirent => path.join(dir, dirent.name));
  
  files.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Mettre à jour les imports pour chaque DTO renommé
      renameLog.forEach(log => {
        if (log.status === 'RENAMED') {
          const oldImportPath = `./dto/${log.original.replace('.js', '')}`;
          const newImportPath = `./dto/${log.new.replace('.js', '')}`;
          
          // Remplacer les imports
          const oldRequire = `require('${oldImportPath}')`;
          const newRequire = `require('${newImportPath}')`;
          
          if (content.includes(oldRequire)) {
            content = content.replace(new RegExp(oldRequire.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newRequire);
            modified = true;
          }
          
          // Remplacer les imports ES6
          const oldImport = `from '${oldImportPath}'`;
          const newImport = `from '${newImportPath}'`;
          
          if (content.includes(oldImport)) {
            content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
            modified = true;
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
});

console.log(`\n📝 Imports mis à jour: ${updatedImports} fichiers`);

// Générer le rapport
const report = {
  date: new Date().toISOString(),
  operation: 'URGENT_DTO_RENAMING',
  contract: 'SILC_v1.0',
  results: {
    totalFiles: dtoFiles.length,
    renamed: renamedCount,
    errors: errorCount,
    importsUpdated: updatedImports,
    backupDirectory: backupDir
  },
  renameLog: renameLog
};

fs.writeFileSync('urgent-dto-renaming-report.json', JSON.stringify(report, null, 2));
console.log('\n💾 Rapport détaillé sauvegardé: urgent-dto-renaming-report.json');

// Vérifier la conformité finale
console.log('\n🔍 VÉRIFICATION DE LA CONFORMITÉ FINALE...');
const finalFiles = fs.readdirSync(dtoDir).filter(file => 
  file.endsWith('.dto.js') && fs.statSync(path.join(dtoDir, file)).isFile()
);

const compliantFiles = finalFiles.filter(file => file.endsWith('Dto.js'));
const complianceRate = ((compliantFiles.length / finalFiles.length) * 100).toFixed(1);

console.log(`📊 Conformité SILC v1.0: ${compliantFiles.length}/${finalFiles.length} (${complianceRate}%)`);

if (complianceRate === '100.0') {
  console.log('🎉 TOUS LES DTOS SONT MAINTENANT CONFORMES AU CONTRAT SILC v1.0!');
} else {
  console.log(`⚠️  ${finalFiles.length - compliantFiles.length} DTOs restent non conformes`);
  
  // Afficher les fichiers non conformes
  const nonCompliant = finalFiles.filter(file => !file.endsWith('Dto.js'));
  if (nonCompliant.length > 0) {
    console.log('Fichiers non conformes:');
    nonCompliant.forEach(file => {
      console.log(`   • ${file}`);
    });
  }
}

console.log('\n✅ Opération terminée!');
