"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankJournalController = void 0;
class BankJournalController {
    constructor(readRepo) {
        this.readRepo = readRepo;
    }
    async getJournal(params) {
        return this.readRepo.getJournal(params);
    }
}
exports.BankJournalController = BankJournalController;
//# sourceMappingURL=BankJournalController.js.map