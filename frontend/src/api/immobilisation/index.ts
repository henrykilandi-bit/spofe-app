/**
 * ⚠️ AUTO-GENERATED FROM OPENAPI — DO NOT EDIT MANUALLY
 * 
 * Immobilisation API Services
 * Generated from: cascade/modules/immobilisation/openapi/immobilisation.openapi.json
 * Version: 1.0.0
 * Generated: 2026-02-01T00:00:00.000Z
 */

import * as Types from './types';

// Base configuration
const API_BASE = import.meta.env?.VITE_API_URL || '/api';

/**
 * HTTP client with contract enforcement
 */
async function contractFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ContractError(response.status, error.message || response.statusText, path);
  }
  
  return response.json();
}

/**
 * Contract Error — Thrown when API call fails
 */
export class ContractError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly endpoint: string,
  ) {
    super(`[CONTRACT ERROR] ${status} ${message} (${endpoint})`);
    this.name = 'ContractError';
  }
}

/**
 * Headers for API requests
 */
interface RequestHeaders {
  tenantId: string;
  token: string;
}

/**
 * Immobilisation Service — Contract-Enforced API Client
 * 
 * ⚠️ RÈGLES SPOFE:
 * ✅ Types générés depuis OpenAPI
 * ✅ Aucun mock autorisé
 * ❌ Modification manuelle interdite
 */
