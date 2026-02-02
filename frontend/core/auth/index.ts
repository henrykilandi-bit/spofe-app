/**
 * SPOFE Auth - Public API
 * 
 * Single entry point for auth infrastructure
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

export { AuthProvider } from './auth.provider';
export { AuthContext } from './auth.context';
export { bootstrapAuth } from './auth.bootstrap';
export { loadToken } from './token.store';

export type { AuthState, IdentityToken } from './auth.types';
export type { AuthContextValue } from './auth.context';

/**
 * ⚠️ USAGE RULES
 * 
 * ✅ AuthProvider: Wrap your app root
 * ✅ bootstrapAuth: Call at app startup
 * ✅ loadToken: Used ONLY by FCE for header injection
 * 
 * ❌ DO NOT use loadToken in modules
 * ❌ DO NOT parse the token
 * ❌ DO NOT make authorization decisions
 * 
 * Auth identifies. Guardian decides.
 */
