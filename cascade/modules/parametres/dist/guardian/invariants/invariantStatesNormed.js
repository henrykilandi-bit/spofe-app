"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariantStatesNormed = invariantStatesNormed;
const errors_js_1 = require("../../shared/errors.js");
function invariantStatesNormed(catalog) {
    const genericCodes = catalog.genericStates.map((s) => s.code);
    for (const ds of catalog.documentStates) {
        if (!genericCodes.includes(ds.mappedGenericState)) {
            throw new errors_js_1.GuardianViolation(`G-P04 violation: document state ${ds.code} not mapped to generic state`);
        }
    }
    for (const ps of catalog.periodStates) {
        if (!['OPEN', 'CLOSED', 'LOCKED'].includes(ps.code)) {
            throw new errors_js_1.GuardianViolation(`G-P05 violation: invalid period state ${ps.code}`);
        }
    }
}
//# sourceMappingURL=invariantStatesNormed.js.map