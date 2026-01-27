# 🧪 SOLUTION #2: Migration Jest → Vitest

## 🎯 Objectif

Remplacer Jest par Vitest pour résoudre les problèmes de compatibilité avec ES Modules et bénéficier de performances 10x supérieures.

## ⚠️ PROBLÈME RÉSOLU

**#2 - Tests Jest/ES Modules fail (Sévérité BAS)**

Actuellement:
```bash
npm run test:unit
# ❌ Error: jest is not defined
# ❌ ES Modules transform errors
```

## ✅ SOLUTION

**Vitest** = Test runner moderne:
- ✅ ESM natif (pas de transform)
- ✅ Compatible Vite config
- ✅ 10x plus rapide que Jest
- ✅ API identique à Jest (describe, it, expect)
- ✅ Hot Module Reload pour tests
- ✅ Coverage intégré (v8)

## 📁 FICHIERS CRÉÉS

```
02-VITEST/
├── README.md (ce fichier)
├── vitest.config.js    → Configuration Vitest
├── setup.js            → Mocks globaux Sequelize
├── package.json.diff   → Changements npm scripts
└── migration-guide.md  → Guide de migration tests existants
```

## 🔧 FICHIERS MODIFIÉS

1. **`cascade/vitest.config.js`** - Nouvelle config (crée)
2. **`cascade/tests/setup.js`** - Setup file (remplace ancien)
3. **`cascade/package.json`** - Scripts et dépendances

## 📝 INSTRUCTIONS D'ACTIVATION

### Étape 1: Installer Vitest

```bash
cd cascade
npm install -D vitest @vitest/coverage-v8
```

### Étape 2: Copier les fichiers

```bash
# Depuis PROPOSED_CHANGES/02-VITEST/
cp vitest.config.js ../cascade/
cp setup.js ../cascade/tests/
```

### Étape 3: Modifier package.json

Remplacer les scripts de test:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Étape 4: (Optionnel) Supprimer Jest

```bash
npm uninstall jest @types/jest babel-jest
rm jest.config.js
```

### Étape 5: Exécuter les tests

```bash
npm run test
```

**Résultat attendu:**
```
 ✓ tests/auth.controller.test.js (3)
   ✓ POST /api/auth/register
   ✓ POST /api/auth/login
   ✓ Validation errors

Test Files  1 passed (1)
Tests  3 passed (3)
```

## 🧪 TESTS DE VALIDATION

```bash
# 1. Tests en mode watch (auto re-run)
npm run test

# 2. Tests une fois (CI mode)
npm run test:run

# 3. Coverage report
npm run test:coverage
# Ouvrir: cascade/coverage/index.html

# 4. UI interactive (optionnel)
npm run test:ui
# Ouvre navigateur avec UI graphique
```

## 🔄 MIGRATION DES TESTS EXISTANTS

Les tests Jest existants fonctionnent **sans modification** avec Vitest!

**API identique:**
```javascript
// ✅ Compatible Jest & Vitest
describe('Auth Controller', () => {
  it('should register user', async () => {
    expect(result).toBeDefined();
  });
});
```

**Mocks identiques:**
```javascript
// ✅ Compatible
import { vi } from 'vitest';  // Au lieu de 'jest'

vi.mock('../src/models/user.model.js');
vi.fn().mockResolvedValue(data);
```

Voir `migration-guide.md` pour détails.

## ⚠️ RISQUES

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **Tests incompatibles** | 🟢 Faible | API Vitest = Jest compatible |
| **Dépendances manquantes** | 🟢 Faible | npm install avant |
| **CI/CD à modifier** | 🟡 Moyen | Voir section CI/CD |

## 🔙 ROLLBACK

Si problème après activation:

```bash
cd cascade
npm install -D jest @types/jest babel-jest
npm uninstall vitest @vitest/coverage-v8
rm vitest.config.js
# Restaurer ancien jest.config.js
npm run test
```

## 🚀 CI/CD GITHUB ACTIONS

Si tu utilises GitHub Actions (voir PROPOSED_CHANGES/08-CI-CD/):

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: cd cascade && npm run test:run  # Au lieu de 'jest'
```

## 📊 COMPARAISON JEST VS VITEST

| Fonctionnalité | Jest | Vitest |
|----------------|------|--------|
| **ES Modules** | ❌ Nécessite transform | ✅ Natif |
| **Vitesse** | 🐢 Lent | ⚡ 10x plus rapide |
| **HMR** | ❌ Non | ✅ Oui |
| **Coverage** | ✅ Istanbul | ✅ v8 (plus précis) |
| **UI** | ❌ Non | ✅ --ui flag |
| **Vite intégration** | ❌ | ✅ Parfaite |

## 🎯 PRIORITÉ

**🔴 URGENT** - Débloque complètement les tests backend

## ⏱️ TEMPS D'IMPLÉMENTATION

- Installation: 2 min
- Copie fichiers: 1 min
- Modification package.json: 2 min
- Tests validation: 5 min

**Total: ~10 minutes**

## ✅ CHECKLIST D'ACTIVATION

- [ ] Vitest installé (`npm install -D vitest @vitest/coverage-v8`)
- [ ] `vitest.config.js` copié à la racine cascade/
- [ ] `tests/setup.js` copié
- [ ] Scripts npm modifiés dans package.json
- [ ] `npm run test` exécute sans erreur
- [ ] Coverage généré (`npm run test:coverage`)
- [ ] (Optionnel) Jest désinstallé

## 🔗 RESSOURCES

- Documentation Vitest: https://vitest.dev
- Migration Guide Jest→Vitest: https://vitest.dev/guide/migration.html
- Voir `migration-guide.md` dans ce dossier

## 📖 RÉFÉRENCE

Voir [ANALYSE_SOLUTIONS_PROPOSEES.md](../../ANALYSE_SOLUTIONS_PROPOSEES.md) section "Solution #3"
