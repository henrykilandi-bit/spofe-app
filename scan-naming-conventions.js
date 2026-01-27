const fs = require('fs');
const path = require('path');

console.log('🔍 SCAN DES CONVENTIONS DE NOMMAGE V2.2');
console.log('=====================================\n');

// Configuration des conventions v2.2
const conventions = {
  backend: {
    controllers: {
      pattern: /^[a-z]+(?:-[a-z]+)*-controller\.js$/,
      description: 'kebab-case avec suffixe -controller.js'
    },
    models: {
      pattern: /^[A-Z][a-zA-Z0-9]*\.js$/,
      description: 'PascalCase'
    },
    routes: {
      pattern: /^[a-z]+(?:-[a-z]+)*-routes\.js$/,
      description: 'kebab-case avec suffixe -routes.js'
    },
    middleware: {
      pattern: /^[a-z]+(?:-[a-z]+)*-middleware\.js$/,
      description: 'kebab-case avec suffixe -middleware.js'
    },
    services: {
      pattern: /^[a-z]+(?:-[a-z]+)*-service\.js$/,
      description: 'kebab-case avec suffixe -service.js'
    },
    utils: {
      pattern: /^[a-z]+(?:-[a-z]+)*-util\.js$/,
      description: 'kebab-case avec suffixe -util.js'
    },
    config: {
      pattern: /^[a-z]+(?:-[a-z]+)*\.config\.js$/,
      description: 'kebab-case avec suffixe .config.js'
    },
    dto: {
      pattern: /^[A-Z][a-zA-Z0-9]*Dto\.js$/,
      description: 'PascalCase avec suffixe Dto.js'
    }
  },
  frontend: {
    components: {
      pattern: /^[A-Z][a-zA-Z0-9]*\.(jsx|tsx)$/,
      description: 'PascalCase pour les composants React'
    },
    pages: {
      pattern: /^[a-z]+(?:-[a-z]+)*\.(jsx|tsx)$/,
      description: 'kebab-case pour les pages'
    },
    hooks: {
      pattern: /^use[A-Z][a-zA-Z0-9]*\.(js|ts)$/,
      description: 'camelCase avec préfixe use'
    },
    utils: {
      pattern: /^[a-z]+(?:-[a-z]+)*\.(js|ts)$/,
      description: 'kebab-case'
    },
    services: {
      pattern: /^[a-z]+(?:-[a-z]+)*-service\.(js|ts)$/,
      description: 'kebab-case avec suffixe -service'
    },
    types: {
      pattern: /^[a-z]+(?:-[a-z]+)*-types\.(js|ts)$/,
      description: 'kebab-case avec suffixe -types'
    },
    constants: {
      pattern: /^[a-z]+(?:-[a-z]+)*-constants\.(js|ts)$/,
      description: 'kebab-case avec suffixe -constants'
    }
  }
};

