"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterBankDocumentHandler = void 0;
class RegisterBankDocumentHandler {
    constructor(guardian, repository, eventStore) {
        this.guardian = guardian;
        this.repository = repository;
        this.eventStore = eventStore;
    }
    async execute(command) {
        this.guardian.assertBankAccountExists({
            exists: await this.repository.bankAccountExists(command.bankAccountId)
        });
        this.guardian.assertBankDocumentValid({ valid: true });
        this.guardian.assertDocumentImmutable({ immutable: true });
        await this.eventStore.append({
            type: "BankDocumentRegistered",
            ...command,
            registeredAt: new Date().toISOString()
        });
    }
}
exports.RegisterBankDocumentHandler = RegisterBankDocumentHandler;
//# sourceMappingURL=RegisterBankDocumentHandler.js.map