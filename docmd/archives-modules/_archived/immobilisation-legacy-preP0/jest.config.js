export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/unit/**/*.spec.ts',
    '**/tests/integration/**/*.spec.ts',
    '**/tests/contract/**/*.spec.ts',
    '**/guardian/**/*.spec.ts'
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
    'guardian/**/*.ts',
    'write/**/*.ts',
    'application/**/*.ts',
    'domain/**/*.ts',
    '!**/*.d.ts',
    '!experimental/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@immobilisation/(.*)$': '<rootDir>/$1',
    '^@shared/(.*)$': '<rootDir>/../../shared/$1'
  }
};