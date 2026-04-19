import { GuardianContext, OIECommand } from './types.js';
export declare class OIEGuardian {
    validate(ctx: GuardianContext, cmd: OIECommand): void;
    private assertObjectiveHasIndicator;
    private assertIndicatorUnitDefined;
    private assertMonotonicTimestamp;
    private assertNoObjectiveCycle;
    private assertNumericOrNullValues;
    private assertTenantOwnership;
    private assertMultiTenantPermissions;
    private assertImmutableIds;
    private assertImmutableEvents;
    private assertDeterministicCalculations;
}
//# sourceMappingURL=OIEGuardian.d.ts.map