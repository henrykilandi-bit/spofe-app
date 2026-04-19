import { TierTestBuilder } from './TierTestBuilder';
export interface TestContext {
    tenantId: string;
    actorId: string;
}
export declare class SystemTestContext {
    readonly context: TestContext;
    readonly tierBuilder: TierTestBuilder;
    constructor();
    static forBasicScenario(): SystemTestContext;
    static forMultiTenantScenario(): SystemTestContext;
    ensureGuardianCompliance(): void;
}
//# sourceMappingURL=TestContext.d.ts.map