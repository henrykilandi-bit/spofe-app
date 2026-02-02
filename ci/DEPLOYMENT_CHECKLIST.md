# 🚀 SPOFE Frontend CI — Deployment Checklist

**Version :** 1.0.0  
**Date :** 2026-01-30  
**Statut :** READY

---

## ✅ Pre-Deployment Checklist

À faire **avant** de mettre en place la CI.

### Infrastructure

- [ ] GitHub repository créé
- [ ] `main` branch existe et est protégée
- [ ] Accès administrateur au dépôt

### Files Structure

- [ ] Dossier `frontend/` existe
- [ ] Dossier `contracts/` existe
- [ ] Dossier `.github/workflows/` existe
- [ ] Dossier `ci/` existe
- [ ] `package.json` existe

---

## 📋 Deployment Steps

### Étape 1 : Copier les fichiers CI

```bash
# Créer les répertoires si nécessaire
mkdir -p .github/workflows
mkdir -p ci
mkdir -p contracts/frontend-modules

# Copier le workflow GitHub Actions
cp SPOFE-Frontend-CI/RESOURCES/.github/workflows/frontend-ci.yml .github/workflows/

# Copier les scripts CI
cp SPOFE-Frontend-CI/RESOURCES/ci/check-frontend-*.js ci/
cp SPOFE-Frontend-CI/RESOURCES/ci/*.md ci/
```

### Étape 2 : Copier les contrats

```bash
# Copier le contrat Frontend Module
cp SPOFE-Frontend-CI/RESOURCES/contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md \
   contracts/frontend-modules/
```

### Étape 3 : Configurer package.json

Ajouter au `package.json` :

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

### Étape 4 : Installer les dépendances

```bash
npm install
```

### Étape 5 : Tester localement

```bash
# Tous les checks
npm run ci:frontend:all

# Output attendu (si pas de modules):
# ⚠️  Frontend modules directory does not exist yet
# ou si modules existent:
# ✅ All X module(s) have correct structure
# ✅ STRUCTURE CHECK PASSED
# etc.
```

### Étape 6 : Git commit & push

```bash
git add .github/workflows/frontend-ci.yml
git add ci/
git add contracts/
git add package.json
git commit -m "feat: Add SPOFE Frontend CI enforcement"
git push origin main
```

### Étape 7 : Configurer Branch Protection Rules

1. Aller dans : **GitHub → Settings → Branches**
2. Cliquer : **Add rule**
3. Configurer :

```
Branch name pattern: main

✅ Require a pull request before merging
   ✅ Require approvals
   Approvals required: 1

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   ✅ Search for "frontend-contract"
   ✅ Select the check

✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require code reviews before merging
   Dismissal restrictions: (optionnel)

✅ Require up-to-date branches before merging
```

4. Cliquer : **Create** ou **Update**

### Étape 8 : Documenter l'équipe

Créer un document d'onboarding :

```markdown
# 🚀 Frontend Module Development Guide

## Quick Start

1. **Lire** : contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md
2. **Copier** : ci/MODULE_MANIFEST_TEMPLATE.md
3. **Créer** : Votre module dans modules/<name>/
4. **Tester** : npm run ci:frontend:all
5. **Créer** : Une PR

## Besoin d'aide ?

- Documentation : ci/README.md
- Questions CI : ci/INTEGRATION_GUIDE.md
- Erreurs : ci/frontend-ci-enforcement.md
```

### Étape 9 : Annoncer à l'équipe

Email template :

```
Subject: 🚀 SPOFE Frontend Contract CI is now ACTIVE

Bonjour,

La SPOFE Frontend CI est maintenant active sur le dépôt.

Qu'est-ce que cela signifie ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Tous les modules frontend doivent respecter le contrat SPOFE
✅ Aucune PR ne peut être mergée sans passer les checks
✅ La gouvernance est structurelle et automatique

Qu'est-ce que je dois faire ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Lire : contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md
2. Copier le template : ci/MODULE_MANIFEST_TEMPLATE.md
3. Créer votre module en respectant la structure
4. Tester localement : npm run ci:frontend:all
5. Créer une PR

Questions ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Voir : ci/INTEGRATION_GUIDE.md (guide complet)
- Voir : ci/frontend-ci-enforcement.md (règles détaillées)
- Contacter : @devops ou #frontend-architecture

Cordialement,
SPOFE Team
```

---

## 🧪 Validation Post-Deployment

### Check 1 : Workflow est actif

