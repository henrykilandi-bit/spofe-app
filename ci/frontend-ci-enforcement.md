# 🔒 SPOFE Frontend CI — Enforcement Guide

**Version :** 1.0.0  
**Date :** 2026-01-30  
**Statut :** ACTIVE

---

## 📌 Vue d'ensemble

La CI SPOFE Frontend applique **structurellement** le SPOFE Frontend Module Contract.

**Aucune exception humaine n'est possible.**

Chaque PR frontend doit passer **4 checks obligatoires** avant d'être mergée :

1. ✅ **Structure** — L'arborescence est conforme
2. ✅ **Manifest** — Les déclarations sont complètes
3. ✅ **Network** — Aucun contournement du FCE
4. ✅ **Tests** — Les tests contractuels passent

---

## 🏗️ Check 1 — Structure du module

**Fichier :** [`ci/check-frontend-structure.js`](ci/check-frontend-structure.js)

**Objectif :** Vérifier que chaque module respecte exactement l'arborescence définie.

### Règle

Chaque module frontend DOIT avoir exactement cette structure :

```
modules/
└─ <module-name>/
   ├─ module.manifest.md           ✅ REQUIS
   ├─ index.ts                      ✅ REQUIS
   ├─ api/module.api.ts            ✅ REQUIS
   ├─ ui/ModuleView.tsx            ✅ REQUIS
   ├─ ui/module.ui.ts              ✅ REQUIS
   ├─ routes/module.routes.ts      ✅ REQUIS
   ├─ hooks/useModuleUI.ts         ✅ REQUIS
   └─ tests/module.contract.spec.ts ✅ REQUIS
```

### Violation détectée

```
❌ [STRUCTURE] budgeting missing tests/module.contract.spec.ts
```

### Action sur CI

```
❌ STRUCTURE CHECK FAILED
```

**La PR est bloquée.**

---

## 📋 Check 2 — Manifest declarations

**Fichier :** [`ci/check-frontend-manifest.js`](ci/check-frontend-manifest.js)

**Objectif :** Vérifier que chaque module déclare ses contrats.

### Règle

Chaque `module.manifest.md` DOIT déclarer :

1. **contractVersion** — Version du SPOFE Frontend Module Contract
2. **readModels** — Read-models SPOFE consommées
3. **commands** — Commands SPOFE émises

### Exemple conforme

```yaml
module: budgeting
contractVersion: 1.0.0

readModels:
  - /read/aggregates/active
  - /read/aggregates/balance

commands:
  - CreateAggregate
  - CloseAggregate
  - UpdateBalance
```

### Violation détectée

```
❌ [MANIFEST] budgeting missing contractVersion
```

### Action sur CI

```
❌ MANIFEST CHECK FAILED
   Each module MUST declare:
   - contractVersion
   - readModels
   - commands
```

**La PR est bloquée.**

---

## 🚫 Check 3 — Network Access Control

**Fichier :** [`ci/check-frontend-network.js`](ci/check-frontend-network.js)

**Objectif :** Détecter et bloquer **TOUT** appel réseau qui contourne le FCE.

### Règle

**ZÉRO TOLÉRANCE :**

❌ `fetch()`  
❌ `axios`  
❌ `XMLHttpRequest`  
❌ `window.fetch()`  

**Tous les appels réseau DOIVENT passer par le Frontend Contract Enforcer.**

### Violation détectée

```
❌ [NETWORK VIOLATION] fetch()
   File: modules/budgeting/api/module.api.ts
   Line: 42
   Code: const response = await fetch('/api/aggregates');
   Reason: Direct HTTP calls are forbidden.
           Use Frontend Contract Enforcer.
```

### Action sur CI

```
❌ NETWORK ACCESS CONTROL CHECK FAILED
   Modules MUST NOT make direct HTTP calls.
   
   All network communication MUST go through:
   📍 Frontend Contract Enforcer (FCE)
   
   Example (CORRECT):
     import { sendCommand } from "@/core/spofe-contract";
     await sendCommand("CreateAggregate", { ... });
```

**La PR est bloquée immédiatement.**

---

## 🧪 Check 4 — Contractual Tests

**Objectif :** Exécuter les tests contractuels de chaque module.

### Règle

Chaque module DOIT avoir `tests/module.contract.spec.ts` et passer les tests.

### Exemple de test obligatoire

