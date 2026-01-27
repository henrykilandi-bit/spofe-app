const fs = require('fs');
const path = require('path');

console.log('🔍 SCAN COMPLET DE TOUTES LES CONVENTIONS DE NOMMAGE');
console.log('===================================================\n');

// Fonction pour scanner récursivement tous les fichiers
function scanAllFiles(rootDir, extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md']) {
  const allFiles = [];
  
  function scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        // Ignorer certains répertoires
        if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item.name)) {
          scanDirectory(fullPath);
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (extensions.includes(ext)) {
          allFiles.push({
            path: fullPath,
            relativePath: path.relative(rootDir, fullPath),
            name: item.name,
            extension: ext,
            directory: path.dirname(path.relative(rootDir, fullPath))
          });
        }
      }
    });
  }
  
  scanDirectory(rootDir);
  return allFiles;
}

// Fonction pour analyser les patterns de nommage
function analyzeNamingPatterns(files) {
  const patterns = {
    // Patterns backend
    controllers: {
      pattern: /^[a-z]+(?:-[a-z]+)*-controller\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe -controller'
    },
    models: {
      pattern: /^[A-Z][a-zA-Z0-9]*\.(js|ts)$/,
      matches: [],
      description: 'PascalCase'
    },
    routes: {
      pattern: /^[a-z]+(?:-[a-z]+)*-routes\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe -routes'
    },
    middleware: {
      pattern: /^[a-z]+(?:-[a-z]+)*-middleware\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe -middleware'
    },
    services: {
      pattern: /^[a-z]+(?:-[a-z]+)*-service\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe -service'
    },
    utils: {
      pattern: /^[a-z]+(?:-[a-z]+)*-util\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe -util'
    },
    config: {
      pattern: /^[a-z]+(?:-[a-z]+)*\.config\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe .config'
    },
    dto: {
      pattern: /^[A-Z][a-zA-Z0-9]*Dto\.(js|ts)$/,
      matches: [],
      description: 'PascalCase avec suffixe Dto'
    },
    dto_snake: {
      pattern: /^[a-z]+(?:_[a-z]+)*\.dto\.(js|ts)$/,
      matches: [],
      description: 'snake_case avec suffixe .dto'
    },
    
    // Patterns frontend
    components: {
      pattern: /^[A-Z][a-zA-Z0-9]*\.(jsx|tsx)$/,
      matches: [],
      description: 'PascalCase pour composants React'
    },
    pages: {
      pattern: /^[a-z]+(?:-[a-z]+)*\.(jsx|tsx)$/,
      matches: [],
      description: 'kebab-case pour pages'
    },
    pages_pascal: {
      pattern: /^[A-Z][a-zA-Z0-9]*\.(jsx|tsx)$/,
      matches: [],
      description: 'PascalCase pour pages'
    },
    hooks: {
      pattern: /^use[A-Z][a-zA-Z0-9]*\.(js|ts)$/,
      matches: [],
      description: 'camelCase avec préfixe use'
    },
    utils_frontend: {
      pattern: /^[a-z]+(?:-[a-z]+)*\.(js|ts)$/,
      matches: [],
      description: 'kebab-case pour utils'
    },
    services_frontend: {
      pattern: /^[a-z]+(?:-[a-z]+)*-service\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe -service'
    },
    types: {
      pattern: /^[a-z]+(?:-[a-z]+)*-types\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe -types'
    },
    constants: {
      pattern: /^[a-z]+(?:-[a-z]+)*-constants\.(js|ts)$/,
      matches: [],
      description: 'kebab-case avec suffixe -constants'
    },
    
    // Patterns généraux
    kebab_case: {
      pattern: /^[a-z]+(?:-[a-z]+)*$/,
      matches: [],
      description: 'kebab-case'
    },
    snake_case: {
      pattern: /^[a-z]+(?:_[a-z]+)*$/,
      matches: [],
      description: 'snake_case'
    },
    pascal_case: {
      pattern: /^[A-Z][a-zA-Z0-9]*$/,
      matches: [],
      description: 'PascalCase'
    },
    camel_case: {
      pattern: /^[a-z][a-zA-Z0-9]*$/,
      matches: [],
      description: 'camelCase'
    },
    upper_case: {
      pattern: /^[A-Z][A-Z0-9_]*$/,
      matches: [],
      description: 'UPPER_CASE'
    },
    
    // Patterns spécifiques au projet
    backup_files: {
      pattern: /\.(backup|bak|old|tmp)$/,
      matches: [],
      description: 'Fichiers de backup'
    },
    test_files: {
      pattern: /\.(test|spec)\.(js|ts|jsx|tsx)$/,
      matches: [],
      description: 'Fichiers de test'
    },
    config_files: {
      pattern: /\.(config|env|json)$/,
      matches: [],
      description: 'Fichiers de configuration'
    },
    documentation: {
      pattern: /\.(md|txt|rst)$/,
      matches: [],
      description: 'Fichiers de documentation'
    }
  };
  
  // Analyser chaque fichier
  files.forEach(file => {
    const nameWithoutExt = path.basename(file.name, path.extname(file.name));
    
    Object.keys(patterns).forEach(patternKey => {
      const pattern = patterns[patternKey];
      if (pattern.pattern.test(file.name) || pattern.pattern.test(nameWithoutExt)) {
        pattern.matches.push({
          file: file.name,
          path: file.relativePath,
          directory: file.directory
        });
      }
    });
  });
  
  return patterns;
}

