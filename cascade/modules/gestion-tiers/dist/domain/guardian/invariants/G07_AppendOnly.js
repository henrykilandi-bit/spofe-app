"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G07_AppendOnly = void 0;
const GuardianError_1 = require("../GuardianError");
class G07_AppendOnly {
    validate(ctx) {
        if (ctx.commandType === 'DELETE') {
            throw new GuardianError_1.GuardianError('G07_DELETE_FORBIDDEN', 'Delete operation is forbidden (append-only)');
        }
    }
}
exports.G07_AppendOnly = G07_AppendOnly;
