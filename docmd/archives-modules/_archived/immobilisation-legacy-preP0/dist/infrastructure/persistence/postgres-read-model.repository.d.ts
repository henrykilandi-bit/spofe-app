/**
 * Immobilisation Module - Read-Model Repository PostgreSQL Implementation
 * Conformité: READ_MODELS.md v1.0.0
 *
 * Implémentation PostgreSQL du repository read-model.
 */
import { Pool } from 'pg';
import { ImmobilisationReadModelRepository } from './read-model.repository';
import { RmAssetsCurrent, RmAssetDepreciationHistory, RmAssetDepreciationSummary, RmAssetAllocationEffective, RmAssetAllocationAll, RmAssetMaintenanceHistory, RmAssetMaintenanceSummary, RmAssetMaintenanceByPeriod, RmAssetsRenewalProjection, RmAssetDisposalHistory, RmAssetNetBookValue, RmAssetsInService, RmDepreciationCostStructureExport, RmImmobilisationKpi, AssetFilter, PeriodFilter, AllocationFilter, RenewalFilter, ReadModelFilter } from './read-model.types';
export declare class PostgresImmobilisationReadModelRepository implements ImmobilisationReadModelRepository {
    private readonly pool;
    constructor(pool: Pool);
    private withClient;
    private setTenant;
    findAllAssets(filter: AssetFilter): Promise<RmAssetsCurrent[]>;
    findAssetById(tenantId: string, assetId: string): Promise<RmAssetsCurrent | null>;
    findAssetsInService(filter: ReadModelFilter): Promise<RmAssetsInService[]>;
    findAssetNetBookValues(filter: AssetFilter): Promise<RmAssetNetBookValue[]>;
    findAssetNetBookValue(tenantId: string, assetId: string): Promise<RmAssetNetBookValue | null>;
    findDepreciationHistory(filter: PeriodFilter & {
        assetId?: string;
    }): Promise<RmAssetDepreciationHistory[]>;
    findAssetDepreciationHistory(tenantId: string, assetId: string): Promise<RmAssetDepreciationHistory[]>;
    findDepreciationSummary(filter: PeriodFilter): Promise<RmAssetDepreciationSummary[]>;
    findDepreciationForCostStructure(filter: PeriodFilter): Promise<RmDepreciationCostStructureExport[]>;
    findEffectiveAllocations(filter: AllocationFilter): Promise<RmAssetAllocationEffective[]>;
    findAllAllocations(filter: AllocationFilter): Promise<RmAssetAllocationAll[]>;
    findAssetAllocations(tenantId: string, assetId: string, activeOnly?: boolean): Promise<RmAssetAllocationEffective[]>;
    findMaintenanceHistory(filter: PeriodFilter & {
        assetId?: string;
    }): Promise<RmAssetMaintenanceHistory[]>;
    findAssetMaintenanceHistory(tenantId: string, assetId: string): Promise<RmAssetMaintenanceHistory[]>;
    findMaintenanceSummary(filter: AssetFilter): Promise<RmAssetMaintenanceSummary[]>;
    findMaintenanceByPeriod(filter: PeriodFilter): Promise<RmAssetMaintenanceByPeriod[]>;
    findRenewalProjections(filter: RenewalFilter): Promise<RmAssetsRenewalProjection[]>;
    findDisposalHistory(filter: PeriodFilter): Promise<RmAssetDisposalHistory[]>;
    findAssetDisposal(tenantId: string, assetId: string): Promise<RmAssetDisposalHistory | null>;
    findKpi(tenantId: string): Promise<RmImmobilisationKpi | null>;
}
//# sourceMappingURL=postgres-read-model.repository.d.ts.map