/**
 * ⚠️ AUTO-GENERATED FROM OPENAPI — DO NOT EDIT MANUALLY
 * 
 * Immobilisation API React Hooks
 * Generated from: cascade/modules/immobilisation/openapi/immobilisation.openapi.json
 * Version: 1.0.0
 * Generated: 2026-02-01T00:00:00.000Z
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ImmobilisationService, ContractError } from './index';
import type * as Types from './types';

// Re-export types for convenience
export type { Types };

// ═══════════════════════════════════════════════════════════════════════════
// ASSETS HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: List assets
 */
export function useListAssets(
  tenantId: string,
  token: string,
  params?: { page?: number; limit?: number; status?: Types.AssetStatus },
  options?: Omit<UseQueryOptions<Types.PaginatedAssetListResponse, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'listAssets', params],
    queryFn: () => ImmobilisationService.listAssets(params, { tenantId, token }),
    ...options,
  });
}

/**
 * Hook: List asset net book values
 */
export function useListAssetNetBookValues(
  tenantId: string,
  token: string,
  params?: { page?: number; limit?: number; status?: Types.AssetStatus; assetId?: string },
  options?: Omit<UseQueryOptions<Types.PaginatedNetBookValueResponse, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'listAssetNetBookValues', params],
    queryFn: () => ImmobilisationService.listAssetNetBookValues(params, { tenantId, token }),
    ...options,
  });
}

/**
 * Hook: Get asset detail
 */
export function useGetAssetDetail(
  tenantId: string,
  token: string,
  assetId: string,
  options?: Omit<UseQueryOptions<Types.AssetDetailDTO, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'getAssetDetail', assetId],
    queryFn: () => ImmobilisationService.getAssetDetail(assetId, { tenantId, token }),
    enabled: !!assetId,
    ...options,
  });
}

/**
 * Hook: Get asset depreciation history
 */
export function useGetAssetDepreciationHistory(
  tenantId: string,
  token: string,
  assetId: string,
  params?: { page?: number; limit?: number; fromPeriod?: string; toPeriod?: string },
  options?: Omit<UseQueryOptions<Types.PaginatedDepreciationHistoryResponse, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'getAssetDepreciationHistory', assetId, params],
    queryFn: () => ImmobilisationService.getAssetDepreciationHistory(assetId, params, { tenantId, token }),
    enabled: !!assetId,
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// COST-STRUCTURE CONTRACT HOOKS (IMM-CS-*)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Get depreciation summary [IMM-CS-DEP-01]
 */
export function useGetDepreciationSummary(
  tenantId: string,
  token: string,
  params: { period: string },
  options?: Omit<UseQueryOptions<Types.DepreciationSummaryDTO, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'getDepreciationSummary', params.period],
    queryFn: () => ImmobilisationService.getDepreciationSummary(params, { tenantId, token }),
    enabled: !!params.period,
    ...options,
  });
}

/**
 * Hook: Get depreciation cost-structure export [IMM-CS-DEP-02]
 */
export function useGetDepreciationCostStructureExport(
  tenantId: string,
  token: string,
  params: { period: string },
  options?: Omit<UseQueryOptions<Types.DepreciationCostStructureExportDTO, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'getDepreciationCostStructureExport', params.period],
    queryFn: () => ImmobilisationService.getDepreciationCostStructureExport(params, { tenantId, token }),
    enabled: !!params.period,
    ...options,
  });
}

/**
 * Hook: List allocations [IMM-CS-ALL-01]
 */
export function useListAllocations(
  tenantId: string,
  token: string,
  params?: { page?: number; limit?: number; assetId?: string; targetType?: Types.AllocationTargetType; targetId?: string },
  options?: Omit<UseQueryOptions<Types.PaginatedAllocationResponse, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'listAllocations', params],
    queryFn: () => ImmobilisationService.listAllocations(params, { tenantId, token }),
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: List maintenance history
 */
export function useListMaintenanceHistory(
  tenantId: string,
  token: string,
  params?: { page?: number; limit?: number; assetId?: string },
  options?: Omit<UseQueryOptions<Types.PaginatedMaintenanceHistoryResponse, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'listMaintenanceHistory', params],
    queryFn: () => ImmobilisationService.listMaintenanceHistory(params, { tenantId, token }),
    ...options,
  });
}

/**
 * Hook: Get maintenance summary [IMM-CS-MNT-01, IMM-BUD-MNT-01]
 */
export function useGetMaintenanceSummary(
  tenantId: string,
  token: string,
  params?: { assetId?: string; period?: string },
  options?: Omit<UseQueryOptions<Types.MaintenanceSummaryDTO, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'getMaintenanceSummary', params],
    queryFn: () => ImmobilisationService.getMaintenanceSummary(params, { tenantId, token }),
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BUDGET CONTRACT HOOKS (IMM-BUD-*)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Get renewal projections [IMM-BUD-REN-01]
 */
export function useGetRenewalProjections(
  tenantId: string,
  token: string,
  params: { fromYear: number; toYear: number; page?: number; limit?: number },
  options?: Omit<UseQueryOptions<Types.PaginatedRenewalProjectionsResponse, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'getRenewalProjections', params.fromYear, params.toYear, params],
    queryFn: () => ImmobilisationService.getRenewalProjections(params, { tenantId, token }),
    enabled: !!params.fromYear && !!params.toYear,
    ...options,
  });
}

/**
 * Hook: Get renewals by year [IMM-BUD-REN-02]
 */
export function useGetRenewalsByYear(
  tenantId: string,
  token: string,
  params: { year: number },
  options?: Omit<UseQueryOptions<Types.RenewalsByYearResponse, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'getRenewalsByYear', params.year],
    queryFn: () => ImmobilisationService.getRenewalsByYear(params, { tenantId, token }),
    enabled: !!params.year,
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// KPI HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook: Get immobilisation KPIs
 */
export function useGetKPI(
  tenantId: string,
  token: string,
  options?: Omit<UseQueryOptions<Types.ImmobilisationKPIDTO, ContractError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['immobilisation', 'getKPI'],
    queryFn: () => ImmobilisationService.getKPI({ tenantId, token }),
    ...options,
  });
}
