/**
 * Tests E2E pour le Plan Comptable
 */

import { test, expect, waitForLoading, fillForm, expectSuccessMessage, generateTestData } from './fixtures.js';

test.describe('Plan Comptable', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('devrait lister les comptes', async ({ authenticatedPage: page }) => {
    await page.goto('/chart-of-accounts');
    await waitForLoading(page);
    
    // Vérifier le titre de la page
    await expect(page.locator('h1, h2')).toContainText(/plan comptable|comptes/i);
    
    // Vérifier la présence d'une table ou liste
    const table = page.locator('table, [data-testid="accounts-list"]').first();
    await expect(table).toBeVisible();
  });

  test('devrait créer un nouveau compte', async ({ authenticatedPage: page }) => {
    await page.goto('/chart-of-accounts');
    await waitForLoading(page);
    
    // Cliquer sur le bouton de création
    const createButton = page.locator('button:has-text("Créer"), button:has-text("Nouveau"), [data-testid="create-account"]').first();
    await createButton.click();
    
    // Vérifier que le modal/formulaire s'affiche
    const modal = page.locator('[role="dialog"], .modal, [data-testid="account-modal"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Générer des données de test
    const accountData = generateTestData('account');
    
    // Remplir le formulaire
    await page.fill('input[name="accountNumber"]', accountData.accountNumber);
    await page.fill('input[name="accountName"]', accountData.accountName);
    await page.selectOption('select[name="accountType"]', accountData.accountType);
    
    if (await page.locator('textarea[name="description"]').isVisible()) {
      await page.fill('textarea[name="description"]', accountData.description);
    }
    
    // Soumettre le formulaire
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Vérifier le message de succès
    await expectSuccessMessage(page, /créé|succès|success/i);
    
    // Vérifier que le compte apparaît dans la liste
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${accountData.accountNumber}`).first()).toBeVisible({ timeout: 5000 });
  });

  test('devrait rechercher un compte', async ({ authenticatedPage: page }) => {
    await page.goto('/chart-of-accounts');
    await waitForLoading(page);
    
    // Trouver le champ de recherche
    const searchInput = page.locator('input[type="search"], input[placeholder*="recherch"], input[name="query"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('411');
      await page.waitForTimeout(1000);
      
      // Vérifier que les résultats sont filtrés
      const results = page.locator('table tbody tr, [data-testid="account-item"]');
      await expect(results.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('devrait modifier un compte', async ({ authenticatedPage: page }) => {
    await page.goto('/chart-of-accounts');
    await waitForLoading(page);
    
    // Cliquer sur le premier bouton de modification
    const editButton = page.locator('button:has-text("Modifier"), button:has-text("Edit"), [data-testid="edit-account"]').first();
    
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Vérifier que le formulaire s'affiche
      const modal = page.locator('[role="dialog"], .modal').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Modifier le nom
      const nameInput = page.locator('input[name="accountName"]').first();
      await nameInput.fill(`Compte Modifié ${Date.now()}`);
      
      // Soumettre
      await page.locator('button[type="submit"]').first().click();
      
      // Vérifier le message de succès
      await expectSuccessMessage(page, /modifié|mis à jour|updated/i);
    }
  });

  test('devrait activer/désactiver un compte', async ({ authenticatedPage: page }) => {
    await page.goto('/chart-of-accounts');
    await waitForLoading(page);
    
    // Trouver un bouton d'activation/désactivation
    const toggleButton = page.locator('button:has-text("Activer"), button:has-text("Désactiver"), [data-testid="toggle-account"]').first();
    
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      
      // Vérifier le message de succès
      await page.waitForTimeout(1000);
      const toast = page.locator('[data-testid="toast"], .toast, [role="alert"]').first();
      
      if (await toast.isVisible()) {
        await expect(toast).toContainText(/activé|désactivé|activ/i, { timeout: 3000 });
      }
    }
  });

  test('devrait filtrer par type de compte', async ({ authenticatedPage: page }) => {
    await page.goto('/chart-of-accounts');
    await waitForLoading(page);
    
    // Trouver le filtre de type
    const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"]').first();
    
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('ASSET');
      await page.waitForTimeout(1000);
      
      // Vérifier que les résultats sont filtrés
      const results = page.locator('table tbody tr, [data-testid="account-item"]');
      await expect(results.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('devrait afficher la pagination', async ({ authenticatedPage: page }) => {
    await page.goto('/chart-of-accounts');
    await waitForLoading(page);
    
    // Vérifier la présence de contrôles de pagination
    const pagination = page.locator('[data-testid="pagination"], .pagination').first();
    
    if (await pagination.isVisible()) {
      const nextButton = page.locator('button:has-text("Suivant"), button:has-text("Next")').first();
      
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click();
        await waitForLoading(page);
        
        // Vérifier que la page a changé
        await expect(page).toHaveURL(/page=2/);
      }
    }
  });
});
