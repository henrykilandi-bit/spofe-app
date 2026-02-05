module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/guardian.spec.ts'
  ],
  testPathIgnorePatterns: [
    '/system-tests/',
    '/e2e/',
    '/contract/',
    '/contract-tests/',
    'cross-module',
    'budget',
    'immobilisation',
    'gestion-stocks',
    'Budget Readiness',
    'CONTRACT BUDGET'
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'guardian/**/*.ts',
    'domain/**/*.ts',
    '!**/*.d.ts',
    '!experimental/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};