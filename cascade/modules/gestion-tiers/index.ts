// Module gestion-tiers - SPOFE v2.1.0
// API + READ-MODELS certified (BUILD_PROOF)

// Read-Models (event-driven, read-only)
export * from './src/read-models';

// API (read-only, framework-agnostic)
export * from './src/api';

// Domain events (for projections)
export * from './src/domain/events/TierEvents';

// Note: Guardian and Application layers are in separate exports
// to maintain BUILD_PROOF isolation