module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/guardian/**/*.spec.ts',
    '**/tests/unit/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '/system-tests/',
    '/e2e/',
    '/integration/',
    '/contract/',
    '/contract-tests/',
    'cost-structure',
    'immobilisation',
    'gestion-stocks'
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'guardian/**/*.ts',
    'domain/**/*.ts',
    'application/**/*.ts',
    '!**/*.d.ts',
    '!experimental/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};