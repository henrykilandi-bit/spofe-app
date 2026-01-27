const fs = require('fs');
const path = require('path');

console.log('🔍 CONVENTION CHECKER SPOFE v2.2 (Pre-commit)');
console.log('============================================\n');

// Configuration
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const fix = args.includes('--fix');
const verbose = args.includes('--verbose');

console.log(`📋 Mode: ${strict ? 'STRICT' : 'STANDARD'}`);
console.log(`🔧 Auto-fix: ${fix ? 'OUI' : 'NON'}`);
console.log(`📝 Verbose: ${verbose ? 'OUI' : 'NON'}\n`);

// Conventions SPOFE v2.2
const CONVENTIONS = {
  controllers: {
    pattern: /^[a-z0-9-]+-controller\.js$/,
    description: 'kebab-case-controller.js',
    exceptions: ['*-minimal', '*-test', '*-mock', '*-stub'],
    directory: 'cascade/src/controllers'
  },
  models: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.js$/,
    description: 'PascalCase.js',
    exceptions: ['*-test', '*-mock', '*-stub'],
    directory: 'cascade/src/models'
  },
  pages: {
    pattern: /^[a-z0-9-]+\.jsx$/,
    description: 'kebab-case.jsx',
    exceptions: ['*-test', '*-mock', '*-stub'],
    directory: 'frontend/src/pages'
  },
  dtos: {
    pattern: /^[A-Z][a-zA-Z0-9]*Dto\.js$/,
    description: 'PascalCaseDto.js',
    exceptions: [],
    directory: 'cascade/src/dto'
  }
};

// Fonction pour vérifier si un fichier est une exception
function isException(fileName, category) {
  const convention = CONVENTIONS[category];
  return convention.exceptions.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(fileName);
  });
}

// Fonction pour valider un fichier
function validateFile(fileName, category) {
  const convention = CONVENTIONS[category];
  
  // Vérifier les exceptions
  if (isException(fileName, category)) {
    return { isCompliant: true, isException: true, reason: 'Exception autorisée' };
  }
  
  // Validation standard
  const isCompliant = convention.pattern.test(fileName);
  const reason = isCompliant ? 'Conforme' : 'Non conforme';
  
  return { isCompliant, isException: false, reason };
}

// Fonction pour générer le nom correct
function generateCorrectName(fileName, category) {
  const convention = CONVENTIONS[category];
  
  switch (category) {
    case 'controllers':
      const baseName = fileName.replace(/\.js$/, '').replace(/-controller\.js$/, '').replace(/Controller/g, '');
      return baseName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') + '-controller.js';
      
    case 'models':
      const modelBase = fileName.replace(/\.(js|model\.js)$/, '');
      return modelBase.charAt(0).toUpperCase() + modelBase.slice(1).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase()) + '.js';
      
    case 'pages':
      const pageBase = fileName.replace(/\.jsx$/, '');
      return pageBase.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') + '.jsx';
      
    case 'dtos':
      const dtoBase = fileName.replace(/\.js$/, '').replace(/dto$/i, '');
      return dtoBase.charAt(0).toUpperCase() + dtoBase.slice(1) + 'Dto.js';
      
    default:
      return fileName;
  }
}

// Fonction pour scanner un répertoire
function scanDirectory(dirPath, category) {
  if (!fs.existsSync(dirPath)) {
    if (verbose) {
      console.log(`⚠️  Répertoire inexistant: ${dirPath}`);
    }
    return { total: 0, compliant: 0, nonCompliant: [], exceptions: [], details: [] };
  }

  const files = fs.readdirSync(dirPath).filter(file => {
    const ext = category === 'pages' ? '.jsx' : '.js';
    return file.endsWith(ext);
  });

  const results = {
    total: files.length,
    compliant: 0,
    nonCompliant: [],
    exceptions: [],
    details: []
  };

  files.forEach(file => {
    const validation = validateFile(file, category);
    
    if (validation.isException) {
      results.exceptions.push(file);
      results.compliant++;
    } else if (validation.isCompliant) {
      results.compliant++;
    } else {
      results.nonCompliant.push({
        file,
        suggestedName: generateCorrectName(file, category),
        reason: validation.reason
      });
    }

    results.details.push({
      file,
      isCompliant: validation.isCompliant,
      isException: validation.isException,
      reason: validation.reason
    });
  });

  return results;
}

