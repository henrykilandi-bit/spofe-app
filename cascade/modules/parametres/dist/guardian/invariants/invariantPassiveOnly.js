"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariantPassiveOnly = invariantPassiveOnly;
const errors_js_1 = require("../../shared/errors.js");
function invariantPassiveOnly(frame) {
    const json = JSON.stringify(frame);
    const forbiddenPatterns = [
        'if',
        'when',
        'then',
        'calculate',
        'auto',
        'trigger',
        'workflow',
    ];
    for (const p of forbiddenPatterns) {
        if (json.includes(p)) {
            throw new errors_js_1.GuardianViolation(`G-P03 violation: passive-only rule broken (${p})`);
        }
    }
}
//# sourceMappingURL=invariantPassiveOnly.js.map