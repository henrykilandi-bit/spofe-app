export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/unit/guardian.unit.spec.ts'
  ],
  testPathIgnorePatterns: [
    '/system-tests/',
    '/e2e/',
    'budget-integration',
    'cross-module',
    '/integration/',
    '/contract/'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'guardian/**/*.ts',
    '!**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@immobilisation/(.*)$': '<rootDir>/$1',
    '^@shared/(.*)$': '<rootDir>/../../shared/$1'
  }
};