// Fonction pour corriger un fichier
function fixFile(filePath, oldName, newName) {
  try {
    const newPath = path.join(path.dirname(filePath), newName);
    
    if (fs.existsSync(newPath)) {
      console.log(`   ⚠️  Fichier cible existe déjà: ${newName}`);
      return false;
    }
    
    fs.renameSync(filePath, newPath);
    console.log(`   ✅ Corrigé: ${oldName} → ${newName}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Erreur correction ${oldName}: ${error.message}`);
    return false;
  }
}

// Analyse des catégories
const results = {};
let totalFiles = 0;
let totalCompliant = 0;
let totalNonCompliant = 0;

Object.entries(CONVENTIONS).forEach(([category, convention]) => {
  console.log(`📋 ${category.charAt(0).toUpperCase() + category.slice(1)} Analysis:`);
  const categoryResults = scanDirectory(convention.directory, category);
  
  results[category] = categoryResults;
  totalFiles += categoryResults.total;
  totalCompliant += categoryResults.compliant;
  totalNonCompliant += categoryResults.nonCompliant.length;
  
  console.log(`   Total: ${categoryResults.total}`);
  console.log(`   Conformes: ${categoryResults.compliant}`);
  console.log(`   Exceptions: ${categoryResults.exceptions.length}`);
  console.log(`   Non conformes: ${categoryResults.nonCompliant.length}`);
  
  if (categoryResults.nonCompliant.length > 0) {
    console.log('❌ Fichiers non conformes:');
    categoryResults.nonCompliant.forEach(item => {
      console.log(`   • ${item.file} → devrait être ${item.suggestedName}`);
    });
    
    // Auto-fix si demandé
    if (fix) {
      console.log('🔧 Correction automatique...');
      categoryResults.nonCompliant.forEach(item => {
        const filePath = path.join(convention.directory, item.file);
        fixFile(filePath, item.file, item.suggestedName);
      });
    }
  } else {
    console.log('✅ Tous les fichiers sont conformes!');
  }
  
  console.log('');
});

// Score global
const globalRate = totalFiles > 0 ? ((totalCompliant / totalFiles) * 100).toFixed(1) : '100';

console.log('📊 GLOBAL COMPLIANCE SCORE:');
console.log(`   Total files checked: ${totalFiles}`);
console.log(`   Compliant files: ${totalCompliant}`);
console.log(`   Non compliant files: ${totalNonCompliant}`);
console.log(`   Global compliance rate: ${globalRate}%`);

// Validation du seuil
const threshold = strict ? 100 : 90;
const passed = parseFloat(globalRate) >= threshold;

if (passed) {
  console.log(`\n✅ CONVENTIONS RESPECTÉES (${globalRate}% >= ${threshold}%)`);
} else {
  console.log(`\n❌ CONVENTIONS NON RESPECTÉES (${globalRate}% < ${threshold}%)`);
  
  if (!fix) {
    console.log('\n💡 SOLUTIONS:');
    console.log('   1. Exécuter avec --fix pour corriger automatiquement');
    console.log('   2. Corriger manuellement les fichiers listés ci-dessus');
    console.log('   3. Utiliser --strict pour un mode plus strict');
  }
}

// Rapport détaillé
const report = {
  date: new Date().toISOString(),
  mode: strict ? 'strict' : 'standard',
  autoFix: fix,
  results,
  global: {
    total: totalFiles,
    compliant: totalCompliant,
    nonCompliant: totalNonCompliant,
    rate: parseFloat(globalRate),
    threshold,
    passed
  }
};

// Sauvegarder le rapport
const reportFileName = `convention-checker-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFileName}`);

// Code de sortie
process.exit(passed ? 0 : 1);