```bash
# Aller sur : https://github.com/<org>/<repo>/actions
# Vérifier que "Frontend SPOFE Contract CI" apparaît

# Créer une PR test pour valider
```

### Check 2 : Scripts s'exécutent

```bash
# En local
npm run ci:frontend:all

# Output :
# ✅ STRUCTURE CHECK PASSED
# ✅ MANIFEST CHECK PASSED
# ✅ NETWORK ACCESS CONTROL CHECK PASSED
```

### Check 3 : Branch protection fonctionne

```bash
# Tenter de push vers main sans PR
git push origin main

# Résultat attendu :
# ❌ [rejected] main -> main (protected branch hook declined)
```

### Check 4 : PR teste bien

1. Créer une PR test (branche quelconque)
2. Vérifier que GitHub Actions s'exécute
3. Vérifier que le check s'affiche dans la PR

---

## 🔍 Troubleshooting Deployment

### ❌ "Workflow not found"

**Problème :** `.github/workflows/frontend-ci.yml` mal copié

**Solution :**
```bash
# Vérifier le fichier
cat .github/workflows/frontend-ci.yml | head -5

# Doit commencer par:
# name: Frontend SPOFE Contract CI
# on:

# Si absent, recopier
```

### ❌ "Scripts not working"

**Problème :** Fichiers `ci/check-*.js` mal copiés

**Solution :**
```bash
# Tester manuellement
node ci/check-frontend-structure.js

# Doit afficher:
# 🔍 Checking frontend module structure...
```

### ❌ "npm scripts not found"

**Problème :** `package.json` non mis à jour

**Solution :**
```bash
# Vérifier
npm run ci:frontend:all

# Si erreur, ajouter les scripts à package.json
```

### ❌ "Branch protection not working"

**Problème :** Configuration GitHub incomplete

**Solution :**
1. Aller dans Settings → Branches
2. Vérifier que la règle pour `main` existe
3. Vérifier que les checks sont sélectionnés
4. Sauvegarder

---

## ✅ Success Criteria

Deployment est réussi si :

- [ ] Tous les fichiers sont en place
- [ ] `npm run ci:frontend:all` fonctionne localement
- [ ] GitHub Actions s'exécute sur les PRs
- [ ] Branch protection bloque les PRs non conformes
- [ ] L'équipe a reçu la documentation
- [ ] Aucune erreur dans les logs GitHub Actions

---

## 📊 Metrics

Après deployment, suivre :

| Métrique | Baseline | Target |
|----------|----------|--------|
| Modules conformes | - | 100% |
| PR bloquées/rejetées | - | 0 (conforme) |
| Temps correction | - | < 10 min |
| Adoption équipe | - | 100% |

---

## 🔄 Rollback Plan

En cas de problème critique :

### Désactiver la CI temporairement

```bash
# Renommer le workflow
mv .github/workflows/frontend-ci.yml .github/workflows/frontend-ci.yml.disabled

# Git commit & push
git add .github/workflows/
git commit -m "chore: Disable frontend CI (rollback)"
git push origin main
```

### Réactiver

```bash
# Renommer back
mv .github/workflows/frontend-ci.yml.disabled .github/workflows/frontend-ci.yml

# Git commit & push
git commit -m "chore: Re-enable frontend CI"
git push origin main
```

---

## 📋 Sign-Off

Deployment checklist complétée par :

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Architect | | | |
| DevOps | | | |
| Team Lead | | | |

---

## 📚 Documentation Créée

- ✅ `SPOFE-Frontend-Module-Contract.v1.md` — Contrat
- ✅ `ci/frontend-ci-enforcement.md` — Règles d'enforcement
- ✅ `ci/INTEGRATION_GUIDE.md` — Guide d'intégration
- ✅ `ci/MODULE_MANIFEST_TEMPLATE.md` — Template
- ✅ `ci/README.md` — Référence rapide
- ✅ `ci/INDEX.md` — Index complet
- ✅ `.github/workflows/frontend-ci.yml` — Pipeline GitHub Actions
- ✅ `ci/check-frontend-*.js` — Scripts de check (3 fichiers)

---

## 🎯 Next Steps

Après successful deployment :

1. **Week 1-2 :** Onboarding équipe
2. **Week 2-3 :** Premiers modules créés
3. **Week 3-4 :** Ajustements possibles (v1.0.1)
4. **Ongoing :** Monitoring et maintenance

---

**Version :** 1.0.0  
**Date :** 2026-01-30  
**Statut :** READY FOR DEPLOYMENT

🚀 **Ready to roll!**
