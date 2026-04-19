"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariantSingleActiveFrame = invariantSingleActiveFrame;
const errors_js_1 = require("../../shared/errors.js");
function invariantSingleActiveFrame(existingFrames, candidate) {
    if (candidate.status !== 'ACTIVE')
        return;
    const activeExists = existingFrames.some((f) => f.status === 'ACTIVE');
    if (activeExists) {
        throw new errors_js_1.GuardianViolation('G-P01 violation: only one ACTIVE ParametersFrame is allowed');
    }
}
//# sourceMappingURL=invariantActiveFrame.js.map