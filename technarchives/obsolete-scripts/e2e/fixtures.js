/**
 * Fixtures et helpers pour les tests E2E Playwright
 * 
 * Fournit:
 * - Authentification automatique
 * - Données de test
 * - Fonctions utilitaires
 */

import { test as base, expect } from '@playwright/test';

/**
 * Utilisateur de test par défaut
 */
export const TEST_USER = {
  email: 'admin@spofe.local',
  password: 'Admin123!',
};

/**
 * Configuration API
 */
export const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

/**
 * Fixture personnalisée avec authentification
 */
export const test = base.extend({
  // Contexte authentifié pour tous les tests
  authenticatedPage: async ({ page }, use) => {
    // Naviguer vers la page de login
    await page.goto('/login');
    
    // Remplir le formulaire de connexion
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // Attendre la redirection après login
    await page.waitForURL('/', { timeout: 10000 });
    
    // Vérifier que le token est présent
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    
    // Utiliser la page authentifiée
    await use(page);
  },
});

/**
 * Helper: Attendre la disparition du loader
 */
export async function waitForLoading(page) {
  await page.waitForSelector('[data-testid="loader"]', { state: 'hidden', timeout: 5000 }).catch(() => {
    // Ignore si le loader n'est pas présent
  });
}

/**
 * Helper: Remplir un formulaire générique
 */
export async function fillForm(page, formData) {
  for (const [name, value] of Object.entries(formData)) {
    if (value !== null && value !== undefined) {
      const input = page.locator(`input[name="${name}"], select[name="${name}"], textarea[name="${name}"]`).first();
      await input.fill(String(value));
    }
  }
}

/**
 * Helper: Vérifier un message de succès
 */
export async function expectSuccessMessage(page, message) {
  const toast = page.locator('[data-testid="toast"], .toast, [role="alert"]').first();
  await expect(toast).toContainText(message, { timeout: 5000 });
}

/**
 * Helper: Vérifier un message d'erreur
 */
export async function expectErrorMessage(page, message) {
  const error = page.locator('[data-testid="error"], .error, [role="alert"]').first();
  await expect(error).toContainText(message, { timeout: 5000 });
}

/**
 * Helper: Créer une entreprise de test via API
 */
export async function createTestCompany(page) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  
  const response = await page.request.post(`${API_BASE_URL}/companies`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      name: `Test Compagnie ${Date.now()}`,
      taxId: `TX${Date.now()}`,
      address: '123 Test Street',
      city: 'Test City',
      country: 'France',
    },
  });
  
  const body = await response.json();
  return body.data;
}

/**
 * Helper: Créer un compte via API
 */
export async function createTestAccount(page, companyId, accountData = {}) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  
  const defaultData = {
    companyId,
    accountNumber: `${Date.now()}`,
    accountName: `Test Account ${Date.now()}`,
    accountType: 'ASSET',
    ...accountData,
  };
  
  const response = await page.request.post(`${API_BASE_URL}/chart-of-accounts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: defaultData,
  });
  
  const body = await response.json();
  return body.data;
}

/**
 * Helper: Créer un tiers via API
 */
export async function createTestThirdParty(page, companyId, thirdPartyData = {}) {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  
  const defaultData = {
    companyId,
    code: `TP${Date.now()}`,
    name: `Test Third Party ${Date.now()}`,
    type: 'CUSTOMER',
    email: 'test@example.com',
    ...thirdPartyData,
  };
  
  const response = await page.request.post(`${API_BASE_URL}/third-parties`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: defaultData,
  });
  
  const body = await response.json();
  return body.data;
}

/**
 * Helper: Générer des données de test aléatoires
 */
export function generateTestData(type) {
  const timestamp = Date.now();
  
  const generators = {
    account: {
      accountNumber: `TEST${timestamp}`,
      accountName: `Compte Test ${timestamp}`,
      accountType: 'ASSET',
      description: 'Compte créé par les tests E2E',
    },
    
    thirdParty: {
      code: `CLI${timestamp}`,
      name: `Client Test ${timestamp}`,
      type: 'CUSTOMER',
      email: `test${timestamp}@example.com`,
      phone: '+33123456789',
      address: '123 Rue de Test',
      city: 'Paris',
      country: 'France',
    },
    
    journalEntry: {
      entryDate: new Date().toISOString().split('T')[0],
      journalCode: 'OD',
      description: `Écriture de test ${timestamp}`,
      reference: `REF${timestamp}`,
    },
  };
  
  return generators[type] || {};
}

export { expect };
