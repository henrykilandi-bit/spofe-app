# Frontend Contract Enforcer - CI/CD Configuration

## 🚀 Configurations d'automatisation

Ce dossier contient tous les scripts et configurations pour automatiser la validation du Frontend Contract Enforcer en CI/CD.

---

## 📋 Fichiers disponibles

### 1. **validate-fce.sh** (Bash)
Script de validation pour CI/CD Linux/macOS

```bash
./scripts/validate-fce.sh
```

Checks:
- ✅ Pas de fetch() direct
- ✅ Pas de localStorage métier
- ✅ Pas de logique métier dans les vues
- ✅ Imports FCE cohérents
- ✅ Contract chargé au startup

### 2. **validate-fce.ps1** (PowerShell)
Script de validation pour Windows

```powershell
.\scripts\validate-fce.ps1
# ou strict mode
.\scripts\validate-fce.ps1 -Strict
```

### 3. **validate-fce.mjs** (Node.js)
Script cross-platform en Node.js (recommandé)

```bash
npm run validate:fce
# ou strict
npm run validate:fce:strict
```

### 4. **.github/workflows/frontend-contract-validation.yml**
GitHub Actions workflow automatisé

Déclenché par:
- ✅ Pull requests sur les dossiers `frontend/`, `src/`, ou `package.json`
- ✅ Push sur `main` ou `develop`

### 5. **.git-hooks/pre-commit**
Git hook automatique avant commit

Installation:
```bash
cp .git-hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 6. **package.json**
Scripts npm pour la validation

```bash
npm run validate:fce           # Validation standard
npm run validate:fce:strict    # Mode strict (fail si warning)
npm run lint                   # ESLint
npm test                       # Tests
npm run precommit              # Avant commit
npm run prepush                # Avant push
npm run ci                     # CI complet
```

---

## 🔧 Configuration recommandée

### GitHub Actions (Recommandé)

1. **Copier le workflow:**
```bash
mkdir -p .github/workflows
cp frontend-contract-validation.yml .github/workflows/
```

2. **Commit et push:**
```bash
git add .github/
git commit -m "Add FCE validation to CI"
git push
```

3. **Résultat:**
Tous les PR automatiquement validés ✅

---

### Pre-commit Hook (Local)

1. **Installer:**
```bash
chmod +x .git-hooks/pre-commit
cp .git-hooks/pre-commit .git/hooks/
```

2. **Test:**
```bash
git add frontend/
git commit -m "test"  # Hook déclenché automatiquement
```

---

### npm Scripts (Développement)

```json
{
  "scripts": {
    "validate:fce": "node scripts/validate-fce.mjs",
    "validate:fce:strict": "node scripts/validate-fce.mjs --strict",
    "precommit": "npm run validate:fce && npm run lint",
    "prepush": "npm run validate:fce:strict && npm test",
    "ci": "npm run validate:fce:strict && npm test:coverage"
  }
}
```

---

## 📊 Matrice de validation

| Check | Local Hook | npm | CI | Fail? |
|-------|-----------|-----|----|----|
| fetch() | ✅ | ✅ | ✅ | ❌ |
| localStorage métier | ✅ | ✅ | ✅ | ❌ |
| Logique métier | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Imports FCE | ✅ | ✅ | ✅ | ❌ |
| Contract au startup | ⚠️ | ⚠️ | ⚠️ | ⚠️ |

**Legend:**
- ✅ Erreur (blocage)
- ⚠️ Avertissement (info seulement)
- ❌ Ne bloque pas

---

## 🚨 Faire passer une validation échouée

### Erreur: fetch() détecté

```typescript
// ❌ AVANT
const data = await fetch('/api/aggregates').then(r => r.json());

// ✅ APRÈS
import { readModel } from '@/core/spofe-contract';
const data = await readModel('/aggregates');
```

### Erreur: localStorage métier

```typescript
// ❌ AVANT
localStorage.setItem('balance', amount);

// ✅ APRÈS
const balance = await readModel('/account/balance');
```

### Erreur: Imports FCE

```typescript
// ❌ AVANT
import { readModel } from '@/core/spofe-contract/readModelClient.js';

// ✅ APRÈS
import { readModel } from '@/core/spofe-contract';
```

---

## 📈 Monitoring

### GitHub Actions

Voir les résultats dans:
- Pull Requests → "Checks" tab
- Actions → Frontend Contract Enforcer

### Local

```bash
npm run validate:fce
# Output:
# [1/5] Pas de fetch()... ✓ PASSÉ
# [2/5] Pas de localStorage... ✓ PASSÉ
# ...
# ✓ TOUS LES CHECKS PASSÉS
```

---

## 🔐 Strictness Levels

### Standard (développement)
```bash
npm run validate:fce
# Avertissements tolérés
# Ne bloque pas le merge
```

### Strict (before merge)
```bash
npm run validate:fce:strict
# Avertissements = erreurs
# Bloque le merge
```

### Très strict (avant release)
```bash
npm run ci
# Avertissements = erreurs
# Coverage > 80%
# Tests passent tous
```

---

## 🧪 Tests de la validation

```bash
# Tester l'échec (créer une violation)
echo "fetch('/api');" >> src/test.js
npm run validate:fce
# Output: ✗ ÉCHEC

# Corriger
git checkout src/test.js
npm run validate:fce
# Output: ✓ PASSÉ
```

---

## 💡 Best Practices

1. **Runner avant de commit:**
   ```bash
   npm run precommit
   ```

2. **Vérifier avant push:**
   ```bash
   npm run prepush
   ```

3. **Ignorer les faux positifs:**
   Ajouter des commentaires `eslint-disable` si nécessaire (rare)

4. **Monitorer les violations:**
   Voir les PR qui échouent → apprendre le pattern

---

## 📞 Troubleshooting

### "Command not found: validate-fce"

```bash
npm install
npm run validate:fce
```

### "Permission denied" sur script Bash

```bash
chmod +x scripts/validate-fce.sh
./scripts/validate-fce.sh
```

### Pre-commit hook ne se déclenche pas

```bash
# Vérifier l'installation
ls -la .git/hooks/pre-commit

# Réinstaller si besoin
cp .git-hooks/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

---

## 🚀 Prochaines étapes

1. **Ajouter à CI/CD:** Copier le workflow GitHub Actions
2. **Configurer hooks:** Installer pre-commit hook
3. **Documenter:** Montrer ces règles à l'équipe
4. **Monitorer:** Vérifier les violations en PR

---

**Frontend Contract Enforcer - CI/CD** © 2026 SPOFE Team
