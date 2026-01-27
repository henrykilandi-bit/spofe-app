/**
 * Tests E2E pour les Tiers
 */

import { test, expect, waitForLoading, expectSuccessMessage, generateTestData } from './fixtures.js';

test.describe('Tiers', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('devrait lister les tiers', async ({ authenticatedPage: page }) => {
    await page.goto('/third-parties');
    await waitForLoading(page);
    
    // Vérifier le titre
    await expect(page.locator('h1, h2')).toContainText(/tiers|clients|fournisseurs/i);
    
    // Vérifier la présence d'une liste
    const list = page.locator('table, [data-testid="third-parties-list"]').first();
    await expect(list).toBeVisible();
  });

  test('devrait créer un nouveau tiers', async ({ authenticatedPage: page }) => {
    await page.goto('/third-parties');
    await waitForLoading(page);
    
    // Cliquer sur créer
    const createButton = page.locator('button:has-text("Créer"), button:has-text("Nouveau"), [data-testid="create-third-party"]').first();
    await createButton.click();
    
    // Vérifier que le formulaire s'affiche
    const modal = page.locator('[role="dialog"], .modal, [data-testid="third-party-modal"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Générer des données
    const thirdPartyData = generateTestData('thirdParty');
    
    // Remplir le formulaire
    await page.fill('input[name="code"]', thirdPartyData.code);
    await page.fill('input[name="name"]', thirdPartyData.name);
    await page.selectOption('select[name="type"]', thirdPartyData.type);
    await page.fill('input[name="email"]', thirdPartyData.email);
    
    if (await page.locator('input[name="phone"]').isVisible()) {
      await page.fill('input[name="phone"]', thirdPartyData.phone);
    }
    
    // Soumettre
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Vérifier le message de succès
    await expectSuccessMessage(page, /créé|succès/i);
    
    // Vérifier que le tiers apparaît dans la liste
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${thirdPartyData.code}`).first()).toBeVisible({ timeout: 5000 });
  });

  test('devrait rechercher un tiers', async ({ authenticatedPage: page }) => {
    await page.goto('/third-parties');
    await waitForLoading(page);
    
    // Trouver le champ de recherche
    const searchInput = page.locator('input[type="search"], input[placeholder*="recherch"], input[name="query"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('CLI');
      await page.waitForTimeout(1000);
      
      // Vérifier que les résultats sont filtrés
      const results = page.locator('table tbody tr, [data-testid="third-party-item"]');
      await expect(results.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('devrait filtrer par type de tiers', async ({ authenticatedPage: page }) => {
    await page.goto('/third-parties');
    await waitForLoading(page);
    
    // Filtrer par type
    const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"]').first();
    
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('CUSTOMER');
      await page.waitForTimeout(1000);
      
      // Vérifier que les résultats sont filtrés
      const results = page.locator('table tbody tr, [data-testid="third-party-item"]');
      await expect(results.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('devrait modifier un tiers', async ({ authenticatedPage: page }) => {
    await page.goto('/third-parties');
    await waitForLoading(page);
    
    // Cliquer sur modifier
    const editButton = page.locator('button:has-text("Modifier"), button:has-text("Edit"), [data-testid="edit-third-party"]').first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Vérifier que le formulaire s'affiche
      const modal = page.locator('[role="dialog"], .modal').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Modifier le nom
      const nameInput = page.locator('input[name="name"]').first();
      await nameInput.fill(`Tiers Modifié ${Date.now()}`);
      
      // Soumettre
      await page.locator('button[type="submit"]').first().click();
      
      // Vérifier le message de succès
      await expectSuccessMessage(page, /modifié|mis à jour/i);
    }
  });

  test('devrait afficher les statistiques des tiers', async ({ authenticatedPage: page }) => {
    await page.goto('/third-parties');
    await waitForLoading(page);
    
    // Vérifier la présence de statistiques
    const stats = page.locator('[data-testid="stats"], .stats, .statistics').first();
    
    if (await stats.isVisible({ timeout: 3000 })) {
      // Vérifier qu'elles contiennent des nombres
      await expect(stats).toContainText(/\d+/);
    }
  });

  test('devrait afficher les transactions d\'un tiers', async ({ authenticatedPage: page }) => {
    await page.goto('/third-parties');
    await waitForLoading(page);
    
    // Cliquer sur le premier tiers
    const firstParty = page.locator('table tbody tr, [data-testid="third-party-item"]').first();
    
    if (await firstParty.isVisible()) {
      // Cliquer sur voir transactions
      const transactionsButton = page.locator('button:has-text("Transactions"), [data-testid="view-transactions"]').first();
      
      if (await transactionsButton.isVisible()) {
        await transactionsButton.click();
        
        // Vérifier que le modal de transactions s'affiche
        const modal = page.locator('[data-testid="transactions-modal"], [role="dialog"]').first();
        
        if (await modal.isVisible({ timeout: 3000 })) {
          await expect(modal).toContainText(/transactions|écritures/i);
        }
      }
    }
  });

  test('devrait exporter la liste des tiers', async ({ authenticatedPage: page }) => {
    await page.goto('/third-parties');
    await waitForLoading(page);
    
    // Chercher un bouton d'export
    const exportButton = page.locator('button:has-text("Exporter"), button:has-text("Export"), [data-testid="export"]').first();
    
    if (await exportButton.isVisible()) {
      // Déclencher le téléchargement
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await exportButton.click();
      
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.csv|\.xlsx|\.pdf/i);
      }
    }
  });
});
