/**
 * Immobilisation Module - Persistence Layer Index
 * Conformité: READ_MODELS.md v1.0.0
 */
export { AssetStatus, DepreciationMethod, AllocationTargetType, MaintenanceType, DisposalType, RmAssetsCurrent, RmAssetDepreciationHistory, RmAssetDepreciationSummary, RmAssetAllocationEffective, RmAssetAllocationAll, RmAssetMaintenanceHistory, RmAssetMaintenanceSummary, RmAssetMaintenanceByPeriod, RmAssetsRenewalProjection, RmAssetDisposalHistory, RmAssetNetBookValue, RmAssetsInService, RmDepreciationCostStructureExport, RmImmobilisationKpi, ReadModelFilter, AssetFilter, PeriodFilter, AllocationFilter, RenewalFilter, } from './read-model.types';
export { ImmobilisationReadModelRepository, IMMOBILISATION_READ_MODEL_REPOSITORY, ImmobilisationReadModelRepositoryFactory, } from './read-model.repository';
export { PostgresImmobilisationReadModelRepository } from './postgres-read-model.repository';
export { EventProjector, PostgresImmobilisationProjector } from './event-projector';
//# sourceMappingURL=index.d.ts.map