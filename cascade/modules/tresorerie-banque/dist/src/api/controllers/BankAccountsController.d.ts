import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";
export declare class BankAccountsController {
    private readonly readRepo;
    constructor(readRepo: BankReadRepositoryPort);
    getAccounts(query: {
        tenantId: string;
        bankId?: string;
        status?: "ACTIVE" | "INACTIVE";
    }): Promise<import("../../read-models").BankAccountStateView[]>;
}
//# sourceMappingURL=BankAccountsController.d.ts.map