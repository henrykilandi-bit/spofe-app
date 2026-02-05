/**
 * Immobilisation Module - Read-Model Types
 * Conformité: READ_MODELS.md v1.0.0
 *
 * Types TypeScript pour les read-models SQL.
 * Ces types sont read-only et reflètent exactement les vues SQL.
 */
export type AssetStatus = 'IN_SERVICE' | 'DISPOSED' | 'SCRAPPED';
export type DepreciationMethod = 'LINEAR';
export type AllocationTargetType = 'PRODUCT' | 'SERVICE' | 'PROJECT';
export type MaintenanceType = 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
export type DisposalType = 'SALE' | 'SCRAP';
/**
 * Vue: rm_assets_current
 * État courant des immobilisations
 */
export interface RmAssetsCurrent {
    readonly assetId: string;
    readonly tenantId: string;
    readonly acquisitionCost: number;
    readonly currency: string;
    readonly acquisitionDate: Date;
    readonly usefulLifeMonths: number;
    readonly depreciationMethod: DepreciationMethod;
    readonly residualValue: number;
    readonly renewalDate: Date | null;
    readonly replacementCost: number | null;
    readonly status: AssetStatus;
    readonly createdAt: Date;
    readonly createdBy: string;
}
/**
 * Vue: rm_asset_depreciation_history
 * Historique des amortissements
 */
export interface RmAssetDepreciationHistory {
    readonly scheduleId: string;
    readonly assetId: string;
    readonly tenantId: string;
    readonly period: string;
    readonly depreciationAmount: number;
    readonly accumulatedDepreciation: number;
    readonly netBookValue: number;
    readonly currency: string;
    readonly calculatedBy: string;
    readonly calculatedAt: Date;
}
/**
 * Vue: rm_asset_depreciation_summary (CONTRACTUEL Cost-Structure)
 * Amortissements agrégés par période
 */
export interface RmAssetDepreciationSummary {
    readonly tenantId: string;
    readonly period: string;
    readonly totalDepreciation: number;
    readonly assetCount: number;
    readonly currency: string;
}
/**
 * Vue: rm_asset_allocation_effective (CONTRACTUEL Cost-Structure)
 * Affectations effectives (actives)
 */
export interface RmAssetAllocationEffective {
    readonly allocationId: string;
    readonly assetId: string;
    readonly tenantId: string;
    readonly targetType: AllocationTargetType;
    readonly targetId: string;
    readonly percentage: number;
    readonly effectiveFrom: Date;
    readonly effectiveTo: Date | null;
    readonly createdBy: string;
    readonly createdAt: Date;
}
/**
 * Vue: rm_asset_allocation_all
 * Toutes les affectations (historique complet)
 */
export interface RmAssetAllocationAll extends RmAssetAllocationEffective {
    readonly endedBy: string | null;
    readonly endedAt: Date | null;
    readonly endReason: string | null;
}
/**
 * Vue: rm_asset_maintenance_history
 * Historique des coûts de maintenance
 */
export interface RmAssetMaintenanceHistory {
    readonly maintenanceId: string;
    readonly assetId: string;
    readonly tenantId: string;
    readonly maintenanceType: MaintenanceType;
    readonly maintenanceDate: Date;
    readonly description: string;
    readonly cost: number;
    readonly currency: string;
    readonly performedBy: string;
    readonly recordedBy: string;
    readonly recordedAt: Date;
}
/**
 * Vue: rm_asset_maintenance_summary (CONTRACTUEL Cost-Structure, Budget)
 * Coûts de maintenance agrégés par actif
 */
export interface RmAssetMaintenanceSummary {
    readonly tenantId: string;
    readonly assetId: string;
    readonly totalMaintenanceCost: number;
    readonly interventionCount: number;
    readonly firstIntervention: Date | null;
    readonly lastIntervention: Date | null;
    readonly currency: string;
}
/**
 * Vue: rm_asset_maintenance_by_period (CONTRACTUEL Cost-Structure)
 * Coûts de maintenance agrégés par période
 */
