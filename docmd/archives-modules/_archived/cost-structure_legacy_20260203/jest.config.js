export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/tests'],
  testMatch: [
    '**/test/unit/**/*.spec.ts',
    '**/test/integration/**/*.spec.ts',
    '**/test/contract/**/*.spec.ts',
    '**/tests/unit/**/*.spec.ts',
    '**/tests/integration/**/*.spec.ts',
    '**/tests/contract/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '/system-tests/',
    '/e2e/',
    'budget-integration',
    'cross-module'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'domain/**/*.ts',
    'infrastructure/**/*.ts',
    'application/**/*.ts',
    '!**/*.d.ts',
    '!experimental/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@cost-structure/(.*)$': '<rootDir>/$1',
    '^@shared/(.*)$': '<rootDir>/../../shared/$1'
  }
};