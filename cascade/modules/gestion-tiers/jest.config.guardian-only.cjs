module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tests/guardian/**/*.spec.ts"
  ],
  collectCoverageFrom: [
    "src/domain/guardian/**/*.ts",
    "!src/domain/guardian/**/*.d.ts"
  ],
  coverageDirectory: "coverage/guardian-build-proof",
  coverageReporters: ["json", "text"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 5000,
  verbose: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};