// Fonction pour détecter les conventions par répertoire
function analyzeDirectoryConventions(files) {
  const directoryStats = {};
  
  files.forEach(file => {
    const dir = file.directory;
    if (!directoryStats[dir]) {
      directoryStats[dir] = {
        files: [],
        patterns: {},
        totalFiles: 0
      };
    }
    
    directoryStats[dir].files.push(file);
    directoryStats[dir].totalFiles++;
    
    // Analyser les patterns dans ce répertoire
    const nameWithoutExt = path.basename(file.name, path.extname(file.name));
    
    // Détecter le pattern dominant
    if (file.name.match(/^[a-z]+(?:-[a-z]+)*\.[^.]+$/)) {
      directoryStats[dir].patterns.kebab_case = (directoryStats[dir].patterns.kebab_case || 0) + 1;
    }
    if (file.name.match(/^[a-z]+(?:_[a-z]+)*\.[^.]+$/)) {
      directoryStats[dir].patterns.snake_case = (directoryStats[dir].patterns.snake_case || 0) + 1;
    }
    if (file.name.match(/^[A-Z][a-zA-Z0-9]*\.[^.]+$/)) {
      directoryStats[dir].patterns.pascal_case = (directoryStats[dir].patterns.pascal_case || 0) + 1;
    }
    if (file.name.match(/^[a-z][a-zA-Z0-9]*\.[^.]+$/)) {
      directoryStats[dir].patterns.camel_case = (directoryStats[dir].patterns.camel_case || 0) + 1;
    }
  });
  
  return directoryStats;
}

// Scanner tous les fichiers
console.log('📁 Scan de tous les fichiers...');
const allFiles = scanAllFiles('C:\\Users\\henry\\Desktop\\SPOFE-APP VERS 1.0');
console.log(`Trouvé ${allFiles.length} fichiers à analyser\n`);

// Analyser les patterns
console.log('🔍 Analyse des patterns de nommage...');
const patterns = analyzeNamingPatterns(allFiles);

// Analyser les conventions par répertoire
console.log('📊 Analyse par répertoire...');
const directoryStats = analyzeDirectoryConventions(allFiles);

// Afficher les résultats
console.log('\n📋 RÉSULTATS DES PATTERNS DÉTECTÉS');
console.log('==================================');

// Patterns avec le plus de matches
const sortedPatterns = Object.entries(patterns)
  .filter(([key, pattern]) => pattern.matches.length > 0)
  .sort((a, b) => b[1].matches.length - a[1].matches.length);

