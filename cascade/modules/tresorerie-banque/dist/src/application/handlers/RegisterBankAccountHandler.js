"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterBankAccountHandler = void 0;
class RegisterBankAccountHandler {
    constructor(guardian, repository, eventStore) {
        this.guardian = guardian;
        this.repository = repository;
        this.eventStore = eventStore;
    }
    async execute(command) {
        this.guardian.assertBankExists({
            exists: await this.repository.bankExists(command.bankId)
        });
        this.guardian.assertTenantIsolation({ valid: true });
        await this.eventStore.append({
            type: "BankAccountRegistered",
            ...command,
            registeredAt: new Date().toISOString()
        });
    }
}
exports.RegisterBankAccountHandler = RegisterBankAccountHandler;
//# sourceMappingURL=RegisterBankAccountHandler.js.map