/**
 * Immobilisation Module - Main Index
 * Version: 1.0.0
 *
 * Point d'entrée principal du module Immobilisation.
 *
 * Conformité SPOFE:
 * ✅ CQRS strict (read/write séparés)
 * ✅ Multi-tenant
 * ✅ Guardian pattern
 * ✅ Event sourcing ready
 */
export * from './api';
export { AllocationTargetType, AssetStatus, DepreciationMethod, DisposalType, MaintenanceType, Money, Percentage, DateRange, UsefulLife } from './domain';
export * from './domain/commands';
export * from './domain/events';
export * from './domain/asset.aggregate';
export * from './domain/invariants';
export * from './guardian';
export { ImmobilisationReadModelRepository, IMMOBILISATION_READ_MODEL_REPOSITORY, PostgresImmobilisationReadModelRepository, EventProjector, PostgresImmobilisationProjector } from './infrastructure/persistence';
export { CreateAssetDTO, UpdateRenewalDTO, AllocateAssetDTO, RecordDepreciationDTO, RecordMaintenanceDTO, DisposeAssetDTO } from './application/dto';
export * from './write';
//# sourceMappingURL=index.d.ts.map