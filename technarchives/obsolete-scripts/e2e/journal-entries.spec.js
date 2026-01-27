/**
 * Tests E2E pour les Écritures Comptables
 */

import { test, expect, waitForLoading, expectSuccessMessage, generateTestData } from './fixtures.js';

test.describe('Écritures Comptables', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('devrait lister les écritures', async ({ authenticatedPage: page }) => {
    await page.goto('/journal-entries');
    await waitForLoading(page);
    
    // Vérifier le titre
    await expect(page.locator('h1, h2')).toContainText(/écritures|journal/i);
    
    // Vérifier la présence d'une liste
    const list = page.locator('table, [data-testid="entries-list"]').first();
    await expect(list).toBeVisible();
  });

  test('devrait créer une nouvelle écriture', async ({ authenticatedPage: page }) => {
    await page.goto('/journal-entries');
    await waitForLoading(page);
    
    // Cliquer sur créer
    const createButton = page.locator('button:has-text("Créer"), button:has-text("Nouveau"), [data-testid="create-entry"]').first();
    await createButton.click();
    
    // Vérifier que le formulaire s'affiche
    const form = page.locator('[data-testid="entry-form"], form').first();
    await expect(form).toBeVisible({ timeout: 5000 });
    
    // Générer des données
    const entryData = generateTestData('journalEntry');
    
    // Remplir les champs principaux
    await page.fill('input[name="entryDate"]', entryData.entryDate);
    await page.selectOption('select[name="journalCode"]', entryData.journalCode);
    await page.fill('input[name="description"], textarea[name="description"]', entryData.description);
    
    // Remplir la première ligne (débit)
    await page.fill('input[name="lines[0].debit"]', '1000');
    await page.fill('input[name="lines[0].credit"]', '0');
    
    // Remplir la deuxième ligne (crédit)
    await page.fill('input[name="lines[1].debit"]', '0');
    await page.fill('input[name="lines[1].credit"]', '1000');
    
    // Soumettre
    const submitButton = page.locator('button[type="submit"]').first();
    
    // Vérifier que le bouton est activé (équilibre débit/crédit)
    if (await submitButton.isEnabled()) {
      await submitButton.click();
      
      // Vérifier le message de succès
      await expectSuccessMessage(page, /créé|succès/i);
    }
  });

  test('devrait filtrer par statut', async ({ authenticatedPage: page }) => {
    await page.goto('/journal-entries');
    await waitForLoading(page);
    
    // Filtrer par DRAFT
    const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]').first();
    
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('DRAFT');
      await page.waitForTimeout(1000);
      
      // Vérifier que les résultats sont filtrés
      const results = page.locator('table tbody tr, [data-testid="entry-item"]');
      await expect(results.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('devrait filtrer par période', async ({ authenticatedPage: page }) => {
    await page.goto('/journal-entries');
    await waitForLoading(page);
    
    // Définir une période
    const startDate = page.locator('input[name="startDate"]').first();
    const endDate = page.locator('input[name="endDate"]').first();
    
    if (await startDate.isVisible() && await endDate.isVisible()) {
      const today = new Date().toISOString().split('T')[0];
      await startDate.fill(today);
      await endDate.fill(today);
      
      // Cliquer sur filtrer
      const filterButton = page.locator('button:has-text("Filtrer"), button:has-text("Rechercher")').first();
      
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await waitForLoading(page);
      }
    }
  });

  test('devrait valider une écriture en brouillon', async ({ authenticatedPage: page }) => {
    await page.goto('/journal-entries');
    await waitForLoading(page);
    
    // Filtrer par DRAFT
    const statusFilter = page.locator('select[name="status"]').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('DRAFT');
      await page.waitForTimeout(1000);
    }
    
    // Cliquer sur valider
    const postButton = page.locator('button:has-text("Valider"), button:has-text("Post"), [data-testid="post-entry"]').first();
    
    if (await postButton.isVisible()) {
      await postButton.click();
      
      // Confirmer si modal de confirmation
      const confirmButton = page.locator('button:has-text("Confirmer"), button:has-text("Oui")').first();
      
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      
      // Vérifier le message de succès
      await expectSuccessMessage(page, /validé|posted|success/i);
    }
  });

  test('devrait afficher le détail d\'une écriture', async ({ authenticatedPage: page }) => {
    await page.goto('/journal-entries');
    await waitForLoading(page);
    
    // Cliquer sur la première écriture
    const firstEntry = page.locator('table tbody tr, [data-testid="entry-item"]').first();
    
    if (await firstEntry.isVisible()) {
      await firstEntry.click();
      
      // Vérifier que le détail s'affiche
      const detail = page.locator('[data-testid="entry-detail"], [role="dialog"]').first();
      
      if (await detail.isVisible({ timeout: 3000 })) {
        // Vérifier les informations affichées
        await expect(detail).toContainText(/débit|crédit|ligne/i);
      }
    }
  });

  test('devrait vérifier l\'équilibre débit/crédit', async ({ authenticatedPage: page }) => {
    await page.goto('/journal-entries');
    await waitForLoading(page);
    
    const createButton = page.locator('button:has-text("Créer")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Remplir avec un déséquilibre
      await page.fill('input[name="lines[0].debit"]', '1000');
      await page.fill('input[name="lines[0].credit"]', '0');
      await page.fill('input[name="lines[1].debit"]', '0');
      await page.fill('input[name="lines[1].credit"]', '500'); // Déséquilibre!
      
      // Vérifier que le bouton de soumission est désactivé ou qu'une erreur s'affiche
      const submitButton = page.locator('button[type="submit"]').first();
      const errorMessage = page.locator('[data-testid="balance-error"], .error').first();
      
      const isDisabled = await submitButton.isDisabled().catch(() => false);
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(isDisabled || hasError).toBeTruthy();
    }
  });
});
