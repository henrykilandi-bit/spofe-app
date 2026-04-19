"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankBalanceSnapshotProjection = void 0;
class BankBalanceSnapshotProjection {
    project(event) {
        if (event.type !== "BankBalanceSnapshotRecorded")
            return null;
        return {
            tenantId: event.tenantId,
            bankId: event.bankId,
            bankAccountId: event.bankAccountId,
            balance: event.balance,
            bankDate: event.bankDate,
            documentId: event.documentId,
            recordedAt: event.recordedAt
        };
    }
}
exports.BankBalanceSnapshotProjection = BankBalanceSnapshotProjection;
//# sourceMappingURL=BankBalanceSnapshotProjection.js.map