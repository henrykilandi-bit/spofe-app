# 🔧 COMMANDS ESSENTIELLES - HARMONISATION SPOFE v2.2

**Pour copier-coller rapide pendant l'exécution**

---

## 🚀 SETUP INITIAL (Jour 0 - AVANT lundi)

### Backup BD

```bash
# Créer directory backups
mkdir backups

# Dump BD complète (depuis cycle admin)
mysqldump -u root spofe_v2_1 > backups/spofe_v2_1_25JAN2026.sql

# Vérifier backup créé
dir backups
# Output: spofe_v2_1_25JAN2026.sql (file size > 1MB)
```

### Git Setup

```bash
# Créer branche feature
git checkout -b feature/spofe-v2.2-harmonization

# Tag de sauvegarde
git tag v2.1-before-harmonization

# Vérifier
git branch      # Should show * feature/spofe-v2.2-harmonization
git tag         # Should show v2.1-before-harmonization
```

### Directories

```bash
# Créer doc directory
mkdir docs\tables

# Créer test directories
mkdir -p cascade\tests\models
mkdir -p cascade\tests\hooks
mkdir -p cascade\tests\associations
mkdir -p cascade\tests\docs

# Vérifier
dir docs
dir cascade\tests
```

---

## 📚 PHASE 1: DOCUMENTATION (Lundi-Mercredi)

### Daily Start

```bash
# Depuis repo root
cd cascade

# Vérifier environment
npm -v          # Should be 9.x+
node -v         # Should be 18.x+
npm test 2>&1 | head -20   # Baseline

cd ..
```

### Create Documentation File

```bash
# Template pour chaque table
cat > docs/tables/TABLE_NAME.md << 'EOF'
# Table: {TableName}

**Base de Données**: {table_name}  
**Domaine**: {Organisationnel|Identité|Comptabilité|Audit}  
**Créée**: 2026-01-26

## 🎯 Rôle Métier
[Description métier]

## ⚠️ Criticité
| Aspect | Valeur |
|--------|--------|
| Criticité | 🔴|🟠|🟡|🟢 |
| Multi-Tenant | ✅/❌ |
| Auditée | ✅/❌ |
| Soft Delete | ✅/❌ |

## 📊 Structure
[Colonnes + types]

## 🔗 Dépendances
[Associations]

## 🚨 Règles Métier
[Rules]

## 🔐 Sécurité
[Security]
EOF

# Puis éditer avec VS Code
code docs/tables/TABLE_NAME.md
```

### Lint Documentation

```bash
# Vérifier markdown syntax
npm run lint:docs

# Si problème
npm run prettier -- docs/tables/*.md

# Check links
npm run test:docs:links
```

### Commit Daily Work

```bash
# Stage docs créés
git add docs/tables/*.md

# Commit avec message descriptif
git commit -m "docs: Day X - Phase 1 - Tables [name1, name2, ...]"

# Exemple: git commit -m "docs: Day 1 - Phase 1 - users, compagnies, roles"
```

---

## 🔧 PHASE 2: ORM MODELS (Mercredi-Vendredi)

### Create Model File

```bash
# Créer modèle template
cat > cascade/src/models/GroupeEntreprise.model.js << 'EOF'
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupeEntreprise = sequelize.define('GroupeEntreprise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  // ... other fields
}, {
  tableName: 'groupes_entreprises',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

// Associations
GroupeEntreprise.hasMany(models.Compagnie, {
  foreignKey: 'groupe_id',
  as: 'compagnies'
});

module.exports = GroupeEntreprise;
EOF

# Puis éditer avec VS Code
code cascade/src/models/GroupeEntreprise.model.js
```

### Test Model

```bash
cd cascade

# Run model tests
npm run test -- tests/models/groupeEntreprise.model.test.js

# Or all model tests
npm run test:models

cd ..
```

### Validate Models Configuration

```bash
cd cascade

# Check all models conform SPOFE v2.2
npm run test -- tests/models/models-validation.test.js

# Check associations
npm run test -- tests/associations/

cd ..
```

### Rename Model (if needed)

```bash
# Move file
mv cascade/src/models/company.model.js cascade/src/models/compagnie.model.js

# Edit file: change Company → Compagnie
code cascade/src/models/compagnie.model.js

# Update index.js exports
code cascade/src/models/index.js
# Change: module.exports.Company → module.exports.Compagnie

# Test
cd cascade
npm run test:models
cd ..
```

### Commit Models

```bash
git add cascade/src/models/*.model.js
git add cascade/tests/models/*.test.js

git commit -m "feat: Add 5 new models (groupe, 2fa, reset, blacklist, audit)"
git commit -m "refactor: Rename company→compagnie, appSetting→appSettings"
git commit -m "test: Model validation + associations tests (100% passing)"
```

---

## ⚙️ PHASE 3: HOOKS (Lundi-Mercredi Semaine 2)

### Add Hooks to Model

```bash
# Éditer modèle existant
code cascade/src/models/user.model.js

# Ajouter hooks:
# User.addHook('beforeCreate', 'validateUser', async (instance) => { ... });
# User.addHook('beforeUpdate', 'auditUpdate', async (instance) => { ... });
# User.addHook('afterCreate', 'logCreation', async (instance) => { ... });
```

