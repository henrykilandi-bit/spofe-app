"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordBankCreditHandler = void 0;
class RecordBankCreditHandler {
    constructor(guardian, repository, eventStore) {
        this.guardian = guardian;
        this.repository = repository;
        this.eventStore = eventStore;
    }
    async execute(command) {
        this.guardian.assertBankAccountExists({
            exists: await this.repository.bankAccountExists(command.bankAccountId)
        });
        this.guardian.assertFactIsObserved({ observed: true });
        this.guardian.assertSingleBankAccount({ single: true });
        this.guardian.assertBankDateValid({ valid: true });
        await this.eventStore.append({
            type: "BankCreditRecorded",
            ...command,
            recordedAt: new Date().toISOString()
        });
    }
}
exports.RecordBankCreditHandler = RecordBankCreditHandler;
//# sourceMappingURL=RecordBankCreditHandler.js.map