"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G06_TierStatus = void 0;
const GuardianError_1 = require("../GuardianError");
class G06_TierStatus {
    validate(ctx) {
        if (ctx.currentTier?.status === 'ARCHIVED') {
            throw new GuardianError_1.GuardianError('G06_TIER_ARCHIVED_IMMUTABLE', 'Archived tier cannot be modified');
        }
    }
}
exports.G06_TierStatus = G06_TierStatus;
//# sourceMappingURL=G06_TierStatus.js.map