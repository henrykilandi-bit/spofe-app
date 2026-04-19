"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariantRolesCapabilities = invariantRolesCapabilities;
const errors_js_1 = require("../../shared/errors.js");
const ALLOWED = ['READ', 'WRITE', 'CLOSE', 'EXPORT'];
function invariantRolesCapabilities(catalog) {
    for (const role of catalog.roles) {
        for (const cap of role.capabilities) {
            if (!ALLOWED.includes(cap)) {
                throw new errors_js_1.GuardianViolation(`G-P07 violation: unknown capability ${cap}`);
            }
        }
    }
}
//# sourceMappingURL=invariantRolesCapabilities.js.map