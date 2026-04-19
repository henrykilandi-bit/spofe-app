"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTierHandler = void 0;
const crypto_1 = require("crypto");
class UpdateTierHandler {
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
            commandType: 'UpdateTier',
            currentTier: currentTier ?? undefined,
            document: {
                id: (0, crypto_1.randomUUID)(),
                type: 'TierUpdateRecord',
                state: 'validated',
                payload: command.payload
            }
        };
        this.guardian.validate(context);
        await this.eventStore.append({
            type: 'TierUpdated',
            tierId: command.tierId,
            tenantId: command.tenantId,
            actorId: command.actorId,
            timestamp: new Date().toISOString(),
            payload: command.payload
        });
    }
}
exports.UpdateTierHandler = UpdateTierHandler;
//# sourceMappingURL=UpdateTierHandler.js.map