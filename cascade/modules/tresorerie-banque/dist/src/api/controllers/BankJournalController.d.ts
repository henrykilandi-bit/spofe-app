import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";
export declare class BankJournalController {
    private readonly readRepo;
    constructor(readRepo: BankReadRepositoryPort);
    getJournal(params: {
        tenantId: string;
        bankId: string;
        bankAccountId: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<import("../../read-models").BankJournalView[]>;
}
//# sourceMappingURL=BankJournalController.d.ts.map