/**
 * Module UI Orchestration
 *
 * This file coordinates:
 * - Loading data from the API
 * - Handling user actions
 * - Passing data to the view
 *
 * ❌ NO business logic
 * ❌ NO calculations
 * ❌ NO decisions
 *
 * See: SPOFE Frontend Module Contract v1.0.0
 */

import { fetchData, triggerAction } from '../api/module.api';

/**
 * Load module data.
 *
 * This function:
 * ✅ Calls the API (via FCE)
 * ✅ Returns data as-is (no transformation)
 *
 * This function MUST NOT:
 * ❌ Transform the data
 * ❌ Validate business rules
 * ❌ Make decisions
 *
 * @example
 * ```typescript
 * const data = await loadModuleData();
 * ```
 */
export async function loadModuleData() {
  try {
    return await fetchData();
  } catch (error) {
    console.error('Failed to load module data:', error);
    throw error;
  }
}

/**
 * Handle user action.
 *
 * This function:
 * ✅ Sends the intent to the backend (via FCE)
 * ✅ Returns the response

 *
 * This function MUST NOT:
 * ❌ Validate the action
 * ❌ Modify the payload
 * ❌ Make business decisions
 *
 * @example
 * ```typescript
 * await handleUserAction({ /* user input */ });
 * ```
 */
export async function handleUserAction(payload: unknown) {
  try {
    return await triggerAction(payload);
  } catch (error) {
    console.error('Failed to handle user action:', error);
    throw error;
  }
}

/**
 * ⚠️ IMPORTANT: Thin Orchestration Only
 *
 * This file is:
 * ✅ A thin orchestration layer
 * ✅ Just calling API functions
 * ✅ Passing through data
 * ✅ Handling basic error logging
 *
 * It is NOT:
 * ❌ Business logic layer
 * ❌ Data transformation layer
 * ❌ Validation layer
 *
 * All business logic stays in the backend (Guardian).
 *
 * See: SPOFE Frontend Module Contract v1.0.0
 * - Section 3 (Fundamental Principles)
 * - Section 5 (Authorized Responsibilities)
 * - Section 6 (Absolute Prohibitions)
 */
