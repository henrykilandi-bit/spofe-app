/**
 * SPOFE Auth Provider
 * 
 * React provider for identity management - NO business logic
 * 
 * Conformance: SPOFE Auth Contract v1.0.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './auth.context';
import { loadToken, saveToken, clearToken } from './token.store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadToken();
    if (existing) {
      setToken(existing);
    }
  }, []);

  function login(newToken: string) {
    saveToken(newToken);
    setToken(newToken);
  }

  function logout() {
    clearToken();
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * ⚠️ IMPORTANT
 * 
 * This provider:
 * ✅ Manages identity state
 * ✅ Provides login/logout functions
 * ✅ Restores token on mount
 * 
 * This provider does NOT:
 * ❌ Make authorization decisions
 * ❌ Check permissions
 * ❌ Validate business rules
 * ❌ Call Guardian
 * 
 * isAuthenticated is PURELY technical.
 * It means "we have a token", nothing more.
 * 
 * Guardian decides if that token grants any authority.
 */
