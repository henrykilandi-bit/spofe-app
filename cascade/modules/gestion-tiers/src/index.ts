// SPOFE Module: Gestion-Tiers v1.0.0
// Guardian: FROZEN ❄️
// Skeleton: Ready for implementation

// Domain exports
export * from './domain/model/Tier';
export * from './domain/events/TierEvents';

// Guardian exports (FROZEN)
export * from './domain/guardian/GuardianContext';
export * from './domain/guardian/GuardianError';
export * from './domain/guardian/TierGuardian';

// Application exports
export * from './application/commands/CreateTier';
export * from './application/commands/UpdateTier';
export * from './application/commands/SuspendTier';
export * from './application/commands/ArchiveTier';

// Infrastructure interfaces
export * from './infrastructure/persistence/TierRepository';
export * from './infrastructure/event-store/TierEventStore';

// Module metadata
export const MODULE_INFO = {
  name: '@spofe/gestion-tiers',
  version: '1.0.0',
  guardian: {
    status: 'FROZEN',
    buildProof: '644B1C521E645AEE71C135DD7FA04449CC65DBE118924984CEE8E626D8244EFE',
    invariants: 10,
    tests: 46
  },
  implementation: {
    status: 'SKELETON',
    handlers: 'TODO_v1.1',
    persistence: 'TODO_v1.1',
    api: 'TODO_v1.1'
  }
} as const;