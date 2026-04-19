/**
 * GuardianError - Exception standard pour violations Guardian
 * Conformité: SPOFE Architecture
 */
export class GuardianError extends Error {
    code;
    metadata;
    constructor(code, message, metadata) {
        super(message || `Guardian violation: ${code}`);
        this.code = code;
        this.metadata = metadata;
        this.name = 'GuardianError';
        // Maintain proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GuardianError);
        }
    }
}
//# sourceMappingURL=GuardianError.js.map