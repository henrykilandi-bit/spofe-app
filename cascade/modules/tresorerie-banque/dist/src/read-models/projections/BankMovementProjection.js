"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankMovementProjection = void 0;
class BankMovementProjection {
    project(event) {
        if (event.type === "BankDebitRecorded") {
            return {
                tenantId: event.tenantId,
                bankId: event.bankId,
                bankAccountId: event.bankAccountId,
                type: "DEBIT",
                amount: event.amount,
                bankDate: event.bankDate,
                documentId: event.documentId,
                recordedAt: event.recordedAt
            };
        }
        if (event.type === "BankCreditRecorded") {
            return {
                tenantId: event.tenantId,
                bankId: event.bankId,
                bankAccountId: event.bankAccountId,
                type: "CREDIT",
                amount: event.amount,
                bankDate: event.bankDate,
                documentId: event.documentId,
                recordedAt: event.recordedAt
            };
        }
        return null;
    }
}
exports.BankMovementProjection = BankMovementProjection;
//# sourceMappingURL=BankMovementProjection.js.map