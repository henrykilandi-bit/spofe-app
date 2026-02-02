/**
 * SPOFE Auth Bootstrap
 * 
 * Infrastructure bootstrap - called at app startup
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

import { loadToken } from './token.store';

/**
 * Bootstrap authentication infrastructure
 * 
 * This function is intentionally minimal:
 * ✅ Verifies token presence (technical)
 * ❌ NO business validation
 * ❌ NO Guardian calls
 * 
 * The backend will validate the token when used.
 */
export function bootstrapAuth(): void {
  // Simply check if a token exists
  // No validation, no parsing, no decisions
  loadToken();
}

/**
 * ⚠️ IMPORTANT
 * 
 * This bootstrap:
 * - Does NOT validate the token
 * - Does NOT check expiration
 * - Does NOT call the backend
 * - Does NOT make any business decisions
 * 
 * The backend will reject invalid tokens when they are used.
 * This is intentional and correct.
 * 
 * SPOFE Rule: Frontend transports identity, backend validates.
 */
