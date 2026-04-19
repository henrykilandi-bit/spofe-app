"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G04_DocumentDriven = void 0;
const GuardianError_1 = require("../GuardianError");
class G04_DocumentDriven {
    validate(ctx) {
        if (!ctx.document) {
            throw new GuardianError_1.GuardianError('G04_NO_DOCUMENT', 'Mutation without document is forbidden');
        }
    }
}
exports.G04_DocumentDriven = G04_DocumentDriven;
