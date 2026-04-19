import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";
export declare class BankAccountStateController {
    private readonly readRepo;
    constructor(readRepo: BankReadRepositoryPort);
    getState(params: {
        tenantId: string;
        bankId: string;
        bankAccountId: string;
    }): Promise<import("../../read-models").BankAccountStateView | null>;
}
//# sourceMappingURL=BankAccountStateController.d.ts.map