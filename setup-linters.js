const fs = require('fs');
const path = require('path');

console.log('🔧 CONFIGURATION DES LINTERS SPOFE v2.2');
console.log('======================================\n');

// Configuration
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

console.log(`📋 Mode: ${dryRun ? 'DRY RUN' : 'INSTALLATION'}`);
console.log(`📝 Verbose: ${verbose ? 'OUI' : 'NON'}\n`);

// Conventions SPOFE v2.2 pour ESLint
const eslintConfig = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "import"
  ],
  "rules": {
    // Conventions de nommage SPOFE v2.2
    "camelcase": ["error", { "properties": "always" }],
    "new-cap": ["error", { "newIsCap": true, "capIsNew": false }],
    "no-underscore-dangle": "error",
    
    // Règles spécifiques aux controllers
    "spofe/controller-naming": ["error", {
      "pattern": "^[a-z0-9-]+-controller\\.js$",
      "message": "Les controllers doivent suivre le format kebab-case-controller.js"
    }],
    
    // Règles spécifiques aux models
    "spofe/model-naming": ["error", {
      "pattern": "^[A-Z][a-zA-Z0-9]*\\.js$",
      "message": "Les models doivent suivre le format PascalCase.js"
    }],
    
    // Règles spécifiques aux DTOs
    "spofe/dto-naming": ["error", {
      "pattern": "^[A-Z][a-zA-Z0-9]*Dto\\.js$",
      "message": "Les DTOs doivent suivre le format PascalCaseDto.js"
    }],
    
    // Règles spécifiques aux pages
    "spofe/page-naming": ["error", {
      "pattern": "^[a-z0-9-]+\\.jsx$",
      "message": "Les pages doivent suivre le format kebab-case.jsx"
    }],
    
    // Imports
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }],
    "import/no-unresolved": "error",
    "import/no-duplicates": "error",
    
    // Qualité du code
    "no-console": "warn",
    "no-debugger": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  "overrides": [
    {
      "files": ["*.test.js", "*.spec.js", "*.test.jsx", "*.spec.jsx"],
      "rules": {
        "no-console": "off"
      }
    },
    {
      "files": ["*controller.js"],
      "rules": {
        "spofe/controller-naming": "error"
      }
    },
    {
      "files": ["cascade/src/models/*.js"],
      "rules": {
        "spofe/model-naming": "error"
      }
    },
    {
      "files": ["cascade/src/dto/*.js"],
      "rules": {
        "spofe/dto-naming": "error"
      }
    },
    {
      "files": ["frontend/src/pages/*.jsx"],
      "rules": {
        "spofe/page-naming": "error"
      }
    }
  ]
};

// Configuration Prettier
const prettierConfig = {
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
};

// Package.json updates
const packageJsonPath = 'package.json';
let packageJson = {};

