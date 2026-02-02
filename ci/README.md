# 🔒 SPOFE CI Scripts

Scripts d'enforcement du SPOFE Frontend Module Contract.

## 📋 Scripts disponibles

### 1. `check-frontend-structure.js`
Vérifie que chaque module frontend respecte l'arborescence exacte définie dans le contrat.

```bash
node ci/check-frontend-structure.js
```

**Contrôle :**
- ✅ Présence de `module.manifest.md`
- ✅ Présence de `index.ts`
- ✅ Présence du dossier `api/` avec `module.api.ts`
- ✅ Présence du dossier `ui/` avec `ModuleView.tsx` et `module.ui.ts`
- ✅ Présence du dossier `routes/` avec `module.routes.ts`
- ✅ Présence du dossier `hooks/` avec `useModuleUI.ts`
- ✅ Présence du dossier `tests/` avec `module.contract.spec.ts`

---

### 2. `check-frontend-manifest.js`
Vérifie que chaque module déclare ses contrats.

```bash
node ci/check-frontend-manifest.js
```

**Contrôle :**
- ✅ Déclaration de `contractVersion`
- ✅ Déclaration de `readModels`
- ✅ Déclaration de `commands`

---

### 3. `check-frontend-network.js`
Détecte et bloque **TOUT** contournement du Frontend Contract Enforcer.

```bash
node ci/check-frontend-network.js
```

**ZÉRO TOLÉRANCE pour :**
- ❌ `fetch()`
- ❌ `axios`
- ❌ `XMLHttpRequest`
- ❌ `window.fetch()`

---

## 📦 Package.json

Ajouter au `package.json` :

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

### Utilisation locale

```bash
# Tous les checks
npm run ci:frontend:all

# Check spécifique
npm run ci:frontend:structure
npm run ci:frontend:manifest
npm run ci:frontend:network
```

---

## 🔄 Pipeline CI automatique

Le workflow GitHub Actions exécute automatiquement tous les checks :

- **Fichier :** `.github/workflows/frontend-ci.yml`
- **Déclenchement :** Toute PR modifiant `frontend/**`
- **Bloquant :** Aucune PR ne peut être mergée sans passer tous les checks

---

## 📚 Documentation complète

Voir : [frontend-ci-enforcement.md](frontend-ci-enforcement.md)

---

## 🎯 Contrat de référence

Voir : [contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md](../contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md)

---

**Version :** 1.0.0  
**Date :** 2026-01-30  
**Statut :** ACTIVE
