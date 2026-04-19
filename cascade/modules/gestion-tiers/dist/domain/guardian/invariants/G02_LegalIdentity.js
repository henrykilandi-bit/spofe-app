"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G02_LegalIdentity = void 0;
const GuardianError_1 = require("../GuardianError");
class G02_LegalIdentity {
    validate(ctx) {
        const name = ctx.document.payload['name'];
        const legalIds = ctx.document.payload['legalIdentifiers'];
        if (!name && (!Array.isArray(legalIds) || legalIds.length === 0)) {
            throw new GuardianError_1.GuardianError('G02_MISSING_LEGAL_IDENTITY', 'Tier must have a name or at least one legal identifier');
        }
    }
}
exports.G02_LegalIdentity = G02_LegalIdentity;