if (fs.existsSync(packageJsonPath)) {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

// Dépendances de développement
const devDependencies = {
  "eslint": "^8.57.0",
  "@typescript-eslint/eslint-plugin": "^6.21.0",
  "@typescript-eslint/parser": "^6.21.0",
  "eslint-plugin-import": "^2.29.1",
  "prettier": "^3.2.5",
  "eslint-config-prettier": "^9.1.0",
  "eslint-plugin-prettier": "^5.1.3"
};

// Scripts pour les conventions
const scripts = {
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
  "lint:controllers": "eslint cascade/src/controllers --ext .js",
  "lint:models": "eslint cascade/src/models --ext .js",
  "lint:dtos": "eslint cascade/src/dto --ext .js",
  "lint:pages": "eslint frontend/src/pages --ext .jsx",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "conventions:check": "node test-conventions-enhanced.js",
  "conventions:fix": "node fix-conventions-automated.js",
  "conventions:models": "node fix-models-pascalcase.js",
  "precommit": "node convention-checker.js"
};

// Plugin ESLint personnalisé pour SPOFE
const eslintPluginSpofe = `
// ESLint Plugin personnalisé pour SPOFE v2.2
module.exports = {
  rules: {
    'controller-naming': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce SPOFE controller naming convention',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              pattern: {
                type: 'string'
              },
              message: {
                type: 'string'
              }
            }
          }
        ]
      },
      create(context) {
        const options = context.options[0] || {};
        const pattern = options.pattern || '^[a-z0-9-]+-controller\\.js$';
        const message = options.message || 'Controller name does not match SPOFE convention';
        const regex = new RegExp(pattern);
        
        return {
          Program(node) {
            const filename = context.getFilename();
            if (regex.test(filename.split('/').pop())) {
              return;
            }
            if (filename.includes('controller') && filename.endsWith('.js')) {
              context.report({
                node,
                message
              });
            }
          }
        };
      }
    },
    
    'model-naming': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce SPOFE model naming convention',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              pattern: {
                type: 'string'
              },
              message: {
                type: 'string'
              }
            }
          }
        ]
      },
      create(context) {
        const options = context.options[0] || {};
        const pattern = options.pattern || '^[A-Z][a-zA-Z0-9]*\\.js$';
        const message = options.message || 'Model name does not match SPOFE convention';
        const regex = new RegExp(pattern);
        
        return {
          Program(node) {
            const filename = context.getFilename();
            if (regex.test(filename.split('/').pop())) {
              return;
            }
            if (filename.includes('models') && filename.endsWith('.js')) {
              context.report({
                node,
                message
              });
            }
          }
        };
      }
    },
    
    'dto-naming': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce SPOFE DTO naming convention',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              pattern: {
                type: 'string'
              },
              message: {
                type: 'string'
              }
            }
          }
        ]
      },
      create(context) {
        const options = context.options[0] || {};
        const pattern = options.pattern || '^[A-Z][a-zA-Z0-9]*Dto\\.js$';
        const message = options.message || 'DTO name does not match SPOFE convention';
        const regex = new RegExp(pattern);
        
        return {
          Program(node) {
            const filename = context.getFilename();
            if (regex.test(filename.split('/').pop())) {
              return;
            }
            if (filename.includes('dto') && filename.endsWith('.js')) {
              context.report({
                node,
                message
              });
            }
          }
        };
      }
    },
    
    'page-naming': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce SPOFE page naming convention',
          category: 'Best Practices',
          recommended: true
        },
        fixable: null,
        schema: [
          {
            type: 'object',
            properties: {
              pattern: {
                type: 'string'
              },
              message: {
                type: 'string'
              }
            }
          }
        ]
      },
      create(context) {
        const options = context.options[0] || {};
        const pattern = options.pattern || '^[a-z0-9-]+\\.jsx$';
        const message = options.message || 'Page name does not match SPOFE convention';
        const regex = new RegExp(pattern);
        
        return {
          Program(node) {
            const filename = context.getFilename();
            if (regex.test(filename.split('/').pop())) {
              return;
            }
            if (filename.includes('pages') && filename.endsWith('.jsx')) {
              context.report({
                node,
                message
              });
            }
          }
        };
      }
    }
  }
};
`;

// Fichiers à créer
const filesToCreate = [
  {
    path: '.eslintrc.json',
    content: JSON.stringify(eslintConfig, null, 2)
  },
  {
    path: '.prettierrc',
    content: JSON.stringify(prettierConfig, null, 2)
  },
  {
    path: '.eslintignore',
    content: `node_modules/
dist/
build/
coverage/
*.min.js
*.bundle.js
BACKUP_*/
`
  },
  {
    path: '.prettierignore',
    content: `node_modules/
dist/
build/
coverage/
*.min.js
*.bundle.js
BACKUP_*/
package-lock.json
`
  },
  {
    path: 'eslint-plugin-spofe.js',
    content: eslintPluginSpofe
  }
];

// Installation des dépendances
console.log('📦 Mise à jour des dépendances...');
if (!dryRun) {
  // Ajouter les dépendances de développement
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  
  Object.assign(packageJson.devDependencies, devDependencies);
  
  // Ajouter les scripts
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  Object.assign(packageJson.scripts, scripts);
  
  // Écrire le package.json mis à jour
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json mis à jour');
} else {
  console.log('🔍 DRY RUN: package.json serait mis à jour');
}

// Création des fichiers de configuration
console.log('\n📝 Création des fichiers de configuration...');
filesToCreate.forEach(file => {
  if (!dryRun) {
    fs.writeFileSync(file.path, file.content);
    console.log(`✅ ${file.path} créé`);
  } else {
    console.log(`🔍 DRY RUN: ${file.path} serait créé`);
  }
});

// Configuration Git hooks
console.log('\n🔧 Configuration des Git hooks...');
const preCommitHook = `#!/bin/sh
# Pre-commit hook pour SPOFE v2.2
echo "🔍 Vérification des conventions SPOFE v2.2..."

# Vérifier les conventions de nommage
node convention-checker.js
if [ $? -ne 0 ]; then
  echo "❌ Erreur: Les conventions de nommage ne sont pas respectées"
  echo "💡 Exécutez 'npm run conventions:fix' pour corriger automatiquement"
  exit 1
fi

# Linter les fichiers modifiés
echo "🔍 Linting des fichiers modifiés..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Erreur: Le linting a échoué"
  echo "💡 Exécutez 'npm run lint:fix' pour corriger automatiquement"
  exit 1
fi

echo "✅ Toutes les vérifications ont réussi"
`;

if (!dryRun) {
  const hooksDir = '.git/hooks';
  if (fs.existsSync(hooksDir)) {
    fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitHook);
    fs.chmodSync(path.join(hooksDir, 'pre-commit'), '755');
    console.log('✅ Pre-commit hook configuré');
  } else {
    console.log('⚠️  Répertoire .git/hooks non trouvé - hook non configuré');
  }
} else {
  console.log('🔍 DRY RUN: Pre-commit hook serait configuré');
}

// Rapport d'installation
console.log('\n📊 RAPPORT D\'INSTALLATION:');
console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'INSTALLATION'}`);
console.log(`   Fichiers créés: ${filesToCreate.length}`);
console.log(`   Dépendances ajoutées: ${Object.keys(devDependencies).length}`);
console.log(`   Scripts ajoutés: ${Object.keys(scripts).length}`);

if (!dryRun) {
  console.log('\n🎉 CONFIGURATION DES LINTERS TERMINÉE!');
  console.log('\n💡 PROCHAINES ÉTAPES:');
  console.log('   1. npm install (pour installer les dépendances)');
  console.log('   2. npm run lint (pour vérifier le code)');
  console.log('   3. npm run format (pour formater le code)');
  console.log('   4. npm run conventions:check (pour vérifier les conventions)');
  console.log('   5. git commit (les hooks seront automatiquement exécutés)');
} else {
  console.log('\n🔍 DRY RUN TERMINÉ - Utilisez la commande sans --dry-run pour appliquer les changements');
}

// Création d'un rapport
const report = {
  date: new Date().toISOString(),
  mode: dryRun ? 'dry-run' : 'installation',
  filesCreated: filesToCreate.map(f => f.path),
  dependenciesAdded: Object.keys(devDependencies),
  scriptsAdded: Object.keys(scripts),
  packageJsonUpdated: true
};

const reportFileName = `linters-setup-report-${dryRun ? 'dry-run' : 'installation'}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2));
console.log(`\n💾 Rapport détaillé sauvegardé: ${reportFileName}`);