// Fonction pour scanner un répertoire
function scanDirectory(dirPath, type, category) {
  const results = {
    valid: [],
    invalid: [],
    total: 0
  };

  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Répertoire inexistant: ${dirPath}`);
    return results;
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  files.forEach(file => {
    if (file.isFile()) {
      const fileName = file.name;
      const convention = conventions[type][category];
      results.total++;
      
      if (convention.pattern.test(fileName)) {
        results.valid.push(fileName);
      } else {
        results.invalid.push({
          file: fileName,
          expected: convention.description,
          pattern: convention.pattern.toString()
        });
      }
    }
  });

  return results;
}

// Fonction pour scanner récursivement
function scanRecursive(rootDir, type) {
  const allResults = {};
  
  Object.keys(conventions[type]).forEach(category => {
    const categoryPath = path.join(rootDir, category);
    allResults[category] = scanDirectory(categoryPath, type, category);
  });

  return allResults;
}

// Scan du backend
console.log('📂 SCAN DU BACKEND');
console.log('==================');
const backendResults = scanRecursive('cascade/src', 'backend');

Object.keys(backendResults).forEach(category => {
  const result = backendResults[category];
  const compliance = result.total > 0 ? (result.valid.length / result.total * 100).toFixed(1) : 0;
  
  console.log(`\n📁 ${category.toUpperCase()}:`);
  console.log(`   Total: ${result.total} fichiers`);
  console.log(`   ✅ Validés: ${result.valid.length} (${compliance}%)`);
  
  if (result.invalid.length > 0) {
    console.log(`   ❌ Non conformes: ${result.invalid.length}`);
    result.invalid.forEach(invalid => {
      console.log(`      • ${invalid.file} (attendu: ${invalid.expected})`);
    });
  } else {
    console.log(`   🎉 Tous les fichiers respectent la convention!`);
  }
});

// Scan du frontend
console.log('\n\n📂 SCAN DU FRONTEND');
console.log('===================');
const frontendResults = scanRecursive('frontend/src', 'frontend');

Object.keys(frontendResults).forEach(category => {
  const result = frontendResults[category];
  const compliance = result.total > 0 ? (result.valid.length / result.total * 100).toFixed(1) : 0;
  
  console.log(`\n📁 ${category.toUpperCase()}:`);
  console.log(`   Total: ${result.total} fichiers`);
  console.log(`   ✅ Validés: ${result.valid.length} (${compliance}%)`);
  
  if (result.invalid.length > 0) {
    console.log(`   ❌ Non conformes: ${result.invalid.length}`);
    result.invalid.forEach(invalid => {
      console.log(`      • ${invalid.file} (attendu: ${invalid.expected})`);
    });
  } else {
    console.log(`   🎉 Tous les fichiers respectent la convention!`);
  }
});

// Calcul des statistiques globales
function calculateGlobalStats(results) {
  let totalFiles = 0;
  let totalValid = 0;
  
  Object.values(results).forEach(category => {
    totalFiles += category.total;
    totalValid += category.valid.length;
  });
  
  return {
    total: totalFiles,
    valid: totalValid,
    compliance: totalFiles > 0 ? (totalValid / totalFiles * 100).toFixed(1) : 0
  };
}

const backendStats = calculateGlobalStats(backendResults);
const frontendStats = calculateGlobalStats(frontendResults);

console.log('\n\n📊 STATISTIQUES GLOBALES');
console.log('=======================');
console.log(`Backend: ${backendStats.valid}/${backendStats.total} fichiers conformes (${backendStats.compliance}%)`);
console.log(`Frontend: ${frontendStats.valid}/${frontendStats.total} fichiers conformes (${frontendStats.compliance}%)`);

const overallStats = {
  total: backendStats.total + frontendStats.total,
  valid: backendStats.valid + frontendStats.valid
};
overallStats.compliance = (overallStats.valid / overallStats.total * 100).toFixed(1);

console.log(`Global: ${overallStats.valid}/${overallStats.total} fichiers conformes (${overallStats.compliance}%)`);

// Génération du rapport détaillé
const report = {
  date: new Date().toISOString(),
  conventions: conventions,
  results: {
    backend: backendResults,
    frontend: frontendResults
  },
  statistics: {
    backend: backendStats,
    frontend: frontendStats,
    overall: overallStats
  }
};

fs.writeFileSync('naming-conventions-report.json', JSON.stringify(report, null, 2));
console.log('\n\n💾 Rapport détaillé sauvegardé dans: naming-conventions-report.json');

// Recommandations
console.log('\n\n🎯 RECOMMANDATIONS');
console.log('=================');

if (overallStats.compliance < 100) {
  console.log('❌ Des fichiers ne respectent pas les conventions v2.2:');
  
  // Afficher les fichiers à corriger
  ['backend', 'frontend'].forEach(type => {
    const results = type === 'backend' ? backendResults : frontendResults;
    Object.keys(results).forEach(category => {
      if (results[category].invalid.length > 0) {
        console.log(`\n${type.toUpperCase()} - ${category}:`);
        results[category].invalid.forEach(invalid => {
          const newName = generateSuggestedName(invalid.file, conventions[type][category].pattern);
          console.log(`   • Renommer "${invalid.file}" → "${newName}"`);
        });
      }
    });
  });
} else {
  console.log('🎉 Tous les fichiers respectent parfaitement les conventions v2.2!');
}

// Fonction pour suggérer un nouveau nom
function generateSuggestedName(currentName, pattern) {
  // Logique simple de suggestion basée sur le pattern
  if (currentName.includes('Controller')) {
    return currentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '-controller.js';
  } else if (currentName.includes('Service')) {
    return currentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '-service.js';
  } else if (currentName.includes('Middleware')) {
    return currentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '-middleware.js';
  } else if (currentName.includes('Routes')) {
    return currentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '-routes.js';
  }
  return currentName;
}

console.log('\n✅ Scan terminé!');
