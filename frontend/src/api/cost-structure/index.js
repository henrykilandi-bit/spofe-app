/**
 * Cost-Structure API Client
 * 
 * ⚠️ AUTO-GENERATED FROM OPENAPI — DO NOT EDIT MANUALLY
 * Source: cascade/modules/cost-structure/openapi/cost-structure.openapi.json
 * Version: 1.0.0
 * Generated: 2026-02-01
 * 
 * Regenerate with:
 *   npm run api:generate:cost-structure
 */

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} OpenAPIConfig
 * @property {string} BASE - Base URL for API calls
 * @property {string} VERSION - API version
 * @property {() => string|null} TOKEN - Function returning auth token
 * @property {() => string|null} TENANT_ID - Function returning tenant ID
 */

/** @type {OpenAPIConfig} */
export const OpenAPI = {
  BASE: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  VERSION: '1.0.0',
  TOKEN: () => localStorage.getItem('token'),
  TENANT_ID: () => localStorage.getItem('tenantId'),
};

// ─────────────────────────────────────────────────────────────
// MODELS (DTOs)
// ─────────────────────────────────────────────────────────────

/**
 * Budget-ready project for Budget module consumption (COUT-BUD-01)
 * @typedef {Object} BudgetReadyProjectDTO
 * @property {string} tenantId - Tenant ID (isolation multi-tenant)
 * @property {string} projectId - Project unique identifier
 * @property {string} projectName - Project display name
 * @property {number} version - Cost structure version (>= 1)
 * @property {number} unitCost - Unit cost validated
 * @property {number} totalCost - Total cost validated
 * @property {number} netMargin - Net margin rate (0-1)
 * @property {number} marginAt70 - Margin at 70% sales (must be > 0 per COUT-01)
 */

/**
 * Economic project summary
 * @typedef {Object} CostProjectDTO
 * @property {string} tenantId - Tenant ID
 * @property {string} projectId - Project unique identifier
 * @property {string} name - Project name
 * @property {'PRODUCT'|'SERVICE'|'PROJECT'} type - Project type
 * @property {'DRAFT'|'SIMULATED'|'VALIDATED'|'REJECTED'} status - Project status
 * @property {number} currentVersion - Current version number
 * @property {string} createdAt - Project created at (ISO 8601)
 * @property {string|null} validatedAt - Project validated at (null if not validated)
 * @property {string} createdBy - Created by user
 * @property {number|null} currentUnitCost - Current unit cost (from latest version)
 * @property {number|null} currentTotalCost - Current total cost (from latest version)
 */

/**
 * Cost structure version details
 * @typedef {Object} CostStructureDTO
 * @property {string} tenantId - Tenant ID
 * @property {string} projectId - Project ID
 * @property {number} version - Version number
 * @property {'DRAFT'|'SIMULATED'|'FROZEN'} status - Structure status
 * @property {number} unitCost - Unit cost
 * @property {number} totalCost - Total cost
 * @property {number} netMargin - Net margin rate
 * @property {number} marginAt70 - Margin at 70% sales
 * @property {boolean} viableAt70 - Viability at 70% (true if marginAt70 > 0)
 * @property {string} createdBy - Created by user
 * @property {string} createdAt - Created at timestamp (ISO 8601)
 * @property {string|null} frozenAt - Frozen at timestamp (null if not frozen)
 */

/**
 * Cost line item
 * @typedef {Object} CostLineDTO
 * @property {string} lineId - Line unique identifier
 * @property {string} tenantId - Tenant ID
 * @property {string} projectId - Project ID
 * @property {number} version - Version number
 * @property {'RAW_MATERIAL'|'LABOR'|'SUBCONTRACTING'|'OVERHEAD'} category - Cost category
 * @property {string} description - Line description
 * @property {string} unit - Unit of measure
 * @property {number} quantity - Quantity
 * @property {number} unitPrice - Unit price
 * @property {number} totalAmount - Total line amount
 * @property {string} createdAt - Created at timestamp (ISO 8601)
 */

/**
 * Simulation results
 * @typedef {Object} CostSimulationDTO
 * @property {string} simulationId - Simulation ID
 * @property {string} tenantId - Tenant ID
 * @property {string} projectId - Project ID
 * @property {number} version - Version number
 * @property {number} salesVolume - Sales volume used for simulation
 * @property {number} unitCost - Unit cost at this volume
 * @property {number} totalCost - Total cost at this volume
 * @property {number} netMargin - Net margin at this volume
 * @property {number} marginAt70 - Margin at 70% of sales volume
 * @property {boolean} viableAt70 - Is viable at 70% (marginAt70 > 0)
 * @property {number} breakEvenPoint - Break-even point in units
 * @property {string} createdAt - Created at timestamp (ISO 8601)
 */

/**
 * Cost breakdown by category
 * @typedef {Object} CostBreakdownDTO
 * @property {number} variable - Total variable costs
 * @property {number} fixed - Total fixed costs
 * @property {number} indirect - Total indirect costs
 * @property {number} total - Total sum of all costs
 */

