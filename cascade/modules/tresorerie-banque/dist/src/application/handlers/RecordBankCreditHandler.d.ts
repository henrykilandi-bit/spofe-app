import { RecordBankCreditCommand } from "../commands/RecordBankCreditCommand";
import { BankRepositoryPort } from "../ports/BankRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";
export declare class RecordBankCreditHandler {
    private readonly guardian;
    private readonly repository;
    private readonly eventStore;
    constructor(guardian: BankGuardian, repository: BankRepositoryPort, eventStore: EventStorePort);
    execute(command: RecordBankCreditCommand): Promise<void>;
}
//# sourceMappingURL=RecordBankCreditHandler.d.ts.map