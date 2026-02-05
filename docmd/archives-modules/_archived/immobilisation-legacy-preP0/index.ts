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

// API Layer (Read-only controllers, DTOs)
export * from './api';

// Domain Layer (Aggregates, Events, Commands, Value Objects) - Primary exports
export { 
  AllocationTargetType,
  AssetStatus,
  DepreciationMethod,
  DisposalType,
  MaintenanceType,
  Money,
  Percentage,
  DateRange,
  UsefulLife
} from './domain';

// Other domain exports
export * from './domain/commands';
export * from './domain/events';
export * from './domain/asset.aggregate';
export * from './domain/invariants';

// Guardian Layer (Invariants validation)
export * from './guardian';

// Infrastructure Layer (Repositories, Projectors) - Selective exports to avoid conflicts
export { 
  ImmobilisationReadModelRepository,
  IMMOBILISATION_READ_MODEL_REPOSITORY,
  PostgresImmobilisationReadModelRepository,
  EventProjector,
  PostgresImmobilisationProjector
} from './infrastructure/persistence';

// Application Layer (Command handlers, DTOs) - Selective exports to avoid conflicts
export { 
  CreateAssetDTO,
  UpdateRenewalDTO,
  AllocateAssetDTO,
  RecordDepreciationDTO,
  RecordMaintenanceDTO,
  DisposeAssetDTO
} from './application/dto';

// Write-side exports
export * from './write';
