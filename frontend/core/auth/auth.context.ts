/**
 * SPOFE Auth Context
 * 
 * React context for identity state - NO authority logic
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

import { createContext } from 'react';
import { AuthState } from './auth.types';

export interface AuthContextValue extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * ⚠️ IMPORTANT
 * 
 * This context provides:
 * ✅ Technical identity state
 * ✅ Login/logout functions
 * 
 * This context does NOT provide:
 * ❌ Authorization decisions
 * ❌ Role information
 * ❌ Permission checks
 * ❌ Business logic
 * 
 * Guardian decides authority.
 * Auth only identifies.
 */
