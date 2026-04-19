"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankAccountStateController = void 0;
class BankAccountStateController {
    constructor(readRepo) {
        this.readRepo = readRepo;
    }
    async getState(params) {
        return this.readRepo.getAccountState(params);
    }
}
exports.BankAccountStateController = BankAccountStateController;
//# sourceMappingURL=BankAccountStateController.js.map