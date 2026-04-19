"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierTestBuilder = void 0;
const wiring_1 = require("../../../src/application/wiring");
class TierTestBuilder {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async givenActiveTier(options) {
        await wiring_1.createTierHandler.execute({
            tenantId: this.ctx.tenantId,
            actorId: this.ctx.actorId,
            payload: {
                name: options.name,
                roles: options.roles,
                legalIdentifiers: options.legalIdentifiers || [`SIRET:${Math.random().toString().substring(2, 16)}`],
                email: `${options.name.toLowerCase().replace(/\s+/g, '')}@example.com`
            }
        });
    }
    async givenActiveClient(name = 'ACME Client SA') {
        return this.givenActiveTier({
            name,
            roles: ['CLIENT'],
            legalIdentifiers: [`SIRET:${Math.random().toString().substring(2, 16)}`]
        });
    }
    async givenActiveProvider(name = 'Provider Corp') {
        return this.givenActiveTier({
            name,
            roles: ['FOURNISSEUR'],
            legalIdentifiers: [`SIRET:${Math.random().toString().substring(2, 16)}`]
        });
    }
    async givenEmployee(name = 'John Doe') {
        return this.givenActiveTier({
            name,
            roles: ['SALARIE'],
            legalIdentifiers: [`SS:${Math.random().toString().substring(2, 16)}`]
        });
    }
}
exports.TierTestBuilder = TierTestBuilder;
//# sourceMappingURL=TierTestBuilder.js.map