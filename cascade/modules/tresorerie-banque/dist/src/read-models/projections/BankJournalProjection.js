"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankJournalProjection = void 0;
class BankJournalProjection {
    project(event) {
        return {
            tenantId: event.tenantId,
            bankId: event.bankId,
            bankAccountId: event.bankAccountId,
            eventType: event.type,
            amount: event.amount,
            balance: event.balance,
            bankDate: event.bankDate || event.documentDate,
            documentId: event.documentId,
            recordedAt: event.recordedAt || event.registeredAt
        };
    }
}
exports.BankJournalProjection = BankJournalProjection;
//# sourceMappingURL=BankJournalProjection.js.map