"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankBalancesController = void 0;
class BankBalancesController {
    constructor(readRepo) {
        this.readRepo = readRepo;
    }
    async getBalances(params) {
        return this.readRepo.getBalances(params);
    }
}
exports.BankBalancesController = BankBalancesController;
//# sourceMappingURL=BankBalancesController.js.map