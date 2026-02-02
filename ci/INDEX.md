# 🔒 SPOFE Frontend CI — Complete Index

**Version :** 1.0.0  
**Date :** 2026-01-30  
**Statut :** ACTIVE

---

## 📍 C'est quoi ?

La **SPOFE Frontend CI** est un système d'enforcement **automatique, structurel et bloquant** qui garantit :

✅ Aucun module non conforme n'est accepté  
✅ Aucun contournement du Frontend Contract Enforcer n'est possible  
✅ Chaque module déclare ses contrats  
✅ Les tests contractuels passent  

👉 **La gouvernance est structurelle, pas sociale.**

---

## 📚 Documents clés

### 1. 📜 Contrat de référence
**Fichier :** `contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md`

Le document normatif qui définit :
- ✅ Les principes fondamentaux (non-dérogatoires)
- ✅ La structure obligatoire d'un module
- ✅ Les responsabilités autorisées
- ✅ Les interdictions absolues

**À lire en priorité** si vous développez un module frontend.

---

### 2. ⚙️ Enforcement Guide (ce répertoire)

**Fichiers :** `ci/frontend-ci-enforcement.md`

Explique en détail :
- ✅ Comment fonctionnent les 4 checks
- ✅ Ce qui est bloqué et pourquoi
- ✅ Comment corriger une violation

**À lire** si vous devez corriger une PR bloquée.

---

### 3. 🚀 Integration Guide

**Fichier :** `ci/INTEGRATION_GUIDE.md`

Guide complet pour :
- ✅ Configurer la CI dans votre dépôt
- ✅ Tester localement avant de pousser
- ✅ Dépanner les erreurs courantes
- ✅ Configurer les branch protection rules

**À lire** si vous mettez en place la CI pour la première fois.

---

### 4. 📋 Scripts CI

**Fichier :** `ci/README.md`

Référence rapide des scripts :
- ✅ `check-frontend-structure.js`
- ✅ `check-frontend-manifest.js`
- ✅ `check-frontend-network.js`

Chaque script expliqué en une phrase.

---

### 5. 📝 Module Manifest Template

**Fichier :** `ci/MODULE_MANIFEST_TEMPLATE.md`

Template complet à copier/adapter pour tout nouveau module.

Contient un exemple annotée de `module.manifest.md`.

---

### 6. 🔄 GitHub Actions Workflow

**Fichier :** `.github/workflows/frontend-ci.yml`

La pipeline GitHub Actions qui exécute tous les checks automatiquement.

À copier dans votre dépôt.

---

## 🎯 Quick Navigation

### Je suis developer et je veux créer un module

1. Lire : [SPOFE-Frontend-Module-Contract.v1.md](../../contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md)
2. Copier : [MODULE_MANIFEST_TEMPLATE.md](./MODULE_MANIFEST_TEMPLATE.md)
3. Respecter : La structure exacte définie
4. Tester : `npm run ci:frontend:all`
5. Pousser : Créer une PR

### Ma PR est bloquée par la CI

1. Lire le message d'erreur (il est clair)
2. Consulter : [frontend-ci-enforcement.md](./frontend-ci-enforcement.md)
3. Corriger localement : `npm run ci:frontend:all`
4. Repousser : `git push`

### Je dois configurer la CI pour mon dépôt

