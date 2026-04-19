"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAccountsController = void 0;
class BankAccountsController {
    constructor(readRepo) {
        this.readRepo = readRepo;
    }
    async getAccounts(query) {
        return this.readRepo.getAccounts(query);
    }
}
exports.BankAccountsController = BankAccountsController;
//# sourceMappingURL=BankAccountsController.js.map