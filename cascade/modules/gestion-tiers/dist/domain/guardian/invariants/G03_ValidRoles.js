"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G03_ValidRoles = void 0;
const GuardianError_1 = require("../GuardianError");
const ALLOWED_ROLES = [
    'CLIENT',
    'FOURNISSEUR',
    'SALARIE',
    'ORGANISME_SOCIAL',
    'AUTRE'
];
class G03_ValidRoles {
    validate(ctx) {
        const roles = ctx.document.payload['roles'];
        if (!roles || roles.length === 0) {
            throw new GuardianError_1.GuardianError('G03_NO_ROLE', 'Tier must have at least one role');
        }
        for (const role of roles) {
            if (!ALLOWED_ROLES.includes(role)) {
                throw new GuardianError_1.GuardianError('G03_INVALID_ROLE', `Invalid tier role: ${role}`);
            }
        }
    }
}
exports.G03_ValidRoles = G03_ValidRoles;
