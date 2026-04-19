"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordBankBalanceSnapshotHandler = void 0;
class RecordBankBalanceSnapshotHandler {
    constructor(guardian, eventStore) {
        this.guardian = guardian;
        this.eventStore = eventStore;
    }
    async execute(command) {
        this.guardian.assertBalanceIsFactual({ factual: true });
        this.guardian.assertBankDateValid({ valid: true });
        await this.eventStore.append({
            type: "BankBalanceSnapshotRecorded",
            ...command,
            recordedAt: new Date().toISOString()
        });
    }
}
exports.RecordBankBalanceSnapshotHandler = RecordBankBalanceSnapshotHandler;
//# sourceMappingURL=RecordBankBalanceSnapshotHandler.js.map