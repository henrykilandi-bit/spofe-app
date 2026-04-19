import { RecordBankDebitCommand } from "../commands/RecordBankDebitCommand";
import { BankRepositoryPort } from "../ports/BankRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";
export declare class RecordBankDebitHandler {
    private readonly guardian;
    private readonly repository;
    private readonly eventStore;
    constructor(guardian: BankGuardian, repository: BankRepositoryPort, eventStore: EventStorePort);
    execute(command: RecordBankDebitCommand): Promise<void>;
}
//# sourceMappingURL=RecordBankDebitHandler.d.ts.map