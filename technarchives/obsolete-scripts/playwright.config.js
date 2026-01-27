import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Configuration Playwright COMPLETE pour tests E2E SPOFE
 * ✅ Reporters avancés (HTML, JSON, JUnit, Allure)
 * ✅ Gestion des traces et debugging
 * ✅ Performance monitoring intégré
 * ✅ Support multi-projets et environnements
 * 
 * Documentation: https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  
  // ===== TIMEOUTS =====
  timeout: 60000, // Global timeout (tests métier peuvent être longs)
  expect: {
    timeout: 10000, // Assertions timeout
  },
  
  // ===== PARALLÉLISATION =====
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined, // Séquentiel en CI, parallèle en local
  
  // ===== REPORTERS AVANCÉS =====
  reporter: [
    // Reporter HTML standard
    ['html', { 
      outputFolder: 'playwright-report',
      open: process.env.CI ? 'never' : 'on-failure',
    }],
    
    // Reporter liste en terminal
    ['list'],
    
    // JSON pour parsing
    ['json', { 
      outputFile: 'playwright-results.json' 
    }],
    
    // JUnit pour CI/CD
    ['junit', { 
      outputFile: 'test-results/junit.xml',
      outputFolder: 'test-results',
    }],
    
    // Allure reports (si installé)
    process.env.USE_ALLURE ? ['allure-playwright'] : null,
    
    // Custom JSON reporter pour performance metrics
    ['json', {
      outputFile: 'test-results/performance-results.json'
    }],
  ].filter(Boolean),
  
  // ===== CONFIGURATION GLOBALE =====
  use: {
    // URL de base
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    baseUrl: process.env.API_URL || 'http://localhost:3001',
    
    // Timeouts pour les actions
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Capture pour debugging
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Locale et timezone
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    
    // Headers de test
    extraHTTPHeaders: {
      'X-Test-Mode': 'true',
      'X-Test-ID': 'playwright-e2e',
    },
  },

  // ===== PROJETS (NAVIGATEURS) =====
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Performance metrics
        launchArgs: [
          '--disable-blink-features=AutomationControlled'
        ],
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
      },
    },

    // Projet de performance (une seule instance)
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: '**/perf.spec.js',
    },

    // Projet smoke tests rapides (CI-optimized)
    {
      name: 'smoke',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: '**/smoke.spec.js',
    },
  ],

  // ===== SERVEURS =====
  webServer: [
    {
      command: 'cd cascade && npm run dev',
      url: 'http://localhost:3001/health',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
        LOG_LEVEL: 'warn',
      },
    },
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:5173',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
  ],

  // ===== OUTPUT DIRS =====
  outputDir: 'test-results/output',
  snapshotDir: path.join(__dirname, 'e2e', '__snapshots__'),
  
  // ===== FORBID ONLY =====
  forbidOnly: !!process.env.CI,
});
