"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAccountStateProjection = void 0;
class BankAccountStateProjection {
    project(current, event) {
        if (event.type === "BankAccountRegistered") {
            return {
                tenantId: event.tenantId,
                bankId: event.bankId,
                bankAccountId: event.bankAccountId,
                currency: event.currency,
                status: "ACTIVE"
            };
        }
        if (event.type === "BankBalanceSnapshotRecorded" && current) {
            return {
                ...current,
                lastBankDate: event.bankDate,
                lastBalance: event.balance
            };
        }
        return current;
    }
}
exports.BankAccountStateProjection = BankAccountStateProjection;
//# sourceMappingURL=BankAccountStateProjection.js.map