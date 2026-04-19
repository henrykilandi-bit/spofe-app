/**
 * GuardianError - Exception standard pour violations Guardian
 * Conformité: SPOFE Architecture
 */

export class GuardianError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
    public readonly metadata?: any
  ) {
    super(message || `Guardian violation: ${code}`);
    this.name = 'GuardianError';
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GuardianError);
    }
  }
}
