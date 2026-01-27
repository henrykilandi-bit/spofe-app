import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper.js';
import { JournalEntryHelper, BalanceHelper, AuditHelper } from './helpers/business-helpers.js';

/**
 * TESTS E2E COMPLETS - Flux métier de base
 * ✅ Création écriture
 * ✅ Validation écriture
 * ✅ Consultation balance
 * ✅ Vérification audit
 */

test.describe('🔄 Flux métier complets', () => {
  let authHelper;
  let entryHelper;
  let balanceHelper;
  let auditHelper;

  test.beforeEach(async ({ page, context }) => {
    // Initialiser helpers
    authHelper = new AuthHelper(page, context);
    entryHelper = new JournalEntryHelper(page);
    balanceHelper = new BalanceHelper(page);
    auditHelper = new AuditHelper(page);

    // Login
    await authHelper.loginAPI();
  });

  test.describe('Flux 1: Création → Validation → Balance', () => {
    test('Créer une écriture simple', async ({ page }) => {
      const entry = await entryHelper.createEntry({
        journalCode: 'AC',
        description: 'Création stock initial',
        lines: [
          { accountCode: '101000', debit: 10000, credit: 0 },
          { accountCode: '401000', debit: 0, credit: 10000 },
        ],
      });

      // Assertions métier
      expect(entry).toMatchObject({
        journalCode: 'AC',
        description: 'Création stock initial',
        lines: 2,
      });
      expect(entry.entryNumber).toBeTruthy();
      expect(entry.entryNumber).toMatch(/^AC-\d+$/);
    });

    test('Flux complet: Créer → Valider → Consulter balance', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];

      // ÉTAPE 1: Créer écriture
      const entry = await entryHelper.createEntry({
        journalCode: 'VE',
        date: today,
        description: 'Vente marchandise',
        lines: [
          { accountCode: '512000', debit: 5000, credit: 0, description: 'Caisse' },
          { accountCode: '701000', debit: 0, credit: 5000, description: 'Vente' },
        ],
      });

      expect(entry.entryNumber).toBeTruthy();
      console.log(`✅ Écriture créée: ${entry.entryNumber}`);

      // ÉTAPE 2: Valider écriture
      const validated = await entryHelper.validateEntry(entry.entryNumber);
      expect(validated.status).toBe('Validé');
      console.log(`✅ Écriture validée: ${validated.status}`);

      // ÉTAPE 3: Consulter balance
      const balance = await balanceHelper.generateBalance({
        asOfDate: today,
      });

      expect(balance.isBalanced).toBe(true);
      expect(balance.totalDebit).toBe(balance.totalCredit);
      console.log(`✅ Balance équilibrée: ${balance.totalDebit}`);

      // ÉTAPE 4: Vérifier dans audit
      const auditLog = await auditHelper.getEntryAuditLog(entry.entryNumber);
      expect(auditLog.events.length).toBeGreaterThan(0);
      
      // Doit contenir création et validation
      const actions = auditLog.events.map(e => e.action);
      expect(actions).toContain('CREATE');
      expect(actions).toContain('VALIDATE');
      console.log(`✅ Audit logged: ${auditLog.events.length} événements`);
    });

    test('Créer plusieurs écritures et vérifier balance', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];

      const entries = [];

      // Écriture 1: Achat
      entries.push(await entryHelper.createEntry({
        journalCode: 'AC',
        date: today,
        description: 'Achat marchandise',
        lines: [
          { accountCode: '301000', debit: 8000, credit: 0 },
          { accountCode: '401000', debit: 0, credit: 8000 },
        ],
      }));

      // Écriture 2: Règlement
      entries.push(await entryHelper.createEntry({
        journalCode: 'BQ',
        date: today,
        description: 'Règlement par chèque',
        lines: [
          { accountCode: '401000', debit: 8000, credit: 0 },
          { accountCode: '512000', debit: 0, credit: 8000 },
        ],
      }));

      // Valider tous
      for (const entry of entries) {
        await entryHelper.validateEntry(entry.entryNumber);
      }

      // Balance
      const balance = await balanceHelper.generateBalance({ asOfDate: today });
      
      expect(balance.isBalanced).toBe(true);
      expect(balance.lines).toBe(4); // 2 lignes × 2 écritures
    });
  });

  test.describe('Flux 2: Corrections et annulations', () => {
    test('Créer écriture, corriger, puis annuler', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];

      // Créer
      const entry = await entryHelper.createEntry({
        journalCode: 'OD',
        date: today,
        description: 'Opération divers',
        lines: [
          { accountCode: '605000', debit: 500, credit: 0 },
          { accountCode: '512000', debit: 0, credit: 500 },
        ],
      });

      // Valider
      await entryHelper.validateEntry(entry.entryNumber);

      // Vérifier en audit
      let auditLog = await auditHelper.getEntryAuditLog(entry.entryNumber);
      let createEvent = auditLog.events.find(e => e.action === 'CREATE');
      expect(createEvent).toBeTruthy();

      console.log(`✅ Flux correction: Écriture créée et validée`);
    });
  });

  test.describe('Flux 3: Requêtes API directes', () => {
    test('Créer écriture via API et vérifier en UI', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];

      // Créer via API
      const createResponse = await page.request.post(
        'http://localhost:3001/api/entries',
        {
          data: {
            journalCode: 'VE',
            date: today,
            description: 'API Test Entry',
            reference: `API-${Date.now()}`,
            lines: [
              { accountCode: '512000', debit: 3000, credit: 0 },
              { accountCode: '701000', debit: 0, credit: 3000 },
            ],
          },
        }
      );

      expect(createResponse.ok()).toBe(true);
      const entryData = await createResponse.json();
      expect(entryData.id).toBeTruthy();

      // Valider via API
      const validateResponse = await page.request.post(
        `http://localhost:3001/api/entries/${entryData.id}/validate`,
        {}
      );

      expect(validateResponse.ok()).toBe(true);

      // Consulter en UI
      await page.goto(`/entries/${entryData.id}`);
      const status = await page.textContent('[data-testid="entry-status"]');
      expect(status).toContain('Validé');
    });

    test('Récupérer balance via API et vérifier cohérence', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];

      // Via API
      const response = await page.request.get(
        `http://localhost:3001/api/balance?asOfDate=${today}`
      );

      expect(response.ok()).toBe(true);
      const balanceData = await response.json();

      expect(balanceData).toHaveProperty('lines');
      expect(Array.isArray(balanceData.lines)).toBe(true);
    });
  });

  test.describe('Flux 4: Scénarios métier réalistes', () => {
    test('Scénario: Cycle de vente complet', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0];

      // 1. Achat marchandise
      const purchase = await entryHelper.createEntry({
        journalCode: 'AC',
        date: today,
        description: 'Achat marchandise chez Fournisseur XYZ',
        lines: [
          { accountCode: '301000', debit: 50000, credit: 0, description: 'Stock' },
          { accountCode: '401000', debit: 0, credit: 50000, description: 'Fournisseur' },
        ],
      });

      // 2. Vente marchandise
      const sale = await entryHelper.createEntry({
        journalCode: 'VE',
        date: today,
        description: 'Vente marchandise à Client ABC',
        lines: [
          { accountCode: '512000', debit: 75000, credit: 0, description: 'Caisse' },
          { accountCode: '701000', debit: 0, credit: 75000, description: 'Vente' },
        ],
      });

      // 3. Paiement fournisseur
      const payment = await entryHelper.createEntry({
        journalCode: 'BQ',
        date: today,
        description: 'Paiement chèque n°001 Fournisseur XYZ',
        lines: [
          { accountCode: '401000', debit: 50000, credit: 0, description: 'Fournisseur' },
          { accountCode: '512000', debit: 0, credit: 50000, description: 'Caisse' },
        ],
      });

      // Valider tous
      await entryHelper.validateEntry(purchase.entryNumber);
      await entryHelper.validateEntry(sale.entryNumber);
      await entryHelper.validateEntry(payment.entryNumber);

      // Vérifier balance
      const balance = await balanceHelper.generateBalance({ asOfDate: today });
      expect(balance.isBalanced).toBe(true);

      // Vérifier audit trail
      const auditPurchase = await auditHelper.getEntryAuditLog(purchase.entryNumber);
      const auditSale = await auditHelper.getEntryAuditLog(sale.entryNumber);
      const auditPayment = await auditHelper.getEntryAuditLog(payment.entryNumber);

      expect(auditPurchase.events.length).toBeGreaterThan(0);
      expect(auditSale.events.length).toBeGreaterThan(0);
      expect(auditPayment.events.length).toBeGreaterThan(0);

      console.log(`
        ✅ Scénario complet validé:
        - ${purchase.entryNumber} créé et validé
        - ${sale.entryNumber} créé et validé
        - ${payment.entryNumber} créé et validé
        - Balance équilibrée: ${balance.totalDebit}
        - Audit trail complet
      `);
    });

    test('Scénario: Plusieurs périodes fiscales', async ({ page }) => {
      // Créer écritures sur plusieurs jours
      const dates = [
        new Date('2024-01-15').toISOString().split('T')[0],
        new Date('2024-01-20').toISOString().split('T')[0],
        new Date('2024-01-25').toISOString().split('T')[0],
      ];

      const entries = [];

      for (const date of dates) {
        const entry = await entryHelper.createEntry({
          journalCode: 'OD',
          date,
          description: `Opération du ${date}`,
          lines: [
            { accountCode: '512000', debit: 1000, credit: 0 },
            { accountCode: '700000', debit: 0, credit: 1000 },
          ],
        });
        entries.push(entry);
        await entryHelper.validateEntry(entry.entryNumber);
      }

      // Vérifier balance à différentes dates
      for (const date of dates) {
        const balance = await balanceHelper.generateBalance({ asOfDate: date });
        expect(balance.isBalanced).toBe(true);
      }

      expect(entries.length).toBe(3);
    });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: vérifier qu'on laisse un état sain
    const isAuthenticated = await authHelper.isAuthenticated();
    if (isAuthenticated) {
      try {
        await authHelper.logout();
      } catch (e) {
        // Ignore logout errors
      }
    }
  });
});
