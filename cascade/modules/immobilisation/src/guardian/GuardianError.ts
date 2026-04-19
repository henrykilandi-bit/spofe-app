// src/guardian/GuardianError.ts
// IMMOBILISATION — GuardianError (canon SPOFE)

export class GuardianError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianError';
  }
}