export interface RmAssetMaintenanceByPeriod {
    readonly tenantId: string;
    readonly period: string;
    readonly totalMaintenanceCost: number;
    readonly interventionCount: number;
    readonly assetsMaintained: number;
    readonly currency: string;
}
/**
 * Vue: rm_assets_renewal_projection (CONTRACTUEL Budget)
 * Projection de renouvellement
 */
export interface RmAssetsRenewalProjection {
    readonly assetId: string;
    readonly tenantId: string;
    readonly acquisitionCost: number;
    readonly acquisitionDate: Date;
    readonly usefulLifeMonths: number;
    readonly renewalDate: Date;
    readonly replacementCost: number | null;
    readonly currency: string;
    readonly status: AssetStatus;
    readonly renewalYear: number;
    readonly renewalMonth: number;
}
/**
 * Vue: rm_asset_disposal_history
 * Historique des cessions
 */
export interface RmAssetDisposalHistory {
    readonly disposalId: string;
    readonly assetId: string;
    readonly tenantId: string;
    readonly disposalDate: Date;
    readonly disposalType: DisposalType;
    readonly disposalValue: number;
    readonly netBookValue: number;
    readonly gainOrLoss: number;
    readonly currency: string;
    readonly reason: string | null;
    readonly disposedBy: string;
    readonly disposedAt: Date;
}
/**
 * Vue: rm_asset_net_book_value
 * VNC courante par actif
 */
export interface RmAssetNetBookValue {
    readonly assetId: string;
    readonly tenantId: string;
    readonly acquisitionCost: number;
    readonly residualValue: number;
    readonly currency: string;
    readonly status: AssetStatus;
    readonly accumulatedDepreciation: number;
    readonly netBookValue: number;
    readonly lastPeriod: string | null;
}
/**
 * Vue: rm_assets_in_service
 * Actifs en service uniquement
 */
export interface RmAssetsInService {
    readonly assetId: string;
    readonly tenantId: string;
    readonly acquisitionCost: number;
    readonly currency: string;
    readonly acquisitionDate: Date;
    readonly usefulLifeMonths: number;
    readonly depreciationMethod: DepreciationMethod;
    readonly residualValue: number;
    readonly renewalDate: Date | null;
    readonly replacementCost: number | null;
    readonly createdAt: Date;
    readonly createdBy: string;
}
/**
 * Vue: rm_depreciation_cost_structure_export (CONTRACTUEL Cost-Structure)
 * Dotations ventilées pour Cost-Structure
 */
export interface RmDepreciationCostStructureExport {
    readonly tenantId: string;
    readonly period: string;
    readonly assetId: string;
    readonly depreciationAmount: number;
    readonly currency: string;
    readonly targetType: AllocationTargetType;
    readonly targetId: string;
    readonly percentage: number;
    readonly allocatedAmount: number;
}
/**
 * Vue: rm_immobilisation_kpi
 * KPIs patrimoniales (dashboard)
 */
export interface RmImmobilisationKpi {
    readonly tenantId: string;
    readonly assetsInService: number;
    readonly assetsDisposed: number;
    readonly assetsScrapped: number;
    readonly totalAssets: number;
    readonly totalAcquisitionCost: number | null;
    readonly totalNetBookValue: number | null;
    readonly totalAccumulatedDepreciation: number | null;
    readonly currency: string;
}
/**
 * Filtres communs pour les requêtes read-model
 */
export interface ReadModelFilter {
    readonly tenantId: string;
    readonly limit?: number;
    readonly offset?: number;
}
export interface AssetFilter extends ReadModelFilter {
    readonly status?: AssetStatus;
    readonly assetId?: string;
}
export interface PeriodFilter extends ReadModelFilter {
    readonly periodFrom?: string;
    readonly periodTo?: string;
}
export interface AllocationFilter extends ReadModelFilter {
    readonly assetId?: string;
    readonly targetType?: AllocationTargetType;
    readonly targetId?: string;
    readonly activeOnly?: boolean;
}
export interface RenewalFilter extends ReadModelFilter {
    readonly renewalYearFrom?: number;
    readonly renewalYearTo?: number;
}
//# sourceMappingURL=read-model.types.d.ts.map