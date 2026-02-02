/**
 * Jest Configuration - ES Module format
 * @type {import('jest').Config}
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/cascade'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.{test,spec}.ts'
  ],
  collectCoverageFrom: [
    'cascade/**/*.ts',
    'src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  passWithNoTests: true
};