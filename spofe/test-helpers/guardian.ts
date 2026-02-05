import type { GuardianDecisionResult } from '../types/guardian.js';

/**
 * Exécute une décision Guardian et retourne le résultat typé
 */
export async function executeGuardian<TCommand, TResult>(
  handler: (cmd: TCommand) => Promise<TResult>,
  command: TCommand
): Promise<TResult> {
  return handler(command);
}

/**
 * Vérifie qu'un Guardian rejette correctement
 */
export async function expectGuardianRejection(
  fn: () => Promise<unknown>,
  errorCode?: string
): Promise<void> {
  await expect(fn()).rejects.toMatchObject(
    errorCode ? { code: errorCode } : {}
  );
}