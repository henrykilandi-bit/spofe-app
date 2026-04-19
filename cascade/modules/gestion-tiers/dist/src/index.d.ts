export * from './domain/model/Tier';
export * from './domain/events/TierEvents';
export * from './domain/guardian/GuardianContext';
export * from './domain/guardian/GuardianError';
export * from './domain/guardian/TierGuardian';
export * from './application/commands/CreateTier';
export * from './application/commands/UpdateTier';
export * from './application/commands/SuspendTier';
export * from './application/commands/ArchiveTier';
export * from './infrastructure/persistence/TierRepository';
export * from './infrastructure/event-store/TierEventStore';
export declare const MODULE_INFO: {
    readonly name: "@spofe/gestion-tiers";
    readonly version: "1.0.0";
    readonly guardian: {
        readonly status: "FROZEN";
        readonly buildProof: "644B1C521E645AEE71C135DD7FA04449CC65DBE118924984CEE8E626D8244EFE";
        readonly invariants: 10;
        readonly tests: 46;
    };
    readonly implementation: {
        readonly status: "SKELETON";
        readonly handlers: "TODO_v1.1";
        readonly persistence: "TODO_v1.1";
        readonly api: "TODO_v1.1";
    };
};
//# sourceMappingURL=index.d.ts.map