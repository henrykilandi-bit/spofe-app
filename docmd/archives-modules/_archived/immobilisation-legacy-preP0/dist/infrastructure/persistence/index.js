/**
 * Immobilisation Module - Persistence Layer Index
 * Conformité: READ_MODELS.md v1.0.0
 */
// Repository Interface
export { IMMOBILISATION_READ_MODEL_REPOSITORY, } from './read-model.repository';
// PostgreSQL Implementation
export { PostgresImmobilisationReadModelRepository } from './postgres-read-model.repository';
// Event Projector
export { PostgresImmobilisationProjector } from './event-projector';
//# sourceMappingURL=index.js.map