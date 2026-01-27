# 📋 SCRIPTS DE CONFORMITÉ SPOFE v2.2

## 🎯 Scripts de Suivi Automatique des Conventions de Nommage

### 🚀 Scripts Principaux

#### 1. **conventions-compliance-checker.js**
Script principal de vérification de conformité avec les conventions SPOFE v2.2.

```bash
# Vérification simple
node scripts/conventions-compliance-checker.js

# Vérification avec corrections automatiques
node scripts/conventions-compliance-checker.js --fix

# Génération du rapport détaillé
node scripts/conventions-compliance-checker.js --report

# Mode surveillance continue
node scripts/conventions-compliance-checker.js --watch
```

#### 2. **pre-commit-hook.js**
Hook Git qui bloque les commits non conformes.

```bash
# Installation du hook
node scripts/install-pre-commit.js

# Test manuel
node scripts/pre-commit-hook.js
```

#### 3. **migration-validator.js**
Validation des migrations SQL avant exécution.

```bash
# Validation d'une migration
node scripts/migration-validator.js --file migration-file.js

# Validation de toutes les migrations
node scripts/migration-validator.js --all
```

---

## 📊 Fonctionnalités du Checker Principal

### 🔍 **Scan Complet**
- **📊 Modèles Sequelize**: Vérification des définitions de tables
- **🔄 Migrations**: Validation des scripts SQL
- **🎮 Contrôleurs**: Check des requêtes SQL
- **📚 Documentation**: Vérification des docs de tables

### ⚙️ **Règles Vérifiées**
- **🐍 snake_case**: Tables et colonnes en snake_case
- **🔑 Clés étrangères**: Format `{table}_id`
- **⏰ Timestamps**: Format `*_at`
- **🗑️ Soft delete**: `deleted_at` obligatoire
- **🪝 Hooks**: Hooks Sequelize obligatoires
- **📄 Documentation**: Docs par table obligatoires

### 🛠️ **Corrections Automatiques**
- Ajout des options `underscored: true`
- Ajout des options `timestamps: true`
- Ajout des options `paranoid: true`
- Correction des noms de colonnes simples

---

## 🎯 Intégration CI/CD

### GitHub Actions
```yaml
# .github/workflows/conventions-check.yml
name: Check SPOFE Conventions
on: [push, pull_request]

jobs:
  conventions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Check conventions
        run: |
          npm install
          node scripts/conventions-compliance-checker.js --report
      
      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: conventions-report
          path: conventions-compliance-report.json
```

### Package.json Scripts
```json
{
  "scripts": {
    "conventions:check": "node scripts/conventions-compliance-checker.js",
    "conventions:fix": "node scripts/conventions-compliance-checker.js --fix",
    "conventions:report": "node scripts/conventions-compliance-checker.js --report",
    "conventions:watch": "node scripts/conventions-compliance-checker.js --watch",
    "conventions:precommit": "node scripts/pre-commit-hook.js"
  }
}
```

---

## 📋 Rapports Générés

### Format JSON
```json
{
  "timestamp": "2026-01-25T18:00:00.000Z",
  "version": "2.2.0",
  "stats": {
    "filesChecked": 25,
    "violationsFound": 3,
    "fixesApplied": 2
  },
  "violations": [
    {
      "type": "COLUMN_NAMING",
      "file": "cascade/src/models/User.js",
      "message": "Colonne \"groupeId\" ne respecte pas snake_case",
      "timestamp": "2026-01-25T18:00:00.000Z"
    }
  ],
  "fixes": [...],
  "conventions": {...}
}
```

### Score de Conformité
- **🟢 90-100%**: Excellente conformité
- **🟡 70-89%**: Conformité acceptable
- **🔴 <70%**: Action requise

---

## 🚨 Types de Violations Détectées

### 📊 **Niveau Critique**
- `TABLE_NAMING`: Nom de table incorrect
- `COLUMN_NAMING`: Nom de colonne incorrect
- `FORBIDDEN_COLUMN`: Colonne interdite utilisée
- `MISSING_HOOKS`: Hooks Sequelize manquants

### ⚠️ **Niveau Moyen**
- `FOREIGN_KEY_FORMAT`: Format clé étrangère incorrect
- `BOOLEAN_NAMING`: Nom booléen incorrect
- `TIMESTAMP_NAMING`: Format timestamp incorrect
- `MISSING_UNDERSCORED`: Option underscored manquante

