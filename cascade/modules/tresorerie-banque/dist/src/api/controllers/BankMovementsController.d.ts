import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";
export declare class BankMovementsController {
    private readonly readRepo;
    constructor(readRepo: BankReadRepositoryPort);
    getMovements(params: {
        tenantId: string;
        bankId: string;
        bankAccountId: string;
        type?: "DEBIT" | "CREDIT";
        fromDate?: string;
        toDate?: string;
    }): Promise<import("../../read-models").BankMovementView[]>;
}
//# sourceMappingURL=BankMovementsController.d.ts.map