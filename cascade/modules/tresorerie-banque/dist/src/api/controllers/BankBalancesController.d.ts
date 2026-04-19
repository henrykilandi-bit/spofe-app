import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";
export declare class BankBalancesController {
    private readonly readRepo;
    constructor(readRepo: BankReadRepositoryPort);
    getBalances(params: {
        tenantId: string;
        bankId: string;
        bankAccountId: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<import("../../read-models").BankBalanceSnapshotView[]>;
}
//# sourceMappingURL=BankBalancesController.d.ts.map