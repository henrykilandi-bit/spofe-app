# GUIDE DU SYSTÈME DE GOUVERNANCE SPOFE

**Version:** 1.1.0  
**Statut:** OFFICIEL — Normatif (P0)  
**Autorité:** Gouvernance SPOFE  
**Date:** 2026-02-03

> **Ce document est le guide central du système de gouvernance SPOFE. Tout développeur, architecte ou responsable doit le consulter.**

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#1-introduction)
2. [Principes Fondamentaux](#2-principes-fondamentaux)
3. [Organisation des Modules](#3-organisation-des-modules)
4. [Documents Contractuels](#4-documents-contractuels)
5. [Processus de Validation](#5-processus-de-validation)
6. [BUILD_PROOF SPOFE](#6-build_proof-spofe)
7. [Tableau de Conformité](#7-tableau-de-conformité)
8. [Rollback Automatique](#8-rollback-automatique)
9. [Templates Officiels](#9-templates-officiels)
10. [Références](#10-références)

---

## 1. INTRODUCTION

### Qu'est-ce que SPOFE ?

**SPOFE** (Single Point Of Failure Elimination) est un framework architectural conçu pour garantir :

- ✅ **Qualité logicielle** via des contrats exécutables
- ✅ **Traçabilité** de toutes les décisions techniques
- ✅ **Automatisation** de la validation
- ✅ **Gouvernance** auto-applicative

### Objectif de ce guide

Ce guide regroupe **toutes les règles, templates et processus P0** nécessaires pour :
- Créer un module SPOFE conforme
- Valider un module avant production
- Comprendre la chaîne de gouvernance

---

## 2. PRINCIPES FONDAMENTAUX

### 🔒 Règles Non Négociables

| Règle | Description | Sanction |
|-------|-------------|----------|
| **Aucun statut manuel** | Tout statut est dérivé d'artefacts | Rejet de validation |
| **Aucune auto-déclaration** | Un module ne se déclare pas conforme | Rejet de validation |
| **BUILD_PROOF obligatoire** | Aucun déploiement sans BUILD_PROOF signé | Blocage CI/CD |
| **Guardian central** | Toute logique métier passe par le Guardian | Refus architecture |
| **Read-only API** | Les APIs sont uniquement GET | Refus conception |

### 🎯 Principe de Non-Substituabilité

> **Un rapport de diagnostic NE PEUT PAS être utilisé comme BUILD_PROOF SPOFE.**

- ❌ Interdit : Utiliser un fichier `.md` de diagnostic comme preuve
- ❌ Interdit : Présenter des "métriques" sans exécution contrôlée
- ✅ Autorisé : Utiliser les diagnostics pour investigation et debugging

---

## 3. ORGANISATION DES MODULES

### 📁 Emplacement Canonique

Tous les modules métier SPOFE **doivent** être situés dans :

```
cascade/modules/<module-name>/
```

**Aucun autre emplacement n'est autorisé.**

### 📦 Modules Existantes

| Module | Statut | Version |
|--------|--------|---------|
| Budget | ✅ Actif | v1.0.0 |
| Cost-Structure | ✅ Actif | v1.0.0 |
| Immobilisation | ✅ Golden Module | v1.0.0 |
| Stock | 🔄 En cours | - |
| Ventes | 📋 Planifié | - |
| Comptabilité | 📋 Planifié | - |
| RH | 📋 Planifié | - |

### 🚫 Interdictions

Les modules ne doivent **JAMAIS** être :
- ❌ Imbriqués les uns dans les autres
- ❌ Placés à la racine du projet
- ❌ Placés dans un dossier technique générique (`src/modules/`, `lib/`)

---

## 4. DOCUMENTS CONTRACTUELS

### 📜 Documents Obligatoires

Chaque module **doit** contenir :

| Document | Chemin | Objectif |
|----------|--------|----------|
| **SCOPE.md** | `contract/SCOPE.md` | Frontière contractuelle |
| **ARCHITECTURE.md** | `contract/ARCHITECTURE.md` | Architecture technique |
| **CONTRACT.md** | `contract/CONTRACT.md` | Contrat fonctionnel |
| **GUARDIAN.md** | `contract/GUARDIAN.md` | Invariants métier |
| **COMMANDS_EVENTS.md** | `contract/COMMANDS_EVENTS.md` | Commandes et événements |
| **READ_MODELS.md** | `contract/READ_MODELS.md` | Vues SQL |
| **API_READ_ONLY.md** | `contract/API_READ_ONLY.md` | Spécification API |
| **BUILD_PROOF.md** | `BUILD_PROOF.md` | Preuve de build |
| **BUILD_PROOF.sig** | `BUILD_PROOF.sig` | Signature cryptographique |

### 📋 Structure Arborescente

```
<module-name>/
├── contract/                     # 📜 Contrats normatifs
│   ├── CONTRACT.md
│   ├── SCOPE.md
│   ├── ARCHITECTURE.md
│   ├── GUARDIAN.md
│   ├── COMMANDS_EVENTS.md
│   ├── READ_MODELS.md
│   ├── API_READ_ONLY.md
│   └── <module>.openapi.json
│
├── src/                          # 🧠 Code contractuel
│   ├── api/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   └── sql/
│
├── tests/                        # 🧪 Tests contractuels
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── contract/
│
├── experimental/                 # ⚠️ Hors périmètre
│
├── BUILD_PROOF.md                # 🔐 Preuve de build
├── BUILD_PROOF.sig               # 🔏 Signature
├── tsconfig.module.json
├── package.json
└── README.md
```

---

## 5. PROCESSUS DE VALIDATION

### 🔄 Chaîne de Validation Officielle

```
Développement
     │
     ▼
Diagnostic (debugging) ───────┐
     │                         │
     ▼                         │
Correction des erreurs         │
     │                         │
     ▼                         │
BUILD_PROOF génération         │
     │                         │
     ▼                         │
Tests automatisés              │
     │                         │
     ▼                         │
Signature cryptographique ◄────┘
     │
     ▼
SPOFE Validation
     │
     ▼
GO PROD (si SUCCESS)
```

### ✅ Séquence Obligatoire

1. **Phase de développement** : Rapports de diagnostic autorisés
2. **Phase de stabilisation** : Correction des erreurs identifiées
3. **Phase de validation contractuelle** : **SEUL le BUILD_PROOF est opposable**
4. **Phase de production** : Déploiement uniquement si BUILD_PROOF = SUCCESS

### 🛠️ Outils de Validation

| Outil | Commande | Objectif |
|-------|----------|----------|
| **generate-build-proof** | `node tools/build-proof/generate-build-proof.ts` | Génère BUILD_PROOF |
| **sign-build-proof** | `node tools/build-proof/sign-build-proof.ts` | Signe cryptographiquement |
| **validate-module** | `node tools/validate-module/spofe-validate-module.ts` | Valide SPOFE |
| **generate-checklist** | `node tools/checklist/generate-checklist.ts` | Génère CHECKLIST_GO_PROD |
| **conformity-table** | `node tools/conformity/generate-conformity-table.ts` | Tableau de conformité |

---

## 6. BUILD_PROOF SPOFE

### 📄 Définition

Un BUILD_PROOF SPOFE valide **DOIT** :

1. ✅ **Être généré par exécution automatique**
   - Script reproductible : `generate-build-proof.ts`
   - Validation en temps réel des métriques
   - Tests exécutés et résultats vérifiés

2. ✅ **Contenir des preuves d'exécution**
   - Compilation TypeScript : 0 erreur
   - Tests unitaires : résultats Jest
   - Architecture SPOFE : vérification des couches
   - Configuration : validation des fichiers critiques

3. ✅ **Être daté et traçable**
   - Timestamp de génération
   - Version du module validé
   - Environnement d'exécution
   - Hash Git du commit validé

4. ✅ **Fournir un statut binaire**
   - 🟢 **SUCCESS** : Module prêt pour production
   - 🔴 **ERROR** : Blockers critiques détectés
   - 🟡 **WARNING** : Améliorations recommandées

5. ✅ **Être signé cryptographiquement**
   - Algorithme : Ed25519
   - Clé : `SPOFE_SIGNING_KEY` (GitHub Secrets)
   - Fichiers : `BUILD_PROOF.sig` + `BUILD_PROOF.sigmeta`

### ⚠️ Règle Absolue

> **Sans BUILD_PROOF signé : PAS DE GO PROD.**

---

## 7. TABLEAU DE CONFORMITÉ

### 📊 Finalité

Répondre objectivement à : **"Quels modules SPOFE sont réellement conformes ?"**

### 🎯 Statuts Officiels

| Statut | Signification | Icône |
|--------|---------------|-------|
| **CONFORM** | BUILD_PROOF signé et validé | 🟢 |
| **CONDITIONAL** | BUILD_PROOF signé avec P2/P3 | 🟡 |
| **NON_CONFORM** | BUILD_PROOF manquant | 🔴 |
| **ROLLED_BACK** | Release rejetée automatiquement | ❌ |

### 📋 Différences Clés

- **NON_CONFORM** = Pas de tentative de release (pas de tag)
- **ROLLED_BACK** = Tentative rejetée (tag supprimé, avec historique CI)

### 🔄 Régénération Automatique

Le tableau est régénéré :
- À chaque **release** (tag `*-v*.*.*`)
- Chaque **nuit** (cron 2h UTC)
- **Manuellement** (workflow dispatch)

### 📁 Fichiers

- **Machine** : `spofe/governance/MODULE_CONFORMITY_TABLE.json`
- **Humain** : `spofe/governance/MODULE_CONFORMITY_TABLE.md`

---

## 8. ROLLBACK AUTOMATIQUE

### 🔒 Principe

> **Aucune release invalide ne peut survivre dans l'historique actif du système.**

### 🎯 Ce qui est Rollbacké

| Élément | Action |
|---------|--------|
| **Tag de release** | Supprimé automatiquement |
| **Commit de preuve** | Conservé (traçabilité) |
| **Historique dev** | Jamais réécrit |

### 🚫 Comportements Interdits

- ❌ Pas de "release cassée tolérée"
- ❌ Pas de rollback manuel tardif
- ❌ Pas de dette de gouvernance

### ✅ Comportement Garanti

| Situation | Résultat |
|-----------|----------|
| BUILD_PROOF valide | ✅ Tag conservé |
| BUILD_PROOF invalide | ❌ Tag supprimé |
| CI interrompue | ❌ Tag supprimé |
| Signature absente | ❌ Tag supprimé |
| Checklist non conforme | ❌ Tag supprimé |

### 📊 Traçabilité

Toute release rollbackée apparaît dans le tableau de conformité avec :
- Statut : **ROLLED_BACK**
- Raison : BUILD_FAILURE / TEST_FAILURE / SIGNATURE_FAILURE / etc.
- CI Run : Lien vers le run GitHub Actions

---

## 9. TEMPLATES OFFICIELS

### 📋 Template Module SPOFE

**Fichier** : `spofe/governance/TEMPLATE_MODULE_SPOFE.md`

Contient :
1. Arborescence standard
2. CONTRACT.md template
3. SCOPE.md template
4. ARCHITECTURE.md template
5. GUARDIAN.md template
6. COMMANDS_EVENTS.md template
7. READ_MODELS.md template
8. API_READ_ONLY.md template
9. Tests template
10. BUILD_PROOF template
11. Checklist GO PROD

### 🛠️ Utilisation

```bash
# Étape 1 : Copier le Golden Module
cp -r cascade/modules/immobilisation cascade/modules/<nouveau-module>

# Étape 2 : Renommer
find <nouveau-module> -name "*immobilisation*" -exec rename 's/immobilisation/<nouveau-module>/' {} \;

# Étape 3 : Adapter le contenu métier

# Étape 4 : Générer BUILD_PROOF
node tools/build-proof/generate-build-proof.ts
node tools/build-proof/sign-build-proof.ts

# Étape 5 : Valider SPOFE
node tools/validate-module/spofe-validate-module.ts
```

---

## 10. RÉFÉRENCES

### 📁 Documents de Gouvernance

| Document | Chemin | Description |
|----------|--------|-------------|
| **Ce guide** | `spofe/governance/GUIDE_GOUVERNANCE_SPOFE.md` | Guide central (ce fichier) |
| **SPOFE Rules** | `spofe/governance/SPOFE_RULES.md` | Règles organisationnelles |
| **Template Module** | `spofe/governance/TEMPLATE_MODULE_SPOFE.md` | Template officiel module |
| **Rules Build Test** | `spofe/governance/RULES_BUILD_TEST.md` | Règles build et test |
| **Conformity Table JSON** | `spofe/governance/MODULE_CONFORMITY_TABLE.json` | Source machine |
| **Conformity Table MD** | `spofe/governance/MODULE_CONFORMITY_TABLE.md` | Version lisible |

### 🛠️ Outils SPOFE

| Outil | Chemin | Description |
|-------|--------|-------------|
| **generate-build-proof** | `spofe/tools/build-proof/generate-build-proof.ts` | Génère BUILD_PROOF |
| **sign-build-proof** | `spofe/tools/build-proof/sign-build-proof.ts` | Signe BUILD_PROOF |
| **validate-module** | `spofe/tools/validate-module/spofe-validate-module.ts` | Validation SPOFE |
| **generate-checklist** | `spofe/tools/checklist/generate-checklist.ts` | Génère checklist |
| **conformity-table** | `spofe/tools/conformity/generate-conformity-table.ts` | Tableau conformité |

### 🔗 Workflows CI/CD

| Workflow | Chemin | Description |
|----------|--------|-------------|
| **Release BUILD_PROOF** | `.github/workflows/release-build-proof.yml` | Release avec rollback |
| **Update Conformity Table** | `.github/workflows/update-conformity-table.yml` | Mise à jour auto tableau |

### 🏆 Golden Module

**Référence** : `cascade/modules/immobilisation/`

Le module Immobilisation est le **Golden Module** — la référence ultime pour tous les modules SPOFE.

---

## 📌 RÈGLE FINALE

> **Toute décision stratégique (déploiement, roadmap, audit) doit s'appuyer exclusivement sur le tableau global de conformité SPOFE.**

> **Toute release rollbackée par SPOFE doit apparaître explicitement dans le tableau global de conformité avec son motif et sa traçabilité CI.**

---

## 🏁 CONCLUSION

Ce guide centralise l'ensemble du système de gouvernance SPOFE :

- ✅ **Zéro ambiguïté** : Règles claires et non négociables
- ✅ **Automatisation** : Validation et rollback automatiques
- ✅ **Traçabilité** : Historique complet des succès et échecs
- ✅ **Opposabilité** : BUILD_PROOF comme seule preuve valide
- ✅ **Scalabilité** : Templates pour industrialiser

**SPOFE se gouverne lui-même.** 🔒

---

**Document officiel SPOFE — Non modifiable sans processus gouvernance**  
_Version 1.0.0 — Généré le 2026-02-02_
