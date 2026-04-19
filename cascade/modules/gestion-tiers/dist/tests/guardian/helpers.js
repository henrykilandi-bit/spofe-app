"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validDocument = validDocument;
exports.validTier = validTier;
exports.baseContext = baseContext;
function validDocument(overrides = {}) {
    return {
        id: 'doc-1',
        type: 'TierRecord',
        state: 'validated',
        payload: {
            name: 'ACME',
            roles: ['CLIENT'],
            legalIdentifiers: ['ICE123']
        },
        ...overrides
    };
}
function validTier(overrides = {}) {
    return {
        tierId: 'tier-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
        roles: ['CLIENT'],
        legalIdentifiers: ['ICE123'],
        ...overrides
    };
}
function baseContext(overrides = {}) {
    return {
        tenantId: 'tenant-1',
        actorId: 'actor-1',
        commandType: 'CreateTier',
        document: validDocument(),
        ...overrides
    };
}
//# sourceMappingURL=helpers.js.map