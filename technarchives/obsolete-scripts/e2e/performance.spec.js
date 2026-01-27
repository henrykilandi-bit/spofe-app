import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper.js';
import { JournalEntryHelper, BalanceHelper } from './helpers/business-helpers.js';

/**
 * TESTS DE PERFORMANCE E2E
 * ✅ Mesure des temps de réponse critiques
 * ✅ Pagination et charge
 * ✅ Export et rapports
 * ✅ Thresholds d'acceptation
 */

test.describe('⚡ Performance E2E', () => {
  let authHelper;
  let entryHelper;
  let balanceHelper;

  const PERFORMANCE_THRESHOLDS = {
    LOGIN: 3000, // 3 secondes
    CREATE_ENTRY: 5000, // 5 secondes
    VALIDATE_ENTRY: 4000, // 4 secondes
    BALANCE_GENERATION: 8000, // 8 secondes
    BALANCE_EXPORT: 10000, // 10 secondes
    ENTRY_LIST_LOAD: 2000, // 2 secondes pour les 50 premiers
    ENTRY_DETAIL: 1500, // 1.5 secondes
    SEARCH: 1000, // 1 seconde
  };

  test.beforeEach(async ({ page, context }) => {
    authHelper = new AuthHelper(page, context);
    entryHelper = new JournalEntryHelper(page);
    balanceHelper = new BalanceHelper(page);
  });

  test.describe('Authentification', () => {
    test('Performance: Login rapide', async ({ page }) => {
      const startTime = Date.now();
      
      await authHelper.loginAPI();
      
      const duration = Date.now() - startTime;
      console.log(`⏱️ Login API: ${duration}ms`);
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.LOGIN);
    });

    test('Performance: Dashboard load', async ({ page }) => {
      await authHelper.loginAPI();

      const startTime = Date.now();
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      const duration = Date.now() - startTime;

      console.log(`⏱️ Dashboard load: ${duration}ms`);
      expect(duration).toBeLessThan(3000);
    });
  });

  test.describe('Création et validation d\'écritures', () => {
    test('Performance: Créer une écriture', async ({ page }) => {
      await authHelper.loginAPI();

      const startTime = Date.now();

      await entryHelper.createEntry({
        journalCode: 'VE',
        description: 'Perf test entry',
        lines: [
          { accountCode: '512000', debit: 1000, credit: 0 },
          { accountCode: '701000', debit: 0, credit: 1000 },
        ],
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️ Create entry: ${duration}ms`);
      
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.CREATE_ENTRY);
    });

    test('Performance: Valider une écriture', async ({ page }) => {
      await authHelper.loginAPI();

      // Créer une écriture d'abord
      const entry = await entryHelper.createEntry({
        journalCode: 'AC',
        lines: [
          { accountCode: '301000', debit: 2000, credit: 0 },
          { accountCode: '401000', debit: 0, credit: 2000 },
        ],
      });

      const startTime = Date.now();
      await entryHelper.validateEntry(entry.entryNumber);
      const duration = Date.now() - startTime;

      console.log(`⏱️ Validate entry: ${duration}ms`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.VALIDATE_ENTRY);
    });
  });

  test.describe('Reports et Balance', () => {
    test('Performance: Générer balance', async ({ page }) => {
      await authHelper.loginAPI();

      // Créer des données
      const today = new Date().toISOString().split('T')[0];
      
      for (let i = 0; i < 5; i++) {
        const entry = await entryHelper.createEntry({
          journalCode: 'OD',
          date: today,
          description: `Perf test ${i}`,
          lines: [
            { accountCode: '512000', debit: 1000, credit: 0 },
            { accountCode: '700000', debit: 0, credit: 1000 },
          ],
        });
        await entryHelper.validateEntry(entry.entryNumber);
      }

      // Mesurer balance
      const startTime = Date.now();
      const balance = await balanceHelper.generateBalance({ asOfDate: today });
      const duration = Date.now() - startTime;

      console.log(`⏱️ Balance generation: ${duration}ms for ${balance.lines} lines`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BALANCE_GENERATION);
    });

    test('Performance: Export balance PDF', async ({ page }) => {
      await authHelper.loginAPI();
      
      const today = new Date().toISOString().split('T')[0];
      await balanceHelper.generateBalance({ asOfDate: today });

      const startTime = Date.now();
      const download = await balanceHelper.exportBalance();
      const duration = Date.now() - startTime;

      console.log(`⏱️ Balance export (PDF): ${duration}ms - ${download.filename}`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.BALANCE_EXPORT);
    });
  });

  test.describe('Navigation et recherche', () => {
    test('Performance: List entries load', async ({ page }) => {
      await authHelper.loginAPI();

      const startTime = Date.now();
      await page.goto('/entries');
      await page.waitForSelector('[data-testid="entries-list"]');
      const duration = Date.now() - startTime;

      console.log(`⏱️ Entries list load: ${duration}ms`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ENTRY_LIST_LOAD);
    });

    test('Performance: Entry detail page', async ({ page }) => {
      await authHelper.loginAPI();

      // Créer une écriture
      const entry = await entryHelper.createEntry({
        journalCode: 'VE',
        lines: [
          { accountCode: '512000', debit: 1000, credit: 0 },
          { accountCode: '701000', debit: 0, credit: 1000 },
        ],
      });

      const startTime = Date.now();
      await page.goto(`/entries/${entry.entryNumber}`);
      await page.waitForSelector('[data-testid="entry-detail"]');
      const duration = Date.now() - startTime;

      console.log(`⏱️ Entry detail load: ${duration}ms`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ENTRY_DETAIL);
    });

    test('Performance: Search entries', async ({ page }) => {
      await authHelper.loginAPI();
      
      await page.goto('/entries');

      const startTime = Date.now();
      await page.fill('[data-testid="search-input"]', 'test');
      await page.waitForSelector('[data-testid="entries-list"]');
      const duration = Date.now() - startTime;

      console.log(`⏱️ Search entries: ${duration}ms`);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH);
    });
  });

  test.describe('Stress tests', () => {
    test('Stress: Créer 10 écritures rapidement', async ({ page }) => {
      await authHelper.loginAPI();

      const entries = [];
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        const entry = await entryHelper.createEntry({
          journalCode: 'OD',
          description: `Stress test ${i}`,
          lines: [
            { accountCode: '512000', debit: 100 * (i + 1), credit: 0 },
            { accountCode: '700000', debit: 0, credit: 100 * (i + 1) },
          ],
        });
        entries.push(entry);
      }

      const duration = Date.now() - startTime;
      const avgPerEntry = duration / 10;

      console.log(`⏱️ Stress: 10 entries in ${duration}ms (avg: ${avgPerEntry.toFixed(0)}ms each)`);
      expect(duration).toBeLessThan(50000); // 50 secondes pour 10
    });

    test('Stress: Charger beaucoup d\'écritures en liste', async ({ page }) => {
      await authHelper.loginAPI();

      // Créer 50 écritures (via API pour plus rapide)
      for (let i = 0; i < 50; i++) {
        await page.request.post('http://localhost:3001/api/entries', {
          data: {
            journalCode: 'OD',
            date: new Date().toISOString().split('T')[0],
            description: `Load test ${i}`,
            lines: [
              { accountCode: '512000', debit: 100, credit: 0 },
              { accountCode: '700000', debit: 0, credit: 100 },
            ],
          },
        });
      }

      // Charger la liste
      const startTime = Date.now();
      await page.goto('/entries');
      await page.waitForSelector('[data-testid="entries-list"]');
      await page.waitForLoadState('networkidle');
      const duration = Date.now() - startTime;

      const rowCount = await page.locator('[data-testid="entry-row"]').count();

      console.log(`⏱️ Load 50 entries: ${duration}ms (${rowCount} rows rendered)`);
      expect(duration).toBeLessThan(5000);
    });
  });

  test.describe('API performance', () => {
    test('Performance: Créer entry via API', async ({ page }) => {
      await authHelper.loginAPI();

      const startTime = Date.now();

      const response = await page.request.post('http://localhost:3001/api/entries', {
        data: {
          journalCode: 'VE',
          date: new Date().toISOString().split('T')[0],
          description: 'API perf test',
          lines: [
            { accountCode: '512000', debit: 5000, credit: 0 },
            { accountCode: '701000', debit: 0, credit: 5000 },
          ],
        },
      });

      const duration = Date.now() - startTime;

      console.log(`⏱️ API create entry: ${duration}ms (HTTP ${response.status()})`);
      expect(response.ok()).toBe(true);
      expect(duration).toBeLessThan(2000); // Doit être plus rapide que UI
    });

    test('Performance: Récupérer balance via API', async ({ page }) => {
      await authHelper.loginAPI();

      const today = new Date().toISOString().split('T')[0];

      const startTime = Date.now();
      const response = await page.request.get(
        `http://localhost:3001/api/balance?asOfDate=${today}`
      );
      const duration = Date.now() - startTime;

      console.log(`⏱️ API balance: ${duration}ms`);
      expect(response.ok()).toBe(true);
      expect(duration).toBeLessThan(3000);
    });
  });

  test.describe('Report metrics collection', () => {
    test('Collecter metrics de performance complets', async ({ page }) => {
      await authHelper.loginAPI();

      const metrics = {
        timestamp: new Date().toISOString(),
        measurements: [],
      };

      // Mesurer plusieurs opérations
      const operations = [
        {
          name: 'dashboard_load',
          run: async () => {
            const start = Date.now();
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');
            return Date.now() - start;
          },
        },
        {
          name: 'entries_list',
          run: async () => {
            const start = Date.now();
            await page.goto('/entries');
            await page.waitForSelector('[data-testid="entries-list"]');
            return Date.now() - start;
          },
        },
        {
          name: 'balance_view',
          run: async () => {
            const start = Date.now();
            await page.goto('/reports/balance');
            await page.waitForLoadState('networkidle');
            return Date.now() - start;
          },
        },
      ];

      for (const op of operations) {
        const duration = await op.run();
        metrics.measurements.push({
          operation: op.name,
          duration,
          threshold: PERFORMANCE_THRESHOLDS[op.name.toUpperCase()] || 5000,
          passed: duration < (PERFORMANCE_THRESHOLDS[op.name.toUpperCase()] || 5000),
        });
      }

      console.log('📊 Performance Report:');
      metrics.measurements.forEach(m => {
        const status = m.passed ? '✅' : '❌';
        console.log(`${status} ${m.operation}: ${m.duration}ms (threshold: ${m.threshold}ms)`);
      });

      // Export rapport
      await page.evaluate((data) => {
        window.__PERFORMANCE_METRICS__ = data;
      }, metrics);

      expect(metrics.measurements.every(m => m.passed)).toBe(true);
    });
  });
});
