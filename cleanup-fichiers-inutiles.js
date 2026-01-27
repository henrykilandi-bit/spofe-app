const fs = require('fs');
const path = require('path');

console.log('🧹 NETTOYAGE DES FICHIERS INUTILES - SPOFE v2.2');
console.log('===========================================\n');

// Configuration
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const aggressive = args.includes('--aggressive');

console.log(`📋 Mode: ${dryRun ? 'DRY RUN' : 'NETTOYAGE RÉEL'}`);
console.log(`📝 Verbose: ${verbose ? 'OUI' : 'NON'}`);
console.log(`🔥 Aggressif: ${aggressive ? 'OUI' : 'NON'}\n`);

// Configuration des répertoires
const projectRoot = 'C:\\Users\\henry\\Desktop\\SPOFE-APP VERS 1.0';

// Fichiers et répertoires à supprimer (classés par dangerosité)
const cleanupTargets = {
  // 🔴 DANGEREUX - À supprimer avec prudence
  dangerous: [
    // Archives d'illusions (déjà archivées)
    'ARCHIVES_ILLUSIONS_2026-01-28',
    
    // Scripts obsolètes dans technarchives
    'technarchives',
    
    // Backups de database (si XAMPP est utilisé)
    'database-backups',
    
    // Scripts de test obsolètes
    'cascade/analyze-full-db.js',
    'cascade/analyze-db.js',
    'cascade/analyze-db-complete.js',
    'cascade/backups',
    'cascade/check-*.js',
    'cascade/clean-*.js',
    'cascade/comprehensive-*.js',
    'cascade/create-*.js',
    'cascade/update-*.js',
    'cascade/vitest.config.js',
    'cascade/tests',
    
    // Frontend config dupliquée
    'frontend/src/vitest.setup.js',
    'frontend/postcss.config.js',
    
    // Scripts de validation dupliqués
    'scripts/conventions-compliance-checker.js',
    'scripts/install-pre-commit.js',
    'scripts/pre-commit-hook.js'
  ],
  
  // 🟡 MOYEN - Fichiers probablement inutiles
  medium: [
    // Documentation dupliquée ou obsolète
    'RAPPORT_ALIGNEMENT_SPOFE_v2.1.md',
    'docs',
    
    // Configurations dupliquées
    '.husky',
    '.vscode',
    '.github',
    
    // Node modules (à reconstruire si nécessaire)
    'node_modules',
    
    // Logs et fichiers temporaires
    '*.log',
    '*.tmp',
    '*.cache',
    
    // Scripts d'analyse
    'analyse-fichiers-manquants.js'
  ],
  
  // 🟢 SÛR - Fichiers clairement inutiles
  safe: [
    // Fichiers temporaires
    '*.temp',
    '*.bak',
    '*.old',
    '*.swp',
    '*.swo',
    '*~',
    
    // Éditeurs de fichiers
    '.DS_Store',
    'Thumbs.db',
    'desktop.ini'
  ]
};

// Fichiers à PRÉSERVER (jamais supprimés)
const preserveFiles = [
  'cascade/src/models/index.js',
  'cascade/src/config/database.js',
  'cascade/src/app.js',
  'cascade/src/server.js',
  'cascade/src/models/GroupeSuperUser.js',
  'cascade/src/models/PendingApproval.js',
  'cascade/src/dto',
  'cascade/src/controllers/user-controller.js',
  'cascade/src/controllers/auth-controller.js',
  '.env',
  '.env.production.example',
  '.spofe-config.json',
  '.dockerignore',
  'package.json',
  'package-lock.json',
  'README.md'
];

// Fonction pour vérifier si un fichier doit être préservé
function shouldPreserve(filePath) {
  return preserveFiles.some(preserve => {
    const preservePath = path.join(projectRoot, preserve);
    return filePath === preservePath || filePath.startsWith(preservePath);
  });
}

// Fonction pour vérifier si un chemin existe
function pathExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Fonction pour obtenir les infos d'un fichier/répertoire
function getPathInfo(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      isDirectory: stats.isDirectory(),
      size: stats.size,
      modified: stats.mtime
    };
  } catch (error) {
    return { exists: false };
  }
}

