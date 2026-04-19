/**
 * ❌ Shared Errors - Erreurs du Module Paramètres
 */
export declare class GuardianViolation extends Error {
    constructor(message: string);
}
export declare class ParametersError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
export declare class FrameNotFoundError extends ParametersError {
    constructor(frameId: string);
}
export declare class InvalidFrameError extends ParametersError {
    constructor(message: string);
}
export declare class RepositoryError extends ParametersError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map