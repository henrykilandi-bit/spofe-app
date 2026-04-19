import { RecordBankBalanceSnapshotCommand } from "../commands/RecordBankBalanceSnapshotCommand";
import { EventStorePort } from "../ports/EventStorePort";
import { BankGuardian } from "../../domain/guardian/BankGuardian";
export declare class RecordBankBalanceSnapshotHandler {
    private readonly guardian;
    private readonly eventStore;
    constructor(guardian: BankGuardian, eventStore: EventStorePort);
    execute(command: RecordBankBalanceSnapshotCommand): Promise<void>;
}
//# sourceMappingURL=RecordBankBalanceSnapshotHandler.d.ts.map