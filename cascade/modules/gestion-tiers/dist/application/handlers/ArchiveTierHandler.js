"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveTierHandler = void 0;
const crypto_1 = require("crypto");
class ArchiveTierHandler {
    constructor(guardian, repository, eventStore) {
        this.guardian = guardian;
        this.repository = repository;
        this.eventStore = eventStore;
    }
    async execute(command) {
        const currentTier = await this.repository.findById(command.tierId);
        const context = {
            tenantId: command.tenantId,
            actorId: command.actorId,
            commandType: 'ArchiveTier',
            currentTier: currentTier ?? undefined,
            document: {
                id: (0, crypto_1.randomUUID)(),
                type: 'TierArchiveRecord',
                state: 'validated',
                payload: { reason: command.reason }
            }
        };
        this.guardian.validate(context);
        await this.eventStore.append({
            type: 'TierArchived',
            tierId: command.tierId,
            tenantId: command.tenantId,
            actorId: command.actorId,
            timestamp: new Date().toISOString(),
            reason: command.reason
        });
    }
}
exports.ArchiveTierHandler = ArchiveTierHandler;
