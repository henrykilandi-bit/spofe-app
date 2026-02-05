/**
 * Jest Configuration — E2E Tests Module Immobilisation
 * SPOFE v1.0.0
 */

export default {
  displayName: 'immobilisation-e2e',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  
  // Test patterns
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/*.e2e.spec.ts'],
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],
  
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
  
  // Coverage
  collectCoverageFrom: [
    'api/**/*.ts',
    '!api/**/*.module.ts',
    '!api/**/index.ts',
  ],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Timeouts for E2E
  testTimeout: 30000,
  
  // Run in band for database tests
  maxWorkers: 1,
  
  // Verbose output
  verbose: true,
  
  // Bail on first failure in CI
  bail: process.env.CI === 'true' ? 1 : 0,
  
  // Global teardown
  globalTeardown: '<rootDir>/tests/e2e/teardown.ts',
};
