/**
 * Jest Configuration - ES Module format
 * @type {import('jest').Config}
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.{test,spec}.ts'
  ],
  collectCoverageFrom: [
    'application/**/*.ts',
    'domain/**/*.ts',
    'src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    'tests/integration/guardian-db.spec.ts',
    'tests/constitutionnel/ConstitutionalDefenseLevel2.spec.ts',
    'tests/constitutionnel/TransactionManagerP0.spec.ts',
    'tests/constitutionnel/ConstitutionalLedger.spec.ts'
  ],
  passWithNoTests: true
};
