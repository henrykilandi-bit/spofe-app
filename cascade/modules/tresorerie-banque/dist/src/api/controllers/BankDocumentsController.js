"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankDocumentsController = void 0;
class BankDocumentsController {
    constructor(readRepo) {
        this.readRepo = readRepo;
    }
    async getDocuments(params) {
        return this.readRepo.getDocuments(params);
    }
}
exports.BankDocumentsController = BankDocumentsController;
//# sourceMappingURL=BankDocumentsController.js.map