import { test } from '@playwright/test';

/**
 * Helper d'authentification pour tests E2E
 * Gère login/logout et session persistence
 */

export class AuthHelper {
  constructor(page, context) {
    this.page = page;
    this.context = context;
  }

  /**
   * Login avec credentials
   */
  async login(username = 'admin@spofe.com', password = 'Admin@123456') {
    // Naviguer vers login
    await this.page.goto('/login');
    
    // Remplir credentials
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Attendre redirection
    await this.page.waitForURL('/dashboard');
    
    // Attendre que le token soit stocké
    await this.page.waitForFunction(() => {
      return localStorage.getItem('token') !== null;
    });
    
    return {
      username,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Login API (plus rapide)
   */
  async loginAPI(username = 'admin@spofe.com', password = 'Admin@123456') {
    const response = await this.page.request.post('http://localhost:3001/api/auth/login', {
      data: {
        username,
        password,
      },
    });
    
    const { token, refreshToken } = await response.json();
    
    // Stocker tokens
    await this.context.addInitScript((token, refreshToken) => {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    }, token, refreshToken);
    
    return { token, refreshToken };
  }

  /**
   * Logout
   */
  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-btn"]');
    await this.page.waitForURL('/login');
  }

  /**
   * Vérifier si authentifié
   */
  async isAuthenticated() {
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('token');
    });
    return !!token;
  }

  /**
   * Définir headers API pour requêtes
   */
  async getAuthHeaders() {
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('token');
    });
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Attendre le load initial après login
   */
  async waitForDashboard() {
    await this.page.waitForSelector('[data-testid="dashboard-container"]');
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * Fixture pour authentification automatique
 */
export const authenticatedPage = test.extend({
  authenticatedPage: async ({ page, context }, use) => {
    const authHelper = new AuthHelper(page, context);
    await authHelper.loginAPI();
    await use(page);
    // Cleanup: logout
    try {
      await authHelper.logout();
    } catch (e) {
      // Page may be closed
    }
  },
});
