import { TierRole } from '../../../src/domain/guardian/GuardianContext';
export interface TestContext {
    tenantId: string;
    actorId: string;
}
export declare class TierTestBuilder {
    private ctx;
    constructor(ctx: TestContext);
    givenActiveTier(options: {
        name: string;
        roles: TierRole[];
        legalIdentifiers?: string[];
    }): Promise<void>;
    givenActiveClient(name?: string): Promise<void>;
    givenActiveProvider(name?: string): Promise<void>;
    givenEmployee(name?: string): Promise<void>;
}
//# sourceMappingURL=TierTestBuilder.d.ts.map