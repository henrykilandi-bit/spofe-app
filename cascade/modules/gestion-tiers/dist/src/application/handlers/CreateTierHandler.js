"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTierHandler = void 0;
const crypto_1 = require("crypto");
class CreateTierHandler {
    constructor(guardian, eventStore) {
        this.guardian = guardian;
        this.eventStore = eventStore;
    }
    async execute(command) {
        const tierId = (0, crypto_1.randomUUID)();
        const context = {
            tenantId: command.tenantId,
            actorId: command.actorId,
            commandType: 'CreateTier',
            document: {
                id: (0, crypto_1.randomUUID)(),
                type: 'TierRecord',
                state: 'validated',
                payload: command.payload
            }
        };
        this.guardian.validate(context);
        await this.eventStore.append({
            type: 'TierCreated',
            tierId,
            tenantId: command.tenantId,
            actorId: command.actorId,
            timestamp: new Date().toISOString(),
            payload: command.payload
        });
    }
}
exports.CreateTierHandler = CreateTierHandler;
//# sourceMappingURL=CreateTierHandler.js.map