# 🚀 SPOFE Frontend CI — Guide d'intégration

**Version :** 1.0.0  
**Date :** 2026-01-30  
**Statut :** ACTIVE

---

## 📌 Vue d'ensemble

Ce guide explique comment **intégrer et utiliser** la CI SPOFE Frontend Contract dans votre workflow.

---

## 🏗️ Architecture de la CI

```
┌─────────────────────────────────────────────────────────┐
│          GitHub Actions / CI Workflow                   │
│     (.github/workflows/frontend-ci.yml)                 │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        ▼          ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐
   │Struct. │ │Manifest│ │Network │ │ Tests   │
   │ Check  │ │ Check  │ │ Check  │ │Contractual
   └────────┘ └────────┘ └────────┘ └─────────┘
        │          │          │          │
        └──────────┼──────────┼──────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  PR Blockade    │
          │  (Si 1 échec)   │
          └─────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  PR Mergeable   │
          │  (Si PASS ALL)  │
          └─────────────────┘
```

---

## 📂 Fichiers requis

Copier cette structure dans votre dépôt :

```
.github/
└─ workflows/
   └─ frontend-ci.yml              ← Pipeline GitHub Actions

ci/
├─ README.md
├─ frontend-ci-enforcement.md
├─ MODULE_MANIFEST_TEMPLATE.md
├─ check-frontend-structure.js     ← Check structure
├─ check-frontend-manifest.js      ← Check manifest
└─ check-frontend-network.js       ← Check réseau

contracts/
└─ frontend-modules/
   └─ SPOFE-Frontend-Module-Contract.v1.md ← Contrat de référence
```

---

## ⚙️ Configuration du dépôt

### 1. GitHub Actions (automatique)

Le workflow `.github/workflows/frontend-ci.yml` s'exécute automatiquement à chaque PR.

**Aucune configuration supplémentaire requise.**

### 2. Package.json (local)

```json
{
  "scripts": {
    "ci:frontend:structure": "node ci/check-frontend-structure.js",
    "ci:frontend:manifest": "node ci/check-frontend-manifest.js",
    "ci:frontend:network": "node ci/check-frontend-network.js",
    "ci:frontend:all": "npm run ci:frontend:structure && npm run ci:frontend:manifest && npm run ci:frontend:network",
    "test": "vitest run"
  }
}
```

### 3. Branch protection rules (GitHub)

Aller dans : **Settings → Branches → Branch protection rules**

Ajouter une règle pour la branche `main` :

```
✅ Require status checks to pass before merging
   └─ Select: frontend-contract (la CI SPOFE)

✅ Require branches to be up to date before merging

✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require code reviews before merging (au moins 1)
```

**Résultat :** Aucune PR ne peut être mergée sans passer tous les checks.

---

## 💻 Utilisation locale

### Avant de commiter

```bash
# Exécuter tous les checks localement
npm run ci:frontend:all
```

**Output si PASS :**
```
✅ All 1 module(s) have correct structure
✅ STRUCTURE CHECK PASSED

✅ All 1 module manifest(s) are compliant
✅ MANIFEST CHECK PASSED

✅ Scanned 24 file(s)
✅ No unauthorized network access detected
✅ NETWORK ACCESS CONTROL CHECK PASSED
```

**Output si FAIL :**
```
❌ [STRUCTURE] budgeting missing tests/module.contract.spec.ts

❌ STRUCTURE CHECK FAILED
```

### En cas d'erreur

Lire le message d'erreur → corriger → réexécuter

```bash
npm run ci:frontend:all
```

---

## 📋 Workflow d'une PR (frontend)

### 1. Developer crée une feature branch
```bash
git checkout -b feature/budgeting-module
```

### 2. Developer implémente le module
```
modules/budgeting/
├─ module.manifest.md      ✅ REQUIS
├─ index.ts
├─ api/module.api.ts
├─ ui/ModuleView.tsx
├─ ui/module.ui.ts
├─ routes/module.routes.ts
├─ hooks/useModuleUI.ts
└─ tests/module.contract.spec.ts
```

### 3. Developer teste localement
```bash
npm run ci:frontend:all
# ✅ PASS
```

### 4. Developer pousse et crée une PR
```bash
git push origin feature/budgeting-module
# Créer PR sur GitHub
```

### 5. GitHub Actions exécute automatiquement
```
✅ Check module structure
✅ Check module manifests
✅ Check network access control
✅ Run frontend tests
```

