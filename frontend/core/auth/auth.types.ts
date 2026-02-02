/**
 * SPOFE Auth Types
 * 
 * Minimal identity types - NO business logic, NO authority
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

export type IdentityToken = string;

export interface AuthState {
  token: IdentityToken | null;
  isAuthenticated: boolean;
}

/**
 * ⚠️ IMPORTANT
 * 
 * This file contains ONLY technical identity types.
 * 
 * ❌ NO roles
 * ❌ NO permissions
 * ❌ NO business data
 * ❌ NO authorization logic
 * 
 * ✅ Token is opaque
 * ✅ isAuthenticated is purely technical
 * 
 * Guardian decides authority, not auth.
 */
