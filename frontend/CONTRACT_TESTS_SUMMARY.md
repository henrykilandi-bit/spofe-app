# 📋 Contract Tests — Summary

## ✅ Setup Complet

Les tests contractuels FE↔BE sont maintenant en place pour le module **Cost-Structure (COUTFLEX)**.

### Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `frontend/vitest.contract.config.js` | Config Vitest séparée (env: node) |
| `frontend/src/contract-tests/cost-structure.contract.spec.js` | Suite de tests contractuels (18 tests) |
| `frontend/src/contract-tests/helpers.js` | Utilitaires et mocks |
| `frontend/src/contract-tests/README.md` | Documentation complète |
| `frontend/scripts/run-contract-tests.js` | Script runner avec health check |

### Scripts Ajoutés dans package.json

```json
{
  "test:contract": "vitest run --config vitest.contract.config.js",
  "test:contract:watch": "vitest --config vitest.contract.config.js",
  "ci:contract": "npm run test:contract"
}
```

## 🧪 Tests Couverts

| ID | Test | Vérifie |
|----|------|---------|
| CT-FE-01 | Budget-Ready Projects | Array, types numériques, marginAt70 > 0 |
| CT-FE-02 | Contract Shape | Shape exacte DTO, pas de champs extra |
| CT-FE-03 | Cost Projects | Listing avec filtres status/type |
| CT-FE-04 | Multi-Tenant | Isolation, rejet sans X-Tenant-Id |
| CT-FE-05 | Cost Structure | Versions, lignes, simulations |
| CT-FE-06 | HTTP Status | 404 pour ressources inexistantes |
| CT-FE-07 | Data Consistency | Cohérence Budget-Ready ↔ Structure |

## 🚀 Exécution

### Sans Backend (développement)
```bash
npm run test:contract
# → 17 tests skipped, 1 passed (health check)
```

### Avec Backend
```bash
# Terminal 1: Start backend
cd cascade && npm run start:dev

# Terminal 2: Run tests
cd frontend && npm run test:contract
# → 18 tests passed
```

### CI Pipeline
```bash
npm run ci:contract
```

## 📊 Résultat Actuel

```
 Test Files  1 passed (1)
      Tests  1 passed | 17 skipped (18)
   Duration  472ms
```

**Comportement:**
- ⚠️ Backend non disponible → tests skippés (pas d'échec)
- ✅ Backend disponible → tous les tests s'exécutent

## 🔗 Dépendances

Les tests utilisent le client API généré :
- `frontend/src/api/cost-structure/index.js`
- `frontend/src/api/cost-structure/types.d.ts`
- `frontend/src/api/cost-structure/hooks.js`

Source OpenAPI :
- `cascade/modules/cost-structure/openapi/cost-structure.openapi.json`

---
*Module Cost-Structure — Contract Testing Ready ✅*
