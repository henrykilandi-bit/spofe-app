import { RegisterBankDocumentCommand } from "../commands/RegisterBankDocumentCommand";
import { BankRepositoryPort } from "../ports/BankRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";
export declare class RegisterBankDocumentHandler {
    private readonly guardian;
    private readonly repository;
    private readonly eventStore;
    constructor(guardian: BankGuardian, repository: BankRepositoryPort, eventStore: EventStorePort);
    execute(command: RegisterBankDocumentCommand): Promise<void>;
}
//# sourceMappingURL=RegisterBankDocumentHandler.d.ts.map