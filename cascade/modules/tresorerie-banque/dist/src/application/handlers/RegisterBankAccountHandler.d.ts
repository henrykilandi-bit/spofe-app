import { RegisterBankAccountCommand } from "../commands/RegisterBankAccountCommand";
import { BankRepositoryPort } from "../ports/BankRepositoryPort";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";
export declare class RegisterBankAccountHandler {
    private readonly guardian;
    private readonly repository;
    private readonly eventStore;
    constructor(guardian: BankGuardian, repository: BankRepositoryPort, eventStore: EventStorePort);
    execute(command: RegisterBankAccountCommand): Promise<void>;
}
//# sourceMappingURL=RegisterBankAccountHandler.d.ts.map