1. Lire : [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Copier : `.github/workflows/frontend-ci.yml`
3. Copier : `ci/check-frontend-*.js`
4. Tester : `npm run ci:frontend:all`
5. Configurer : Branch protection rules

### Je dois comprendre l'architecture

1. Lire : [frontend-ci-enforcement.md](./frontend-ci-enforcement.md) (section Vue d'ensemble)
2. Regarder : Les fichiers scripts
3. Examiner : Le workflow GitHub Actions

---

## 📂 Arborescence

```
.github/
└─ workflows/
   └─ frontend-ci.yml                     ← Pipeline GitHub Actions

contracts/
└─ frontend-modules/
   └─ SPOFE-Frontend-Module-Contract.v1.md ← CONTRAT (référence)

ci/
├─ README.md                              ← Référence rapide
├─ frontend-ci-enforcement.md             ← Guide enforcement
├─ INTEGRATION_GUIDE.md                   ← Guide d'intégration
├─ MODULE_MANIFEST_TEMPLATE.md            ← Template manifest
├─ check-frontend-structure.js            ← Check 1 (structure)
├─ check-frontend-manifest.js             ← Check 2 (manifest)
└─ check-frontend-network.js              ← Check 3 (réseau)

frontend/
└─ modules/
   └─ <module-name>/
      ├─ module.manifest.md               ← Déclaration module
      ├─ index.ts
      ├─ api/module.api.ts
      ├─ ui/ModuleView.tsx
      ├─ ui/module.ui.ts
      ├─ routes/module.routes.ts
      ├─ hooks/useModuleUI.ts
      └─ tests/module.contract.spec.ts    ← Tests contractuels
```

---

## 🔗 Les 4 Checks

| Check | Fichier | Quoi | Violation |
|-------|---------|------|-----------|
| 1️⃣ Structure | `check-frontend-structure.js` | Arborescence exacte | "Missing file X" |
| 2️⃣ Manifest | `check-frontend-manifest.js` | Déclarations contrat | "Missing contractVersion" |
| 3️⃣ Network | `check-frontend-network.js` | Pas de fetch/axios | "Forbidden fetch()" |
| 4️⃣ Tests | GitHub Actions | Tests contractuels | Test failed |

---

## ✅ Validations

Tous les documents sont :

- ✅ **Alignés** avec le Kernel SPOFE
- ✅ **Alignés** avec le Frontend Contract Enforcer
- ✅ **Alignés** avec le contrat frontend-backend
- ✅ **Exécutables** en CI
- ✅ **Documentés** complètement
- ✅ **Testables** localement

---

## 🚀 Démarrage rapide

### Pour un developer

```bash
# 1. Lire le contrat
cat contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md

# 2. Créer un module
mkdir -p frontend/modules/my-module

# 3. Copier le template manifest
cp ci/MODULE_MANIFEST_TEMPLATE.md frontend/modules/my-module/module.manifest.md

# 4. Adapter et remplir la structure

# 5. Tester localement
npm run ci:frontend:all

# 6. Créer une PR
git push origin my-feature
# → Créer PR sur GitHub
```

### Pour l'architecte

```bash
# 1. Copier les fichiers
cp .github/workflows/frontend-ci.yml <votre-repo>
cp ci/check-frontend-*.js <votre-repo>/ci/

# 2. Configurer package.json
# Ajouter les scripts

# 3. Configurer branch protection rules
# Settings → Branches → Add rule

# 4. Documenter l'équipe
# Partager : INTEGRATION_GUIDE.md
```

---

## 📖 Légende des symboles

- 📜 Contrat normatif (obligatoire)
- ⚙️ Implémentation technique
- 🚀 Guide d'intégration
- 🔍 Check/Validation
- 📋 Référence/Template
- ✅ Conforme
- ❌ Non conforme / Interdit

---

## 🎯 Objectif global

```
Aucune PR frontend non conforme ne peut être mergée.

La gouvernance est structurelle, pas sociale.
```

---

## 📞 Support

En cas de question :

1. Consulter le document concerné (voir ci-dessus)
2. Exécuter localement : `npm run ci:frontend:all`
3. Lire le message d'erreur (il est explicite)
4. Consulter : [frontend-ci-enforcement.md](./frontend-ci-enforcement.md)

---

## 📝 Version et Maintenance

| Aspect | Valeur |
|--------|--------|
| Version | 1.0.0 |
| Date | 2026-01-30 |
| Statut | ACTIVE |
| Contrat associé | SPOFE-Frontend-Module-Contract.v1.md |
| Gouvernance | SPOFE Team |

---

## ✨ En résumé

Ce système CI garantit :

- ✅ **Conformité** : Chaque module respecte le contrat
- ✅ **Sécurité** : Aucun contournement du FCE n'est possible
- ✅ **Traçabilité** : Chaque module déclare ses contrats
- ✅ **Qualité** : Les tests contractuels sont obligatoires
- ✅ **Automatisation** : La gouvernance est structurelle

**Bienvenue dans SPOFE Frontend Governance 1.0.0 ✅**

---

**Créé par :** SPOFE Team  
**Date :** 2026-01-30  
**Version :** 1.0.0
