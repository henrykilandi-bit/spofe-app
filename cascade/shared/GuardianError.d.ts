/**
 * GuardianError - Exception standard pour violations Guardian
 * Conformité: SPOFE Architecture
 */
export declare class GuardianError extends Error {
    readonly code: string;
    readonly metadata?: any | undefined;
    constructor(code: string, message?: string, metadata?: any | undefined);
}
//# sourceMappingURL=GuardianError.d.ts.map