export const ImmobilisationService = {

  // ═══════════════════════════════════════════════════════════════════════════
  // ASSETS ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List assets
   * Returns all assets for the tenant. Read-model: rm_assets_current
   */
  async listAssets(
    params?: { page?: number; limit?: number; status?: Types.AssetStatus },
    headers: RequestHeaders
  ): Promise<Types.PaginatedAssetListResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.status !== undefined) searchParams.set('status', params.status);
    }
    const queryString = searchParams.toString();
    const url = `/immobilisation/assets${queryString ? '?' + queryString : ''}`;
    return contractFetch<Types.PaginatedAssetListResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  /**
   * List asset net book values
   * Returns current net book values (VNC). Read-model: rm_asset_net_book_value
   */
  async listAssetNetBookValues(
    params?: { page?: number; limit?: number; status?: Types.AssetStatus; assetId?: string },
    headers: RequestHeaders
  ): Promise<Types.PaginatedNetBookValueResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.status !== undefined) searchParams.set('status', params.status);
      if (params.assetId !== undefined) searchParams.set('assetId', params.assetId);
    }
    const queryString = searchParams.toString();
    const url = `/immobilisation/assets/net-book-value${queryString ? '?' + queryString : ''}`;
    return contractFetch<Types.PaginatedNetBookValueResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  /**
   * Get asset detail
   * Returns full asset detail with history
   */
  async getAssetDetail(
    assetId: string,
    headers: RequestHeaders
  ): Promise<Types.AssetDetailDTO> {
    const url = `/immobilisation/assets/${assetId}`;
    return contractFetch<Types.AssetDetailDTO>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  /**
   * Get asset depreciation history
   * Returns depreciation history for an asset. Read-model: rm_asset_depreciation_history
   */
  async getAssetDepreciationHistory(
    assetId: string,
    params?: { page?: number; limit?: number; fromPeriod?: string; toPeriod?: string },
    headers: RequestHeaders
  ): Promise<Types.PaginatedDepreciationHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.fromPeriod !== undefined) searchParams.set('fromPeriod', params.fromPeriod);
      if (params.toPeriod !== undefined) searchParams.set('toPeriod', params.toPeriod);
    }
    const queryString = searchParams.toString();
    const url = `/immobilisation/assets/${assetId}/depreciation${queryString ? '?' + queryString : ''}`;
    return contractFetch<Types.PaginatedDepreciationHistoryResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COST-STRUCTURE CONTRACT ENDPOINTS (IMM-CS-*)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get depreciation summary [IMM-CS-DEP-01]
   * CONTRACTUAL: Cost-Structure. Returns aggregated depreciation for a period.
   */
  async getDepreciationSummary(
    params: { period: string },
    headers: RequestHeaders
  ): Promise<Types.DepreciationSummaryDTO> {
    const searchParams = new URLSearchParams();
    searchParams.set('period', params.period);
    const url = `/immobilisation/depreciation/summary?${searchParams.toString()}`;
    return contractFetch<Types.DepreciationSummaryDTO>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  /**
   * Get depreciation export for Cost-Structure [IMM-CS-DEP-02]
   * CONTRACTUAL: Cost-Structure. Returns depreciation with allocations.
   */
  async getDepreciationCostStructureExport(
    params: { period: string },
    headers: RequestHeaders
  ): Promise<Types.DepreciationCostStructureExportDTO> {
    const searchParams = new URLSearchParams();
    searchParams.set('period', params.period);
    const url = `/immobilisation/depreciation/cost-structure-export?${searchParams.toString()}`;
    return contractFetch<Types.DepreciationCostStructureExportDTO>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  /**
   * List effective allocations [IMM-CS-ALL-01]
   * CONTRACTUAL: Cost-Structure. Returns effective allocations.
   */
  async listAllocations(
    params?: { page?: number; limit?: number; assetId?: string; targetType?: Types.AllocationTargetType; targetId?: string },
    headers: RequestHeaders
  ): Promise<Types.PaginatedAllocationResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.assetId !== undefined) searchParams.set('assetId', params.assetId);
      if (params.targetType !== undefined) searchParams.set('targetType', params.targetType);
      if (params.targetId !== undefined) searchParams.set('targetId', params.targetId);
    }
    const queryString = searchParams.toString();
    const url = `/immobilisation/allocations${queryString ? '?' + queryString : ''}`;
    return contractFetch<Types.PaginatedAllocationResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MAINTENANCE ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * List maintenance history
   * Returns maintenance interventions.
   */
  async listMaintenanceHistory(
    params?: { page?: number; limit?: number; assetId?: string },
    headers: RequestHeaders
  ): Promise<Types.PaginatedMaintenanceHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.page !== undefined) searchParams.set('page', String(params.page));
      if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
      if (params.assetId !== undefined) searchParams.set('assetId', params.assetId);
    }
    const queryString = searchParams.toString();
    const url = `/immobilisation/maintenance${queryString ? '?' + queryString : ''}`;
    return contractFetch<Types.PaginatedMaintenanceHistoryResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  /**
   * Get maintenance summary [IMM-CS-MNT-01, IMM-BUD-MNT-01]
   * CONTRACTUAL: Cost-Structure, Budget. Returns maintenance costs per asset.
   */
  async getMaintenanceSummary(
    params?: { assetId?: string; period?: string },
    headers: RequestHeaders
  ): Promise<Types.MaintenanceSummaryDTO> {
    const searchParams = new URLSearchParams();
    if (params) {
      if (params.assetId !== undefined) searchParams.set('assetId', params.assetId);
      if (params.period !== undefined) searchParams.set('period', params.period);
    }
    const queryString = searchParams.toString();
    const url = `/immobilisation/maintenance/summary${queryString ? '?' + queryString : ''}`;
    return contractFetch<Types.MaintenanceSummaryDTO>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGET CONTRACT ENDPOINTS (IMM-BUD-*)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get renewal projections [IMM-BUD-REN-01]
   * CONTRACTUAL: Budget. Returns renewal projections for CAPEX planning.
   */
  async getRenewalProjections(
    params: { fromYear: number; toYear: number; page?: number; limit?: number },
    headers: RequestHeaders
  ): Promise<Types.PaginatedRenewalProjectionsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('fromYear', String(params.fromYear));
    searchParams.set('toYear', String(params.toYear));
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    const url = `/immobilisation/renewals/projections?${searchParams.toString()}`;
    return contractFetch<Types.PaginatedRenewalProjectionsResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  /**
   * Get renewals by year [IMM-BUD-REN-02]
   * CONTRACTUAL: Budget. Returns renewals for a specific year.
   */
  async getRenewalsByYear(
    params: { year: number },
    headers: RequestHeaders
  ): Promise<Types.RenewalsByYearResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('year', String(params.year));
    const url = `/immobilisation/renewals/by-year?${searchParams.toString()}`;
    return contractFetch<Types.RenewalsByYearResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // KPI ENDPOINT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get immobilisation KPIs
   * Returns dashboard KPIs for the tenant.
   */
  async getKPI(headers: RequestHeaders): Promise<Types.ImmobilisationKPIDTO> {
    const url = `/immobilisation/kpi`;
    return contractFetch<Types.ImmobilisationKPIDTO>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${headers.token}`,
        'X-Tenant-Id': headers.tenantId,
      },
    });
  },
};

export default ImmobilisationService;
export type { Types };
