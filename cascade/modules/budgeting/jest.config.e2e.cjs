module.exports = {
  displayName: "Budget E2E Tests",
  testEnvironment: "node",
  testMatch: [
    "**/tests/e2e/**/*.e2e.spec.ts"
  ],
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
  rootDir: ".",
  testTimeout: 30000,
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  collectCoverageFrom: [
    "src/**/*.(t|j)s"
  ],
  coverageDirectory: "./coverage-e2e",
  setupFilesAfterEnv: ["<rootDir>/tests/e2e/setup.ts"],
  globalTeardown: "<rootDir>/tests/e2e/teardown.ts",
  testSequencer: "<rootDir>/tests/e2e/sequencer.js"
};