/**
 * Cost structure summary for Budget integration
 * @typedef {Object} CostStructureSummaryDTO
 * @property {string} tenantId - Tenant ID (isolation multi-tenant)
 * @property {string} projectId - Project unique identifier
 * @property {number} version - Cost structure version
 * @property {CostBreakdownDTO} costBreakdown - Cost breakdown by category
 * @property {number} costLinesCount - Number of cost lines
 * @property {'DRAFT'|'FROZEN'} status - Structure status
 * @property {string|null} frozenAt - Frozen at timestamp (null if not frozen)
 */

/**
 * Validation decision record
 * @typedef {Object} CostDecisionDTO
 * @property {string} tenantId - Tenant ID
 * @property {string} projectId - Project ID
 * @property {number} version - Version number
 * @property {'VALIDATED'|'REJECTED'} decision - Decision type
 * @property {string} decidedBy - User who made the decision
 * @property {string} decidedAt - Decision timestamp (ISO 8601)
 * @property {string|null} justification - Decision justification
 */

// ─────────────────────────────────────────────────────────────
// HTTP CLIENT CORE
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ApiResponse
 * @template T
 * @property {T} data - Response data
 * @property {number} status - HTTP status code
 * @property {boolean} ok - Whether request was successful
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} status - HTTP status code
 * @property {Object} [details] - Additional error details
 */

/**
 * Make an API request with automatic headers
 * @template T
 * @param {string} path - API path (relative to BASE)
 * @param {Object} [options] - Fetch options
 * @returns {Promise<T>}
 * @throws {ApiError}
 */
async function request(path, options = {}) {
  const url = `${OpenAPI.BASE}${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Inject tenant ID header
  const tenantId = OpenAPI.TENANT_ID();
  if (tenantId) {
    headers['X-Tenant-Id'] = tenantId;
  }

  // Inject auth token
  const token = OpenAPI.TOKEN();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw {
      message: errorBody.message || `HTTP ${response.status}`,
      status: response.status,
      details: errorBody,
    };
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return /** @type {T} */ (null);
  }

  return /** @type {T} */ (await response.json());
}

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────

/**
 * Budget-Ready Projects Service
 * 
 * Endpoints for Budget module consumption (COUT-BUD-01)
 */
export const BudgetReadyService = {
  /**
   * List all budget-ready projects
   * @returns {Promise<BudgetReadyProjectDTO[]>}
   */
  async listProjects() {
    return request('/cost-structure/budget-ready/projects');
  },

  /**
   * Get a specific budget-ready project by ID
   * @param {string} projectId - Project identifier
   * @returns {Promise<BudgetReadyProjectDTO>}
   */
  async getProject(projectId) {
    return request(`/cost-structure/budget-ready/projects/${projectId}`);
  },

  /**
   * Get cost structure summary for Budget integration
   * @param {string} projectId - Project identifier
   * @param {number} version - Cost structure version
   * @returns {Promise<CostStructureSummaryDTO>}
   */
  async getCostSummary(projectId, version) {
    return request(`/cost-structure/budget-ready/projects/${projectId}/versions/${version}/summary`);
  },
};

/**
 * Cost Projects Service
 * 
 * Economic project listing and details
 */
export const CostProjectsService = {
  /**
   * List economic projects with optional filters
   * @param {Object} [filters] - Optional filters
   * @param {'DRAFT'|'SIMULATED'|'VALIDATED'|'REJECTED'} [filters.status] - Filter by status
   * @param {'PRODUCT'|'SERVICE'|'PROJECT'} [filters.type] - Filter by type
   * @returns {Promise<CostProjectDTO[]>}
   */
  async listProjects(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    
    const query = params.toString();
    return request(`/cost-structure/projects${query ? `?${query}` : ''}`);
  },
};

/**
 * Cost Structure Service
 * 
 * Cost structure versions, lines, and simulations
 */
export const CostStructureService = {
  /**
   * Get current cost structure for a project
   * @param {string} projectId - Project identifier
   * @returns {Promise<CostStructureDTO>}
   */
  async getCurrentStructure(projectId) {
    return request(`/cost-structure/projects/${projectId}/structure`);
  },

  /**
   * Get cost lines for a specific version
   * @param {string} projectId - Project identifier
   * @param {number} version - Cost structure version
   * @returns {Promise<CostLineDTO[]>}
   */
  async getCostLines(projectId, version) {
    return request(`/cost-structure/projects/${projectId}/structure/${version}/lines`);
  },

  /**
   * Get simulation results for a specific version
   * @param {string} projectId - Project identifier
   * @param {number} version - Cost structure version
   * @returns {Promise<CostSimulationDTO>}
   */
  async getSimulation(projectId, version) {
    return request(`/cost-structure/projects/${projectId}/structure/${version}/simulation`);
  },

  /**
   * Get validation decision for a project
   * @param {string} projectId - Project identifier
   * @returns {Promise<CostDecisionDTO>}
   */
  async getDecision(projectId) {
    return request(`/cost-structure/projects/${projectId}/decision`);
  },
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export default {
  OpenAPI,
  BudgetReadyService,
  CostProjectsService,
  CostStructureService,
};