### 6. Résultat

**Si PASS :**
```
✅ All checks passed
   → La PR peut être mergée
```

**Si FAIL :**
```
❌ One or more contract checks failed
   → La PR est bloquée
   → Developer doit corriger et repousser
```

### 7. Review + Merge

```
✅ Code review approuvée
✅ Tous les checks passed
   → Developer merge la PR
```

---

## 🔍 Détail des checks

### Check 1 : Structure

**Quand :** Avant tout test
**Quoi :** Vérifie l'arborescence exacte
**Fail → :** "Missing file X"
**Action :** Ajouter le fichier manquant

### Check 2 : Manifest

**Quand :** Après check structure
**Quoi :** Vérifie les déclarations de contrat
**Fail → :** "Missing declaration: contractVersion"
**Action :** Ajouter la déclaration dans `module.manifest.md`

### Check 3 : Network (ZÉRO TOLÉRANCE)

**Quand :** Après check manifest
**Quoi :** Scan pour `fetch()`, `axios`, `XMLHttpRequest`
**Fail → :** "Forbidden fetch() in module.api.ts:42"
**Action :** Utiliser le FCE au lieu de `fetch()`

### Check 4 : Tests

**Quand :** Après check network
**Quoi :** Exécute `npm test`
**Fail → :** Test échoue
**Action :** Corriger le test

---

## 🆘 Dépannage courant

### ❌ "Missing module.manifest.md"

```bash
# Créer le fichier
touch modules/<nom>/module.manifest.md

# Utiliser le template
cat ci/MODULE_MANIFEST_TEMPLATE.md > modules/<nom>/module.manifest.md

# Adapter le contenu
```

### ❌ "Forbidden fetch() in api.ts"

```typescript
// ❌ MAUVAIS
const response = await fetch('/api/aggregates');

// ✅ BON
import { sendCommand } from '@/core/spofe-contract';
await sendCommand('GetAggregates', {});
```

### ❌ "Missing contractVersion"

```yaml
# Ajouter au module.manifest.md :

contractVersion: 1.0.0
readModels:
  - /read/aggregates/active
commands:
  - CreateAggregate
```

### ❌ "Test failed"

```bash
# Exécuter les tests en détail
npm test -- frontend --reporter=verbose

# Lire l'erreur et corriger
```

---

## 📊 Métriques de conformité

Une fois la CI en place, vous pouvez suivre :

- **Nombre de modules conformes** : X / total
- **Nombre de violations réseau bloquées** : Y (cumul)
- **Temps moyen de correction** : Z minutes

---

## 🎯 Success Metrics

Objectifs mesurables :

| Métrique | Cible |
|----------|-------|
| Modules conformes | 100% |
| PR bloquées (non conforme) | 100% |
| Violations réseau détectées | 100% |
| Tests contractuels passing | 100% |
| Temps intro CI → efficacité | < 1 semaine |

---

## 📚 Documentation complémentaire

| Document | Contenu |
|----------|---------|
| [SPOFE-Frontend-Module-Contract.v1.md](../../contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md) | **Contrat normatif** |
| [frontend-ci-enforcement.md](./frontend-ci-enforcement.md) | **Règles d'enforcement CI** |
| [MODULE_MANIFEST_TEMPLATE.md](./MODULE_MANIFEST_TEMPLATE.md) | **Template manifest** |
| [README.md](./README.md) | **Référence rapide scripts** |
| **Ce fichier** | **Guide d'intégration** |

---

## ✅ Checklist d'activation

- [ ] Copier `.github/workflows/frontend-ci.yml`
- [ ] Copier `ci/check-frontend-*.js`
- [ ] Ajouter scripts au `package.json`
- [ ] Configurer branch protection rules
- [ ] Tester localement : `npm run ci:frontend:all`
- [ ] Créer une PR de test
- [ ] Vérifier que GitHub Actions s'exécute
- [ ] Documenter le processus pour l'équipe
- [ ] Trainer l'équipe frontend

---

## 🔐 Garantie finale

```
Avec cette CI correctement configurée :

✅ Aucune PR frontend non conforme ne peut être mergée
✅ Aucun contournement du FCE n'est possible
✅ La gouvernance est structurelle
✅ Les violations sont impossibles à ignorer
```

---

**Implémentation :** SPOFE Team  
**Date :** 2026-01-30  
**Statut :** ACTIVE  
**Version :** 1.0.0
