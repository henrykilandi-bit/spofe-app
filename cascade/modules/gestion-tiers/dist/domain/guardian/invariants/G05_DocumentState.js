"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G05_DocumentState = void 0;
const GuardianError_1 = require("../GuardianError");
class G05_DocumentState {
    validate(ctx) {
        if (ctx.document.state !== 'validated') {
            throw new GuardianError_1.GuardianError('G05_DOCUMENT_NOT_VALIDATED', 'Document must be validated');
        }
    }
}
exports.G05_DocumentState = G05_DocumentState;
