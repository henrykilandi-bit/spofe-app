# Architecture - SPOFE Auto-Fix System

## 📐 Vue d'Ensemble de l'Architecture

```
SPOFE Auto-Fix
├── auto-fix.js (Entry Point)
│   ├── Config Management
│   ├── CLI Parser
│   └── Orchestration
│
├── modules/ (Core Modules)
│   ├── package-fixer.js
│   │   ├── fixRootPackageJson()
│   │   ├── fixBackendPackageJson()
│   │   ├── fixFrontendPackageJson()
│   │   └── installDependencies()
│   │
│   ├── database-validator.js
│   │   ├── validateTables()
│   │   ├── validateForeignKeys()
│   │   ├── validateColumns()
│   │   └── calculateConformity()
│   │
│   ├── test-fixer.js
│   │   ├── fixVitest()
│   │   ├── fixJestImports()
│   │   ├── fixEmptyTestFiles()
│   │   ├── fixSequelizeMocks()
│   │   └── executeTests()
│   │
│   └── report-generator.js
│       ├── generateConformityReport()
│       ├── generatePackageReport()
│       ├── generateTestReport()
│       └── generateActionReport()
│
├── utils/ (Utilities)
│   └── logger.js
│       ├── banner()
│       ├── section()
│       ├── info/success/warn/error()
│       └── progress()
│
├── config/
│   ├── .env (Configuration)
│   └── .env.example
│
├── package.json (Dependencies)
├── README.md (Documentation)
├── quick-start.js (Quick Start)
└── index.js (Module Exports)
```

## 🔄 Flux d'Exécution

### Exécution Complète

```
auto-fix.js
  │
  ├─► validateEnvironment()
  │    └─► Vérifier répertoires & fichiers
  │
  ├─► fixPackageJson()
  │    ├─► PackageJsonFixer
  │    │   ├─► fixRootPackageJson()
  │    │   ├─► fixBackendPackageJson()
  │    │   ├─► fixFrontendPackageJson()
  │    │   └─► installDependencies()
  │    └─► Logger.success()
  │
  ├─► validateDatabase()
  │    ├─► DatabaseValidator
  │    │   ├─► connect()
  │    │   ├─► validateTables()
  │    │   ├─► validateForeignKeys()
  │    │   ├─► validateColumns()
  │    │   └─► disconnect()
  │    └─► Logger.success()
  │
  ├─► fixTests()
  │    ├─► TestFixer
  │    │   ├─► fixVitest()
  │    │   ├─► fixJestImports()
  │    │   ├─► fixEmptyTestFiles()
  │    │   ├─► fixSequelizeMocks()
  │    │   └─► executeTests()
  │    └─► Logger.success()
  │
  ├─► generateReports()
  │    ├─► ReportGenerator
  │    │   ├─► generateConformityReport()
  │    │   ├─► generatePackageReport()
  │    │   ├─► generateTestReport()
  │    │   └─► generateActionReport()
  │    └─► Logger.success()
  │
  └─► displaySummary()
       └─► Console output
```

## 📦 Modules Détaillés

### 1. PackageJsonFixer

**Responsabilité:** Nettoyer et corriger les fichiers package.json

**Méthodes:**
- `fixRootPackageJson()` - Supprimer clés dupliquées
- `fixBackendPackageJson()` - Harmoniser versions backend
- `fixFrontendPackageJson()` - Mettre à jour versions frontend
- `installDependencies()` - Exécuter npm install

**Fichiers affectés:**
- `package.json` (root)
- `cascade/package.json`
- `frontend/package.json`

**Problèmes résolus:**
- ✅ Clé `engines` dupliquée
- ✅ Dépendances dupliquées (bcrypt vs bcryptjs)
- ✅ Versions vitest inconsistantes
- ✅ Mises à jour axios/react

### 2. DatabaseValidator

**Responsabilité:** Valider la conformité de la BD

**Méthodes:**
- `connect()` - Établir connexion MySQL
- `validateTables()` - Vérifier tables critiques
- `validateForeignKeys()` - Vérifier FK existantes
- `validateColumns()` - Vérifier colonnes requises
- `calculateConformity()` - Calcul pourcentage

**Détections:**
- 🔍 Tables manquantes
- 🔍 FK mal formées
- 🔍 Colonnes incorrectes
- 🔍 Types de données

**Output:**
- Conformité % (cible: 99%)
- Liste problèmes détectés
- Recommendations

### 3. TestFixer

**Responsabilité:** Corriger les tests échoués

