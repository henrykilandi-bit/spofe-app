/**
 * E2E Test Setup - SPOFE System Tests
 * Global configuration et helpers pour tests inter-modules
 * Mode SIMULATION pour démo BUILD_PROOF système
 */

// Configuration globale pour tests système (mode simulation)
export const SYSTEM_TEST_CONFIG = {
  mode: 'SIMULATION', // Pas de DB réelle pour démo
  timeouts: {
    default: 30000,
    longRunning: 60000
  }
};

// Mock database pour simulation
class MockDatabase {
  private data: Map<string, any[]> = new Map();

  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    // Simulation des requêtes pour démo
    console.log(`[SIMULATION] SQL: ${sql.substring(0, 50)}...`);
    
    if (sql.includes('INSERT INTO')) {
      // Simuler insertion
      return { rows: [{ id: params[0] || 'mock-id' }] };
    }
    
    if (sql.includes('SELECT')) {
      // Simuler sélection avec données de test
      if (sql.includes('cost_allocations')) {
        if (sql.includes('category')) {
          return { rows: [{ amount: '15000', category: 'DEPRECIATION' }] };
        }
        return { rows: [{ amount: '15000', budget_id: params[0], source_type: 'STOCK_RECEIPT' }] };
      }
      if (sql.includes('budget_summary')) {
        return { rows: [{ consumed_amount: '2000', remaining_amount: '3000' }] };
      }
      if (sql.includes('stock_summary')) {
        return { rows: [{ stock_qty: '100' }] };
      }
      if (sql.includes('COUNT')) {
        return { rows: [{ count: '1' }] };
      }
      return { rows: [{ mock_data: true }] };
    }
    
    if (sql.includes('UPDATE')) {
      return { rows: [] };
    }
    
    return { rows: [] };
  }

  async end(): Promise<void> {
    console.log('[SIMULATION] Database connection closed');
  }
}

// Global database connection (mock)
let dbPool: MockDatabase | null = null;

export async function getSystemDatabase(): Promise<MockDatabase> {
  if (!dbPool) {
    dbPool = new MockDatabase();
    console.log('[SIMULATION] Mock database initialized');
  }
  return dbPool;
}

export async function cleanupSystemDatabase(): Promise<void> {
  if (dbPool) {
    await dbPool.end();
    dbPool = null;
  }
}

// Test data constants
export const TEST_TENANTS = {
  SYSTEM_A: 'system-tenant-a',
  SYSTEM_B: 'system-tenant-b'
};

export const TEST_IDS = {
  PROJECT_1: 'proj-e2e-001',
  PROJECT_2: 'proj-e2e-002',
  BUDGET_1: 'budget-e2e-001',
  ASSET_1: 'asset-e2e-001'
};

beforeAll(async () => {
  await getSystemDatabase();
  console.log('[SIMULATION] System E2E tests initialized in simulation mode');
});

afterAll(async () => {
  await cleanupSystemDatabase();
  console.log('[SIMULATION] System E2E tests cleanup completed');
});