```typescript
// tests/module.contract.spec.ts

import { describe, it, expect } from 'vitest';
import { sendCommand } from '@/core/spofe-contract';

describe('Budgeting Module Contract', () => {
  
  // Test 1: Une Command non déclarée est refusée
  it('refuses undeclared command', async () => {
    await expect(
      sendCommand('HACK_SYSTEM', {})
    ).rejects.toThrow();
  });

  // Test 2: Un endpoint non contractuel est refusé
  it('refuses undeclared read-model', async () => {
    await expect(
      getReadModel('/private/internal/admin')
    ).rejects.toThrow();
  });

  // Test 3: Le module échoue sans le contrat
  it('fails without contract bootstrap', async () => {
    // ... test que le module ne peut pas fonctionner sans contrat
  });

});
```

### Violation détectée

```
❌ Test Failed: refuses undeclared command
```

### Action sur CI

```
❌ FRONTEND TESTS FAILED
```

**La PR est bloquée.**

---

## 🔄 Pipeline CI complet

**Fichier :** [`.github/workflows/frontend-ci.yml`](.github/workflows/frontend-ci.yml)

Le pipeline s'exécute sur :
- **Événement :** Pull request sur `frontend/**`
- **Environnement :** Ubuntu latest, Node.js 20
- **Steps séquentiels (bloquants) :**

```yaml
1️⃣ Checkout
   ↓
2️⃣ Setup Node.js
   ↓
3️⃣ Install npm dependencies
   ↓
4️⃣ Check module structure      ← Si échec : BLOC
   ↓
5️⃣ Check manifests             ← Si échec : BLOC
   ↓
6️⃣ Check network access        ← Si échec : BLOC (ZÉRO TOLÉRANCE)
   ↓
7️⃣ Run contractual tests       ← Si échec : BLOC
   ↓
✅ PASS (PR peut être mergée)
```

### Une seule erreur = PR bloquée

Si **n'importe quel check** échoue :

```
❌ Frontend SPOFE Contract Compliance: FAILED

One or more contract checks failed.
This PR cannot be merged until all checks pass.

Reference:
  📍 contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md
```

---

## 🎯 Gouvernance structurelle

### ✅ Avant (sans CI)
- ❌ Module non conforme accepté
- ❌ Contournement du FCE possible
- ❌ Manifest incomplet accepté
- ❌ Pas de tests contractuels

### ✅ Après (avec CI)
- ✅ **Impossible** d'ajouter un module non conforme
- ✅ **Impossible** de contourner le FCE
- ✅ **Impossible** d'oublier le manifest
- ✅ **Impossible** de tricher "temporairement"
- ✅ La gouvernance est **structurelle**, pas sociale
- ✅ La CI est l'**exécuteur automatique** du contrat

---

## 📍 Fichiers créés

```
.github/
└─ workflows/
   └─ frontend-ci.yml             ← Pipeline GitHub Actions

ci/
├─ check-frontend-structure.js    ← Check arborescence
├─ check-frontend-manifest.js     ← Check manifests
└─ check-frontend-network.js      ← Check réseau (ZÉRO TOLÉRANCE)
```

---

## 🚀 Intégration dans votre repo

### 1. Copier les scripts CI

```bash
mkdir -p ci
cp ci/check-frontend-*.js ci/
```

### 2. Copier le workflow GitHub Actions

```bash
mkdir -p .github/workflows
cp .github/workflows/frontend-ci.yml .github/workflows/
```

### 3. Ajouter à `package.json`

```json
{
  "scripts": {
    "ci:frontend:structure": "node ci/check-frontend-structure.js",
    "ci:frontend:manifest": "node ci/check-frontend-manifest.js",
    "ci:frontend:network": "node ci/check-frontend-network.js",
    "ci:frontend:all": "npm run ci:frontend:structure && npm run ci:frontend:manifest && npm run ci:frontend:network"
  }
}
```

### 4. Tester localement

```bash
npm run ci:frontend:all
```

---

## 📚 Référence documentaire

| Document | Rôle |
|----------|------|
| [SPOFE-Frontend-Module-Contract.v1.md](contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md) | Contrat normatif |
| **frontend-ci-enforcement.md** (ce fichier) | Guide d'application CI |
| [.github/workflows/frontend-ci.yml](.github/workflows/frontend-ci.yml) | Pipeline d'exécution |

---

## ✅ Validation

Tous les checks sont :

- ✅ **Indépendants** (peuvent s'exécuter en parallèle)
- ✅ **Lisibles** (messages clairs)
- ✅ **Opposables** (zéro ambiguïté)
- ✅ **Documentés** (chaque check explique sa règle)
- ✅ **Bloquants** (aucune exception possible)

---

## 🔐 Garantie

Avec cette CI en place :

```
Aucune PR frontend non conforme ne peut être mergée.
```

**Signé : Gouvernance SPOFE**

---

**Date :** 2026-01-30  
**Version :** 1.0.0  
**Statut :** ACTIVE
