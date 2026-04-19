"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G01_UniqueTier = void 0;
const GuardianError_1 = require("../GuardianError");
class G01_UniqueTier {
    validate(ctx) {
        if (!ctx.currentTier)
            return;
        const incomingIds = ctx.document.payload['legalIdentifiers'];
        if (!incomingIds || !ctx.currentTier.legalIdentifiers)
            return;
        const duplicate = incomingIds.some(id => ctx.currentTier.legalIdentifiers.includes(id));
        if (duplicate) {
            throw new GuardianError_1.GuardianError('G01_DUPLICATE_LEGAL_ID', 'Duplicate legal identifier detected for active tier');
        }
    }
}
exports.G01_UniqueTier = G01_UniqueTier;
//# sourceMappingURL=G01_UniqueTier.js.map