import { vi } from 'vitest';
import { sequelize } from '../src/config/database.js';

// Mock de Sequelize pour éviter connexions DB réelles pendant tests
vi.mock('../src/config/database.js', () => ({
  sequelize: {
    authenticate: vi.fn().mockResolvedValue(true),
    sync: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(true),
    transaction: vi.fn((callback) => {
      return callback({
        commit: vi.fn().mockResolvedValue(true),
        rollback: vi.fn().mockResolvedValue(true)
      });
    })
  }
}));

// Cleanup après chaque test
afterEach(() => {
  vi.clearAllMocks();
});

// Fermeture propre après tous les tests
afterAll(async () => {
  if (sequelize?.close) {
    await sequelize.close();
  }
});
