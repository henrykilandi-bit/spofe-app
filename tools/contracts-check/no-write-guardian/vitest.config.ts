import { defineConfig } from 'vitest/config';
import * as path from 'path';

export default defineConfig({
  test: {
    name: 'NO WRITE OUTSIDE GUARDIAN',
    environment: 'node',
    include: ['*.spec.ts'],
    reporters: ['verbose'],
    allowOnly: false,
    globals: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../../'),
    },
  },
});
