/**
 * 🧪 Configuration Jest pour Module Tresoconsolidation
 * 
 * Configuration optimisée pour les tests P0 du Guardian + projections
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85
    }
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  verbose: true,
  testTimeout: 10000,
  maxWorkers: 1,
  forceExit: true
};