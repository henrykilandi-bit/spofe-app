/**
 * Jest Configuration for Integration Tests
 *
 * Purpose: Run tests against REAL PostgreSQL (not mocks)
 */

module.exports = {
  // Use Jest for test runner
  testEnvironment: 'node',

  // TypeScript support
  preset: 'ts-jest',

  // Root directories
  roots: ['<rootDir>/tests'],

  // Test patterns
  testMatch: ['**/tests/integration/**/*.spec.ts'],

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Timeouts (integration tests are slower)
  testTimeout: 30000, // 30 seconds per test

  // Collect coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/__tests__/**',
    '!src/index.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/integration',

  // Verbose output
  verbose: true,

  // Bail on first failure (critical for authority tests)
  bail: false, // Don't stop on first failure; run all tests

  // Display results
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-results',
      outputName: 'integration-tests.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathAsClassName: false,
    }],
  ],

  // Setup files
  setupFilesAfterEnv: [],

  // Global setup/teardown (optional)
  // globalSetup: '<rootDir>/tests/setup.ts',
  // globalTeardown: '<rootDir>/tests/teardown.ts',

  // Skip node_modules
  testPathIgnorePatterns: ['/node_modules/', '/build/'],

  // Transform files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Module extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
};
