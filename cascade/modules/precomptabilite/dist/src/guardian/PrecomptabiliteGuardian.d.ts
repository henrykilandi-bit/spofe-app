import { GuardianContext, PrecomptabiliteCommand } from './types';
export declare class PrecomptabiliteGuardian {
    validate(ctx: GuardianContext, cmd: PrecomptabiliteCommand): void;
    private assertTenantIsolation;
    private assertActor;
    private assertDocumentIdentity;
    private assertAppendOnly;
    private assertWorkflow;
    private assertFactOnlyFields;
    private assertNoForbiddenLogic;
    private assertTraceability;
}
//# sourceMappingURL=PrecomptabiliteGuardian.d.ts.map