// src/guardian/errors.ts

export class GuardianViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianViolationError';
  }
}
