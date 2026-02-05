/**
 * Jest Configuration - SYSTÈME E2E INTER-MODULES
 * SPOFE v2.1.0 P0+ Governance
 * 
 * SCOPE: Tests E2E inter-modules uniquement
 * EXCLUSIONS: Guardian tests, tests unitaires, tests intra-module
 */

module.exports = {
  displayName: 'SPOFE System E2E Tests',
  testMatch: [
    "<rootDir>/e2e/**/*.e2e.spec.ts"
  ],
  testEnvironment: "node",
  testTimeout: 30000,
  clearMocks: true,
  verbose: true,
  
  // TypeScript support
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Module resolution
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Coverage exclusions - focus on integration flows
  collectCoverageFrom: [
    "e2e/**/*.ts",
    "!e2e/**/*.spec.ts",
    "!e2e/**/fixtures/**",
    "!e2e/**/helpers/**"
  ],
  
  // Setup/teardown for E2E environment
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts'],
  
  // Fail fast on first error in system tests
  bail: true,
  
  // No parallel execution for E2E system tests
  maxWorkers: 1,
  
  // Reporters for BUILD_PROOF generation
  reporters: [
    'default'
  ]
};