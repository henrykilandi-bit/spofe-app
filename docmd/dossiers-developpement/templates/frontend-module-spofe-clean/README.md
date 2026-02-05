# 📦 Frontend Module SPOFE-clean — Template

**Statut:** CANONIQUE (official template)  
**Version:** 1.0.0  
**Date:** 2026-01-30

---

## 🎯 C'est quoi ?

Ce template est le **seul point de départ autorisé** pour créer un module frontend SPOFE-clean.

- ✅ Conforme au SPOFE Frontend Module Contract v1.0.0
- ✅ Conforme au Frontend–Backend Contract v1.0.0
- ✅ Compatible avec la CI/CD
- ✅ Zéro-debt extensible

**👉 Tout nouveau module DOIT être créé à partir de ce template.**

---

## 📂 Arborescence (stricte)

```
frontend-module-spofe-clean/
├─ module.manifest.md         ← OBLIGATOIRE: Déclaration du contrat
├─ index.ts                   ← OBLIGATOIRE: Point d'entrée du module
│
├─ api/
│  └─ module.api.ts           ← OBLIGATOIRE: Appels FCE uniquement
│
├─ ui/
│  ├─ ModuleView.tsx          ← OBLIGATOIRE: Composant UI pur
│  └─ module.ui.ts            ← OBLIGATOIRE: Orchestration UI
│
├─ routes/
│  └─ module.routes.ts        ← OBLIGATOIRE: Routes = vues (1:1)
│
├─ hooks/
│  └─ useModuleUI.ts          ← OBLIGATOIRE: État UI local seulement
│
└─ tests/
   └─ module.contract.spec.ts ← OBLIGATOIRE: Tests contractuels
```

### ❌ Variations non autorisées

- ❌ Fichiers supplémentaires (utils, helpers, constants...)
- ❌ Dossiers supplémentaires
- ❌ Logique métier quelconque
- ❌ Appels directs à une API

---

## 🚀 Comment utiliser ce template

### Étape 1: Cloner le template

```bash
# Cloner le template depuis /templates
cp -r templates/frontend-module-spofe-clean \
      frontend/modules/<module-name>

# Ou si vous préférez:
cp -r templates/frontend-module-spofe-clean \
      frontend/modules/budgeting
```

### Étape 2: Adapter module.manifest.md

```yaml
module: budgeting                          # ← Votre nom de module
description: Budget management module      # ← Description

contract:
  frontendModuleContract: 1.0.0
  frontendBackendContract: 1.0.0

readModels:
  - /read/aggregates/active               # ← Vos read-models
  - /read/aggregates/balance

commands:
  - CreateAggregate                        # ← Vos commands
  - CloseAggregate

owner: "@budgeting-team"
status: ACTIVE
```

### Étape 3: Implémenter les fichiers

