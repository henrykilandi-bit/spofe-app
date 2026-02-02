/**
 * Vitest Configuration — Contract Tests (FE ↔ BE)
 * 
 * Configuration spécifique pour les tests contractuels.
 * Environnement: node (pas jsdom)
 * Cible: Backend réel
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/contract-tests/**/*.spec.{js,ts}'],
    testTimeout: 30000, // 30s pour laisser le temps au backend
    hookTimeout: 30000,
    reporters: ['verbose'],
    // Pas de setup React/DOM
  },
});
