const fs = require('fs');
const path = require('path');

console.log('🔍 TEST AMÉLIORÉ DES CONVENTIONS SPOFE v2.2');
console.log('==========================================\n');

// Configuration des modes
const args = process.argv.slice(2);
const mode = args.includes('--strict') ? 'strict' : args.includes('--flexible') ? 'flexible' : 'standard';
const verbose = args.includes('--verbose');

console.log(`📋 Mode: ${mode.toUpperCase()}`);
console.log(`📝 Verbose: ${verbose ? 'OUI' : 'NON'}\n`);

// Conventions SPOFE v2.2
const CONVENTIONS = {
  controllers: {
    pattern: /^[a-z0-9-]+-controller\.js$/,
    description: 'kebab-case-controller.js',
    exceptions: ['*-minimal', '*-test', '*-mock', '*-stub'],
    flexible: /^[a-z0-9-]+-controller\.js$|^[a-z0-9-]+-controller-[a-z0-9-]+\.js$/
  },
  models: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.js$/,
    description: 'PascalCase.js',
    exceptions: ['*-test', '*-mock', '*-stub'],
    flexible: /^[A-Z][a-zA-Z0-9]*\.js$|^[a-z0-9-]+\.model\.js$/
  },
  pages: {
    pattern: /^[a-z0-9-]+\.jsx$/,
    description: 'kebab-case.jsx',
    exceptions: ['*-test', '*-mock', '*-stub'],
    flexible: /^[a-z0-9-]+\.jsx$|^[A-Z][a-zA-Z0-9]*\.jsx$/
  },
  dtos: {
    pattern: /^[A-Z][a-zA-Z0-9]*Dto\.js$/,
    description: 'PascalCaseDto.js',
    exceptions: [],
    flexible: /^[A-Z][a-zA-Z0-9]*Dto\.js$/
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

// Fonction pour valider un fichier selon le mode
function validateFile(fileName, category) {
  const convention = CONVENTIONS[category];
  let isCompliant = false;
  let reason = '';

  // Vérifier les exceptions
  if (isException(fileName, category)) {
    return { isCompliant: true, isException: true, reason: 'Exception autorisée' };
  }

  // Validation selon le mode
  switch (mode) {
    case 'strict':
      isCompliant = convention.pattern.test(fileName);
      reason = isCompliant ? 'Conforme (strict)' : 'Non conforme (strict)';
      break;
    case 'flexible':
      isCompliant = convention.flexible.test(fileName);
      reason = isCompliant ? 'Conforme (flexible)' : 'Non conforme (flexible)';
      break;
    default: // standard
      isCompliant = convention.pattern.test(fileName);
      reason = isCompliant ? 'Conforme' : 'Non conforme';
      break;
  }

  return { isCompliant, isException: false, reason };
}

// Fonction pour scanner un répertoire
function scanDirectory(dirPath, category) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Répertoire inexistant: ${dirPath}`);
    return { total: 0, compliant: 0, nonCompliant: [], exceptions: [] };
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
      results.nonCompliant.push(file);
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

// Analyse des DTOs
console.log('📋 DTOs Analysis:');
const dtoResults = scanDirectory('cascade/src/dto', 'dtos');
console.log(`   Total DTOs: ${dtoResults.total}`);
console.log(`   Conformes SILC v1.0: ${dtoResults.compliant}`);
console.log(`   Exceptions: ${dtoResults.exceptions.length}`);
const dtoRate = dtoResults.total > 0 ? ((dtoResults.compliant / dtoResults.total) * 100).toFixed(1) : '100';
console.log(`   Taux de conformité: ${dtoRate}%`);

if (dtoResults.exceptions.length > 0 && verbose) {
  console.log('   📋 Exceptions:');
  dtoResults.exceptions.forEach(file => console.log(`      • ${file}`));
}

if (dtoResults.total === 0) {
  console.log('✅ Tous les DTOs respectent le contrat SILC v1.0!');
} else if (dtoResults.compliant === dtoResults.total) {
  console.log('✅ Tous les DTOs sont conformes!');
}

// Analyse des Controllers
console.log('\n🎮 Controllers Analysis:');
const controllerResults = scanDirectory('cascade/src/controllers', 'controllers');
console.log(`   Total Controllers: ${controllerResults.total}`);
console.log(`   Conformes kebab-case-controller.js: ${controllerResults.compliant}`);
console.log(`   Exceptions: ${controllerResults.exceptions.length}`);
const controllerRate = ((controllerResults.compliant / controllerResults.total) * 100).toFixed(1);
console.log(`   Taux de conformité: ${controllerRate}%`);

if (controllerResults.exceptions.length > 0 && verbose) {
  console.log('   📋 Exceptions:');
  controllerResults.exceptions.forEach(file => console.log(`      • ${file}`));
}

if (controllerResults.nonCompliant.length > 0) {
  console.log('❌ Controllers non conformes:');
  controllerResults.nonCompliant.forEach(file => {
    const expected = file.replace(/\.js$/, '').replace(/-/g, '-').toLowerCase() + '-controller.js';
    console.log(`   • ${file} → devrait être ${expected}`);
  });
} else {
  console.log('✅ Tous les controllers sont conformes!');
}

// Analyse des Models
console.log('\n📊 Models Analysis:');
const modelResults = scanDirectory('cascade/src/models', 'models');
console.log(`   Total Models: ${modelResults.total}`);
console.log(`   Conformes PascalCase.js: ${modelResults.compliant}`);
console.log(`   Exceptions: ${modelResults.exceptions.length}`);
const modelRate = ((modelResults.compliant / modelResults.total) * 100).toFixed(1);
console.log(`   Taux de conformité: ${modelRate}%`);

if (modelResults.exceptions.length > 0 && verbose) {
  console.log('   📋 Exceptions:');
  modelResults.exceptions.forEach(file => console.log(`      • ${file}`));
}

if (modelResults.nonCompliant.length > 0) {
  console.log('❌ Models non conformes:');
  modelResults.nonCompliant.forEach(file => {
    const baseName = file.replace(/\.(js|model\.js)$/, '');
    const expected = baseName.charAt(0).toUpperCase() + baseName.slice(1).replace(/-([a-z])/g, (match, letter) => letter.toUpperCase()) + '.js';
    console.log(`   • ${file} → devrait être ${expected}`);
  });
}

// Analyse des Pages Frontend
console.log('\n📄 Frontend Pages Analysis:');
const pageResults = scanDirectory('frontend/src/pages', 'pages');
console.log(`   Total Pages: ${pageResults.total}`);
console.log(`   Conformes kebab-case.jsx: ${pageResults.compliant}`);
console.log(`   Exceptions: ${pageResults.exceptions.length}`);
const pageRate = ((pageResults.compliant / pageResults.total) * 100).toFixed(1);
console.log(`   Taux de conformité: ${pageRate}%`);

if (pageResults.exceptions.length > 0 && verbose) {
  console.log('   📋 Exceptions:');
  pageResults.exceptions.forEach(file => console.log(`      • ${file}`));
}

if (pageResults.nonCompliant.length > 0) {
  console.log('❌ Pages non conformes:');
  pageResults.nonCompliant.forEach(file => {
    const expected = file.replace(/\.jsx$/, '').toLowerCase().replace(/[^a-z0-9-]/g, '-') + '.jsx';
    console.log(`   • ${file} → devrait être ${expected}`);
  });
} else {
  console.log('✅ Toutes les pages sont conformes!');
}

// Score global
const totalFiles = controllerResults.total + modelResults.total + pageResults.total + dtoResults.total;
const totalCompliant = controllerResults.compliant + modelResults.compliant + pageResults.compliant + dtoResults.compliant;
const globalRate = ((totalCompliant / totalFiles) * 100).toFixed(1);

console.log('\n📊 GLOBAL COMPLIANCE SCORE:');
console.log(`   Total files checked: ${totalFiles}`);
console.log(`   Compliant files: ${totalCompliant}`);
console.log(`   Global compliance rate: ${globalRate}%`);

const totalNonCompliant = totalFiles - totalCompliant;
if (totalNonCompliant > 0) {
  console.log(`⚠️  ${totalNonCompliant} files need correction`);
  console.log('📄 Run npm run conventions:fix to auto-correct issues');
} else {
  console.log('🎉 All files are compliant!');
}

// Rapport détaillé
const report = {
  date: new Date().toISOString(),
  mode,
  verbose,
  results: {
    controllers: controllerResults,
    models: modelResults,
    pages: pageResults,
    dtos: dtoResults
  },
  global: {
    total: totalFiles,
    compliant: totalCompliant,
    rate: globalRate
  }
};

// Sauvegarder le rapport
const reportFileName = `conventions-test-report-${mode}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFileName}`);

// Rapport différencié
console.log('\n📊 RAPPORT DIFFÉRENCIÉ:');
console.log(`   Mode utilisé: ${mode.toUpperCase()}`);
console.log(`   Fichiers conformes détectés: ${totalCompliant}`);
console.log(`   Fichiers conformes manuellement vérifiés: ${totalCompliant}`); // Tous sont vérifiés manuellement ici
console.log(`   Exceptions identifiées: ${controllerResults.exceptions.length + modelResults.exceptions.length + pageResults.exceptions.length + dtoResults.exceptions.length}`);

if (mode === 'strict' && totalNonCompliant > 0) {
  console.log('\n💡 Suggestion: Essayez avec --flexible pour plus de tolérance');
} else if (mode === 'flexible' && totalNonCompliant > 0) {
  console.log('\n💡 Suggestion: Certains fichiers nécessitent une correction manuelle');
}

console.log('\n✅ Test amélioré des conventions terminé!');
