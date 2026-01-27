# 🚀 Quick Start - Tests E2E SPOFE

## 5 minutes pour commencer

### 1️⃣ Installation (1 min)

```bash
# Installer Playwright et navigateurs
npm install @playwright/test
npx playwright install --with-deps
```

### 2️⃣ Configuration (1 min)

```bash
# .env
BASE_URL=http://localhost:5173
API_URL=http://localhost:3001
NODE_ENV=test
```

### 3️⃣ Démarrer les services (1 min)

```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend

# Vérifier
curl http://localhost:3001/api/health
```

### 4️⃣ Exécuter tests (1 min)

```bash
# Tous les tests
npm run test:e2e

# UI interactive
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed
```

### 5️⃣ Voir les résultats (1 min)

```bash
# Rapport HTML
npm run test:e2e
# Puis ouvrir playwright-report/index.html
```

---

## Commandes essentielles

### Tests

```bash
npm run test:e2e                    # Tous
npm run test:e2e:ui                # Interactive UI
npm run test:e2e:headed            # Avec navigateur visible
npm run test:e2e:debug             # Debug mode
npm run test:e2e:chromium          # Chromium seul
npm run test:e2e:business-flows    # Flux métier
npm run test:e2e:performance       # Tests perf
npm run test:perf:report           # Perf + rapport
```

### Debug

```bash
# Pause à ce point
page.pause()

# Voir variables
page.evaluate(() => console.log(window.state))

# Trace mode
npx playwright test --trace on
```

---

## Structure des tests

```
e2e/
├── business-flows.spec.js      # Flux métier
├── performance.spec.js         # Tests perf
├── helpers/
│   ├── auth-helper.js          # Login/logout
│   └── business-helpers.js     # JournalEntry, Balance, Audit
```

---

## Premier test

### 1. Créer `e2e/my-test.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper.js';

test('Mon premier test E2E', async ({ page, context }) => {
  // Setup
  const auth = new AuthHelper(page, context);
  await auth.loginAPI();

  // Test
  await page.goto('/dashboard');
  
  // Assertion
  await expect(page).toHaveTitle(/Dashboard/);
});
```

### 2. Exécuter

```bash
npx playwright test e2e/my-test.spec.js
```

### 3. Voir résultats

```
my-test.spec.js ✓ [chromium] › Mon premier test E2E
```

---

## Tests métier communs

### Créer une écriture

```javascript
import { JournalEntryHelper } from './helpers/business-helpers.js';

test('Créer écriture', async ({ page }) => {
  const helper = new JournalEntryHelper(page);
  
  const entry = await helper.createEntry({
    journalCode: 'VE',
    description: 'Vente',
    lines: [
      { accountCode: '512000', debit: 5000, credit: 0 },
      { accountCode: '701000', debit: 0, credit: 5000 },
    ],
  });

  expect(entry.entryNumber).toMatch(/^VE-\d+$/);
});
```

### Valider et consulter balance

```javascript
test('Flux complet', async ({ page }) => {
  const entries = new JournalEntryHelper(page);
  const balance = new BalanceHelper(page);
  
  // 1. Créer
  const entry = await entries.createEntry({ /* ... */ });
  
  // 2. Valider
  await entries.validateEntry(entry.entryNumber);
  
  // 3. Balance
  const bal = await balance.generateBalance({ asOfDate: '2024-01-31' });
  expect(bal.isBalanced).toBe(true);
});
```

---

## Performance testing

### Mesurer une opération

```javascript
const start = Date.now();
await page.goto('/dashboard');
const duration = Date.now() - start;

console.log(`Chargement: ${duration}ms`);
expect(duration).toBeLessThan(3000);
```

### Tests prédéfinis

```bash
npm run test:e2e:performance    # Exécuter
npm run test:perf:report        # Avec rapport
```

---

## CI/CD

### GitHub Actions

Le pipeline `.github/workflows/e2e-tests.yml` exécute:
- ✅ Tests E2E (Chromium, Firefox, WebKit)
- ✅ Tests performance
- ✅ Smoke tests
- ✅ Génère rapports
- ✅ Notifie Slack

**Déclenché par**:
- Push sur main/develop
- Pull requests
- Chaque nuit (2h)
- Manuel (workflow_dispatch)

### Résultats

```
Artifacts:
├── playwright-report-chromium/
├── test-results-chromium/
└── performance-results.json
```

---

## Debugging

### Page se ferme trop vite?

```javascript
// Attendre avant assertions
await page.waitForLoadState('networkidle');
```

### Élément non trouvé?

```javascript
// Debug
await page.pause();  // Mode interactif

// Vérifier sélecteur
await page.locator('[data-testid="element"]').isVisible();
```

### API call fails?

```javascript
// Vérifier token
const token = await page.evaluate(() => localStorage.getItem('token'));
console.log('Token:', token);

// Headers
const headers = await auth.getAuthHeaders();
console.log('Headers:', headers);
```

---

## Ressources

- 📖 [E2E_TESTS_GUIDE.md](./E2E_TESTS_GUIDE.md) - Guide complet
- 🎬 [business-flows.spec.js](./e2e/business-flows.spec.js) - Exemples
- ⚡ [performance.spec.js](./e2e/performance.spec.js) - Tests perf
- 🛠️ [helpers/](./e2e/helpers/) - Helpers réutilisables

---

**Tips**:
- Utilisez `page.pause()` pour debug interactif
- Activez `--headed` pour voir le navigateur
- Consultez les traces en cas d'échec
- Logs: `DEBUG=pw:api npm run test:e2e`

**Version**: 1.0 | **Status**: ✅ Production Ready
