import { GuardianContext, StockMovementFact } from './types';
export declare class StockGuardian {
    validate(ctx: GuardianContext, fact: StockMovementFact): void;
    private assertTenantIsolation;
    private assertDocumentValidated;
    private assertActorPresent;
    private assertNonZeroQuantity;
    private assertNoNegativeStock;
    private assertProductPresent;
    private assertDepotPresent;
    private assertLotsIfRequired;
    private assertTransferConsistency;
    private assertNoFinancialFields;
}
//# sourceMappingURL=StockGuardian.d.ts.map