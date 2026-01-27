/**
 * Tests E2E pour l'authentification
 */

import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('devrait afficher la page de connexion', async ({ page }) => {
    await expect(page).toHaveTitle(/SPOFE/i);
    await expect(page.locator('h1, h2')).toContainText(/connexion|login/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('devrait se connecter avec des identifiants valides', async ({ page }) => {
    // Remplir le formulaire
    await page.fill('input[name="email"]', 'admin@spofe.local');
    await page.fill('input[name="password"]', 'Admin123!');
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Vérifier que le token est stocké
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/); // Format JWT
  });

  test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Ne devrait pas rediriger
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
    
    // Vérifier le message d'erreur
    const error = page.locator('[data-testid="error"], .error, [role="alert"]').first();
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test('devrait valider les champs requis', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Vérifier les erreurs de validation HTML5
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('devrait se déconnecter correctement', async ({ page }) => {
    // Se connecter d'abord
    await page.fill('input[name="email"]', 'admin@spofe.local');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/', { timeout: 10000 });
    
    // Cliquer sur le bouton de déconnexion
    const logoutButton = page.locator('button:has-text("Déconnexion"), button:has-text("Logout"), [data-testid="logout"]').first();
    await logoutButton.click();
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
    
    // Vérifier que le token est supprimé
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('devrait rediriger vers login si non authentifié', async ({ page }) => {
    // Essayer d'accéder à une page protégée sans authentification
    await page.goto('/dashboard');
    
    // Devrait rediriger vers login
    await expect(page).toHaveURL('/login', { timeout: 5000 });
  });
});
