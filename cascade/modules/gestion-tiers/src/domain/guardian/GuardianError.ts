export class GuardianError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, GuardianError.prototype);
  }
}