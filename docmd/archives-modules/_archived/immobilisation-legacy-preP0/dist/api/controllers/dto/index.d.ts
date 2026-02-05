/**
 * API Controllers DTOs - Module Immobilisation v1.0.0
 * Conformité: SPOFE API Standards
 *
 * Exports pour les DTOs utilisés par les contrôleurs API
 */
export interface AssetListItemDTO {
    readonly assetId: string;
    readonly name: string;
    readonly status: string;
    readonly acquisitionDate: string;
    readonly acquisitionCost: number;
    readonly netBookValue: number;
    readonly currency: string;
}
export interface AssetDetailDTO {
    readonly assetId: string;
    readonly tenantId: string;
    readonly name: string;
    readonly description?: string;
    readonly status: string;
    readonly acquisitionDate: string;
    readonly acquisitionCost: number;
    readonly residualValue: number;
    readonly usefulLife: number;
    readonly depreciationMethod: string;
    readonly currency: string;
    readonly netBookValue: number;
    readonly accumulatedDepreciation: number;
    readonly createdAt: string;
    readonly updatedAt?: string;
}
export interface AssetNetBookValueDTO {
    readonly assetId: string;
    readonly name: string;
    readonly acquisitionCost: number;
    readonly accumulatedDepreciation: number;
    readonly netBookValue: number;
    readonly currency: string;
    readonly asOfDate: string;
}
export interface DepreciationHistoryItemDTO {
    readonly assetId: string;
    readonly period: string;
    readonly depreciationAmount: number;
    readonly accumulatedDepreciation: number;
    readonly netBookValue: number;
    readonly currency: string;
    readonly recordedAt: string;
}
export interface AllocationItemDTO {
    readonly allocationId: string;
    readonly assetId: string;
    readonly targetType: string;
    readonly targetId: string;
    readonly targetName: string;
    readonly percentage: number;
    readonly allocatedValue: number;
    readonly currency: string;
    readonly effectiveDate: string;
}
export interface MaintenanceHistoryItemDTO {
    readonly maintenanceId: string;
    readonly assetId: string;
    readonly type: string;
    readonly description: string;
    readonly cost: number;
    readonly currency: string;
    readonly performedDate: string;
    readonly actorId: string;
}
export interface RenewalProjectionItemDTO {
    readonly assetId: string;
    readonly assetName: string;
    readonly projectedRenewalDate: string;
    readonly estimatedCost: number;
    readonly priority: string;
    readonly currency: string;
}
export interface DisposalHistoryItemDTO {
    readonly disposalId: string;
    readonly assetId: string;
    readonly assetName: string;
    readonly disposalType: string;
    readonly disposalDate: string;
    readonly disposalValue: number;
    readonly netBookValue: number;
    readonly gainLoss: number;
    readonly currency: string;
}
export interface AssetListResponseDTO {
    readonly assets: AssetListItemDTO[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
}
export interface NetBookValueResponseDTO {
    readonly items: AssetNetBookValueDTO[];
    readonly totalNetBookValue: number;
    readonly currency: string;
    readonly asOfDate: string;
}
export interface DepreciationSummaryDTO {
    readonly period: string;
    readonly totalDepreciation: number;
    readonly assetsCount: number;
    readonly currency: string;
}
export interface MaintenanceSummaryDTO {
    readonly period: string;
    readonly totalCost: number;
    readonly maintenanceCount: number;
    readonly currency: string;
}
export interface KpiSummaryDTO {
    readonly totalAssets: number;
    readonly totalNetBookValue: number;
    readonly averageAge: number;
    readonly maintenanceRatio: number;
    readonly currency: string;
    readonly asOfDate: string;
}
export interface AssetQueryParams {
    readonly status?: string;
    readonly page?: number;
    readonly limit?: number;
    readonly search?: string;
}
export interface PeriodQueryParams {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly period?: string;
}
export interface AllocationQueryParams {
    readonly targetType?: string;
    readonly targetId?: string;
    readonly effectiveDate?: string;
}
export interface MaintenanceQueryParams {
    readonly type?: string;
    readonly fromDate?: string;
    readonly toDate?: string;
}
export interface DepreciationCostStructureExportDTO {
    readonly assetId: string;
    readonly assetName: string;
    readonly acquisitionCost: number;
    readonly accumulatedDepreciation: number;
    readonly netBookValue: number;
    readonly depreciationExpense: number;
    readonly period: string;
    readonly currency: string;
}
export interface MaintenanceSummaryItemDTO {
    readonly period: string;
    readonly totalCost: number;
    readonly maintenanceCount: number;
    readonly averageCost: number;
    readonly currency: string;
}
export interface MaintenanceByPeriodItemDTO {
    readonly period: string;
    readonly maintenanceType: string;
    readonly totalCost: number;
    readonly count: number;
    readonly currency: string;
}
export interface ImmobilisationKpiDTO {
    readonly totalAssets: number;
    readonly totalNetBookValue: number;
    readonly totalAcquisitionCost: number;
    readonly totalDepreciation: number;
    readonly averageAssetAge: number;
    readonly depreciationRate: number;
    readonly maintenanceRatio: number;
    readonly currency: string;
    readonly asOfDate: string;
}
export interface AssetListQueryDTO {
    readonly status?: string;
    readonly search?: string;
    readonly page?: number;
    readonly limit?: number;
    readonly sortBy?: string;
    readonly sortOrder?: 'asc' | 'desc';
}
export interface AssetNetBookValueQueryDTO {
    readonly asOfDate?: string;
    readonly status?: string;
    readonly includeDisposed?: boolean;
}
export interface DepreciationHistoryQueryDTO {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly period?: 'month' | 'quarter' | 'year';
}
export interface DepreciationSummaryQueryDTO {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly groupBy?: 'month' | 'quarter' | 'year';
}
export interface DepreciationCostStructureExportQueryDTO {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly format?: 'json' | 'csv';
}
export interface AllocationQueryDTO {
    readonly targetType?: string;
    readonly targetId?: string;
    readonly effectiveDate?: string;
    readonly includeHistory?: boolean;
}
export interface MaintenanceHistoryQueryDTO {
    readonly type?: string;
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly assetId?: string;
}
export interface MaintenanceSummaryQueryDTO {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly groupBy?: 'month' | 'quarter' | 'year';
}
export interface MaintenanceByPeriodQueryDTO {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly period?: 'month' | 'quarter' | 'year';
}
export interface RenewalQueryDTO {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly priority?: 'low' | 'medium' | 'high';
}
export interface DisposalQueryDTO {
    readonly fromDate?: string;
    readonly toDate?: string;
    readonly disposalType?: string;
}
//# sourceMappingURL=index.d.ts.map