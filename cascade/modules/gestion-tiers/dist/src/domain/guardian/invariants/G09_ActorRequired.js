"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G09_ActorRequired = void 0;
const GuardianError_1 = require("../GuardianError");
class G09_ActorRequired {
    validate(ctx) {
        if (!ctx.actorId) {
            throw new GuardianError_1.GuardianError('G09_ACTOR_REQUIRED', 'ActorId is required for any mutation');
        }
    }
}
exports.G09_ActorRequired = G09_ActorRequired;
//# sourceMappingURL=G09_ActorRequired.js.map