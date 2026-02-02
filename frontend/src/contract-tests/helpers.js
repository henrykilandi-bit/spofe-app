/**
 * Contract Test Helpers
 * ---------------------
 * Utilitaires pour les tests contractuels FE↔BE
 * 
 * @module contract-test-helpers
 */

/**
 * Backend URL for contract tests
 * @type {string}
 */
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/**
 * Check if running in mock mode
 * @type {boolean}
 */
export const IS_MOCK_MODE = process.env.CONTRACT_TEST_MODE === 'mock';

/**
 * Test tenant IDs
 */
export const TEST_TENANTS = {
  TENANT_A: 'tenant-a-test',
  TENANT_B: 'tenant-b-test',
  INVALID: 'invalid-tenant'
};

/**
 * Mock data matching OpenAPI schemas
 */
export const MOCK_DATA = {
  /** @type {import('../../api/cost-structure/types').BudgetReadyProjectDto[]} */
  budgetReadyProjects: [
    {
      projectId: 'proj-001',
      projectName: 'Test Project Alpha',
      status: 'READY',
      totalCost: 150000,
      lastUpdated: new Date().toISOString()
    },
    {
      projectId: 'proj-002',
      projectName: 'Test Project Beta',
      status: 'PENDING_VALIDATION',
      totalCost: 75000,
      lastUpdated: new Date().toISOString()
    }
  ],
  
  /** @type {import('../../api/cost-structure/types').CostProjectResponseDto[]} */
  costProjects: [
    {
      id: 'proj-001',
      name: 'Test Project Alpha',
      description: 'Project for contract testing',
      status: 'ACTIVE',
      totalBudget: 200000,
      allocatedCost: 150000,
      remainingBudget: 50000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],

  /** @type {import('../../api/cost-structure/types').CostStructureResponseDto} */
  costStructure: {
    id: 'cs-001',
    projectId: 'proj-001',
    version: 1,
    status: 'DRAFT',
    lines: [
      {
        id: 'line-001',
        category: 'PERSONNEL',
        description: 'Development Team',
        unitCost: 5000,
        quantity: 10,
        totalCost: 50000
      }
    ],
    totalCost: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  /** @type {import('../../api/cost-structure/types').SimulationResultDto} */
  simulationResult: {
    id: 'sim-001',
    structureId: 'cs-001',
    scenarioName: 'Optimistic',
    adjustments: [
      {
        lineId: 'line-001',
        adjustment: 0.1,
        newTotalCost: 55000
      }
    ],
    originalTotalCost: 50000,
    simulatedTotalCost: 55000,
    variance: 5000,
    variancePercent: 10,
    createdAt: new Date().toISOString()
  }
};

/**
 * Create headers with tenant ID
 * @param {string} tenantId 
 * @returns {Record<string, string>}
 */
export function createHeaders(tenantId = TEST_TENANTS.TENANT_A) {
  return {
    'Content-Type': 'application/json',
    'X-Tenant-Id': tenantId,
    'Authorization': 'Bearer test-token'
  };
}

/**
 * Make HTTP request to backend
 * @param {string} method 
 * @param {string} path 
 * @param {object} options 
 * @returns {Promise<{status: number, data: any, headers: Headers}>}
 */
export async function apiRequest(method, path, { body, headers = {}, tenantId } = {}) {
  if (IS_MOCK_MODE) {
    return mockRequest(method, path, { body, headers, tenantId });
  }

  const url = `${BACKEND_URL}${path}`;
  const requestHeaders = {
    ...createHeaders(tenantId),
    ...headers
  };

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    data,
    headers: response.headers
  };
}

/**
 * Mock request handler for offline testing
 * @param {string} method 
 * @param {string} path 
 * @param {object} options 
 * @returns {Promise<{status: number, data: any, headers: Headers}>}
 */
async function mockRequest(method, path, { tenantId } = {}) {
  // Simulate missing tenant header
  if (!tenantId) {
    return { status: 401, data: { error: 'Missing X-Tenant-Id header' }, headers: new Headers() };
  }

  // Route matching
  if (path.includes('/budget-ready/projects')) {
    return { status: 200, data: MOCK_DATA.budgetReadyProjects, headers: new Headers() };
  }
  
  if (path.match(/\/projects\/[^/]+\/structure$/)) {
    return { status: 200, data: MOCK_DATA.costStructure, headers: new Headers() };
  }
  
  if (path.match(/\/projects\/[^/]+$/)) {
    const projectId = path.split('/').pop();
    const project = MOCK_DATA.costProjects.find(p => p.id === projectId);
    if (project) {
      return { status: 200, data: project, headers: new Headers() };
    }
    return { status: 404, data: { error: 'Project not found' }, headers: new Headers() };
  }
  
  if (path === '/cost-structure/projects') {
    return { status: 200, data: MOCK_DATA.costProjects, headers: new Headers() };
  }

  if (path.includes('/simulation')) {
    if (method === 'POST') {
      return { status: 201, data: MOCK_DATA.simulationResult, headers: new Headers() };
    }
    return { status: 200, data: MOCK_DATA.simulationResult, headers: new Headers() };
  }

  return { status: 404, data: { error: 'Not found' }, headers: new Headers() };
}

/**
 * Schema validators based on OpenAPI types
 */
export const validators = {
  /**
   * Validate BudgetReadyProjectDto shape
   * @param {any} obj 
   * @returns {boolean}
   */
  isBudgetReadyProject(obj) {
    return (
      typeof obj === 'object' &&
      typeof obj.projectId === 'string' &&
      typeof obj.projectName === 'string' &&
      typeof obj.status === 'string' &&
      typeof obj.totalCost === 'number' &&
      typeof obj.lastUpdated === 'string'
    );
  },

  /**
   * Validate CostProjectResponseDto shape
   * @param {any} obj 
   * @returns {boolean}
   */
  isCostProject(obj) {
    return (
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.status === 'string'
    );
  },

  /**
   * Validate CostStructureResponseDto shape
   * @param {any} obj 
   * @returns {boolean}
   */
  isCostStructure(obj) {
    return (
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.projectId === 'string' &&
      typeof obj.version === 'number' &&
      typeof obj.status === 'string' &&
      Array.isArray(obj.lines)
    );
  },

  /**
   * Validate SimulationResultDto shape
   * @param {any} obj 
   * @returns {boolean}
   */
  isSimulationResult(obj) {
    return (
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.structureId === 'string' &&
      typeof obj.originalTotalCost === 'number' &&
      typeof obj.simulatedTotalCost === 'number'
    );
  },

  /**
   * Validate ISO date string
   * @param {string} str 
   * @returns {boolean}
   */
  isISODate(str) {
    if (typeof str !== 'string') return false;
    const date = new Date(str);
    return !isNaN(date.getTime()) && str.includes('T');
  }
};

/**
 * Contract test utilities
 */
export const contractUtils = {
  /**
   * Skip test if in mock mode with warning
   * @param {string} reason 
   */
  skipInMockMode(reason = 'Requires live backend') {
    if (IS_MOCK_MODE) {
      console.log(`⚠️  Skipped in mock mode: ${reason}`);
      return true;
    }
    return false;
  },

  /**
   * Generate unique test ID
   * @returns {string}
   */
  generateTestId() {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Wait for condition with timeout
   * @param {() => Promise<boolean>} condition 
   * @param {number} timeoutMs 
   * @param {number} intervalMs 
   * @returns {Promise<boolean>}
   */
  async waitFor(condition, timeoutMs = 5000, intervalMs = 100) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (await condition()) return true;
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  }
};
