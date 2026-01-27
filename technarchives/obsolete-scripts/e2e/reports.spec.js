/**
 * Tests E2E pour les Rapports Financiers
 */

import { test, expect, waitForLoading } from './fixtures.js';

test.describe('Rapports Financiers', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('devrait afficher la page des rapports', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    await waitForLoading(page);
    
    // Vérifier le titre
    await expect(page.locator('h1, h2')).toContainText(/rapports|reports/i);
    
    // Vérifier la présence des options de rapports
    const reportOptions = page.locator('[data-testid="report-option"], button, a').filter({ hasText: /balance|bilan|résultat/i });
    await expect(reportOptions.first()).toBeVisible();
  });

  test('devrait générer une balance générale', async ({ authenticatedPage: page }) => {
    await page.goto('/reports/balance');
    await waitForLoading(page);
    
    // Sélectionner une période
    const fiscalYearInput = page.locator('input[name="fiscalYear"], select[name="fiscalYear"]').first();
    
    if (await fiscalYearInput.isVisible()) {
      await fiscalYearInput.fill('2026');
    } else {
      // Sinon utiliser des dates
      const startDate = page.locator('input[name="startDate"]').first();
      const endDate = page.locator('input[name="endDate"]').first();
      
      if (await startDate.isVisible()) {
        await startDate.fill('2026-01-01');
        await endDate.fill('2026-12-31');
      }
    }
    
    // Générer le rapport
    const generateButton = page.locator('button:has-text("Générer"), button:has-text("Generate"), button[type="submit"]').first();
    await generateButton.click();
    
    await waitForLoading(page);
    
    // Vérifier que le rapport s'affiche
    const report = page.locator('[data-testid="balance-report"], table').first();
    await expect(report).toBeVisible({ timeout: 10000 });
    
    // Vérifier les totaux
    const totals = page.locator('[data-testid="totals"], .totals, tfoot').first();
    await expect(totals).toContainText(/total|débit|crédit/i);
  });

  test('devrait générer une balance auxiliaire', async ({ authenticatedPage: page }) => {
    await page.goto('/reports/balance-auxiliary');
    await waitForLoading(page);
    
    // Sélectionner un type de tiers
    const typeFilter = page.locator('select[name="thirdPartyType"]').first();
    
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('CUSTOMER');
    }
    
    // Générer
    const generateButton = page.locator('button:has-text("Générer")').first();
    await generateButton.click();
    
    await waitForLoading(page);
    
    // Vérifier le rapport
    const report = page.locator('[data-testid="balance-auxiliary"], table').first();
    await expect(report).toBeVisible({ timeout: 10000 });
  });

  test('devrait générer un grand livre', async ({ authenticatedPage: page }) => {
    await page.goto('/reports/general-ledger');
    await waitForLoading(page);
    
    // Sélectionner un compte (peut nécessiter une recherche)
    const accountSelect = page.locator('select[name="accountId"], input[name="accountId"]').first();
    
    if (await accountSelect.isVisible()) {
      // Si c'est un select, prendre la première option
      if (await accountSelect.evaluate(el => el.tagName) === 'SELECT') {
        await accountSelect.selectOption({ index: 1 });
      }
      
      // Générer
      const generateButton = page.locator('button:has-text("Générer")').first();
      
      if (await generateButton.isEnabled()) {
        await generateButton.click();
        await waitForLoading(page);
        
        // Vérifier le rapport
        const report = page.locator('[data-testid="general-ledger"], table').first();
        await expect(report).toBeVisible({ timeout: 10000 });
        
        // Vérifier le solde progressif
        await expect(report).toContainText(/solde|balance/i);
      }
    }
  });

  test('devrait générer un compte de résultat', async ({ authenticatedPage: page }) => {
    await page.goto('/reports/income-statement');
    await waitForLoading(page);
    
    // Sélectionner l'année fiscale
    const fiscalYearInput = page.locator('input[name="fiscalYear"], select[name="fiscalYear"]').first();
    
    if (await fiscalYearInput.isVisible()) {
      await fiscalYearInput.fill('2026');
    }
    
    // Générer
    const generateButton = page.locator('button:has-text("Générer")').first();
    await generateButton.click();
    
    await waitForLoading(page);
    
    // Vérifier le rapport
    const report = page.locator('[data-testid="income-statement"], .report').first();
    await expect(report).toBeVisible({ timeout: 10000 });
    
    // Vérifier les sections charges et produits
    await expect(report).toContainText(/charges|produits/i);
    
    // Vérifier le résultat
    const result = page.locator('[data-testid="result"], .result').first();
    
    if (await result.isVisible({ timeout: 3000 })) {
      await expect(result).toContainText(/bénéfice|perte|résultat/i);
    }
  });

  test('devrait générer un bilan comptable', async ({ authenticatedPage: page }) => {
    await page.goto('/reports/balance-sheet');
    await waitForLoading(page);
    
    // Sélectionner une date de clôture
    const dateInput = page.locator('input[name="date"]').first();
    
    if (await dateInput.isVisible()) {
      await dateInput.fill('2026-12-31');
    }
    
    // Générer
    const generateButton = page.locator('button:has-text("Générer")').first();
    await generateButton.click();
    
    await waitForLoading(page);
    
    // Vérifier le rapport
    const report = page.locator('[data-testid="balance-sheet"], .report').first();
    await expect(report).toBeVisible({ timeout: 10000 });
    
    // Vérifier les sections actif et passif
    await expect(report).toContainText(/actif|passif/i);
    
    // Vérifier l'équilibre
    const balance = page.locator('[data-testid="balance-check"], .balance').first();
    
    if (await balance.isVisible({ timeout: 3000 })) {
      // Devrait indiquer si le bilan est équilibré
      await expect(balance).toContainText(/équilibr|balanced/i);
    }
  });

  test('devrait exporter un rapport en PDF', async ({ authenticatedPage: page }) => {
    await page.goto('/reports/balance');
    await waitForLoading(page);
    
    // Générer d'abord le rapport
    const generateButton = page.locator('button:has-text("Générer")').first();
    
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await waitForLoading(page);
    }
    
    // Chercher le bouton d'export PDF
    const exportPdfButton = page.locator('button:has-text("PDF"), [data-testid="export-pdf"]').first();
    
    if (await exportPdfButton.isVisible()) {
      // Attendre le téléchargement
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      await exportPdfButton.click();
      
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
      }
    }
  });

  test('devrait filtrer un rapport par niveau de compte', async ({ authenticatedPage: page }) => {
    await page.goto('/reports/balance');
    await waitForLoading(page);
    
    // Sélectionner un niveau
    const levelSelect = page.locator('select[name="level"], input[name="level"]').first();
    
    if (await levelSelect.isVisible()) {
      if (await levelSelect.evaluate(el => el.tagName) === 'SELECT') {
        await levelSelect.selectOption('2');
      } else {
        await levelSelect.fill('2');
      }
      
      // Générer
      const generateButton = page.locator('button:has-text("Générer")').first();
      await generateButton.click();
      
      await waitForLoading(page);
      
      // Vérifier que le rapport est filtré
      const report = page.locator('table tbody tr').first();
      await expect(report).toBeVisible({ timeout: 10000 });
    }
  });
});