### Test Hooks

```bash
cd cascade

# Run hook tests
npm run test:hooks

# Or specific model hooks
npm run test -- tests/hooks/user.hooks.test.js

# Coverage check
npm run test:hooks -- --coverage

cd ..
```

### Verify Audit Trail

```bash
# Check audit_trails are being created
cd cascade

# Create test
cat > tests/hooks/audit-trail.test.js << 'EOF'
test('Audit trail created on user update', async () => {
  const user = await User.create({ username: 'test' });
  await user.update({ email: 'test@example.com' });
  
  const audit = await AuditTrail.findOne({
    where: { table_name: 'users', record_id: user.id }
  });
  
  expect(audit).toBeDefined();
  expect(audit.operation).toBe('UPDATE');
});
EOF

npm run test -- tests/hooks/audit-trail.test.js

cd ..
```

### Commit Hooks

```bash
git add cascade/src/models/*.model.js
git add cascade/tests/hooks/*.test.js

git commit -m "feat: Add comprehensive hooks to all models"
git commit -m "feat: Implement audit trail + security event logging"
git commit -m "test: Hook tests (250+ cases, 90%+ coverage)"
```

---

## 🎨 PHASE 4: FRONTEND (Jeudi-Vendredi Semaine 2)

### Validate DTOs

```bash
# Test DTO conversions
cd cascade

cat > tests/dtos/dto.validation.test.js << 'EOF'
test('User DTO camelCase→snake_case', () => {
  const frontendData = {
    userId: 1,
    emailAddress: 'test@example.com',
    groupeId: 5
  };
  
  const backendData = dtoConverter.convertToDB(frontendData);
  
  expect(backendData.user_id).toBe(1);
  expect(backendData.email_address).toBe('test@example.com');
  expect(backendData.groupe_id).toBe(5);
});
EOF

npm run test -- tests/dtos/

cd ..
```

### Test API Responses

```bash
# Vérifier responses en snake_case
cd cascade

cat > tests/api/api-format.test.js << 'EOF'
test('API returns snake_case response', async () => {
  const res = await request(app)
    .get('/api/users/1')
    .expect(200);
  
  expect(res.body).toHaveProperty('user_id');
  expect(res.body).toHaveProperty('email_address');
  // Should NOT have camelCase properties
  expect(res.body).not.toHaveProperty('userId');
});
EOF

npm run test -- tests/api/

cd ..
```

### Run E2E Tests

```bash
cd cascade

# Run all E2E tests
npm run test:e2e

# Or specific suite
npm run cypress -- run --spec "cypress/e2e/user-form.cy.js"

cd ..
```

### Commit Frontend Changes

```bash
git add cascade/tests/dtos/*.test.js
git add cascade/tests/api/*.test.js
git add cascade/src/utils/dtoConverter.js  # If modified

git commit -m "test: Validate DTOs + API response format"
git commit -m "test: E2E tests for user and entry workflows"
```

---

## ✅ FINAL QA (Vendredi soir Semaine 2)

### Run All Tests

```bash
cd cascade

# Complete test suite
npm run test:all

# Should output:
# PASS tests/...
# ...
# Tests: 400+ passed
# Coverage: 85%+

cd ..
```

### Code Quality Checks

```bash
cd cascade

# Linting
npm run lint
npm run lint:code

# Formatting
npm run prettier -- --check .

# Fix formatting if needed
npm run prettier -- --write .

# Conventions check
npm run conventions:check

cd ..
```

### Performance Baseline

```bash
cd cascade

# Run benchmark
npm run benchmark

# Should show: Performance within baseline ✅

cd ..
```

### Code Review

```bash
# View all changes
git diff develop feature/spofe-v2.2-harmonization

# Or specific file
git diff develop -- cascade/src/models/user.model.js
```

### Final Commits

```bash
git add cascade/src cascade/tests docs/

git commit -m "test: Final QA - 400+ tests passing, 85%+ coverage"
git commit -m "docs: Complete documentation + final report"
git commit -m "chore: SPOFE v2.2 harmonization COMPLETE"

# Tag for production
git tag v2.2-harmonization-complete
git tag production-ready
```

---

## 🚀 DEPLOYMENT (Lundi 9 Février)

### Staging Deployment

```bash
# From repo root
git checkout main
git pull origin main

# Merge feature branch
git merge feature/spofe-v2.2-harmonization

# Deploy to staging (assuming CI/CD configured)
npm run deploy:staging

# Run smoke tests
npm run test:smoke -- --env staging

# Monitor for 1h
```

### Production Deployment

```bash
# Ensure staging tests passed ✅
# Then:

# Deploy to production (maintenance window)
npm run deploy:production

# Run sanity checks
npm run test:sanity -- --env production

# Monitor for 48h
```

### Rollback (if needed)

```bash
# Restore database
mysql -u root spofe_v2_1 < backups/spofe_v2_1_25JAN2026.sql

# Rollback code
git reset --hard v2.1-before-harmonization

# Redeploy
npm run deploy:production
```

---

