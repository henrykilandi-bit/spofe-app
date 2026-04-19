"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankMovementsController = void 0;
class BankMovementsController {
    constructor(readRepo) {
        this.readRepo = readRepo;
    }
    async getMovements(params) {
        return this.readRepo.getMovements(params);
    }
}
exports.BankMovementsController = BankMovementsController;
//# sourceMappingURL=BankMovementsController.js.map