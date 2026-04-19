"use strict";
// src/guardian/GuardianError.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardianError = void 0;
class GuardianError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GuardianError';
    }
}
exports.GuardianError = GuardianError;
//# sourceMappingURL=GuardianError.js.map