### ℹ️ **Niveau Info**
- `MISSING_DOC_SECTION`: Section documentation manquante
- `UNKNOWN_DOMAIN`: Table domaine inconnu
- `INCONSISTENT_TABLE_NAME`: Nom incohérent en doc

---

## 🛠️ Installation et Configuration

### 1. **Installation des Scripts**
```bash
# Copier les scripts dans le dossier scripts
cp conventions-compliance-checker.js scripts/
cp pre-commit-hook.js scripts/
cp migration-validator.js scripts/

# Rendre exécutables (Linux/Mac)
chmod +x scripts/*.js
```

### 2. **Configuration du Hook Pre-commit**
```bash
# Installation automatique
node scripts/install-pre-commit.js

# Ou manuelle dans .git/hooks/pre-commit
#!/bin/sh
node scripts/pre-commit-hook.js
```

### 3. **Configuration VS Code**
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  },
  "spofe.conventions.autoFix": true,
  "spofe.conventions.showNotifications": true
}
```

---

## 📚 Documentation des Tables

### Template Obligatoire
```markdown
## 📊 TABLE: nom_table

### 🎯 Rôle Métier
Description du rôle métier

### ⚠️ Criticité
TRÈS ÉLEVÉE / ÉLEVÉE / MOYENNE / FAIBLE

### 🏢 Multi-Tenant
✅ OUI / ❌ NON

### 🔐 Auditée
✅ OUI / ❌ NON

### 🗑️ Soft Delete
✅ OUI / ❌ NON

### 📝 Colonnes Clés
| Colonne | Type | Description | OHADA |
|---------|------|-------------|-------|

### 🔗 Dépendances
- Tables dépendantes

### 🚨 Règles Métier
1. Règle 1
2. Règle 2
```

### Emplacement des Docs
```
docs/tables/
├── users.md
├── compagnies.md
├── journal_entries.md
├── charts_of_accounts.md
└── ...
```

---

## 🔧 Personnalisation

### Ajout de Règles Custom
```javascript
// Dans conventions-compliance-checker.js
const CUSTOM_RULES = {
  COMPANY_PREFIX: {
    pattern: /^company_|user_/,
    description: 'Tables doivent commencer par company_ ou user_'
  }
};
```

### Configuration Spécifique Projet
```javascript
// config/conventions.js
export const PROJECT_CONVENTIONS = {
  ...CONVENTIONS,
  CUSTOM_RULES,
  EXCLUDED_FILES: ['legacy_table.js'],
  SEVERITY_LEVELS: {
    'TABLE_NAMING': 'critical',
    'COLUMN_NAMING': 'high'
  }
};
```

---

## 📈 Monitoring et Reporting

### Dashboard de Conformité
```javascript
// scripts/conventions-dashboard.js
// Interface web pour visualiser la conformité
```

### Notifications Slack
```javascript
// scripts/slack-notifier.js
// Envoie les rapports vers Slack
```

### Intégration SonarQube
```javascript
// scripts/sonar-integration.js
// Export des métriques pour SonarQube
```

---

## 🎯 Bonnes Pratiques

### ✅ **À Faire**
- Exécuter le checker avant chaque commit
- Documenter chaque nouvelle table
- Utiliser les corrections automatiques
- Surveiller le score de conformité

### ❌ **À Éviter**
- Ignorer les violations critiques
- Contourner le hook pre-commit
- Utiliser camelCase en base de données
- Oublier la documentation

### 🔄 **Workflow Recommandé**
1. Créer/modifier le modèle
2. Exécuter `npm run conventions:fix`
3. Documenter la table
4. Exécuter `npm run conventions:check`
5. Commiter si conforme

---

## 📞 Support et Maintenance

### 🐛 **Rapport de Bugs**
- Créer une issue GitHub
- Inclure le rapport JSON
- Préciser la version du checker

### 🔄 **Mises à Jour**
- Suivre les releases SPOFE v2.2
- Mettre à jour les conventions
- Re-générer les rapports

### 📚 **Ressources**
- Documentation complète: `/docs/CONVENTIONS_NOMMAGE_SPOFE_v2.2.md`
- Guide d'intégration: `/docs/integration-guide.md`
- FAQ: `/docs/conventions-faq.md`

---

*Document maintenu par l'équipe technique SPOFE - Version 2.2.0*
