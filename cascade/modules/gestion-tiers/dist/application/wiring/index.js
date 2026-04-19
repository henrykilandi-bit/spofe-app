"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveTierHandler = exports.suspendTierHandler = exports.updateTierHandler = exports.createTierHandler = void 0;
const TierGuardian_1 = require("../../domain/guardian/TierGuardian");
const handlers_1 = require("../handlers");
/**
 * In-memory implementations (application wiring only)
 * NOT infrastructure, acceptable for compilation & bootstrap
 */
class InMemoryTierRepository {
    async findById() {
        return null;
    }
}
class InMemoryTierEventStore {
    async append() {
        return;
    }
}
// Wiring
const guardian = new TierGuardian_1.TierGuardian();
const repository = new InMemoryTierRepository();
const eventStore = new InMemoryTierEventStore();
exports.createTierHandler = new handlers_1.CreateTierHandler(guardian, eventStore);
exports.updateTierHandler = new handlers_1.UpdateTierHandler(guardian, repository, eventStore);
exports.suspendTierHandler = new handlers_1.SuspendTierHandler(guardian, repository, eventStore);
exports.archiveTierHandler = new handlers_1.ArchiveTierHandler(guardian, repository, eventStore);
