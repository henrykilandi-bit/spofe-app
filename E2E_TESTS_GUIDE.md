# 🧪 Guide Complet des Tests E2E SPOFE

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Écriture de tests](#écriture-de-tests)
5. [Tests métier](#tests-métier)
6. [Tests de performance](#tests-de-performance)
7. [Intégration CI/CD](#intégration-cicd)
8. [Dépannage](#dépannage)

---

## Vue d'ensemble

SPOFE utilise **Playwright** pour les tests E2E automatisés couvrant:

- ✅ **Flux métier complets** - Création écriture → balance → audit
- ✅ **Performance** - Mesure des temps de réponse critiques
- ✅ **Multi-navigateurs** - Chromium, Firefox, WebKit
- ✅ **CI/CD intégrée** - Exécution automatique via GitHub Actions
- ✅ **Rapports interactifs** - HTML, JSON, JUnit, Allure

### Bénéfices

- 🚀 **Couverture élevée** - Scenario complets validés automatiquement
- 🔍 **Détection précoce** - Bugs détectés avant production
- 📊 **Performance tracking** - Monitoring continu des thresholds
- 🛡️ **Régression** - Prévention des régressions

---

## Architecture

### Structure des fichiers

```
e2e/
├── helpers/
│   ├── auth-helper.js          # Authentification & login
│   └── business-helpers.js     # Helpers métier (JournalEntry, Balance, Audit)
├── business-flows.spec.js      # Tests flux complets
├── performance.spec.js         # Tests de performance
├── auth.spec.js                # Tests d'authentification
├── chart-of-accounts.spec.js   # Tests plan comptable
├── journal-entries.spec.js     # Tests écritures
├── reports.spec.js             # Tests rapports
├── fixtures.js                 # Fixtures partagées
└── third-parties.spec.js       # Tests tiers

scripts/
├── parse-performance.js        # Parser résultats performance
└── generate-test-summary.js    # Générateur rapport HTML

.github/workflows/
└── e2e-tests.yml               # Pipeline GitHub Actions
```

### Flux d'exécution

```
┌─────────────────────────────────────┐
│  Développeur/Trigger CI             │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Setup Node   │
        │ Install deps │
        └──────┬───────┘
               │
               ▼
        ┌──────────────────────────────┐
        │ Démarrer services (Backend   │
        │ + Frontend + Base de données)│
        └──────┬───────────────────────┘
               │
        ┌──────┴────────┬─────────────┬──────────┐
        │               │             │          │
        ▼               ▼             ▼          ▼
    ┌────────┐   ┌──────────┐   ┌────────┐  ┌──────┐
    │Chromium│   │ Firefox  │   │WebKit  │  │Perf  │
    │Tests   │   │  Tests   │   │ Tests  │  │Tests │
    └────┬───┘   └─────┬────┘   └───┬────┘  └──┬───┘
         │             │            │         │
         └─────────────┴────────────┴─────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Collect Results        │
         │ - JUnit XML            │
         │ - HTML Report          │
         │ - Performance JSON     │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │ Generate Summary       │
         │ - Push to Pages        │
         │ - Slack notification   │
         └────────────────────────┘
```

---

## Configuration

### playwright.config.js

Configuration globale actualisée:

```javascript
// Timeouts
timeout: 60000           // 60s par test
expect: { timeout: 10000 } // 10s pour assertions

// Parallélisation
fullyParallel: true
workers: 4              // Localement
workers: 1              // En CI

// Reporters
['html', 'json', 'junit', 'list']

// Locale & Timezone
locale: 'fr-FR'
timezoneId: 'Europe/Paris'

// Projects
projects: ['chromium', 'firefox', 'webkit', 'performance', 'smoke']
```

### Variables d'environnement

```bash
# .env
BASE_URL=http://localhost:5173
API_URL=http://localhost:3001
NODE_ENV=test
CI=true/false
```

### Installation Playwright

```bash
# Installation globale
npm install @playwright/test

# Installer navigateurs
npx playwright install

# Avec dépendances système
npx playwright install --with-deps
```

---

## Écriture de tests

### Structure basique

```javascript
import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper.js';

test.describe('Fonctionnalité', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setup
    const auth = new AuthHelper(page, context);
    await auth.loginAPI();
  });

  test('Cas de test', async ({ page }) => {
    // Arrange
    await page.goto('/page');
    
    // Act
    await page.click('[data-testid="button"]');
    
    // Assert
    await expect(page).toHaveTitle('Expected');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
  });
});
```

### Helpers disponibles

#### AuthHelper

```javascript
// Login UI
await auth.login('username', 'password');

// Login API (rapide)
await auth.loginAPI('username', 'password');

// Logout
await auth.logout();

// Vérifier authentification
const isAuth = await auth.isAuthenticated();

// Headers API
const headers = await auth.getAuthHeaders();
```

#### JournalEntryHelper

```javascript
// Créer écriture
const entry = await entryHelper.createEntry({
  journalCode: 'VE',
  date: '2024-01-15',
  description: 'Vente marchandise',
  lines: [
    { accountCode: '512000', debit: 5000, credit: 0 },
    { accountCode: '701000', debit: 0, credit: 5000 },
  ],
});

// Valider
await entryHelper.validateEntry(entry.entryNumber);

// Récupérer détails
const details = await entryHelper.getEntryDetails(entryNumber);
```

#### BalanceHelper

```javascript
// Générer balance
const balance = await balanceHelper.generateBalance({
  asOfDate: '2024-01-31',
  accountRange: { from: '500', to: '700' },
});

// Vérifier équilibre
expect(balance.isBalanced).toBe(true);

// Exporter PDF
const download = await balanceHelper.exportBalance();

// Récupérer via API
const data = await balanceHelper.getBalanceAPI(asOfDate);
```

#### AuditHelper

```javascript
// Logs d'une écriture
const auditLog = await auditHelper.getEntryAuditLog(entryNumber);

// Logs d'une balance
const balanceAudit = await auditHelper.getBalanceAuditLog(balanceId);

// Rapport audit
const report = await auditHelper.generateAuditReport({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  entityType: 'entry',
});
```

---

## Tests métier

### Flux 1: Création → Validation → Balance

```javascript
test('Flux complet: Créer → Valider → Consulter balance', async ({ page }) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Créer écriture
  const entry = await entryHelper.createEntry({
    journalCode: 'VE',
    date: today,
    description: 'Vente marchandise',
    lines: [
      { accountCode: '512000', debit: 5000, credit: 0 },
      { accountCode: '701000', debit: 0, credit: 5000 },
    ],
  });

  // 2. Valider
  await entryHelper.validateEntry(entry.entryNumber);

  // 3. Balance
  const balance = await balanceHelper.generateBalance({ asOfDate: today });
  expect(balance.isBalanced).toBe(true);

  // 4. Audit
  const auditLog = await auditHelper.getEntryAuditLog(entry.entryNumber);
  expect(auditLog.events).toContainEqual(
    expect.objectContaining({ action: 'CREATE' })
  );
});
```

### Flux 2: Scénario de vente complet

Voir `e2e/business-flows.spec.js` - Section "Scénario: Cycle de vente complet"

---

## Tests de performance

### Thresholds définis

| Operation | Threshold | Note |
|-----------|-----------|------|
| LOGIN | 3s | API login |
| CREATE_ENTRY | 5s | Création écriture UI |
| VALIDATE_ENTRY | 4s | Validation |
| BALANCE_GENERATION | 8s | Génération balance |
| BALANCE_EXPORT | 10s | Export PDF |
| ENTRY_LIST_LOAD | 2s | Chargement liste |
| ENTRY_DETAIL | 1.5s | Détail écriture |
| SEARCH | 1s | Recherche |

### Exécution

```bash
# Tests performance seuls
npm run test:e2e:performance

# Avec rapport
npm run test:perf:report

# Debug
npx playwright test --project=performance --headed --debug
```

### Résultats

```
📊 PERFORMANCE TEST RESULTS
═══════════════════════════════════════════════════════
✅ Create entry: 3200ms / 5000ms [██████████░░░░░░░░░░░░░░░░░] 64%
✅ Validate entry: 2800ms / 4000ms [███████░░░░░░░░░░░░░░░░░░░░░] 70%
✅ Balance generation: 6500ms / 8000ms [████████░░░░░░░░░░░░░░░░░░░░] 81%

✅ Passed: 32
❌ Failed: 1
Total: 33

✨ All performance tests passed!
```

---

## Intégration CI/CD

### Pipeline GitHub Actions

Le fichier `.github/workflows/e2e-tests.yml` exécute:

1. **Setup** - Installation dépendances
2. **E2E Chromium** - Tests tous navigateurs
3. **E2E Firefox**
4. **E2E WebKit**
5. **Performance** - Tests perf avec thresholds
6. **Smoke** - Tests rapides
7. **Publish** - Génère rapports
8. **Notify** - Notifie Slack

### Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Nightly
  workflow_dispatch:
```

### Artefacts

- `playwright-report-chromium/` - Rapport HTML
- `test-results-chromium/` - Résultats JUnit
- `performance-results.json` - Métriques perf

### Notifications

- Slack webhook avec statut
- PR comments avec résultats perf
- GitHub Pages avec rapports complets

---

## Dépannage

### Problem: Timeout lors de tests

```bash
# Augmenter timeout
npx playwright test --timeout=120000

# Debug mode
npx playwright test --debug

# Mode headed pour voir
npx playwright test --headed
```

### Problem: Services ne démarrent pas

```bash
# Vérifier ports libres
lsof -i :3001
lsof -i :5173

# Démarrer manuellement
npm run dev:backend &
npm run dev:frontend &
```

### Problem: Auth fails

```javascript
// Ajouter logs
await page.waitForFunction(() => {
  const token = localStorage.getItem('token');
  console.log('Token:', token ? 'OK' : 'MISSING');
  return !!token;
});
```

### Problem: Éléments non trouvés

```javascript
// Debug
await page.pause(); // Interactive mode

// Vérifier sélecteur
const element = await page.$('[data-testid="element"]');
console.log('Element found:', !!element);

// Augmenter timeout
await page.waitForSelector('[data-testid="element"]', { timeout: 10000 });
```

### Logs détaillés

```bash
# Avec logs de debug
DEBUG=pw:api npm run test:e2e

# Trace mode
npx playwright test --trace on
```

---

## Commandes rapides

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Interface interactive
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Un navigateur spécifique
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Tests métier
npm run test:e2e:business-flows

# Tests performance
npm run test:e2e:performance
npm run test:perf:report

# Tests smoke rapides
npm run test:e2e:smoke

# Tout
npm run test:all
```

---

## Best Practices

1. **Utiliser data-testid** - Sélecteurs stables
   ```html
   <button data-testid="save-btn">Sauvegarder</button>
   ```

2. **Attendre les états** - Pas de timers
   ```javascript
   // ✅ BON
   await page.waitForLoadState('networkidle');
   
   // ❌ MAUVAIS
   await page.waitForTimeout(2000);
   ```

3. **Utiliser fixtures** - Code réutilisable
   ```javascript
   test('...', async ({ authenticatedPage }) => {
     // Déjà logged in
   });
   ```

4. **Assertions claires** - Messages descriptifs
   ```javascript
   expect(balance.isBalanced).toBe(true); // ✅
   expect(balance).toBeTruthy(); // ❌
   ```

5. **Cleanup après** - État propre
   ```javascript
   test.afterEach(async () => {
     // Logout, reset data, etc
   });
   ```

---

## Ressources

- [Playwright Docs](https://playwright.dev)
- [Playwright API](https://playwright.dev/docs/api/class-browser)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

**Version**: 1.0  
**Dernier update**: 23 Jan 2026  
**Status**: ✅ Production Ready