Chaque fichier du template contient :
- ✅ Commentaires explicatifs
- ✅ Exemples
- ✅ Règles strictes (ce qu'on peut/ne peut pas faire)
- ✅ Références au contrat

**Remplacez les `<example>` par vos valeurs réelles.**

### Étape 4: Tester localement

```bash
npm run ci:frontend:all
```

Doit afficher :
```
✅ Structure check PASSED
✅ Manifest check PASSED
✅ Network access control PASSED
✅ Tests PASSED
```

### Étape 5: Créer une PR

Tout module conforme peut être mergé immédiatement.

---

## 📋 Structure des fichiers

### `module.manifest.md` (OBLIGATOIRE)

Déclare :
- ✅ La version du contrat
- ✅ Les read-models consommés
- ✅ Les commands émises
- ✅ Les invariants Guardian (informatif)
- ✅ Le propriétaire du module

**Sans ce fichier : CI FAIL**

---

### `index.ts` (point d'entrée)

```typescript
export function registerModule() {
  registerRoutes();
}
```

- ✅ Exporte `registerModule()`
- ❌ Aucune logique métier
- ❌ Aucun appel API

---

### `api/module.api.ts` (UNIQUEMENT FCE)

```typescript
import { readModel, sendCommand } from '@/core/spofe-contract';

export async function fetchData() {
  return readModel('/read/<example>');
}

export async function triggerAction(payload) {
  return sendCommand('<ExampleCommand>', payload);
}
```

- ✅ Utilise UNIQUEMENT le FCE
- ❌ PAS de fetch / axios / XMLHttpRequest
- ❌ PAS de calculs
- ❌ PAS de mapping métier

**Violation détectée par CI (check network access control)**

---

### `ui/ModuleView.tsx` (composant pur)

```typescript
export function ModuleView({ data, onAction, isLoading, error }) {
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={onAction} disabled={isLoading}>
        Action
      </button>
    </div>
  );
}
```

- ✅ Affiche les données
- ✅ Props-driven
- ❌ PAS de logique métier
- ❌ PAS de décisions
- ❌ PAS de calculs

---

### `ui/module.ui.ts` (orchestration)

```typescript
export async function loadModuleData() {
  return fetchData();
}

export async function handleUserAction(payload) {
  return triggerAction(payload);
}
```

- ✅ Appelle les API
- ✅ Passe les données au composant
- ❌ PAS de logique métier
- ❌ PAS de transformation
- ❌ PAS de validation

---

### `routes/module.routes.ts` (routes = vues)

```typescript
export function registerRoutes() {
  registerRoute('/modules/<module-name>', moduleMainView);
}

async function moduleMainView() {
  const data = await loadModuleData();
  return ModuleView({
    data,
    onAction: handleUserAction
  });
}
```

- ✅ Routes = vues (1:1)
- ✅ Charge données et affiche
- ❌ PAS de logique métier
- ❌ PAS de routing conditionnel métier
- ❌ PAS de redirection basée sur données

---

### `hooks/useModuleUI.ts` (état UI local)

```typescript
export function useModuleUI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return { loading, error, setLoading, setError };
}
```

- ✅ Gère l'état UI (loading, error, pagination)
- ❌ PAS d'état métier
- ❌ PAS de données en cache
- ❌ PAS de logique calculs

---

### `tests/module.contract.spec.ts` (tests contractuels)

```typescript
it('refuses undeclared command', async () => {
  await expect(
    sendCommand('UNDECLARED', {})
  ).rejects.toThrow();
});

it('allows declared command', async () => {
  expect(() =>
    sendCommand('<DeclaredCommand>', {})
  ).not.toThrow();
});
```

- ✅ Teste le respect du contrat
- ✅ Teste que FCE fonctionne
- ❌ PAS de tests métier
- ❌ PAS de tests UI
- ❌ PAS de tests logique

**Obligatoire en CI**

---

## ✅ Checklist avant soumission

- [ ] `module.manifest.md` complété et valide
- [ ] `contractVersion` = 1.0.0
- [ ] `readModels` listés (du manifest)
- [ ] `commands` listés (du manifest)
- [ ] Aucun fichier supplémentaire
- [ ] Aucun appel `fetch()` / `axios` / `XMLHttpRequest`
- [ ] Tous les appels passent par le FCE
- [ ] `tests/module.contract.spec.ts` existe et passe
- [ ] `npm run ci:frontend:all` passe tous les checks
- [ ] Aucune logique métier au frontend

---

## 🔗 Références

| Document | Contenu |
|----------|---------|
| [SPOFE-Frontend-Module-Contract.v1.md](../../contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md) | Contrat officiel |
| [ci/MODULE_MANIFEST_TEMPLATE.md](../../ci/MODULE_MANIFEST_TEMPLATE.md) | Template manifest (plus détaillé) |
| [ci/frontend-ci-enforcement.md](../../ci/frontend-ci-enforcement.md) | Règles de la CI |

---

## ❌ Erreurs courantes

### ❌ "Je mets des fichiers supplémentaires"
**→** Non autorisé. La structure est stricte. Utilisez les fichiers existants.

### ❌ "Je fais des calculs dans les hooks"
**→** Non autorisé. Les hooks gèrent l'état UI seulement.

### ❌ "J'appelle fetch() directement"
**→** Non autorisé. Bloqué par la CI. Utilisez le FCE.

### ❌ "Je mets de la logique métier au frontend"
**→** Non autorisé. Le backend est l'autorité. Frontend = passive display.

### ❌ "Je crée un module sans copier le template"
**→** Non autorisé. TOUS les modules doivent partir de ce template.

---

## ✨ Avantages du template

- ✅ Structure garantit la qualité
- ✅ Commentaires guident le développement
- ✅ Contrat est enforcé en CI
- ✅ Pas de surprise en review
- ✅ Équipe productive du jour 1
- ✅ Zéro violation d'architecture possible

---

## 📌 Important

```
⚠️  Ce template définit la STRUCTURE d'un module.
⚠️  Chaque fichier a un rôle STRICT.
⚠️  Aucune déviation n'est tolérée.
⚠️  La CI bloque tout ce qui ne respecte pas ce template.
⚠️  C'est intentionnel et c'est voulu.
```

👉 **C'est le prix pour garantir 100% de conformité.**

---

**Statut:** CANONIQUE  
**Version:** 1.0.0  
**Date:** 2026-01-30  
**Objet:** Template officiel pour tous les modules frontend
