"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariantAppendOnly = invariantAppendOnly;
const errors_js_1 = require("../../shared/errors.js");
function invariantAppendOnly(isMutation) {
    if (isMutation) {
        throw new errors_js_1.GuardianViolation('G-P02 violation: ParametersFrame is append-only');
    }
}
//# sourceMappingURL=invariantAppendOnly.js.map