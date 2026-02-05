import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'SPOFE Dependencies Compliance',
    environment: 'node',
    include: ['tools/dependencies-check/**/*.spec.ts'],
    exclude: ['node_modules/**'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['tools/dependencies-check/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.test.ts']
    },
    timeout: 10000,
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': './tools/dependencies-check'
    }
  }
})