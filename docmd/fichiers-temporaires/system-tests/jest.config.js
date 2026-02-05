export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e', '<rootDir>/performance'],
  testMatch: [
    '**/e2e/**/*.spec.ts',
    '**/performance/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/setup-system-tests.ts'],
  collectCoverageFrom: [
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage-system',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapping: {
    '^@spofe/(.*)$': '<rootDir>/../cascade/modules/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1'
  },
  testTimeout: 30000
};