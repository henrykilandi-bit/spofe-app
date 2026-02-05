/**
 * Jest Configuration — Contract Tests Module Immobilisation
 * SPOFE v1.0.0
 * 
 * Tests de validation OpenAPI ↔ Backend (NIVEAU 2)
 * 
 * ⚠️ RÈGLES SPOFE:
 * ✅ Utilise jest-openapi pour validation automatique
 * ✅ Backend réel (pas de mock)
 * ✅ Valide structure + types + statuts HTTP
 * ❌ Aucune hypothèse implicite
 */

module.exports = {
  displayName: 'immobilisation-contract',
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test patterns - uniquement les tests contractuels
  roots: ['<rootDir>/tests/contract'],
  testMatch: ['**/*.contract.spec.ts'],
  
  // Setup jest-openapi
  setupFilesAfterEnv: [
    '<rootDir>/tests/contract/setup.contract.ts',
  ],
  
  // TypeScript
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        isolatedModules: true,
      },
    ],
  },
  
  // Module resolution
  moduleNameMapper: {
    '^@immobilisation/(.*)$': '<rootDir>/$1',
  },
  
  // Timeouts pour tests contractuels
  testTimeout: 15000,
  
  // Run in band (séquentiel)
  maxWorkers: 1,
  
  // Verbose output
  verbose: true,
  
  // Bail on first failure in CI
  bail: process.env.CI === 'true' ? 1 : 0,
  
  // Reporter pour CI
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage/contract',
      outputName: 'contract-test-results.xml',
      suiteName: 'Immobilisation Contract Tests',
    }],
  ],
};
