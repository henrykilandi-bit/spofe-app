/**
 * ⚠️ AUTO-GENERATED FROM OPENAPI — DO NOT EDIT MANUALLY
 * 
 * Immobilisation API Types
 * Generated from: cascade/modules/immobilisation/openapi/immobilisation.openapi.json
 * Version: 1.0.0
 * Generated: 2026-02-01T00:00:00.000Z
 */

/**
 * Asset status enumeration
 */
export type AssetStatus = 'IN_SERVICE' | 'DISPOSED' | 'SCRAPPED';

/**
 * Allocation target type
 */
export type AllocationTargetType = 'PRODUCT' | 'SERVICE' | 'PROJECT';

/**
 * Pagination parameters
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Base paginated response
 */
export interface PaginatedResponse<T> extends PaginationMeta {
  items: T[];
}

/**
 * Asset DTO
 */
export interface AssetDTO {
  /** Asset unique identifier */
  assetId: string;
  /** Tenant identifier */
  tenantId: string;
  /** Asset designation/name */
  designation: string;
  /** Asset description */
  description?: string;
  /** Asset category */
  category: string;
  /** Acquisition cost */
  acquisitionCost: number;
  /** Currency code */
  currency: string;
  /** Acquisition date (ISO 8601) */
  acquisitionDate: string;
  /** Service start date */
  serviceStartDate: string;
  /** Asset status */
  status: AssetStatus;
  /** Expected useful life in months */
  usefulLifeMonths: number;
  /** Depreciation method */
  depreciationMethod: 'LINEAR' | 'DECLINING_BALANCE';
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

/**
 * Paginated asset list response
 */
export interface PaginatedAssetListResponse extends PaginatedResponse<AssetDTO> {}

/**
 * Asset detail DTO with extended information
 */
export interface AssetDetailDTO extends AssetDTO {
  /** Current net book value */
  netBookValue: number;
  /** Total depreciation to date */
  totalDepreciation: number;
  /** Depreciation history */
  depreciationHistory?: DepreciationHistoryItem[];
  /** Allocations */
  allocations?: AllocationDTO[];
}

/**
 * Net book value DTO
 */
export interface NetBookValueDTO {
  assetId: string;
  tenantId: string;
  designation: string;
  acquisitionCost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
  currency: string;
  calculationDate: string;
  status: AssetStatus;
}

/**
 * Paginated net book value response
 */
export interface PaginatedNetBookValueResponse extends PaginatedResponse<NetBookValueDTO> {}

/**
 * Depreciation history item
 */
export interface DepreciationHistoryItem {
  period: string;
  amount: number;
  accumulatedBefore: number;
  accumulatedAfter: number;
  netBookValueAfter: number;
  method: string;
}

/**
 * Paginated depreciation history response
 */
export interface PaginatedDepreciationHistoryResponse extends PaginatedResponse<DepreciationHistoryItem> {
  assetId: string;
}

/**
 * Depreciation summary DTO [IMM-CS-DEP-01]
 */
export interface DepreciationSummaryDTO {
  tenantId: string;
  period: string;
  totalAssets: number;
  totalDepreciation: number;
  currency: string;
  byCategory: Array<{
    category: string;
    assetCount: number;
    totalDepreciation: number;
  }>;
}

/**
 * Depreciation cost structure export DTO [IMM-CS-DEP-02]
 */
export interface DepreciationCostStructureExportDTO {
  tenantId: string;
  period: string;
  items: Array<{
    assetId: string;
    designation: string;
    category: string;
    depreciationAmount: number;
    allocations: Array<{
      targetType: AllocationTargetType;
      targetId: string;
      percentage: number;
      allocatedAmount: number;
    }>;
  }>;
  totals: {
    totalDepreciation: number;
    byTargetType: Record<AllocationTargetType, number>;
  };
}

/**
 * Allocation DTO [IMM-CS-ALL-01]
 */
export interface AllocationDTO {
  allocationId: string;
  assetId: string;
  tenantId: string;
  targetType: AllocationTargetType;
  targetId: string;
  percentage: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

/**
 * Paginated allocation response
 */
export interface PaginatedAllocationResponse extends PaginatedResponse<AllocationDTO> {}

/**
 * Maintenance history item
 */
export interface MaintenanceHistoryItem {
  maintenanceId: string;
  assetId: string;
  tenantId: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'UPGRADE';
  description: string;
  cost: number;
  currency: string;
  date: string;
  vendor?: string;
}

/**
 * Paginated maintenance history response
 */
export interface PaginatedMaintenanceHistoryResponse extends PaginatedResponse<MaintenanceHistoryItem> {}

/**
 * Maintenance summary DTO [IMM-CS-MNT-01, IMM-BUD-MNT-01]
 */
export interface MaintenanceSummaryDTO {
  tenantId: string;
  period?: string;
  assetId?: string;
  totalCost: number;
  currency: string;
  interventionCount: number;
  byType: {
    preventive: number;
    corrective: number;
    upgrade: number;
  };
}

/**
 * Renewal projection DTO [IMM-BUD-REN-01]
 */
export interface RenewalProjectionDTO {
  assetId: string;
  designation: string;
  category: string;
  currentNetBookValue: number;
  projectedRenewalYear: number;
  estimatedRenewalCost: number;
  currency: string;
}

/**
 * Paginated renewal projections response
 */
export interface PaginatedRenewalProjectionsResponse extends PaginatedResponse<RenewalProjectionDTO> {
  fromYear: number;
  toYear: number;
  totalProjectedCost: number;
}

/**
 * Renewals by year response [IMM-BUD-REN-02]
 */
export interface RenewalsByYearResponse {
  tenantId: string;
  year: number;
  assets: Array<{
    assetId: string;
    designation: string;
    category: string;
    estimatedCost: number;
    endOfLifeDate: string;
  }>;
  totalEstimatedCost: number;
  currency: string;
}

/**
 * Immobilisation KPI DTO
 */
export interface ImmobilisationKPIDTO {
  tenantId: string;
  totalAssets: number;
  totalAcquisitionCost: number;
  totalNetBookValue: number;
  totalAccumulatedDepreciation: number;
  averageAge: number;
  byStatus: {
    inService: number;
    disposed: number;
    scrapped: number;
  };
  byCategory: Array<{
    category: string;
    count: number;
    totalValue: number;
  }>;
  currency: string;
  calculatedAt: string;
}

/**
 * Error DTO
 */
export interface ErrorDTO {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}