## 📋 DAILY COMMAND CHECKLIST

### Morning (09:00)

```bash
# Start environment
cd cascade
npm test 2>&1 | head -20    # Baseline test

# Check yesterday's work
git log --oneline -5        # View recent commits

cd ..
```

### During Day

```bash
# As you complete tasks:
git add [files]
git commit -m "[Phase] [Day] - [Description]"

# Test frequently
cd cascade
npm run test:[component]    # Models, hooks, docs, etc.
npm run lint
cd ..
```

### End of Day (16:30-17:00)

```bash
# Final tests
cd cascade
npm run test:all 2>&1 | tail -20

# Commit daily work
git add .
git commit -m "chore: EOD Day X - [Summary]"

# Tag day checkpoint
git tag day-X-checkpoint

cd ..
```

---

## 🆘 TROUBLESHOOTING COMMANDS

### Tests Failing?

```bash
cd cascade

# Clear cache
npm run test -- --clearCache

# Run specific test
npm run test -- tests/models/user.model.test.js --verbose

# Debug mode
npm run test -- --inspect-brk

cd ..
```

### Database Issues?

```bash
# Check BD running
mysql -u root -e "SELECT 1;" 

# Check spofe_v2_1 exists
mysql -u root -e "SHOW DATABASES LIKE 'spofe_v2_1';"

# Check tables
mysql -u root -e "USE spofe_v2_1; SHOW TABLES;"

# Restore from backup
mysql -u root spofe_v2_1 < backups/spofe_v2_1_25JAN2026.sql
```

### Git Conflicts?

```bash
# Check status
git status

# List conflicts
git diff --name-only --diff-filter=U

# Resolve (edit files manually)
code [conflicted-file]

# Mark as resolved
git add [conflicted-file]
git commit -m "merge: Resolve conflicts"
```

### npm Issues?

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r cascade/node_modules
rm cascade/package-lock.json
npm install

# Check for issues
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 📊 MONITORING COMMANDS

### Check Coverage

```bash
cd cascade

npm run test:all -- --coverage

# Output shows:
# Statements: 85%
# Branches: 82%
# Functions: 87%
# Lines: 85%

cd ..
```

### Count Tests

```bash
cd cascade

npm run test -- --listTests | wc -l  # Number of test files

npm run test -- --count [number]     # Run N tests

cd ..
```

### Check Git Status

```bash
# View uncommitted changes
git status

# View changes detail
git diff

# View staged changes
git diff --cached

# View commits today
git log --since="today" --oneline
```

---

## 🎯 PROGRESS COMMANDS

### Quick Status

```bash
# How many docs created?
ls docs/tables/*.md | wc -l   # Should be 14 by Wed

# How many models?
ls cascade/src/models/*.model.js | wc -l   # Should be 10 by Fri

# Tests passing?
cd cascade
npm run test 2>&1 | grep -E "^(PASS|FAIL|Tests:)"
cd ..

# Score estimate?
# Count above + check PLAN_EXECUTION_HARMONISATION_v2.2.md
```

### Score Tracking

```bash
# Manual calculation
# Phase 1: 14 docs → +25 pts (25/100)
# Phase 2: 5 models + assoc → +15 pts (40/100)
# Phase 3: 10 hooks → +25 pts (65/100)
# Phase 4: Frontend OK → +15 pts (80/100)
# QA: Tests + coverage → +18 pts (98/100)

echo "Current score estimate: X/100"
```

---

## 📝 COMMAND TEMPLATES

### Generic Commit Template

```bash
# Syntax: git commit -m "TYPE: DESCRIPTION"
# Types: feat, fix, docs, test, refactor, chore

# Examples:
git commit -m "feat: Add groupeEntreprise model"
git commit -m "docs: Complete 5 table documentation"
git commit -m "test: Add hook tests (90% coverage)"
git commit -m "fix: Audit trail not logging on update"
git commit -m "refactor: Rename company→compagnie model"
git commit -m "chore: EOD Day 3 - Phase 1 checkpoint"
```

### Generic Test Command

```bash
cd cascade

# All tests
npm run test

# Specific test file
npm run test -- tests/models/user.model.test.js

# Specific test suite
npm run test -- --testNamePattern="beforeCreate"

# With coverage
npm run test -- --coverage

# Watch mode (reruns on file change)
npm run test -- --watch

cd ..
```

---

## 🎉 SUCCESS COMMANDS

### When Phase Complete

```bash
# Tag phase completion
git tag phase-[number]-complete

# View all tags
git tag

# Create tag annotation (optional)
git tag -a phase-1-complete -m "Phase 1 Documentation - COMPLETE"
```

### Final Deploy

```bash
# Ensure all tests pass
cd cascade
npm run test:all
npm run lint
cd ..

# Tag production
git tag v2.2-production
git tag v2.2-$(date +%Y%m%d)

# View current state
git log --oneline -10
git tag
```

---

**QUICK REFERENCE COMPLETE**  
*Copier-coller friendly*  
*Tous les commands essentiels listés*  
*Ready to use pendant l'exécution*

---

### 🚀 SAVE THIS FILE FOR QUICK ACCESS DURING PROJECT!
