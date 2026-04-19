import { GuardianContext, BudgetCommand } from './types';
export declare class BudgetGuardian {
    validate(ctx: GuardianContext, cmd: BudgetCommand): void;
    private assertTenantIsolation;
    private assertActor;
    private assertPeriods;
    private assertCompleteness;
    private assertHypotheses;
    private assertAppendOnly;
    private assertStatusTransitions;
    private assertCertifiedSources;
    private assertNoForbiddenLogic;
}
//# sourceMappingURL=BudgetGuardian.d.ts.map