import { BankReadRepositoryPort } from "../../application/ports/BankReadRepositoryPort";
export declare class BankDocumentsController {
    private readonly readRepo;
    constructor(readRepo: BankReadRepositoryPort);
    getDocuments(params: {
        tenantId: string;
        bankId: string;
        bankAccountId: string;
    }): Promise<import("../../read-models").BankDocumentView[]>;
}
//# sourceMappingURL=BankDocumentsController.d.ts.map