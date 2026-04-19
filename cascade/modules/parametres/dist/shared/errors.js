"use strict";
/**
 * ❌ Shared Errors - Erreurs du Module Paramètres
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryError = exports.InvalidFrameError = exports.FrameNotFoundError = exports.ParametersError = exports.GuardianViolation = void 0;
class GuardianViolation extends Error {
    constructor(message) {
        super(message);
        this.name = 'GuardianViolation';
    }
}
exports.GuardianViolation = GuardianViolation;
class ParametersError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'ParametersError';
    }
}
exports.ParametersError = ParametersError;
class FrameNotFoundError extends ParametersError {
    constructor(frameId) {
        super(`Frame non trouvé: ${frameId}`, 'FRAME_NOT_FOUND');
    }
}
exports.FrameNotFoundError = FrameNotFoundError;
class InvalidFrameError extends ParametersError {
    constructor(message) {
        super(`Frame invalide: ${message}`, 'INVALID_FRAME');
    }
}
exports.InvalidFrameError = InvalidFrameError;
class RepositoryError extends ParametersError {
    constructor(message) {
        super(`Erreur repository: ${message}`, 'REPOSITORY_ERROR');
    }
}
exports.RepositoryError = RepositoryError;
//# sourceMappingURL=errors.js.map