// Fonction pour calculer la taille d'un répertoire
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Ignorer les erreurs de lecture
  }
  
  return totalSize;
}

// Fonction pour formater la taille
function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Fonction pour supprimer un fichier ou répertoire
function deletePath(filePath) {
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Supprimer récursivement le répertoire
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      // Supprimer le fichier
      fs.unlinkSync(filePath);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Erreur suppression ${filePath}: ${error.message}`);
    return false;
  }
}

// Fonction pour traiter les cibles de nettoyage
function processCleanupTargets(category, targets) {
  console.log(`\n🔍 Traitement: ${category.toUpperCase()}`);
  console.log('='.repeat(50));
  
  const results = {
    total: targets.length,
    processed: 0,
    deleted: 0,
    preserved: 0,
    errors: 0,
    totalSize: 0,
    details: []
  };
  
  targets.forEach(target => {
    // Traitement des wildcards
    let matchingPaths = [];
    
    if (target.includes('*')) {
      // Gérer les wildcards
      const regex = new RegExp(target.replace(/\*/g, '.*'));
      try {
        const allItems = [];
        
        // Scanner le répertoire racine
        const items = fs.readdirSync(projectRoot);
        items.forEach(item => {
          const itemPath = path.join(projectRoot, item);
          if (regex.test(item) && pathExists(itemPath)) {
            matchingPaths.push(itemPath);
          }
        });
        
        // Scanner cascade aussi pour les wildcards spécifiques
        if (target.includes('cascade/')) {
          const cascadeDir = path.join(projectRoot, 'cascade');
          if (pathExists(cascadeDir)) {
            try {
              const cascadeItems = fs.readdirSync(cascadeDir);
              cascadeItems.forEach(item => {
                const itemPath = path.join(cascadeDir, item);
                const relativePath = path.relative(projectRoot, itemPath);
                if (regex.test(relativePath) && pathExists(itemPath)) {
                  matchingPaths.push(itemPath);
                }
              });
            } catch (error) {
              // Ignorer les erreurs
            }
          }
        }
      } catch (error) {
        // Ignorer les erreurs
      }
    } else {
      // Chemin direct
      const fullPath = path.join(projectRoot, target);
      if (pathExists(fullPath)) {
        matchingPaths.push(fullPath);
      }
    }
    
    // Traiter chaque chemin correspondant
    matchingPaths.forEach(fullPath => {
      const relativePath = path.relative(projectRoot, fullPath);
      results.processed++;
      
      // Vérifier si le fichier doit être préservé
      if (shouldPreserve(fullPath)) {
        results.preserved++;
        if (verbose) {
          console.log(`   🔒 PRÉSERVÉ: ${relativePath}`);
        }
        return;
      }
      
      // Obtenir les infos du chemin
      const pathInfo = getPathInfo(fullPath);
      
      if (!pathInfo.exists) {
        if (verbose) {
          console.log(`   ⚠️  INEXISTANT: ${relativePath}`);
        }
        return;
      }
      
      // Calculer la taille
      let size = pathInfo.size;
      if (pathInfo.isDirectory) {
        size = getDirectorySize(fullPath);
      }
      results.totalSize += size;
      
      // Afficher les détails
      console.log(`   📁 ${pathInfo.isDirectory ? 'RÉPERTOIRE' : 'FICHIER'}: ${relativePath}`);
      console.log(`      📏 Taille: ${formatSize(size)}`);
      console.log(`      📅 Modifié: ${pathInfo.modified.toLocaleDateString()}`);
      
      // Supprimer ou dry-run
      if (dryRun) {
        console.log(`      🔍 DRY RUN: Serait supprimé`);
        results.deleted++;
      } else {
        if (deletePath(fullPath)) {
          console.log(`      ✅ SUPPRIMÉ`);
          results.deleted++;
        } else {
          results.errors++;
        }
      }
      
      results.details.push({
        path: relativePath,
        isDirectory: pathInfo.isDirectory,
        size,
        modified: pathInfo.modified,
        deleted: dryRun || pathExists(fullPath) === false
      });
    });
  });
  
  console.log(`\n📊 ${category}: ${results.deleted}/${results.processed} supprimés (${formatSize(results.totalSize)})`);
  
  return results;
}

// Analyse principale
console.log('📋 Analyse des fichiers inutiles à supprimer...\n');

// Vérifier les fichiers à préserver
console.log('🔒 Fichiers à préserver:');
preserveFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (pathExists(fullPath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} (non trouvé)`);
  }
});