**Méthodes:**
- `fixVitest()` - Ajouter mocks Vitest
- `fixJestImports()` - Convertir Jest → Vitest
- `fixEmptyTestFiles()` - Corriger fichiers vides
- `fixSequelizeMocks()` - Ajouter mocks Sequelize
- `executeTests()` - Lancer les tests

**Corrections appliquées:**
- ✅ window.matchMedia mock (frontend)
- ✅ localStorage mock (frontend)
- ✅ Imports @jest/globals remplacés
- ✅ Fichiers tests vides corrigés
- ✅ vitest.setup.js créé

**Tests affectés:**
- Frontend: 5 → 0 échoués
- Backend: 31 → ~10 échoués (reste manuel)

### 4. ReportGenerator

**Responsabilité:** Générer rapports détaillés

**Rapports produits:**
1. **RAPPORT_CONFORMITE_AUTO_FIX.md**
   - État global
   - Corrections appliquées
   - Problèmes restants

2. **RAPPORT_DEPENDENCIES_AUTO_FIX.md**
   - Analyse dépendances
   - Vulnérabilités
   - Stats

3. **RAPPORT_TESTS_AUTO_FIX.md**
   - Résultats tests
   - Tests corrigés
   - Problèmes identifiés

4. **PLAN_ACTION_AUTO_FIX.md**
   - Timeline
   - Responsabilités
   - Points de contrôle

## 🎯 Points de Conception

### 1. Modularité

Chaque module indépendant:
- ✅ Peut être utilisé isolément
- ✅ Pas de dépendances croisées
- ✅ Facile à tester/mocking
- ✅ Facile à étendre

### 2. Modes de Fonctionnement

```javascript
// Dry-run (simulation)
const fixer = new PackageJsonFixer(config, true); // 2e param = dryRun
// Pas de modifications réelles

// Production
const fixer = new PackageJsonFixer(config, false);
// Modifie les fichiers réels
```

### 3. Gestion d'Erreurs

```javascript
// Try-catch dans chaque module
// Accumulation des erreurs/warnings
// Pas d'arrêt sur première erreur
// Rapport complet en fin
```

### 4. Logging

```javascript
// Logger fourni à chaque étape
logger.banner('Title');     // Bannière
logger.section('Title');    // Section
logger.success('Message');  // Succès
logger.warn('Message');     // Avertissement
logger.error('Message');    // Erreur
```

## 🔌 Extensibilité

Pour ajouter une nouvelle phase:

```javascript
// 1. Créer le module
class NewFixer {
  constructor(config, dryRun) {
    this.config = config;
    this.dryRun = dryRun;
    this.results = { fixed: 0, issues: [] };
  }
  
  async fixAll() {
    // Logique de correction
    return this.results;
  }
}

// 2. L'importer dans auto-fix.js
const { NewFixer } = require('./modules/new-fixer.js');

// 3. L'ajouter à main()
logger.section('🆕 Phase X: New Phase');
await newPhase();
```

## 📊 Flux de Données

### Configuration

```env
.env
├─► process.env
├─► CONFIG object
└─► Passed to modules
```

### Resultats

```
Module Results
├─► Logger output (console)
├─► Accumulated in results object
└─► Final summary + reports
```

## 🚦 États de Module

```
Module États:
├─ PENDING   : En attente
├─ RUNNING   : En cours
├─ SUCCESS   : Succès
├─ PARTIAL   : Succès partiel
├─ WARNING   : Avertissement
└─ ERROR     : Erreur
```

## 🔐 Sécurité

1. **Dry-run par défaut recommandé** avant production
2. **Backup BD avant changements** majeurs
3. **Logs détaillés** pour audit
4. **Validation entrées** (.env variables)
5. **Connexion DB** sécurisée (mysql2 with SSL)

## 📈 Performance

- **Mode DRY-RUN:** ~5-10s
- **Complet (sans tests):** ~2-3 min
- **Avec tests:** ~5-10 min
- **Parallélisation:** Max 4 opérations

## 🧪 Testing du Script

```bash
# Tester dry-run
node auto-fix.js --dry-run --verbose

# Tester modules individuels
node -e "const {PackageJsonFixer} = require('./index'); ..."

# Tester avec .env test
cp .env.test .env
npm run start
```

## 📝 Logs & Debugging

```javascript
// Verbose mode pour debug
node auto-fix.js --verbose

// Logs enregistrés dans auto-fix.log (optionnel)
LOG_TO_FILE=true npm run start
```

---

**Architecture maintenue par:** SPOFE Team  
**Dernière mise à jour:** 21 Janvier 2026  
**Version:** 1.0.0
