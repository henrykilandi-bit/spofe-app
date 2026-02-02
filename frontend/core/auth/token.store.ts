/**
 * SPOFE Token Store
 * 
 * Technical storage for identity token - NO business logic
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

import { IdentityToken } from './auth.types';

const TOKEN_KEY = 'spofe.identity.token';

/**
 * Save identity token to storage
 * 
 * ✅ Technical storage only
 * ❌ NO validation
 * ❌ NO business logic
 */
export function saveToken(token: IdentityToken): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/**
 * Load identity token from storage
 * 
 * ✅ Returns token as-is
 * ❌ NO parsing
 * ❌ NO interpretation
 */
export function loadToken(): IdentityToken | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Clear identity token from storage
 * 
 * ✅ Technical cleanup only
 * ❌ NO business side effects
 */
export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

/**
 * ⚠️ IMPORTANT
 * 
 * This store is REPLACEABLE.
 * You can swap sessionStorage for:
 * - localStorage
 * - IndexedDB
 * - Memory
 * - Cookies
 * 
 * The contract remains the same.
 * 
 * ❌ NEVER store business data here
 * ❌ NEVER parse the token
 * ❌ NEVER make decisions based on token content
 */
