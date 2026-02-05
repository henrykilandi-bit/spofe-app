/**
 * Module API — Frontend Contract Enforcer Integration
 *
 * This file contains all API calls to the backend.
 *
 * ✅ MUST use Frontend Contract Enforcer (FCE)
 * ❌ NO direct fetch() calls
 * ❌ NO axios library
 * ❌ NO business logic
 * ❌ NO data mapping/transformation
 *
 * See: SPOFE Frontend Module Contract v1.0.0, Section 5.1
 */

import {
  readModel,
  sendCommand,
  type ReadModelResponse,
  type CommandResponse
} from '@/core/spofe-contract';

/**
 * Fetch data from a read-model.
 *
 * ✅ Uses Frontend Contract Enforcer
 * ✅ Declared in module.manifest.md
 *
 * @example
 * ```typescript
 * const data = await fetchData();
 * ```
 */
export async function fetchData(): Promise<ReadModelResponse> {
  // Replace '/read/<example>' with actual read-model from module.manifest.md
  return readModel('/read/<example>');
}

/**
 * Send a command to the backend.
 *
 * ✅ Uses Frontend Contract Enforcer
 * ✅ Command must be declared in module.manifest.md
 *
 * @example
 * ```typescript
 * await triggerAction({ /* payload */ });
 * ```
 */
export async function triggerAction(payload: unknown): Promise<CommandResponse> {
  // Replace '<ExampleCommand>' with actual command from module.manifest.md
  return sendCommand('<ExampleCommand>', payload);
}

/**
 * ⚠️ IMPORTANT RULES
 *
 * This file MUST:
 * ✅ Use ONLY readModel() and sendCommand() from FCE
 * ✅ Have NO direct fetch calls, axios, XMLHttpRequest
 * ✅ Have NO calculations
 * ✅ Have NO business logic
 * ✅ Have NO data mapping
 *
 * This file MUST NOT:
 * ❌ Call fetch method directly
 * ❌ Use axios
 * ❌ Implement any business logic
 * ❌ Transform/map/validate data
 * ❌ Make decisions based on data
 *
 * See: SPOFE Frontend Module Contract v1.0.0
 * - Section 5.1 (API Responsibilities)
 * - Section 6 (Absolute Prohibitions)
 */
