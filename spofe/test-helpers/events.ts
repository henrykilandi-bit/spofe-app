/**
 * SPOFE Test Helper
 * Cast explicitement un payload `unknown` en événement typé.
 *
 * ⚠️ À utiliser UNIQUEMENT dans les tests.
 */
export function asEvent<T>(payload: unknown): T {
  return payload as T;
}

/**
 * Assertion sûre sur un événement attendu
 */
export function expectEvent<T>(
  payload: unknown,
  predicate: (event: T) => void
): void {
  const event = payload as T;
  predicate(event);
}