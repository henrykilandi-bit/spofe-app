# 📘 Workflow Officiel - Création Module Frontend SPOFE

**Version**: 1.0.0 | **Statut**: NORMATIF | **Date**: 30 janvier 2026

---

## 🎯 Pré-requis

- ✅ SPOFE Kernel actif
- ✅ Frontend Contract Enforcer (FCE) actif
- ✅ CI contractuelle active
- ✅ Template `frontend-module-spofe-clean` disponible

---

## 0️⃣ Principe Fondamental

> **Aucun module frontend ne peut être créé manuellement.**

Toute tentative hors workflow = ❌ Rejet CI + PR refusée

---

## 1️⃣ Quand Créer un Module ?

Uniquement si :
- ✅ Module backend existe
- ✅ Read-models exposés
- ✅ Commands déclarées
- ✅ Besoin UX identifié

**Pas de backend → Pas de frontend**

---

## 2️⃣ Étape 1 — Cloner Template

```bash
cp -r templates/frontend-module-spofe-clean frontend/modules/<module-name>
```

🚫 Interdit: création manuelle, copie ancien module

---

## 3️⃣ Étape 2 — Déclarer Module

Fichier `module.manifest.md` obligatoire:

```yaml
module: budgeting
description: Budget management

contract:
  frontendModuleContract: 1.0.0
  frontendBackendContract: 1.0.0

readModels:
  - /read/budgets/active

commands:
  - CreateBudget
  - CloseBudget

owner: finance-team
status: ACTIVE
```

---

## 4️⃣ Étape 3 — Implémenter

### api/module.api.ts
```typescript
import { readModel, sendCommand } from '@/core/spofe-contract';

export const loadBudgets = () => readModel('/read/budgets/active');
export const closeBudget = (id: string) => sendCommand('CloseBudget', { budgetId: id });
```

🚫 Interdit: fetch, axios, logique métier

### ui/ — UI pure uniquement
### hooks/ — État UI seulement
### routes/ — Mapping 1:1 vue ↔ route

---

## 5️⃣ Étape 4 — Tests Contractuels

```typescript
test('rejects undeclared command', async () => {
  await expect(sendCommand('HACK', {})).rejects.toThrow();
});
```

Sans tests → CI FAIL

---

## 6️⃣ Étape 5 — Vérification Locale

```bash
npm run ci:frontend:all
```

Vérifie: structure, manifest, template origin, tests

---

## 7️⃣ Étape 6 — Pull Request

Critères:
- ✅ Template officiel
- ✅ Manifest complet
- ✅ CI 100% verte
- ✅ Tests passent

🚫 Aucune exception

---

## 8️⃣ Rejets CI Automatiques

- Module sans template
- Sans manifest
- Command non déclarée
- fetch/axios direct
- Logique métier frontend
- Tests absents

---

## 9️⃣ Responsabilités

**Dev**: Respecte template + contrat
**Reviewer**: Vérifie conformité
**CI**: Arbitre final, aucun override

---

## 🔒 Règle Finale

**Le frontend ne décide rien. Il déclenche. Il affiche. Il respecte.**

---

**Créer un module = acte industriel, pas artisanal**
