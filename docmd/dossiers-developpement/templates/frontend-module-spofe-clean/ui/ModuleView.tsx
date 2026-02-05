/**
 * Module View — Pure UI Component
 *
 * ✅ Display only
 * ✅ User intent signals
 * ❌ NO business logic
 * ❌ NO decisions
 * ❌ NO calculations
 *
 * See: SPOFE Frontend Module Contract v1.0.0, Section 5.2
 */

import React from 'react';

export type ModuleViewProps = {
  /** Data from the read-model (just display it) */
  data: unknown;

  /** User action callback (emit intent only) */
  onAction?: () => void;

  /** Loading state for UX feedback */
  isLoading?: boolean;

  /** Error message for UX feedback */
  error?: string | null;
};

/**
 * Pure UI component for this module.
 *
 * This component:
 * ✅ Displays data as-is
 * ✅ Provides buttons/inputs for user intent
 * ✅ Shows loading/error states
 *
 * This component MUST NOT:
 * ❌ Implement business logic
 * ❌ Make decisions
 * ❌ Validate data against business rules
 * ❌ Transform/map data
 * ❌ Call APIs directly
 *
 * @example
 * ```typescript
 * <ModuleView
 *   data={data}
 *   isLoading={loading}
 *   error={error}
 *   onAction={handleAction}
 * />
 * ```
 */
export function ModuleView({
  data,
  onAction,
  isLoading = false,
  error = null
}: ModuleViewProps) {
  return (
    <div className="module-view">
      {/* Display data as-is (no transformation) */}
      {data && (
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      {/* Show loading state */}
      {isLoading && <div className="loading">Loading...</div>}

      {/* Show error state */}
      {error && <div className="error">{error}</div>}

      {/* User intent button */}
      <button
        onClick={onAction}
        disabled={isLoading}
      >
        Action
      </button>
    </div>
  );
}

/**
 * ⚠️ IMPORTANT: Pure Display Only
 *
 * This component is:
 * ✅ A pure display component
 * ✅ Props-driven
 * ✅ No internal state logic
 * ✅ No API calls
 * ✅ No business decisions
 *
 * All orchestration happens in module.ui.ts
 * All API calls happen in api/module.api.ts
 *
 * See: SPOFE Frontend Module Contract v1.0.0
 * - Section 5.2 (UI Responsibilities)
 * - Section 6 (Absolute Prohibitions)
 */