// Traiter chaque catégorie de nettoyage
const allResults = {
  dangerous: processCleanupTargets('dangereux', cleanupTargets.dangerous),
  medium: aggressive ? processCleanupTargets('moyen', cleanupTargets.medium) : { total: 0, deleted: 0, totalSize: 0 },
  safe: processCleanupTargets('sûr', cleanupTargets.safe)
};

// Calculer les totaux
const totalResults = {
  totalProcessed: allResults.dangerous.processed + allResults.medium.processed + allResults.safe.processed,
  totalDeleted: allResults.dangerous.deleted + allResults.medium.deleted + allResults.safe.deleted,
  totalPreserved: allResults.dangerous.preserved + allResults.medium.preserved + allResults.safe.preserved,
  totalErrors: allResults.dangerous.errors + allResults.medium.errors + allResults.safe.errors,
  totalSize: allResults.dangerous.totalSize + allResults.medium.totalSize + allResults.safe.totalSize
};

// Résumé final
console.log('\n🎯 RÉSUMÉ DU NETTOYAGE');
console.log('=====================');
console.log(`📊 Total traité: ${totalResults.totalProcessed} éléments`);
console.log(`✅ Total supprimé: ${totalResults.totalDeleted} éléments`);
console.log(`🔒 Total préservé: ${totalResults.totalPreserved} éléments`);
console.log(`❌ Total erreurs: ${totalResults.totalErrors} éléments`);
console.log(`💾 Espace libéré: ${formatSize(totalResults.totalSize)}`);

if (dryRun) {
  console.log('\n⚠️  MODE DRY RUN - Aucun fichier n\'a été réellement supprimé');
  console.log('💡 Pour exécuter le nettoyage réel, utilisez:');
  console.log('   node cleanup-fichiers-inutiles.js');
} else {
  console.log('\n✅ NETTOYAGE TERMINÉ - Fichiers supprimés avec succès');
  
  if (totalResults.totalErrors > 0) {
    console.log(`⚠️  ${totalResults.totalErrors} erreurs rencontrées pendant le nettoyage`);
  }
}

// Recommandations
console.log('\n💡 RECOMMANDATIONS POST-NETTOYAGE:');

if (totalResults.totalSize > 0) {
  console.log('   1. Espace libéré:', formatSize(totalResults.totalSize));
}

if (allResults.dangerous.deleted > 0) {
  console.log('   2. Exécuter "npm install" pour reconstruire node_modules si nécessaire');
}

if (allResults.medium.deleted > 0) {
  console.log('   3. Vérifier que l\'application fonctionne toujours');
  console.log('   4. Commiter les changements si tout est fonctionnel');
}

console.log('   5. Exécuter "node analyse-fichiers-manquants.js" pour vérifier l\'état');

// Génération du rapport
const report = {
  date: new Date().toISOString(),
  mode: dryRun ? 'dry-run' : 'cleanup',
  aggressive,
  summary: totalResults,
  categories: allResults,
  preserveFiles: preserveFiles.filter(file => pathExists(path.join(projectRoot, file)))
};

const reportFileName = `cleanup-fichiers-inutiles-${dryRun ? 'dry-run' : 'rapport'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFileName}`);

// Code de sortie
if (totalResults.totalErrors > 0) {
  console.log('\n❌ NETTOYAGE TERMINÉ AVEC ERREURS');
  process.exit(1);
} else if (totalResults.totalDeleted > 0) {
  console.log('\n✅ NETTOYAGE RÉUSSI');
  process.exit(0);
} else {
  console.log('\nℹ️  AUCUN FICHIER À SUPPRIMER');
  process.exit(0);
}
