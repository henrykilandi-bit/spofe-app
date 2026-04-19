"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardianError = void 0;
class GuardianError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, GuardianError.prototype);
    }
}
exports.GuardianError = GuardianError;
