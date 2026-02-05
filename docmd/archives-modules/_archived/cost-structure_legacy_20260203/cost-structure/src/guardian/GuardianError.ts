// src/guardian/GuardianError.ts

export class GuardianError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianError';
  }
}
