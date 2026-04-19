/**
 * ❌ Shared Errors - Erreurs du Module Paramètres
 */

export class GuardianViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianViolation';
  }
}

export class ParametersError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ParametersError';
  }
}

export class FrameNotFoundError extends ParametersError {
  constructor(frameId: string) {
    super(`Frame non trouvé: ${frameId}`, 'FRAME_NOT_FOUND');
  }
}

export class InvalidFrameError extends ParametersError {
  constructor(message: string) {
    super(`Frame invalide: ${message}`, 'INVALID_FRAME');
  }
}

export class RepositoryError extends ParametersError {
  constructor(message: string) {
    super(`Erreur repository: ${message}`, 'REPOSITORY_ERROR');
  }
}