console.log('\n🎯 PATTERNS LES PLUS COURANTS:');
sortedPatterns.slice(0, 15).forEach(([key, pattern], index) => {
  console.log(`${index + 1}. ${pattern.description}: ${pattern.matches.length} fichiers`);
  if (pattern.matches.length <= 5) {
    pattern.matches.forEach(match => {
      console.log(`   • ${match.path}`);
    });
  } else {
    console.log(`   • ${pattern.matches[0].path}`);
    console.log(`   • ... ${pattern.matches.length - 1} autres fichiers`);
  }
});

console.log('\n📁 CONVENTIONS PAR RÉPERTOIRE:');
const sortedDirectories = Object.entries(directoryStats)
  .filter(([dir, stats]) => stats.totalFiles > 2)
  .sort((a, b) => b[1].totalFiles - a[1].totalFiles);

sortedDirectories.slice(0, 20).forEach(([dir, stats]) => {
  console.log(`\n📂 ${dir} (${stats.totalFiles} fichiers):`);
  
  // Pattern dominant
  const dominantPattern = Object.entries(stats.patterns)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (dominantPattern) {
    const percentage = ((dominantPattern[1] / stats.totalFiles) * 100).toFixed(1);
    console.log(`   Pattern dominant: ${dominantPattern[0]} (${dominantPattern[1]} fichiers, ${percentage}%)`);
  }
  
  // Types de fichiers
  const fileTypes = {};
  stats.files.forEach(file => {
    fileTypes[file.extension] = (fileTypes[file.extension] || 0) + 1;
  });
  
  Object.entries(fileTypes).forEach(([ext, count]) => {
    console.log(`   ${ext}: ${count} fichiers`);
  });
});

console.log('\n🔍 PATTERNS SPÉCIFIQUES AU PROJET:');

// DTOs
const dtoPatterns = patterns.dto.matches.length + patterns.dto_snake.matches.length;
if (dtoPatterns > 0) {
  console.log(`\n📋 DTOs (${dtoPatterns} fichiers):`);
  if (patterns.dto.matches.length > 0) {
    console.log(`   PascalCaseDto: ${patterns.dto.matches.length} fichiers`);
  }
  if (patterns.dto_snake.matches.length > 0) {
    console.log(`   snake_case.dto: ${patterns.dto_snake.matches.length} fichiers`);
  }
}

// Controllers
if (patterns.controllers.matches.length > 0) {
  console.log(`\n🎮 Controllers (${patterns.controllers.matches.length} fichiers):`);
  patterns.controllers.matches.slice(0, 5).forEach(match => {
    console.log(`   • ${match.path}`);
  });
}

// Services
const servicesCount = patterns.services.matches.length + patterns.services_frontend.matches.length;
if (servicesCount > 0) {
  console.log(`\n⚙️ Services (${servicesCount} fichiers):`);
  if (patterns.services.matches.length > 0) {
    console.log(`   Backend: ${patterns.services.matches.length} fichiers`);
  }
  if (patterns.services_frontend.matches.length > 0) {
    console.log(`   Frontend: ${patterns.services_frontend.matches.length} fichiers`);
  }
}

// Fichiers de backup
if (patterns.backup_files.matches.length > 0) {
  console.log(`\n💾 Fichiers de backup (${patterns.backup_files.matches.length} fichiers):`);
  patterns.backup_files.matches.slice(0, 5).forEach(match => {
    console.log(`   • ${match.path}`);
  });
}

// Générer le rapport complet
const report = {
  date: new Date().toISOString(),
  summary: {
    totalFiles: allFiles.length,
    totalPatterns: Object.keys(patterns).length,
    directoriesAnalyzed: Object.keys(directoryStats).length
  },
  patterns: patterns,
  directoryStats: directoryStats,
  topPatterns: sortedPatterns.map(([key, pattern]) => ({
    key,
    description: pattern.description,
    count: pattern.matches.length
  }))
};

fs.writeFileSync('all-naming-conventions-report.json', JSON.stringify(report, null, 2));
console.log('\n\n💾 Rapport détaillé sauvegardé dans: all-naming-conventions-report.json');

console.log('\n✅ Scan terminé!');
