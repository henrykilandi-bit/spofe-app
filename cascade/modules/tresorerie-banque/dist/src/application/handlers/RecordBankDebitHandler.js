"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordBankDebitHandler = void 0;
class RecordBankDebitHandler {
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
            type: "BankDebitRecorded",
            ...command,
            recordedAt: new Date().toISOString()
        });
    }
}
exports.RecordBankDebitHandler = RecordBankDebitHandler;
//# sourceMappingURL=RecordBankDebitHandler.js.map