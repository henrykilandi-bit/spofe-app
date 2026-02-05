/**
 * Module Hooks — UI State Management
 *
 * ✅ UI state only (loading, error, pagination, etc.)
 * ✅ Local/visual state
 * ❌ NO business state
 * ❌ NO business logic
 * ❌ NO calculations
 *
 * See: SPOFE Frontend Module Contract v1.0.0, Section 5.3
 */

import { useState, useCallback } from 'react';

export type ModuleUIState = {
  /** Is data currently loading? */
  loading: boolean;

  /** Current error (if any) */
  error: string | null;

  /** Set loading state */
  setLoading: (loading: boolean) => void;

  /** Set error message */
  setError: (error: string | null) => void;

  /** Reset state */
  reset: () => void;
};

/**
 * Hook for module UI state.
 *
 * Manages:
 * ✅ Loading state
 * ✅ Error state
 * ✅ State reset
 *
 * Does NOT manage:
 * ❌ Business state
 * ❌ Backend data
 * ❌ Cached data
 *
 * @example
 * ```typescript
 * const { loading, error, setLoading, setError } = useModuleUI();
 * ```
 */
export function useModuleUI(): ModuleUIState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    setLoading,
    setError,
    reset
  };
}

/**
 * ⚠️ IMPORTANT: UI State Only
 *
 * This hook manages:
 * ✅ Visual/UX state (loading, error messages)
 * ✅ Form input state
 * ✅ Pagination/sorting (UI level)
 * ✅ Visibility state
 *
 * This hook MUST NOT manage:
 * ❌ Business state
 * ❌ Backend data
 * ❌ Cached data
 * ❌ Business logic results
 *
 * All business state lives in the backend (Guardian).
 * The frontend only displays what the backend tells it.
 *
 * See: SPOFE Frontend Module Contract v1.0.0
 * - Section 5.3 (Hooks Responsibilities)
 * - Section 3.P2 (Backend is single source of truth)
 */
